import productController from "@/controllers/product.controller";
import type { FastifyInstance } from "fastify";

export default async function productRoutes(fastify: FastifyInstance) {
  fastify.get("/", productController.getAllProductHandler);
  fastify.post("/register", productController.registerHandler);

  // must bind the controller due to Fastify having issues when handling class method
  fastify.patch("/update/:id", productController.updateHandler.bind(productController));
  fastify.delete("/delete/:id", productController.deleteHandler.bind(productController));
  fastify.get("/:id", productController.getProductHandler.bind(productController));
}
