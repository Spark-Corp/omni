import { NextRequest, NextResponse } from 'next/server'
import { getConversationsByUser } from '@/lib/db/conversation'

export async function GET(req: NextRequest) {
  const session = { user: { id: '1' } } // placeholder
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized', code: 'UNAUTHORIZED' }, { status: 401 })
  }

  try {
    const conversations = await getConversationsByUser(session.user.id)
    return NextResponse.json({ conversations, total: conversations.length })
  } catch (error) {
    console.error('[GET /api/conversations]', error)
    return NextResponse.json({ error: 'Internal server error', code: 'INTERNAL_ERROR' }, { status: 500 })
  }
}
