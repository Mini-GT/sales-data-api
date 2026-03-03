import authController from "@/controllers/auth.controller";
import type { FastifyInstance } from "fastify";

export default async function authRoutes(fastify: FastifyInstance) {
  fastify.post("/login", authController.loginHandler);
  fastify.post("/register", authController.registerHandler);
  fastify.delete("/logout", authController.logoutHandler);
}
