"use client";

import { useEffect, useRef, useCallback } from "react";

export type WSEvent<T = unknown> = {
  type: string;
  data: T;
};

type Listener = (event: WSEvent) => void;

export function useKhalaWS(listeners: Record<string, Listener>) {
  const wsRef = useRef<WebSocket | null>(null);
  const listenersRef = useRef(listeners);
  listenersRef.current = listeners;

  const connect = useCallback(() => {
    const url = process.env.NEXT_PUBLIC_WS_URL;
    if (!url) return;

    const ws = new WebSocket(url);
    wsRef.current = ws;

    ws.onmessage = (msg) => {
      try {
        const event = JSON.parse(msg.data) as WSEvent;
        const handler = listenersRef.current[event.type];
        if (handler) {
          handler(event);
        }
      } catch {
        // ignore malformed messages
      }
    };

    ws.onclose = () => {
      wsRef.current = null;
      // reconnect after 3s
      setTimeout(connect, 3000);
    };

    ws.onerror = () => {
      ws.close();
    };
  }, []);

  useEffect(() => {
    connect();
    return () => {
      const ws = wsRef.current;
      if (ws) {
        ws.onclose = null; // prevent reconnect on intentional close
        ws.close();
        wsRef.current = null;
      }
    };
  }, [connect]);
}
