import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import MataPelajaran from "@/models/MataPelajaran";

export async function GET() {
  await connectDB();
  const mapelList = await MataPelajaran.find().sort({ createdAt: 1 }).lean();
  return NextResponse.json(mapelList.map((m: any) => ({ ...m, id: m._id.toString() })));
}

export async function POST(req: Request) {
  await connectDB();
  const body = await req.json();
  const mapel = await MataPelajaran.create(body);
  return NextResponse.json({ ...mapel.toObject(), id: mapel._id.toString() });
}