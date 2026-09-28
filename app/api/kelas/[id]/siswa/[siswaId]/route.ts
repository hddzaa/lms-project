import { NextResponse } from "next/server";
import bcrypt from "bcrypt";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { connectDB } from "@/lib/mongodb";
import Siswa from "@/models/Siswa";
import Kelas from "@/models/Kelas";

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

export async function GET(req: Request, context: { params: Promise<{ siswaId: string }> }) {
  const { siswaId } = await context.params;
  await connectDB();
  const siswa: any = await Siswa.findById(siswaId).lean();
  if (!siswa) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ ...siswa, id: siswa._id.toString() });
}

export async function PUT(req: Request, context: { params: Promise<{ id: string; siswaId: string }> }) {
  const { id, siswaId } = await context.params;
  await connectDB();
  const access = await checkAccess(id);
  if (!access.ok) return NextResponse.json({ error: "Forbidden" }, { status: access.status });

  const body = await req.json();
  if (body.password) body.password = await bcrypt.hash(body.password, 10);
  else delete body.password;

  const siswa: any = await Siswa.findByIdAndUpdate(siswaId, body, { new: true }).lean();
  if (!siswa) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ ...siswa, id: siswa._id.toString() });
}

export async function DELETE(req: Request, context: { params: Promise<{ id: string; siswaId: string }> }) {
  const { id, siswaId } = await context.params;
  await connectDB();
  const access = await checkAccess(id);
  if (!access.ok) return NextResponse.json({ error: "Forbidden" }, { status: access.status });

  await Siswa.findByIdAndDelete(siswaId);
  return NextResponse.json({ success: true });
}