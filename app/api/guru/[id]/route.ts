import { NextResponse } from "next/server";
import bcrypt from "bcrypt";
import { connectDB } from "@/lib/mongodb";
import Guru from "@/models/Guru";

export async function GET(req: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  await connectDB();
  const guru: any = await Guru.findById(id).select("-password").lean();
  if (!guru) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ ...guru, id: guru._id.toString() });
}

export async function PUT(req: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  await connectDB();
  const body = await req.json();

  if (body.password) {
    body.password = await bcrypt.hash(body.password, 10);
  } else {
    delete body.password;
  }

  const guru: any = await Guru.findByIdAndUpdate(id, body, { new: true }).select("-password").lean();
  if (!guru) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ ...guru, id: guru._id.toString() });
}

export async function DELETE(req: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  await connectDB();
  await Guru.findByIdAndDelete(id);
  return NextResponse.json({ success: true });
}