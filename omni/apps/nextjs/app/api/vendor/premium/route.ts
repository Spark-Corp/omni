import { NextRequest, NextResponse } from 'next/server'
import { getVendorByUserId, updateVendor } from '@/lib/db/vendor'

export async function POST(req: NextRequest) {
  const session = { user: { id: '1' } } // placeholder
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized', code: 'UNAUTHORIZED' }, { status: 401 })
  }

  try {
    const vendor = await getVendorByUserId(session.user.id)
    if (!vendor) return NextResponse.json({ error: 'Vendor not found', code: 'NOT_FOUND' }, { status: 404 })

    if (vendor.premiumEnabled) {
      return NextResponse.json({ error: 'Premium already active', code: 'PREMIUM_ACTIVE' }, { status: 409 })
    }

    const trialEnd = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000)
    const updated = await updateVendor(vendor.id, {
      premiumEnabled: true,
      aiTrialEndsAt: trialEnd,
    })

    return NextResponse.json({ vendor: updated })
  } catch (error) {
    console.error('[POST /api/vendor/premium]', error)
    return NextResponse.json({ error: 'Internal server error', code: 'INTERNAL_ERROR' }, { status: 500 })
  }
}
