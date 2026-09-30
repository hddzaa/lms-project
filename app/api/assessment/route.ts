import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { connectDB } from "@/lib/mongodb";
import Assessment from "@/models/Assessment";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "guru") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  await connectDB();
  const data = await Assessment.find({ guruId: session.user.id })
    .populate("kelasId", "grade name")
    .sort({ createdAt: -1 })
    .lean();

  return NextResponse.json(
    data.map((a: any) => ({
      id: a._id.toString(),
      judul: a.judul,
      mapel: a.mapel,
      kelasLabel: a.kelasId ? `${a.kelasId.grade} ${a.kelasId.name}` : "-",
      jenis: a.jenis,
      deadline: a.deadline,
      status: a.status,
      jumlahSoal: a.soal.length,
    }))
  );
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "guru") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  await connectDB();
  const body = await req.json();

  const assessment = await Assessment.create({
    judul: body.judul,
    mapel: body.mapel,
    kelasId: body.kelasId,
    deskripsi: body.deskripsi,
    jenis: body.jenis,
    tanggalMulai: body.tanggalMulai || null,
    deadline: body.deadline || null,
    durasiMenit: body.durasiMenit || 60,
    guruId: session.user.id,
    guruNama: session.user.name,
    soal: [],
  });

  return NextResponse.json({ ...assessment.toObject(), id: assessment._id.toString() });
}