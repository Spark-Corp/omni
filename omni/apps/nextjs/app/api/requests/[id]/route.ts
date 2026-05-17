import { NextRequest, NextResponse } from 'next/server'
import { getRequestById } from '@/lib/db/request'

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const session = { user: { id: '1' } } // placeholder
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized', code: 'UNAUTHORIZED' }, { status: 401 })
  }

  try {
    const request = await getRequestById(params.id)
    if (!request) {
      return NextResponse.json({ error: 'Not found', code: 'NOT_FOUND' }, { status: 404 })
    }
    if (request.buyerId !== session.user.id) {
      return NextResponse.json({ error: 'Forbidden', code: 'FORBIDDEN' }, { status: 403 })
    }
    return NextResponse.json({ request })
  } catch (error) {
    console.error('[GET /api/requests/[id]]', error)
    return NextResponse.json({ error: 'Internal server error', code: 'INTERNAL_ERROR' }, { status: 500 })
  }
}
