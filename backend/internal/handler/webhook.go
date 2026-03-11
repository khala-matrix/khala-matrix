package handler

import (
	"encoding/json"

	"github.com/gofiber/fiber/v2"

	"github.com/khala-matrix/backend/internal/store"
	"github.com/khala-matrix/backend/internal/ws"
)

func RegisterWebhookRoutes(router fiber.Router, st *store.Store, hub *ws.Hub) {
	wh := router.Group("/webhooks")

	// Generic webhook receiver — source identified by URL path.
	// POST /v1/webhooks/:source
	wh.Post("/:source", func(c *fiber.Ctx) error {
		source := c.Params("source")
		body := c.Body()

		if len(body) == 0 || !json.Valid(body) {
			return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
				"error": "request body must be valid JSON",
			})
		}

		eventType := c.Get("X-Event-Type", detectEventType(source, body))

		id, err := st.InsertWebhookEvent(c.Context(), source, eventType, body)
		if err != nil {
			return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
				"error": "failed to store webhook event",
			})
		}

		// Broadcast to connected clients for real-time visibility
		hub.Broadcast(ws.Event{
			Type: "webhook_received",
			Data: fiber.Map{
				"id":        id,
				"source":    source,
				"eventType": eventType,
			},
		})

		return c.Status(fiber.StatusAccepted).JSON(fiber.Map{
			"id":     id,
			"status": "accepted",
		})
	})
}

func detectEventType(source string, body []byte) string {
	// Try to extract event type from common webhook payload shapes
	var probe struct {
		Action string `json:"action"`
		Type   string `json:"type"`
	}
	if json.Unmarshal(body, &probe) == nil {
		if probe.Action != "" {
			return probe.Action
		}
		if probe.Type != "" {
			return probe.Type
		}
	}
	return source + ".event"
}
