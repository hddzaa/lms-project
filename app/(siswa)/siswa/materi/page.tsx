"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Loader2, BookOpen, ChevronDown } from "lucide-react";

type Materi = {
  id: string;
  judul: string;
  mapel: string;
  guruNama: string;
  files: { name: string }[];
  createdAt: string;
};

export default function SiswaMateriPage() {
  const [data, setData] = useState<Materi[]>([]);
  const [loading, setLoading] = useState(true);
  const [mapelFilter, setMapelFilter] = useState("Semua Mapel");

  useEffect(() => {
    fetch("/api/siswa/materi")
      .then((res) => res.json())
      .then((d) => setData(d))
      .finally(() => setLoading(false));
  }, []);

  const mapelOptions = ["Semua Mapel", ...Array.from(new Set(data.map((d) => d.mapel)))];
  const filtered = mapelFilter === "Semua Mapel" ? data : data.filter((m) => m.mapel === mapelFilter);

  const grouped = filtered.reduce((acc: Record<string, Materi[]>, m) => {
    if (!acc[m.mapel]) acc[m.mapel] = [];
    acc[m.mapel].push(m);
    return acc;
  }, {});
  const groupKeys = Object.keys(grouped).sort();

  return (
    <div>
      <h1 className="animate-fade-in-up text-2xl font-semibold text-white">Materi</h1>
      <p className="animate-fade-in-up mt-1 text-muted" style={{ animationDelay: "60ms" }}>
        Materi pembelajaran dari guru di kelas Anda.
      </p>

      <div className="animate-fade-in-up mt-6" style={{ animationDelay: "100ms" }}>
        <div className="relative inline-block">
          <select
            value={mapelFilter}
            onChange={(e) => setMapelFilter(e.target.value)}
            className="appearance-none rounded-xl border border-border bg-surface px-4 py-2.5 pr-9 text-sm text-gray-200 outline-none focus:border-primary/50"
          >
            {mapelOptions.map((m) => (<option key={m} value={m}>{m}</option>))}
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
          Belum ada materi untuk kelas Anda.
        </div>
      ) : (
        <div className="mt-6 space-y-8">
          {groupKeys.map((mapel, gi) => {
            const items = grouped[mapel].sort(
              (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
            );
            return (
              <div key={mapel} className="animate-fade-in-up" style={{ animationDelay: `${gi * 60}ms` }}>
                <div className="mb-3 flex items-center gap-2">
                  <span className="rounded-full bg-primary-soft px-3 py-1 text-xs font-medium text-primary">{mapel}</span>
                  <span className="text-xs text-muted">({items.length} materi)</span>
                </div>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {items.map((m) => (
                    <Link
                      key={m.id}
                      href={`/siswa/materi/${m.id}`}
                      className="rounded-2xl border border-border bg-surface p-5 transition-all duration-300 hover:-translate-y-1 hover:border-primary/30"
                    >
                      <h3 className="text-base font-semibold text-white">{m.judul}</h3>
                      <p className="mt-2 text-xs text-muted">Oleh {m.guruNama}</p>
                      <p className="mt-1 text-xs text-muted">
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