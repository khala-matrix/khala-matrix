package upstream

import (
	"context"
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"sync"
	"time"

	"github.com/google/uuid"
	"nhooyr.io/websocket"
	"nhooyr.io/websocket/wsjson"

	"github.com/khala-matrix/backend/internal/model"
	"github.com/khala-matrix/backend/internal/store"
	"github.com/khala-matrix/backend/internal/upstream/identity"
	"github.com/khala-matrix/backend/internal/ws"
)

const (
	clientID      = "openclaw-control-ui"
	clientVersion = "khala-matrix-0.1.0"
	clientMode    = "webchat"
	role          = "operator"
)

var scopes = []string{"operator.admin", "operator.approvals", "operator.pairing"}

type pendingRequest struct {
	ch chan Frame
}

type OpenClawClient struct {
	gatewayURL string
	token      string
	store      *store.Store
	hub        *ws.Hub
	identity   *identity.DeviceIdentity

	mu            sync.RWMutex
	pairingStatus PairingStatus
	pairingError  string
	connected     bool
	lastError     string

	pendingMu sync.Mutex
	pending   map[string]*pendingRequest
	conn      *websocket.Conn
	connMu    sync.Mutex
}

func NewOpenClawClient(gatewayURL, token string, id *identity.DeviceIdentity, s *store.Store, hub *ws.Hub) *OpenClawClient {
	return &OpenClawClient{
		gatewayURL:    gatewayURL,
		token:         token,
		store:         s,
		hub:           hub,
		identity:      id,
		pairingStatus: PairingNone,
		pending:       make(map[string]*pendingRequest),
	}
}

type ClientStatus struct {
	Connected     bool          `json:"connected"`
	PairingStatus PairingStatus `json:"pairingStatus"`
	PairingError  string        `json:"pairingError,omitempty"`
	LastError     string        `json:"lastError,omitempty"`
	DeviceID      string        `json:"deviceId"`
	GatewayURL    string        `json:"gatewayUrl"`
}

func (c *OpenClawClient) Status() ClientStatus {
	c.mu.RLock()
	defer c.mu.RUnlock()
	return ClientStatus{
		Connected:     c.connected,
		PairingStatus: c.pairingStatus,
		PairingError:  c.pairingError,
		LastError:     c.lastError,
		DeviceID:      c.identity.DeviceID,
		GatewayURL:    c.gatewayURL,
	}
}

func (c *OpenClawClient) setStatus(paired PairingStatus, pairingErr string, connected bool, lastErr string) {
	c.mu.Lock()
	defer c.mu.Unlock()
	if paired != "" {
		c.pairingStatus = paired
	}
	c.pairingError = pairingErr
	c.connected = connected
	if lastErr != "" {
		c.lastError = lastErr
	}

	c.hub.Broadcast(ws.Event{
		Type: "gateway_status",
		Data: ClientStatus{
			Connected:     c.connected,
			PairingStatus: c.pairingStatus,
			PairingError:  c.pairingError,
			LastError:     c.lastError,
			DeviceID:      c.identity.DeviceID,
			GatewayURL:    c.gatewayURL,
		},
	})
}

// Run connects to the OpenClaw gateway with auto-reconnect.
func (c *OpenClawClient) Run(ctx context.Context) {
	backoff := 2 * time.Second
	maxBackoff := 30 * time.Second

	for {
		err := c.connectLoop(ctx)
		if err != nil {
			log.Printf("openclaw: connection error: %v", err)
			c.setStatus("", "", false, err.Error())
		}

		c.drainPending()

		select {
		case <-ctx.Done():
			log.Println("openclaw: context cancelled, stopping")
			return
		case <-time.After(backoff):
			backoff = min(backoff*2, maxBackoff)
			log.Printf("openclaw: reconnecting to %s ...", c.gatewayURL)
		}
	}
}

