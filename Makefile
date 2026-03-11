.PHONY: dev dev-all dev-frontend dev-backend install lint test build docker-up docker-down

# ── Development ──────────────────────────────────────────────

dev: dev-all

dev-all:
	@bash scripts/dev.sh

dev-frontend:
	cd frontend && npm run dev

dev-backend:
	cd backend && go run ./cmd/server

install:
	cd frontend && npm install
	cd backend && go mod download

# ── Quality ──────────────────────────────────────────────────

lint:
	cd frontend && npm run lint
	cd backend && go vet ./...

test:
	cd frontend && npm run test
	cd backend && go test ./...

# ── Build ────────────────────────────────────────────────────

build:
	cd frontend && npm run build
	cd backend && go build -o ./tmp/server ./cmd/server

# ── Docker ───────────────────────────────────────────────────

docker-up:
	docker compose up --build -d

docker-down:
	docker compose down
