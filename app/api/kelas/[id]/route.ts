import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Kelas from "@/models/Kelas";
import Siswa from "@/models/Siswa";

export async function GET(req: Request, { params }: { params: { id: string } }) {
  await connectDB();
  const kelas: any = await Kelas.findById(params.id).lean();
  if (!kelas) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const jumlahSiswa = await Siswa.countDocuments({ kelasId: kelas._id });
  return NextResponse.json({ ...kelas, id: kelas._id.toString(), jumlahSiswa });
}

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  await connectDB();
  const body = await req.json();
  const kelas: any = await Kelas.findByIdAndUpdate(params.id, body, { new: true }).lean();
  if (!kelas) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const jumlahSiswa = await Siswa.countDocuments({ kelasId: kelas._id });
  return NextResponse.json({ ...kelas, id: kelas._id.toString(), jumlahSiswa });
}

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  await connectDB();
  await Kelas.findByIdAndDelete(params.id);
  await Siswa.deleteMany({ kelasId: params.id });
  return NextResponse.json({ success: true });
}