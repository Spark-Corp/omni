import { NextRequest, NextResponse } from 'next/server'
import { getConversationById, getMessagesByConversation } from '@/lib/db/conversation'

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const session = { user: { id: '1' } } // placeholder
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized', code: 'UNAUTHORIZED' }, { status: 401 })
  }

  try {
    const conversation = await getConversationById(params.id)
    if (!conversation) {
      return NextResponse.json({ error: 'Not found', code: 'NOT_FOUND' }, { status: 404 })
    }

    const { searchParams } = req.nextUrl
    const cursor = searchParams.get('cursor') ?? undefined
    const limit = Number(searchParams.get('limit') ?? '50')
    const messages = await getMessagesByConversation(params.id, limit, cursor)

    return NextResponse.json({ conversation, messages })
  } catch (error) {
    console.error('[GET /api/conversations/[id]]', error)
    return NextResponse.json({ error: 'Internal server error', code: 'INTERNAL_ERROR' }, { status: 500 })
  }
}
