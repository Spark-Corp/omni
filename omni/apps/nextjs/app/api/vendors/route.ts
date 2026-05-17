import { NextRequest, NextResponse } from 'next/server'
import { createVendor, getVendorByUserId } from '@/lib/db/vendor'
import { CreateVendorSchema } from '@/lib/validations/vendor'

export async function POST(req: NextRequest) {
  const session = { user: { id: '1' } } // placeholder — TASK-003 will provide real session
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized', code: 'UNAUTHORIZED' }, { status: 401 })
  }

  const body = await req.json().catch(() => null)
  if (!body) {
    return NextResponse.json({ error: 'Invalid request body', code: 'INVALID_BODY' }, { status: 400 })
  }

  const parsed = CreateVendorSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Validation failed', code: 'VALIDATION_ERROR', details: parsed.error.flatten() },
      { status: 400 }
    )
  }

  try {
    const existing = await getVendorByUserId(session.user.id)
    if (existing) {
      return NextResponse.json({ error: 'Vendor already exists', code: 'VENDOR_EXISTS' }, { status: 409 })
    }

    const { location, ...vendorData } = parsed.data
    const vendor = await createVendor({
      userId: session.user.id,
      ...vendorData,
      lat: location.lat,
      lng: location.lng,
    })

    return NextResponse.json({ vendor }, { status: 201 })
  } catch (error) {
    console.error('[POST /api/vendors]', error)
    return NextResponse.json({ error: 'Internal server error', code: 'INTERNAL_ERROR' }, { status: 500 })
  }
}
