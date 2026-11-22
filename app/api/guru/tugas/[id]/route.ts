import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { connectDB } from "@/lib/mongodb";
import Tugas from "@/models/Tugas";
import TugasSubmission from "@/models/TugasSubmission";
import { simpanFile } from "@/lib/simpanFile";

const BATAS = 4.4 * 1024 * 1024;

type Hasil =
  | { error: 401 | 404; tugas?: undefined }
  | { error?: undefined; tugas: any };

async function ambil(id: string): Promise<Hasil> {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "guru") return { error: 401 };
  await connectDB();
  const tugas: any = await Tugas.findOne({ _id: id, guruId: session.user.id });
  if (!tugas) return { error: 404 };
  return { tugas };
}

function galat(code: 401 | 404) {
  return NextResponse.json(
    { error: code === 401 ? "Tidak diizinkan" : "Tugas tidak ditemukan" },
    { status: code }
  );
}

export async function GET(_req: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  const r = await ambil(id);
  if (r.error) return galat(r.error);

  const tugas = await r.tugas.populate("kelasId", "grade name");
  const submissions = await TugasSubmission.find({ tugasId: id })
    .populate("siswaId", "nama nis")
    .sort({ waktuKumpul: -1 })
    .lean();

  return NextResponse.json({ tugas, submissions });
}

export async function PUT(req: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  const r = await ambil(id);
  if (r.error) return galat(r.error);
  const tugas = r.tugas;

  const fd = await req.formData();
  const judul = String(fd.get("judul") || "").trim();
  const mapel = String(fd.get("mapel") || "");
  const kelasId = String(fd.get("kelasId") || "");
  const deadline = String(fd.get("deadline") || "");
  if (!judul || !mapel || !kelasId || !deadline)
    return NextResponse.json({ error: "Judul, Mapel, Kelas, dan Deadline wajib diisi" }, { status: 400 });

  let hapus: string[] = [];
  try {
    hapus = JSON.parse(String(fd.get("hapus") || "[]"));
  } catch {
    hapus = [];
  }

  const files = fd.getAll("files").filter((f): f is File => f instanceof File && f.size > 0);
  if (files.reduce((a, f) => a + f.size, 0) > BATAS)
    return NextResponse.json({ error: "Total ukuran file maksimal 4 MB" }, { status: 400 });

  const baru = [];
  for (const f of files) baru.push(await simpanFile(f, "tugas"));

  const sisa = (tugas.files ?? [])
    .filter((f: any) => !hapus.includes(f.url))
    .map((f: any) => ({ name: f.name, url: f.url, type: f.type, size: f.size }));

  tugas.judul = judul;
  tugas.deskripsi = String(fd.get("deskripsi") || "");
  tugas.jenis = String(fd.get("jenis") || "tugas");
  tugas.mapel = mapel;
  tugas.kelasId = kelasId;
  tugas.deadline = new Date(deadline);
  tugas.files = [...sisa, ...baru];
  await tugas.save();

  return NextResponse.json(tugas);
}

export async function DELETE(_req: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  const r = await ambil(id);
  if (r.error) return galat(r.error);

  await TugasSubmission.deleteMany({ tugasId: id });
  await r.tugas.deleteOne();
  return NextResponse.json({ ok: true });
}