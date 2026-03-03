import { z } from "zod";

export const productIdParamSchema = z.object({
  id: z.string().min(1, "ID is required in URL"),
});

export const registerProductSchema = z.object({
  name: z.string().min(3, "Name must be at least 3 characters"),
  price: z.number(),
  quantity: z.number(),
});

export const updateProductSchema = z.object({
  params: productIdParamSchema,
  body: registerProductSchema.partial(),
});

export const getProductSchema = z.object({
  params: productIdParamSchema,
});

export const deleteProductSchema = z.object({
  params: productIdParamSchema,
});

export type getInput = z.infer<typeof getProductSchema>;
export type RegisterInput = z.infer<typeof registerProductSchema>;
export type UpdateInput = z.infer<typeof updateProductSchema>;
export type DeleteInput = z.infer<typeof deleteProductSchema>;
