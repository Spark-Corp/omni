import { z } from 'zod'

export const SendMessageSchema = z.object({
  content: z.string().min(1, 'Message is required').max(2000),
})

export type SendMessageInput = z.infer<typeof SendMessageSchema>
