import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { connectDB } from "@/lib/mongodb";
import Assessment from "@/models/Assessment";
import Kelas from "@/models/Kelas";
import { bolehAkses } from "@/lib/aksesGuru";
import { catatAktivitasGuru } from "@/lib/aktivitasLog";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "guru") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  await connectDB();
  const list: any[] = await Assessment.find({ guruId: session.user.id })
    .populate("kelasId", "grade name")
    .sort({ createdAt: -1 })
    .lean();

  return NextResponse.json(
    list.map((a) => ({
      id: a._id.toString(),
      judul: a.judul,
      mapel: a.mapel,
      kelasId: a.kelasId?._id?.toString(),
      kelasLabel: a.kelasId ? `${a.kelasId.grade} ${a.kelasId.name}` : "-",
      deskripsi: a.deskripsi,
      jenis: a.jenis,
      tanggalMulai: a.tanggalMulai,
      deadline: a.deadline,
      durasiMenit: a.durasiMenit,
      status: a.status,
      jumlahSoal: (a.soal || []).length,
      createdAt: a.createdAt,
    }))
  );
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "guru" || !session.user.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  await connectDB();
  const body = await req.json();
  if (!body.judul || !body.mapel || !body.kelasId) {
    return NextResponse.json({ error: "Data wajib belum lengkap" }, { status: 400 });
  }

  const kelas = await Kelas.findById(body.kelasId).lean();
  if (!kelas) return NextResponse.json({ error: "Kelas tidak ditemukan" }, { status: 404 });

  if (!(await bolehAkses(session.user.id, body.kelasId, body.mapel))) {
    return NextResponse.json({ error: "Anda tidak mengampu mapel ini di kelas tersebut" }, { status: 403 });
  }

  const a: any = await Assessment.create({
    judul: body.judul,
    mapel: body.mapel,
    kelasId: body.kelasId,
    deskripsi: body.deskripsi || "",
    jenis: body.jenis,
    tanggalMulai: body.tanggalMulai || undefined,
    deadline: body.deadline || undefined,
    durasiMenit: body.durasiMenit,
    guruId: session.user.id,
    guruNama: session.user.name,
  });

  await catatAktivitasGuru(session.user.id, "Membuat Assessment", `Membuat assessment "${body.judul}" (${body.mapel})`);

  return NextResponse.json({ id: a._id.toString() }, { status: 201 });
}