"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ChevronDown, AlertCircle, Check } from "lucide-react";
import SuccessModal from "@/components/ui/SuccessModal";
import { JURUSAN } from "@/lib/jurusan";

type FormErrors = { kelas?: string; jurusan?: string; wali?: string; tahunAjaran?: string };
type MapelItem = { nama: string; guruPengampu: string };

// Di form pakai angka biasa, di database dan tampilan utama pakai angka romawi
const KELAS_OPTIONS = [
  { angka: "10", romawi: "X" },
  { angka: "11", romawi: "XI" },
  { angka: "12", romawi: "XII" },
] as const;

export default function TambahKelasPage() {
  const router = useRouter();
  const [kelas, setKelas] = useState("");
  const [jurusan, setJurusan] = useState("");
  const [wali, setWali] = useState("");
  const [tahunAjaran, setTahunAjaran] = useState("2023/2024");
  const [mapelDipilih, setMapelDipilih] = useState<string[]>([]);
  const [errors, setErrors] = useState<FormErrors>({});
  const [showSuccess, setShowSuccess] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [waliKelasOptions, setWaliKelasOptions] = useState<string[]>([]);
  const [mapelOptions, setMapelOptions] = useState<MapelItem[]>([]);

  useEffect(() => {
    fetch("/api/guru")
      .then((res) => res.json())
      .then((data) => setWaliKelasOptions(data.map((g: any) => g.nama)));

    fetch("/api/mapel")
      .then((res) => res.json())
      .then((data) =>
        setMapelOptions(
          data.map((m: any) => ({
            nama: m.nama,
            guruPengampu: Array.isArray(m.guruPengampu) ? m.guruPengampu.join(", ") : m.guruPengampu || "",
          }))
        )
      );
  }, []);

  function toggleMapel(m: string) {
    setMapelDipilih((prev) => (prev.includes(m) ? prev.filter((x) => x !== m) : [...prev, m]));
  }

  function validate(): FormErrors {
    const newErrors: FormErrors = {};
    if (!kelas) newErrors.kelas = "Kelas wajib dipilih";
    if (!jurusan) newErrors.jurusan = "Jurusan wajib dipilih";
    if (!wali) newErrors.wali = "Wali kelas wajib dipilih";
    if (!tahunAjaran.trim()) newErrors.tahunAjaran = "Tahun ajaran wajib diisi";
    return newErrors;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const newErrors = validate();
    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;

    const grade = KELAS_OPTIONS.find((k) => k.angka === kelas)!.romawi;

    setSubmitting(true);

    // Nama kelas dibuat otomatis: kode jurusan + nomor urut (PPLG 1, PPLG 2, ...)
    const res = await fetch("/api/kelas");
    const semua: { grade: string; name: string }[] = await res.json();
    const prefix = `${jurusan} `;
    const nomorTerpakai = semua
      .filter((k) => k.grade === grade && k.name.startsWith(prefix))
      .map((k) => parseInt(k.name.slice(prefix.length), 10))
      .filter((n) => !isNaN(n));
    const nomor = nomorTerpakai.length > 0 ? Math.max(...nomorTerpakai) + 1 : 1;

    await fetch("/api/kelas", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        grade,
        name: `${jurusan} ${nomor}`,
        category: jurusan,
        waliKelas: wali,
        kapasitas: 36,
        tahunAjaran,
        mapel: mapelDipilih,
      }),
    });
    setSubmitting(false);
    setShowSuccess(true);
  }

  return (
    <div>
      <span className="animate-fade-in-up mb-4 inline-flex items-center gap-2 rounded-full bg-primary-soft px-4 py-1.5 text-xs font-semibold tracking-wide text-primary">
        KELAS BARU
        <span className="h-1.5 w-1.5 rounded-full bg-primary" />
      </span>
      <h1 className="animate-fade-in-up text-3xl font-bold text-white" style={{ animationDelay: "40ms" }}>
        Tambah Kelas
      </h1>
      <p className="animate-fade-in-up mt-2 text-muted" style={{ animationDelay: "80ms" }}>
        Tambahkan kelas baru ke dalam sistem manajemen akademik.
      </p>

      <form
        onSubmit={handleSubmit}
        noValidate
        className="animate-fade-in-up mt-6 max-w-2xl rounded-2xl border border-border bg-surface p-8"
        style={{ animationDelay: "120ms" }}
      >
        <label className="mb-2 block text-xs font-medium tracking-wide text-muted">KELAS</label>
        <div className="relative">
          <select
            value={kelas}
            onChange={(e) => { setKelas(e.target.value); if (errors.kelas) setErrors((p) => ({ ...p, kelas: undefined })); }}
            className={`w-full appearance-none rounded-xl border bg-black/30 px-4 py-3 text-sm text-gray-200 outline-none ${errors.kelas ? "border-red-500/60" : "border-border focus:border-primary/50"}`}
          >
            <option value="" disabled>Pilih Kelas</option>
            {KELAS_OPTIONS.map((k) => (
              <option key={k.angka} value={k.angka}>{k.angka}</option>
            ))}
          </select>
          <ChevronDown size={16} className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-muted" />
        </div>
        {errors.kelas && <p className="mt-1.5 flex items-center gap-1.5 text-xs text-red-400"><AlertCircle size={13} /> {errors.kelas}</p>}

        <label className="mb-2 mt-6 block text-xs font-medium tracking-wide text-muted">JURUSAN</label>
        <div className="relative">
          <select
            value={jurusan}
            onChange={(e) => { setJurusan(e.target.value); if (errors.jurusan) setErrors((p) => ({ ...p, jurusan: undefined })); }}
            className={`w-full appearance-none rounded-xl border bg-black/30 px-4 py-3 text-sm text-gray-200 outline-none ${errors.jurusan ? "border-red-500/60" : "border-border focus:border-primary/50"}`}
          >
            <option value="" disabled>Pilih Jurusan</option>
            {JURUSAN.map((j) => (
              <option key={j.kode} value={j.kode}>{j.kode} - {j.nama}</option>
            ))}
          </select>
          <ChevronDown size={16} className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-muted" />
        </div>
        {errors.jurusan && <p className="mt-1.5 flex items-center gap-1.5 text-xs text-red-400"><AlertCircle size={13} /> {errors.jurusan}</p>}

        <label className="mb-2 mt-6 block text-xs font-medium tracking-wide text-muted">WALI KELAS</label>
        <div className="relative">
          <select
            value={wali}
            onChange={(e) => { setWali(e.target.value); if (errors.wali) setErrors((p) => ({ ...p, wali: undefined })); }}
            className={`w-full appearance-none rounded-xl border bg-black/30 px-4 py-3 text-sm text-gray-200 outline-none ${errors.wali ? "border-red-500/60" : "border-border focus:border-primary/50"}`}
          >
            <option value="" disabled>Pilih Guru Pengampu</option>
            {waliKelasOptions.map((g) => (<option key={g} value={g}>{g}</option>))}
          </select>
          <ChevronDown size={16} className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-muted" />
        </div>
        {errors.wali && <p className="mt-1.5 flex items-center gap-1.5 text-xs text-red-400"><AlertCircle size={13} /> {errors.wali}</p>}

        <label className="mb-2 mt-6 block text-xs font-medium tracking-wide text-muted">TAHUN AJARAN</label>
        <input
          value={tahunAjaran}
          onChange={(e) => { setTahunAjaran(e.target.value); if (errors.tahunAjaran) setErrors((p) => ({ ...p, tahunAjaran: undefined })); }}
          type="text"
          placeholder="2023/2024"
          className={`w-full rounded-xl border bg-black/30 px-4 py-3 text-sm text-gray-200 placeholder-gray-500 outline-none ${errors.tahunAjaran ? "border-red-500/60" : "border-border focus:border-primary/50"}`}
        />
        {errors.tahunAjaran && <p className="mt-1.5 flex items-center gap-1.5 text-xs text-red-400"><AlertCircle size={13} /> {errors.tahunAjaran}</p>}

        <label className="mb-1 mt-8 block text-xs font-medium tracking-wide text-muted">MATA PELAJARAN DI KELAS INI</label>
        <p className="mb-3 text-xs text-muted">Guru pengampu tiap mapel otomatis bisa mengakses kelas ini.</p>

        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
          {mapelOptions.map((m) => {
            const aktif = mapelDipilih.includes(m.nama);
            return (
              <button
                key={m.nama}
                type="button"
                onClick={() => toggleMapel(m.nama)}
                className={`flex items-center gap-3 rounded-xl border px-3 py-2.5 text-left transition-colors ${
                  aktif ? "border-primary/50 bg-primary-soft" : "border-border hover:bg-white/5"
                }`}
              >
                <span
                  className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-md border ${
                    aktif ? "border-primary bg-primary text-bg" : "border-gray-500"
                  }`}
                >
                  {aktif && <Check size={13} />}
                </span>
                <span className="min-w-0">
                  <p className="truncate text-sm font-medium text-white">{m.nama}</p>
                  <p className="truncate text-xs text-muted">{m.guruPengampu || "Belum ada guru pengampu"}</p>
                </span>
              </button>
            );
          })}
          {mapelOptions.length === 0 && <p className="text-sm text-muted">Belum ada mata pelajaran. Tambahkan di menu Guru & Mata Pelajaran.</p>}
        </div>

        <div className="mt-8 flex justify-end gap-3 border-t border-border pt-6">
          <Link href="/kelas-siswa" className="rounded-full border border-border px-6 py-2.5 text-sm font-medium text-gray-300 transition-colors hover:bg-white/5">
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

      <SuccessModal open={showSuccess} onClose={() => router.push("/kelas-siswa")} message="Kelas berhasil ditambahkan" />
    </div>
  );
}