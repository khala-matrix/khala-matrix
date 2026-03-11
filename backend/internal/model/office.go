package model

type AgentStatus string

const (
	AgentStatusIdle    AgentStatus = "idle"
	AgentStatusRunning AgentStatus = "running"
	AgentStatusBusy    AgentStatus = "busy"
	AgentStatusOffline AgentStatus = "offline"
	AgentStatusError   AgentStatus = "error"
)

type Agent struct {
	ID              string      `json:"id"`
	Name            string      `json:"name"`
	Status          AgentStatus `json:"status"`
	Owner           string      `json:"owner"`
	Task            string      `json:"task"`
	LastHeartbeatAt string      `json:"lastHeartbeatAt"`
	UpdatedAt       string      `json:"updatedAt"`
}

type GatewayStatusUpdate struct {
	AgentID string      `json:"agentId"`
	Status  AgentStatus `json:"status"`
	Message string      `json:"message"`
	At      string      `json:"at"`
}

type OfficeSnapshot struct {
	Source            string               `json:"source"`
	CapturedAt        string               `json:"capturedAt"`
	Agents            []Agent              `json:"agents"`
	LastGatewayUpdate *GatewayStatusUpdate `json:"lastGatewayUpdate"`
}
