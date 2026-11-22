import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { connectDB } from "@/lib/mongodb";
import Tugas from "@/models/Tugas";
import TugasSubmission from "@/models/TugasSubmission";
import Guru from "@/models/Guru";
import Kelas from "@/models/Kelas";
import { simpanFile } from "@/lib/simpanFile";

const BATAS = 4.4 * 1024 * 1024;

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "guru")
    return NextResponse.json({ error: "Tidak diizinkan" }, { status: 401 });
  await connectDB();

  const list = await Tugas.find({ guruId: session.user.id })
    .populate("kelasId", "grade name")
    .sort({ createdAt: -1 })
    .lean();

  const hasil = await Promise.all(
    list.map(async (t: any) => ({
      ...t,
      jumlahKumpul: await TugasSubmission.countDocuments({ tugasId: t._id }),
    }))
  );
  return NextResponse.json(hasil);
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "guru")
    return NextResponse.json({ error: "Tidak diizinkan" }, { status: 401 });
  await connectDB();

  const fd = await req.formData();
  const judul = String(fd.get("judul") || "").trim();
  const jenis = String(fd.get("jenis") || "tugas");
  const mapel = String(fd.get("mapel") || "");
  const kelasId = String(fd.get("kelasId") || "");
  const deadline = String(fd.get("deadline") || "");
  const deskripsi = String(fd.get("deskripsi") || "");

  if (!judul || !mapel || !kelasId || !deadline)
    return NextResponse.json({ error: "Judul, Mapel, Kelas, dan Deadline wajib diisi" }, { status: 400 });

  const guru: any = await Guru.findById(session.user.id).lean();
  const kelas: any = await Kelas.findById(kelasId).lean();
  if (!guru || !kelas) return NextResponse.json({ error: "Kelas tidak ditemukan" }, { status: 404 });
  const wali = kelas.waliKelas === guru.nama;
  const mengajar = (kelas.mapel ?? []).includes(guru.mapel);
  if (!wali && !mengajar)
    return NextResponse.json({ error: "Kamu tidak punya akses ke kelas ini" }, { status: 403 });
  if (mapel !== guru.mapel)
    return NextResponse.json({ error: "Mapel harus sesuai mapel yang kamu ajar" }, { status: 403 });

  const files = fd.getAll("files").filter((f): f is File => f instanceof File && f.size > 0);
  if (files.reduce((a, f) => a + f.size, 0) > BATAS)
    return NextResponse.json({ error: "Total ukuran file maksimal 4 MB" }, { status: 400 });

  const tersimpan = [];
  for (const f of files) tersimpan.push(await simpanFile(f, "tugas"));

  const tugas = await Tugas.create({
    judul,
    deskripsi,
    jenis,
    mapel,
    kelasId,
    guruId: session.user.id,
    deadline: new Date(deadline),
    files: tersimpan,
  });

  return NextResponse.json(tugas, { status: 201 });
}