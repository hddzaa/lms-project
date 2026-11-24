"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronDown, ChevronRight, Download, Loader2, FileSpreadsheet, Lock } from "lucide-react";
import { exportToExcel, exportToCSV } from "@/lib/export";

type KelasOpsi = { id: string; nama: string };
type BarisSiswa = {
  id: string;
  nama: string;
  nis: string;
  perMapel: Record<string, number | null>;
  akhir: number | null;
};
type DataNilai = {
  kelas: { id: string; nama: string };
  mapel: string[];
  jumlahAssessment: number;
  jumlahTugas: number;
  siswa: BarisSiswa[];
};

const KUNCI_KELAS = "guru-nilai-kelas";

function tampilNilai(n: number | null) {
  return n === null ? "-" : String(n);
}

function warnaNilai(n: number | null) {
  if (n === null) return "text-muted";
  if (n >= 75) return "text-emerald-300";
  if (n >= 60) return "text-amber-300";
  return "text-red-300";
}

export default function GuruNilaiPage() {
  const router = useRouter();
  const [kelasList, setKelasList] = useState<KelasOpsi[]>([]);
  const [kelasId, setKelasId] = useState<string>("");
  const [data, setData] = useState<DataNilai | null>(null);
  const [loadingKelas, setLoadingKelas] = useState<boolean>(true);
  const [loadingNilai, setLoadingNilai] = useState<boolean>(false);
  const [error, setError] = useState<string>("");

  useEffect(() => {
    fetch("/api/guru/nilai")
      .then((r) => r.json())
      .then((d) => {
        if (Array.isArray(d.kelas)) {
          setKelasList(d.kelas);
          if (d.kelas.length > 0) {
            let tersimpan = "";
            try {
              tersimpan = sessionStorage.getItem(KUNCI_KELAS) ?? "";
            } catch {
              tersimpan = "";
            }
            const ada = d.kelas.find((k: KelasOpsi) => k.id === tersimpan);
            setKelasId(ada ? ada.id : d.kelas[0].id);
          }
        }
      })
      .finally(() => setLoadingKelas(false));
  }, []);

  useEffect(() => {
    if (!kelasId) return;
    try {
      sessionStorage.setItem(KUNCI_KELAS, kelasId);
    } catch {
      // abaikan jika penyimpanan tidak tersedia
    }
    setLoadingNilai(true);
    setError("");
    fetch("/api/guru/nilai?kelasId=" + kelasId)
      .then(async (r) => {
        const d = await r.json();
        if (!r.ok) {
          setData(null);
          setError(d.error || "Gagal memuat nilai.");
          return;
        }
        setData(d);
      })
      .finally(() => setLoadingNilai(false));
  }, [kelasId]);

  // File unduhan tetap memuat nilai semua mapel
  function buatBaris() {
    if (!data) return [];
    return data.siswa.map((s, i) => {
      const baris: Record<string, any> = { No: i + 1, Nama: s.nama, NIS: s.nis };
      for (const m of data.mapel) baris[m] = s.perMapel[m] ?? "";
      baris["Nilai Akhir"] = s.akhir ?? "";
      return baris;
    });
  }

  function unduhExcel() {
    if (!data) return;
    exportToExcel(buatBaris(), "Nilai", "nilai-" + data.kelas.nama.replace(/\s+/g, "-"));
  }

  function unduhCSV() {
    if (!data) return;
    exportToCSV(buatBaris(), "nilai-" + data.kelas.nama.replace(/\s+/g, "-"));
  }

  return (
    <div>
      <h1 className="animate-fade-in-up text-3xl font-bold text-white">Nilai Siswa</h1>
      <p className="animate-fade-in-up mt-2 text-muted" style={{ animationDelay: "40ms" }}>
        Nilai akhir siswa di kelas yang Anda walikan. Klik siswa untuk melihat nilai per mata pelajaran.
      </p>

      {loadingKelas ? (
        <div className="mt-8 flex items-center gap-2 text-muted">
          <Loader2 size={18} className="animate-spin" /> Memuat kelas...
        </div>
      ) : kelasList.length === 0 ? (
        <div className="mt-8 flex max-w-xl items-start gap-3 rounded-2xl border border-border bg-surface p-6">
          <Lock size={20} className="mt-0.5 shrink-0 text-muted" />
          <div>
            <p className="font-semibold text-white">Halaman ini khusus wali kelas</p>
            <p className="mt-1 text-sm text-muted">
              Nilai siswa hanya dapat dilihat oleh wali kelas dari kelas tersebut. Anda belum terdaftar sebagai wali
              kelas.
            </p>
          </div>
        </div>
      ) : (
        <>
          <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="relative w-full sm:w-72">
              <select
                value={kelasId}
                onChange={(e) => setKelasId(e.target.value)}
                className="w-full appearance-none rounded-xl border border-border bg-surface px-4 py-3 text-sm text-gray-200 outline-none focus:border-primary/50"
              >
                {kelasList.map((k) => (
                  <option key={k.id} value={k.id}>
                    {k.nama}
                  </option>
                ))}
              </select>
              <ChevronDown
                size={16}
                className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-muted"
              />
            </div>

            <div className="flex gap-2">
              <button
                onClick={unduhExcel}
                disabled={!data || data.siswa.length === 0}
                className="flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-bg transition-transform hover:scale-105 disabled:opacity-50 disabled:hover:scale-100"
              >
                <FileSpreadsheet size={16} /> Unduh Excel
              </button>
              <button
                onClick={unduhCSV}
                disabled={!data || data.siswa.length === 0}
                className="flex items-center gap-2 rounded-full border border-border px-5 py-2.5 text-sm font-medium text-gray-200 transition-colors hover:bg-white/5 disabled:opacity-50"
              >
                <Download size={16} /> CSV
              </button>
            </div>
          </div>

          {loadingNilai ? (
            <div className="mt-8 flex items-center gap-2 text-muted">
              <Loader2 size={18} className="animate-spin" /> Memuat nilai...
            </div>
          ) : error ? (
            <p className="mt-8 text-red-400">{error}</p>
          ) : data ? (
            <>
              <p className="mt-6 text-sm text-muted">
                {data.siswa.length} siswa · {data.mapel.length} mapel · {data.jumlahAssessment} assessment ·{" "}
                {data.jumlahTugas} tugas/project. Nilai akhir adalah rata-rata semua nilai yang sudah dinilai.
              </p>

              {data.siswa.length === 0 ? (
                <p className="mt-6 text-muted">Belum ada siswa di kelas ini.</p>
              ) : (
                <div className="mt-4 overflow-x-auto rounded-2xl border border-border bg-surface">
                  <table className="w-full min-w-[520px] text-left text-sm">
                    <thead>
                      <tr className="border-b border-border text-xs tracking-wide text-muted">
                        <th className="px-4 py-3 font-medium">NO</th>
                        <th className="px-4 py-3 font-medium">NAMA</th>
                        <th className="px-4 py-3 font-medium">NIS</th>
                        <th className="px-4 py-3 text-center font-medium text-primary">NILAI AKHIR</th>
                        <th className="w-10 px-4 py-3" />
                      </tr>
                    </thead>
                    <tbody>
                      {data.siswa.map((s, i) => (
                        <tr
                          key={s.id}
                          onClick={() => router.push("/guru/nilai/" + s.id)}
                          className="group cursor-pointer border-b border-border/50 transition-colors last:border-0 hover:bg-white/5"
                        >
                          <td className="px-4 py-3 text-muted">{i + 1}</td>
                          <td className="px-4 py-3 font-medium text-white">{s.nama}</td>
                          <td className="px-4 py-3 text-gray-300">{s.nis}</td>
                          <td className={"px-4 py-3 text-center text-base font-bold " + warnaNilai(s.akhir)}>
                            {tampilNilai(s.akhir)}
                          </td>
                          <td className="px-4 py-3 text-muted">
                            <ChevronRight
                              size={18}
                              className="transition-transform duration-200 group-hover:translate-x-1 group-hover:text-primary"
                            />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </>
          ) : null}
        </>
      )}
    </div>
  );
}