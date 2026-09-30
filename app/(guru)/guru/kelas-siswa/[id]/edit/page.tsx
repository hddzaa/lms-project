"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { ChevronDown, Loader2, Plus, Trash2 } from "lucide-react";
import Toast from "@/components/ui/Toast";

type Pengajar = { mapel: string; guruNama: string };

export default function GuruEditKelasPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();

  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [forbidden, setForbidden] = useState(false);
  const [nama, setNama] = useState("");
  const [wali, setWali] = useState("");
  const [tahunAjaran, setTahunAjaran] = useState("");
  const [pengajar, setPengajar] = useState<Pengajar[]>([]);
  const [waliOptions, setWaliOptions] = useState<string[]>([]);
  const [mapelOptions, setMapelOptions] = useState<string[]>([]);
  const [showToast, setShowToast] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    async function load() {
      const [kelasRes, guruRes, mapelRes] = await Promise.all([
        fetch(`/api/kelas/${params.id}`),
        fetch("/api/guru"),
        fetch("/api/mapel"),
      ]);
      const guruData = await guruRes.json();
      const mapelData = await mapelRes.json();
      setWaliOptions(guruData.map((g: any) => g.nama));
      setMapelOptions(mapelData.map((m: any) => m.nama));

      if (!kelasRes.ok) {
        setNotFound(true);
        setLoading(false);
        return;
      }
      const data = await kelasRes.json();
      setNama(`${data.grade} ${data.name}`);
      setWali(data.waliKelas);
      setTahunAjaran(data.tahunAjaran);
      setPengajar(data.pengajar ?? []);
      setLoading(false);
    }
    load();
  }, [params.id]);

  function addPengajar() {
    setPengajar((prev) => [...prev, { mapel: "", guruNama: "" }]);
  }
  function updatePengajar(index: number, field: keyof Pengajar, value: string) {
    setPengajar((prev) => prev.map((p, i) => (i === index ? { ...p, [field]: value } : p)));
  }
  function removePengajar(index: number) {
    setPengajar((prev) => prev.filter((_, i) => i !== index));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const parts = nama.trim().split(" ");
    const grade = parts[0].toUpperCase();
    const rest = parts.slice(1).join(" ") || nama;
    const validPengajar = pengajar.filter((p) => p.mapel && p.guruNama);

    setSubmitting(true);
    const res = await fetch(`/api/kelas/${params.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        grade: ["X", "XI", "XII"].includes(grade) ? grade : "X",
        name: rest,
        waliKelas: wali,
        tahunAjaran,
        pengajar: validPengajar,
      }),
    });
    setSubmitting(false);

    if (res.status === 403) {
      setForbidden(true);
      return;
    }
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
        <Link href="/guru/kelas-siswa" className="text-primary hover:underline">Kembali</Link>
      </div>
    );
  }

  if (forbidden) {
    return (
      <div className="text-red-400">
        Anda bukan wali kelas ini, tidak diizinkan mengubah data.{" "}
        <Link href="/guru/kelas-siswa" className="text-primary hover:underline">Kembali</Link>
      </div>
    );
  }

  return (
    <div>
      <h1 className="animate-fade-in-up text-3xl font-bold text-white">Edit Kelas</h1>
      <p className="animate-fade-in-up mt-2 text-muted" style={{ animationDelay: "40ms" }}>
        Perbarui informasi kelas dan pengajar mata pelajaran.
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
            {waliOptions.map((g) => (<option key={g} value={g}>{g}</option>))}
          </select>
          <ChevronDown size={16} className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-muted" />
        </div>
        <p className="-mt-4 mb-6 text-xs text-muted">
          Catatan: mengganti wali kelas ke guru lain akan membuat Anda kehilangan akses kelola kelas ini.
        </p>

        <label className="mb-2 block text-xs font-medium tracking-wide text-muted">TAHUN AJARAN</label>
        <input
          value={tahunAjaran}
          onChange={(e) => setTahunAjaran(e.target.value)}
          type="text"
          className="mb-8 w-full rounded-xl border border-border bg-black/30 px-4 py-3 text-sm text-gray-200 outline-none focus:border-primary/50"
        />

        <div className="mb-3 flex items-center justify-between">
          <label className="block text-xs font-medium tracking-wide text-muted">GURU PENGAJAR</label>
          <button
            type="button"
            onClick={addPengajar}
            className="flex items-center gap-1.5 rounded-full border border-border px-3 py-1.5 text-xs text-gray-300 transition-colors hover:bg-white/5"
          >
            <Plus size={13} /> Tambah Pengajar
          </button>
        </div>

        <div className="space-y-3">
          {pengajar.map((p, i) => (
            <div key={i} className="flex items-center gap-2">
              <select
                value={p.mapel}
                onChange={(e) => updatePengajar(i, "mapel", e.target.value)}
                className="w-1/2 rounded-xl border border-border bg-black/30 px-3 py-2.5 text-sm text-gray-200 outline-none focus:border-primary/50"
              >
                <option value="" disabled>Pilih Mapel</option>
                {mapelOptions.map((m) => (<option key={m} value={m}>{m}</option>))}
              </select>
              <select
                value={p.guruNama}
                onChange={(e) => updatePengajar(i, "guruNama", e.target.value)}
                className="w-1/2 rounded-xl border border-border bg-black/30 px-3 py-2.5 text-sm text-gray-200 outline-none focus:border-primary/50"
              >
                <option value="" disabled>Pilih Guru</option>
                {waliOptions.map((g) => (<option key={g} value={g}>{g}</option>))}
              </select>
              <button type="button" onClick={() => removePengajar(i)} className="shrink-0 text-red-400 transition-transform hover:scale-110 hover:text-red-300">
                <Trash2 size={16} />
              </button>
            </div>
          ))}
          {pengajar.length === 0 && (
            <p className="text-sm text-muted">Belum ada guru pengajar mata pelajaran di kelas ini.</p>
          )}
        </div>

        <div className="mt-8 flex justify-end gap-3 border-t border-border pt-6">
          <Link href="/guru/kelas-siswa" className="rounded-full border border-border px-6 py-2.5 text-sm font-medium text-gray-300 transition-colors hover:bg-white/5">
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
        onClose={() => { setShowToast(false); router.push("/guru/kelas-siswa"); }}
        message="Perubahan berhasil disimpan"
      />
    </div>
  );
}