import Link from "next/link";
import Navbar from "@/components/landing/Navbar";
import Reveal from "@/components/landing/Reveal";
import {
  Users,
  BookOpen,
  CheckSquare,
  Layers,
  FileText,
  TrendingUp,
  Calendar,
  FileBarChart,
  Headphones,
  Shield,
  GraduationCap,
  User,
  Award,
  Network,
  ClipboardEdit,
  ListChecks,
  Send,
  ClipboardCheck,
  Eye,
  CheckCircle2,
} from "lucide-react";

const siswaFeatures = [
  { icon: Layers, title: "Dashboard Bento", desc: "Visualisasi progres belajar imersif yang dipersonalisasi untuk setiap kebutuhan siswa.", big: true },
  { icon: BookOpen, title: "Materi Terintegrasi", desc: "AKSES INSTAN & OFFLINE" },
  { icon: CheckSquare, title: "Task Tracking", desc: "MANAJEMEN DEADLINE AI" },
];

const guruFeatures = [
  { icon: Layers, title: "Course Management", desc: "Organisir kurikulum dan modul pengajaran dalam satu workspace digital." },
  { icon: FileText, title: "Assessment Creation", desc: "Buat ujian dan kuis interaktif dengan generator soal berbasis bank data." },
  { icon: TrendingUp, title: "Student Progress Analytics", desc: "Pantau performa siswa secara real-time dengan visualisasi data mendalam." },
];

const petugasFeatures = [
  { icon: Calendar, title: "Facility Scheduling", desc: "Sistem manajemen inventaris dan penjadwalan fasilitas sekolah yang terotomatisasi.", big: true },
  { icon: FileBarChart, title: "Administrative Logs", desc: "ARSIP DIGITAL TERPUSAT" },
  { icon: Headphones, title: "Support Systems", desc: "TICKET MANAGEMENT REAL-TIME" },
];

const hierarki = [
  { icon: Shield, title: "Admin", desc: "Kendali penuh atas infrastruktur dan sistem keamanan." },
  { icon: GraduationCap, title: "Guru", desc: "Fasilitator ilmu dengan alat pengajaran tercanggih." },
  { icon: User, title: "Siswa", desc: "Pusat ekosistem dengan pengalaman belajar imersif." },
  { icon: Award, title: "Kepala Sekolah", desc: "Wawasan strategis melalui data real-time institusi." },
  { icon: Network, title: "Kurikulum", desc: "Arsitek pembelajaran yang merancang standar edukasi." },
];

const workflow = [
  { icon: FileText, label: "Materi" },
  { icon: ListChecks, label: "Asesmen" },
  { icon: BookOpen, label: "Belajar" },
  { icon: ClipboardCheck, label: "Ujian" },
  { icon: Send, label: "Unggah Tugas" },
  { icon: ClipboardEdit, label: "Penilaian" },
  { icon: Eye, label: "Monitoring", active: true },
];

function FeatureCard({ icon: Icon, title, desc, big }: { icon: any; title: string; desc: string; big?: boolean }) {
  return (
    <div
      className={`rounded-2xl border border-white/5 bg-white/[0.02] p-6 transition-all duration-300 hover:-translate-y-1 hover:border-primary/20 ${
        big ? "flex flex-col justify-between" : ""
      }`}
    >
      <div className="mb-4 w-fit rounded-lg bg-primary-soft p-2.5 text-primary">
        <Icon size={20} />
      </div>
      <h4 className="font-medium text-white">{title}</h4>
      <p className="mt-1 text-sm text-muted">{desc}</p>
    </div>
  );
}

