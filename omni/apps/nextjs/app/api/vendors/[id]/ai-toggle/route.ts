import { NextRequest, NextResponse } from 'next/server'
import { getVendorById, updateVendor } from '@/lib/db/vendor'
import { AIToggleSchema } from '@/lib/validations/ai'

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const session = { user: { id: '1' } } // placeholder
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized', code: 'UNAUTHORIZED' }, { status: 401 })
  }

  const body = await req.json().catch(() => null)
  if (!body) {
    return NextResponse.json({ error: 'Invalid request body', code: 'INVALID_BODY' }, { status: 400 })
  }

  const parsed = AIToggleSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Validation failed', code: 'VALIDATION_ERROR', details: parsed.error.flatten() },
      { status: 400 }
    )
  }

  try {
    const vendor = await getVendorById(params.id)
    if (!vendor) return NextResponse.json({ error: 'Not found', code: 'NOT_FOUND' }, { status: 404 })
    if (vendor.userId !== session.user.id) return NextResponse.json({ error: 'Forbidden', code: 'FORBIDDEN' }, { status: 403 })
    if (!vendor.premiumEnabled) return NextResponse.json({ error: 'AI requires premium', code: 'AI_REQUIRES_PREMIUM' }, { status: 402 })

    const updated = await updateVendor(params.id, { aiMode: parsed.data.aiMode })
    return NextResponse.json({ vendor: updated })
  } catch (error) {
    console.error('[PATCH /api/vendors/[id]/ai-toggle]', error)
    return NextResponse.json({ error: 'Internal server error', code: 'INTERNAL_ERROR' }, { status: 500 })
  }
}
