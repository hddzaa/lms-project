import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { connectDB } from "@/lib/mongodb";
import Assessment from "@/models/Assessment";
import AssessmentSubmission from "@/models/AssessmentSubmission";

export async function GET(req: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "siswa") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  await connectDB();
  const a: any = await Assessment.findById(id).lean();
  if (!a) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (a.kelasId.toString() !== session.user.kelasId) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  let submission: any = await AssessmentSubmission.findOne({ assessmentId: id, siswaId: session.user.id }).lean();
  if (!submission) {
    const created = await AssessmentSubmission.create({ assessmentId: id, siswaId: session.user.id, jawaban: [] });
    submission = created.toObject();
  }

  const isSelesai = submission.status !== "Sedang Dikerjakan";

  return NextResponse.json({
    id: a._id.toString(),
    judul: a.judul,
    mapel: a.mapel,
    guruNama: a.guruNama,
    deskripsi: a.deskripsi,
    jenis: a.jenis,
    deadline: a.deadline,
    durasiMenit: a.durasiMenit,
    status: submission.status,
    nilai: submission.nilai,
    waktuMulai: submission.waktuMulai,
    soal: a.soal.map((s: any) => ({
      id: s._id.toString(),
      tipe: s.tipe,
      pertanyaan: s.pertanyaan,
      opsi: s.opsi,
      bobot: s.bobot,
      jawabanSaya: submission.jawaban.find((j: any) => j.soalId === s._id.toString())?.jawaban || "",
      ...(isSelesai ? { kunciJawaban: s.kunciJawaban } : {}),
    })),
  });
}