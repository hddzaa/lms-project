"use client";

import Link from "next/link";
import { Sparkles } from "lucide-react";

const menuItems = [
  { label: "Fitur", href: "#fitur" },
  { label: "Peran", href: "#peran" },
  { label: "Alur Kerja", href: "#alur-kerja" },
  { label: "Antarmuka", href: "#antarmuka" },
];

export default function Navbar() {
  return (
    <div className="fixed inset-x-0 top-4 z-50 flex justify-center px-4">
      <header className="animate-fade-in-down flex w-full max-w-5xl items-center justify-between rounded-full border border-white/10 bg-white/[0.04] px-6 py-3 shadow-[0_8px_32px_rgba(0,0,0,0.4)] backdrop-blur-xl">
        <div className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-bg shadow-[0_0_16px_rgba(77,216,246,0.5)]">
            <Sparkles size={18} />
          </div>
          <span className="text-lg font-bold text-heading">BiarPinter</span>
        </div>

        <nav className="hidden items-center gap-1 md:flex">
          {menuItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="rounded-full px-4 py-2 text-sm text-gray-300 transition-colors hover:bg-white/5 hover:text-white"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <Link
          href="/login"
          className="rounded-full bg-white/10 px-5 py-2 text-sm font-medium text-heading transition-colors hover:bg-white/15"
        >
          Masuk
        </Link>
      </header>
    </div>
  );
}