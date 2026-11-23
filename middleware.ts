import { withAuth } from "next-auth/middleware";

export default withAuth({
  pages: { signIn: "/login" },
});

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/kelas-siswa/:path*",
    "/guru-mapel/:path*",
    "/aktivitas-guru/:path*",
    "/rekap-aktivitas/:path*",
    "/guru/:path*",
    "/siswa/:path*",
    "/kepsek/:path*",
    "/kurikulum/:path*",
  ],
};