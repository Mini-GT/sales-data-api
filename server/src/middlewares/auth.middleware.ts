import { prisma } from "@/lib/prisma";
import { TOKEN_JWT_SECRET, verifyJwt } from "@/utils/jwt";
import { type FastifyReply, type FastifyRequest } from "fastify";
import { jwtDecode } from "jwt-decode";

export interface DecodedToken {
  id: string;
  exp: number;
}

/**
 * Middleware for private routes
 * Validates token and sets user as request
 */
export default async function authMiddleware(request: FastifyRequest, reply: FastifyReply) {
  const accessToken = request.cookies.accessToken;

  if (!accessToken) {
    return reply.status(401).send({ message: "No access token" });
  }

  try {
    // check if token is expired
    const { exp } = jwtDecode<DecodedToken>(accessToken);

    if (exp * 1000 <= Date.now()) {
      return reply.status(401).clearCookie("accessToken").send({ message: "Token expired" });
    }

    // if not expired, decode token
    const decoded = verifyJwt(accessToken, TOKEN_JWT_SECRET) as DecodedToken;

    const user = await prisma.customer.findUnique({ where: { customerId: Number(decoded.id) } });

    if (!user) return reply.status(401).send({ message: "User not found" });

    request.user = user;
  } catch (error) {
    return reply.status(401).send({ message: "Invalid token" });
  }
}

/**
 * Middleware for private action routes i.e POST, PUT/PATCH, DELETE
 * Validates if user is allowed to do the action
 */
export async function actionAuth(request: FastifyRequest, reply: FastifyReply) {
  const user = request.user;

  if (user.role === "USER" || user.role === "DEMO") {
    return reply.status(403).send({ message: "Action Not allowed" });
  }
}
