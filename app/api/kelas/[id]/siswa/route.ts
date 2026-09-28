import { NextResponse } from "next/server";
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

export async function GET(req: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  await connectDB();
  const siswa = await Siswa.find({ kelasId: id }).sort({ createdAt: 1 }).lean();
  return NextResponse.json(siswa.map((s: any) => ({ ...s, id: s._id.toString() })));
}

export async function POST(req: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  await connectDB();
  const access = await checkAccess(id);
  if (!access.ok) return NextResponse.json({ error: "Forbidden" }, { status: access.status });

  const body = await req.json();
  const siswa = await Siswa.create({ ...body, kelasId: id });
  return NextResponse.json({ ...siswa.toObject(), id: siswa._id.toString() });
}