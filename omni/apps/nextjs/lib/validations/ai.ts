import { z } from 'zod'

export const AIToggleSchema = z.object({
  aiMode: z.enum(['manual', 'auto_respond']),
})

export type AIToggleInput = z.infer<typeof AIToggleSchema>
