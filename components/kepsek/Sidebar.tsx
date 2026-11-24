"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import { LayoutDashboard, History, BarChart3, GraduationCap, LogOut } from "lucide-react";

const menu = [
  { label: "Dashboard", href: "/kepsek/dashboard", icon: LayoutDashboard },
  { label: "Aktivitas Guru", href: "/kepsek/aktivitas-guru", icon: History },
  { label: "Rekap Aktivitas", href: "/kepsek/rekap-aktivitas", icon: BarChart3 },
  { label: "Nilai", href: "/kepsek/nilai", icon: GraduationCap },
];

export default function KepsekSidebar() {
  const pathname = usePathname();

  return (
    <aside className="flex h-screen w-64 shrink-0 flex-col border-r border-border bg-surface px-4 py-6">
      <div className="px-2">
        <h2 className="text-2xl font-bold text-primary">BiarPinter</h2>
        <p className="mt-1 text-xs tracking-widest text-muted">KEPALA SEKOLAH</p>
      </div>

      <nav className="mt-10 flex-1 space-y-1">
        {menu.map(({ label, href, icon: Icon }) => {
          const aktif = pathname === href || pathname.startsWith(href + "/");
          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm transition-all duration-200 ${aktif ? "bg-primary-soft font-medium text-primary" : "text-gray-300 hover:translate-x-1 hover:bg-white/5"
                }`}
            >
              <Icon size={18} className="transition-transform duration-200" />
              {label}
            </Link>
          );
        })}
      </nav>

      <button
        onClick={() => signOut({ callbackUrl: "/login" })}
        className="group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-orange-400 hover:bg-white/5">
        <LogOut size={18} />
        LOGOUT
      </button>
    </aside>
  );
}