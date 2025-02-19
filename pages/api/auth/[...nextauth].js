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
          { id: "1", username: "admin", password: "password123" },
          { id: "2", username: "user", password: "userpass" },
        ];

        const user = users.find(
          (u) => u.username === credentials.username && u.password === credentials.password
        );

        if (user) return user;
        return null;
      },
    }),
  ],
  secret: process.env.NEXTAUTH_SECRET,
});
