import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { connectDB } from "@/lib/mongodb";
import Guru from "@/models/Guru";
import Kelas from "@/models/Kelas";
import Siswa from "@/models/Siswa";
import Assessment from "@/models/Assessment";
import AssessmentSubmission from "@/models/AssessmentSubmission";
import Tugas from "@/models/Tugas";
import TugasSubmission from "@/models/TugasSubmission";

type Item = {
  tipe: string;
  judul: string;
  nilai: number | null;
  status: string;
  waktu: string | null;
};

function rata(arr: number[]): number | null {
  if (arr.length === 0) return null;
  const total = arr.reduce((a, b) => a + b, 0);
  return Math.round((total / arr.length) * 10) / 10;
}

export async function GET(_req: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "guru")
    return NextResponse.json({ error: "Tidak diizinkan" }, { status: 401 });
  await connectDB();

  const guru: any = await Guru.findById(session.user.id ?? "").lean();
  if (!guru) return NextResponse.json({ error: "Guru tidak ditemukan" }, { status: 404 });

  const siswa: any = await Siswa.findById(id).select("nama nis kelasId").lean();
  if (!siswa) return NextResponse.json({ error: "Siswa tidak ditemukan" }, { status: 404 });

  const kelas: any = await Kelas.findById(siswa.kelasId).lean();
  if (!kelas || kelas.waliKelas !== guru.nama)
    return NextResponse.json({ error: "Hanya wali kelas yang dapat melihat nilai siswa" }, { status: 403 });

  const assessments: any[] = await Assessment.find({ kelasId: kelas._id, status: "Dipublikasikan" })
    .select("_id judul mapel jenis")
    .lean();
  const tugasList: any[] = await Tugas.find({ kelasId: kelas._id }).select("_id judul mapel jenis").lean();

  const subA: any[] = await AssessmentSubmission.find({
    siswaId: id,
    assessmentId: { $in: assessments.map((a) => a._id) },
  }).lean();
  const subT: any[] = await TugasSubmission.find({
    siswaId: id,
    tugasId: { $in: tugasList.map((t) => t._id) },
  }).lean();

  const perMapel = new Map<string, Item[]>();
  function taruh(mapel: string, item: Item) {
    if (!perMapel.has(mapel)) perMapel.set(mapel, []);
    perMapel.get(mapel)!.push(item);
  }
  // Pastikan semua mapel kelas muncul walau belum ada penilaian
  for (const m of kelas.mapel ?? []) if (!perMapel.has(m)) perMapel.set(m, []);

  for (const a of assessments) {
    const s = subA.find((x) => String(x.assessmentId) === String(a._id));
    let status = "Belum dikerjakan";
    let nilai: number | null = null;
    if (s) {
      if (s.nilai !== null && s.nilai !== undefined) {
        nilai = s.nilai;
        status = "Dinilai";
      } else if (s.status === "Perlu Dinilai") {
        status = "Menunggu penilaian";
      } else {
        status = s.status;
      }
    }
    taruh(a.mapel, {
      tipe: a.jenis ?? "Assessment",
      judul: a.judul,
      nilai,
      status,
      waktu: s?.waktuSelesai ? new Date(s.waktuSelesai).toISOString() : null,
    });
  }

  for (const t of tugasList) {
    const s = subT.find((x) => String(x.tugasId) === String(t._id));
    let status = "Belum dikumpulkan";
    let nilai: number | null = null;
    if (s) {
      if (s.nilai !== null && s.nilai !== undefined) {
        nilai = s.nilai;
        status = "Dinilai";
      } else {
        status = "Menunggu penilaian";
      }
    }
    taruh(t.mapel, {
      tipe: t.jenis === "project" ? "Project" : "Tugas",
      judul: t.judul,
      nilai,
      status,
      waktu: s?.waktuKumpul ? new Date(s.waktuKumpul).toISOString() : null,
    });
  }

  const semua: number[] = [];
  const mapel = Array.from(perMapel.entries())
    .sort((a, b) => a[0].localeCompare(b[0]))
    .map(([nama, items]) => {
      const nilaiAda = items.filter((i) => i.nilai !== null).map((i) => i.nilai as number);
      semua.push(...nilaiAda);
      return { nama, rata: rata(nilaiAda), items };
    });

  return NextResponse.json({
    siswa: { id: String(siswa._id), nama: siswa.nama, nis: siswa.nis },
    kelas: { id: String(kelas._id), nama: (kelas.grade ?? "") + " " + (kelas.name ?? "") },
    akhir: rata(semua),
    mapel,
  });
}