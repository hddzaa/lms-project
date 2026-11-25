"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { ChevronDown, Loader2, Check, AlertCircle } from "lucide-react";
import Toast from "@/components/ui/Toast";
import { JURUSAN } from "@/lib/jurusan";

type MapelItem = { nama: string; guruPengampu: string };

// Di form pakai angka biasa, di database dan tampilan utama pakai angka romawi
const KELAS_OPTIONS = [
  { angka: "10", romawi: "X" },
  { angka: "11", romawi: "XI" },
  { angka: "12", romawi: "XII" },
] as const;

// Ambil kode jurusan dari data kelas. Kelas lama yang category-nya "Umum"
// dibaca dari nama kelasnya (misal "PPLG 1" -> PPLG).
function cariKodeJurusan(category: string, name: string) {
  return (
    JURUSAN.find((j) => j.kode === category)?.kode ??
    JURUSAN.find((j) => name.toUpperCase().split(" ").includes(j.kode))?.kode ??
    ""
  );
}

export default function EditKelasPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();

  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [kelasId, setKelasId] = useState("");

  // Isi form (diisi dari data yang tersimpan)
  const [kelas, setKelas] = useState("");
  const [jurusan, setJurusan] = useState("");
  const [wali, setWali] = useState("");
  const [tahunAjaran, setTahunAjaran] = useState("");
  const [mapelDipilih, setMapelDipilih] = useState<string[]>([]);

  // Data asli, untuk mendeteksi perubahan kelas/jurusan
  const [namaAsli, setNamaAsli] = useState("");
  const [gradeAsli, setGradeAsli] = useState("");
  const [jurusanAsli, setJurusanAsli] = useState("");

  const [waliKelasOptions, setWaliKelasOptions] = useState<string[]>([]);
  const [mapelOptions, setMapelOptions] = useState<MapelItem[]>([]);
  const [errorJurusan, setErrorJurusan] = useState("");
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
      const kodeJurusan = cariKodeJurusan(data.category ?? "", data.name ?? "");

      setKelasId(data.id);
      setKelas(KELAS_OPTIONS.find((k) => k.romawi === data.grade)?.angka ?? "");
      setJurusan(kodeJurusan);
      setWali(data.waliKelas);
      setTahunAjaran(data.tahunAjaran);
      setMapelDipilih(data.mapel ?? []);

      setNamaAsli(data.name);
      setGradeAsli(data.grade);
      setJurusanAsli(kodeJurusan);
      setLoading(false);
    }
    load();
  }, [params.id]);

  function toggleMapel(m: string) {
    setMapelDipilih((prev) => (prev.includes(m) ? prev.filter((x) => x !== m) : [...prev, m]));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const grade = KELAS_OPTIONS.find((k) => k.angka === kelas)?.romawi;
    if (!grade) return;
    if (!jurusan) {
      setErrorJurusan("Jurusan wajib dipilih");
      return;
    }

    setSubmitting(true);

    // Nama kelas hanya dibuat ulang kalau kelas atau jurusan berubah
    let name = namaAsli;
    if (grade !== gradeAsli || jurusan !== jurusanAsli) {
      const res = await fetch("/api/kelas");
      const semua: { id: string; grade: string; name: string }[] = await res.json();
      const prefix = `${jurusan} `;
      const nomorTerpakai = semua
        .filter((k) => k.id !== kelasId && k.grade === grade && k.name.startsWith(prefix))
        .map((k) => parseInt(k.name.slice(prefix.length), 10))
        .filter((n) => !isNaN(n));
      const nomor = nomorTerpakai.length > 0 ? Math.max(...nomorTerpakai) + 1 : 1;
      name = `${jurusan} ${nomor}`;
    }

    await fetch(`/api/kelas/${kelasId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        grade,
        name,
        category: jurusan,
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
        Perbarui informasi dan mata pelajaran kelas{" "}
        <span className="text-gray-200">{gradeAsli} {namaAsli}</span>.
      </p>

      <form
        onSubmit={handleSubmit}
        noValidate
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

        <label className="mb-2 block text-xs font-medium tracking-wide text-muted">JURUSAN</label>
        <div className="relative">
          <select
            value={jurusan}
            onChange={(e) => { setJurusan(e.target.value); setErrorJurusan(""); }}
            className={`w-full appearance-none rounded-xl border bg-black/30 px-4 py-3 text-sm text-gray-200 outline-none ${errorJurusan ? "border-red-500/60" : "border-border focus:border-primary/50"}`}
          >
            <option value="" disabled>Pilih Jurusan</option>
            {JURUSAN.map((j) => (
              <option key={j.kode} value={j.kode}>{j.kode} - {j.nama}</option>
            ))}
          </select>
          <ChevronDown size={16} className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-muted" />
        </div>
        {errorJurusan && <p className="mt-1.5 flex items-center gap-1.5 text-xs text-red-400"><AlertCircle size={13} /> {errorJurusan}</p>}

        <label className="mb-2 mt-6 block text-xs font-medium tracking-wide text-muted">WALI KELAS</label>
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

      <Toast
        open={showToast}
        onClose={() => { setShowToast(false); router.push("/kelas-siswa"); }}
        message="Perubahan berhasil disimpan"
      />
    </div>
  );
}