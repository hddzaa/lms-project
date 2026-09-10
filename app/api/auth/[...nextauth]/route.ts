import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcrypt";
import { connectDB } from "@/lib/mongodb";
import Admin from "@/models/Admin";

const handler = NextAuth({
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        username: { label: "Username", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.username || !credentials?.password) return null;

        console.log(`[LOGIN ATTEMPT] username: ${credentials.username}, waktu: ${new Date().toLocaleString()}`);

        await connectDB();
        const admin = await Admin.findOne({ username: credentials.username });

        if (!admin) {
            console.log(`[LOGIN GAGAL] Username "${credentials.username}" tidak ditemukan di database`);
            return null;
        } 

        const isValid = await bcrypt.compare(credentials.password, admin.password);

        if (!isValid) {
            console.log(`[LOGIN GAGAL] Password salah untuk username "${credentials.username}"`);
            return null;
        }

        console.log(`[LOGIN BERHASIL] ${admin.nama} (${admin.username}) berhasil masuk`);

        return {
          id: admin._id.toString(),
          name: admin.nama,
          username: admin.username,
          role: "admin",
        };
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
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).role = token.role;
        (session.user as any).username = token.username;
      }
      return session;
    },
  },
});

export { handler as GET, handler as POST };