import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { connectDB } from "@/lib/mongodb";
import Siswa from "@/models/Siswa";
import Guru from "@/models/Guru";
import Kelas from "@/models/Kelas";
import MataPelajaran from "@/models/MataPelajaran";
import AktivitasGuru from "@/models/AktivitasGuru";
import AktivitasSiswa from "@/models/AktivitasSiswa";

// Awal hari ini menurut waktu Indonesia Barat (WIB, UTC+7)
function awalHariWIB(): Date {
  const sekarang = new Date();
  const wib = new Date(sekarang.getTime() + 7 * 60 * 60 * 1000);
  const utcMidnight = Date.UTC(wib.getUTCFullYear(), wib.getUTCMonth(), wib.getUTCDate());
  return new Date(utcMidnight - 7 * 60 * 60 * 1000);
}

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  await connectDB();
  const awal = awalHariWIB();

  const [siswa, guru, kelas, mapel, aktivitasGuru, aktivitasSiswa] = await Promise.all([
    Siswa.countDocuments(),
    Guru.countDocuments(),
    Kelas.countDocuments(),
    MataPelajaran.countDocuments(),
    AktivitasGuru.countDocuments({ createdAt: { $gte: awal } }),
    AktivitasSiswa.countDocuments({ createdAt: { $gte: awal } }),
  ]);

  return NextResponse.json({ siswa, guru, kelas, mapel, aktivitasGuru, aktivitasSiswa });
}