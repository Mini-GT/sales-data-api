import productController from "@/controllers/product.controller";
import type { FastifyInstance } from "fastify";

export default async function productRoutes(fastify: FastifyInstance) {
  // must bind the controller due to Fastify having issues when handling class method
  fastify.get("/:id", productController.getProductHandler.bind(productController));
  fastify.post("/register", productController.registerHandler);
  fastify.patch("/update/:id", productController.updateHandler.bind(productController));
  fastify.delete("/delete/:id", productController.deleteHandler.bind(productController));
}
