import { db } from './client'
import { conversations, messages, availabilityRequests } from '@/drizzle/schema'
import { eq, and, desc, sql } from 'drizzle-orm'

export async function createConversation(data: {
  buyerId: string
  vendorId: string
  requestId?: string
}) {
  // Check if conversation already exists
  const existing = await db.query.conversations.findFirst({
    where: and(
      eq(conversations.buyerId, data.buyerId),
      eq(conversations.vendorId, data.vendorId)
    ),
  })
  if (existing) return existing

  const [conversation] = await db.insert(conversations).values({
    buyerId: data.buyerId,
    vendorId: data.vendorId,
    requestId: data.requestId,
  }).returning()
  return conversation
}

export async function getConversationsByUser(userId: string) {
  return db.query.conversations.findMany({
    where: or(
      eq(conversations.buyerId, userId),
      eq(conversations.vendorId, userId)
    ),
    orderBy: [desc(conversations.lastMessageAt)],
    with: { messages: { limit: 1, orderBy: [desc(messages.createdAt)] } },
  })
}

export async function getConversationById(id: string) {
  return db.query.conversations.findFirst({
    where: eq(conversations.id, id),
  })
}

export async function getMessagesByConversation(conversationId: string, limit = 50, cursor?: string) {
  const conditions = [eq(messages.conversationId, conversationId)]
  if (cursor) {
    const cursorMessage = await db.query.messages.findFirst({ where: eq(messages.id, cursor) })
    if (cursorMessage) {
      conditions.push(sql`${messages.createdAt} < ${cursorMessage.createdAt}`)
    }
  }
  return db.query.messages.findMany({
    where: and(...conditions),
    orderBy: [desc(messages.createdAt)],
    limit,
  })
}

export async function sendMessage(data: {
  conversationId: string
  senderId: string
  senderType: 'buyer' | 'vendor' | 'ai'
  content: string
}) {
  const [message] = await db.insert(messages).values(data).returning()
  await db.update(conversations)
    .set({ lastMessageAt: sql`now()` })
    .where(eq(conversations.id, data.conversationId))
  return message
}

export async function markAsRead(conversationId: string, role: 'buyer' | 'vendor') {
  const field = role === 'buyer' ? 'unreadBuyer' : 'unreadVendor'
  await db.update(conversations)
    .set({ [field]: 0 } as any)
    .where(eq(conversations.id, conversationId))
}

export async function markMessagesRead(conversationId: string, userId: string) {
  await db.update(messages)
    .set({ isRead: true })
    .where(and(
      eq(messages.conversationId, conversationId),
      sql`${messages.senderId} != ${userId}`
    ))
}

function or(...conditions: any[]) {
  return conditions.reduce((acc: any, cond: any) => acc ? sql`(${acc} OR ${cond})` : cond, null)
}
