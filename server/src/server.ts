import Fastify from "fastify";
import authRoutes from "./routes/auth.route";
import productRoutes from "./routes/product.route";

const fastify = Fastify({
  logger: false,
});

// Register routes
fastify.register(authRoutes, { prefix: "/api/v1/auth" });
fastify.register(productRoutes, { prefix: "/api/v1/product" });

fastify.get("/", function (request, reply) {
  reply.send({ hello: "world" });
});

const start = async () => {
  try {
    await fastify.listen({ port: 3000 });
    console.log("Server running at http://localhost:3000");
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};

start();
