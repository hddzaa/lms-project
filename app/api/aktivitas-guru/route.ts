import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import AktivitasGuru from "@/models/AktivitasGuru";

export async function GET() {
  await connectDB();
  const data = await AktivitasGuru.find()
    .populate("guruId", "nama nip mapel email")
    .sort({ createdAt: -1 })
    .lean();

  return NextResponse.json(
    data.map((a: any) => ({
      id: a._id.toString(),
      guruId: a.guruId?._id?.toString(),
      namaGuru: a.guruId?.nama ?? "Guru tidak ditemukan",
      idGuru: a.guruId?._id?.toString().slice(-6).toUpperCase() ?? "-",
      jenis: a.jenis,
      keterangan: a.keterangan,
      createdAt: a.createdAt,
    }))
  );
}

// Dipakai nanti oleh role Guru untuk mencatat aktivitas otomatis
export async function POST(req: Request) {
  await connectDB();
  const body = await req.json();
  const aktivitas = await AktivitasGuru.create(body);
  return NextResponse.json({ ...aktivitas.toObject(), id: aktivitas._id.toString() });
}