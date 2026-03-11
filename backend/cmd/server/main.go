package main

import (
	"context"
	"log"
	"os"
	"os/signal"
	"syscall"

	"github.com/gofiber/fiber/v2"
	"github.com/joho/godotenv"

	"github.com/khala-matrix/backend/internal/config"
	"github.com/khala-matrix/backend/internal/handler"
	"github.com/khala-matrix/backend/internal/middleware"
	"github.com/khala-matrix/backend/internal/service"
	"github.com/khala-matrix/backend/internal/store"
	"github.com/khala-matrix/backend/internal/upstream"
	"github.com/khala-matrix/backend/internal/upstream/identity"
	"github.com/khala-matrix/backend/internal/ws"
)

func main() {
	_ = godotenv.Load()

	cfg := config.Load()

	// ── Database ────────────────────────────────────────────
	if cfg.DatabaseURL == "" {
		log.Fatal("DATABASE_URL is required")
	}

	ctx, cancel := context.WithCancel(context.Background())
	defer cancel()

	db, err := store.New(ctx, cfg.DatabaseURL)
	if err != nil {
		log.Fatalf("database: %v", err)
	}
	defer db.Close()
	log.Println("database: connected")

	// ── WebSocket Hub ───────────────────────────────────────
	hub := ws.NewHub()
	go hub.Run()

	// ── Upstream: OpenClaw Gateway ──────────────────────────
	var oc *upstream.OpenClawClient

	if cfg.OpenClawGatewayWS != "" {
		deviceID, err := identity.Load(cfg.DeviceIdentityPath)
		if err != nil {
			log.Fatalf("device identity: %v", err)
		}
		log.Printf("device identity: id=%s path=%s", deviceID.DeviceID, cfg.DeviceIdentityPath)

		oc = upstream.NewOpenClawClient(cfg.OpenClawGatewayWS, cfg.OpenClawToken, deviceID, db, hub)
		go oc.Run(ctx)
		log.Printf("openclaw: upstream connecting to %s", cfg.OpenClawGatewayWS)
	} else {
		log.Println("openclaw: OPENCLAW_GATEWAY_WS_URL not set, upstream disabled")
	}

	// ── Services ────────────────────────────────────────────
	hotTopicsSvc := service.NewHotTopicsService(db)
	officeSvc := service.NewOfficeService(db)

	// ── Fiber App ───────────────────────────────────────────
	app := fiber.New(fiber.Config{
		AppName:      "khala-matrix-backend",
		ServerHeader: "khala-matrix",
	})

	middleware.Setup(app, cfg)

	api := app.Group("/v1")
	handler.RegisterHotTopicsRoutes(api, hotTopicsSvc)
	handler.RegisterOfficeRoutes(api, officeSvc)
	handler.RegisterWSRoutes(api, hub)
	handler.RegisterWebhookRoutes(api, db, hub)
	handler.RegisterGatewayRoutes(api, oc)

	app.Get("/healthz", func(c *fiber.Ctx) error {
		return c.JSON(fiber.Map{"status": "ok"})
	})

	// ── Start & Graceful Shutdown ───────────────────────────
	go func() {
		if err := app.Listen(":" + cfg.Port); err != nil {
			log.Fatalf("server: %v", err)
		}
	}()

	quit := make(chan os.Signal, 1)
	signal.Notify(quit, syscall.SIGINT, syscall.SIGTERM)
	<-quit

	log.Println("shutting down...")
	cancel()
	if err := app.Shutdown(); err != nil {
		log.Fatalf("shutdown: %v", err)
	}
	log.Println("server stopped")
}
