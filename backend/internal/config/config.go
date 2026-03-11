package config

import "os"

type Config struct {
	// Server
	Port           string
	FrontendOrigin string

	// Supabase Cloud
	DatabaseURL           string
	SupabaseURL           string
	SupabasePublishableKey string
	SupabaseSecretKey     string

	// Upstream: OpenClaw Gateway
	OpenClawGatewayWS  string
	OpenClawToken      string
	DeviceIdentityPath string
}

func Load() *Config {
	return &Config{
		Port:                   getEnv("PORT", "8080"),
		FrontendOrigin:         getEnv("FRONTEND_ORIGIN", "http://localhost:3000"),
		DatabaseURL:            getEnv("DATABASE_URL", ""),
		SupabaseURL:            getEnv("SUPABASE_URL", ""),
		SupabasePublishableKey: getEnv("SUPABASE_PUBLISHABLE_KEY", ""),
		SupabaseSecretKey:      getEnv("SUPABASE_SECRET_KEY", ""),
		OpenClawGatewayWS:      getEnv("OPENCLAW_GATEWAY_WS_URL", ""),
		OpenClawToken:          getEnv("OPENCLAW_TOKEN", ""),
		DeviceIdentityPath:     getEnv("DEVICE_IDENTITY_PATH", ".khala-device-identity.json"),
	}
}

func getEnv(key, fallback string) string {
	if v := os.Getenv(key); v != "" {
		return v
	}
	return fallback
}
