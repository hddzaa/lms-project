import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { connectDB } from "@/lib/mongodb";
import Assessment from "@/models/Assessment";
import AssessmentSubmission from "@/models/AssessmentSubmission";

export async function POST(req: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "siswa") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  await connectDB();
  const assessment: any = await Assessment.findById(id).lean();
  const submission: any = await AssessmentSubmission.findOne({ assessmentId: id, siswaId: session.user.id });
  if (!assessment || !submission) return NextResponse.json({ error: "Not found" }, { status: 404 });

  let hasEssay = false;
  let totalBobotObjektif = 0;
  let perolehanObjektif = 0;

  for (const soal of assessment.soal) {
    const jwb = submission.jawaban.find((j: any) => j.soalId === soal._id.toString())?.jawaban || "";

    if (soal.tipe === "essay") {
      hasEssay = true;
      continue;
    }

    totalBobotObjektif += soal.bobot;
    const benar = jwb.trim().toLowerCase() === (soal.kunciJawaban || "").trim().toLowerCase();
    if (benar) perolehanObjektif += soal.bobot;
  }

  const nilai = totalBobotObjektif > 0 ? Math.round((perolehanObjektif / totalBobotObjektif) * 100) : null;

  submission.status = hasEssay ? "Perlu Dinilai" : "Selesai";
  submission.nilai = hasEssay ? null : nilai;
  submission.waktuSelesai = new Date();
  await submission.save();

  return NextResponse.json({ status: submission.status, nilai: submission.nilai });
}