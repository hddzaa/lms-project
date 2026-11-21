import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { connectDB } from "@/lib/mongodb";
import Siswa from "@/models/Siswa";
import Guru from "@/models/Guru";
import Kelas from "@/models/Kelas";
import MataPelajaran from "@/models/MataPelajaran";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session || !["kepsek", "kurikulum", "admin"].includes(session.user.role ?? "")) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  await connectDB();
  const [siswa, guru, kelas, mapel] = await Promise.all([
    Siswa.countDocuments(),
    Guru.countDocuments(),
    Kelas.countDocuments(),
    MataPelajaran.countDocuments(),
  ]);

  return NextResponse.json({ siswa, guru, kelas, mapel });
}