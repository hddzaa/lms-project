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

function rata(arr: number[]): number | null {
  if (arr.length === 0) return null;
  const total = arr.reduce((a, b) => a + b, 0);
  return Math.round((total / arr.length) * 10) / 10;
}

export async function GET(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "guru")
    return NextResponse.json({ error: "Tidak diizinkan" }, { status: 401 });
  await connectDB();

  const guru: any = await Guru.findById(session.user.id ?? "").lean();
  if (!guru) return NextResponse.json({ error: "Guru tidak ditemukan" }, { status: 404 });

  const kelasId = new URL(req.url).searchParams.get("kelasId");

  // Tanpa kelasId: hanya kelas yang guru ini menjadi wali kelasnya
  if (!kelasId) {
    const daftar: any[] = await Kelas.find({ waliKelas: guru.nama }).sort({ grade: 1, name: 1 }).lean();
    return NextResponse.json({
      kelas: daftar.map((k) => ({
        id: String(k._id),
        nama: (k.grade ?? "") + " " + (k.name ?? ""),
      })),
    });
  }

  // Dengan kelasId: hanya boleh jika guru ini wali kelasnya
  const kelas: any = await Kelas.findById(kelasId).lean();
  if (!kelas) return NextResponse.json({ error: "Kelas tidak ditemukan" }, { status: 404 });
  if (kelas.waliKelas !== guru.nama)
    return NextResponse.json({ error: "Hanya wali kelas yang dapat melihat nilai siswa" }, { status: 403 });

  const assessments: any[] = await Assessment.find({ kelasId, status: "Dipublikasikan" })
    .select("_id mapel")
    .lean();
  const tugasList: any[] = await Tugas.find({ kelasId }).select("_id mapel").lean();

  const subA: any[] = await AssessmentSubmission.find({
    assessmentId: { $in: assessments.map((a) => a._id) },
    nilai: { $ne: null },
  })
    .select("assessmentId siswaId nilai")
    .lean();

  const subT: any[] = await TugasSubmission.find({
    tugasId: { $in: tugasList.map((t) => t._id) },
    nilai: { $ne: null },
  })
    .select("tugasId siswaId nilai")
    .lean();

  const mapelAssessment = new Map<string, string>();
  for (const a of assessments) mapelAssessment.set(String(a._id), a.mapel);
  const mapelTugas = new Map<string, string>();
  for (const t of tugasList) mapelTugas.set(String(t._id), t.mapel);

  // Semua mapel di kelas: dari daftar mapel kelas + yang sudah punya assessment/tugas
  const setMapel = new Set<string>();
  for (const m of kelas.mapel ?? []) setMapel.add(m);
  for (const a of assessments) setMapel.add(a.mapel);
  for (const t of tugasList) setMapel.add(t.mapel);
  const mapel = Array.from(setMapel).sort((a, b) => a.localeCompare(b));

  // siswaId -> mapel -> daftar nilai
  const nilaiSiswa = new Map<string, Map<string, number[]>>();
  function tambah(siswaId: string, m: string | undefined, nilai: number) {
    if (!m) return;
    if (!nilaiSiswa.has(siswaId)) nilaiSiswa.set(siswaId, new Map());
    const peta = nilaiSiswa.get(siswaId)!;
    if (!peta.has(m)) peta.set(m, []);
    peta.get(m)!.push(nilai);
  }
  for (const s of subA) tambah(String(s.siswaId), mapelAssessment.get(String(s.assessmentId)), s.nilai);
  for (const s of subT) tambah(String(s.siswaId), mapelTugas.get(String(s.tugasId)), s.nilai);

  const siswa: any[] = await Siswa.find({ kelasId }).select("nama nis").sort({ nama: 1 }).lean();

  const hasil = siswa.map((s) => {
    const peta = nilaiSiswa.get(String(s._id));
    const perMapel: Record<string, number | null> = {};
    const semua: number[] = [];
    for (const m of mapel) {
      const daftar = peta?.get(m) ?? [];
      perMapel[m] = rata(daftar);
      semua.push(...daftar);
    }
    return { id: String(s._id), nama: s.nama, nis: s.nis, perMapel, akhir: rata(semua) };
  });

  return NextResponse.json({
    kelas: { id: String(kelas._id), nama: (kelas.grade ?? "") + " " + (kelas.name ?? "") },
    mapel,
    jumlahAssessment: assessments.length,
    jumlahTugas: tugasList.length,
    siswa: hasil,
  });
}