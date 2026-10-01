export { default } from "next-auth/middleware";

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/kelas-siswa/:path*",
    "/guru-mapel/:path*",
    "/aktivitas-guru/:path*",
    "/rekap-aktivitas/:path*",
    "/guru/:path*",
    "/siswa/:path*",
  ],
};