"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { ChevronDown, Loader2 } from "lucide-react";
import Toast from "@/components/ui/Toast";

// Di form pakai angka biasa, di database dan tampilan utama pakai angka romawi
const KELAS_OPTIONS = [
  { angka: "10", romawi: "X" },
  { angka: "11", romawi: "XI" },
  { angka: "12", romawi: "XII" },
] as const;

export default function EditKelasPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();

  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [kelas, setKelas] = useState("");
  const [namaLengkap, setNamaLengkap] = useState("");
  const [wali, setWali] = useState("");
  const [tahunAjaran, setTahunAjaran] = useState("");
  const [waliKelasOptions, setWaliKelasOptions] = useState<string[]>([]);
  const [showToast, setShowToast] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [kelasId, setKelasId] = useState("");

  useEffect(() => {
    async function load() {
      const [kelasRes, guruRes] = await Promise.all([
        fetch(`/api/kelas/${params.id}`),
        fetch("/api/guru"),
      ]);
      const guruData = await guruRes.json();
      setWaliKelasOptions(guruData.map((g: any) => g.nama));

      if (!kelasRes.ok) {
        setNotFound(true);
        setLoading(false);
        return;
      }
      const data = await kelasRes.json();
      setKelasId(data.id);
      setKelas(KELAS_OPTIONS.find((k) => k.romawi === data.grade)?.angka ?? "");
      setNamaLengkap(`${data.grade} ${data.name}`);
      setWali(data.waliKelas);
      setTahunAjaran(data.tahunAjaran);
      setLoading(false);
    }
    load();
  }, [params.id]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const grade = KELAS_OPTIONS.find((k) => k.angka === kelas)?.romawi;
    if (!grade) return;

    setSubmitting(true);
    await fetch(`/api/kelas/${kelasId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        grade,
        waliKelas: wali,
        tahunAjaran,
      }),
    });
    setSubmitting(false);
    setShowToast(true);
  }

  if (loading) {
    return (
      <div className="flex items-center gap-2 text-muted">
        <Loader2 size={18} className="animate-spin" /> Memuat data kelas...
      </div>
    );
  }

  if (notFound) {
    return (
      <div className="text-muted">
        Kelas tidak ditemukan.{" "}
        <Link href="/kelas-siswa" className="text-primary hover:underline">Kembali ke daftar kelas</Link>
      </div>
    );
  }

  return (
    <div>
      <Link href="/kelas-siswa" className="animate-fade-in-up mb-4 inline-block text-sm text-muted hover:text-white">
        ← Kembali
      </Link>
      <h1 className="animate-fade-in-up text-3xl font-bold text-white">Edit Kelas</h1>
      <p className="animate-fade-in-up mt-2 text-muted" style={{ animationDelay: "40ms" }}>
        Perbarui informasi kelas <span className="text-gray-200">{namaLengkap}</span>.
      </p>

      <form
        onSubmit={handleSubmit}
        className="animate-fade-in-up mt-6 max-w-2xl rounded-2xl border border-border bg-surface p-8"
        style={{ animationDelay: "80ms" }}
      >
        <label className="mb-2 block text-xs font-medium tracking-wide text-muted">KELAS</label>
        <div className="relative mb-6">
          <select
            value={kelas}
            onChange={(e) => setKelas(e.target.value)}
            className="w-full appearance-none rounded-xl border border-border bg-black/30 px-4 py-3 text-sm text-gray-200 outline-none focus:border-primary/50"
          >
            {KELAS_OPTIONS.map((k) => (
              <option key={k.angka} value={k.angka}>{k.angka}</option>
            ))}
          </select>
          <ChevronDown size={16} className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-muted" />
        </div>

        <label className="mb-2 block text-xs font-medium tracking-wide text-muted">WALI KELAS</label>
        <div className="relative mb-6">
          <select
            value={wali}
            onChange={(e) => setWali(e.target.value)}
            className="w-full appearance-none rounded-xl border border-border bg-black/30 px-4 py-3 text-sm text-gray-200 outline-none focus:border-primary/50"
          >
            {waliKelasOptions.map((g) => (<option key={g} value={g}>{g}</option>))}
          </select>
          <ChevronDown size={16} className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-muted" />
        </div>

        <label className="mb-2 block text-xs font-medium tracking-wide text-muted">TAHUN AJARAN</label>
        <input
          value={tahunAjaran}
          onChange={(e) => setTahunAjaran(e.target.value)}
          type="text"
          className="w-full rounded-xl border border-border bg-black/30 px-4 py-3 text-sm text-gray-200 outline-none focus:border-primary/50"
        />

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

      <Toast
        open={showToast}
        onClose={() => { setShowToast(false); router.push("/kelas-siswa"); }}
        message="Perubahan berhasil disimpan"
      />
    </div>
  );
}