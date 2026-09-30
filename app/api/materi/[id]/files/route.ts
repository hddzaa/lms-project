import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { connectDB } from "@/lib/mongodb";
import Materi from "@/models/Materi";
import fs from "fs/promises";
import path from "path";

export async function POST(req: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "guru") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  await connectDB();
  const materi: any = await Materi.findById(id).lean();
  if (!materi) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (materi.guruId.toString() !== session.user.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const formData = await req.formData();
  const files = formData.getAll("files") as File[];

  const uploadDir = path.join(process.cwd(), "public", "uploads", "materi");
  await fs.mkdir(uploadDir, { recursive: true });

  const newFiles = [];
  for (const file of files) {
    if (!(file instanceof File) || file.size === 0) continue;
    const bytes = Buffer.from(await file.arrayBuffer());
    const safeName = `${Date.now()}-${file.name.replace(/\s+/g, "_")}`;
    await fs.writeFile(path.join(uploadDir, safeName), bytes);
    newFiles.push({ name: file.name, url: `/uploads/materi/${safeName}`, type: file.type, size: file.size });
  }

  const updated = await Materi.findByIdAndUpdate(
    id,
    { $push: { files: { $each: newFiles } } },
    { new: true }
  ).lean();

  return NextResponse.json({ ...updated, id: (updated as any)._id.toString() });
}