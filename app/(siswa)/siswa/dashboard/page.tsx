"use client";

import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import Link from "next/link";
import { BookOpen, FileText, ClipboardList, GraduationCap, Share2 } from "lucide-react";

const menuCards = [
  { title: "Materi", desc: "Lihat materi pembelajaran dari guru Anda.", icon: BookOpen, href: "/siswa/materi", action: "Lihat", variant: "primary" },
  { title: "Assessment", desc: "Kerjakan kuis, ujian, dan penilaian.", icon: FileText, href: "/siswa/assessment", action: "Kerjakan", variant: "secondary" },
  { title: "Tugas & Project", desc: "Kumpulkan tugas dan lihat status pengumpulan.", icon: ClipboardList, href: "/siswa/tugas-project", action: "Lihat", variant: "secondary" },
  { title: "Nilai", desc: "Lihat rekap nilai Anda.", icon: GraduationCap, href: "/siswa/nilai", action: "Lihat", variant: "neutral" },
] as const;

const variantStyles = {
  primary: { iconBg: "bg-primary-soft", iconColor: "text-primary", link: "text-primary", glow: "hover:shadow-primary/10 hover:border-primary/30" },
  secondary: { iconBg: "bg-secondary-soft", iconColor: "text-secondary", link: "text-secondary", glow: "hover:shadow-secondary/10 hover:border-secondary/30" },
  neutral: { iconBg: "bg-white/5", iconColor: "text-gray-300", link: "text-gray-300", glow: "hover:shadow-white/5 hover:border-white/20" },
};

export default function DashboardSiswaPage() {
  const { data: session } = useSession();
  const nama = session?.user?.name ?? "Siswa";
  const [kelasLabel, setKelasLabel] = useState("-");

  useEffect(() => {
    fetch("/api/siswa/kelas")
      .then((res) => res.json())
      .then((data) => setKelasLabel(`${data.grade} ${data.name}`))
      .catch(() => {});
  }, []);

  return (
    <div>
      <h1 className="animate-fade-in-up text-2xl font-semibold text-white">Dashboard Siswa</h1>
      <p className="animate-fade-in-up mt-1 text-muted" style={{ animationDelay: "80ms" }}>
        Akses materi, kerjakan tugas, dan pantau perkembangan belajar Anda.
      </p>

      <div
        className="animate-fade-in-up group mt-6 flex items-center justify-between overflow-hidden rounded-2xl border border-border bg-surface px-8 py-10 transition-all duration-300 hover:border-primary/20 hover:shadow-xl hover:shadow-primary/5"
        style={{ animationDelay: "140ms" }}
      >
        <div className="max-w-xl">
          <h2 className="text-xl font-semibold text-white">Selamat Datang, {nama}</h2>
          <p className="mt-3 text-muted">
            Anda tergabung di kelas <span className="text-primary">{kelasLabel}</span>. Jangan lupa cek materi
            terbaru dan kerjakan assessment sebelum deadline.
          </p>
        </div>
        <Share2 size={90} strokeWidth={1.2} className="animate-float text-secondary/70 transition-transform duration-500 group-hover:scale-110 group-hover:text-secondary" />
      </div>

      <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {menuCards.map(({ title, desc, icon: Icon, href, action, variant }, i) => {
          const style = variantStyles[variant];
          return (
            <Link
              key={title}
              href={href}
              className={`animate-fade-in-up group flex flex-col justify-between rounded-2xl border border-border bg-surface p-6 transition-all duration-300 hover:-translate-y-1.5 hover:shadow-xl ${style.glow}`}
              style={{ animationDelay: `${200 + i * 80}ms` }}
            >
              <div>
                <div className={`mb-4 w-fit rounded-full p-3 transition-transform duration-300 group-hover:scale-110 ${style.iconBg}`}>
                  <Icon size={22} className={style.iconColor} />
                </div>
                <h3 className="text-lg font-medium text-white">{title}</h3>
                <p className="mt-2 text-sm text-muted">{desc}</p>
              </div>
              <span className={`mt-6 flex items-center gap-1 text-sm font-medium ${style.link}`}>
                {action} <span className="transition-transform duration-300 group-hover:translate-x-1">→</span>
              </span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}