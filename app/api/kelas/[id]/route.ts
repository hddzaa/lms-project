import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Kelas from "@/models/Kelas";
import Siswa from "@/models/Siswa";

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
  const body = await req.json();
  const kelas: any = await Kelas.findByIdAndUpdate(id, body, { new: true }).lean();
  if (!kelas) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const jumlahSiswa = await Siswa.countDocuments({ kelasId: kelas._id });
  return NextResponse.json({ ...kelas, id: kelas._id.toString(), jumlahSiswa });
}

export async function DELETE(req: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  await connectDB();
  await Kelas.findByIdAndDelete(id);
  await Siswa.deleteMany({ kelasId: id });
  return NextResponse.json({ success: true });
}