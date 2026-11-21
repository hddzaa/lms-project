import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { connectDB } from "@/lib/mongodb";
import AktivitasGuru from "@/models/AktivitasGuru";
import "@/models/Guru";

export async function GET(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session || !["admin", "kepsek", "kurikulum"].includes(session.user.role ?? "")) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  await connectDB();

  const tanggal = new URL(req.url).searchParams.get("tanggal"); // format YYYY-MM-DD
  const filter: Record<string, any> = {};
  if (tanggal && /^\d{4}-\d{2}-\d{2}$/.test(tanggal)) {
    const mulai = new Date(`${tanggal}T00:00:00+07:00`);
    const selesai = new Date(mulai.getTime() + 24 * 60 * 60 * 1000);
    filter.createdAt = { $gte: mulai, $lt: selesai };
  }

  const data = await AktivitasGuru.find(filter)
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