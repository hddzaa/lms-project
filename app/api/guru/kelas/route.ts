import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { connectDB } from "@/lib/mongodb";
import Siswa from "@/models/Siswa";
import { kelasYangBolehDiakses } from "@/lib/aksesGuru";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "guru" || !session.user.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  await connectDB();
  const { guru, kelas } = await kelasYangBolehDiakses(session.user.id);
  if (!guru) return NextResponse.json([]);

  const data = await Promise.all(
    kelas.map(async (k: any) => ({
      ...k,
      id: k._id.toString(),
      jumlahSiswa: await Siswa.countDocuments({ kelasId: k._id }),
      akses: k.waliKelas === guru.nama ? "wali" : "pengajar",
    }))
  );
  return NextResponse.json(data);
}