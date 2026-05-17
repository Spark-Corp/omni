import { db } from './client'
import { vendorStats } from '@/drizzle/schema'
import { eq, and, gte, sql } from 'drizzle-orm'

export async function getVendorStats(vendorId: string, days = 7) {
  const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000)
  return db.query.vendorStats.findMany({
    where: and(
      eq(vendorStats.vendorId, vendorId),
      gte(vendorStats.date, startDate)
    ),
    orderBy: (s, { asc }) => [asc(s.date)],
  })
}

export async function upsertDailyStat(vendorId: string, date: Date, data: {
  views?: number
  requestsReceived?: number
  requestsAnswered?: number
  aiResponsesGenerated?: number
}) {
  const dateStr = date.toISOString().split('T')[0]
  const existing = await db.query.vendorStats.findFirst({
    where: and(
      eq(vendorStats.vendorId, vendorId),
      sql`DATE(${vendorStats.date}) = ${dateStr}`
    ),
  })

  if (existing) {
    const [stat] = await db.update(vendorStats)
      .set({
        views: (existing.views ?? 0) + (data.views ?? 0),
        requestsReceived: (existing.requestsReceived ?? 0) + (data.requestsReceived ?? 0),
        requestsAnswered: (existing.requestsAnswered ?? 0) + (data.requestsAnswered ?? 0),
        aiResponsesGenerated: (existing.aiResponsesGenerated ?? 0) + (data.aiResponsesGenerated ?? 0),
      })
      .where(eq(vendorStats.id, existing.id))
      .returning()
    return stat
  }

  const [stat] = await db.insert(vendorStats).values({
    vendorId,
    date: new Date(dateStr),
    ...data,
  }).returning()
  return stat
}
