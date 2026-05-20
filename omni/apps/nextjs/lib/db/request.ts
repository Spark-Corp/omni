import { db } from './client'
import { availabilityRequests } from '@/drizzle/schema'
import { eq, and, sql } from 'drizzle-orm'

export async function createRequest(data: {
  buyerId: string
  vendorId: string
  productQuery: string
  message?: string
}) {
  const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000)
  const [request] = await db.insert(availabilityRequests).values({
    buyerId: data.buyerId,
    vendorId: data.vendorId,
    productQuery: data.productQuery,
    message: data.message,
    expiresAt: expiresAt,
  }).returning()
  return request
}

export async function getRequestById(id: string) {
  return db.query.availabilityRequests.findFirst({
    where: eq(availabilityRequests.id, id),
  })
}

export async function getRequestsByBuyer(buyerId: string) {
  return db.query.availabilityRequests.findMany({
    where: eq(availabilityRequests.buyerId, buyerId),
    orderBy: (r, { desc }) => [desc(r.createdAt)],
  })
}

export async function getRequestsByVendor(vendorId: string) {
  return db.query.availabilityRequests.findMany({
    where: eq(availabilityRequests.vendorId, vendorId),
    orderBy: (r, { desc }) => [desc(r.createdAt)],
  })
}

export async function respondToRequest(id: string, status: 'pending' | 'responded' | 'expired', message?: string) {
  const [request] = await db.update(availabilityRequests)
    .set({ status, message, respondedAt: sql`now()` })
    .where(eq(availabilityRequests.id, id))
    .returning()
  return request
}

const requestRateLimit = new Map<string, { count: number; resetAt: number }>()
const REQUEST_RATE_LIMIT = 5
const REQUEST_RATE_WINDOW_MS = 60000

export function checkRequestRateLimit(userId: string): boolean {
  const now = Date.now()
  const entry = requestRateLimit.get(userId)
  if (!entry || now > entry.resetAt) {
    requestRateLimit.set(userId, { count: 1, resetAt: now + REQUEST_RATE_WINDOW_MS })
    return true
  }
  if (entry.count >= REQUEST_RATE_LIMIT) return false
  entry.count++
  return true
}
