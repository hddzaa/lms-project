"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Plus, Loader2, BookOpen, ChevronDown } from "lucide-react";

type Materi = {
  id: string;
  judul: string;
  mapel: string;
  kelasLabel: string;
  files: { name: string }[];
  status: string;
  createdAt: string;
};

type Kelas = { id: string; grade: string; name: string };

export default function MateriListPage() {
  const [data, setData] = useState<Materi[]>([]);
  const [loading, setLoading] = useState(true);
  const [mapelOptions, setMapelOptions] = useState<string[]>([]);
  const [kelasOptions, setKelasOptions] = useState<Kelas[]>([]);
  const [mapelFilter, setMapelFilter] = useState("Semua Mapel");
  const [kelasFilter, setKelasFilter] = useState("Semua Kelas");

  useEffect(() => {
    Promise.all([
      fetch("/api/materi").then((r) => r.json()),
      fetch("/api/mapel").then((r) => r.json()),
      fetch("/api/kelas").then((r) => r.json()),
    ]).then(([materiData, mapelData, kelasData]) => {
      setData(materiData);
      setMapelOptions(mapelData.map((m: any) => m.nama));
      setKelasOptions(kelasData.map((k: any) => ({ id: k.id, grade: k.grade, name: k.name })));
      setLoading(false);
    });
  }, []);

  const kelasLabelOptions = kelasOptions.map((k) => `${k.grade} ${k.name}`);

  const filtered = data.filter((m) => {
    const matchMapel = mapelFilter === "Semua Mapel" || m.mapel === mapelFilter;
    const matchKelas = kelasFilter === "Semua Kelas" || m.kelasLabel === kelasFilter;
    return matchMapel && matchKelas;
  });

  const grouped = filtered.reduce((acc: Record<string, Materi[]>, m) => {
    const key = `${m.mapel} — ${m.kelasLabel}`;
    if (!acc[key]) acc[key] = [];
    acc[key].push(m);
    return acc;
  }, {});

  const groupKeys = Object.keys(grouped).sort();

  return (
    <div>
      <div className="flex items-start justify-between">
        <div>
          <h1 className="animate-fade-in-up text-2xl font-semibold text-white">Materi</h1>
          <p className="animate-fade-in-up mt-1 text-muted" style={{ animationDelay: "60ms" }}>
            Kelola materi pembelajaran untuk kelas yang Anda ajar.
          </p>
        </div>
        <Link
          href="/guru/materi/tambah"
          className="animate-fade-in-up flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-bg transition-transform hover:scale-105"
          style={{ animationDelay: "80ms" }}
        >
          <Plus size={16} /> Upload Materi Baru
        </Link>
      </div>

      <div className="animate-fade-in-up mt-6 flex flex-wrap gap-3" style={{ animationDelay: "100ms" }}>
        <div className="relative">
          <select
            value={mapelFilter}
            onChange={(e) => setMapelFilter(e.target.value)}
            className="appearance-none rounded-xl border border-border bg-surface px-4 py-2.5 pr-9 text-sm text-gray-200 outline-none focus:border-primary/50"
          >
            <option>Semua Mapel</option>
            {mapelOptions.map((m) => (<option key={m} value={m}>{m}</option>))}
          </select>
          <ChevronDown size={14} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-muted" />
        </div>
        <div className="relative">
          <select
            value={kelasFilter}
            onChange={(e) => setKelasFilter(e.target.value)}
            className="appearance-none rounded-xl border border-border bg-surface px-4 py-2.5 pr-9 text-sm text-gray-200 outline-none focus:border-primary/50"
          >
            <option>Semua Kelas</option>
            {kelasLabelOptions.map((k) => (<option key={k} value={k}>{k}</option>))}
          </select>
          <ChevronDown size={14} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-muted" />
        </div>
      </div>

      {loading ? (
        <div className="mt-6 flex items-center justify-center gap-2 rounded-2xl border border-border bg-surface py-16 text-muted">
          <Loader2 size={18} className="animate-spin" /> Memuat materi...
        </div>
      ) : groupKeys.length === 0 ? (
        <div className="mt-6 flex flex-col items-center gap-3 rounded-2xl border border-border bg-surface py-16 text-muted">
          <BookOpen size={28} />
          Tidak ada materi untuk filter ini.
        </div>
      ) : (
        <div className="mt-6 space-y-8">
          {groupKeys.map((key, gi) => {
            const [mapel, kelasLabel] = key.split(" — ");
            const items = grouped[key].sort(
              (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
            );
            return (
              <div key={key} className="animate-fade-in-up" style={{ animationDelay: `${gi * 60}ms` }}>
                <div className="mb-3 flex items-center gap-2">
                  <span className="rounded-full bg-primary-soft px-3 py-1 text-xs font-medium text-primary">{mapel}</span>
                  <span className="rounded-full bg-secondary-soft px-3 py-1 text-xs font-medium text-secondary">{kelasLabel}</span>
                  <span className="text-xs text-muted">({items.length} materi)</span>
                </div>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {items.map((m) => (
                    <Link
                      key={m.id}
                      href={`/guru/materi/${m.id}`}
                      className="rounded-2xl border border-border bg-surface p-5 transition-all duration-300 hover:-translate-y-1 hover:border-primary/30"
                    >
                      <h3 className="text-base font-semibold text-white">{m.judul}</h3>
                      <p className="mt-2 text-xs text-muted">
                        {m.files.length} file · {new Date(m.createdAt).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric", timeZone: "Asia/Jakarta" })}
                      </p>
                    </Link>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}