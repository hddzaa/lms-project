"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ChevronDown, AlertCircle, User, IdCard, Mail, BookOpen, Lock, Eye, EyeOff } from "lucide-react";
import { addGuru, getMapelNames } from "@/lib/dummy-data";
import SuccessModal from "@/components/ui/SuccessModal";

type FormErrors = {
  nama?: string;
  nip?: string;
  email?: string;
  mapel?: string;
  password?: string;
  confirmPassword?: string;
};

export default function TambahGuruPage() {
  const router = useRouter();
  const [nama, setNama] = useState("");
  const [nip, setNip] = useState("");
  const [email, setEmail] = useState("");
  const [mapel, setMapel] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});
  const [showSuccess, setShowSuccess] = useState(false);

  const mapelOptions = getMapelNames();

  function validate(): FormErrors {
    const e: FormErrors = {};
    if (!nama.trim()) e.nama = "Nama lengkap wajib diisi";
    if (!nip.trim()) e.nip = "NIP wajib diisi";
    if (!email.trim()) e.email = "Email wajib diisi";
    if (!mapel) e.mapel = "Mata pelajaran wajib dipilih";
    if (!password) e.password = "Password wajib diisi";
    else if (password.length < 6) e.password = "Password minimal 6 karakter";
    if (confirmPassword !== password) e.confirmPassword = "Konfirmasi password tidak cocok";
    return e;
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const newErrors = validate();
    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;
    addGuru({ nama, nip, email, mapel, password });
    setShowSuccess(true);
  }

  return (
    <div>
      <p className="animate-fade-in-up text-sm text-muted">
        <Link href="/dashboard" className="hover:text-gray-300">Dashboard</Link>
        {" › "}
        <Link href="/guru-mapel" className="hover:text-gray-300">Guru & Mata Pelajaran</Link>
        {" › "}
        <span className="text-primary">Tambah Guru</span>
      </p>
      <h1 className="animate-fade-in-up mt-2 text-3xl font-bold text-primary" style={{ animationDelay: "40ms" }}>
        Tambah Guru Baru
      </h1>
      <p className="animate-fade-in-up mt-2 max-w-2xl text-muted" style={{ animationDelay: "80ms" }}>
        Buat akun untuk tenaga pendidik baru. NIP dan password ini nantinya
        diberikan kepada guru sebagai kredensial login.
      </p>

      <form
        onSubmit={handleSubmit}
        noValidate
        className="animate-fade-in-up mt-6 max-w-2xl rounded-2xl border border-border bg-surface p-8"
        style={{ animationDelay: "120ms" }}
      >
        <div className="mb-6">
          <label className="mb-2 block text-xs font-medium tracking-wide text-muted">NAMA LENGKAP</label>
          <div className="relative">
            <User size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted" />
            <input
              value={nama}
              onChange={(e) => { setNama(e.target.value); if (errors.nama) setErrors((p) => ({ ...p, nama: undefined })); }}
              type="text"
              placeholder="Contoh: Dr. Budi Santoso, M.Pd"
              className={`w-full rounded-xl border bg-black/30 py-3 pl-11 pr-4 text-sm text-gray-200 placeholder-gray-500 outline-none ${errors.nama ? "border-red-500/60" : "border-border focus:border-primary/50"}`}
            />
          </div>
          {errors.nama && <p className="mt-1.5 flex items-center gap-1.5 text-xs text-red-400"><AlertCircle size={13} /> {errors.nama}</p>}
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          <div>
            <label className="mb-2 block text-xs font-medium tracking-wide text-muted">NIP</label>
            <div className="relative">
              <IdCard size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted" />
              <input
                value={nip}
                onChange={(e) => { setNip(e.target.value); if (errors.nip) setErrors((p) => ({ ...p, nip: undefined })); }}
                type="text"
                placeholder="18 digit angka"
                className={`w-full rounded-xl border bg-black/30 py-3 pl-11 pr-4 text-sm text-gray-200 placeholder-gray-500 outline-none ${errors.nip ? "border-red-500/60" : "border-border focus:border-primary/50"}`}
              />
            </div>
            {errors.nip && <p className="mt-1.5 flex items-center gap-1.5 text-xs text-red-400"><AlertCircle size={13} /> {errors.nip}</p>}
          </div>

          <div>
            <label className="mb-2 block text-xs font-medium tracking-wide text-muted">EMAIL AKADEMIK</label>
            <div className="relative">
              <Mail size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted" />
              <input
                value={email}
                onChange={(e) => { setEmail(e.target.value); if (errors.email) setErrors((p) => ({ ...p, email: undefined })); }}
                type="email"
                placeholder="guru@aetheris.edu"
                className={`w-full rounded-xl border bg-black/30 py-3 pl-11 pr-4 text-sm text-gray-200 placeholder-gray-500 outline-none ${errors.email ? "border-red-500/60" : "border-border focus:border-primary/50"}`}
              />
            </div>
            {errors.email && <p className="mt-1.5 flex items-center gap-1.5 text-xs text-red-400"><AlertCircle size={13} /> {errors.email}</p>}
          </div>
        </div>

        <div className="mt-6">
          <label className="mb-2 block text-xs font-medium tracking-wide text-muted">MATA PELAJARAN UTAMA</label>
          <div className="relative">
            <BookOpen size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted" />
            <select
              value={mapel}
              onChange={(e) => { setMapel(e.target.value); if (errors.mapel) setErrors((p) => ({ ...p, mapel: undefined })); }}
              className={`w-full appearance-none rounded-xl border bg-black/30 py-3 pl-11 pr-9 text-sm text-gray-200 outline-none ${errors.mapel ? "border-red-500/60" : "border-border focus:border-primary/50"}`}
            >
              <option value="" disabled>Pilih mata pelajaran pengampu...</option>
              {mapelOptions.map((m) => (<option key={m} value={m}>{m}</option>))}
            </select>
            <ChevronDown size={15} className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-muted" />
          </div>
          {errors.mapel && <p className="mt-1.5 flex items-center gap-1.5 text-xs text-red-400"><AlertCircle size={13} /> {errors.mapel}</p>}
        </div>

        <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2">
          <div>
            <label className="mb-2 block text-xs font-medium tracking-wide text-muted">PASSWORD</label>
            <div className="relative">
              <Lock size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted" />
              <input
                value={password}
                onChange={(e) => { setPassword(e.target.value); if (errors.password) setErrors((p) => ({ ...p, password: undefined })); }}
                type={showPassword ? "text" : "password"}
                placeholder="Minimal 6 karakter"
                className={`w-full rounded-xl border bg-black/30 py-3 pl-11 pr-11 text-sm text-gray-200 placeholder-gray-500 outline-none ${errors.password ? "border-red-500/60" : "border-border focus:border-primary/50"}`}
              />
              <button type="button" onClick={() => setShowPassword((v) => !v)} className="absolute right-4 top-1/2 -translate-y-1/2 text-muted hover:text-gray-300">
                {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
            {errors.password && <p className="mt-1.5 flex items-center gap-1.5 text-xs text-red-400"><AlertCircle size={13} /> {errors.password}</p>}
          </div>

          <div>
            <label className="mb-2 block text-xs font-medium tracking-wide text-muted">KONFIRMASI PASSWORD</label>
            <div className="relative">
              <Lock size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted" />
              <input
                value={confirmPassword}
                onChange={(e) => { setConfirmPassword(e.target.value); if (errors.confirmPassword) setErrors((p) => ({ ...p, confirmPassword: undefined })); }}
                type={showPassword ? "text" : "password"}
                placeholder="Ulangi password"
                className={`w-full rounded-xl border bg-black/30 py-3 pl-11 pr-4 text-sm text-gray-200 placeholder-gray-500 outline-none ${errors.confirmPassword ? "border-red-500/60" : "border-border focus:border-primary/50"}`}
              />
            </div>
            {errors.confirmPassword && <p className="mt-1.5 flex items-center gap-1.5 text-xs text-red-400"><AlertCircle size={13} /> {errors.confirmPassword}</p>}
          </div>
        </div>

        <div className="mt-8 flex justify-end gap-3 border-t border-border pt-6">
          <Link href="/guru-mapel" className="rounded-full border border-border px-6 py-2.5 text-sm font-medium text-gray-300 transition-colors hover:bg-white/5">
            BATAL
          </Link>
          <button type="submit" className="rounded-full bg-primary px-6 py-2.5 text-sm font-semibold text-bg transition-transform hover:scale-105">
            SIMPAN →
          </button>
        </div>
      </form>

      <SuccessModal open={showSuccess} onClose={() => router.push("/guru-mapel")} message="Guru berhasil ditambahkan" />
    </div>
  );
}