"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { Users, GraduationCap, School, BookOpen, History, BarChart3, Share2 } from "lucide-react";

type Stats = { siswa: number; guru: number; kelas: number; mapel: number };

const menuCards = [
  { title: "Aktivitas Guru", desc: "Pantau aktivitas guru dalam sistem.", icon: History, href: "/kepsek/aktivitas-guru", action: "Lihat" },
  { title: "Rekap Aktivitas", desc: "Lihat rekap aktivitas guru dan siswa.", icon: BarChart3, href: "/kepsek/rekap-aktivitas", action: "Buka" },
  { title: "Nilai", desc: "Lihat nilai siswa per kelas dan mata pelajaran.", icon: GraduationCap, href: "/kepsek/nilai", action: "Lihat" },
];

export default function DashboardKepsekPage() {
  const { data: session } = useSession();
  const [stats, setStats] = useState<Stats | null>(null);

  useEffect(() => {
    fetch("/api/kepsek/stats").then((r) => (r.ok ? r.json() : null)).then(setStats).catch(() => {});
  }, []);

  const statCards = [
    { label: "Total Siswa", value: stats?.siswa, icon: Users, tone: "bg-primary-soft text-primary" },
    { label: "Total Guru", value: stats?.guru, icon: GraduationCap, tone: "bg-secondary-soft text-secondary" },
    { label: "Total Kelas", value: stats?.kelas, icon: School, tone: "bg-primary-soft text-primary" },
    { label: "Mata Pelajaran", value: stats?.mapel, icon: BookOpen, tone: "bg-white/5 text-gray-300" },
  ];

  return (
    <div>
      <h1 className="animate-fade-in-up text-2xl font-semibold text-white">Dashboard Kepala Sekolah</h1>
      <p className="animate-fade-in-up mt-1 text-muted" style={{ animationDelay: "80ms" }}>
        Pantau perkembangan sekolah secara menyeluruh.
      </p>

      <div
        className="animate-fade-in-up group mt-6 flex items-center justify-between overflow-hidden rounded-2xl border border-border bg-surface px-8 py-10 transition-all duration-300 hover:border-primary/20 hover:shadow-xl hover:shadow-primary/5"
        style={{ animationDelay: "140ms" }}
      >
        <div className="max-w-xl">
          <h2 className="text-xl font-semibold text-white">Selamat Datang, {session?.user?.name ?? "Kepala Sekolah"}</h2>
          <p className="mt-3 text-muted">
            Lihat ringkasan data sekolah, pantau aktivitas guru, dan tinjau nilai siswa dalam satu tempat.
          </p>
        </div>
        <Share2
          size={90}
          strokeWidth={1.2}
          className="animate-float text-secondary/70 transition-transform duration-500 group-hover:scale-110 group-hover:text-secondary"
        />
      </div>

      <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {statCards.map(({ label, value, icon: Icon, tone }, i) => (
          <div
            key={label}
            className="animate-fade-in-up rounded-2xl border border-border bg-surface p-6 transition-all duration-300 hover:-translate-y-1.5 hover:border-primary/30 hover:shadow-xl hover:shadow-primary/10"
            style={{ animationDelay: `${200 + i * 80}ms` }}
          >
            <div className={`mb-4 w-fit rounded-full p-3 ${tone}`}>
              <Icon size={22} />
            </div>
            <p className="text-3xl font-bold text-white">{value ?? "–"}</p>
            <p className="mt-1 text-sm text-muted">{label}</p>
          </div>
        ))}
      </div>

      <h3 className="animate-fade-in-up mt-10 text-lg font-semibold text-white" style={{ animationDelay: "520ms" }}>
        Akses Cepat
      </h3>
      <div className="mt-4 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {menuCards.map(({ title, desc, icon: Icon, href, action }, i) => (
          <Link
            key={title}
            href={href}
            className="animate-fade-in-up group flex flex-col justify-between rounded-2xl border border-border bg-surface p-6 transition-all duration-300 hover:-translate-y-1.5 hover:border-primary/30 hover:shadow-xl hover:shadow-primary/10"
            style={{ animationDelay: `${560 + i * 80}ms` }}
          >
            <div>
              <div className="mb-4 w-fit rounded-full bg-primary-soft p-3 transition-transform duration-300 group-hover:scale-110">
                <Icon size={22} className="text-primary" />
              </div>
              <h3 className="text-lg font-medium text-white">{title}</h3>
              <p className="mt-2 text-sm text-muted">{desc}</p>
            </div>
            <span className="mt-6 flex items-center gap-1 text-sm font-medium text-primary">
              {action}
              <span className="transition-transform duration-300 group-hover:translate-x-1">→</span>
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}