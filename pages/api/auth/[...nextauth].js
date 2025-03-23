import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { Redis } from "@upstash/redis";
import fetch from "node-fetch"; // <-- Required for server-side fetch in Node

// Redis client using environment variables
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

        console.log("Credentials received:", credentials);

        const user = users.find(
          (u) =>
            u.username === credentials.username &&
            u.password === credentials.password
        );

        if (!user) {
          console.log("Invalid credentials");
          return null;
        }

        const mfaRequired = await redis.get(`mfa:${user.username}`);
        console.log("MFA Required:", mfaRequired);

        if (mfaRequired) {
          if (!credentials.mfaToken) {
            console.log("Missing MFA token");
            throw new Error("MFA required");
          }

          try {
            const response = await fetch(
              `${process.env.NEXTAUTH_URL}/api/verify-mfa`,
              {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  username: user.username,
                  token: credentials.mfaToken,
                }),
              }
            );

            if (!response.ok) {
              const errorText = await response.text();
              console.log("MFA verification failed:", errorText);
              throw new Error("MFA verification failed");
            }
          } catch (err) {
            console.log("MFA fetch error:", err.message);
            throw new Error("MFA verification failed");
          }
        }

        console.log("User authenticated:", user.username);
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