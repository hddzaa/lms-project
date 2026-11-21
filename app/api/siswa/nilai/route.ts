import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { nilaiPerSiswa } from "@/lib/nilai";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (
    !session ||
    session.user.role !== "siswa" ||
    !session.user.id ||
    !session.user.kelasId
  ) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const data = await nilaiPerSiswa(session.user.id, session.user.kelasId);
  return NextResponse.json(data);
}