func (c *OpenClawClient) connectLoop(ctx context.Context) error {
	conn, _, err := websocket.Dial(ctx, c.gatewayURL, &websocket.DialOptions{
		HTTPHeader: http.Header{
			"Origin": []string{c.gatewayOrigin()},
		},
	})
	if err != nil {
		return fmt.Errorf("dial: %w", err)
	}
	defer conn.CloseNow()

	c.connMu.Lock()
	c.conn = conn
	c.connMu.Unlock()

	log.Printf("openclaw: tcp connected to %s", c.gatewayURL)

	for {
		var frame Frame
		if err := wsjson.Read(ctx, conn, &frame); err != nil {
			return fmt.Errorf("read: %w", err)
		}

		switch frame.Type {
		case FrameTypeEvent:
			if frame.Event == "connect.challenge" {
				if err := c.handleChallenge(ctx, conn, frame.Payload); err != nil {
					return fmt.Errorf("challenge: %w", err)
				}
				continue
			}
			c.handleEvent(ctx, &frame)

		case FrameTypeResponse:
			c.handleResponse(ctx, &frame)
		}
	}
}

// request sends a request frame and waits for the matching response.
func (c *OpenClawClient) request(ctx context.Context, method string, params any) (*Frame, error) {
	id := uuid.NewString()
	req := RequestFrame{
		Type:   FrameTypeRequest,
		ID:     id,
		Method: method,
		Params: params,
	}

	ch := make(chan Frame, 1)
	c.pendingMu.Lock()
	c.pending[id] = &pendingRequest{ch: ch}
	c.pendingMu.Unlock()

	defer func() {
		c.pendingMu.Lock()
		delete(c.pending, id)
		c.pendingMu.Unlock()
	}()

	c.connMu.Lock()
	conn := c.conn
	c.connMu.Unlock()

	if conn == nil {
		return nil, fmt.Errorf("not connected")
	}
	if err := wsjson.Write(ctx, conn, req); err != nil {
		return nil, fmt.Errorf("write: %w", err)
	}

	select {
	case resp := <-ch:
		return &resp, nil
	case <-ctx.Done():
		return nil, ctx.Err()
	case <-time.After(10 * time.Second):
		return nil, fmt.Errorf("request %s timeout", method)
	}
}

func (c *OpenClawClient) drainPending() {
	c.pendingMu.Lock()
	defer c.pendingMu.Unlock()
	for id, p := range c.pending {
		close(p.ch)
		delete(c.pending, id)
	}
}

func (c *OpenClawClient) handleChallenge(ctx context.Context, conn *websocket.Conn, payload json.RawMessage) error {
	var cp ChallengePayload
	if err := json.Unmarshal(payload, &cp); err != nil {
		return fmt.Errorf("unmarshal challenge: %w", err)
	}

	log.Printf("openclaw: challenge received, nonce=%s", cp.Nonce)

	sig, signedAt, err := c.identity.Sign(clientID, clientMode, role, scopes, c.token, cp.Nonce)
	if err != nil {
		return fmt.Errorf("sign: %w", err)
	}

	params := ConnectParams{
		MinProtocol: 3,
		MaxProtocol: 3,
		Client: ConnectClient{
			ID:         clientID,
			Version:    clientVersion,
			Platform:   "go",
			Mode:       clientMode,
			InstanceID: uuid.NewString(),
		},
		Role:   role,
		Scopes: scopes,
		Caps:   []string{"tool-events"},
		Device: &ConnectDevice{
			ID:        c.identity.DeviceID,
			PublicKey: c.identity.PublicKey,
			Signature: sig,
			SignedAt:  signedAt,
			Nonce:     cp.Nonce,
		},
	}

	if c.token != "" {
		params.Auth = &ConnectAuth{Token: c.token}
	}

	req := RequestFrame{
		Type:   FrameTypeRequest,
		ID:     uuid.NewString(),
		Method: "connect",
		Params: params,
	}

	if err := wsjson.Write(ctx, conn, req); err != nil {
		return fmt.Errorf("write connect: %w", err)
	}
	log.Println("openclaw: connect request sent with device identity")
	return nil
}

