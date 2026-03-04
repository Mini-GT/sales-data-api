import fp from "fastify-plugin";
import type { FastifyInstance } from "fastify";

// Docs: https://fastify.dev/docs/latest/Reference/Decorators/
export default fp(async (fastify: FastifyInstance) => {
  fastify.decorateRequest("user", "");
});
