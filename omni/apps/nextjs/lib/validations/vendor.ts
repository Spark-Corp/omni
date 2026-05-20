import { z } from 'zod'

export const CreateVendorSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100),
  category: z.string().min(1, 'Category is required'),
  description: z.string().max(280).optional(),
  phone: z.string().min(1, 'Phone is required'),
  address: z.string().optional(),
  neighborhood: z.string().optional(),
  location: z.object({
    lat: z.number().min(-90).max(90),
    lng: z.number().min(-180).max(180),
  }),
})

export const UpdateVendorSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  category: z.string().optional(),
  description: z.string().max(280).optional(),
  address: z.string().optional(),
  neighborhood: z.string().optional(),
})

export const ToggleStatusSchema = z.object({
  isOnline: z.boolean(),
})

export const NearbyQuerySchema = z.object({
  lat: z.coerce.number().min(-90).max(90),
  lng: z.coerce.number().min(-180).max(180),
  radius: z.coerce.number().min(100).max(50000).default(5000),
  category: z.string().optional(),
})

export type CreateVendorInput = z.infer<typeof CreateVendorSchema>
export type UpdateVendorInput = z.infer<typeof UpdateVendorSchema>
export type NearbyQuery = z.infer<typeof NearbyQuerySchema>
