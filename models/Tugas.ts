import { Schema, models, model } from "mongoose";

const TugasSchema = new Schema(
  {
    judul: { type: String, required: true, trim: true },
    deskripsi: { type: String, default: "" },
    jenis: { type: String, enum: ["tugas", "project"], default: "tugas" },
    mode: { type: String, enum: ["individu", "kelompok"], default: "individu" },
    mapel: { type: String, required: true },
    kelasId: { type: Schema.Types.ObjectId, ref: "Kelas", required: true },
    guruId: { type: Schema.Types.ObjectId, ref: "Guru", required: true },
    deadline: { type: Date, required: true },
  },
  { timestamps: true }
);

export default models.Tugas || model("Tugas", TugasSchema);