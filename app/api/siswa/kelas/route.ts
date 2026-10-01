import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { connectDB } from "@/lib/mongodb";
import Kelas from "@/models/Kelas";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "siswa") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  await connectDB();
  const kelas: any = await Kelas.findById(session.user.kelasId).lean();
  if (!kelas) return NextResponse.json({ error: "Not found" }, { status: 404 });

  return NextResponse.json({
    id: kelas._id.toString(),
    grade: kelas.grade,
    name: kelas.name,
    waliKelas: kelas.waliKelas,
  });
}