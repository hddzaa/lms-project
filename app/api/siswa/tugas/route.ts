import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { connectDB } from "@/lib/mongodb";
import Tugas from "@/models/Tugas";
import TugasSubmission from "@/models/TugasSubmission";
import "@/models/Guru";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "siswa") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  await connectDB();
  const list: any[] = await Tugas.find({ kelasId: session.user.kelasId })
    .populate("guruId", "nama")
    .sort({ deadline: 1 })
    .lean();

  const subs: any[] = await TugasSubmission.find({
    siswaId: session.user.id,
    tugasId: { $in: list.map((t) => t._id) },
  }).lean();
  const subMap = new Map(subs.map((s) => [s.tugasId.toString(), s]));

  return NextResponse.json(
    list.map((t) => {
      const s = subMap.get(t._id.toString());
      return {
        id: t._id.toString(),
        judul: t.judul,
        jenis: t.jenis,
        mode: t.mode,
        mapel: t.mapel,
        guruNama: t.guruId?.nama || "-",
        deadline: t.deadline,
        submission: s
          ? { status: s.status, nilai: s.nilai, waktuKumpul: s.waktuKumpul }
          : null,
      };
    })
  );
}