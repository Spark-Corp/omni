import { db } from './client'
import { products } from '@/drizzle/schema'
import { eq, and, ilike, sql } from 'drizzle-orm'

export async function createProduct(vendorId: string, data: {
  name: string
  price: number
  unit: string
  description?: string
  currency?: string
}) {
  const [product] = await db.insert(products).values({
    vendorId,
    name: data.name,
    price: String(data.price),
    unit: data.unit,
    description: data.description,
    currency: data.currency ?? 'XOF',
  }).returning()
  return product
}

export async function getProductsByVendor(vendorId: string) {
  return db.query.products.findMany({
    where: eq(products.vendorId, vendorId),
  })
}

export async function getProductById(id: string) {
  return db.query.products.findFirst({
    where: eq(products.id, id),
  })
}

export async function updateProduct(id: string, data: Record<string, unknown>) {
  const [product] = await db.update(products)
    .set({ ...data, updatedAt: sql`now()` })
    .where(eq(products.id, id))
    .returning()
  return product
}

export async function deleteProduct(id: string) {
  await db.delete(products).where(eq(products.id, id))
}

export async function searchProducts(query: string) {
  return db.query.products.findMany({
    where: ilike(products.name, `%${query}%`),
    with: { vendor: true },
    limit: 20,
  })
}
