import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { connectDB } from "@/lib/mongodb";
import Tugas from "@/models/Tugas";
import TugasSubmission from "@/models/TugasSubmission";
import { catatAktivitasGuru } from "@/lib/aktivitasLog";

async function guruOnly() {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "guru") return null;
  return session;
}

export async function GET() {
  const session = await guruOnly();
  if (!session) return NextResponse.json({ error: "Tidak diizinkan" }, { status: 401 });
  await connectDB();

  const list = await Tugas.find({ guruId: session.user.id })
    .populate("kelasId", "grade name")
    .sort({ createdAt: -1 })
    .lean();

  const data = await Promise.all(
    list.map(async (t: any) => ({
      ...t,
      jumlahKumpul: await TugasSubmission.countDocuments({ tugasId: t._id }),
    }))
  );
  return NextResponse.json(data);
}

export async function POST(req: Request) {
  const session = await guruOnly();
  if (!session) return NextResponse.json({ error: "Tidak diizinkan" }, { status: 401 });
  await connectDB();

  const b = await req.json();
  if (!b.judul || !b.mapel || !b.kelasId || !b.deadline) {
    return NextResponse.json(
      { error: "Judul, mapel, kelas, dan deadline wajib diisi" },
      { status: 400 }
    );
  }

  const tugas = await Tugas.create({
    judul: b.judul,
    deskripsi: b.deskripsi || "",
    jenis: b.jenis || "tugas",
    mode: b.mode || "individu",
    mapel: b.mapel,
    kelasId: b.kelasId,
    deadline: new Date(b.deadline),
    guruId: session.user.id,
  });
  await catatAktivitasGuru(session.user.id, "Membuat Tugas", `Membuat ${tugas.jenis} "${tugas.judul}" (${tugas.mapel})`);
  return NextResponse.json(tugas, { status: 201 });
}