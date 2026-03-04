import { prisma } from "@/lib/prisma";
import { loginSchema, registerSchema } from "@/schemas/auth.schema";
import { signJwt, TOKEN_JWT_SECRET } from "@/utils/jwt";
import bcrypt from "bcryptjs";
import type { FastifyReply, FastifyRequest } from "fastify";
import z from "zod";

class AuthController {
  /**
   * POST /auth/login
   * Validates input and sets cookie with an access token
   */
  async loginHandler(request: FastifyRequest, reply: FastifyReply) {
    try {
      const result = await loginSchema.safeParseAsync(request.body);

      if (!result.success) {
        const flattenedErrors = z.flattenError(result.error);
        return reply.status(400).send({
          emailErr: flattenedErrors.fieldErrors.email?.[0],
          passwordErr: flattenedErrors.fieldErrors.password?.[0],
        });
      }

      const { email, password } = result.data;

      const user = await prisma.customer.findUnique({
        where: {
          email,
        },
      });

      if (!user) {
        return reply.status(401).send({ message: "Invalid email or password" });
      }

      const isPasswordValid = await bcrypt.compare(password, user.password);

      if (!isPasswordValid) {
        return reply.status(401).send({ message: "Invalid email or password" });
      }

      const token = signJwt({ id: user.customerId }, TOKEN_JWT_SECRET, { expiresIn: "7d" });

      reply
        .setCookie("accessToken", token, {
          httpOnly: true,
          sameSite: "strict",
          path: "/",
          secure: process.env.NODE_ENV === "production",
          maxAge: 7 * 24 * 60 * 60, // 7 days
        })
        .send({ message: "User logged in" });
    } catch (error) {
      return reply.status(500).send({ message: "Internal Server Error" });
    }
  }

  /**
   * POST /auth/register
   * Validates and register a single user/customer
   */
  async registerHandler(request: FastifyRequest, reply: FastifyReply) {
    try {
      const result = await registerSchema.safeParseAsync(request.body);

      if (!result.success) {
        const flattenedErrors = z.flattenError(result.error);
        return reply.status(400).send({
          nameErr: flattenedErrors.fieldErrors.name?.[0],
          emailErr: flattenedErrors.fieldErrors.email?.[0],
          passwordErr: flattenedErrors.fieldErrors.password?.[0],
        });
      }

      const { name, email, password } = result.data;

      const existingUser = await prisma.customer.findUnique({
        where: {
          email,
        },
      });

      if (existingUser) {
        return reply.status(400).send({ message: "User already exists" });
      }

      const hashedPassword = await bcrypt.hash(password, 8);

      const user = await prisma.customer.create({
        data: {
          name,
          email,
          password: hashedPassword,
          role: "USER",
        },
      });

      if (!user) {
        reply.status(500).send({ message: "Cannot create an account" });
      }

      reply.status(201).send({ message: "User created" });
    } catch (error) {
      return reply.status(500).send({ message: "Internal Server Error" });
    }
  }

  /**
   * DELETE /auth/logout
   * Removes the access token
   */
  async logoutHandler(request: FastifyRequest, reply: FastifyReply) {
    reply.clearCookie("accessToken").send({ message: "Logged out" });
  }
}

export default new AuthController();
