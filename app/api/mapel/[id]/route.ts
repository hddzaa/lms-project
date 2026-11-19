import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import MataPelajaran from "@/models/MataPelajaran";
import Guru from "@/models/Guru";

export async function PUT(req: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  await connectDB();
  const body = await req.json();

  const lama: any = await MataPelajaran.findById(id).lean();
  const mapel: any = await MataPelajaran.findByIdAndUpdate(id, body, { new: true }).lean();
  if (!mapel) return NextResponse.json({ error: "Not found" }, { status: 404 });

  if (lama && body.nama && lama.nama !== body.nama) {
    await Guru.updateMany({ mapel: lama.nama }, { mapel: body.nama });
  }

  return NextResponse.json({ ...mapel, id: mapel._id.toString() });
}

export async function DELETE(req: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  await connectDB();
  await MataPelajaran.findByIdAndDelete(id);
  return NextResponse.json({ success: true });
}