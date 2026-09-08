"use client";

import { useState } from "react";
import { Search, ChevronDown, ChevronLeft, ChevronRight, Calendar } from "lucide-react";
import {
  aktivitasGuruList,
  getJenisBadge,
  getJenisDot,
  type JenisAktivitas,
} from "@/lib/dummy-data";
import DetailAktivitasModal from "@/components/aktivitas-guru(admin)/DetailAktivitasModal";

const jenisOptions: (JenisAktivitas | "Semua Aktivitas")[] = [
  "Semua Aktivitas",
  "Upload Materi",
  "Membuat Assessment",
  "Menilai Tugas",
];

export default function AktivitasGuruPage() {
  const [search, setSearch] = useState("");
  const [jenisFilter, setJenisFilter] = useState<string>("Semua Aktivitas");
  const [tanggalFilter, setTanggalFilter] = useState("");
  const [selectedGuruId, setSelectedGuruId] = useState<string | null>(null);

  const filtered = aktivitasGuruList.filter((a) => {
    const matchSearch = a.namaGuru.toLowerCase().includes(search.toLowerCase());
    const matchJenis = jenisFilter === "Semua Aktivitas" || a.jenis === jenisFilter;
    return matchSearch && matchJenis;
  });

  return (
    <div>
      <h1 className="animate-fade-in-up text-2xl font-semibold text-white">Aktivitas Guru</h1>
      <p className="animate-fade-in-up mt-1 text-muted" style={{ animationDelay: "60ms" }}>
        Pantau aktivitas guru yang dilakukan dalam sistem LMS.
      </p>

      {/* Filters */}
      <div
        className="animate-fade-in-up mt-6 grid grid-cols-1 gap-4 rounded-2xl border border-border bg-surface p-5 sm:grid-cols-3"
        style={{ animationDelay: "100ms" }}
      >
        <div>
          <label className="mb-1.5 block text-xs font-medium tracking-wide text-muted">PENCARIAN</label>
          <div className="relative">
            <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              type="text"
              placeholder="Cari nama guru..."
              className="w-full rounded-xl border border-border bg-black/30 py-2.5 pl-10 pr-3 text-sm text-gray-200 placeholder-gray-500 outline-none focus:border-primary/50"
            />
          </div>
        </div>

        <div>
          <label className="mb-1.5 block text-xs font-medium tracking-wide text-muted">JENIS AKTIVITAS</label>
          <div className="relative">
            <select
              value={jenisFilter}
              onChange={(e) => setJenisFilter(e.target.value)}
              className="w-full appearance-none rounded-xl border border-border bg-black/30 px-4 py-2.5 text-sm text-gray-200 outline-none focus:border-primary/50"
            >
              {jenisOptions.map((j) => (
                <option key={j} value={j}>{j}</option>
              ))}
            </select>
            <ChevronDown size={15} className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-muted" />
          </div>
        </div>

        <div>
          <label className="mb-1.5 block text-xs font-medium tracking-wide text-muted">TANGGAL</label>
          <div className="relative">
            <Calendar size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted" />
            <input
              value={tanggalFilter}
              onChange={(e) => setTanggalFilter(e.target.value)}
              type="date"
              className="w-full rounded-xl border border-border bg-black/30 py-2.5 pl-10 pr-3 text-sm text-gray-200 outline-none focus:border-primary/50 [color-scheme:dark]"
            />
          </div>
        </div>
      </div>

      {/* Table */}
      <div
        className="animate-fade-in-up mt-5 overflow-hidden rounded-2xl border border-border bg-surface"
        style={{ animationDelay: "140ms" }}
      >
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-border text-xs uppercase tracking-wide text-muted">
              <th className="px-6 py-4 font-medium">Waktu</th>
              <th className="px-6 py-4 font-medium">ID Guru</th>
              <th className="px-6 py-4 font-medium">Nama Guru</th>
              <th className="px-6 py-4 font-medium">Aktivitas</th>
              <th className="px-6 py-4 font-medium">Keterangan</th>
              <th className="px-6 py-4 text-right font-medium">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((a) => (
              <tr key={a.id} className="border-b border-border/60 transition-colors last:border-0 hover:bg-white/[0.02]">
                <td className="px-6 py-4">
                  <p className="text-white">{a.tanggal}</p>
                  <p className="text-xs text-muted">{a.waktu}</p>
                </td>
                <td className="px-6 py-4 text-gray-300">{a.idGuru}</td>
                <td className="px-6 py-4 font-medium text-white">{a.namaGuru}</td>
                <td className="px-6 py-4">
                  <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium ${getJenisBadge(a.jenis)}`}>
                    <span className={`h-1.5 w-1.5 rounded-full ${getJenisDot(a.jenis)}`} />
                    {a.jenis}
                  </span>
                </td>
                <td className="px-6 py-4 text-gray-300">{a.keterangan}</td>
                <td className="px-6 py-4 text-right">
                  <button
                    onClick={() => setSelectedGuruId(a.idGuru)}
                    className="text-sm font-medium text-primary hover:underline"
                  >
                    Lihat Aktivitas
                  </button>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={6} className="px-6 py-10 text-center text-muted">
                  Tidak ada aktivitas ditemukan.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="mt-5 flex items-center justify-between text-sm text-muted">
        <p>Menampilkan 1-{filtered.length} dari {aktivitasGuruList.length} aktivitas</p>
        <div className="flex items-center gap-1.5">
          <button className="flex h-8 w-8 items-center justify-center rounded-lg border border-border text-gray-400 hover:bg-white/5">
            <ChevronLeft size={15} />
          </button>
          <button className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-sm font-semibold text-bg">1</button>
          <button className="flex h-8 w-8 items-center justify-center rounded-lg border border-border text-gray-400 hover:bg-white/5">2</button>
          <button className="flex h-8 w-8 items-center justify-center rounded-lg border border-border text-gray-400 hover:bg-white/5">
            <ChevronRight size={15} />
          </button>
        </div>
      </div>

      <DetailAktivitasModal
        open={!!selectedGuruId}
        onClose={() => setSelectedGuruId(null)}
        idGuru={selectedGuruId}
      />
    </div>
  );
}