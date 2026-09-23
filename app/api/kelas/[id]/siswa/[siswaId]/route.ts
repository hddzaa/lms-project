import { NextResponse } from "next/server";
import bcrypt from "bcrypt";
import { connectDB } from "@/lib/mongodb";
import Siswa from "@/models/Siswa";

export async function GET(req: Request, context: { params: Promise<{ siswaId: string }> }) {
  const { siswaId } = await context.params;
  await connectDB();
  const siswa: any = await Siswa.findById(siswaId).lean();
  if (!siswa) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ ...siswa, id: siswa._id.toString() });
}

export async function PUT(req: Request, context: { params: Promise<{ siswaId: string }> }) {
  const { siswaId } = await context.params;
  await connectDB();
  const body = await req.json();

  if (body.password) {
    body.password = await bcrypt.hash(body.password, 10);
  } else {
    delete body.password;
  }

  const siswa: any = await Siswa.findByIdAndUpdate(siswaId, body, { new: true }).lean();
  if (!siswa) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ ...siswa, id: siswa._id.toString() });
}

export async function DELETE(req: Request, context: { params: Promise<{ siswaId: string }> }) {
  const { siswaId } = await context.params;
  await connectDB();
  await Siswa.findByIdAndDelete(siswaId);
  return NextResponse.json({ success: true });
}