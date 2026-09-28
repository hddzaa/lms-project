import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { connectDB } from "@/lib/mongodb";
import Kelas from "@/models/Kelas";
import Siswa from "@/models/Siswa";

async function checkAccess(kelasId: string) {
  const session = await getServerSession(authOptions);
  if (!session) return { ok: false, status: 401 };
  if (session.user.role === "admin") return { ok: true };
  if (session.user.role === "guru") {
    const kelas = await Kelas.findById(kelasId).lean();
    if (!kelas) return { ok: false, status: 404 };
    if ((kelas as any).waliKelas !== session.user.name) return { ok: false, status: 403 };
    return { ok: true };
  }
  return { ok: false, status: 403 };
}

export async function GET(req: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  await connectDB();
  const kelas: any = await Kelas.findById(id).lean();
  if (!kelas) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const jumlahSiswa = await Siswa.countDocuments({ kelasId: kelas._id });
  return NextResponse.json({ ...kelas, id: kelas._id.toString(), jumlahSiswa });
}

export async function PUT(req: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  await connectDB();
  const access = await checkAccess(id);
  if (!access.ok) return NextResponse.json({ error: "Forbidden" }, { status: access.status });

  const body = await req.json();
  const kelas: any = await Kelas.findByIdAndUpdate(id, body, { new: true }).lean();
  if (!kelas) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const jumlahSiswa = await Siswa.countDocuments({ kelasId: kelas._id });
  return NextResponse.json({ ...kelas, id: kelas._id.toString(), jumlahSiswa });
}

export async function DELETE(req: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  await connectDB();
  const access = await checkAccess(id);
  if (!access.ok) return NextResponse.json({ error: "Forbidden" }, { status: access.status });

  await Kelas.findByIdAndDelete(id);
  await Siswa.deleteMany({ kelasId: id });
  return NextResponse.json({ success: true });
}