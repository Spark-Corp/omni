import { db } from './client'
import { vendors, products } from '@/drizzle/schema'
import { eq, and, sql } from 'drizzle-orm'

export interface CreateVendorData {
  userId: string
  name: string
  category: string
  description?: string
  phone: string
  address?: string
  neighborhood?: string
  lat: number
  lng: number
}

export async function createVendor(data: CreateVendorData) {
  const [vendor] = await db.insert(vendors).values({
    userId: data.userId,
    name: data.name,
    category: data.category,
    description: data.description,
    phone: data.phone,
    address: data.address,
    neighborhood: data.neighborhood,
    location: sql`ST_SetSRID(ST_MakePoint(${data.lng}, ${data.lat}), 4326)::geography`,
  }).returning()
  return vendor
}

export async function getVendorById(id: string) {
  return db.query.vendors.findFirst({
    where: eq(vendors.id, id),
    with: { products: true },
  })
}

export async function getVendorByUserId(userId: string) {
  return db.query.vendors.findFirst({
    where: eq(vendors.userId, userId),
  })
}

export async function updateVendor(id: string, data: Record<string, unknown>) {
  const [vendor] = await db.update(vendors)
    .set({ ...data, updatedAt: sql`now()` })
    .where(eq(vendors.id, id))
    .returning()
  return vendor
}

export async function toggleVendorStatus(id: string, isOnline: boolean) {
  const [vendor] = await db.update(vendors)
    .set({ isOnline, updatedAt: sql`now()` })
    .where(eq(vendors.id, id))
    .returning()
  return vendor
}

export async function findNearbyVendors(lat: number, lng: number, radius: number, category?: string) {
  const results = await db.execute(sql`
    SELECT v.*, 
      ST_Distance(v.location::geography, ST_SetSRID(ST_MakePoint(${lng}, ${lat}), 4326)::geography) as distance
    FROM vendors v
    WHERE v.is_online = true
    ${category ? sql`AND v.category = ${category}` : sql``}
    AND ST_DWithin(v.location::geography, ST_SetSRID(ST_MakePoint(${lng}, ${lat}), 4326)::geography, ${radius})
    ORDER BY distance
    LIMIT 50
  `)
  return results.rows
}

export async function getVendorsWithProducts(vendorIds: string[]) {
  return db.query.vendors.findMany({
    where: (v, { inArray }) => inArray(v.id, vendorIds),
    with: { products: { where: eq(products.isAvailable, true) } },
  })
}
