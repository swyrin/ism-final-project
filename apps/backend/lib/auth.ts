import prisma from "@ism/prisma";
import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";

export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),
  emailAndPassword: {
    enabled: true,
  },
  trustedOrigins: [process.env.FE_ORIGIN ?? "http://localhost:5173"],
});
async function ensureTestUser() {
  const existing = await prisma.user.findUnique({
    where: { email: "test@example.com" },
  });

  if (!existing) {
    await auth.api.signUpEmail({
      body: {
        email: "test@example.com",
        password: "12345678",
        name: "Test User",
      },
    });
  }
}

ensureTestUser();
