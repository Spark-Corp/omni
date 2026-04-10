import { NextResponse } from 'next/server';

// Simple in-memory store for connections (use Redis in production)
const clients = new Map();

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get('userId');
  const userType = searchParams.get('type'); // 'vendor' or 'buyer'
  
  if (!userId) {
    return new Response('User ID required', { status: 400 });
  }

  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    start(controller) {
      // Store connection
      const clientId = `${userType}_${userId}_${Date.now()}`;
      clients.set(clientId, {
        controller,
        userId,
        userType,
        lastPing: Date.now()
      });

      // Send initial connection message
      controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: 'connected', clientId })}\n\n`));

      // Send ping every 30 seconds to keep connection alive
      const pingInterval = setInterval(() => {
        try {
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: 'ping' })}\n\n`));
        } catch (e) {
          clearInterval(pingInterval);
          clients.delete(clientId);
        }
      }, 30000);

      // Cleanup on close
      request.signal.addEventListener('abort', () => {
        clearInterval(pingInterval);
        clients.delete(clientId);
        console.log(`[WebSocket] Client disconnected: ${clientId}`);
      });

      console.log(`[WebSocket] Client connected: ${clientId}`);
    }
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    },
  });
}

// API to send notifications
export async function POST(request) {
  try {
    const { targetUserId, targetType, message } = await request.json();
    
    const encoder = new TextEncoder();
    let sent = 0;
    
    // Find and notify target clients
    for (const [clientId, client] of clients.entries()) {
      if (client.userId === targetUserId && client.userType === targetType) {
        try {
          client.controller.enqueue(
            encoder.encode(`data: ${JSON.stringify(message)}\n\n`)
          );
          sent++;
        } catch (e) {
          // Client disconnected
          clients.delete(clientId);
        }
      }
    }

    return NextResponse.json({ success: true, sent });
  } catch (error) {
    console.error('[WebSocket] Error sending notification:', error);
    return NextResponse.json({ error: 'Failed to send' }, { status: 500 });
  }
}
