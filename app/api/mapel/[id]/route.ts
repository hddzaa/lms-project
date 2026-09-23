import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import MataPelajaran from "@/models/MataPelajaran";

export async function PUT(req: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  await connectDB();
  const body = await req.json();
  const mapel: any = await MataPelajaran.findByIdAndUpdate(id, body, { new: true }).lean();
  if (!mapel) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ ...mapel, id: mapel._id.toString() });
}

export async function DELETE(req: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  await connectDB();
  await MataPelajaran.findByIdAndDelete(id);
  return NextResponse.json({ success: true });
}