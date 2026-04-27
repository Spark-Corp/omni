import { useEffect, useRef, useCallback, useState } from 'react';

export function useRealtime(userId, userType) {
  const [connected, setConnected] = useState(false);
  const [lastMessage, setLastMessage] = useState(null);
  const eventSourceRef = useRef(null);
  const reconnectTimeoutRef = useRef(null);

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
          const data = JSON.parse(event.data);
          
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

      eventSource.onerror = (error) => {
        console.error('[Realtime] Connection error:', error);
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
