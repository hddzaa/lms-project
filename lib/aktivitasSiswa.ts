import { connectDB } from "@/lib/mongodb";
import AktivitasSiswa from "@/models/AktivitasSiswa";

export type JenisAktivitasSiswa =
  | "Mengerjakan Assessment"
  | "Melihat Materi"
  | "Mengumpulkan Tugas"
  | "Melihat Nilai";

export async function catatAktivitasSiswa(
  siswaId: string,
  jenis: JenisAktivitasSiswa,
  keterangan: string
) {
  try {
    await connectDB();
    await AktivitasSiswa.create({ siswaId, jenis, keterangan });
  } catch (e) {
    console.error("Gagal mencatat aktivitas siswa:", e);
  }
}