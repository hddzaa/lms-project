"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import {
  LayoutDashboard, Users, BookOpen, FileText,
  ClipboardList, GraduationCap, LogOut,
} from "lucide-react";

const navItems = [
  { label: "Dashboard", href: "/guru/dashboard", icon: LayoutDashboard },
  { label: "Kelas & Siswa", href: "/guru/kelas-siswa", icon: Users },
  { label: "Materi", href: "/guru/materi", icon: BookOpen },
  { label: "Assessment", href: "/guru/assessment", icon: FileText },
  { label: "Tugas & Project", href: "/guru/tugas-project", icon: ClipboardList },
  { label: "Nilai", href: "/guru/nilai", icon: GraduationCap },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="flex h-screen w-64 flex-col justify-between border-r border-border bg-surface px-4 py-6">
      <div>
        <div className="mb-10 px-2">
          <h1 className="text-2xl font-bold text-heading">BiarPinter</h1>
          <p className="text-xs tracking-widest text-muted">TEACHING PORTAL</p>
        </div>

        <nav className="flex flex-col gap-1">
          {navItems.map(({ label, href, icon: Icon }) => {
            const active = pathname === href;
            return (
              <Link
                key={href}
                href={href}
                className={`group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-all duration-200 ${
                  active ? "bg-primary-soft text-primary" : "text-gray-400 hover:translate-x-1 hover:bg-white/5 hover:text-gray-200"
                }`}
              >
                <Icon size={18} className="transition-transform duration-200 group-hover:scale-110" />
                {label}
              </Link>
            );
          })}
        </nav>
      </div>

      <button
        onClick={() => signOut({ callbackUrl: "/login" })}
        className="group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-warn transition-all duration-200 hover:bg-white/5"
      >
        <LogOut size={18} className="transition-transform duration-200 group-hover:-translate-x-0.5" />
        LOGOUT
      </button>
    </aside>
  );
}