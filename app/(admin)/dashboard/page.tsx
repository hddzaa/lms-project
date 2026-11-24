"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Users, GraduationCap, School, BookOpen, Activity, MousePointerClick, ArrowUpRight } from "lucide-react";

type Stats = {
  siswa: number;
  guru: number;
  kelas: number;
  mapel: number;
  aktivitasGuru: number;
  aktivitasSiswa: number;
};

// Angka yang naik pelan dari 0 ke nilai akhir
function useCountUp(target: number, durasi = 900): number {
  const [nilai, setNilai] = useState<number>(0);

  useEffect(() => {
    let frame = 0;
    const mulai = performance.now();
    function langkah(sekarang: number) {
      const t = Math.min((sekarang - mulai) / durasi, 1);
      const halus = 1 - Math.pow(1 - t, 3);
      setNilai(Math.round(target * halus));
      if (t < 1) frame = requestAnimationFrame(langkah);
    }
    frame = requestAnimationFrame(langkah);
    return () => cancelAnimationFrame(frame);
  }, [target, durasi]);

  return nilai;
}

function KartuStat({
  label,
  nilai,
  ikon: Ikon,
  href,
  keterangan,
  delay,
}: {
  label: string;
  nilai: number | null;
  ikon: React.ComponentType<{ size?: number; className?: string }>;
  href: string;
  keterangan: string;
  delay: number;
}) {
  const tampil = useCountUp(nilai ?? 0);

  return (
    <Link
      href={href}
      className="animate-fade-in-up group relative overflow-hidden rounded-2xl border border-border bg-surface p-6 transition-all duration-300 hover:-translate-y-1 hover:border-primary/40"
      style={{ animationDelay: delay + "ms" }}
    >
      <div className="pointer-events-none absolute -right-8 -top-8 h-28 w-28 rounded-full bg-primary/10 blur-2xl transition-opacity duration-300 group-hover:opacity-100" />

      <div className="flex items-start justify-between">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary-soft text-primary transition-transform duration-300 group-hover:scale-110">
          <Ikon size={22} />
        </div>
        <ArrowUpRight
          size={18}
          className="text-muted transition-all duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-primary"
        />
      </div>

      <p className="mt-5 text-4xl font-bold text-white">{nilai === null ? "-" : tampil}</p>
      <p className="mt-1 text-sm font-medium text-gray-200">{label}</p>
      <p className="mt-0.5 text-xs text-muted">{keterangan}</p>
    </Link>
  );
}

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [error, setError] = useState<string>("");

  useEffect(() => {
    fetch("/api/admin/stats")
      .then(async (r) => {
        const d = await r.json();
        if (!r.ok) {
          setError(d.error || "Gagal memuat statistik.");
          return;
        }
        setStats(d);
      })
      .catch(() => setError("Gagal memuat statistik."));
  }, []);

  return (
    <div>
      <h1 className="animate-fade-in-up text-3xl font-bold text-white">Dashboard Admin</h1>
      <p className="animate-fade-in-up mt-2 text-muted" style={{ animationDelay: "40ms" }}>
        Ringkasan data sekolah dan aktivitas hari ini.
      </p>

      {error && <p className="mt-6 text-red-400">{error}</p>}

      <h2 className="mb-3 mt-8 text-xs font-medium tracking-wide text-muted">DATA SEKOLAH</h2>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <KartuStat
          label="Siswa"
          nilai={stats ? stats.siswa : null}
          ikon={Users}
          href="/kelas-siswa"
          keterangan="Total siswa terdaftar"
          delay={80}
        />
        <KartuStat
          label="Guru"
          nilai={stats ? stats.guru : null}
          ikon={GraduationCap}
          href="/guru-mapel"
          keterangan="Total guru terdaftar"
          delay={120}
        />
        <KartuStat
          label="Kelas"
          nilai={stats ? stats.kelas : null}
          ikon={School}
          href="/kelas-siswa"
          keterangan="Total kelas aktif"
          delay={160}
        />
        <KartuStat
          label="Mata Pelajaran"
          nilai={stats ? stats.mapel : null}
          ikon={BookOpen}
          href="/guru-mapel"
          keterangan="Total mata pelajaran"
          delay={200}
        />
      </div>

      <h2 className="mb-3 mt-8 text-xs font-medium tracking-wide text-muted">AKTIVITAS HARI INI</h2>
      <div className="grid gap-4 sm:grid-cols-2">
        <KartuStat
          label="Aktivitas Guru"
          nilai={stats ? stats.aktivitasGuru : null}
          ikon={Activity}
          href="/aktivitas-guru"
          keterangan="Upload materi, buat assessment, menilai"
          delay={240}
        />
        <KartuStat
          label="Aktivitas Siswa"
          nilai={stats ? stats.aktivitasSiswa : null}
          ikon={MousePointerClick}
          href="/rekap-aktivitas"
          keterangan="Melihat materi, mengerjakan assessment, mengumpulkan tugas"
          delay={280}
        />
      </div>
    </div>
  );
}