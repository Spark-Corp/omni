import Groq from 'groq-sdk'

const GROQ_API_KEY = process.env.GROQ_API_KEY ?? ''
const GROQ_MODEL = process.env.GROQ_MODEL ?? 'llama-3.3-70b-versatile'

const groq = new Groq({ apiKey: GROQ_API_KEY })

export async function generateResponse(systemPrompt: string, userMessage: string): Promise<{ content: string; model: string; responseTimeMs: number }> {
  if (!GROQ_API_KEY) {
    return { content: '⚡ Le vendeur n\'est pas disponible pour le moment. Veuillez réessayer plus tard.', model: '', responseTimeMs: 0 }
  }

  const start = Date.now()
  const completion = await groq.chat.completions.create({
    model: GROQ_MODEL,
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userMessage },
    ],
    temperature: 0.3,
    max_tokens: 300,
  })

  const content = completion.choices[0]?.message?.content ?? 'Désolé, je n\'ai pas pu traiter votre demande.'
  const responseTimeMs = Date.now() - start

  return { content, model: GROQ_MODEL, responseTimeMs }
}
