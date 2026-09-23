"use client";

import { useEffect, useState } from "react";
import { ChevronDown, Calendar, Search, Download, ListFilter, Loader2 } from "lucide-react";
import { exportToExcel, exportToCSV } from "@/lib/export";
import DownloadRekapModal from "@/components/rekap-aktivitas(admin)/DownloadRekapModal";
import Toast from "@/components/ui/Toast";

type AktivitasGuru = { id: string; idGuru: string; namaGuru: string; jenis: string; keterangan: string; createdAt: string };
type AktivitasSiswa = { id: string; idSiswa: string; namaSiswa: string; kelas: string; jenis: string; keterangan: string; createdAt: string };

const jenisGuruOptions = ["Semua Aktivitas", "Upload Materi", "Membuat Assessment", "Menilai Tugas", "Mengedit Assessment"];
const jenisSiswaOptions = ["Semua Aktivitas", "Mengerjakan Assessment", "Melihat Materi", "Mengumpulkan Tugas", "Melihat Nilai"];

function formatTanggalWaktu(iso: string) {
  const d = new Date(iso);
  const tanggal = d.toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric", timeZone: "Asia/Jakarta" });
  const waktu = d.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit", timeZone: "Asia/Jakarta" });
  return { tanggal, waktu };
}

function toISODate(iso: string) {
  return new Date(iso).toISOString().slice(0, 10);
}

