import { Schema, models, model } from "mongoose";

const KelasSchema = new Schema(
  {
    grade: { type: String, enum: ["X", "XI", "XII"], required: true },
    name: { type: String, required: true },
    category: { type: String, default: "Umum" },
    waliKelas: { type: String, required: true },
    kapasitas: { type: Number, default: 36 },
    tahunAjaran: { type: String, required: true },
  },
  { timestamps: true }
);

const Kelas = models.Kelas || model("Kelas", KelasSchema);
export default Kelas;