"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  GraduationCap,
  History,
  BarChart3,
  LogOut,
} from "lucide-react";

const navItems = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "Kelas & Siswa", href: "/kelas-siswa", icon: Users },
  { label: "Guru & Mata Pelajaran", href: "/guru-mapel", icon: GraduationCap },
  { label: "Aktivitas Guru", href: "/aktivitas-guru", icon: History },
  { label: "Rekap Aktivitas", href: "/rekap-aktivitas", icon: BarChart3 },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="flex h-screen w-64 flex-col justify-between border-r border-white/5 bg-[#0b0f17] px-4 py-6">
      <div>
        <div className="mb-10 px-2">
          <h1 className="text-2xl font-bold text-indigo-300">BiarPinter</h1>
          <p className="text-xs tracking-widest text-gray-500">
            FACULTY PORTAL
          </p>
        </div>

        <nav className="flex flex-col gap-1">
          {navItems.map(({ label, href, icon: Icon }) => {
            const active = pathname === href;
            return (
              <Link
                key={href}
                href={href}
                className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors ${
                  active
                    ? "bg-cyan-400/10 text-cyan-300"
                    : "text-gray-400 hover:bg-white/5 hover:text-gray-200"
                }`}
              >
                <Icon size={18} />
                {label}
              </Link>
            );
          })}
        </nav>
      </div>

      <button className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-orange-400 hover:bg-white/5">
        <LogOut size={18} />
        LOGOUT
      </button>
    </aside>
  );
}