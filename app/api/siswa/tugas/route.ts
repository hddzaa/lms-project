import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { connectDB } from "@/lib/mongodb";
import Tugas from "@/models/Tugas";
import TugasSubmission from "@/models/TugasSubmission";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "siswa")
    return NextResponse.json({ error: "Tidak diizinkan" }, { status: 401 });
  await connectDB();

  const kelasId = session.user.kelasId;
  if (!kelasId) return NextResponse.json([]);

  const list = await Tugas.find({ kelasId })
    .populate("guruId", "nama")
    .sort({ deadline: 1 })
    .lean();

  const subs = await TugasSubmission.find({
    siswaId: session.user.id,
    tugasId: { $in: list.map((t: any) => t._id) },
  }).lean();

  const hasil = list.map((t: any) => {
    const s: any = subs.find((x: any) => String(x.tugasId) === String(t._id));
    let status = "belum";
    if (s) status = s.nilai !== null && s.nilai !== undefined ? "dinilai" : s.status;
    return {
      id: String(t._id),
      judul: t.judul,
      jenis: t.jenis,
      mapel: t.mapel,
      guruNama: t.guruId?.nama ?? "-",
      deadline: t.deadline,
      status,
      nilai: s?.nilai ?? null,
    };
  });

  return NextResponse.json(hasil);
}