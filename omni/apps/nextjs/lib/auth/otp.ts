import { sendOTP, verifyOTP } from './config'

const rateLimitStore = new Map<string, { count: number; resetAt: number }>()
const RATE_LIMIT = 5
const RATE_WINDOW_MS = 60 * 60 * 1000 // 1 hour

function checkRateLimit(phone: string): boolean {
  const now = Date.now()
  const entry = rateLimitStore.get(phone)
  if (!entry || now > entry.resetAt) {
    rateLimitStore.set(phone, { count: 1, resetAt: now + RATE_WINDOW_MS })
    return true
  }
  if (entry.count >= RATE_LIMIT) return false
  entry.count++
  return true
}

export async function requestOTP(phone: string): Promise<{ success: boolean; error?: string }> {
  if (!checkRateLimit(phone)) {
    return { success: false, error: 'Trop de tentatives. Réessayez dans 30 secondes.' }
  }
  return sendOTP(phone)
}

export async function confirmOTP(phone: string, otp: string): Promise<{ success: boolean; error?: string; session?: any }> {
  const result = await verifyOTP(phone, otp)
  return result
}

export function validatePhone(phone: string): boolean {
  const phoneRegex = /^\+228\s?\d{2}\s?\d{2}\s?\d{2}\s?\d{2}$/
  return phoneRegex.test(phone)
}

export function sanitizePhone(phone: string): string {
  return phone.replace(/\s/g, '')
}
