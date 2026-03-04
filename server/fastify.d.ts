import type { Customer } from "../../generated/prisma/client";

// Custom type for request
declare module "fastify" {
  export interface FastifyRequest {
    user: Customer;
  }
}
