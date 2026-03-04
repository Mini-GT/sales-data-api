import { prisma } from "@/lib/prisma";
import {
  createSaleSchema,
  deleteSaleSchema,
  getMonthlySalesSchema,
  getSaleSchema,
} from "@/schemas/sales.schema";
import getFormattedDate from "@/utils/formatDate";

import type { FastifyReply, FastifyRequest } from "fastify";
import { z } from "zod";

class SaleController {
  private async getValidSale(id: string) {
    const sale = await prisma.sale.findUnique({
      where: { saleId: Number(id) },
      select: { productId: true, quantity: true },
    });
    return sale;
  }

  /**
   * GET /sale?year=2025&month=3
   * Optional params `customerId, productId`
   * Returns all sales for a given month
   * Can search sales base on a specific customer or product
   */
  async getMonthlySalesHandler(request: FastifyRequest, reply: FastifyReply) {
    try {
      const result = await getMonthlySalesSchema.safeParseAsync({
        query: request.query,
      });

      if (!result.success) {
        const flattenedErrors = z.flattenError(result.error);
        return reply.status(400).send({
          yearErr: flattenedErrors.fieldErrors.query?.[0],
          monthErr: flattenedErrors.fieldErrors.query?.[1],
          dateErr: flattenedErrors.fieldErrors.query?.[1],
        });
      }

      const { year, month, customerId, productId, page = "1", limit = "20" } = result.data.query;

      const yearNum = Number(year);
      const monthNum = Number(month);
      const pageNum = Math.max(1, Number(page));
      const limitNum = Math.min(100, Math.max(1, Number(limit)));
      const skip = (pageNum - 1) * limitNum;

      // inclusive date range for the requested month
      const startDate = new Date(yearNum, monthNum - 1, 1);
      const endDate = new Date(yearNum, monthNum, 1);

      const where: Record<string, unknown> = {
        createdAt: { gte: startDate, lt: endDate },
      };

      if (customerId) where.customerId = Number(customerId);
      if (productId) where.productId = Number(productId);

      const [total, sales] = await Promise.all([
        prisma.sale.count({ where }),
        prisma.sale.findMany({
          where,
          skip,
          take: limitNum,
          orderBy: { createdAt: "desc" },
          select: {
            saleId: true,
            quantity: true,
            createdAt: true,
            customer: {
              select: { customerId: true, name: true, email: true, role: true },
            },
            product: {
              select: { productId: true, name: true, price: true, category: true },
            },
          },
        }),
      ]);
      const data = sales.map((sale) => ({
        ...sale,
        createdAt: getFormattedDate(sale.createdAt),
        totalPrice: sale.quantity * sale.product.price,
      }));

      return reply.status(200).send({
        total,
        data,
      });
    } catch (error) {
      return reply.status(500).send({ message: "Internal Server Error" });
    }
  }

  /**
   * GET /sale/:saleId
   * Returns a sale/s base on the sale Id
   */
  async getSaleHandler(request: FastifyRequest, reply: FastifyReply) {
    try {
      const result = await getSaleSchema.safeParseAsync({
        params: request.params,
      });

      if (!result.success) {
        const flattenedErrors = z.flattenError(result.error);
        return reply.status(400).send({
          idErr: flattenedErrors.fieldErrors.params?.[0],
        });
      }

      const { saleId } = result.data.params;

      const sale = await prisma.sale.findUnique({
        where: { saleId: Number(saleId) },
        select: {
          saleId: true,
          quantity: true,
          createdAt: true,
          updatedAt: true,
          customer: {
            select: { customerId: true, name: true, email: true, role: true },
          },
          product: {
            select: { productId: true, name: true, price: true, category: true },
          },
        },
      });

      if (!sale) {
        return reply.status(404).send({ message: "Sale not found" });
      }

      return reply.status(200).send({
        ...sale,
        createdAt: getFormattedDate(sale.createdAt),
        totalPrice: sale.quantity * sale.product.price,
      });
    } catch (error) {
      return reply.status(500).send({ message: "Internal Server Error" });
    }
  }

  /**
   * POST /sale
   * Validates quantity, then creates the sale and decrements product quantity.
   */
  async createSaleHandler(request: FastifyRequest, reply: FastifyReply) {
    try {
      const result = await createSaleSchema.safeParseAsync(request.body);

      if (!result.success) {
        const flattenedErrors = z.flattenError(result.error);
        return reply.status(400).send({
          customerIdErr: flattenedErrors.fieldErrors.customerId?.[0],
          productIdErr: flattenedErrors.fieldErrors.productId?.[0],
          quantityErr: flattenedErrors.fieldErrors.quantity?.[0],
        });
      }

      const { customerId, productId, quantity } = result.data;

      const customer = await prisma.customer.findUnique({
        where: { customerId },
        select: { customerId: true },
      });

      if (!customer) {
        return reply.status(404).send({ message: "Customer not found" });
      }

      const product = await prisma.product.findUnique({
        where: { productId },
        select: { productId: true, quantity: true, price: true },
      });

      if (!product) {
        return reply.status(404).send({ message: "Product not found" });
      }

      if (product.quantity < quantity) {
        return reply.status(409).send({
          message: `Insufficient stock. Available: ${product.quantity}, requested: ${quantity}`,
        });
      }

      const [newSale] = await prisma.$transaction([
        prisma.sale.create({
          data: { customerId, productId, quantity },
          select: {
            saleId: true,
            quantity: true,
            createdAt: true,
            customer: { select: { customerId: true, name: true, email: true } },
            product: { select: { productId: true, name: true, price: true, category: true } },
          },
        }),
        prisma.product.update({
          where: { productId: productId },
          data: { quantity: { decrement: quantity } },
        }),
      ]);

      return reply.status(201).send({
        message: "Sale created",
        newSale: {
          ...newSale,
          totalPrice: newSale.quantity * newSale.product.price,
        },
      });
    } catch (error) {
      return reply.status(500).send({ message: "Internal Server Error" });
    }
  }

  /**
   * DELETE /sale/:saleId
   * Deletes the sale and restores the product quantity.
   */
  async deleteSaleHandler(request: FastifyRequest, reply: FastifyReply) {
    try {
      const result = await deleteSaleSchema.safeParseAsync({
        params: request.params,
      });

      if (!result.success) {
        return reply.status(400).send({ message: "Invalid ID" });
      }

      const { saleId } = result.data.params;

      const sale = await this.getValidSale(saleId);

      if (!sale) {
        return reply.status(404).send({ message: "Sale not found" });
      }

      await prisma.$transaction([
        prisma.sale.delete({ where: { saleId: Number(saleId) } }),
        prisma.product.update({
          where: { productId: sale.productId },
          data: { quantity: { increment: sale.quantity } },
        }),
      ]);

      return reply.status(200).send({ message: "Sale deleted" });
    } catch (error) {
      return reply.status(500).send({ message: "Internal Server Error" });
    }
  }
}

export default new SaleController();
