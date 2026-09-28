import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { connectDB } from "@/lib/mongodb";
import Kelas from "@/models/Kelas";
import Siswa from "@/models/Siswa";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "guru") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  await connectDB();
  const namaGuru = session.user.name;

  const kelasList = await Kelas.find({
    $or: [{ waliKelas: namaGuru }, { "pengajar.guruNama": namaGuru }],
  }).lean();

  const withDetail = await Promise.all(
    kelasList.map(async (k: any) => {
      const jumlahSiswa = await Siswa.countDocuments({ kelasId: k._id });
      const akses = k.waliKelas === namaGuru ? "wali" : "pengajar";
      return { ...k, id: k._id.toString(), jumlahSiswa, akses };
    })
  );

  return NextResponse.json(withDetail);
}