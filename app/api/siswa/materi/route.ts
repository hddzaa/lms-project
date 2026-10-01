import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { connectDB } from "@/lib/mongodb";
import Materi from "@/models/Materi";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "siswa") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  await connectDB();
  const materi = await Materi.find({ kelasId: session.user.kelasId, status: "Aktif" })
    .sort({ createdAt: -1 })
    .lean();

  return NextResponse.json(
    materi.map((m: any) => ({
      id: m._id.toString(),
      judul: m.judul,
      mapel: m.mapel,
      guruNama: m.guruNama,
      files: m.files,
      createdAt: m.createdAt,
    }))
  );
}