import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { connectDB } from "@/lib/mongodb";
import Tugas from "@/models/Tugas";
import TugasSubmission from "@/models/TugasSubmission";
import "@/models/Guru";
import fs from "fs/promises";
import path from "path";

type Ctx = { params: Promise<{ id: string }> };

async function getTugas(id: string, kelasId: string) {
  const tugas: any = await Tugas.findById(id).populate("guruId", "nama").lean();
  if (!tugas) return { error: 404 as const };
  if (tugas.kelasId.toString() !== kelasId) return { error: 403 as const };
  return { tugas };
}

export async function GET(_: Request, context: Ctx) {
  const { id } = await context.params;
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "siswa") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  await connectDB();

  const r = await getTugas(id, session.user.kelasId ?? "");
  if ("error" in r) return NextResponse.json({ error: "Tidak ditemukan" }, { status: r.error });

  const sub: any = await TugasSubmission.findOne({ tugasId: id, siswaId: session.user.id }).lean();

  return NextResponse.json({
    tugas: {
      id: r.tugas._id.toString(),
      judul: r.tugas.judul,
      deskripsi: r.tugas.deskripsi,
      jenis: r.tugas.jenis,
      mode: r.tugas.mode,
      mapel: r.tugas.mapel,
      guruNama: r.tugas.guruId?.nama || "-",
      deadline: r.tugas.deadline,
    },
    submission: sub
      ? {
          files: sub.files,
          catatan: sub.catatan,
          status: sub.status,
          nilai: sub.nilai,
          komentar: sub.komentar,
          waktuKumpul: sub.waktuKumpul,
        }
      : null,
  });
}

export async function POST(req: Request, context: Ctx) {
  const { id } = await context.params;
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "siswa") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  await connectDB();

  const r = await getTugas(id, session.user.kelasId ?? "");
  if ("error" in r) return NextResponse.json({ error: "Tidak ditemukan" }, { status: r.error });

  const existing: any = await TugasSubmission.findOne({ tugasId: id, siswaId: session.user.id });
  if (existing && existing.nilai !== null && existing.nilai !== undefined) {
    return NextResponse.json({ error: "Tugas sudah dinilai, tidak bisa diubah" }, { status: 400 });
  }

  const formData = await req.formData();
  const catatan = ((formData.get("catatan") as string) || "").trim();
  const uploads = (formData.getAll("files") as File[]).filter((f) => f && f.size > 0);

  if (uploads.length === 0 && !existing?.files?.length) {
    return NextResponse.json({ error: "Upload minimal 1 file" }, { status: 400 });
  }
  if (uploads.some((f) => f.size > 20 * 1024 * 1024)) {
    return NextResponse.json({ error: "Ukuran file maksimal 20 MB" }, { status: 400 });
  }

  let files = existing?.files?.map((f: any) => ({ name: f.name, url: f.url, size: f.size })) || [];
  if (uploads.length > 0) {
    const dir = path.join(process.cwd(), "public", "uploads", "tugas");
    await fs.mkdir(dir, { recursive: true });
    files = [];
    for (const f of uploads) {
      const safe = f.name.replace(/[^a-zA-Z0-9._-]/g, "_");
      const filename = `${Date.now()}-${safe}`;
      await fs.writeFile(path.join(dir, filename), Buffer.from(await f.arrayBuffer()));
      files.push({ name: f.name, url: `/uploads/tugas/${filename}`, size: f.size });
    }
  }

  const now = new Date();
  const status = now > new Date(r.tugas.deadline) ? "terlambat" : "dikumpulkan";

  const sub = await TugasSubmission.findOneAndUpdate(
    { tugasId: id, siswaId: session.user.id },
    { files, catatan, status, waktuKumpul: now },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );
  return NextResponse.json({ success: true, status: sub.status });
}