func (c *OpenClawClient) handleResponse(ctx context.Context, frame *Frame) {
	// Route to pending request if matched
	c.pendingMu.Lock()
	p, ok := c.pending[frame.ID]
	if ok {
		delete(c.pending, frame.ID)
	}
	c.pendingMu.Unlock()

	if ok {
		p.ch <- *frame
		return
	}

	// Unmatched response = connect handshake response
	if frame.Ok != nil && *frame.Ok {
		log.Println("openclaw: handshake successful — paired and connected")
		c.setStatus(PairingConnected, "", true, "")
		go c.fetchInitialState(ctx)
		return
	}

	if frame.Error != nil {
		code := frame.Error.Code
		msg := frame.Error.Message
		switch code {
		case "NOT_PAIRED", "DEVICE_IDENTITY_REQUIRED":
			log.Printf("openclaw: device not paired — awaiting approval in gateway UI")
			c.setStatus(PairingPending, msg, false, "")
		default:
			log.Printf("openclaw: connect rejected: [%s] %s", code, msg)
			c.setStatus(PairingRejected, msg, false, msg)
		}
	}
}

// fetchInitialState pulls agent list and sessions after a successful connect.
func (c *OpenClawClient) fetchInitialState(ctx context.Context) {
	// Fetch agents
	resp, err := c.request(ctx, "agents.list", map[string]any{})
	if err != nil {
		log.Printf("openclaw: agents.list failed: %v", err)
		return
	}
	if resp.Ok != nil && *resp.Ok {
		c.processAgentsList(ctx, resp.Payload)
	} else if resp.Error != nil {
		log.Printf("openclaw: agents.list error: %s", resp.Error.Message)
	}

	// Fetch node list for presence info
	resp, err = c.request(ctx, "node.list", map[string]any{})
	if err != nil {
		log.Printf("openclaw: node.list failed: %v", err)
		return
	}
	if resp.Ok != nil && *resp.Ok {
		c.processNodeList(ctx, resp.Payload)
	} else if resp.Error != nil {
		log.Printf("openclaw: node.list error: %s", resp.Error.Message)
	}

	// Fetch sessions
	resp, err = c.request(ctx, "sessions.list", map[string]any{"limit": 50})
	if err != nil {
		log.Printf("openclaw: sessions.list failed: %v", err)
		return
	}
	if resp.Ok != nil && *resp.Ok {
		c.processSessionsList(ctx, resp.Payload)
	} else if resp.Error != nil {
		log.Printf("openclaw: sessions.list error: %s", resp.Error.Message)
	}
}

type agentsListResponse struct {
	Agents    []agentEntry `json:"agents"`
	DefaultID string       `json:"defaultId"`
}

type agentEntry struct {
	ID   string `json:"id"`
	Name string `json:"name"`
}

func (c *OpenClawClient) processAgentsList(ctx context.Context, payload json.RawMessage) {
	var resp agentsListResponse
	if err := json.Unmarshal(payload, &resp); err != nil {
		log.Printf("openclaw: unmarshal agents.list: %v", err)
		return
	}

	now := time.Now().UTC().Format(time.RFC3339)
	for _, a := range resp.Agents {
		agent := &model.Agent{
			ID:              a.ID,
			Name:            a.Name,
			Status:          model.AgentStatusIdle,
			Owner:           "openclaw",
			Task:            "",
			LastHeartbeatAt: now,
			UpdatedAt:       now,
		}
		if err := c.store.UpsertAgent(ctx, agent); err != nil {
			log.Printf("openclaw: upsert agent %s: %v", a.ID, err)
			continue
		}
		c.hub.Broadcast(ws.Event{
			Type: "agent_status_change",
			Data: agent,
		})
	}
	log.Printf("openclaw: agents.list — synced %d agents", len(resp.Agents))
}

type nodeListResponse struct {
	Nodes []nodeEntry `json:"nodes"`
}

type nodeEntry struct {
	ID     string `json:"id"`
	Name   string `json:"name,omitempty"`
	Status string `json:"status,omitempty"`
	Host   string `json:"host,omitempty"`
}

func (c *OpenClawClient) processNodeList(ctx context.Context, payload json.RawMessage) {
	var resp nodeListResponse
	if err := json.Unmarshal(payload, &resp); err != nil {
		log.Printf("openclaw: unmarshal node.list: %v", err)
		return
	}
	log.Printf("openclaw: node.list — %d nodes", len(resp.Nodes))
	for _, n := range resp.Nodes {
		log.Printf("  node: id=%s name=%s status=%s", n.ID, n.Name, n.Status)
	}
}

