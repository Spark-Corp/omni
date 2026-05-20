import { NextRequest, NextResponse } from 'next/server'
import { getVendorById, toggleVendorStatus } from '@/lib/db/vendor'
import { ToggleStatusSchema } from '@/lib/validations/vendor'

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const session = { user: { id: '1' } } // placeholder
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized', code: 'UNAUTHORIZED' }, { status: 401 })
  }

  const body = await req.json().catch(() => null)
  if (!body) {
    return NextResponse.json({ error: 'Invalid request body', code: 'INVALID_BODY' }, { status: 400 })
  }

  const parsed = ToggleStatusSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Invalid parameters', code: 'INVALID_PARAMS', details: parsed.error.flatten() },
      { status: 400 }
    )
  }

  try {
    const existing = await getVendorById(params.id)
    if (!existing) {
      return NextResponse.json({ error: 'Not found', code: 'NOT_FOUND' }, { status: 404 })
    }
    if (existing.userId !== session.user.id) {
      return NextResponse.json({ error: 'Forbidden', code: 'FORBIDDEN' }, { status: 403 })
    }

    const vendor = await toggleVendorStatus(params.id, parsed.data.isOnline)
    return NextResponse.json({ vendor })
  } catch (error) {
    console.error('[PATCH /api/vendors/[id]/status]', error)
    return NextResponse.json({ error: 'Internal server error', code: 'INTERNAL_ERROR' }, { status: 500 })
  }
}
