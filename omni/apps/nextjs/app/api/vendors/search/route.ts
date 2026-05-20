import { NextRequest, NextResponse } from 'next/server'
import { searchProducts } from '@/lib/db/product'
import { ProductSearchSchema } from '@/lib/validations/product'

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl
  const parsed = ProductSearchSchema.safeParse({
    query: searchParams.get('query'),
    lat: searchParams.get('lat'),
    lng: searchParams.get('lng'),
    radius: searchParams.get('radius') ?? '5000',
  })

  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Invalid parameters', code: 'INVALID_PARAMS', details: parsed.error.flatten() },
      { status: 400 }
    )
  }

  try {
    const results = await searchProducts(parsed.data.query)
    return NextResponse.json({
      results: results.map((p) => ({
        vendorId: p.vendorId,
        vendorName: (p.vendor as any)?.name ?? '',
        productName: p.name,
        price: p.price,
      })),
      count: results.length,
    })
  } catch (error) {
    console.error('[GET /api/vendors/search]', error)
    return NextResponse.json({ error: 'Internal server error', code: 'INTERNAL_ERROR' }, { status: 500 })
  }
}
