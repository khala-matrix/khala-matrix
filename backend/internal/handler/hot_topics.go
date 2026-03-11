package handler

import (
	"github.com/gofiber/fiber/v2"

	"github.com/khala-matrix/backend/internal/service"
)

func RegisterHotTopicsRoutes(router fiber.Router, svc *service.HotTopicsService) {
	router.Get("/hot-topics/page-data", func(c *fiber.Ctx) error {
		data, err := svc.GetPageData(c.Context())
		if err != nil {
			return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
				"error": "failed to load hot topics data",
			})
		}
		return c.JSON(data)
	})
}
