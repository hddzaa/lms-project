"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { ChevronDown, Loader2, Check } from "lucide-react";
import Toast from "@/components/ui/Toast";

type MapelItem = { nama: string; guruPengampu: string };

export default function EditKelasPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();

  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [nama, setNama] = useState("");
  const [wali, setWali] = useState("");
  const [tahunAjaran, setTahunAjaran] = useState("");
  const [mapelDipilih, setMapelDipilih] = useState<string[]>([]);
  const [waliKelasOptions, setWaliKelasOptions] = useState<string[]>([]);
  const [mapelOptions, setMapelOptions] = useState<MapelItem[]>([]);
  const [showToast, setShowToast] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [kelasId, setKelasId] = useState("");

  useEffect(() => {
    async function load() {
      const [kelasRes, guruRes, mapelRes] = await Promise.all([
        fetch(`/api/kelas/${params.id}`),
        fetch("/api/guru"),
        fetch("/api/mapel"),
      ]);
      const guruData = await guruRes.json();
      const mapelData = await mapelRes.json();
      setWaliKelasOptions(guruData.map((g: any) => g.nama));
      setMapelOptions(
        mapelData.map((m: any) => ({
          nama: m.nama,
          guruPengampu: Array.isArray(m.guruPengampu) ? m.guruPengampu.join(", ") : m.guruPengampu || "",
        }))
      );

      if (!kelasRes.ok) {
        setNotFound(true);
        setLoading(false);
        return;
      }
      const data = await kelasRes.json();
      setKelasId(data.id);
      setNama(`${data.grade} ${data.name}`);
      setWali(data.waliKelas);
      setTahunAjaran(data.tahunAjaran);
      setMapelDipilih(data.mapel ?? []);
      setLoading(false);
    }
    load();
  }, [params.id]);

  function toggleMapel(m: string) {
    setMapelDipilih((prev) => (prev.includes(m) ? prev.filter((x) => x !== m) : [...prev, m]));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const parts = nama.trim().split(" ");
    const grade = parts[0].toUpperCase();
    const rest = parts.slice(1).join(" ") || nama;

    setSubmitting(true);
    await fetch(`/api/kelas/${kelasId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        grade: ["X", "XI", "XII"].includes(grade) ? grade : "X",
        name: rest,
        waliKelas: wali,
        tahunAjaran,
        mapel: mapelDipilih,
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
        Perbarui informasi kelas dan mata pelajaran yang diajarkan.
      </p>

      <form
        onSubmit={handleSubmit}
        className="animate-fade-in-up mt-6 max-w-2xl rounded-2xl border border-border bg-surface p-8"
        style={{ animationDelay: "80ms" }}
      >
        <label className="mb-2 block text-xs font-medium tracking-wide text-muted">NAMA KELAS</label>
        <input
          value={nama}
          onChange={(e) => setNama(e.target.value)}
          type="text"
          className="mb-6 w-full rounded-xl border border-border bg-black/30 px-4 py-3 text-sm text-gray-200 outline-none focus:border-primary/50"
        />

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
          className="mb-8 w-full rounded-xl border border-border bg-black/30 px-4 py-3 text-sm text-gray-200 outline-none focus:border-primary/50"
        />

        <label className="mb-1 block text-xs font-medium tracking-wide text-muted">MATA PELAJARAN DI KELAS INI</label>
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
          {mapelOptions.length === 0 && <p className="text-sm text-muted">Belum ada mata pelajaran. Tambahkan di menu Mata Pelajaran.</p>}
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

      <Toast
        open={showToast}
        onClose={() => { setShowToast(false); router.push("/kelas-siswa"); }}
        message="Perubahan berhasil disimpan"
      />
    </div>
  );
}