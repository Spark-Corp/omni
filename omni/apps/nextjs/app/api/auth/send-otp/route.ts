import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { requestOTP, validatePhone, sanitizePhone } from '@/lib/auth/otp'

const InputSchema = z.object({
  phone: z.string().min(1, 'Phone is required'),
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
  if (!validatePhone(phone)) {
    return NextResponse.json({ error: 'Veuillez entrer un numéro de téléphone valide.', code: 'INVALID_PHONE' }, { status: 400 })
  }

  const result = await requestOTP(phone)
  if (!result.success) {
    return NextResponse.json({ error: result.error, code: 'OTP_SEND_FAILED' }, { status: 429 })
  }

  return NextResponse.json({ success: true })
}
