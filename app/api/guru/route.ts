import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Guru from "@/models/Guru";

export async function GET() {
  await connectDB();
  const guruList = await Guru.find().sort({ createdAt: 1 }).select("-password").lean();
  return NextResponse.json(guruList.map((g: any) => ({ ...g, id: g._id.toString() })));
}

export async function POST(req: Request) {
  await connectDB();
  const body = await req.json();
  const guru = await Guru.create(body);
  const { password, ...safe } = guru.toObject();
  return NextResponse.json({ ...safe, id: guru._id.toString() });
}