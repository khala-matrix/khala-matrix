package handler

import (
	"github.com/gofiber/fiber/v2"

	"github.com/khala-matrix/backend/internal/upstream"
)

func RegisterGatewayRoutes(router fiber.Router, oc *upstream.OpenClawClient) {
	gw := router.Group("/gateway")

	// GET /v1/gateway/status — pairing & connection status
	gw.Get("/status", func(c *fiber.Ctx) error {
		if oc == nil {
			return c.JSON(fiber.Map{
				"enabled": false,
				"message": "OpenClaw upstream not configured",
			})
		}
		status := oc.Status()
		return c.JSON(fiber.Map{
			"enabled": true,
			"status":  status,
		})
	})
}
