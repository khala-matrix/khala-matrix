package handler

import (
	"github.com/gofiber/fiber/v2"

	"github.com/khala-matrix/backend/internal/service"
)

func RegisterOfficeRoutes(router fiber.Router, svc *service.OfficeService) {
	router.Get("/agents/status", func(c *fiber.Ctx) error {
		snapshot, err := svc.GetAgentsSnapshot(c.Context())
		if err != nil {
			return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
				"error": "failed to load agent status",
			})
		}
		return c.JSON(snapshot)
	})
}
