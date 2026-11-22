"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Loader2 } from "lucide-react";

type Item = {
  id: string;
  judul: string;
  jenis: "tugas" | "project";
  mapel: string;
  guruNama: string;
  deadline: string;
  status: "belum" | "dikumpulkan" | "terlambat" | "dinilai";
  nilai: number | null;
};

const filters = [
  { value: "semua", label: "Semua" },
  { value: "tugas", label: "Tugas" },
  { value: "project", label: "Project" },
];

function statusInfo(i: Item) {
  if (i.status === "dinilai") return { label: `Dinilai: ${i.nilai}`, cls: "bg-emerald-500/15 text-emerald-300" };
  if (i.status === "terlambat") return { label: "Terlambat dikumpulkan", cls: "bg-amber-500/15 text-amber-300" };
  if (i.status === "dikumpulkan") return { label: "Sudah dikumpulkan", cls: "bg-primary-soft text-primary" };
  return { label: "Belum dikumpulkan", cls: "bg-white/5 text-gray-300" };
}

export default function SiswaTugasProjectPage() {
  const [data, setData] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("semua");

  useEffect(() => {
    fetch("/api/siswa/tugas")
      .then((r) => r.json())
      .then((d) => Array.isArray(d) && setData(d))
      .finally(() => setLoading(false));
  }, []);

  const tampil = data.filter((i) => filter === "semua" || i.jenis === filter);

  return (
    <div>
      <h1 className="animate-fade-in-up text-3xl font-bold text-white">Tugas & Project</h1>
      <p className="animate-fade-in-up mt-2 text-muted" style={{ animationDelay: "40ms" }}>
        Daftar tugas dan project dari guru di kelas Anda.
      </p>

      <div className="mt-6 flex gap-2">
        {filters.map((f) => (
          <button
            key={f.value}
            onClick={() => setFilter(f.value)}
            className={`rounded-full px-5 py-2.5 text-sm font-medium transition-colors ${
              filter === f.value ? "bg-primary text-bg" : "bg-surface text-gray-300 hover:bg-white/5"
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="mt-8 flex items-center gap-2 text-muted">
          <Loader2 size={18} className="animate-spin" /> Memuat data...
        </div>
      ) : tampil.length === 0 ? (
        <p className="mt-8 text-muted">Belum ada tugas.</p>
      ) : (
        <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {tampil.map((i, idx) => {
            const s = statusInfo(i);
            return (
              <Link
                key={i.id}
                href={`/siswa/tugas-project/${i.id}`}
                className="animate-fade-in-up rounded-2xl border border-border bg-surface p-6 transition-colors hover:bg-white/5"
                style={{ animationDelay: `${idx * 40}ms` }}
              >
                <span className="rounded-full bg-primary-soft px-3 py-1 text-xs font-medium capitalize text-primary">
                  {i.jenis}
                </span>
                <h3 className="mt-3 text-xl font-bold text-white">{i.judul}</h3>
                <p className="mt-1 text-sm text-muted">{i.mapel} · {i.guruNama}</p>
                <p className="mt-4 text-sm text-gray-300">
                  Deadline: {new Date(i.deadline).toLocaleString("id-ID", { dateStyle: "medium", timeStyle: "short" })}
                </p>
                <span className={`mt-4 inline-block rounded-full px-3 py-1.5 text-xs font-medium ${s.cls}`}>
                  {s.label}
                </span>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}