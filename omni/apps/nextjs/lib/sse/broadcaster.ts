type EventType = 'vendor_status_changed' | 'new_message' | 'new_request' | 'ai_response_received'

interface SSEEvent {
  type: EventType
  data: unknown
  userId: string
}

const clients = new Map<string, ReadableStreamDefaultController[]>()

export function addClient(userId: string, controller: ReadableStreamDefaultController) {
  const existing = clients.get(userId) ?? []
  existing.push(controller)
  clients.set(userId, existing)
}

export function removeClient(userId: string, controller: ReadableStreamDefaultController) {
  const existing = clients.get(userId) ?? []
  clients.set(userId, existing.filter(c => c !== controller))
}

export function broadcast(event: SSEEvent) {
  const userClients = clients.get(event.userId) ?? []
  const message = `event: ${event.type}\ndata: ${JSON.stringify(event.data)}\n\n`
  for (const client of userClients) {
    try {
      client.enqueue(new TextEncoder().encode(message))
    } catch {
      removeClient(event.userId, client)
    }
  }
}
