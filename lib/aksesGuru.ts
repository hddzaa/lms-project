import { connectDB } from "@/lib/mongodb";
import Guru from "@/models/Guru";
import Kelas from "@/models/Kelas";

const norm = (s?: string | null) => (s ?? "").trim().toLowerCase();

export async function kelasYangBolehDiakses(guruId: string) {
  await connectDB();
  const guru: any = await Guru.findById(guruId).select("nama mapel").lean();
  if (!guru) return { guru: null, kelas: [] as any[] };

  const semua: any[] = await Kelas.find().sort({ grade: 1, name: 1 }).lean();
  const kelas = semua.filter(
    (k) =>
      k.waliKelas === guru.nama ||
      (k.mapel || []).some((m: string) => norm(m) === norm(guru.mapel))
  );
  return { guru, kelas };
}

export async function bolehAkses(guruId: string, kelasId: string, mapel: string) {
  const { guru, kelas } = await kelasYangBolehDiakses(guruId);
  if (!guru) return false;
  if (norm(mapel) !== norm(guru.mapel)) return false;
  return kelas.some((k) => k._id.toString() === String(kelasId));
}