"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ChevronDown, Loader2, AlertCircle } from "lucide-react";
import Toast from "@/components/ui/Toast";

type Opsi = { kelasId: string; grade: string; name: string; mapel: string };

export default function EditMateriPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();

  const [loading, setLoading] = useState(true);
  const [opsi, setOpsi] = useState<Opsi[]>([]);
  const [judul, setJudul] = useState("");
  const [mapel, setMapel] = useState("");
  const [kelasId, setKelasId] = useState("");
  const [deskripsi, setDeskripsi] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [error, setError] = useState("");

  const mapelOptions = Array.from(new Set([...opsi.map((o) => o.mapel), ...(mapel ? [mapel] : [])]));

  useEffect(() => {
    async function load() {
      const [materiRes, opsiRes] = await Promise.all([
        fetch(`/api/materi/${params.id}`),
        fetch("/api/guru/mapel-kelas"),
      ]);
      const opsiData = await opsiRes.json();
      if (Array.isArray(opsiData)) setOpsi(opsiData);

      if (materiRes.ok) {
        const data = await materiRes.json();
        setJudul(data.judul);
        setMapel(data.mapel);
        setKelasId(data.kelasId);
        setDeskripsi(data.deskripsi);
      }
      setLoading(false);
    }
    load();
  }, [params.id]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    const res = await fetch(`/api/materi/${params.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ judul, mapel, kelasId, deskripsi }),
    });
    setSubmitting(false);
    if (!res.ok) {
      const d = await res.json().catch(() => ({}));
      setError(d.error || "Gagal menyimpan perubahan.");
      return;
    }
    setShowToast(true);
  }

  if (loading) {
    return (
      <div className="flex items-center gap-2 text-muted">
        <Loader2 size={18} className="animate-spin" /> Memuat data materi...
      </div>
    );
  }

  return (
    <div>
      <Link href={`/guru/materi/${params.id}`} className="animate-fade-in-up mb-4 inline-block text-sm text-muted hover:text-white">
        ← Kembali
      </Link>
      <h1 className="animate-fade-in-up text-3xl font-bold text-white">Edit Materi</h1>
      <p className="animate-fade-in-up mt-2 text-muted" style={{ animationDelay: "40ms" }}>
        Perbarui informasi materi pembelajaran.
      </p>

      <form
        onSubmit={handleSubmit}
        className="animate-fade-in-up mt-6 max-w-2xl rounded-2xl border border-border bg-surface p-8"
        style={{ animationDelay: "80ms" }}
      >
        <label className="mb-2 block text-xs font-medium tracking-wide text-muted">JUDUL MATERI</label>
        <input
          value={judul}
          onChange={(e) => setJudul(e.target.value)}
          type="text"
          className="mb-6 w-full rounded-xl border border-border bg-black/30 px-4 py-3 text-sm text-gray-200 outline-none focus:border-primary/50"
        />

        <div className="mb-6 grid grid-cols-2 gap-4">
          <div>
            <label className="mb-2 block text-xs font-medium tracking-wide text-muted">MATA PELAJARAN</label>
            <div className="relative">
              <select
                value={mapel}
                onChange={(e) => setMapel(e.target.value)}
                className="w-full appearance-none rounded-xl border border-border bg-black/30 px-4 py-3 text-sm text-gray-200 outline-none focus:border-primary/50"
              >
                <option value="">Pilih Mapel</option>
                {mapelOptions.map((m) => (<option key={m} value={m}>{m}</option>))}
              </select>
              <ChevronDown size={16} className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-muted" />
            </div>
          </div>
          <div>
            <label className="mb-2 block text-xs font-medium tracking-wide text-muted">KELAS</label>
            <div className="relative">
              <select
                value={kelasId}
                onChange={(e) => setKelasId(e.target.value)}
                className="w-full appearance-none rounded-xl border border-border bg-black/30 px-4 py-3 text-sm text-gray-200 outline-none focus:border-primary/50"
              >
                <option value="">Pilih Kelas</option>
                {opsi.map((k) => (<option key={k.kelasId} value={k.kelasId}>{k.grade} {k.name}</option>))}
              </select>
              <ChevronDown size={16} className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-muted" />
            </div>
          </div>
        </div>

        <label className="mb-2 block text-xs font-medium tracking-wide text-muted">DESKRIPSI SINGKAT</label>
        <textarea
          value={deskripsi}
          onChange={(e) => setDeskripsi(e.target.value)}
          rows={5}
          className="mb-4 w-full resize-none rounded-xl border border-border bg-black/30 px-4 py-3 text-sm text-gray-200 outline-none focus:border-primary/50"
        />

        {error && (
          <p className="mb-4 flex items-center gap-1.5 text-xs text-red-400"><AlertCircle size={13} /> {error}</p>
        )}

        <div className="flex justify-end gap-3 border-t border-border pt-6">
          <Link href={`/guru/materi/${params.id}`} className="rounded-full border border-border px-6 py-2.5 text-sm font-medium text-gray-300 transition-colors hover:bg-white/5">
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
        onClose={() => { setShowToast(false); router.push(`/guru/materi/${params.id}`); }}
        message="Materi berhasil diperbarui"
      />
    </div>
  );
}