import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { connectDB } from "@/lib/mongodb";
import Assessment from "@/models/Assessment";

async function checkOwnership(id: string, guruId: string) {
  const a: any = await Assessment.findById(id).lean();
  if (!a) return { ok: false, status: 404 };
  if (a.guruId.toString() !== guruId) return { ok: false, status: 403 };
  return { ok: true };
}

export async function GET(req: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "guru") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  await connectDB();
  const access = await checkOwnership(id, session.user.id!);
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
  if (!session || session.user.role !== "guru") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  await connectDB();
  const access = await checkOwnership(id, session.user.id!);
  if (!access.ok) return NextResponse.json({ error: "Forbidden" }, { status: access.status });

  const body = await req.json();
  const updated = await Assessment.findByIdAndUpdate(id, body, { new: true }).lean();
  return NextResponse.json({ ...updated, id: (updated as any)._id.toString() });
}

export async function DELETE(req: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "guru") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  await connectDB();
  const access = await checkOwnership(id, session.user.id!);
  if (!access.ok) return NextResponse.json({ error: "Forbidden" }, { status: access.status });

  await Assessment.findByIdAndDelete(id);
  return NextResponse.json({ success: true });
}