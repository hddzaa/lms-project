import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { connectDB } from "@/lib/mongodb";
import Materi from "@/models/Materi";
import { simpanFile } from "@/lib/simpanFile";

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

  const newFiles = [];
  for (const file of files) {
    if (!(file instanceof File) || file.size === 0) continue;
    newFiles.push(await simpanFile(file, "materi"));
  }

  const updated = await Materi.findByIdAndUpdate(
    id,
    { $push: { files: { $each: newFiles } } },
    { new: true }
  ).lean();

  return NextResponse.json({ ...updated, id: (updated as any)._id.toString() });
}