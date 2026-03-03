import Fastify from "fastify";
import authRoutes from "./routes/auth.route";

const fastify = Fastify({
  logger: false,
});

// Register routes
fastify.register(authRoutes, { prefix: "/api/v1" });

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
