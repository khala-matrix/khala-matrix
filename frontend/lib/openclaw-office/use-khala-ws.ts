"use client";

import { useEffect, useRef } from "react";

export type WSEvent<T = unknown> = {
  type: string;
  data: T;
};

type Listener = (event: WSEvent) => void;

export function useKhalaWS(listeners: Record<string, Listener>) {
  const wsRef = useRef<WebSocket | null>(null);
  const listenersRef = useRef(listeners);

  useEffect(() => {
    listenersRef.current = listeners;
  });

  useEffect(() => {
    const url = process.env.NEXT_PUBLIC_WS_URL;
    if (!url) return;

    let stopped = false;
    let reconnectTimer: ReturnType<typeof setTimeout>;

    function connect() {
      if (stopped) return;

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
        if (!stopped) {
          reconnectTimer = setTimeout(connect, 3000);
        }
      };

      ws.onerror = () => {
        ws.close();
      };
    }

    connect();

    return () => {
      stopped = true;
      clearTimeout(reconnectTimer);
      const ws = wsRef.current;
      if (ws) {
        ws.onclose = null;
        ws.close();
        wsRef.current = null;
      }
    };
  }, []);
}
