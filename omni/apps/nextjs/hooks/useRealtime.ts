'use client';

import { useEffect, useRef, useState } from 'react';

interface RealtimeMessage {
  type: string;
  [key: string]: unknown;
}

interface UseRealtimeOptions {
  userId: string;
  userType: string;
}

export function useRealtime(userId: string, userType: string) {
  const [connected, setConnected] = useState(false);
  const [lastMessage, setLastMessage] = useState<RealtimeMessage | null>(null);
  const eventSourceRef = useRef<EventSource | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!userId || !userType) return;

    const connect = () => {
      const eventSource = new EventSource(
        `/api/realtime?userId=${userId}&type=${userType}`
      );

      eventSource.onopen = () => {
        console.log('[Realtime] Connected');
        setConnected(true);
      };

      eventSource.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data) as RealtimeMessage;
          
          if (data.type === 'connected') {
            console.log('[Realtime] Session started:', data.clientId);
          } else if (data.type === 'ping') {
            // Keep-alive, ignore
          } else {
            console.log('[Realtime] Message received:', data);
            setLastMessage(data);
          }
        } catch (e) {
          console.error('[Realtime] Error parsing message:', e);
        }
      };

      eventSource.onerror = () => {
        console.error('[Realtime] Connection error');
        setConnected(false);
        eventSource.close();
        
        // Reconnect after 5 seconds
        reconnectTimeoutRef.current = setTimeout(() => {
          console.log('[Realtime] Reconnecting...');
          connect();
        }, 5000);
      };

      eventSourceRef.current = eventSource;
    };

    connect();

    return () => {
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
      }
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
    };
  }, [userId, userType]);

  return { connected, lastMessage };
}