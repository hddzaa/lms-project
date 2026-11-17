import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { connectDB } from "@/lib/mongodb";
import Tugas from "@/models/Tugas";
import TugasSubmission from "@/models/TugasSubmission";

export async function PUT(req: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "guru")
    return NextResponse.json({ error: "Tidak diizinkan" }, { status: 401 });
  await connectDB();

  const tugas = await Tugas.findOne({ _id: id, guruId: session.user.id });
  if (!tugas) return NextResponse.json({ error: "Tugas tidak ditemukan" }, { status: 404 });

  const { submissionId, nilai, komentar } = await req.json();
  const n = Number(nilai);
  if (Number.isNaN(n) || n < 0 || n > 100)
    return NextResponse.json({ error: "Nilai harus 0-100" }, { status: 400 });

  const sub = await TugasSubmission.findOneAndUpdate(
    { _id: submissionId, tugasId: id },
    { nilai: n, komentar: komentar || "" },
    { new: true }
  );
  if (!sub) return NextResponse.json({ error: "Pengumpulan tidak ditemukan" }, { status: 404 });
  return NextResponse.json(sub);
}