function RoleSection({ label, icon: Icon, features }: { label: string; icon: any; features: typeof siswaFeatures }) {
  return (
    <div className="mb-6">
      <Reveal>
        <div className="mb-5 flex items-center justify-center gap-2 text-sm text-muted">
          <span className="h-px flex-1 bg-white/10" />
          <Icon size={14} className="text-primary" />
          {label}
          <span className="h-px flex-1 bg-white/10" />
        </div>
      </Reveal>
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
        {features.map((f, i) => (
          <Reveal key={f.title} delay={i * 100}>
            <FeatureCard {...f} />
          </Reveal>
        ))}
      </div>
    </div>
  );
}

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-bg text-white">
      <Navbar />

      {/* Hero */}
      <section className="mx-auto max-w-3xl px-6 pb-20 pt-32 text-center">
        <span
          className="animate-fade-in-up mx-auto inline-block rounded-full border border-primary/30 bg-primary-soft px-4 py-1.5 text-xs font-semibold tracking-wide text-primary"
          style={{ animationDelay: "100ms" }}
        >
          PERSONALISASI AKADEMIK
        </span>
        <h1
          className="animate-fade-in-up mt-6 text-4xl font-bold italic leading-tight sm:text-5xl"
          style={{ animationDelay: "200ms" }}
        >
          Fokus Fitur <br />
          <span className="text-primary">Berbasis Peran</span>
        </h1>
        <p
          className="animate-fade-in-up mx-auto mt-6 max-w-xl text-muted"
          style={{ animationDelay: "300ms" }}
        >
          Optimalkan pengalaman akademik Anda dengan alat yang dirancang
          khusus untuk peran unik Anda dalam ekosistem BiarPinter.
        </p>
        <Link
          href="/login"
          className="animate-fade-in-up mt-8 inline-block rounded-full bg-primary px-8 py-3 text-sm font-semibold text-bg shadow-[0_0_24px_rgba(77,216,246,0.35)] transition-transform hover:scale-105"
          style={{ animationDelay: "400ms" }}
        >
          Coba Gratis
        </Link>
      </section>

      {/* Fitur per role */}
      <section id="fitur" className="mx-auto max-w-5xl scroll-mt-28 px-6 py-16">
        <Reveal>
          <div className="mb-12 text-center">
            <h2 className="text-3xl font-bold">
              Fitur Spesifik <span className="text-primary">Untuk Anda</span>
            </h2>
            <p className="mt-3 text-muted">
              Tiga pilar utama dalam ekosistem BiarPinter yang dirancang untuk
              efisiensi maksimal.
            </p>
          </div>
        </Reveal>

        <RoleSection label="Siswa" icon={User} features={siswaFeatures} />
        <RoleSection label="Guru" icon={GraduationCap} features={guruFeatures} />
        <RoleSection label="Petugas" icon={Shield} features={petugasFeatures} />
      </section>

      {/* Hierarki Akses */}
      <section id="peran" className="mx-auto max-w-6xl scroll-mt-28 px-6 py-16">
        <Reveal>
          <p className="text-sm font-medium text-primary">Hierarki Akses</p>
          <div className="mt-2 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
            <h2 className="max-w-md text-3xl font-bold">
              Kontrol Terpusat untuk Setiap Peran
            </h2>
            <p className="max-w-sm text-sm text-muted">
              Disesuaikan untuk presisi administratif dan kenyamanan akademis.
            </p>
          </div>
        </Reveal>
        <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
          {hierarki.map(({ icon: Icon, title, desc }, i) => (
            <Reveal key={title} delay={i * 80}>
              <div className="rounded-2xl border border-white/5 bg-white/[0.02] p-5 transition-all duration-300 hover:-translate-y-1 hover:border-primary/20">
                <Icon size={20} className="text-primary" />
                <h4 className="mt-4 font-medium text-white">{title}</h4>
                <p className="mt-2 text-xs text-muted">{desc}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* Mesin Alur Kerja */}
      <section id="alur-kerja" className="mx-auto max-w-5xl scroll-mt-28 px-6 py-16 text-center">
        <Reveal>
          <h2 className="text-2xl font-bold text-primary">Mesin Alur Kerja</h2>
        </Reveal>
        <div className="mt-10 flex flex-wrap items-center justify-center gap-8">
          {workflow.map(({ icon: Icon, label, active }, i) => (
            <Reveal key={label} delay={i * 70}>
              <div className="flex flex-col items-center gap-2">
                <div
                  className={`flex h-12 w-12 items-center justify-center rounded-full border transition-transform duration-300 hover:scale-110 ${
                    active
                      ? "border-primary text-primary"
                      : "border-white/10 text-gray-500"
                  }`}
                >
                  <Icon size={18} />
                </div>
                <span className={`text-xs ${active ? "text-primary" : "text-gray-500"}`}>
                  {label}
                </span>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* Antarmuka modern */}
      <section id="antarmuka" className="mx-auto max-w-6xl scroll-mt-28 px-6 py-16">
        <Reveal>
          <div className="rounded-3xl border border-white/5 bg-white/[0.02] p-10">
            <h2 className="max-w-md text-3xl font-bold">
              Antarmuka untuk Pikiran Modern
            </h2>
            <p className="mt-4 max-w-lg text-muted">
              Visualisasi data real-time, antarmuka yang bersih, dan navigasi
              intuitif. Aetheris bukan sekadar platform; ini adalah ruang
              kerja intelektual.
            </p>
            <ul className="mt-6 space-y-3 text-sm text-gray-300">
              {["Konteks Dashboard Adaptif", "Analitik Pembelajaran Neural", "Enkripsi Berlapis-lapis"].map((t) => (
                <li key={t} className="flex items-center gap-2">
                  <CheckCircle2 size={16} className="text-primary" />
                  {t}
                </li>
              ))}
            </ul>
          </div>
        </Reveal>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/5">
        <Reveal>
          <div className="mx-auto max-w-6xl px-6 py-12">
            <div className="grid grid-cols-2 gap-8 sm:grid-cols-4">
              <div>
                <p className="text-lg font-bold text-heading">AETHERIS</p>
                <p className="mt-3 text-sm text-muted">
                  Membangun masa depan pendidikan melalui teknologi yang
                  presisi dan visioner.
                </p>
              </div>
              <div>
                <p className="mb-3 text-sm font-medium">Platform</p>
                <ul className="space-y-2 text-sm text-muted">
                  <li>Siswa</li>
                  <li>Guru</li>
                  <li>Petugas</li>
                </ul>
              </div>
              <div>
                <p className="mb-3 text-sm font-medium">Legal</p>
                <ul className="space-y-2 text-sm text-muted">
                  <li>Kebijakan Privasi</li>
                  <li>Syarat & Ketentuan</li>
                </ul>
              </div>
              <div>
                <p className="mb-3 text-sm font-medium">Dukungan</p>
                <ul className="space-y-2 text-sm text-muted">
                  <li>Dokumentasi</li>
                  <li>Pusat Bantuan</li>
                </ul>
              </div>
            </div>
            <div className="mt-10 flex flex-col justify-between gap-2 border-t border-white/5 pt-6 text-xs text-muted sm:flex-row">
              <p>© 2024 Aetheris Academic. Seluruh hak cipta dilindungi undang-undang.</p>
              <p>DIRANCANG OLEH AETHERIS LABS</p>
            </div>
          </div>
        </Reveal>
      </footer>
    </div>
  );
}