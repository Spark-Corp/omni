import { NextRequest, NextResponse } from 'next/server'
import { getRequestById, respondToRequest } from '@/lib/db/request'
import { RespondRequestSchema } from '@/lib/validations/request'

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const session = { user: { id: '1', role: 'vendor' } } // placeholder
  if (!session?.user || session.user.role !== 'vendor') {
    return NextResponse.json({ error: 'Forbidden', code: 'FORBIDDEN' }, { status: 403 })
  }

  const body = await req.json().catch(() => null)
  if (!body) {
    return NextResponse.json({ error: 'Invalid request body', code: 'INVALID_BODY' }, { status: 400 })
  }

  const parsed = RespondRequestSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Validation failed', code: 'VALIDATION_ERROR', details: parsed.error.flatten() },
      { status: 400 }
    )
  }

  try {
    const request = await getRequestById(params.id)
    if (!request) {
      return NextResponse.json({ error: 'Not found', code: 'NOT_FOUND' }, { status: 404 })
    }

    const updated = await respondToRequest(
      params.id,
      parsed.data.status === 'yes' ? 'responded' : 'responded',
      parsed.data.message
    )
    return NextResponse.json({ request: updated })
  } catch (error) {
    console.error('[PATCH /api/requests/[id]/respond]', error)
    return NextResponse.json({ error: 'Internal server error', code: 'INTERNAL_ERROR' }, { status: 500 })
  }
}
