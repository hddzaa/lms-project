"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { Menu } from "lucide-react";

export default function ResponsiveShell({
  sidebar,
  topbar,
  children,
  bg = "bg-bg",
}: {
  sidebar: React.ReactNode;
  topbar: React.ReactNode;
  children: React.ReactNode;
  bg?: string;
}) {
  const pathname = usePathname();
  const [open, setOpen] = useState<boolean>(false);
  const [drag, setDrag] = useState<number>(0);
  const startX = useRef<number | null>(null);

  // Tutup saat pindah halaman
  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  // Tutup dengan tombol Escape
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  function onTouchStart(e: React.TouchEvent) {
    startX.current = e.touches[0].clientX;
  }
  function onTouchMove(e: React.TouchEvent) {
    if (startX.current === null) return;
    const dx = e.touches[0].clientX - startX.current;
    if (dx < 0) setDrag(dx);
  }
  function onTouchEnd() {
    if (drag < -80) setOpen(false);
    setDrag(0);
    startX.current = null;
  }

  const dragging = drag !== 0;

  return (
    <div className={"flex h-screen overflow-hidden text-white " + bg}>
      {/* Sidebar tetap di layar besar */}
      <div className="hidden lg:block">{sidebar}</div>

      {/* Latar gelap + blur (mobile) */}
      <div
        onClick={() => setOpen(false)}
        className={
          "fixed inset-0 z-40 bg-black/60 backdrop-blur-sm transition-opacity duration-300 lg:hidden " +
          (open ? "opacity-100" : "pointer-events-none opacity-0")
        }
      />

      {/* Drawer (mobile) */}
      <div
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
        style={dragging ? { transform: "translateX(" + drag + "px)", transition: "none" } : undefined}
        className={
          "fixed inset-y-0 left-0 z-50 shadow-2xl shadow-black/60 transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] lg:hidden " +
          (open ? "drawer-open translate-x-0" : "-translate-x-full")
        }
      >
        {sidebar}
      </div>

      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        {/* Bar mobile dengan tombol buka sidebar */}
        <div className="flex items-center gap-3 border-b border-border bg-surface px-4 py-3 lg:hidden">
          <button
            onClick={() => setOpen(true)}
            aria-label="Buka menu"
            className="flex h-10 w-10 items-center justify-center rounded-xl border border-border text-gray-200 transition-transform duration-150 hover:bg-white/5 active:scale-90"
          >
            <Menu size={20} />
          </button>
          <span className="text-lg font-bold text-heading">BiarPinter</span>
        </div>

        {topbar}
        <main className="flex-1 overflow-y-auto px-4 py-6 lg:px-8 lg:py-8">{children}</main>
      </div>
    </div>
  );
}