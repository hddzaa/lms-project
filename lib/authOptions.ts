import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcrypt";
import { connectDB } from "@/lib/mongodb";
import Admin from "@/models/Admin";
import Guru from "@/models/Guru";
import type { NextAuthOptions } from "next-auth";

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        role: { label: "Role", type: "text" },
        username: { label: "Username", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.username || !credentials?.password || !credentials?.role) return null;
        await connectDB();

        if (credentials.role === "admin") {
          const admin = await Admin.findOne({ username: credentials.username });
          if (!admin) return null;
          const isValid = await bcrypt.compare(credentials.password, admin.password);
          if (!isValid) return null;
          return { id: admin._id.toString(), name: admin.nama, username: admin.username, role: "admin" };
        }

        if (credentials.role === "guru") {
          const guru = await Guru.findOne({ nip: credentials.username });
          if (!guru) return null;
          const isValid = await bcrypt.compare(credentials.password, guru.password);
          if (!isValid) return null;
          return { id: guru._id.toString(), name: guru.nama, username: guru.nip, role: "guru", mapel: guru.mapel };
        }

        return null;
      },
    }),
  ],
  session: { strategy: "jwt" },
  pages: { signIn: "/login" },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = (user as any).role;
        token.username = (user as any).username;
        token.mapel = (user as any).mapel;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).id = token.sub;
        (session.user as any).role = token.role;
        (session.user as any).username = token.username;
        (session.user as any).mapel = token.mapel;
      }
      return session;
    },
  },
};