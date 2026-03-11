package ws

import (
	"encoding/json"
	"log"
	"sync"
)

type Event struct {
	Type string `json:"type"`
	Data any    `json:"data"`
}

type Client struct {
	ID   string
	Send chan []byte
}

type Hub struct {
	mu         sync.RWMutex
	clients    map[*Client]bool
	broadcast  chan []byte
	register   chan *Client
	unregister chan *Client
}

func NewHub() *Hub {
	return &Hub{
		clients:    make(map[*Client]bool),
		broadcast:  make(chan []byte, 256),
		register:   make(chan *Client),
		unregister: make(chan *Client),
	}
}

func (h *Hub) Run() {
	for {
		select {
		case client := <-h.register:
			h.mu.Lock()
			h.clients[client] = true
			h.mu.Unlock()
			log.Printf("ws: client %s connected (%d total)", client.ID, h.Count())

		case client := <-h.unregister:
			h.mu.Lock()
			if _, ok := h.clients[client]; ok {
				delete(h.clients, client)
				close(client.Send)
			}
			h.mu.Unlock()
			log.Printf("ws: client %s disconnected (%d total)", client.ID, h.Count())

		case message := <-h.broadcast:
			h.mu.RLock()
			for client := range h.clients {
				select {
				case client.Send <- message:
				default:
					close(client.Send)
					delete(h.clients, client)
				}
			}
			h.mu.RUnlock()
		}
	}
}

func (h *Hub) Register(c *Client)   { h.register <- c }
func (h *Hub) Unregister(c *Client) { h.unregister <- c }

func (h *Hub) Broadcast(event Event) {
	data, err := json.Marshal(event)
	if err != nil {
		log.Printf("ws: broadcast marshal error: %v", err)
		return
	}
	h.broadcast <- data
}

func (h *Hub) Count() int {
	h.mu.RLock()
	defer h.mu.RUnlock()
	return len(h.clients)
}
