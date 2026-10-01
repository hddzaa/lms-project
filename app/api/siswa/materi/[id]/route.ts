import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { connectDB } from "@/lib/mongodb";
import Materi from "@/models/Materi";

export async function GET(req: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "siswa") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  await connectDB();
  const materi: any = await Materi.findById(id).lean();
  if (!materi) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (materi.kelasId.toString() !== session.user.kelasId) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  return NextResponse.json({
    id: materi._id.toString(),
    judul: materi.judul,
    mapel: materi.mapel,
    deskripsi: materi.deskripsi,
    guruNama: materi.guruNama,
    files: materi.files,
    createdAt: materi.createdAt,
  });
}