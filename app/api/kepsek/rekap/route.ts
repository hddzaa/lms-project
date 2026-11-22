import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { connectDB } from "@/lib/mongodb";
import AktivitasGuru from "@/models/AktivitasGuru";
import AktivitasSiswa from "@/models/AktivitasSiswa";
import Guru from "@/models/Guru";
import Siswa from "@/models/Siswa";
import "@/models/Kelas";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session || !["kepsek", "kurikulum", "admin"].includes(session.user.role ?? "")) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  await connectDB();

  const [ag, as, guru, siswa] = await Promise.all([
    AktivitasGuru.find().populate("guruId", "nama nip").sort({ createdAt: -1 }).lean(),
    AktivitasSiswa.find()
      .populate({ path: "siswaId", select: "nama nis kelasId", populate: { path: "kelasId", select: "grade name" } })
      .sort({ createdAt: -1 })
      .lean(),
    Guru.find().select("nama").sort({ nama: 1 }).lean(),
    Siswa.find().select("nama").sort({ nama: 1 }).lean(),
  ]);

  return NextResponse.json({
    aktivitasGuru: ag.map((a: any) => ({
      id: a._id.toString(),
      idGuru: a.guruId?._id?.toString().slice(-6).toUpperCase() ?? "-",
      namaGuru: a.guruId?.nama ?? "Guru tidak ditemukan",
      jenis: a.jenis,
      keterangan: a.keterangan,
      createdAt: a.createdAt,
    })),
    aktivitasSiswa: as.map((a: any) => {
      const s = a.siswaId;
      const k = s?.kelasId;
      return {
        id: a._id.toString(),
        idSiswa: s?.nis ?? "-",
        namaSiswa: s?.nama ?? "Siswa tidak ditemukan",
        kelas: k ? `${k.grade} ${k.name}` : "-",
        jenis: a.jenis,
        keterangan: a.keterangan,
        createdAt: a.createdAt,
      };
    }),
    guruNames: guru.map((g: any) => g.nama),
    siswaNames: siswa.map((s: any) => s.nama),
  });
}