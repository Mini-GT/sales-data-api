import saleController from "@/controllers/sale.controller";
import type { FastifyInstance } from "fastify";

export default async function saleRoutes(fastify: FastifyInstance) {
  fastify.get("/", saleController.getMonthlySalesHandler.bind(saleController));
  fastify.post("/", saleController.createSaleHandler.bind(saleController));
  fastify.get("/:saleId", saleController.getSaleHandler.bind(saleController));
  fastify.delete("/delete/:saleId", saleController.deleteSaleHandler.bind(saleController));
}
