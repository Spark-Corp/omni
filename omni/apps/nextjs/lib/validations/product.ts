import { z } from 'zod'

export const CreateProductSchema = z.object({
  name: z.string().min(1, 'Name is required').max(200),
  price: z.coerce.number().positive('Price must be greater than 0'),
  unit: z.string().default('pièce'),
  description: z.string().max(280).optional(),
  currency: z.string().default('XOF'),
})

export const UpdateProductSchema = z.object({
  name: z.string().min(1).max(200).optional(),
  price: z.coerce.number().positive('Price must be greater than 0').optional(),
  unit: z.string().optional(),
  description: z.string().max(280).optional(),
  isAvailable: z.boolean().optional(),
})

export const ProductSearchSchema = z.object({
  query: z.string().min(1),
  lat: z.coerce.number().min(-90).max(90),
  lng: z.coerce.number().min(-180).max(180),
  radius: z.coerce.number().min(100).max(50000).default(5000),
})

export type CreateProductInput = z.infer<typeof CreateProductSchema>
export type UpdateProductInput = z.infer<typeof UpdateProductSchema>