export default function RekapAktivitasPage() {
  const [tab, setTab] = useState<"guru" | "siswa">("guru");
  const [loading, setLoading] = useState(true);

  const [aktivitasGuru, setAktivitasGuru] = useState<AktivitasGuru[]>([]);
  const [aktivitasSiswa, setAktivitasSiswa] = useState<AktivitasSiswa[]>([]);
  const [guruNames, setGuruNames] = useState<string[]>([]);
  const [siswaNames, setSiswaNames] = useState<string[]>([]);

  const [periodeMulai, setPeriodeMulai] = useState("");
  const [periodeSelesai, setPeriodeSelesai] = useState("");
  const [pilihOrang, setPilihOrang] = useState("Semua");
  const [jenisFilter, setJenisFilter] = useState("Semua Aktivitas");
  const [appliedFilter, setAppliedFilter] = useState({ periodeMulai: "", periodeSelesai: "", pilihOrang: "Semua", jenisFilter: "Semua Aktivitas" });

  const [showDownloadModal, setShowDownloadModal] = useState(false);
  const [toastOpen, setToastOpen] = useState(false);

  useEffect(() => {
    async function loadAll() {
      setLoading(true);
      const [agRes, asRes, guruRes, siswaRes] = await Promise.all([
        fetch("/api/aktivitas-guru"),
        fetch("/api/aktivitas-siswa"),
        fetch("/api/guru"),
        fetch("/api/siswa"),
      ]);
      setAktivitasGuru(await agRes.json());
      setAktivitasSiswa(await asRes.json());
      const guruData = await guruRes.json();
      const siswaData = await siswaRes.json();
      setGuruNames(guruData.map((g: any) => g.nama));
      setSiswaNames(siswaData.map((s: any) => s.nama));
      setLoading(false);
    }
    loadAll();
  }, []);

  function handleTampilkanRekap() {
    setAppliedFilter({ periodeMulai, periodeSelesai, pilihOrang, jenisFilter });
  }

  function handleSwitchTab(newTab: "guru" | "siswa") {
    setTab(newTab);
    setPilihOrang("Semua");
    setJenisFilter("Semua Aktivitas");
    setPeriodeMulai("");
    setPeriodeSelesai("");
    setAppliedFilter({ periodeMulai: "", periodeSelesai: "", pilihOrang: "Semua", jenisFilter: "Semua Aktivitas" });
  }

  const filteredGuru = aktivitasGuru.filter((a) => {
    const tgl = toISODate(a.createdAt);
    const matchMulai = !appliedFilter.periodeMulai || tgl >= appliedFilter.periodeMulai;
    const matchSelesai = !appliedFilter.periodeSelesai || tgl <= appliedFilter.periodeSelesai;
    const matchOrang = appliedFilter.pilihOrang === "Semua" || a.namaGuru === appliedFilter.pilihOrang;
    const matchJenis = appliedFilter.jenisFilter === "Semua Aktivitas" || a.jenis === appliedFilter.jenisFilter;
    return matchMulai && matchSelesai && matchOrang && matchJenis;
  });

  const filteredSiswa = aktivitasSiswa.filter((a) => {
    const tgl = toISODate(a.createdAt);
    const matchMulai = !appliedFilter.periodeMulai || tgl >= appliedFilter.periodeMulai;
    const matchSelesai = !appliedFilter.periodeSelesai || tgl <= appliedFilter.periodeSelesai;
    const matchOrang = appliedFilter.pilihOrang === "Semua" || a.namaSiswa === appliedFilter.pilihOrang;
    const matchJenis = appliedFilter.jenisFilter === "Semua Aktivitas" || a.jenis === appliedFilter.jenisFilter;
    return matchMulai && matchSelesai && matchOrang && matchJenis;
  });

  function handleDownload(format: "xlsx" | "csv") {
    const isGuru = tab === "guru";
    const rows = isGuru
      ? filteredGuru.map((a) => {
          const { tanggal, waktu } = formatTanggalWaktu(a.createdAt);
          return { Waktu: `${tanggal} ${waktu}`, "ID Guru": a.idGuru, "Nama Guru": a.namaGuru, Aktivitas: a.jenis, Keterangan: a.keterangan };
        })
      : filteredSiswa.map((a) => {
          const { tanggal, waktu } = formatTanggalWaktu(a.createdAt);
          return { Waktu: `${tanggal} ${waktu}`, "ID Siswa": a.idSiswa, "Nama Siswa": a.namaSiswa, Kelas: a.kelas, Aktivitas: a.jenis, Keterangan: a.keterangan };
        });

    const filename = isGuru ? "rekap-aktivitas-guru" : "rekap-aktivitas-siswa";
    const sheetName = isGuru ? "Aktivitas Guru" : "Aktivitas Siswa";

    if (rows.length === 0) {
      setShowDownloadModal(false);
      return;
    }

    if (format === "xlsx") exportToExcel(rows, sheetName, filename);
    else exportToCSV(rows, filename);

    setShowDownloadModal(false);
    setToastOpen(true);
  }

  return (
    <div>
      <h1 className="animate-fade-in-up text-2xl font-semibold text-white">
        Aktivitas {tab === "guru" ? "Guru" : "Siswa"}
      </h1>
      <p className="animate-fade-in-up mt-1 text-muted" style={{ animationDelay: "60ms" }}>
        Gunakan filter untuk menampilkan aktivitas {tab === "guru" ? "guru" : "siswa"} yang ingin direkap.
      </p>

      <div className="animate-fade-in-up mt-6 inline-flex gap-1 rounded-2xl border border-border bg-surface p-1.5" style={{ animationDelay: "100ms" }}>
        <button
          onClick={() => handleSwitchTab("guru")}
          className={`rounded-xl px-5 py-2 text-sm font-medium transition-colors ${tab === "guru" ? "bg-primary text-bg" : "text-gray-400 hover:text-gray-200"}`}
        >
          Aktivitas Guru
        </button>
        <button
          onClick={() => handleSwitchTab("siswa")}
          className={`rounded-xl px-5 py-2 text-sm font-medium transition-colors ${tab === "siswa" ? "bg-primary text-bg" : "text-gray-400 hover:text-gray-200"}`}
        >
          Aktivitas Siswa
        </button>
      </div>

      <div className="animate-fade-in-up mt-5 rounded-2xl border border-border bg-surface p-6" style={{ animationDelay: "140ms" }}>
        <div className="mb-5 flex items-center gap-2 text-sm font-medium text-white">
          <ListFilter size={16} /> Parameter Filter
        </div>

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <label className="mb-1.5 block text-xs font-medium tracking-wide text-muted">PERIODE MULAI</label>
            <div className="relative">
              <Calendar size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted" />
              <input
                value={periodeMulai}
                onChange={(e) => setPeriodeMulai(e.target.value)}
                type="date"
                className="w-full rounded-xl border border-border bg-black/30 py-2.5 pl-9 pr-3 text-sm text-gray-200 outline-none focus:border-primary/50 [color-scheme:dark]"
              />
            </div>
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-medium tracking-wide text-muted">PERIODE SELESAI</label>
            <div className="relative">
              <Calendar size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted" />
              <input
                value={periodeSelesai}
                onChange={(e) => setPeriodeSelesai(e.target.value)}
                type="date"
                className="w-full rounded-xl border border-border bg-black/30 py-2.5 pl-9 pr-3 text-sm text-gray-200 outline-none focus:border-primary/50 [color-scheme:dark]"
              />
            </div>
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-medium tracking-wide text-muted">
              {tab === "guru" ? "PILIH GURU" : "PILIH SISWA"}
            </label>
            <div className="relative">
              <select
                value={pilihOrang}
                onChange={(e) => setPilihOrang(e.target.value)}
                className="w-full appearance-none rounded-xl border border-border bg-black/30 px-3 py-2.5 text-sm text-gray-200 outline-none focus:border-primary/50"
              >
                <option value="Semua">{tab === "guru" ? "Semua Guru" : "Semua Siswa"}</option>
                {(tab === "guru" ? guruNames : siswaNames).map((n) => (
                  <option key={n} value={n}>{n}</option>
                ))}
              </select>
              <ChevronDown size={14} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-muted" />
            </div>
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-medium tracking-wide text-muted">JENIS AKTIVITAS</label>
            <div className="relative">
              <select
                value={jenisFilter}
                onChange={(e) => setJenisFilter(e.target.value)}
                className="w-full appearance-none rounded-xl border border-border bg-black/30 px-3 py-2.5 text-sm text-gray-200 outline-none focus:border-primary/50"
              >
                {(tab === "guru" ? jenisGuruOptions : jenisSiswaOptions).map((j) => (
                  <option key={j} value={j}>{j}</option>
                ))}
              </select>
              <ChevronDown size={14} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-muted" />
            </div>
          </div>
        </div>

        <button
          onClick={handleTampilkanRekap}
          className="mt-5 flex items-center gap-2 rounded-full bg-primary px-6 py-2.5 text-sm font-semibold text-bg transition-transform hover:scale-105"
        >
          <Search size={15} /> Tampilkan Rekap
        </button>
      </div>

      <div className="animate-fade-in-up mt-5 overflow-hidden rounded-2xl border border-border bg-surface" style={{ animationDelay: "180ms" }}>
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border p-6">
          <div>
            <p className="font-semibold text-white">Hasil Rekap Aktivitas {tab === "guru" ? "Guru" : "Siswa"}</p>
            <p className="mt-0.5 text-sm text-muted">
              Menampilkan data aktivitas {tab === "guru" ? "guru" : "siswa"} berdasarkan filter yang dipilih.
            </p>
          </div>
          <button
            onClick={() => setShowDownloadModal(true)}
            className="flex items-center gap-2 rounded-full border border-border px-5 py-2.5 text-sm text-gray-300 transition-colors hover:bg-white/5"
          >
            <Download size={15} /> Download Rekap
          </button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center gap-2 py-16 text-muted">
            <Loader2 size={18} className="animate-spin" /> Memuat data...
          </div>
        ) : (
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-border text-xs uppercase tracking-wide text-muted">
                <th className="px-6 py-4 font-medium">Waktu</th>
                <th className="px-6 py-4 font-medium">ID {tab === "guru" ? "Guru" : "Siswa"}</th>
                <th className="px-6 py-4 font-medium">Nama {tab === "guru" ? "Guru" : "Siswa"}</th>
                {tab === "siswa" && <th className="px-6 py-4 font-medium">Kelas</th>}
                <th className="px-6 py-4 font-medium">Aktivitas</th>
                <th className="px-6 py-4 font-medium">Keterangan</th>
              </tr>
            </thead>
            <tbody>
              {tab === "guru"
                ? filteredGuru.map((a) => {
                    const { tanggal, waktu } = formatTanggalWaktu(a.createdAt);
                    return (
                      <tr key={a.id} className="border-b border-border/60 transition-colors last:border-0 hover:bg-white/[0.02]">
                        <td className="px-6 py-4">
                          <p className="text-white">{tanggal}</p>
                          <p className="text-xs text-muted">{waktu}</p>
                        </td>
                        <td className="px-6 py-4 text-primary">{a.idGuru}</td>
                        <td className="px-6 py-4 font-medium text-white">{a.namaGuru}</td>
                        <td className="px-6 py-4 text-gray-300">{a.jenis}</td>
                        <td className="px-6 py-4 text-gray-300">{a.keterangan}</td>
                      </tr>
                    );
                  })
                : filteredSiswa.map((a) => {
                    const { tanggal, waktu } = formatTanggalWaktu(a.createdAt);
                    return (
                      <tr key={a.id} className="border-b border-border/60 transition-colors last:border-0 hover:bg-white/[0.02]">
                        <td className="px-6 py-4">
                          <p className="text-white">{tanggal}</p>
                          <p className="text-xs text-muted">{waktu}</p>
                        </td>
                        <td className="px-6 py-4 text-gray-300">{a.idSiswa}</td>
                        <td className="px-6 py-4 font-medium text-white">{a.namaSiswa}</td>
                        <td className="px-6 py-4 text-gray-300">{a.kelas}</td>
                        <td className="px-6 py-4 text-gray-300">{a.jenis}</td>
                        <td className="px-6 py-4 text-gray-300">{a.keterangan}</td>
                      </tr>
                    );
                  })}
              {(tab === "guru" ? filteredGuru.length : filteredSiswa.length) === 0 && (
                <tr>
                  <td colSpan={tab === "guru" ? 5 : 6} className="px-6 py-16 text-center text-muted">
                    Belum ada data aktivitas {tab === "guru" ? "guru" : "siswa"}. Data akan muncul otomatis setelah role {tab === "guru" ? "Guru" : "Siswa"} aktif digunakan.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>

      <div className="mt-5 flex items-center justify-between text-sm text-muted">
        <p>
          Menampilkan {tab === "guru" ? filteredGuru.length : filteredSiswa.length} dari{" "}
          {tab === "guru" ? aktivitasGuru.length : aktivitasSiswa.length} entri
        </p>
      </div>

      <DownloadRekapModal
        open={showDownloadModal}
        onClose={() => setShowDownloadModal(false)}
        onConfirm={handleDownload}
        title={`Download Rekap Aktivitas ${tab === "guru" ? "Guru" : "Siswa"}`}
      />

      <Toast open={toastOpen} onClose={() => setToastOpen(false)} message="Rekap Berhasil didownload" />
    </div>
  );
}