import { Users, GraduationCap, History, BarChart3, Share2 } from "lucide-react";
import Link from "next/link";

const menuCards = [
  {
    title: "Kelola Kelas & Siswa",
    desc: "Tambah, ubah, dan kelola data kelas serta siswa.",
    icon: Users,
    href: "/kelas-siswa",
    action: "Kelola",
    variant: "primary",
  },
  {
    title: "Guru & Mata Pelajaran",
    desc: "Kelola data guru dan mata pelajaran.",
    icon: GraduationCap,
    href: "/guru-mapel",
    action: "Kelola",
    variant: "primary",
  },
  {
    title: "Aktivitas Guru",
    desc: "Lihat aktivitas guru dalam sistem.",
    icon: History,
    href: "/aktivitas-guru",
    action: "Lihat",
    variant: "secondary",
  },
  {
    title: "Rekap Aktivitas",
    desc: "Unduh rekap aktivitas guru dan siswa.",
    icon: BarChart3,
    href: "/rekap-aktivitas",
    action: "Buka",
    variant: "neutral",
  },
] as const;

const variantStyles = {
  primary: {
    iconBg: "bg-primary-soft",
    iconColor: "text-primary",
    link: "text-primary",
    glow: "hover:shadow-primary/10 hover:border-primary/30",
  },
  secondary: {
    iconBg: "bg-secondary-soft",
    iconColor: "text-secondary",
    link: "text-secondary",
    glow: "hover:shadow-secondary/10 hover:border-secondary/30",
  },
  neutral: {
    iconBg: "bg-white/5",
    iconColor: "text-gray-300",
    link: "text-gray-300",
    glow: "hover:shadow-white/5 hover:border-white/20",
  },
};

export default function DashboardPage() {
  return (
    <div>
      <h1 className="animate-fade-in-up text-2xl font-semibold text-white">
        Dashboard Admin
      </h1>
      <p
        className="animate-fade-in-up mt-1 text-muted"
        style={{ animationDelay: "80ms" }}
      >
        Kelola data utama sistem Learning Management System.
      </p>

      {/* Welcome card */}
      <div
        className="animate-fade-in-up group mt-6 flex items-center justify-between overflow-hidden rounded-2xl border border-border bg-surface px-8 py-10 transition-all duration-300 hover:border-primary/20 hover:shadow-xl hover:shadow-primary/5"
        style={{ animationDelay: "140ms" }}
      >
        <div className="max-w-xl">
          <h2 className="text-xl font-semibold text-white">
            Selamat Datang, Admin
          </h2>
          <p className="mt-3 text-muted">
            Mulai hari ini dengan memantau performa sistem secara menyeluruh.
            Kelola data kelas, monitoring aktivitas pengajar, dan pastikan
            seluruh ekosistem akademik Aetheris berjalan dengan presisi
            tinggi.
          </p>
        </div>
        <Share2
          size={90}
          strokeWidth={1.2}
          className="animate-float text-secondary/70 transition-transform duration-500 group-hover:scale-110 group-hover:text-secondary"
        />
      </div>

      {/* Menu cards */}
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
                <div
                  className={`mb-4 w-fit rounded-full p-3 transition-transform duration-300 group-hover:scale-110 ${style.iconBg}`}
                >
                  <Icon size={22} className={style.iconColor} />
                </div>
                <h3 className="text-lg font-medium text-white">{title}</h3>
                <p className="mt-2 text-sm text-muted">{desc}</p>
              </div>
              <span
                className={`mt-6 flex items-center gap-1 text-sm font-medium ${style.link}`}
              >
                {action}
                <span className="transition-transform duration-300 group-hover:translate-x-1">
                  →
                </span>
              </span>
            </Link>
          );
        })}
      </div>

      {/* Footer */}
      <div className="mt-10 flex items-center justify-between border-t border-border pt-6 text-xs text-muted">
        <p>© 2024 AETHERIS ACADEMIC MGMT. ALL RIGHTS RESERVED.</p>
        <div className="flex gap-6">
          <span className="cursor-pointer transition-colors hover:text-gray-300">
            SECURITY AUDIT
          </span>
          <span className="cursor-pointer transition-colors hover:text-gray-300">
            SYSTEM STATUS
          </span>
          <span className="cursor-pointer transition-colors hover:text-gray-300">
            LOGS
          </span>
        </div>
      </div>
    </div>
  );
}