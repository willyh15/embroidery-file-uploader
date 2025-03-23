import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { Redis } from "@upstash/redis";

const redis = new Redis({
  url: process.env.KV_REST_API_URL,
  token: process.env.KV_REST_API_TOKEN,
});

export default NextAuth({
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        username: { label: "Username", type: "text" },
        password: { label: "Password", type: "password" },
        mfaToken: { label: "MFA Token", type: "text", optional: true },
      },
      async authorize(credentials) {
        const users = [
          { id: "1", username: "admin", password: "password123", role: "admin" },
          { id: "2", username: "user", password: "userpass", role: "user" },
        ];

        const user = users.find(
          (u) => u.username === credentials.username && u.password === credentials.password
        );

        if (!user) return null;

        const mfaRequired = await redis.get(`mfa:${user.username}`);
        if (mfaRequired) {
          if (!credentials.mfaToken) {
            throw new Error("MFA required");
          }
          const verify = await fetch(`${process.env.NEXTAUTH_URL}/api/verify-mfa`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              username: user.username,
              token: credentials.mfaToken,
            }),
          });
          if (!verify.ok) {
            throw new Error("Invalid MFA code");
          }
        }

        return user;
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) token.role = user.role;
      return token;
    },
    async session({ session = {}, token = {} }) {
      return {
        ...session,
        user: {
          ...session.user,
          role: token.role || "user",
        },
      };
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
});