import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { connectDB } from "@/lib/mongodb";
import Materi from "@/models/Materi";
import Kelas from "@/models/Kelas";

async function checkOwnership(id: string, guruId: string) {
    const materi: any = await Materi.findById(id).lean();
    if (!materi) return { ok: false, status: 404 };
    if (materi.guruId.toString() !== guruId) return { ok: false, status: 403 };
    return { ok: true, materi };
}

export async function GET(req: Request, context: { params: Promise<{ id: string }> }) {
    const { id } = await context.params;
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "guru") {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    await connectDB();
    const access = await checkOwnership(id, session.user.id!);
    if (!access.ok) return NextResponse.json({ error: "Forbidden" }, { status: access.status });

    const materi: any = await Materi.findById(id).populate("kelasId", "grade name").lean();
    return NextResponse.json({
        id: materi._id.toString(),
        judul: materi.judul,
        mapel: materi.mapel,
        kelasId: materi.kelasId?._id?.toString(),
        kelasLabel: materi.kelasId ? `${materi.kelasId.grade} ${materi.kelasId.name}` : "-",
        deskripsi: materi.deskripsi,
        guruNama: materi.guruNama,
        files: materi.files,
        status: materi.status,
        createdAt: materi.createdAt,
    });
}

export async function PUT(req: Request, context: { params: Promise<{ id: string }> }) {
    const { id } = await context.params;
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "guru") {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    await connectDB();
    const access = await checkOwnership(id, session.user.id!);
    if (!access.ok) return NextResponse.json({ error: "Forbidden" }, { status: access.status });

    const body = await req.json();

    const kelas: any = await Kelas.findById(body.kelasId).lean();
    if (!kelas) return NextResponse.json({ error: "Kelas tidak ditemukan" }, { status: 404 });

    const updated = await Materi.findByIdAndUpdate(
        id,
        { judul: body.judul, mapel: body.mapel, kelasId: body.kelasId, deskripsi: body.deskripsi },
        { new: true }
    ).lean();

    return NextResponse.json({ ...updated, id: (updated as any)._id.toString() });
}

export async function DELETE(req: Request, context: { params: Promise<{ id: string }> }) {
    const { id } = await context.params;
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "guru") {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    await connectDB();
    const access = await checkOwnership(id, session.user.id!);
    if (!access.ok) return NextResponse.json({ error: "Forbidden" }, { status: access.status });

    await Materi.findByIdAndDelete(id);
    return NextResponse.json({ success: true });
}