import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { connectDB } from "@/lib/mongodb";
import Assessment from "@/models/Assessment";
import AssessmentSubmission from "@/models/AssessmentSubmission";
import "@/models/Siswa";
import { bolehAkses } from "@/lib/aksesGuru";
import { catatAktivitasGuru } from "@/lib/aktivitasLog";

type Ctx = { params: Promise<{ id: string }> };

async function cekAkses(id: string) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "guru" || !session.user.id) return { error: 403 as const };
  await connectDB();
  const assessment: any = await Assessment.findById(id).lean();
  if (!assessment) return { error: 404 as const };
  const pemilik = assessment.guruId.toString() === session.user.id;
  if (!pemilik && !(await bolehAkses(session.user.id, assessment.kelasId.toString(), assessment.mapel))) {
    return { error: 403 as const };
  }
  return { assessment, session };
}

// skor otomatis untuk PG & isian; essay default 0
function skorOtomatis(soal: any, jawaban: string) {
  if (soal.tipe === "essay") return 0;
  const benar = jawaban.trim().toLowerCase() === (soal.kunciJawaban || "").trim().toLowerCase();
  return benar ? soal.bobot : 0;
}

export async function GET(_: Request, context: Ctx) {
  const { id } = await context.params;
  const r = await cekAkses(id);
  if ("error" in r) return NextResponse.json({ error: "Forbidden" }, { status: r.error });

  const subs: any[] = await AssessmentSubmission.find({
    assessmentId: id,
    status: { $in: ["Perlu Dinilai", "Selesai"] },
  })
    .populate("siswaId", "nama nis")
    .sort({ waktuSelesai: -1 })
    .lean();

  return NextResponse.json({
    assessment: {
      id,
      judul: r.assessment.judul,
      mapel: r.assessment.mapel,
      soal: r.assessment.soal.map((s: any) => ({
        id: s._id.toString(),
        tipe: s.tipe,
        pertanyaan: s.pertanyaan,
        opsi: s.opsi,
        kunciJawaban: s.kunciJawaban,
        bobot: s.bobot,
      })),
    },
    submissions: subs.map((s) => ({
      id: s._id.toString(),
      siswaNama: s.siswaId?.nama ?? "-",
      siswaNis: s.siswaId?.nis ?? "",
      status: s.status,
      nilai: s.nilai,
      waktuSelesai: s.waktuSelesai,
      jawaban: Object.fromEntries((s.jawaban || []).map((j: any) => [j.soalId, j.jawaban])),
      skor: Object.fromEntries(
        r.assessment.soal.map((so: any) => {
          const sid = so._id.toString();
          const tersimpan = (s.skor || []).find((x: any) => x.soalId === sid);
          const jwb = (s.jawaban || []).find((j: any) => j.soalId === sid)?.jawaban || "";
          return [sid, tersimpan ? tersimpan.skor : skorOtomatis(so, jwb)];
        })
      ),
    })),
  });
}

export async function PUT(req: Request, context: Ctx) {
  const { id } = await context.params;
  const r = await cekAkses(id);
  if ("error" in r) return NextResponse.json({ error: "Forbidden" }, { status: r.error });

  const { submissionId, skor } = (await req.json()) as { submissionId: string; skor: Record<string, number> };
  const sub: any = await AssessmentSubmission.findOne({ _id: submissionId, assessmentId: id });
  if (!sub) return NextResponse.json({ error: "Pengumpulan tidak ditemukan" }, { status: 404 });

  let total = 0;
  let bobotTotal = 0;
  const skorBaru: { soalId: string; skor: number }[] = [];

  for (const so of r.assessment.soal) {
    const sid = so._id.toString();
    const jwb = sub.jawaban.find((j: any) => j.soalId === sid)?.jawaban || "";
    let v = skor && skor[sid] !== undefined ? Number(skor[sid]) : skorOtomatis(so, jwb);
    if (Number.isNaN(v)) v = 0;
    v = Math.max(0, Math.min(so.bobot, v));
    skorBaru.push({ soalId: sid, skor: v });
    total += v;
    bobotTotal += so.bobot;
  }

  sub.skor = skorBaru;
  sub.nilai = bobotTotal > 0 ? Math.round((total / bobotTotal) * 100) : 0;
  sub.status = "Selesai";
  await sub.save();

  await catatAktivitasGuru(
    r.session.user.id!,
    "Menilai Tugas",
    `Menilai assessment "${r.assessment.judul}" (nilai ${sub.nilai})`
  );

  return NextResponse.json({ status: sub.status, nilai: sub.nilai });
}