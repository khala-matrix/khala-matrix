package store

import (
	"context"
	"time"

	"github.com/khala-matrix/backend/internal/model"
)

func (s *Store) UpsertAgent(ctx context.Context, a *model.Agent) error {
	_, err := s.pool.Exec(ctx,
		`INSERT INTO agents (id, name, status, owner, task, last_heartbeat_at, updated_at)
		 VALUES ($1, $2, $3, $4, $5, $6, $7)
		 ON CONFLICT (id) DO UPDATE SET
		   name              = EXCLUDED.name,
		   status            = EXCLUDED.status,
		   owner             = EXCLUDED.owner,
		   task              = EXCLUDED.task,
		   last_heartbeat_at = EXCLUDED.last_heartbeat_at,
		   updated_at        = now()`,
		a.ID, a.Name, a.Status, a.Owner, a.Task, a.LastHeartbeatAt, a.UpdatedAt,
	)
	return err
}

func (s *Store) InsertAgentStatusLog(ctx context.Context, agentID string, status string, task string) error {
	_, err := s.pool.Exec(ctx,
		`INSERT INTO agent_status_log (agent_id, status, task) VALUES ($1, $2, $3)`,
		agentID, status, task,
	)
	return err
}

func (s *Store) ListAgents(ctx context.Context) ([]model.Agent, error) {
	rows, err := s.pool.Query(ctx,
		`SELECT id, name, status, owner, task, last_heartbeat_at, updated_at
		 FROM agents ORDER BY name`)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var agents []model.Agent
	for rows.Next() {
		var a model.Agent
		var heartbeat, updated time.Time
		if err := rows.Scan(
			&a.ID, &a.Name, &a.Status, &a.Owner, &a.Task,
			&heartbeat, &updated,
		); err != nil {
			return nil, err
		}
		a.LastHeartbeatAt = heartbeat.Format(time.RFC3339)
		a.UpdatedAt = updated.Format(time.RFC3339)
		agents = append(agents, a)
	}
	return agents, rows.Err()
}

func (s *Store) GetOfficeSnapshot(ctx context.Context) (*model.OfficeSnapshot, error) {
	agents, err := s.ListAgents(ctx)
	if err != nil {
		return nil, err
	}
	return &model.OfficeSnapshot{
		Source:     "live",
		CapturedAt: time.Now().UTC().Format(time.RFC3339),
		Agents:     agents,
	}, nil
}
