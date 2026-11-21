import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { connectDB } from "@/lib/mongodb";
import Materi from "@/models/Materi";
import Kelas from "@/models/Kelas";
import { bolehAkses } from "@/lib/aksesGuru";
import { catatAktivitasGuru } from "@/lib/aktivitasLog";
import fs from "fs/promises";
import path from "path";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "guru") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  await connectDB();
  const list: any[] = await Materi.find({ guruId: session.user.id })
    .populate("kelasId", "grade name")
    .sort({ createdAt: -1 })
    .lean();

  return NextResponse.json(
    list.map((m) => ({
      id: m._id.toString(),
      judul: m.judul,
      mapel: m.mapel,
      kelasId: m.kelasId?._id?.toString(),
      kelasLabel: m.kelasId ? `${m.kelasId.grade} ${m.kelasId.name}` : "-",
      deskripsi: m.deskripsi,
      guruNama: m.guruNama,
      files: m.files,
      status: m.status,
      createdAt: m.createdAt,
    }))
  );
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "guru" || !session.user.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  await connectDB();
  const formData = await req.formData();
  const judul = String(formData.get("judul") || "");
  const mapel = String(formData.get("mapel") || "");
  const kelasId = String(formData.get("kelasId") || "");
  const deskripsi = String(formData.get("deskripsi") || "");

  if (!judul || !mapel || !kelasId) {
    return NextResponse.json({ error: "Data wajib belum lengkap" }, { status: 400 });
  }

  const kelas = await Kelas.findById(kelasId).lean();
  if (!kelas) return NextResponse.json({ error: "Kelas tidak ditemukan" }, { status: 404 });

  if (!(await bolehAkses(session.user.id, kelasId, mapel))) {
    return NextResponse.json({ error: "Anda tidak mengampu mapel ini di kelas tersebut" }, { status: 403 });
  }

  const uploadDir = path.join(process.cwd(), "public", "uploads", "materi");
  await fs.mkdir(uploadDir, { recursive: true });

  const files = formData.getAll("files") as File[];
  const saved = [];
  for (const file of files) {
    if (!(file instanceof File) || file.size === 0) continue;
    const bytes = Buffer.from(await file.arrayBuffer());
    const safeName = `${Date.now()}-${file.name.replace(/\s+/g, "_")}`;
    await fs.writeFile(path.join(uploadDir, safeName), bytes);
    saved.push({ name: file.name, url: `/uploads/materi/${safeName}`, type: file.type, size: file.size });
  }

  const materi: any = await Materi.create({
    judul,
    mapel,
    kelasId,
    deskripsi,
    guruId: session.user.id,
    guruNama: session.user.name,
    files: saved,
  });

  await catatAktivitasGuru(session.user.id, "Upload Materi", `Upload materi "${judul}" (${mapel})`);

  return NextResponse.json({ id: materi._id.toString() }, { status: 201 });
}