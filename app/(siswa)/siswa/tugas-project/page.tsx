"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Loader2, ClipboardList } from "lucide-react";

type Tugas = {
  id: string;
  judul: string;
  jenis: "tugas" | "project";
  mode: "individu" | "kelompok";
  mapel: string;
  guruNama: string;
  deadline: string;
  submission: { status: "dikumpulkan" | "terlambat"; nilai: number | null } | null;
};

export default function SiswaTugasProjectPage() {
  const [data, setData] = useState<Tugas[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"semua" | "tugas" | "project">("semua");

  useEffect(() => {
    fetch("/api/siswa/tugas")
      .then((r) => r.json())
      .then((d) => setData(Array.isArray(d) ? d : []))
      .finally(() => setLoading(false));
  }, []);

  const tampil = data.filter((t) => filter === "semua" || t.jenis === filter);

  function badge(t: Tugas) {
    if (t.submission?.nilai !== null && t.submission?.nilai !== undefined)
      return { label: `Dinilai: ${t.submission.nilai}`, cls: "bg-primary-soft text-primary" };
    if (t.submission)
      return t.submission.status === "terlambat"
        ? { label: "Terkumpul (Terlambat)", cls: "bg-red-500/15 text-red-400" }
        : { label: "Sudah dikumpulkan", cls: "bg-emerald-500/15 text-emerald-400" };
    if (new Date(t.deadline) < new Date()) return { label: "Lewat deadline", cls: "bg-red-500/15 text-red-400" };
    return { label: "Belum dikumpulkan", cls: "bg-white/10 text-gray-300" };
  }

  return (
    <div>
      <h1 className="animate-fade-in-up text-2xl font-semibold text-white">Tugas & Project</h1>
      <p className="animate-fade-in-up mt-1 text-muted" style={{ animationDelay: "60ms" }}>
        Daftar tugas dan project dari guru di kelas Anda.
      </p>

      <div className="animate-fade-in-up mt-6 flex gap-2" style={{ animationDelay: "100ms" }}>
        {(["semua", "tugas", "project"] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`rounded-full px-4 py-1.5 text-sm capitalize transition-colors ${
              filter === f ? "bg-primary font-semibold text-bg" : "bg-white/10 text-gray-300 hover:bg-white/20"
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="mt-6 flex items-center justify-center gap-2 rounded-2xl border border-border bg-surface py-16 text-muted">
          <Loader2 size={18} className="animate-spin" /> Memuat tugas...
        </div>
      ) : tampil.length === 0 ? (
        <div className="mt-6 flex flex-col items-center gap-3 rounded-2xl border border-border bg-surface py-16 text-muted">
          <ClipboardList size={28} />
          Belum ada tugas untuk kelas Anda.
        </div>
      ) : (
        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {tampil.map((t, i) => {
            const b = badge(t);
            return (
              <Link
                key={t.id}
                href={`/siswa/tugas-project/${t.id}`}
                className="animate-fade-in-up rounded-2xl border border-border bg-surface p-5 transition-all duration-300 hover:-translate-y-1 hover:border-primary/30"
                style={{ animationDelay: `${i * 40}ms` }}
              >
                <div className="mb-2 flex items-center gap-2 text-xs">
                  <span className="rounded-full bg-primary-soft px-2.5 py-1 font-medium capitalize text-primary">{t.jenis}</span>
                  <span className="rounded-full bg-white/10 px-2.5 py-1 capitalize text-gray-300">{t.mode}</span>
                </div>
                <h3 className="text-base font-semibold text-white">{t.judul}</h3>
                <p className="mt-1 text-xs text-muted">{t.mapel} · {t.guruNama}</p>
                <p className="mt-3 text-xs text-gray-300">
                  Deadline: {new Date(t.deadline).toLocaleString("id-ID", { dateStyle: "medium", timeStyle: "short", timeZone: "Asia/Jakarta" })}
                </p>
                <span className={`mt-3 inline-block rounded-full px-3 py-1 text-xs font-medium ${b.cls}`}>{b.label}</span>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}