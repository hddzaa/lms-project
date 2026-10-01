import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcrypt";
import { connectDB } from "@/lib/mongodb";
import Admin from "@/models/Admin";
import Guru from "@/models/Guru";
import type { NextAuthOptions } from "next-auth";
import Siswa from "@/models/Siswa";

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

        if (credentials.role === "siswa") {
          const siswa = await Siswa.findOne({ nis: credentials.username });
          if (!siswa) return null;
          const isValid = await bcrypt.compare(credentials.password, siswa.password);
          if (!isValid) return null;
          return {
            id: siswa._id.toString(),
            name: siswa.nama,
            username: siswa.nis,
            role: "siswa",
            kelasId: siswa.kelasId.toString(),
          };
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
        token.kelasId = (user as any).kelasId;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).id = token.sub;
        (session.user as any).role = token.role;
        (session.user as any).username = token.username;
        (session.user as any).mapel = token.mapel;
        (session.user as any).kelasId = token.kelasId;
      }
      return session;
    },
  },
};