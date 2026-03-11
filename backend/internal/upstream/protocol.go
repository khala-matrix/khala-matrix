package upstream

import "encoding/json"

// Gateway WebSocket frame types
const (
	FrameTypeEvent   = "event"
	FrameTypeRequest = "req"
	FrameTypeResponse = "res"
)

// Inbound frame (from gateway)
type Frame struct {
	Type    string          `json:"type"`
	ID      string          `json:"id,omitempty"`
	Event   string          `json:"event,omitempty"`
	Seq     *int64          `json:"seq,omitempty"`
	Payload json.RawMessage `json:"payload,omitempty"`
	// Response fields
	Ok    *bool           `json:"ok,omitempty"`
	Error *FrameError     `json:"error,omitempty"`
}

type FrameError struct {
	Code    string          `json:"code"`
	Message string          `json:"message"`
	Details json.RawMessage `json:"details,omitempty"`
}

// Outbound request frame
type RequestFrame struct {
	Type   string `json:"type"`
	ID     string `json:"id"`
	Method string `json:"method"`
	Params any    `json:"params"`
}

// connect request params
type ConnectParams struct {
	MinProtocol int            `json:"minProtocol"`
	MaxProtocol int            `json:"maxProtocol"`
	Client      ConnectClient  `json:"client"`
	Role        string         `json:"role"`
	Scopes      []string       `json:"scopes"`
	Caps        []string       `json:"caps"`
	Device      *ConnectDevice `json:"device,omitempty"`
	Auth        *ConnectAuth   `json:"auth,omitempty"`
}

type ConnectAuth struct {
	Token string `json:"token,omitempty"`
}

type ConnectClient struct {
	ID         string `json:"id"`
	Version    string `json:"version"`
	Platform   string `json:"platform"`
	Mode       string `json:"mode"`
	InstanceID string `json:"instanceId,omitempty"`
}

type ConnectDevice struct {
	ID        string `json:"id"`
	PublicKey string `json:"publicKey"`
	Signature string `json:"signature"`
	SignedAt  int64  `json:"signedAt"`
	Nonce     string `json:"nonce"`
}

// Gateway event payloads
type ChallengePayload struct {
	Nonce string `json:"nonce"`
	Ts    int64  `json:"ts"`
}

type AgentEventPayload struct {
	Stream     string          `json:"stream"`
	SessionKey string          `json:"sessionKey,omitempty"`
	Data       json.RawMessage `json:"data,omitempty"`
}

type PresenceEntry struct {
	ID        string `json:"id"`
	Name      string `json:"name,omitempty"`
	Status    string `json:"status"`
	AgentID   string `json:"agentId,omitempty"`
	Channel   string `json:"channel,omitempty"`
	Model     string `json:"model,omitempty"`
	UpdatedAt string `json:"updatedAt,omitempty"`
}

type PresencePayload struct {
	Presence []PresenceEntry `json:"presence"`
}

// Pairing status
type PairingStatus string

const (
	PairingNone      PairingStatus = "none"
	PairingPending   PairingStatus = "pending"
	PairingApproved  PairingStatus = "approved"
	PairingRejected  PairingStatus = "rejected"
	PairingConnected PairingStatus = "connected"
)
