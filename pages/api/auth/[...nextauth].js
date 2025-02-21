import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

const userMfaEnabled = await kv.get(`mfa:${user.username}`);
if (userMfaEnabled && !req.body.mfaToken) {
  return res.status(403).json({ error: "MFA required" });
}

if (userMfaEnabled) {
  const verifyResponse = await fetch("/api/verify-mfa", {
    method: "POST",
    body: JSON.stringify({ username: user.username, token: req.body.mfaToken }),
  });

  if (!verifyResponse.ok) {
    return res.status(403).json({ error: "MFA verification failed" });
  }
}

const user2FAEnabled = await kv.get(`2fa:${user.username}`);
if (user2FAEnabled && !req.body.mfaToken) {
  return res.status(403).json({ error: "2FA required" });
}

if (user2FAEnabled) {
  const verifyResponse = await fetch("/api/verify-2fa", {
    method: "POST",
    body: JSON.stringify({ username: user.username, token: req.body.mfaToken }),
  });

  if (!verifyResponse.ok) {
    return res.status(403).json({ error: "2FA verification failed" });
  }
}



export default NextAuth({
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        username: { label: "Username", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const users = [
          { id: "1", username: "admin", password: "password123", role: "admin" },
          { id: "2", username: "user", password: "userpass", role: "user" },
        ];

        const user = users.find(
          (u) => u.username === credentials.username && u.password === credentials.password
        );

        if (user) return user;
        return null;
      },
    }),
  ],
  callbacks: {
    async session({ session, token }) {
      session.user.role = token.role;
      return session;
    },
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role;
      }
      return token;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
});
