"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Search, ChevronDown, Plus, Eye, FlaskConical, Loader2 } from "lucide-react";

type Assessment = {
  id: string;
  judul: string;
  mapel: string;
  kelasLabel: string;
  jenis: string;
  deadline: string;
  status: string;
  jumlahSoal: number;
};

const jenisBadge: Record<string, string> = {
  Kuis: "bg-violet-400/10 text-violet-300",
  Ujian: "bg-cyan-400/10 text-cyan-300",
  Penilaian: "bg-emerald-400/10 text-emerald-300",
};

export default function AssessmentListPage() {
  const [data, setData] = useState<Assessment[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [mapelFilter, setMapelFilter] = useState("Semua Mapel");
  const [jenisFilter, setJenisFilter] = useState("Semua Jenis");

  useEffect(() => {
    fetch("/api/assessment").then((r) => r.json()).then((d) => setData(d)).finally(() => setLoading(false));
  }, []);

  const mapelOptions = ["Semua Mapel", ...Array.from(new Set(data.map((d) => d.mapel)))];

  const filtered = data.filter((a) => {
    const matchSearch = a.judul.toLowerCase().includes(search.toLowerCase());
    const matchMapel = mapelFilter === "Semua Mapel" || a.mapel === mapelFilter;
    const matchJenis = jenisFilter === "Semua Jenis" || a.jenis === jenisFilter;
    return matchSearch && matchMapel && matchJenis;
  });

  return (
    <div>
      <h1 className="animate-fade-in-up text-2xl font-semibold text-white">Assessment</h1>
      <p className="animate-fade-in-up mt-1 text-muted" style={{ animationDelay: "60ms" }}>
        Kelola assessment yang akan diberikan kepada siswa.
      </p>

      <div className="animate-fade-in-up mt-6 flex flex-wrap items-center justify-between gap-3" style={{ animationDelay: "100ms" }}>
        <div className="flex flex-wrap gap-3">
          <div className="relative w-64">
            <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              type="text"
              placeholder="Cari assessment..."
              className="w-full rounded-xl border border-border bg-surface py-2.5 pl-9 pr-4 text-sm text-gray-200 placeholder-gray-500 outline-none focus:border-primary/50"
            />
          </div>
          <div className="relative">
            <select
              value={mapelFilter}
              onChange={(e) => setMapelFilter(e.target.value)}
              className="appearance-none rounded-xl border border-border bg-surface px-4 py-2.5 pr-9 text-sm text-gray-200 outline-none focus:border-primary/50"
            >
              {mapelOptions.map((m) => (<option key={m} value={m}>{m}</option>))}
            </select>
            <ChevronDown size={14} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-muted" />
          </div>
          <div className="relative">
            <select
              value={jenisFilter}
              onChange={(e) => setJenisFilter(e.target.value)}
              className="appearance-none rounded-xl border border-border bg-surface px-4 py-2.5 pr-9 text-sm text-gray-200 outline-none focus:border-primary/50"
            >
              <option>Semua Jenis</option>
              <option>Kuis</option>
              <option>Ujian</option>
              <option>Penilaian</option>
            </select>
            <ChevronDown size={14} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-muted" />
          </div>
        </div>
        <Link href="/guru/assessment/tambah" className="flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-bg transition-transform hover:scale-105">
          <Plus size={16} /> Buat Assessment
        </Link>
      </div>

      <div className="animate-fade-in-up mt-5 overflow-hidden rounded-2xl border border-border bg-surface" style={{ animationDelay: "140ms" }}>
        {loading ? (
          <div className="flex items-center justify-center gap-2 py-16 text-muted">
            <Loader2 size={18} className="animate-spin" /> Memuat assessment...
          </div>
        ) : (
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-border text-xs uppercase tracking-wide text-muted">
                <th className="px-6 py-4 font-medium">Judul Assessment</th>
                <th className="px-6 py-4 font-medium">Mata Pelajaran</th>
                <th className="px-6 py-4 font-medium">Kelas</th>
                <th className="px-6 py-4 font-medium">Jenis</th>
                <th className="px-6 py-4 font-medium">Deadline</th>
                <th className="px-6 py-4 font-medium">Status</th>
                <th className="px-6 py-4 text-right font-medium">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((a) => (
                <tr key={a.id} className="border-b border-border/60 transition-colors last:border-0 hover:bg-white/[0.02]">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary-soft text-primary"><FlaskConical size={16} /></span>
                      <span className="font-medium text-white">{a.judul}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-gray-300">{a.mapel}</td>
                  <td className="px-6 py-4 text-gray-300">{a.kelasLabel}</td>
                  <td className="px-6 py-4">
                    <span className={`rounded-full px-3 py-1 text-xs font-medium uppercase ${jenisBadge[a.jenis]}`}>{a.jenis}</span>
                  </td>
                  <td className="px-6 py-4 text-gray-300">
                    {a.deadline ? new Date(a.deadline).toLocaleString("id-ID", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit", timeZone: "Asia/Jakarta" }) : "-"}
                  </td>
                  <td className="px-6 py-4">
                    {a.status === "Dipublikasikan" ? (
                      <span className="flex items-center gap-1.5 text-xs font-medium text-primary"><span className="h-1.5 w-1.5 rounded-full bg-primary" /> Dipublikasikan</span>
                    ) : (
                      <span className="text-xs font-medium text-muted">Draft</span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-right">
                    {a.status === "Draft" ? (
                      <Link href={`/guru/assessment/${a.id}/soal`} className="rounded-full bg-primary px-4 py-1.5 text-xs font-semibold text-bg">
                        Lanjutkan Draft
                      </Link>
                    ) : (
                      <Link href={`/guru/assessment/${a.id}/soal`} className="text-gray-400 hover:text-gray-200"><Eye size={16} /></Link>
                    )}
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr><td colSpan={7} className="px-6 py-16 text-center text-muted">Belum ada assessment. Klik "Buat Assessment" untuk membuat.</td></tr>
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}