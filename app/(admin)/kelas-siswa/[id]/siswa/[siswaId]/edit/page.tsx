"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ChevronDown, User, IdCard, Mail, Users2, Lock, Eye, EyeOff } from "lucide-react";
import { getKelasById, siswaByKelas, updateSiswa } from "@/lib/dummy-data";
import Toast from "@/components/ui/Toast";

export default function EditSiswaPage() {
    const router = useRouter();
    const params = useParams<{ id: string; siswaId: string }>();
    const kelas = getKelasById(params.id);
    const siswa = siswaByKelas[params.id]?.find((s) => s.id === params.siswaId);

    const [nama, setNama] = useState(siswa?.nama ?? "");
    const [nis, setNis] = useState(siswa?.nis ?? "");
    const [email, setEmail] = useState(siswa?.email ?? "");
    const [gender, setGender] = useState(siswa?.gender ?? "Laki-laki");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [showToast, setShowToast] = useState(false);

    if (!kelas || !siswa) {
        return (
            <div className="text-muted">
                Data siswa tidak ditemukan.{" "}
                <Link href={`/kelas-siswa/${params.id}/siswa`} className="text-primary hover:underline">
                    Kembali ke daftar siswa
                </Link>
            </div>
        );
    }

    function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        updateSiswa(kelas!.id, siswa!.id, {
            nama,
            nis,
            email,
            gender: gender as "Laki-laki" | "Perempuan",
            ...(password ? { password } : {}),
        });
        setShowToast(true);
    }

    return (
        <div>
            <h1 className="animate-fade-in-up text-3xl font-bold text-primary">Edit Siswa</h1>
            <p
                className="animate-fade-in-up mt-2 max-w-2xl text-muted"
                style={{ animationDelay: "40ms" }}
            >
                Edit siswa di kelas yang sedang dipilih. Pastikan semua data akademik
                telah divalidasi sebelum disimpan.
            </p>

            <div className="mt-6 flex flex-col gap-6 lg:flex-row">
                <form
                    onSubmit={handleSubmit}
                    className="animate-fade-in-up flex-1 rounded-2xl border border-border bg-surface p-8"
                    style={{ animationDelay: "80ms" }}
                >
                    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                        <div>
                            <label className="mb-2 flex items-center gap-1.5 text-sm font-medium text-gray-300">
                                <User size={14} /> Nama Lengkap
                            </label>
                            <input
                                value={nama}
                                onChange={(e) => setNama(e.target.value)}
                                type="text"
                                className="w-full rounded-xl border border-border bg-black/30 px-4 py-3 text-sm text-gray-200 outline-none focus:border-primary/50"
                            />
                        </div>
                        <div>
                            <label className="mb-2 flex items-center gap-1.5 text-sm font-medium text-gray-300">
                                <IdCard size={14} /> Nomor Induk Siswa (NIS)
                            </label>
                            <input
                                value={nis}
                                onChange={(e) => setNis(e.target.value)}
                                type="text"
                                className="w-full rounded-xl border border-border bg-black/30 px-4 py-3 text-sm text-gray-200 outline-none focus:border-primary/50"
                            />
                        </div>
                        <div>
                            <label className="mb-2 flex items-center gap-1.5 text-sm font-medium text-gray-300">
                                <Mail size={14} /> Email Akademik
                            </label>
                            <input
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                type="email"
                                className="w-full rounded-xl border border-border bg-black/30 px-4 py-3 text-sm text-gray-200 outline-none focus:border-primary/50"
                            />
                        </div>
                        <div>
                            <label className="mb-2 flex items-center gap-1.5 text-sm font-medium text-gray-300">
                                <Users2 size={14} /> Jenis Kelamin
                            </label>
                            <div className="relative">
                                <select
                                    value={gender}
                                    onChange={(e) => setGender(e.target.value as "Laki-laki" | "Perempuan")}
                                    className="w-full appearance-none rounded-xl border border-border bg-black/30 px-4 py-3 text-sm text-gray-200 outline-none focus:border-primary/50"
                                >
                                    <option value="Laki-laki">Laki-laki</option>
                                    <option value="Perempuan">Perempuan</option>
                                </select>
                                <ChevronDown
                                    size={16}
                                    className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-muted"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="mt-8 flex justify-end gap-3 border-t border-border pt-6">
                        <Link
                            href={`/kelas-siswa/${kelas.id}/siswa`}
                            className="rounded-full border border-border px-6 py-2.5 text-sm font-medium text-gray-300 transition-colors hover:bg-white/5"
                        >
                            BATAL
                        </Link>
                        <button
                            type="submit"
                            className="rounded-full bg-primary px-6 py-2.5 text-sm font-semibold text-bg transition-transform hover:scale-105"
                        >
                            SIMPAN →
                        </button>
                    </div>
                </form>

                <div
                    className="animate-fade-in-up h-fit w-full rounded-2xl border border-border bg-surface p-6 lg:w-72"
                    style={{ animationDelay: "120ms" }}
                >
                    <p className="text-sm font-medium text-primary">Kelas Terpilih</p>
                    <div className="mt-4 flex items-center gap-3">
                        <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary-soft text-sm font-semibold text-primary">
                            {kelas.grade}
                        </span>
                        <div>
                            <p className="font-semibold text-white">
                                {kelas.grade}-{kelas.name}
                            </p>
                            <p className="text-xs text-muted">{kelas.category}</p>
                        </div>
                    </div>
                    <div className="mt-6 grid grid-cols-2 gap-4 border-t border-border pt-4 text-sm">
                        <div>
                            <p className="text-xs text-muted">KAPASITAS</p>
                            <p className="mt-1 font-semibold text-white">
                                {kelas.jumlahSiswa} / {kelas.kapasitas}
                            </p>
                        </div>
                        <div>
                            <p className="text-xs text-muted">TAHUN AJARAN</p>
                            <p className="mt-1 font-semibold text-white">{kelas.tahunAjaran}</p>
                        </div>
                    </div>
                </div>
            </div>

            <Toast
                open={showToast}
                onClose={() => {
                    setShowToast(false);
                    router.push(`/kelas-siswa/${kelas.id}/siswa`);
                }}
                message="Perubahan berhasil disimpan"
            />
        </div>
    );
}