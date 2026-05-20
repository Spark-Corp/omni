import { db } from './client'
import { aiResponses } from '@/drizzle/schema'
import { eq } from 'drizzle-orm'

export async function storeAIResponse(data: {
  messageId: string
  vendorId: string
  productsMatched?: any
  groqModel?: string
  responseTimeMs?: number
}) {
  const [response] = await db.insert(aiResponses).values({
    messageId: data.messageId,
    vendorId: data.vendorId,
    productsMatched: data.productsMatched ?? null,
    groqModel: data.groqModel,
    responseTimeMs: data.responseTimeMs,
  }).returning()
  return response
}

export async function getAIResponseByMessageId(messageId: string) {
  return db.query.aiResponses.findFirst({
    where: eq(aiResponses.messageId, messageId),
  })
}

export async function markAIResponseOverridden(messageId: string, overrideMessageId: string) {
  const [response] = await db.update(aiResponses)
    .set({ isOverridden: true, overrideMessageId })
    .where(eq(aiResponses.messageId, messageId))
    .returning()
  return response
}
