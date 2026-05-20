import { NextRequest, NextResponse } from 'next/server'
import { getProductById, updateProduct, deleteProduct } from '@/lib/db/product'
import { getVendorById } from '@/lib/db/vendor'
import { UpdateProductSchema } from '@/lib/validations/product'

export async function PATCH(req: NextRequest, { params }: { params: { id: string; pid: string } }) {
  const session = { user: { id: '1' } } // placeholder
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized', code: 'UNAUTHORIZED' }, { status: 401 })
  }

  const body = await req.json().catch(() => null)
  if (!body) {
    return NextResponse.json({ error: 'Invalid request body', code: 'INVALID_BODY' }, { status: 400 })
  }

  const parsed = UpdateProductSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Validation failed', code: 'VALIDATION_ERROR', details: parsed.error.flatten() },
      { status: 400 }
    )
  }

  try {
    const vendor = await getVendorById(params.id)
    if (!vendor || vendor.userId !== session.user.id) {
      return NextResponse.json({ error: 'Forbidden', code: 'FORBIDDEN' }, { status: 403 })
    }

    const existing = await getProductById(params.pid)
    if (!existing || existing.vendorId !== params.id) {
      return NextResponse.json({ error: 'Not found', code: 'NOT_FOUND' }, { status: 404 })
    }

    const product = await updateProduct(params.pid, parsed.data)
    return NextResponse.json({ product })
  } catch (error) {
    console.error('[PATCH /api/vendors/[id]/products/[pid]]', error)
    return NextResponse.json({ error: 'Internal server error', code: 'INTERNAL_ERROR' }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string; pid: string } }) {
  const session = { user: { id: '1' } } // placeholder
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized', code: 'UNAUTHORIZED' }, { status: 401 })
  }

  try {
    const vendor = await getVendorById(params.id)
    if (!vendor || vendor.userId !== session.user.id) {
      return NextResponse.json({ error: 'Forbidden', code: 'FORBIDDEN' }, { status: 403 })
    }

    const existing = await getProductById(params.pid)
    if (!existing || existing.vendorId !== params.id) {
      return NextResponse.json({ error: 'Not found', code: 'NOT_FOUND' }, { status: 404 })
    }

    await deleteProduct(params.pid)
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('[DELETE /api/vendors/[id]/products/[pid]]', error)
    return NextResponse.json({ error: 'Internal server error', code: 'INTERNAL_ERROR' }, { status: 500 })
  }
}
