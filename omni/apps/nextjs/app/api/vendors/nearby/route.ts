import { NextRequest, NextResponse } from 'next/server'
import { findNearbyVendors, getVendorsWithProducts } from '@/lib/db/vendor'
import { NearbyQuerySchema } from '@/lib/validations/vendor'

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl
  const parsed = NearbyQuerySchema.safeParse({
    lat: searchParams.get('lat'),
    lng: searchParams.get('lng'),
    radius: searchParams.get('radius') ?? '5000',
    category: searchParams.get('category'),
  })

  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Invalid parameters', code: 'INVALID_PARAMS', details: parsed.error.flatten() },
      { status: 400 }
    )
  }

  try {
    const { lat, lng, radius, category } = parsed.data
    const rows = await findNearbyVendors(lat, lng, radius, category)
    const vendorIds = rows.map((r: any) => r.id)
    const vendorsWithProducts = vendorIds.length > 0 ? await getVendorsWithProducts(vendorIds) : []

    return NextResponse.json({
      vendors: vendorsWithProducts.map((v) => ({
        id: v.id,
        name: v.name,
        category: v.category,
        distance: 0,
        isOnline: v.isOnline,
        products: v.products.map((p) => ({ name: p.name, price: p.price, unit: p.unit })),
      })),
      count: vendorsWithProducts.length,
    })
  } catch (error) {
    console.error('[GET /api/vendors/nearby]', error)
    return NextResponse.json(
      { error: 'Internal server error', code: 'INTERNAL_ERROR' },
      { status: 500 }
    )
  }
}
