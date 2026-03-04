import { z } from "zod";

export const saleIdParamSchema = z.object({
  saleId: z
    .string()
    .min(1, "ID is required in URL")
    .refine((val) => !isNaN(Number(val)), { message: "ID must be a number" }),
});

export const getMonthlySalesSchema = z.object({
  query: z.object({
    year: z.string("Year is required").regex(/^\d{4}$/, "Year must be a 4-digit number"),
    month: z
      .string("Month is required")
      .regex(/^([1-9]|1[0-2])$/, "Month must be between 1 and 12"),
    customerId: z.string().optional(),
    productId: z.string().optional(),
    page: z.string().optional(),
    limit: z.string().optional(),
  }),
});

export const getSaleSchema = z.object({
  params: saleIdParamSchema,
});

export const createSaleSchema = z.object({
  customerId: z
    .number("Customer ID is required")
    .int()
    .positive("Customer ID must be a positive number"),
  productId: z
    .number("Product ID is required")
    .int()
    .positive("Product ID must be a positive number"),
  quantity: z.number().int().positive("Quantity must be at least 1").default(1),
});

export const deleteSaleSchema = z.object({
  params: saleIdParamSchema,
});
