package middleware

import (
	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/fiber/v2/middleware/cors"
	"github.com/gofiber/fiber/v2/middleware/logger"
	"github.com/gofiber/fiber/v2/middleware/recover"

	"github.com/khala-matrix/backend/internal/config"
)

func Setup(app *fiber.App, cfg *config.Config) {
	app.Use(recover.New())
	app.Use(logger.New(logger.Config{
		Format: "${time} ${status} ${method} ${path} ${latency}\n",
	}))
	app.Use(cors.New(cors.Config{
		AllowOrigins: cfg.FrontendOrigin,
		AllowHeaders: "Origin, Content-Type, Accept, Authorization",
		AllowMethods: "GET, POST, PUT, DELETE, OPTIONS",
	}))
}
