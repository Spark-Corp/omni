import { NextRequest, NextResponse } from 'next/server'
import { getVendorById } from '@/lib/db/vendor'
import { getProductsByVendor, createProduct } from '@/lib/db/product'
import { CreateProductSchema } from '@/lib/validations/product'

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const vendor = await getVendorById(params.id)
    if (!vendor) {
      return NextResponse.json({ error: 'Not found', code: 'NOT_FOUND' }, { status: 404 })
    }
    const products = await getProductsByVendor(params.id)
    return NextResponse.json({ products })
  } catch (error) {
    console.error('[GET /api/vendors/[id]/products]', error)
    return NextResponse.json({ error: 'Internal server error', code: 'INTERNAL_ERROR' }, { status: 500 })
  }
}

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const session = { user: { id: '1' } } // placeholder
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized', code: 'UNAUTHORIZED' }, { status: 401 })
  }

  const body = await req.json().catch(() => null)
  if (!body) {
    return NextResponse.json({ error: 'Invalid request body', code: 'INVALID_BODY' }, { status: 400 })
  }

  const parsed = CreateProductSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Validation failed', code: 'VALIDATION_ERROR', details: parsed.error.flatten() },
      { status: 400 }
    )
  }

  try {
    const vendor = await getVendorById(params.id)
    if (!vendor) {
      return NextResponse.json({ error: 'Not found', code: 'NOT_FOUND' }, { status: 404 })
    }
    if (vendor.userId !== session.user.id) {
      return NextResponse.json({ error: 'Forbidden', code: 'FORBIDDEN' }, { status: 403 })
    }

    const product = await createProduct(params.id, parsed.data)
    return NextResponse.json({ product }, { status: 201 })
  } catch (error) {
    console.error('[POST /api/vendors/[id]/products]', error)
    return NextResponse.json({ error: 'Internal server error', code: 'INTERNAL_ERROR' }, { status: 500 })
  }
}
