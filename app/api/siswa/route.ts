import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Siswa from "@/models/Siswa";

export async function GET() {
  await connectDB();
  const siswa = await Siswa.find().select("nama").sort({ nama: 1 }).lean();
  return NextResponse.json(siswa.map((s: any) => ({ id: s._id.toString(), nama: s.nama })));
}