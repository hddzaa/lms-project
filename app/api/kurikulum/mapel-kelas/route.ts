import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { connectDB } from "@/lib/mongodb";
import Kelas from "@/models/Kelas";
import Guru from "@/models/Guru";

export async function GET() {
  const session = await getServerSession(authOptions);
  const role = session?.user?.role ?? "";
  if (!session || !["kurikulum", "kepsek", "admin"].includes(role))
    return NextResponse.json({ error: "Tidak diizinkan" }, { status: 401 });
  await connectDB();

  const kelas: any[] = await Kelas.find().sort({ grade: 1, name: 1 }).lean();
  const guru: any[] = await Guru.find().select("nama mapel").lean();

  const hasil = kelas.map((k) => ({
    id: String(k._id),
    nama: (k.grade ?? "") + " " + (k.name ?? ""),
    waliKelas: k.waliKelas ?? "-",
    mapel: (k.mapel ?? []).map((m: string) => ({
      nama: m,
      guru: guru.filter((g) => g.mapel === m).map((g) => g.nama),
    })),
  }));

  return NextResponse.json(hasil);
}