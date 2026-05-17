import { NextRequest } from 'next/server'
import { addClient, removeClient } from '@/lib/sse/broadcaster'

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  const session = { user: { id: '1' } } // placeholder
  if (!session?.user) {
    return new Response('Unauthorized', { status: 401 })
  }

  const stream = new ReadableStream({
    start(controller) {
      addClient(session.user.id, controller)
      const encoder = new TextEncoder()
      controller.enqueue(encoder.encode('data: connected\n\n'))

      req.signal.addEventListener('abort', () => {
        removeClient(session.user.id, controller)
      })
    },
  })

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    },
  })
}
