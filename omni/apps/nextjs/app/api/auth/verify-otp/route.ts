import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { confirmOTP, sanitizePhone } from '@/lib/auth/otp'

const InputSchema = z.object({
  phone: z.string().min(1),
  otp: z.string().length(6, 'OTP must be 6 digits'),
})

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null)
  if (!body) {
    return NextResponse.json({ error: 'Invalid request body', code: 'INVALID_BODY' }, { status: 400 })
  }
  const parsed = InputSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: 'Validation failed', code: 'VALIDATION_ERROR', details: parsed.error.flatten() }, { status: 400 })
  }

  const phone = sanitizePhone(parsed.data.phone)
  const result = await confirmOTP(phone, parsed.data.otp)

  if (!result.success) {
    return NextResponse.json({ error: result.error ?? 'Code incorrect. Réessayez.', code: 'OTP_INVALID' }, { status: 400 })
  }

  const needsRole = !result.session?.user?.role || result.session.user.role === 'buyer'
  return NextResponse.json({ success: true, session: result.session, needsRole })
}
