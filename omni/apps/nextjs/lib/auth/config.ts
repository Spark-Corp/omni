import { NextRequest } from 'next/server'

const NEON_AUTH_URL = process.env.NEON_AUTH_URL ?? ''
const AUTH_SECRET = process.env.AUTH_SECRET ?? ''

export interface AuthUser {
  id: string
  name?: string
  email?: string
  phone: string
  role: 'buyer' | 'vendor' | 'admin'
}

export interface AuthSession {
  user: AuthUser
  expiresAt: number
}

export async function getSession(request?: NextRequest): Promise<AuthSession | null> {
  try {
    const res = await fetch(`${NEON_AUTH_URL}/me`, {
      headers: request ? { cookie: request.headers.get('cookie') ?? '' } : undefined,
      cache: 'no-store',
    })
    if (!res.ok) return null
    const data = await res.json()
    return data as AuthSession
  } catch {
    return null
  }
}

export async function auth(): Promise<AuthSession | null> {
  return getSession()
}

export async function sendOTP(phone: string): Promise<{ success: boolean; error?: string }> {
  try {
    const res = await fetch(`${NEON_AUTH_URL}/send-otp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone }),
    })
    const data = await res.json()
    if (!res.ok) return { success: false, error: data.error ?? 'Failed to send OTP' }
    return { success: true }
  } catch {
    return { success: false, error: 'Network error' }
  }
}

export async function verifyOTP(phone: string, otp: string): Promise<{ success: boolean; session?: AuthSession; error?: string }> {
  try {
    const res = await fetch(`${NEON_AUTH_URL}/verify-otp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone, otp }),
    })
    const data = await res.json()
    if (!res.ok) return { success: false, error: data.error ?? 'Invalid OTP' }
    return { success: true, session: data as AuthSession }
  } catch {
    return { success: false, error: 'Network error' }
  }
}
