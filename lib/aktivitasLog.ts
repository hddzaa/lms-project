import { connectDB } from "@/lib/mongodb";
import AktivitasGuru from "@/models/AktivitasGuru";

export type JenisAktivitasGuru =
  | "Upload Materi"
  | "Membuat Assessment"
  | "Mengedit Assessment"
  | "Membuat Tugas"
  | "Menilai Tugas";

export async function catatAktivitasGuru(
  guruId: string | undefined,
  jenis: JenisAktivitasGuru,
  keterangan: string
) {
  if (!guruId) return;
  try {
    await connectDB();
    await AktivitasGuru.create({ guruId, jenis, keterangan });
  } catch (err) {
    console.error("Gagal mencatat aktivitas guru:", err);
  }
}