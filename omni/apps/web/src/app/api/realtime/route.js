// Simple SSE real-time updates for availability requests
// Uses standard Web APIs, not Next.js

const clients = new Map();

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get('userId');
  const userType = searchParams.get('type');
  
  if (!userId) {
    return new Response('User ID required', { status: 400 });
  }

  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    start(controller) {
      const clientId = `${userType}_${userId}_${Date.now()}`;
      clients.set(clientId, {
        controller,
        userId,
        userType,
        lastPing: Date.now()
      });

      controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: 'connected', clientId })}\n\n`));

      const pingInterval = setInterval(() => {
        if (clients.has(clientId)) {
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: 'ping' })}\n\n`));
        } else {
          clearInterval(pingInterval);
        }
      }, 30000);

      const cleanup = () => {
        clearInterval(pingInterval);
        clients.delete(clientId);
      };

      request.signal.addEventListener('abort', cleanup);
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    },
  });
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { type, requestId, response, userId } = body;

    if (type === 'broadcast' && requestId) {
      const message = JSON.stringify({
        type: 'request_update',
        requestId,
        response,
        timestamp: Date.now()
      });

      for (const [clientId, client] of clients) {
        if (client.userType === 'buyer') {
          try {
            client.controller.enqueue(new TextEncoder().encode(`data: ${message}\n\n`));
          } catch {
            clients.delete(clientId);
          }
        }
      }
    }

    return Response.json({ success: true });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}