import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

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
