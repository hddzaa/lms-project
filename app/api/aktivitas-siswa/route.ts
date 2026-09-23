import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import AktivitasSiswa from "@/models/AktivitasSiswa";
import "@/models/Kelas";

export async function GET() {
  await connectDB();
  const data = await AktivitasSiswa.find()
    .populate({
      path: "siswaId",
      select: "nama nis kelasId",
      populate: { path: "kelasId", select: "grade name" },
    })
    .sort({ createdAt: -1 })
    .lean();

  return NextResponse.json(
    data.map((a: any) => {
      const siswa = a.siswaId;
      const kelas = siswa?.kelasId;
      return {
        id: a._id.toString(),
        siswaId: siswa?._id?.toString(),
        namaSiswa: siswa?.nama ?? "Siswa tidak ditemukan",
        idSiswa: siswa?.nis ?? "-",
        kelas: kelas ? `${kelas.grade} ${kelas.name}` : "-",
        jenis: a.jenis,
        keterangan: a.keterangan,
        createdAt: a.createdAt,
      };
    })
  );
}

// Dipakai nanti oleh role Siswa untuk mencatat aktivitas otomatis
export async function POST(req: Request) {
  await connectDB();
  const body = await req.json();
  const aktivitas = await AktivitasSiswa.create(body);
  return NextResponse.json({ ...aktivitas.toObject(), id: aktivitas._id.toString() });
}