import { NextResponse } from "next/server";
import bcrypt from "bcrypt";
import { connectDB } from "@/lib/mongodb";
import Siswa from "@/models/Siswa";

export async function GET(req: Request, { params }: { params: { siswaId: string } }) {
  await connectDB();
  const siswa: any = await Siswa.findById(params.siswaId).lean();
  if (!siswa) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ ...siswa, id: siswa._id.toString() });
}

export async function PUT(req: Request, { params }: { params: { siswaId: string } }) {
  await connectDB();
  const body = await req.json();

  if (body.password) {
    body.password = await bcrypt.hash(body.password, 10);
  } else {
    delete body.password;
  }

  const siswa: any = await Siswa.findByIdAndUpdate(params.siswaId, body, { new: true }).lean();
  if (!siswa) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ ...siswa, id: siswa._id.toString() });
}

export async function DELETE(req: Request, { params }: { params: { siswaId: string } }) {
  await connectDB();
  await Siswa.findByIdAndDelete(params.siswaId);
  return NextResponse.json({ success: true });
}