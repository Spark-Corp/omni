import { createNeonAuth } from "@neondatabase/auth/next";

export const { handlers, auth, signIn, signUp, signOut } = createNeonAuth({
  baseUrl: process.env.NEON_AUTH_URL!,
  cookies: {
    secret: process.env.AUTH_SECRET!,
  },
});