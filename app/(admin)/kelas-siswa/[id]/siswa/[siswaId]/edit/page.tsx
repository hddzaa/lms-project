"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ChevronDown, User, IdCard, Mail, Users2, Lock, Eye, EyeOff, Loader2 } from "lucide-react";
import Toast from "@/components/ui/Toast";

export default function EditSiswaPage() {
  const router = useRouter();
  const params = useParams<{ id: string; siswaId: string }>();

  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [nama, setNama] = useState("");
  const [nis, setNis] = useState("");
  const [email, setEmail] = useState("");
  const [gender, setGender] = useState<"Laki-laki" | "Perempuan">("Laki-laki");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    async function load() {
      const res = await fetch(`/api/kelas/${params.id}/siswa/${params.siswaId}`);
      if (!res.ok) {
        setNotFound(true);
        setLoading(false);
        return;
      }
      const data = await res.json();
      setNama(data.nama);
      setNis(data.nis);
      setEmail(data.email);
      setGender(data.gender);
      setLoading(false);
    }
    load();
  }, [params.id, params.siswaId]);

  if (loading) {
    return (
      <div className="flex items-center gap-2 text-muted">
        <Loader2 size={18} className="animate-spin" /> Memuat data siswa...
      </div>
    );
  }

  if (notFound) {
    return (
      <div className="text-muted">
        Data siswa tidak ditemukan.{" "}
        <Link href={`/kelas-siswa/${params.id}/siswa`} className="text-primary hover:underline">Kembali ke daftar siswa</Link>
      </div>
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    await fetch(`/api/kelas/${params.id}/siswa/${params.siswaId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        nama,
        nis,
        email,
        gender,
        ...(password ? { password } : {}),
      }),
    });
    setSubmitting(false);
    setShowToast(true);
  }

  return (
    <div>
      <h1 className="animate-fade-in-up text-3xl font-bold text-primary">Edit Siswa</h1>
      <p className="animate-fade-in-up mt-2 max-w-2xl text-muted" style={{ animationDelay: "40ms" }}>
        Edit siswa di kelas yang sedang dipilih. Pastikan semua data akademik telah divalidasi sebelum disimpan.
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
                <ChevronDown size={16} className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-muted" />
              </div>
            </div>
          </div>

          <div className="mt-6">
            <label className="mb-2 flex items-center gap-1.5 text-sm font-medium text-gray-300">
              <Lock size={14} /> Password Baru (opsional)
            </label>
            <div className="relative">
              <input
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                type={showPassword ? "text" : "password"}
                placeholder="Kosongkan jika tidak diubah"
                className="w-full rounded-xl border border-border bg-black/30 px-4 py-3 pr-11 text-sm text-gray-200 placeholder-gray-500 outline-none focus:border-primary/50"
              />
              <button type="button" onClick={() => setShowPassword((v) => !v)} className="absolute right-4 top-1/2 -translate-y-1/2 text-muted hover:text-gray-300">
                {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
          </div>

          <div className="mt-8 flex justify-end gap-3 border-t border-border pt-6">
            <Link href={`/kelas-siswa/${params.id}/siswa`} className="rounded-full border border-border px-6 py-2.5 text-sm font-medium text-gray-300 transition-colors hover:bg-white/5">
              BATAL
            </Link>
            <button
              type="submit"
              disabled={submitting}
              className="rounded-full bg-primary px-6 py-2.5 text-sm font-semibold text-bg transition-transform hover:scale-105 disabled:opacity-60"
            >
              {submitting ? "Menyimpan..." : "SIMPAN →"}
            </button>
          </div>
        </form>
      </div>

      <Toast
        open={showToast}
        onClose={() => { setShowToast(false); router.push(`/kelas-siswa/${params.id}/siswa`); }}
        message="Perubahan berhasil disimpan"
      />
    </div>
  );
}