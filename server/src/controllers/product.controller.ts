import { prisma } from "@/lib/prisma";
import {
  deleteProductSchema,
  getProductSchema,
  registerProductSchema,
  updateProductSchema,
} from "@/schemas/product.schema";
import type { FastifyReply, FastifyRequest } from "fastify";
import z from "zod";

class ProductController {
  private async getValidProduct(id: string) {
    const product = await prisma.product.findUnique({
      where: { id: Number(id) },
    });
    return product;
  }

  async getProductHandler(request: FastifyRequest, reply: FastifyReply) {
    try {
      const result = await getProductSchema.safeParseAsync({
        params: request.params,
      });
      if (!result.success) {
        const flattenedErrors = z.flattenError(result.error);
        return reply.status(400).send({
          id: flattenedErrors.fieldErrors.params,
        });
      }

      const { id } = result.data.params;

      const product = await this.getValidProduct(id);

      if (!product) {
        return reply.status(404).send({ message: "Product not found" });
      }

      return reply.status(200).send({ product });
    } catch (error: any) {
      return reply.status(500).send({ message: "Internal Server Error" });
    }
  }

  async registerHandler(request: FastifyRequest, reply: FastifyReply) {
    try {
      const result = await registerProductSchema.safeParseAsync(request.body);

      if (!result.success) {
        const flattenedErrors = z.flattenError(result.error);
        return reply.status(400).send({
          nameErr: flattenedErrors.fieldErrors.name?.[0],
          priceErr: flattenedErrors.fieldErrors.price?.[0],
          quantityErr: flattenedErrors.fieldErrors.quantity?.[0],
        });
      }

      const { name, price, quantity } = result.data;

      const newProduct = await prisma.product.create({
        data: {
          name,
          price: price,
          quantity: quantity,
        },
      });

      return reply.status(201).send({ message: "Added a new product", newProduct });
    } catch (error) {
      return reply.status(500).send({ message: "Internal Server Error", error });
    }
  }

  async updateHandler(request: FastifyRequest, reply: FastifyReply) {
    try {
      const result = await updateProductSchema.safeParseAsync({
        params: request.params,
        body: request.body,
      });

      if (!result.success) {
        const flattenedErrors = z.flattenError(result.error);
        return reply.status(400).send({
          params: flattenedErrors.fieldErrors.params?.[0],
          body: flattenedErrors.fieldErrors.body?.[0],
        });
      }

      const { params, body } = result.data;

      const product = await this.getValidProduct(params.id);

      if (!product) {
        return reply.status(404).send({ message: "Product not found" });
      }

      const updated = await prisma.product.update({
        where: { id: Number(params.id) },
        data: body,
      });

      return reply.status(200).send({ updated });
    } catch (error: any) {
      return reply.status(500).send({ message: "Internal Server Error" });
    }
  }

  async deleteHandler(request: FastifyRequest, reply: FastifyReply) {
    try {
      const result = await deleteProductSchema.safeParseAsync({ params: request.params });

      if (!result.success) {
        return reply.status(400).send({ message: "Invalid ID" });
      }

      const { id } = result.data.params;

      const product = await this.getValidProduct(id);

      if (!product) {
        return reply.status(404).send({ message: "Product not found" });
      }

      await prisma.product.delete({
        where: { id: Number(id) },
      });

      return reply.status(200).send({ message: "Product deleted" });
    } catch (error: any) {
      return reply.status(500).send({ message: "Internal Server Error" });
    }
  }
}

export default new ProductController();
