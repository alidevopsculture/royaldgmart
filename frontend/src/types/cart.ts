import { z } from "zod"

const cartItem = z.object({
  _id: z.string(),
  product: z.object({
    _id: z.string(),
    name: z.string().min(3),
    description: z.string().min(5),
    price: z.number(),
    images: z.array(z.string()),
    category: z.string().optional(),
  }),
  quantity: z.number().min(1),
  size: z.string().nullable(),
  purchasePrice: z.number(),
  totalPrice: z.number(),
})

const cart = z.object({
  _id: z.string(),
  user: z.string(),
  products: z.array(cartItem),
  createdAt: z.string(),
  updatedAt: z.string(),
  calculations: z.object({
    subtotal: z.number(),
    discount: z.number(),
    discountPercentage: z.number(),
    tax: z.number(),
    taxPercentage: z.number(),
    total: z.number(),
  }).optional(),
})

export type CartItem = z.infer<typeof cartItem>
export type Cart = z.infer<typeof cart>