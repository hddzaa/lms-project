import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { connectDB } from "@/lib/mongodb";
import Tugas from "@/models/Tugas";
import TugasSubmission from "@/models/TugasSubmission";
import "@/models/Kelas";
import "@/models/Siswa";
import { bolehAkses } from "@/lib/aksesGuru";

type Ctx = { params: Promise<{ id: string }> };

async function getOwned(id: string) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "guru" || !session.user.id) return { error: 401 as const };
  await connectDB();
  const tugas = await Tugas.findOne({ _id: id, guruId: session.user.id });
  if (!tugas) return { error: 404 as const };
  return { tugas, session };
}

export async function GET(_: Request, context: Ctx) {
  const { id } = await context.params;
  const r = await getOwned(id);
  if ("error" in r) return NextResponse.json({ error: "Tidak ditemukan / tidak diizinkan" }, { status: r.error });

  const tugas = await r.tugas.populate([{ path: "kelasId", select: "grade name" }]);
  const submissions = await TugasSubmission.find({ tugasId: id })
    .populate("siswaId", "nama nis")
    .sort({ waktuKumpul: -1 })
    .lean();
  return NextResponse.json({ tugas, submissions });
}

export async function PUT(req: Request, context: Ctx) {
  const { id } = await context.params;
  const r = await getOwned(id);
  if ("error" in r) return NextResponse.json({ error: "Tidak ditemukan / tidak diizinkan" }, { status: r.error });

  const b = await req.json();

  const kelasBaru = String(b.kelasId ?? r.tugas.kelasId);
  const mapelBaru = String(b.mapel ?? r.tugas.mapel);
  const berubah = kelasBaru !== String(r.tugas.kelasId) || mapelBaru !== r.tugas.mapel;
  if (berubah && !(await bolehAkses(r.session.user.id!, kelasBaru, mapelBaru))) {
    return NextResponse.json({ error: "Anda tidak mengampu mapel ini di kelas tersebut" }, { status: 403 });
  }

  const fields = ["judul", "deskripsi", "jenis", "mode", "mapel", "kelasId"];
  for (const f of fields) if (b[f] !== undefined) (r.tugas as any)[f] = b[f];
  if (b.deadline) r.tugas.deadline = new Date(b.deadline);
  await r.tugas.save();
  return NextResponse.json(r.tugas);
}

export async function DELETE(_: Request, context: Ctx) {
  const { id } = await context.params;
  const r = await getOwned(id);
  if ("error" in r) return NextResponse.json({ error: "Tidak ditemukan / tidak diizinkan" }, { status: r.error });

  await TugasSubmission.deleteMany({ tugasId: id });
  await r.tugas.deleteOne();
  return NextResponse.json({ message: "Tugas dihapus" });
}