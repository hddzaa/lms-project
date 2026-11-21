import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { connectDB } from "@/lib/mongodb";
import Assessment from "@/models/Assessment";
import { bolehAkses } from "@/lib/aksesGuru";
import { catatAktivitasGuru } from "@/lib/aktivitasLog";

async function checkOwnership(id: string, guruId: string) {
  const a: any = await Assessment.findById(id).lean();
  if (!a) return { ok: false, status: 404 };
  if (a.guruId.toString() !== guruId) return { ok: false, status: 403 };
  return { ok: true, a };
}

export async function GET(req: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "guru" || !session.user.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  await connectDB();
  const access = await checkOwnership(id, session.user.id);
  if (!access.ok) return NextResponse.json({ error: "Forbidden" }, { status: access.status });

  const a: any = await Assessment.findById(id).populate("kelasId", "grade name").lean();
  return NextResponse.json({
    id: a._id.toString(),
    judul: a.judul,
    mapel: a.mapel,
    kelasId: a.kelasId?._id?.toString(),
    kelasLabel: a.kelasId ? `${a.kelasId.grade} ${a.kelasId.name}` : "-",
    deskripsi: a.deskripsi,
    jenis: a.jenis,
    tanggalMulai: a.tanggalMulai,
    deadline: a.deadline,
    durasiMenit: a.durasiMenit,
    status: a.status,
    soal: a.soal.map((s: any) => ({ ...s, id: s._id.toString() })),
  });
}

export async function PUT(req: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "guru" || !session.user.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  await connectDB();
  const access = await checkOwnership(id, session.user.id);
  if (!access.ok) return NextResponse.json({ error: "Forbidden" }, { status: access.status });

  const body = await req.json();

  // Cek akses hanya jika kelas / mapel diubah
  const kelasBaru = body.kelasId ?? access.a.kelasId.toString();
  const mapelBaru = body.mapel ?? access.a.mapel;
  const berubah = kelasBaru !== access.a.kelasId.toString() || mapelBaru !== access.a.mapel;
  if (berubah && !(await bolehAkses(session.user.id, kelasBaru, mapelBaru))) {
    return NextResponse.json({ error: "Anda tidak mengampu mapel ini di kelas tersebut" }, { status: 403 });
  }

  const updated: any = await Assessment.findByIdAndUpdate(id, body, { new: true }).lean();

  await catatAktivitasGuru(session.user.id, "Mengedit Assessment", `Mengedit assessment "${updated.judul}" (${updated.mapel})`);

  return NextResponse.json({ ...updated, id: updated._id.toString() });
}

export async function DELETE(req: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "guru" || !session.user.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  await connectDB();
  const access = await checkOwnership(id, session.user.id);
  if (!access.ok) return NextResponse.json({ error: "Forbidden" }, { status: access.status });

  await Assessment.findByIdAndDelete(id);
  return NextResponse.json({ success: true });
}