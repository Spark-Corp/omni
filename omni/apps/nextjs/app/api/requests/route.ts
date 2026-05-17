import { NextRequest, NextResponse } from 'next/server'
import { createRequest, getRequestsByBuyer, checkRequestRateLimit } from '@/lib/db/request'
import { CreateRequestSchema } from '@/lib/validations/request'

export async function POST(req: NextRequest) {
  const session = { user: { id: '1', role: 'buyer' } } // placeholder
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized', code: 'UNAUTHORIZED' }, { status: 401 })
  }

  if (!checkRequestRateLimit(session.user.id)) {
    return NextResponse.json({ error: 'Too many requests', code: 'RATE_LIMITED' }, { status: 429 })
  }

  const body = await req.json().catch(() => null)
  if (!body) {
    return NextResponse.json({ error: 'Invalid request body', code: 'INVALID_BODY' }, { status: 400 })
  }

  const parsed = CreateRequestSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Validation failed', code: 'VALIDATION_ERROR', details: parsed.error.flatten() },
      { status: 400 }
    )
  }

  try {
    const request = await createRequest({
      buyerId: session.user.id,
      ...parsed.data,
    })
    return NextResponse.json({ request }, { status: 201 })
  } catch (error) {
    console.error('[POST /api/requests]', error)
    return NextResponse.json({ error: 'Internal server error', code: 'INTERNAL_ERROR' }, { status: 500 })
  }
}

export async function GET(req: NextRequest) {
  const session = { user: { id: '1' } } // placeholder
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized', code: 'UNAUTHORIZED' }, { status: 401 })
  }

  try {
    const requests = await getRequestsByBuyer(session.user.id)
    return NextResponse.json({ requests })
  } catch (error) {
    console.error('[GET /api/requests]', error)
    return NextResponse.json({ error: 'Internal server error', code: 'INTERNAL_ERROR' }, { status: 500 })
  }
}
