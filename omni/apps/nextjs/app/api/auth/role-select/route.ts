import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

const InputSchema = z.object({
  role: z.enum(['buyer', 'vendor']),
})

export async function POST(req: NextRequest) {
  const session = { user: { id: '1', role: 'buyer' } } // placeholder
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized', code: 'UNAUTHORIZED' }, { status: 401 })
  }

  const body = await req.json().catch(() => null)
  if (!body) {
    return NextResponse.json({ error: 'Invalid request body', code: 'INVALID_BODY' }, { status: 400 })
  }
  const parsed = InputSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: 'Validation failed', code: 'VALIDATION_ERROR', details: parsed.error.flatten() }, { status: 400 })
  }

  return NextResponse.json({ success: true, role: parsed.data.role })
}
