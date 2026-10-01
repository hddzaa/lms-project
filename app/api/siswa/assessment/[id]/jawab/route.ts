import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { connectDB } from "@/lib/mongodb";
import AssessmentSubmission from "@/models/AssessmentSubmission";

export async function PUT(req: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "siswa") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  await connectDB();
  const { soalId, jawaban } = await req.json();

  const submission: any = await AssessmentSubmission.findOne({ assessmentId: id, siswaId: session.user.id });
  if (!submission) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (submission.status !== "Sedang Dikerjakan") {
    return NextResponse.json({ error: "Sudah diselesaikan" }, { status: 403 });
  }

  const existing = submission.jawaban.find((j: any) => j.soalId === soalId);
  if (existing) existing.jawaban = jawaban;
  else submission.jawaban.push({ soalId, jawaban });

  await submission.save();
  return NextResponse.json({ success: true });
}