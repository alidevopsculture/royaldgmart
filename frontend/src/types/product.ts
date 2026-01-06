import { z } from "zod";

const productDataGet=z.object({
    products:z.array(
        z.object({
            _id:z.string(),
            name: z.string().min(3),
            description: z.string().min(5),
            price: z.number(),
            category: z.enum(['Sarees', 'Lehenga', 'Suite', 'Gowns', 'Laungery & Garments', 'Thaan kapda', 'Froks']),
            subCategory: z.string(),
            images: z.array(z.string()),
            stockQuantity: z.number().min(0),
            availableSizesColors: z.array(
                z.object({
                    size:z.string(),
                    dimensions:z.string(),
                    colors: z.array(
                        z.object({
                            color: z.string(),
                            combination_price: z.number()
                        })
                    ),
                    stockQuantity:z.number().optional()
                })
            ),
            isAvailable: z.boolean(),
            discountPercentage: z.number().min(0).max(100),
            tags: z.array(z.string()),
            carousel: z.boolean(), // New field
            most_selling_product: z.boolean(),
            isNew: z.boolean().optional(),
            createdAt: z.date(),
            updatedAt: z.date(),
            product_specification: z.object({
                material: z.string(),
                careInstruction: z.string(),
                dimensions: z.string(),
            }
            ),
        })
    ),
    currentPage: z.number(),
    totalPages: z.number(),
    totalProducts: z.number(),
    hasNextPage: z.boolean(),
    hasPrevPage: z.boolean()
})

const productDataPost=z.object({
    name:z.string().min(3),
    description:z.string().min(5),
    price:z.number(),
    category: 
    // z.enum(['Sarees', 'Lehenga', 'Suite', 'Gowns', 'Laungery & Garments', 'Thaan kapda', 'Froks']) || 
    z.string(),
    subCategory:z.string().optional(),
    stockQuantity:z.number().min(0),
    // availableSizesColors: z.array(z.object({
    //     size: z.string(),
    //     colors:z.array(z.object({
    //         color: z.string(),
    //         combination_price: z.number().min(0)
    //     }))
    // })),
    availableSizesColors:z.string(),
    isAvailable:z.boolean(),
    discountPercentage: z.number().min(0).max(100).default(0).optional(),
    tags:z.array(z.string()).optional(),

    carousel: z.boolean().optional(),

    most_selling_product: z.boolean().optional(),

    isNew: z.boolean().optional(),

    product_specification: z.object({
        material: z.string(),
        careInstruction: z.string(),
        // dimensions: z.string(),
    }).optional(),
    
    taxRate: z.number().min(0).max(100).optional(),
    shippingCharges: z.number().min(0).optional(),
})

const individualProduct= z.object({
    _id:z.string(),
    name: z.string().min(3),
    description: z.string().min(5),
    price: z.number(),
    category: z.enum(['Sarees', 'Lehenga', 'Suite', 'Gowns', 'Laungery & Garments', 'Thaan kapda', 'Froks']),
    subCategory: z.string(),
    images: z.array(z.string()),
    stockQuantity: z.number().min(0),
    availableSizesColors: z.array(
        z.object({
            size:z.string(),
            dimensions:z.string(),
            colors: z.array(
                z.object({
                    color: z.string(),
                    combination_price: z.number()
                })
            ),
            stockQuantity:z.number().optional()
        })
    ),
    isAvailable: z.boolean(),
    discountPercentage: z.number().min(0).max(100),
    tags: z.array(z.string()),
    carousel: z.boolean(), // New field
    most_selling_product: z.boolean(),
    isNew: z.boolean().optional(),
    createdAt: z.date(),
    updatedAt: z.date(),
    product_specification: z.object({
        material: z.string(),
        careInstruction: z.string(),
        dimensions: z.string(),
    }
    ),
})

export type productDataPosting=z.infer<typeof productDataPost>

export type productDataGetting=z.infer<typeof productDataGet>

export type productData=z.infer<typeof individualProduct>