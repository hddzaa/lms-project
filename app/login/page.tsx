"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Sparkles, Eye, EyeOff, Lock, AtSign, ChevronDown } from "lucide-react";

type Role = "siswa" | "guru" | "admin" | "kepsek" | "kurikulum";

const petugasRoles: { value: Role; label: string }[] = [
    { value: "admin", label: "Admin" },
    { value: "kepsek", label: "Kepsek" },
    { value: "kurikulum", label: "Kurikulum" },
];

const idLabel: Record<Role, string> = {
    siswa: "ID Siswa",
    guru: "ID Guru",
    admin: "ID Admin",
    kepsek: "ID Kepala Sekolah",
    kurikulum: "ID Kurikulum",
};

export default function LoginPage() {
    const router = useRouter();
    const [role, setRole] = useState<Role>("siswa");
    const [showPetugasMenu, setShowPetugasMenu] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [id, setId] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");

    const isPetugasActive = ["admin", "kepsek", "kurikulum"].includes(role);

    function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setError("");

        if (role !== "admin") {
            setError("Role ini belum tersedia. Saat ini hanya role Admin yang aktif.");
            return;
        }

        // TODO: ganti dengan pemanggilan API/NextAuth beneran setelah backend siap
        if (id === "admin" && password === "admin123") {
            router.push("/dashboard");
        } else {
            setError("ID atau kata sandi salah.");
        }
    }

    return (
        <div className="flex min-h-screen flex-col items-center justify-center bg-bg px-4 py-16 text-white">
            <div
                className="animate-fade-in-up mb-8 flex items-center gap-3"
                style={{ animationDelay: "0ms" }}
            >
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary text-bg shadow-[0_0_20px_rgba(77,216,246,0.4)]">
                    <Sparkles size={22} />
                </div>
                <h1 className="text-3xl font-bold text-heading">BiarPinter</h1>
            </div>

            <div
                className="animate-fade-in-up w-full max-w-md rounded-3xl border border-border bg-surface p-8 shadow-2xl"
                style={{ animationDelay: "100ms" }}
            >
                <form onSubmit={handleSubmit}>
                    <p className="mb-3 text-sm font-medium text-gray-300">Pilih Role</p>
                    <div className="mb-6 flex flex-wrap gap-2">
                        <RoleButton active={role === "siswa"} onClick={() => setRole("siswa")}>
                            SISWA
                        </RoleButton>
                        <RoleButton active={role === "guru"} onClick={() => setRole("guru")}>
                            GURU
                        </RoleButton>

                        <div
                            className="relative"
                            onMouseEnter={() => setShowPetugasMenu(true)}
                            onMouseLeave={() => setShowPetugasMenu(false)}
                        >
                            <RoleButton
                                active={isPetugasActive}
                                onClick={() => setShowPetugasMenu((v) => !v)}
                            >
                                PETUGAS
                                <ChevronDown
                                    size={13}
                                    className={`transition-transform duration-200 ${showPetugasMenu ? "rotate-180" : ""}`}
                                />
                            </RoleButton>

                            {showPetugasMenu && (
                                <div className="animate-fade-in-down absolute left-0 top-full z-10 mt-1 w-40 overflow-hidden rounded-xl border border-border bg-[#171a21] shadow-xl">
                                    {petugasRoles.map((p) => (
                                        <button
                                            key={p.value}
                                            type="button"
                                            onClick={() => {
                                                setRole(p.value);
                                                setShowPetugasMenu(false);
                                            }}
                                            className={`block w-full px-4 py-2.5 text-left text-sm transition-colors hover:bg-white/5 ${role === p.value ? "text-primary" : "text-gray-300"
                                                }`}
                                        >
                                            {p.label}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    <label className="mb-1 block text-sm font-medium text-gray-300">
                        {idLabel[role]}
                    </label>
                    <div className="relative mb-5">
                        <AtSign size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted" />
                        <input
                            value={id}
                            onChange={(e) => setId(e.target.value)}
                            type="text"
                            className="w-full rounded-xl border border-border bg-black/30 py-3 pl-11 pr-4 text-sm text-gray-200 outline-none transition-colors focus:border-primary/50"
                            placeholder={idLabel[role]}
                        />
                    </div>

                    <div className="mb-2 flex items-center justify-between">
                        <label className="block text-sm font-medium text-gray-300">
                            Kunci Sandi
                        </label>
                        <a href="#" className="text-xs text-primary hover:underline">
                            Pulihkan Akses
                        </a>
                    </div>
                    <div className="relative mb-4">
                        <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted" />
                        <input
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            type={showPassword ? "text" : "password"}
                            className="w-full rounded-xl border border-border bg-black/30 py-3 pl-11 pr-11 text-sm text-gray-200 outline-none transition-colors focus:border-primary/50"
                            placeholder="••••••••"
                        />
                        <button
                            type="button"
                            onClick={() => setShowPassword((v) => !v)}
                            className="absolute right-4 top-1/2 -translate-y-1/2 text-muted hover:text-gray-300"
                        >
                            {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                        </button>
                    </div>

                    <label className="mb-6 flex items-center gap-2 text-sm text-muted">
                        <input type="checkbox" className="h-4 w-4 rounded border-border bg-black/30 accent-primary" />
                        Tetap Masuk
                    </label>

                    {error && (
                        <p className="animate-fade-in-up mb-4 rounded-lg bg-red-500/10 px-4 py-2 text-sm text-red-400">
                            {error}
                        </p>
                    )}

                    <button
                        type="submit"
                        className="w-full rounded-xl bg-primary py-3 text-sm font-bold tracking-wide text-bg shadow-[0_0_20px_rgba(77,216,246,0.25)] transition-transform hover:scale-[1.02]"
                    >
                        LOGIN
                    </button>

                    <p className="mt-6 border-t border-border pt-4 text-center text-xs text-muted">
                        Akses tidak sah diawasi oleh protokol Sintesis Digital.
                    </p>
                </form>
            </div>

            <div
                className="animate-fade-in-up mt-10 flex w-full max-w-md justify-between text-xs text-muted"
                style={{ animationDelay: "150ms" }}
            >
                <span>© 2024 Aetheris Technologies</span>
                <span className="flex gap-4">
                    <a href="#" className="hover:text-gray-300">Protokol Privasi</a>
                    <a href="#" className="hover:text-gray-300">Status Sistem</a>
                </span>
            </div>
        </div>
    );
}

function RoleButton({
  children,
  active,
  onClick,
}: {
  children: React.ReactNode;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex items-center gap-1.5 rounded-lg border px-4 py-2 text-xs font-semibold tracking-wide transition-all duration-200 ${
        active
          ? "border-primary/50 bg-primary-soft text-primary"
          : "border-border bg-black/30 text-gray-400 hover:text-gray-200"
      }`}
    >
      {children}
    </button>
  );
}