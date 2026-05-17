import { z } from 'zod'

export const CreateRequestSchema = z.object({
  vendorId: z.string().uuid(),
  productQuery: z.string().min(1, 'Product query is required').max(500),
  message: z.string().max(1000).optional(),
})

export const RespondRequestSchema = z.object({
  status: z.enum(['yes', 'no']),
  message: z.string().max(1000).optional(),
})

export type CreateRequestInput = z.infer<typeof CreateRequestSchema>
