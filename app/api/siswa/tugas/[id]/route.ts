import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { connectDB } from "@/lib/mongodb";
import Tugas from "@/models/Tugas";
import TugasSubmission from "@/models/TugasSubmission";
import { simpanFile } from "@/lib/simpanFile";
import { catatAktivitasSiswa } from "@/lib/aktivitasSiswa";

const BATAS = 4.4 * 1024 * 1024;

async function ambilTugas(id: string, kelasId?: string) {
  const t: any = await Tugas.findById(id).populate("guruId", "nama").lean();
  if (!t || String(t.kelasId) !== String(kelasId)) return null;
  return t;
}

export async function GET(_req: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "siswa")
    return NextResponse.json({ error: "Tidak diizinkan" }, { status: 401 });
  await connectDB();

  const t = await ambilTugas(id, session.user.kelasId);
  if (!t) return NextResponse.json({ error: "Tugas tidak ditemukan" }, { status: 404 });

  const sub: any = await TugasSubmission.findOne({ tugasId: id, siswaId: session.user.id }).lean();

  // Nilai tidak dikirim ke siswa; hanya penanda bahwa tugas sudah dinilai
  const submission = sub
    ? {
        files: sub.files ?? [],
        catatan: sub.catatan ?? "",
        status: sub.status,
        komentar: sub.komentar ?? "",
        waktuKumpul: sub.waktuKumpul,
        dinilai: sub.nilai !== null && sub.nilai !== undefined,
      }
    : null;

  return NextResponse.json({
    tugas: {
      id: String(t._id),
      judul: t.judul,
      deskripsi: t.deskripsi || "",
      jenis: t.jenis,
      mapel: t.mapel,
      guruNama: t.guruId?.nama ?? "-",
      deadline: t.deadline,
      files: t.files ?? [],
    },
    submission,
  });
}

export async function POST(req: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "siswa")
    return NextResponse.json({ error: "Tidak diizinkan" }, { status: 401 });
  await connectDB();

  const t = await ambilTugas(id, session.user.kelasId);
  if (!t) return NextResponse.json({ error: "Tugas tidak ditemukan" }, { status: 404 });

  const lama: any = await TugasSubmission.findOne({ tugasId: id, siswaId: session.user.id });
  if (lama && lama.nilai !== null && lama.nilai !== undefined)
    return NextResponse.json({ error: "Tugas sudah dinilai, tidak bisa dikumpulkan ulang" }, { status: 400 });

  const fd = await req.formData();
  const catatan = String(fd.get("catatan") || "");
  const files = fd.getAll("files").filter((f): f is File => f instanceof File && f.size > 0);

  if (files.length === 0 && !lama?.files?.length)
    return NextResponse.json({ error: "Lampirkan minimal satu file" }, { status: 400 });
  if (files.reduce((a, f) => a + f.size, 0) > BATAS)
    return NextResponse.json({ error: "Total ukuran file maksimal 4 MB" }, { status: 400 });

  const tersimpan = [];
  for (const f of files) tersimpan.push(await simpanFile(f, "tugas"));

  const status = new Date() > new Date(t.deadline) ? "terlambat" : "dikumpulkan";

  await TugasSubmission.findOneAndUpdate(
    { tugasId: id, siswaId: session.user.id },
    {
      catatan,
      status,
      waktuKumpul: new Date(),
      ...(tersimpan.length > 0 ? { files: tersimpan } : {}),
    },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );

  await catatAktivitasSiswa(
    session.user.id ?? "",
    "Mengumpulkan Tugas",
    "Mengumpulkan " + t.jenis + ' "' + t.judul + '" (' + t.mapel + ")" + (status === "terlambat" ? " - terlambat" : "")
  );

  return NextResponse.json({ ok: true, status });
}