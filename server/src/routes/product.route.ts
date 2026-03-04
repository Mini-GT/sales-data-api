import productController from "@/controllers/product.controller";
import authMiddleware, { actionAuth } from "@/middlewares/auth.middleware";
import type { FastifyInstance } from "fastify";

export default async function productRoutes(fastify: FastifyInstance) {
  fastify.get("/", productController.getAllProductHandler);
  fastify.post(
    "/register",
    { preHandler: [authMiddleware, actionAuth] },
    productController.registerHandler,
  );

  // must bind the controller due to Fastify having issues when handling class method
  fastify.patch(
    "/update/:productId",
    { preHandler: [authMiddleware, actionAuth] },
    productController.updateHandler.bind(productController),
  );
  fastify.delete(
    "/delete/:productId",
    { preHandler: [authMiddleware, actionAuth] },
    productController.deleteHandler.bind(productController),
  );
  fastify.get("/:productId", productController.getProductHandler.bind(productController));
}
