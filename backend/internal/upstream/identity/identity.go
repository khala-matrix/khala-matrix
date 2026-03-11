// Package identity manages Ed25519 device identity for OpenClaw gateway pairing.
//
// Protocol:
//   - Generate Ed25519 key pair
//   - DeviceID = hex(SHA-256(publicKey))
//   - Sign: message = "v2|deviceId|clientId|clientMode|role|scopes|signedAtMs|token|nonce"
//   - Encoding: Base64url without padding
package identity

import (
	"crypto/ed25519"
	"crypto/rand"
	"crypto/sha256"
	"encoding/base64"
	"encoding/hex"
	"encoding/json"
	"fmt"
	"os"
	"path/filepath"
	"strconv"
	"strings"
	"time"
)

type DeviceIdentity struct {
	DeviceID   string `json:"deviceId"`
	PublicKey  string `json:"publicKey"`
	PrivateKey string `json:"privateKey"`
	CreatedAt  int64  `json:"createdAtMs"`
}

// Load reads identity from file, or generates a new one if not found.
func Load(path string) (*DeviceIdentity, error) {
	data, err := os.ReadFile(path)
	if err == nil {
		var id DeviceIdentity
		if err := json.Unmarshal(data, &id); err == nil && id.DeviceID != "" {
			return &id, nil
		}
	}

	id, err := Generate()
	if err != nil {
		return nil, err
	}
	if err := Save(path, id); err != nil {
		return nil, err
	}
	return id, nil
}

func Generate() (*DeviceIdentity, error) {
	pub, priv, err := ed25519.GenerateKey(rand.Reader)
	if err != nil {
		return nil, fmt.Errorf("identity: generate key: %w", err)
	}

	deviceID, err := deriveDeviceID(pub)
	if err != nil {
		return nil, err
	}

	return &DeviceIdentity{
		DeviceID:   deviceID,
		PublicKey:  encodeBase64URL(pub),
		PrivateKey: encodeBase64URL(priv.Seed()),
		CreatedAt:  time.Now().UnixMilli(),
	}, nil
}

func Save(path string, id *DeviceIdentity) error {
	if err := os.MkdirAll(filepath.Dir(path), 0700); err != nil {
		return err
	}
	data, err := json.MarshalIndent(id, "", "  ")
	if err != nil {
		return err
	}
	return os.WriteFile(path, data, 0600)
}

// Sign creates an Ed25519 signature for the gateway connect handshake.
func (id *DeviceIdentity) Sign(clientID, clientMode, role string, scopes []string, token, nonce string) (signature string, signedAt int64, err error) {
	seed, err := decodeBase64URL(id.PrivateKey)
	if err != nil {
		return "", 0, fmt.Errorf("identity: decode private key: %w", err)
	}
	privKey := ed25519.NewKeyFromSeed(seed)

	signedAt = time.Now().UnixMilli()
	msg := buildSignMessage(id.DeviceID, clientID, clientMode, role, scopes, signedAt, token, nonce)

	sig := ed25519.Sign(privKey, []byte(msg))
	return encodeBase64URL(sig), signedAt, nil
}

func buildSignMessage(deviceID, clientID, clientMode, role string, scopes []string, signedAtMs int64, token, nonce string) string {
	return strings.Join([]string{
		"v2",
		deviceID,
		clientID,
		clientMode,
		role,
		strings.Join(scopes, ","),
		strconv.FormatInt(signedAtMs, 10),
		token,
		nonce,
	}, "|")
}

func deriveDeviceID(publicKey []byte) (string, error) {
	hash := sha256.Sum256(publicKey)
	return hex.EncodeToString(hash[:]), nil
}

func encodeBase64URL(data []byte) string {
	return base64.RawURLEncoding.EncodeToString(data)
}

func decodeBase64URL(s string) ([]byte, error) {
	return base64.RawURLEncoding.DecodeString(s)
}
