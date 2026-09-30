import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { connectDB } from "@/lib/mongodb";
import Kelas from "@/models/Kelas";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "guru") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  await connectDB();
  const namaGuru = session.user.name;
  const kelasList = await Kelas.find({ "pengajar.guruNama": namaGuru }).lean();

  const combos: { kelasId: string; kelasLabel: string; mapel: string }[] = [];
  for (const k of kelasList as any[]) {
    for (const p of k.pengajar || []) {
      if (p.guruNama === namaGuru) {
        combos.push({ kelasId: k._id.toString(), kelasLabel: `${k.grade} ${k.name}`, mapel: p.mapel });
      }
    }
  }

  return NextResponse.json(combos);
}