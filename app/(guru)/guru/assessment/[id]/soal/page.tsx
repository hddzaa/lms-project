"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ChevronLeft, Plus, Pencil, Trash2, Send, Loader2 } from "lucide-react";
import ConfirmDeleteModal from "@/components/ui/ConfirmDeleteModal";
import Toast from "@/components/ui/Toast";

type Soal = {
  id: string;
  tipe: "pilihan_ganda" | "isian_singkat" | "essay";
  pertanyaan: string;
  opsi?: { label: string; teks: string }[];
  kunciJawaban: string;
  bobot: number;
};

type AssessmentDetail = {
  id: string;
  judul: string;
  mapel: string;
  kelasLabel: string;
  jenis: string;
  deadline: string;
  durasiMenit: number;
  status: string;
  soal: Soal[];
};

const tabs = [
  { key: "pilihan_ganda", label: "Pilihan Ganda" },
  { key: "isian_singkat", label: "Isian Singkat" },
  { key: "essay", label: "Essay" },
] as const;

export default function SoalBuilderPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();

  const [data, setData] = useState<AssessmentDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<Soal["tipe"]>("pilihan_ganda");
  const [editingSoalId, setEditingSoalId] = useState<string | null>(null);

  const [pertanyaan, setPertanyaan] = useState("");
  const [opsiA, setOpsiA] = useState("");
  const [opsiB, setOpsiB] = useState("");
  const [opsiC, setOpsiC] = useState("");
  const [opsiD, setOpsiD] = useState("");
  const [kunciPG, setKunciPG] = useState("A");
  const [kunciTeks, setKunciTeks] = useState("");
  const [bobot, setBobot] = useState(10);

  const [deleteTarget, setDeleteTarget] = useState<Soal | null>(null);
  const [toastMsg, setToastMsg] = useState("");
  const [toastOpen, setToastOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  async function fetchData() {
    const res = await fetch(`/api/assessment/${params.id}`);
    if (res.ok) setData(await res.json());
    setLoading(false);
  }

  useEffect(() => { fetchData(); }, [params.id]);

  function resetForm() {
    setPertanyaan("");
    setOpsiA(""); setOpsiB(""); setOpsiC(""); setOpsiD("");
    setKunciPG("A");
    setKunciTeks("");
    setBobot(10);
    setEditingSoalId(null);
  }

  function loadSoalToForm(s: Soal) {
    setActiveTab(s.tipe);
    setPertanyaan(s.pertanyaan);
    setBobot(s.bobot);
    setEditingSoalId(s.id);
    if (s.tipe === "pilihan_ganda") {
      setOpsiA(s.opsi?.find((o) => o.label === "A")?.teks || "");
      setOpsiB(s.opsi?.find((o) => o.label === "B")?.teks || "");
      setOpsiC(s.opsi?.find((o) => o.label === "C")?.teks || "");
      setOpsiD(s.opsi?.find((o) => o.label === "D")?.teks || "");
      setKunciPG(s.kunciJawaban);
    } else {
      setKunciTeks(s.kunciJawaban);
    }
  }

  async function handleSimpanSoal() {
    if (!pertanyaan.trim()) return;

    const payload: any = { tipe: activeTab, pertanyaan, bobot };
    if (activeTab === "pilihan_ganda") {
      payload.opsi = [
        { label: "A", teks: opsiA },
        { label: "B", teks: opsiB },
        { label: "C", teks: opsiC },
        { label: "D", teks: opsiD },
      ];
      payload.kunciJawaban = kunciPG;
    } else {
      payload.kunciJawaban = kunciTeks;
    }

    setSubmitting(true);
    const url = editingSoalId
      ? `/api/assessment/${params.id}/soal/${editingSoalId}`
      : `/api/assessment/${params.id}/soal`;
    const method = editingSoalId ? "PUT" : "POST";

    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const result = await res.json();
    setSubmitting(false);

    setData((prev) => (prev ? { ...prev, soal: result.soal } : prev));
    resetForm();
    setToastMsg(editingSoalId ? "Soal berhasil diperbarui" : "Soal berhasil disimpan");
    setToastOpen(true);
  }

  async function handleDeleteSoal() {
    if (!deleteTarget) return;
    const res = await fetch(`/api/assessment/${params.id}/soal/${deleteTarget.id}`, { method: "DELETE" });
    const result = await res.json();
    setData((prev) => (prev ? { ...prev, soal: result.soal } : prev));
    setDeleteTarget(null);
    setToastMsg("Soal berhasil dihapus");
    setToastOpen(true);
  }

  async function handleSimpanDraft() {
    await fetch(`/api/assessment/${params.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "Draft" }),
    });
    router.push("/guru/assessment");
  }

  async function handlePublikasikan() {
    await fetch(`/api/assessment/${params.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "Dipublikasikan" }),
    });
    router.push("/guru/assessment");
  }

  if (loading) {
    return (
      <div className="flex items-center gap-2 text-muted">
        <Loader2 size={18} className="animate-spin" /> Memuat assessment...
      </div>
    );
  }

  if (!data) {
    return (
      <div className="text-muted">
        Assessment tidak ditemukan.{" "}
        <Link href="/guru/assessment" className="text-primary hover:underline">Kembali</Link>
      </div>
    );
  }

  const totalBobot = data.soal.reduce((sum, s) => sum + s.bobot, 0);

  return (
    <div>
      <h1 className="text-3xl font-bold text-white">Pembuatan Soal</h1>
      <p className="mt-2 max-w-2xl text-muted">
        Lengkapi detail butir soal untuk asesmen "{data.judul}". Pastikan setiap soal memiliki bobot yang sesuai.
      </p>

      <div className="mt-6 grid grid-cols-2 gap-4 rounded-2xl border border-border bg-surface p-6 sm:grid-cols-3 lg:grid-cols-6">
        <div><p className="text-xs text-muted">ASSESSMENT</p><p className="mt-1 font-semibold text-white">{data.judul}</p></div>
        <div><p className="text-xs text-muted">MATA PELAJARAN</p><p className="mt-1 font-semibold text-white">{data.mapel}</p></div>
        <div><p className="text-xs text-muted">KELAS</p><p className="mt-1 font-semibold text-white">{data.kelasLabel}</p></div>
        <div><p className="text-xs text-muted">JENIS</p><p className="mt-1 font-semibold text-white">{data.jenis}</p></div>
        <div><p className="text-xs text-muted">DEADLINE</p><p className="mt-1 font-semibold text-white">{data.deadline ? new Date(data.deadline).toLocaleDateString("id-ID", { timeZone: "Asia/Jakarta" }) : "-"}</p></div>
        <div><p className="text-xs text-muted">DURASI</p><p className="mt-1 font-semibold text-white">{data.durasiMenit} Menit</p></div>
      </div>

      <div className="mt-6 inline-flex gap-1 rounded-2xl border border-border bg-surface p-1.5">
        {tabs.map((t) => (
          <button
            key={t.key}
            onClick={() => { setActiveTab(t.key); resetForm(); }}
            className={`rounded-xl px-5 py-2 text-sm font-medium transition-colors ${activeTab === t.key ? "bg-primary text-bg" : "text-gray-400 hover:text-gray-200"}`}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className="mt-5 rounded-2xl border border-border bg-surface p-8">
        <label className="mb-2 block text-xs font-medium tracking-wide text-primary">PERTANYAAN SOAL</label>
        <textarea
          value={pertanyaan}
          onChange={(e) => setPertanyaan(e.target.value)}
          rows={4}
          placeholder={`Tuliskan pertanyaan ${activeTab === "essay" ? "essay" : activeTab === "isian_singkat" ? "isian singkat" : ""} di sini...`}
          className="w-full resize-none rounded-xl border border-border bg-black/30 px-4 py-3 text-sm text-gray-200 placeholder-gray-500 outline-none focus:border-primary/50"
        />

        {activeTab === "pilihan_ganda" && (
          <>
            <div className="mt-6 grid grid-cols-2 gap-4">
              {[["A", opsiA, setOpsiA], ["B", opsiB, setOpsiB], ["C", opsiC, setOpsiC], ["D", opsiD, setOpsiD]].map(
                ([label, val, setter]: any) => (
                  <div key={label}>
                    <label className="mb-2 flex items-center gap-2 text-xs font-medium tracking-wide text-muted">
                      <span className="flex h-5 w-5 items-center justify-center rounded bg-white/10 text-[10px] text-white">{label}</span> OPSI {label}
                    </label>
                    <input
                      value={val}
                      onChange={(e) => setter(e.target.value)}
                      type="text"
                      placeholder="Masukkan jawaban..."
                      className="w-full rounded-xl border border-border bg-black/30 px-4 py-2.5 text-sm text-gray-200 placeholder-gray-500 outline-none focus:border-primary/50"
                    />
                  </div>
                )
              )}
            </div>
            <div className="mt-6 flex items-end gap-4">
              <div>
                <label className="mb-2 block text-xs font-medium tracking-wide text-muted">KUNCI JAWABAN</label>
                <select value={kunciPG} onChange={(e) => setKunciPG(e.target.value)} className="rounded-xl border border-border bg-black/30 px-4 py-2.5 text-sm text-gray-200 outline-none focus:border-primary/50">
                  <option value="A">Pilihan A</option>
                  <option value="B">Pilihan B</option>
                  <option value="C">Pilihan C</option>
                  <option value="D">Pilihan D</option>
                </select>
              </div>
              <div>
                <label className="mb-2 block text-xs font-medium tracking-wide text-muted">BOBOT SOAL</label>
                <div className="flex items-center gap-2">
                  <input value={bobot} onChange={(e) => setBobot(Number(e.target.value))} type="number" className="w-24 rounded-xl border border-border bg-black/30 px-4 py-2.5 text-sm text-gray-200 outline-none focus:border-primary/50" />
                  <span className="text-sm text-muted">pt</span>
                </div>
              </div>
              <button onClick={handleSimpanSoal} disabled={submitting} className="ml-auto flex items-center gap-2 rounded-full bg-primary px-6 py-2.5 text-sm font-semibold text-bg transition-transform hover:scale-105 disabled:opacity-60">
                <Plus size={15} /> {editingSoalId ? "Update Soal" : "Simpan Soal"}
              </button>
            </div>
          </>
        )}

        {(activeTab === "isian_singkat" || activeTab === "essay") && (
          <>
            <label className="mb-2 mt-6 block text-xs font-medium tracking-wide text-muted">JAWABAN BENAR</label>
            <input
              value={kunciTeks}
              onChange={(e) => setKunciTeks(e.target.value)}
              type="text"
              placeholder="Masukkan kunci jawaban yang benar..."
              className="w-full rounded-xl border border-border bg-black/30 px-4 py-2.5 text-sm text-gray-200 placeholder-gray-500 outline-none focus:border-primary/50"
            />
            <p className="mt-2 text-xs text-muted">Sistem akan melakukan pencocokan teks secara otomatis (case-insensitive).</p>
            <div className="mt-6 flex items-end justify-between border-t border-border pt-5">
              <div>
                <label className="mb-2 block text-xs font-medium tracking-wide text-muted">BOBOT SOAL</label>
                <div className="flex items-center gap-2">
                  <input value={bobot} onChange={(e) => setBobot(Number(e.target.value))} type="number" className="w-24 rounded-xl border border-border bg-black/30 px-4 py-2.5 text-sm text-gray-200 outline-none focus:border-primary/50" />
                  <span className="text-sm text-muted">pt</span>
                </div>
              </div>
              <button onClick={handleSimpanSoal} disabled={submitting} className="flex items-center gap-2 rounded-full bg-primary px-6 py-2.5 text-sm font-semibold text-bg transition-transform hover:scale-105 disabled:opacity-60">
                <Plus size={15} /> {editingSoalId ? "Update Soal" : "Simpan Soal"}
              </button>
            </div>
          </>
        )}
      </div>

      <div className="mt-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h3 className="text-lg font-semibold text-white">Daftar Soal</h3>
          <span className="rounded-full bg-primary-soft px-3 py-1 text-xs font-medium text-primary">{data.soal.length} Soal Tersimpan</span>
        </div>
        <p className="text-sm text-muted">Total Bobot: {totalBobot}/100</p>
      </div>

      <div className="mt-3 space-y-3">
        {data.soal.map((s, i) => (
          <div key={s.id} className="flex items-center gap-4 rounded-2xl border border-border bg-surface p-5">
            <span className="text-lg font-bold text-primary">{String(i + 1).padStart(2, "0")}</span>
            <div className="flex-1">
              <div className="mb-1.5 flex gap-2">
                <span className="rounded-full bg-white/10 px-2.5 py-0.5 text-[10px] font-medium uppercase text-gray-300">
                  {s.tipe === "pilihan_ganda" ? "Pilihan Ganda" : s.tipe === "isian_singkat" ? "Isian Singkat" : "Essay"}
                </span>
                <span className="rounded-full bg-white/10 px-2.5 py-0.5 text-[10px] font-medium text-gray-300">Bobot: {s.bobot}pt</span>
              </div>
              <p className="truncate text-sm text-gray-200">{s.pertanyaan}</p>
            </div>
            <button onClick={() => loadSoalToForm(s)} className="text-gray-400 hover:text-gray-200"><Pencil size={16} /></button>
            <button onClick={() => setDeleteTarget(s)} className="text-red-400 hover:text-red-300"><Trash2 size={16} /></button>
          </div>
        ))}
        {data.soal.length === 0 && <p className="py-8 text-center text-sm text-muted">Belum ada soal ditambahkan.</p>}
      </div>

      <div className="mt-8 flex items-center justify-between border-t border-border pt-6">
        <Link href="/guru/assessment" className="flex items-center gap-2 text-sm text-gray-300 hover:text-white">
          <ChevronLeft size={15} /> Kembali
        </Link>
        <div className="flex gap-3">
          <button onClick={handleSimpanDraft} className="rounded-full border border-border px-6 py-2.5 text-sm font-medium text-gray-300 transition-colors hover:bg-white/5">
            Simpan Draft
          </button>
          <button onClick={handlePublikasikan} disabled={data.soal.length === 0} className="flex items-center gap-2 rounded-full bg-primary px-6 py-2.5 text-sm font-semibold text-bg transition-transform hover:scale-105 disabled:opacity-60">
            <Send size={15} /> Publikasikan
          </button>
        </div>
      </div>

      <ConfirmDeleteModal open={!!deleteTarget} onClose={() => setDeleteTarget(null)} onConfirm={handleDeleteSoal} itemLabel="soal ini" />
      <Toast open={toastOpen} onClose={() => setToastOpen(false)} message={toastMsg} />
    </div>
  );
}