type sessionsListResponse struct {
	Sessions []sessionEntry `json:"sessions"`
}

type sessionEntry struct {
	Key       string `json:"key"`
	Label     string `json:"label,omitempty"`
	AgentID   string `json:"agentId,omitempty"`
	Status    string `json:"status,omitempty"`
	Model     string `json:"model,omitempty"`
	UpdatedAt string `json:"updatedAt,omitempty"`
}

func (c *OpenClawClient) processSessionsList(ctx context.Context, payload json.RawMessage) {
	var resp sessionsListResponse
	if err := json.Unmarshal(payload, &resp); err != nil {
		log.Printf("openclaw: unmarshal sessions.list: %v", err)
		return
	}
	log.Printf("openclaw: sessions.list — %d sessions", len(resp.Sessions))
	for _, s := range resp.Sessions {
		log.Printf("  session: key=%s agent=%s status=%s model=%s", s.Key, s.AgentID, s.Status, s.Model)
	}
}

func (c *OpenClawClient) handleEvent(ctx context.Context, frame *Frame) {
	switch frame.Event {
	case "presence":
		c.handlePresence(ctx, frame.Payload)
	case "agent":
		c.handleAgent(ctx, frame.Payload)
	default:
		// Log non-noisy events only
		if frame.Event != "health" {
			log.Printf("openclaw: event %s", frame.Event)
		}
	}
}

func (c *OpenClawClient) handlePresence(ctx context.Context, payload json.RawMessage) {
	var pp PresencePayload
	if err := json.Unmarshal(payload, &pp); err != nil {
		log.Printf("openclaw: unmarshal presence: %v", err)
		return
	}

	for _, entry := range pp.Presence {
		agent := presenceToAgent(entry)
		if err := c.store.UpsertAgent(ctx, agent); err != nil {
			log.Printf("openclaw: upsert agent %s: %v", agent.ID, err)
			continue
		}
		_ = c.store.InsertAgentStatusLog(ctx, agent.ID, string(agent.Status), agent.Task)

		c.hub.Broadcast(ws.Event{
			Type: "agent_status_change",
			Data: agent,
		})
	}

	log.Printf("openclaw: presence update — %d entries", len(pp.Presence))
}

func (c *OpenClawClient) handleAgent(ctx context.Context, payload json.RawMessage) {
	var ap AgentEventPayload
	if err := json.Unmarshal(payload, &ap); err != nil {
		log.Printf("openclaw: unmarshal agent event: %v", err)
		return
	}

	if ap.Stream == "lifecycle" || ap.Stream == "compaction" {
		log.Printf("openclaw: agent lifecycle stream=%s", ap.Stream)
	}
}

func presenceToAgent(e PresenceEntry) *model.Agent {
	now := time.Now().UTC().Format(time.RFC3339)
	status := model.AgentStatus(normalizeStatus(e.Status))
	updatedAt := e.UpdatedAt
	if updatedAt == "" {
		updatedAt = now
	}
	name := e.Name
	if name == "" {
		name = e.ID
	}
	return &model.Agent{
		ID:              e.ID,
		Name:            name,
		Status:          status,
		Owner:           e.Channel,
		Task:            "",
		LastHeartbeatAt: updatedAt,
		UpdatedAt:       updatedAt,
	}
}

func normalizeStatus(raw string) string {
	switch raw {
	case "idle", "ready", "online":
		return "idle"
	case "running", "active", "working", "executing":
		return "running"
	case "busy", "queued", "blocked", "waiting":
		return "busy"
	case "error", "failed", "failure", "panic", "crashed":
		return "error"
	default:
		return "offline"
	}
}

func (c *OpenClawClient) gatewayOrigin() string {
	origin := c.gatewayURL
	if len(origin) > 5 && origin[:5] == "ws://" {
		origin = "http://" + origin[5:]
	} else if len(origin) > 6 && origin[:6] == "wss://" {
		origin = "https://" + origin[6:]
	}
	for i := len("https://"); i < len(origin); i++ {
		if origin[i] == '/' {
			origin = origin[:i]
			break
		}
	}
	return origin
}
