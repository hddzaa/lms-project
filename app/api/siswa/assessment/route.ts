import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { connectDB } from "@/lib/mongodb";
import Assessment from "@/models/Assessment";
import AssessmentSubmission from "@/models/AssessmentSubmission";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "siswa") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  await connectDB();
  const list = await Assessment.find({ kelasId: session.user.kelasId, status: "Dipublikasikan" })
    .sort({ deadline: 1 })
    .lean();

  const submissions = await AssessmentSubmission.find({ siswaId: session.user.id }).lean();
  const subMap = new Map(submissions.map((s: any) => [s.assessmentId.toString(), s]));

  const result = list.map((a: any) => {
    const sub: any = subMap.get(a._id.toString());
    let statusKerja = "Belum Dikerjakan";
    if (sub) statusKerja = sub.status === "Sedang Dikerjakan" ? "Sedang Berlangsung" : sub.status;

    return {
      id: a._id.toString(),
      judul: a.judul,
      mapel: a.mapel,
      guruNama: a.guruNama,
      jenis: a.jenis,
      deadline: a.deadline,
      durasiMenit: a.durasiMenit,
      jumlahSoal: a.soal.length,
      statusKerja,
      nilai: sub?.nilai ?? null,
    };
  });

  return NextResponse.json(result);
}