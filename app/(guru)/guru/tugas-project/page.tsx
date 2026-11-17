"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";

type Tugas = {
  _id: string;
  judul: string;
  deskripsi: string;
  jenis: "tugas" | "project";
  mode: "individu" | "kelompok";
  mapel: string;
  kelasId: { _id: string; grade: string; name: string } | string
  deadline: string;
  jumlahKumpul: number;
};

const kosong = { judul: "", deskripsi: "", jenis: "tugas", mode: "individu", mapel: "", kelasId: "", deadline: "" };

const toLocalInput = (iso: string) => {
  const d = new Date(iso);
  d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
  return d.toISOString().slice(0, 16);
};

export default function TugasProjectGuruPage() {
  const { data: session } = useSession();
  const [list, setList] = useState<Tugas[]>([]);
  const [kelas, setKelas] = useState<{ id: string; grade: string; name: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"semua" | "tugas" | "project">("semua");
  const [open, setOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState<any>(kosong);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState("");
  const [hapusId, setHapusId] = useState<string | null>(null);

  const mapelUser = session?.user?.mapel as unknown;
  const mapelOptions: string[] = Array.isArray(mapelUser) ? mapelUser : mapelUser ? [String(mapelUser)] : [];

  const load = async () => {
    setLoading(true);
    const res = await fetch("/api/guru/tugas");
    if (res.ok) setList(await res.json());
    setLoading(false);
  };

  useEffect(() => {
    load();
    fetch("/api/guru/kelas")
      .then((r) => r.json())
      .then((d) => setKelas(Array.isArray(d) ? d : []))
      .catch(() => { });
  }, []);

  const showToast = (m: string) => {
    setToast(m);
    setTimeout(() => setToast(""), 2500);
  };

  const bukaTambah = () => {
    setEditId(null);
    setForm({ ...kosong, mapel: mapelOptions[0] || "" });
    setError("");
    setOpen(true);
  };

  const bukaEdit = (t: Tugas) => {
    setEditId(t._id);
    setForm({
      judul: t.judul,
      deskripsi: t.deskripsi,
      jenis: t.jenis,
      mode: t.mode,
      mapel: t.mapel,
      kelasId: typeof t.kelasId === "string" ? t.kelasId : t.kelasId?._id,
      deadline: toLocalInput(t.deadline),
    });
    setError("");
    setOpen(true);
  };

  const simpan = async () => {
    if (!form.judul || !form.mapel || !form.kelasId || !form.deadline) {
      setError("Judul, mapel, kelas, dan deadline wajib diisi");
      return;
    }
    setSaving(true);
    const res = await fetch(editId ? `/api/guru/tugas/${editId}` : "/api/guru/tugas", {
      method: editId ? "PUT" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    setSaving(false);
    if (!res.ok) {
      setError((await res.json()).error || "Gagal menyimpan");
      return;
    }
    setOpen(false);
    showToast(editId ? "Tugas berhasil diperbarui" : "Tugas berhasil dibuat");
    load();
  };

  const hapus = async () => {
    if (!hapusId) return;
    await fetch(`/api/guru/tugas/${hapusId}`, { method: "DELETE" });
    setHapusId(null);
    showToast("Tugas berhasil dihapus");
    load();
  };

  const tampil = list.filter((t) => filter === "semua" || t.jenis === filter);
  const input =
    "w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-white outline-none transition focus:border-cyan-400";

  return (
    <div className="p-6 md:p-8">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">Tugas & Project</h1>
          <p className="text-sm opacity-70">Buat tugas dan nilai pengumpulan siswa.</p>
        </div>
        <button
          onClick={bukaTambah}
          className="rounded-xl bg-cyan-400 px-5 py-2.5 text-sm font-semibold text-black transition hover:-translate-y-0.5 hover:shadow-lg hover:shadow-cyan-400/30"
        >
          + Buat Tugas
        </button>
      </div>

      <div className="mb-5 flex gap-2">
        {(["semua", "tugas", "project"] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`rounded-full px-4 py-1.5 text-sm capitalize transition ${filter === f ? "bg-cyan-400 font-semibold text-black" : "bg-white/10 hover:bg-white/20"
              }`}
          >
            {f}
          </button>
        ))}
      </div>

      {loading ? (
        <p className="opacity-70">Memuat...</p>
      ) : tampil.length === 0 ? (
        <p className="rounded-2xl border border-white/10 p-10 text-center opacity-70">Belum ada tugas.</p>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {tampil.map((t) => {
            const lewat = new Date(t.deadline) < new Date();
            return (
              <div
                key={t._id}
                className="flex flex-col rounded-2xl border border-white/10 bg-white/5 p-5 transition hover:-translate-y-1 hover:border-cyan-400/50"
              >
                <div className="mb-2 flex items-center gap-2 text-xs">
                  <span className="rounded-full bg-cyan-400/20 px-2.5 py-1 font-semibold capitalize text-cyan-300">
                    {t.jenis}
                  </span>
                  <span className="rounded-full bg-white/10 px-2.5 py-1 capitalize">{t.mode}</span>
                </div>
                <h3 className="text-lg font-semibold">{t.judul}</h3>
                <p className="mt-1 text-sm opacity-70">
                  {t.mapel} • {typeof t.kelasId === "string" ? "" : `${t.kelasId?.grade} ${t.kelasId?.name}`}
                </p>
                <p className={`mt-3 text-sm ${lewat ? "text-red-400" : "opacity-80"}`}>
                  Deadline: {new Date(t.deadline).toLocaleString("id-ID", { dateStyle: "medium", timeStyle: "short" })}
                </p>
                <p className="text-sm opacity-80">{t.jumlahKumpul} siswa mengumpulkan</p>
                <div className="mt-4 flex gap-2">
                  <Link
                    href={`/guru/tugas-project/${t._id}`}
                    className="flex-1 rounded-lg bg-cyan-400 py-2 text-center text-sm font-semibold text-black transition hover:opacity-90"
                  >
                    Lihat & Nilai
                  </Link>
                  <button onClick={() => bukaEdit(t)} className="rounded-lg bg-white/10 px-3 text-sm hover:bg-white/20">
                    Edit
                  </button>
                  <button onClick={() => setHapusId(t._id)} className="rounded-lg bg-red-500/20 px-3 text-sm text-red-300 hover:bg-red-500/30">
                    Hapus
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal tambah / edit */}
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="max-h-[90vh] w-full max-w-lg animate-[fadeIn_.2s_ease] overflow-y-auto rounded-2xl border border-white/10 bg-[#111827] p-6 text-white">
            <h2 className="mb-4 text-xl font-bold">{editId ? "Edit Tugas" : "Buat Tugas"}</h2>
            <div className="space-y-3">
              <input className={input} placeholder="Judul" value={form.judul} onChange={(e) => setForm({ ...form, judul: e.target.value })} />
              <textarea className={input} rows={3} placeholder="Deskripsi / instruksi" value={form.deskripsi} onChange={(e) => setForm({ ...form, deskripsi: e.target.value })} />
              <div className="grid grid-cols-2 gap-3">
                <select className={input} value={form.jenis} onChange={(e) => setForm({ ...form, jenis: e.target.value })}>
                  <option value="tugas">Tugas</option>
                  <option value="project">Project</option>
                </select>
                <select className={input} value={form.mode} onChange={(e) => setForm({ ...form, mode: e.target.value })}>
                  <option value="individu">Individu</option>
                  <option value="kelompok">Kelompok</option>
                </select>
              </div>
              {mapelOptions.length > 0 ? (
                <select className={input} value={form.mapel} onChange={(e) => setForm({ ...form, mapel: e.target.value })}>
                  {mapelOptions.map((m) => (
                    <option key={m} value={m}>{m}</option>
                  ))}
                </select>
              ) : (
                <input className={input} placeholder="Mata pelajaran" value={form.mapel} onChange={(e) => setForm({ ...form, mapel: e.target.value })} />
              )}
              <select className={input} value={form.kelasId} onChange={(e) => setForm({ ...form, kelasId: e.target.value })}>
                <option value="">Pilih kelas</option>
                {kelas.map((k) => (
                  <option key={k.id} value={k.id}>{k.grade} {k.name}</option>
                ))}
              </select>
              <input
                type="datetime-local"
                className={`${input} [color-scheme:dark] [&::-webkit-calendar-picker-indicator]:cursor-pointer`}
                value={form.deadline}
                onChange={(e) => setForm({ ...form, deadline: e.target.value })}
              />
              {error && <p className="text-sm text-red-400">{error}</p>}
            </div>
            <div className="mt-5 flex justify-end gap-2">
              <button onClick={() => setOpen(false)} className="rounded-xl bg-white/10 px-4 py-2 text-sm hover:bg-white/20">Batal</button>
              <button onClick={simpan} disabled={saving} className="rounded-xl bg-cyan-400 px-5 py-2 text-sm font-semibold text-black disabled:opacity-60">
                {saving ? "Menyimpan..." : "Simpan"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Konfirmasi hapus */}
      {hapusId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="w-full max-w-sm rounded-2xl border border-white/10 bg-[#111827] p-6 text-center text-white">
            <h3 className="text-lg font-bold">Hapus tugas ini?</h3>
            <p className="mt-1 text-sm opacity-70">Semua pengumpulan siswa ikut terhapus.</p>
            <div className="mt-5 flex justify-center gap-2">
              <button onClick={() => setHapusId(null)} className="rounded-xl bg-white/10 px-4 py-2 text-sm">Batal</button>
              <button onClick={hapus} className="rounded-xl bg-red-500 px-5 py-2 text-sm font-semibold">Hapus</button>
            </div>
          </div>
        </div>
      )}

      {toast && (
        <div className="fixed right-5 top-5 z-[60] animate-[fadeIn_.25s_ease] rounded-xl border border-cyan-400/40 bg-[#111827] px-5 py-3 text-sm text-white shadow-xl">
          ✓ {toast}
        </div>
      )}
    </div>
  );
}