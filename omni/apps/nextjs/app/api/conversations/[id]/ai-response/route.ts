import { NextRequest, NextResponse } from 'next/server'
import { getConversationById, sendMessage } from '@/lib/db/conversation'
import { getProductsByVendor } from '@/lib/db/product'
import { getVendorById } from '@/lib/db/vendor'
import { generateResponse } from '@/lib/ai/groq'
import { buildSystemPrompt } from '@/lib/ai/prompt'
import { storeAIResponse } from '@/lib/db/ai'

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const session = { user: { id: '1', role: 'vendor' } } // placeholder
  if (!session?.user || session.user.role !== 'vendor') {
    return NextResponse.json({ error: 'Forbidden', code: 'FORBIDDEN' }, { status: 403 })
  }

  try {
    const conversation = await getConversationById(params.id)
    if (!conversation) {
      return NextResponse.json({ error: 'Not found', code: 'NOT_FOUND' }, { status: 404 })
    }

    const vendor = await getVendorById(conversation.vendorId)
    if (!vendor) {
      return NextResponse.json({ error: 'Vendor not found', code: 'NOT_FOUND' }, { status: 404 })
    }

    if (!vendor.premiumEnabled) {
      return NextResponse.json({ error: 'AI requires premium', code: 'AI_REQUIRES_PREMIUM' }, { status: 402 })
    }

    const products = await getProductsByVendor(conversation.vendorId)
    const systemPrompt = buildSystemPrompt(vendor.name, products)
    const userMessage = conversation.requestId ?? 'Bonjour, je voudrais connaître vos disponibilités.'

    const { content, model, responseTimeMs } = await generateResponse(systemPrompt, userMessage)

    const message = await sendMessage({
      conversationId: params.id,
      senderId: session.user.id,
      senderType: 'ai',
      content,
    })

    const aiResp = await storeAIResponse({
      messageId: message.id,
      vendorId: conversation.vendorId,
      groqModel: model,
      responseTimeMs,
    })

    return NextResponse.json({ message, aiResponse: aiResp })
  } catch (error) {
    console.error('[POST /api/conversations/[id]/ai-response]', error)
    return NextResponse.json({ error: 'Groq unavailable', code: 'GROQ_UNAVAILABLE' }, { status: 503 })
  }
}
