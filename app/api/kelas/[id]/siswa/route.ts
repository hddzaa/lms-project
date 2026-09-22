import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Siswa from "@/models/Siswa";

export async function GET(req: Request, { params }: { params: { id: string } }) {
  await connectDB();
  const siswa = await Siswa.find({ kelasId: params.id }).sort({ createdAt: 1 }).lean();
  return NextResponse.json(siswa.map((s: any) => ({ ...s, id: s._id.toString() })));
}

export async function POST(req: Request, { params }: { params: { id: string } }) {
  await connectDB();
  const body = await req.json();
  const siswa = await Siswa.create({ ...body, kelasId: params.id });
  return NextResponse.json({ ...siswa.toObject(), id: siswa._id.toString() });
}