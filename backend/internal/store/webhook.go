package store

import (
	"context"
	"encoding/json"
)

func (s *Store) InsertWebhookEvent(ctx context.Context, source, eventType string, payload json.RawMessage) (string, error) {
	var id string
	err := s.pool.QueryRow(ctx,
		`INSERT INTO webhook_events (source, event_type, payload)
		 VALUES ($1, $2, $3) RETURNING id`,
		source, eventType, payload,
	).Scan(&id)
	return id, err
}

func (s *Store) MarkWebhookProcessed(ctx context.Context, id string) error {
	_, err := s.pool.Exec(ctx,
		`UPDATE webhook_events SET processed_at = now() WHERE id = $1`, id)
	return err
}
