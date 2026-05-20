import { NextRequest, NextResponse } from 'next/server'
import { getVendorByUserId } from '@/lib/db/vendor'
import { getVendorStats } from '@/lib/db/stats'

export async function GET(req: NextRequest) {
  const session = { user: { id: '1' } } // placeholder
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized', code: 'UNAUTHORIZED' }, { status: 401 })
  }

  try {
    const vendor = await getVendorByUserId(session.user.id)
    if (!vendor) return NextResponse.json({ error: 'Vendor not found', code: 'NOT_FOUND' }, { status: 404 })

    const { searchParams } = req.nextUrl
    const days = Number(searchParams.get('days') ?? '7')
    const stats = await getVendorStats(vendor.id, days)

    return NextResponse.json({ stats })
  } catch (error) {
    console.error('[GET /api/vendor/stats]', error)
    return NextResponse.json({ error: 'Internal server error', code: 'INTERNAL_ERROR' }, { status: 500 })
  }
}
