"use client";

import { useState } from "react";
import { ChevronDown, Calendar, Search, Download, ListFilter } from "lucide-react";
import {
  aktivitasGuruList,
  aktivitasSiswaLogList,
  getJenisBadge,
  getJenisDot,
  getJenisBadgeSiswa,
  getUniqueGuruNamesFromAktivitas,
  getUniqueSiswaNamesFromAktivitas,
  type JenisAktivitas,
  type JenisAktivitasSiswa,
} from "@/lib/dummy-data";
import { exportToExcel, exportToCSV } from "@/lib/export";
import DownloadRekapModal from "@/components/rekap-aktivitas(admin)/DownloadRekapModal";
import Toast from "@/components/ui/Toast";

const jenisGuruOptions: (JenisAktivitas | "Semua Aktivitas")[] = [
  "Semua Aktivitas", "Upload Materi", "Membuat Assessment", "Menilai Tugas", "Mengedit Assessment",
];
const jenisSiswaOptions: (JenisAktivitasSiswa | "Semua Aktivitas")[] = [
  "Semua Aktivitas", "Mengerjakan Assessment", "Melihat Materi", "Mengumpulkan Tugas", "Melihat Nilai",
];

export default function RekapAktivitasPage() {
  const [tab, setTab] = useState<"guru" | "siswa">("guru");

  const [periodeMulai, setPeriodeMulai] = useState("");
  const [periodeSelesai, setPeriodeSelesai] = useState("");
  const [pilihOrang, setPilihOrang] = useState("Semua");
  const [jenisFilter, setJenisFilter] = useState("Semua Aktivitas");

  const [appliedFilter, setAppliedFilter] = useState({ periodeMulai: "", periodeSelesai: "", pilihOrang: "Semua", jenisFilter: "Semua Aktivitas" });

  const [showDownloadModal, setShowDownloadModal] = useState(false);
  const [toastOpen, setToastOpen] = useState(false);

  const guruNames = getUniqueGuruNamesFromAktivitas();
  const siswaNames = getUniqueSiswaNamesFromAktivitas();

  function handleTampilkanRekap() {
    setAppliedFilter({ periodeMulai, periodeSelesai, pilihOrang, jenisFilter });
  }

  const filteredGuru = aktivitasGuruList.filter((a) => {
    const matchMulai = !appliedFilter.periodeMulai || a.tanggalISO >= appliedFilter.periodeMulai;
    const matchSelesai = !appliedFilter.periodeSelesai || a.tanggalISO <= appliedFilter.periodeSelesai;
    const matchOrang = appliedFilter.pilihOrang === "Semua" || a.namaGuru === appliedFilter.pilihOrang;
    const matchJenis = appliedFilter.jenisFilter === "Semua Aktivitas" || a.jenis === appliedFilter.jenisFilter;
    return matchMulai && matchSelesai && matchOrang && matchJenis;
  });

  const filteredSiswa = aktivitasSiswaLogList.filter((a) => {
    const matchMulai = !appliedFilter.periodeMulai || a.tanggalISO >= appliedFilter.periodeMulai;
    const matchSelesai = !appliedFilter.periodeSelesai || a.tanggalISO <= appliedFilter.periodeSelesai;
    const matchOrang = appliedFilter.pilihOrang === "Semua" || a.namaSiswa === appliedFilter.pilihOrang;
    const matchJenis = appliedFilter.jenisFilter === "Semua Aktivitas" || a.jenis === appliedFilter.jenisFilter;
    return matchMulai && matchSelesai && matchOrang && matchJenis;
  });

  function handleSwitchTab(newTab: "guru" | "siswa") {
    setTab(newTab);
    setPilihOrang("Semua");
    setJenisFilter("Semua Aktivitas");
    setAppliedFilter({ periodeMulai: "", periodeSelesai: "", pilihOrang: "Semua", jenisFilter: "Semua Aktivitas" });
  }

  function handleDownload(format: "xlsx" | "csv") {
    const isGuru = tab === "guru";
    const rows = isGuru
      ? filteredGuru.map((a) => ({ Waktu: `${a.tanggal} ${a.waktu}`, "ID Guru": a.idGuru, "Nama Guru": a.namaGuru, Aktivitas: a.jenis, Keterangan: a.keterangan }))
      : filteredSiswa.map((a) => ({ Waktu: `${a.tanggal} ${a.waktu}`, "ID Siswa": a.idSiswa, "Nama Siswa": a.namaSiswa, Kelas: a.kelas, Aktivitas: a.jenis, Keterangan: a.keterangan }));

    const filename = isGuru ? "rekap-aktivitas-guru" : "rekap-aktivitas-siswa";
    const sheetName = isGuru ? "Aktivitas Guru" : "Aktivitas Siswa";

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

      {/* Tabs */}
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

      {/* Filter box */}
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

      {/* Hasil */}
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
              ? filteredGuru.map((a) => (
                  <tr key={a.id} className="border-b border-border/60 transition-colors last:border-0 hover:bg-white/[0.02]">
                    <td className="px-6 py-4">
                      <p className="text-white">{a.tanggal}</p>
                      <p className="text-xs text-muted">{a.waktu}</p>
                    </td>
                    <td className="px-6 py-4 text-primary">{a.idGuru}</td>
                    <td className="px-6 py-4 font-medium text-white">{a.namaGuru}</td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium ${getJenisBadge(a.jenis)}`}>
                        <span className={`h-1.5 w-1.5 rounded-full ${getJenisDot(a.jenis)}`} />
                        {a.jenis}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-300">{a.keterangan}</td>
                  </tr>
                ))
              : filteredSiswa.map((a) => (
                  <tr key={a.id} className="border-b border-border/60 transition-colors last:border-0 hover:bg-white/[0.02]">
                    <td className="px-6 py-4">
                      <p className="text-white">{a.tanggal}</p>
                      <p className="text-xs text-muted">{a.waktu}</p>
                    </td>
                    <td className="px-6 py-4 text-gray-300">{a.idSiswa}</td>
                    <td className="px-6 py-4 font-medium text-white">{a.namaSiswa}</td>
                    <td className="px-6 py-4 text-gray-300">{a.kelas}</td>
                    <td className="px-6 py-4">
                      <span className={`rounded-full px-3 py-1 text-xs font-medium ${getJenisBadgeSiswa(a.jenis)}`}>
                        {a.jenis.toUpperCase()}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-300">{a.keterangan}</td>
                  </tr>
                ))}
            {(tab === "guru" ? filteredGuru.length : filteredSiswa.length) === 0 && (
              <tr>
                <td colSpan={tab === "guru" ? 5 : 6} className="px-6 py-10 text-center text-muted">
                  Tidak ada data ditemukan untuk filter ini.
                </td>
              </tr>
            )}
          </tbody>
        </table>

        <div className="flex items-center justify-between border-t border-border p-5 text-sm text-muted">
          <p>
            Menampilkan {tab === "guru" ? filteredGuru.length : filteredSiswa.length} dari{" "}
            {tab === "guru" ? aktivitasGuruList.length : aktivitasSiswaLogList.length} entri
          </p>
        </div>
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