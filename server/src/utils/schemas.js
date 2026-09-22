import { z } from "zod";

export const registerSchema = z.object({
  body: z.object({
    firstName: z.string().min(2).max(60),
    lastName: z.string().min(2).max(60),
    phone: z.string().min(9).max(20),
    email: z.string().email().optional().or(z.literal("")),
    password: z.string().min(6).max(100),
    wilaya: z.string().optional(),
    commune: z.string().optional(),
    address: z.string().optional(),
  }),
});

export const loginSchema = z.object({
  body: z.object({
    identifier: z.string().min(3), // email ou téléphone
    password: z.string().min(1),
  }),
});

export const categorySchema = z.object({
  body: z.object({
    name: z.string().min(2).max(80),
    description: z.string().max(500).optional(),
    image: z.string().url().optional().or(z.literal("")),
    sortOrder: z.coerce.number().int().default(0),
    isActive: z.coerce.boolean().default(true),
  }),
});

export const productSchema = z.object({
  body: z.object({
    name: z.string().min(2).max(120),
    description: z.string().max(5000).optional(),
    price: z.coerce.number().int().min(0),
    oldPrice: z.coerce.number().int().min(0).optional().nullable(),
    stock: z.coerce.number().int().min(0).default(0),
    categoryId: z.string().optional().nullable(),
    isNew: z.coerce.boolean().default(false),
    isPromo: z.coerce.boolean().default(false),
    isActive: z.coerce.boolean().default(true),
    isFeatured: z.coerce.boolean().default(false),
    images: z.array(z.object({ url: z.string().url(), alt: z.string().optional() })).default([]),
    variants: z.array(z.object({
      size: z.string().max(20).optional(),
      color: z.string().max(40).optional(),
      colorHex: z.string().max(10).optional(),
      stock: z.coerce.number().int().min(0).default(0),
    })).default([]),
  }),
});

export const orderSchema = z.object({
  body: z.object({
    firstName: z.string().min(2).max(60),
    lastName: z.string().min(2).max(60),
    phone: z.string().min(9).max(20),
    email: z.string().email().max(120).optional().or(z.literal("")),
    wilaya: z.string().min(1),
    commune: z.string().min(1),
    address: z.string().min(3),
    notes: z.string().max(1000).optional(),
    items: z.array(z.object({
      productId: z.string(),
      size: z.string().optional(),
      color: z.string().optional(),
      quantity: z.number().int().min(1).max(20),
    })).min(1),
  }),
});

export const statusSchema = z.object({
  body: z.object({
    status: z.enum(["PENDING", "CONFIRMED", "PREPARING", "SHIPPED", "DELIVERED", "CANCELLED"]),
  }),
});

export const contactSchema = z.object({
  body: z.object({
    name: z.string().min(2).max(80),
    phone: z.string().max(20).optional(),
    email: z.string().email().optional().or(z.literal("")),
    subject: z.string().max(120).optional(),
    message: z.string().min(3).max(2000),
  }),
});
