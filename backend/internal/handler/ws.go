package handler

import (
	"log"

	"github.com/gofiber/contrib/websocket"
	"github.com/gofiber/fiber/v2"
	"github.com/google/uuid"

	"github.com/khala-matrix/backend/internal/ws"
)

func RegisterWSRoutes(router fiber.Router, hub *ws.Hub) {
	router.Use("/ws", func(c *fiber.Ctx) error {
		if websocket.IsWebSocketUpgrade(c) {
			return c.Next()
		}
		return fiber.ErrUpgradeRequired
	})

	router.Get("/ws", websocket.New(func(conn *websocket.Conn) {
		client := &ws.Client{
			ID:   uuid.NewString(),
			Send: make(chan []byte, 256),
		}

		hub.Register(client)
		defer hub.Unregister(client)

		go func() {
			for msg := range client.Send {
				if err := conn.WriteMessage(websocket.TextMessage, msg); err != nil {
					log.Printf("ws: write error for client %s: %v", client.ID, err)
					return
				}
			}
		}()

		for {
			_, msg, err := conn.ReadMessage()
			if err != nil {
				break
			}
			log.Printf("ws: received from %s: %s", client.ID, string(msg))
		}
	}))
}
