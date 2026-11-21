import { connectDB } from "@/lib/mongodb";
import Assessment from "@/models/Assessment";
import AssessmentSubmission from "@/models/AssessmentSubmission";
import Tugas from "@/models/Tugas";
import TugasSubmission from "@/models/TugasSubmission";

export type NilaiItem = {
  id: string;
  sumber: "Assessment" | "Tugas";
  judul: string;
  jenis: string;
  nilai: number | null;
  keterangan: string;
};

export type NilaiMapel = {
  mapel: string;
  items: NilaiItem[];
  nilaiAkhir: number | null;
};

// RUMUS NILAI AKHIR: rata-rata semua item yang sudah ada nilainya.
// Ubah di sini kalau nanti ingin memakai bobot (misal assessment 60%, tugas 40%).
export function hitungNilaiAkhir(nilai: (number | null)[]): number | null {
  const ada = nilai.filter((n): n is number => typeof n === "number");
  if (ada.length === 0) return null;
  return Math.round((ada.reduce((a, b) => a + b, 0) / ada.length) * 10) / 10;
}

export async function nilaiPerSiswa(siswaId: string, kelasId: string): Promise<NilaiMapel[]> {
  await connectDB();

  const [assessments, tugasList] = (await Promise.all([
    Assessment.find({ kelasId, status: "Dipublikasikan" }).select("judul mapel jenis").lean(),
    Tugas.find({ kelasId }).select("judul mapel jenis").lean(),
  ])) as [any[], any[]];

  const [aSubs, tSubs] = (await Promise.all([
    AssessmentSubmission.find({ siswaId, assessmentId: { $in: assessments.map((a) => a._id) } }).lean(),
    TugasSubmission.find({ siswaId, tugasId: { $in: tugasList.map((t) => t._id) } }).lean(),
  ])) as [any[], any[]];

  const aMap = new Map(aSubs.map((s) => [s.assessmentId.toString(), s]));
  const tMap = new Map(tSubs.map((s) => [s.tugasId.toString(), s]));

  const perMapel = new Map<string, NilaiItem[]>();
  const push = (mapel: string, item: NilaiItem) => {
    if (!perMapel.has(mapel)) perMapel.set(mapel, []);
    perMapel.get(mapel)!.push(item);
  };

  for (const a of assessments) {
    const s = aMap.get(a._id.toString());
    let nilai: number | null = null;
    let keterangan = "Belum dikerjakan";
    if (s) {
      if (typeof s.nilai === "number") {
        nilai = s.nilai;
        keterangan = "Dinilai";
      } else if (s.status === "Perlu Dinilai") keterangan = "Menunggu penilaian";
      else keterangan = "Sedang dikerjakan";
    }
    push(a.mapel, { id: a._id.toString(), sumber: "Assessment", judul: a.judul, jenis: a.jenis, nilai, keterangan });
  }

  for (const t of tugasList) {
    const s = tMap.get(t._id.toString());
    let nilai: number | null = null;
    let keterangan = "Belum dikumpulkan";
    if (s) {
      if (typeof s.nilai === "number") {
        nilai = s.nilai;
        keterangan = "Dinilai";
      } else keterangan = "Menunggu penilaian";
    }
    push(t.mapel, {
      id: t._id.toString(),
      sumber: "Tugas",
      judul: t.judul,
      jenis: t.jenis === "project" ? "Project" : "Tugas",
      nilai,
      keterangan,
    });
  }

  return [...perMapel.entries()]
    .sort((a, b) => a[0].localeCompare(b[0]))
    .map(([mapel, items]) => ({
      mapel,
      items,
      nilaiAkhir: hitungNilaiAkhir(items.map((i) => i.nilai)),
    }));
}