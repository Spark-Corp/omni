import { NextRequest, NextResponse } from 'next/server'
import { getConversationById, sendMessage } from '@/lib/db/conversation'
import { SendMessageSchema } from '@/lib/validations/message'

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const session = { user: { id: '1' } } // placeholder
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized', code: 'UNAUTHORIZED' }, { status: 401 })
  }

  const body = await req.json().catch(() => null)
  if (!body) {
    return NextResponse.json({ error: 'Invalid request body', code: 'INVALID_BODY' }, { status: 400 })
  }

  const parsed = SendMessageSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Validation failed', code: 'VALIDATION_ERROR', details: parsed.error.flatten() },
      { status: 400 }
    )
  }

  try {
    const conversation = await getConversationById(params.id)
    if (!conversation) {
      return NextResponse.json({ error: 'Not found', code: 'NOT_FOUND' }, { status: 404 })
    }

    const message = await sendMessage({
      conversationId: params.id,
      senderId: session.user.id,
      senderType: 'buyer',
      content: parsed.data.content,
    })
    return NextResponse.json({ message }, { status: 201 })
  } catch (error) {
    console.error('[POST /api/conversations/[id]/messages]', error)
    return NextResponse.json({ error: 'Internal server error', code: 'INTERNAL_ERROR' }, { status: 500 })
  }
}
