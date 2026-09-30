import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { connectDB } from "@/lib/mongodb";
import Materi from "@/models/Materi";
import Kelas from "@/models/Kelas";
import fs from "fs/promises";
import path from "path";

export async function GET() {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "guru") {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    await connectDB();
    const materi = await Materi.find({ guruId: session.user.id })
        .populate("kelasId", "grade name")
        .sort({ createdAt: -1 })
        .lean();

    return NextResponse.json(
        materi.map((m: any) => ({
            id: m._id.toString(),
            judul: m.judul,
            mapel: m.mapel,
            deskripsi: m.deskripsi,
            kelasLabel: m.kelasId ? `${m.kelasId.grade} ${m.kelasId.name}` : "-",
            files: m.files,
            status: m.status,
            createdAt: m.createdAt,
        }))
    );
}

export async function POST(req: Request) {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "guru") {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    await connectDB();
    const formData = await req.formData();
    const judul = formData.get("judul") as string;
    const mapel = formData.get("mapel") as string;
    const kelasId = formData.get("kelasId") as string;
    const deskripsi = (formData.get("deskripsi") as string) || "";
    const files = formData.getAll("files") as File[];

    const kelas: any = await Kelas.findById(kelasId).lean();
    if (!kelas) return NextResponse.json({ error: "Kelas tidak ditemukan" }, { status: 404 });

    const uploadDir = path.join(process.cwd(), "public", "uploads", "materi");
    await fs.mkdir(uploadDir, { recursive: true });

    const savedFiles = [];
    for (const file of files) {
        if (!(file instanceof File) || file.size === 0) continue;
        const bytes = Buffer.from(await file.arrayBuffer());
        const safeName = `${Date.now()}-${file.name.replace(/\s+/g, "_")}`;
        await fs.writeFile(path.join(uploadDir, safeName), bytes);
        savedFiles.push({ name: file.name, url: `/uploads/materi/${safeName}`, type: file.type, size: file.size });
    }

    const materi = await Materi.create({
        judul,
        mapel,
        kelasId,
        deskripsi,
        guruId: session.user.id,
        guruNama: session.user.name,
        files: savedFiles,
    });

    return NextResponse.json({ ...materi.toObject(), id: materi._id.toString() });
}