"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import { LayoutDashboard, Activity, ClipboardList, School, LogOut } from "lucide-react";

const navItems = [
  { label: "Dashboard", href: "/kurikulum/dashboard", icon: LayoutDashboard },
  { label: "Aktivitas Guru", href: "/kurikulum/aktivitas-guru", icon: Activity },
  { label: "Rekap Aktivitas", href: "/kurikulum/rekap-aktivitas", icon: ClipboardList },
  { label: "Mapel & Kelas", href: "/kurikulum/mapel-kelas", icon: School },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="flex h-screen w-64 flex-col justify-between border-r border-border bg-surface px-4 py-6">
      <div>
        <div className="mb-10 px-2">
          <h1 className="text-2xl font-bold text-heading">BiarPinter</h1>
          <p className="text-xs tracking-widest text-muted">KURIKULUM PORTAL</p>
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