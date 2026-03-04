import saleController from "@/controllers/sale.controller";
import authMiddleware, { actionAuth } from "@/middlewares/auth.middleware";
import type { FastifyInstance } from "fastify";

export default async function saleRoutes(fastify: FastifyInstance) {
  fastify.get(
    "/",
    { preHandler: [authMiddleware, actionAuth] },
    saleController.getMonthlySalesHandler.bind(saleController),
  );
  fastify.post(
    "/",
    { preHandler: authMiddleware },
    saleController.createSaleHandler.bind(saleController),
  );
  fastify.get(
    "/:saleId",
    { preHandler: [authMiddleware, actionAuth] },
    saleController.getSaleHandler.bind(saleController),
  );
  fastify.delete(
    "/delete/:saleId",
    { preHandler: [authMiddleware, actionAuth] },
    saleController.deleteSaleHandler.bind(saleController),
  );
}
