"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { Loader2 } from "lucide-react";

type Item = {
  tipe: string;
  judul: string;
  nilai: number | null;
  status: string;
  waktu: string | null;
};
type MapelNilai = { nama: string; rata: number | null; items: Item[] };
type Detail = {
  siswa: { id: string; nama: string; nis: string };
  kelas: { id: string; nama: string };
  akhir: number | null;
  mapel: MapelNilai[];
};

function tampilNilai(n: number | null) {
  return n === null ? "-" : String(n);
}

function warnaNilai(n: number | null) {
  if (n === null) return "text-muted";
  if (n >= 75) return "text-emerald-300";
  if (n >= 60) return "text-amber-300";
  return "text-red-300";
}

function warnaStatus(s: string) {
  if (s === "Dinilai") return "bg-emerald-500/15 text-emerald-300";
  if (s === "Menunggu penilaian") return "bg-amber-500/15 text-amber-300";
  return "bg-white/5 text-gray-400";
}

export default function DetailNilaiSiswaPage() {
  const { siswaId } = useParams<{ siswaId: string }>();
  const [data, setData] = useState<Detail | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>("");

  useEffect(() => {
    fetch("/api/guru/nilai/siswa/" + siswaId)
      .then(async (r) => {
        const d = await r.json();
        if (!r.ok) {
          setError(d.error || "Gagal memuat nilai.");
          return;
        }
        setData(d);
      })
      .finally(() => setLoading(false));
  }, [siswaId]);

  if (loading) {
    return (
      <div className="flex items-center gap-2 text-muted">
        <Loader2 size={18} className="animate-spin" /> Memuat nilai...
      </div>
    );
  }

  if (error || !data) {
    return (
      <div>
        <Link href="/guru/nilai" className="mb-4 inline-block text-sm text-muted hover:text-white">
          ← Kembali
        </Link>
        <p className="text-red-400">{error || "Data tidak ditemukan."}</p>
      </div>
    );
  }

  return (
    <div>
      <Link href="/guru/nilai" className="animate-fade-in-up mb-4 inline-block text-sm text-muted hover:text-white">
        ← Kembali
      </Link>

      <div
        className="animate-fade-in-up flex flex-col gap-4 rounded-2xl border border-border bg-surface p-8 sm:flex-row sm:items-center sm:justify-between"
        style={{ animationDelay: "40ms" }}
      >
        <div>
          <p className="text-xs font-medium tracking-wide text-muted">DETAIL NILAI SISWA</p>
          <h1 className="mt-1 text-3xl font-bold text-white">{data.siswa.nama}</h1>
          <p className="mt-1 text-sm text-muted">
            NIS {data.siswa.nis} · {data.kelas.nama}
          </p>
        </div>
        <div className="rounded-2xl bg-primary-soft px-8 py-4 text-center">
          <p className="text-xs font-medium tracking-wide text-primary">NILAI AKHIR</p>
          <p className={"mt-1 text-4xl font-bold " + warnaNilai(data.akhir)}>{tampilNilai(data.akhir)}</p>
        </div>
      </div>

      {/* Ringkasan per mapel */}
      <h2 className="mb-3 mt-8 text-lg font-semibold text-white">Ringkasan per Mata Pelajaran</h2>
      <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-4">
        {data.mapel.map((m, idx) => (
          <div
            key={m.nama}
            className="animate-fade-in-up rounded-2xl border border-border bg-surface p-4"
            style={{ animationDelay: idx * 40 + "ms" }}
          >
            <p className="truncate text-sm text-muted">{m.nama}</p>
            <p className={"mt-1 text-2xl font-bold " + warnaNilai(m.rata)}>{tampilNilai(m.rata)}</p>
          </div>
        ))}
      </div>

      {/* Rincian per mapel */}
      <h2 className="mb-3 mt-8 text-lg font-semibold text-white">Rincian Penilaian</h2>
      <div className="space-y-4">
        {data.mapel.map((m) => (
          <div key={m.nama} className="rounded-2xl border border-border bg-surface">
            <div className="flex items-center justify-between border-b border-border px-6 py-4">
              <h3 className="font-semibold text-white">{m.nama}</h3>
              <span className="text-sm text-muted">
                Rata-rata: <span className={"font-bold " + warnaNilai(m.rata)}>{tampilNilai(m.rata)}</span>
              </span>
            </div>

            {m.items.length === 0 ? (
              <p className="px-6 py-4 text-sm text-muted">Belum ada assessment atau tugas di mapel ini.</p>
            ) : (
              <ul>
                {m.items.map((i, idx) => (
                  <li
                    key={i.tipe + i.judul + idx}
                    className="flex flex-col gap-2 border-b border-border/50 px-6 py-4 last:border-0 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="rounded-full bg-primary-soft px-2.5 py-0.5 text-xs font-medium text-primary">
                          {i.tipe}
                        </span>
                        <p className="truncate font-medium text-gray-200">{i.judul}</p>
                      </div>
                      {i.waktu && (
                        <p className="mt-1 text-xs text-muted">
                          {new Date(i.waktu).toLocaleString("id-ID", { dateStyle: "medium", timeStyle: "short" })}
                        </p>
                      )}
                    </div>
                    <div className="flex items-center gap-3">
                      <span className={"rounded-full px-3 py-1 text-xs font-medium " + warnaStatus(i.status)}>
                        {i.status}
                      </span>
                      <span className={"w-12 text-right text-lg font-bold " + warnaNilai(i.nilai)}>
                        {tampilNilai(i.nilai)}
                      </span>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}