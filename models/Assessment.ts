import { Schema, models, model } from "mongoose";

const SoalSchema = new Schema(
  {
    tipe: { type: String, enum: ["pilihan_ganda", "isian_singkat", "essay"], required: true },
    pertanyaan: { type: String, required: true },
    opsi: [{ label: String, teks: String }],
    kunciJawaban: { type: String, default: "" },
    bobot: { type: Number, default: 10 },
  },
  { timestamps: true }
);

const AssessmentSchema = new Schema(
  {
    judul: { type: String, required: true },
    mapel: { type: String, required: true },
    kelasId: { type: Schema.Types.ObjectId, ref: "Kelas", required: true },
    deskripsi: { type: String, default: "" },
    jenis: { type: String, enum: ["Kuis", "Ujian", "Penilaian"], required: true },
    tanggalMulai: { type: Date },
    deadline: { type: Date },
    durasiMenit: { type: Number, default: 60 },
    status: { type: String, enum: ["Draft", "Dipublikasikan"], default: "Draft" },
    guruId: { type: Schema.Types.ObjectId, ref: "Guru", required: true },
    guruNama: { type: String, required: true },
    soal: [SoalSchema],
  },
  { timestamps: true }
);

const Assessment = models.Assessment || model("Assessment", AssessmentSchema);
export default Assessment;