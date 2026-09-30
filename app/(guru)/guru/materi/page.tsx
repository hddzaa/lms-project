"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Plus, Loader2, BookOpen } from "lucide-react";
import { getFileMeta } from "@/lib/materiHelpers";

type Materi = {
  id: string;
  judul: string;
  mapel: string;
  kelasLabel: string;
  files: { name: string }[];
  status: string;
  createdAt: string;
};

export default function MateriListPage() {
  const [data, setData] = useState<Materi[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/materi")
      .then((res) => res.json())
      .then((d) => setData(d))
      .finally(() => setLoading(false));
  }, []);

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

      {loading ? (
        <div className="mt-6 flex items-center justify-center gap-2 rounded-2xl border border-border bg-surface py-16 text-muted">
          <Loader2 size={18} className="animate-spin" /> Memuat materi...
        </div>
      ) : (
        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {data.map((m, i) => (
            <Link
              key={m.id}
              href={`/guru/materi/${m.id}`}
              className="animate-fade-in-up rounded-2xl border border-border bg-surface p-6 transition-all duration-300 hover:-translate-y-1 hover:border-primary/30"
              style={{ animationDelay: `${100 + i * 60}ms` }}
            >
              <div className="mb-3 flex gap-2">
                <span className="rounded-full bg-primary-soft px-3 py-1 text-xs font-medium text-primary">{m.mapel}</span>
                <span className="rounded-full bg-secondary-soft px-3 py-1 text-xs font-medium text-secondary">{m.kelasLabel}</span>
              </div>
              <h3 className="text-lg font-semibold text-white">{m.judul}</h3>
              <p className="mt-2 text-xs text-muted">{m.files.length} file terlampir</p>
            </Link>
          ))}
          {data.length === 0 && (
            <div className="col-span-full flex flex-col items-center gap-3 rounded-2xl border border-border bg-surface py-16 text-muted">
              <BookOpen size={28} />
              Belum ada materi. Klik "Upload Materi Baru" untuk menambahkan.
            </div>
          )}
        </div>
      )}
    </div>
  );
}