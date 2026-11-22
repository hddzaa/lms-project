import { Schema, models, model } from "mongoose";

const FileSchema = new Schema(
  { name: String, url: String, type: String, size: Number },
  { _id: false }
);

const TugasSchema = new Schema(
  {
    judul: { type: String, required: true, trim: true },
    deskripsi: { type: String, default: "" },
    jenis: { type: String, enum: ["tugas", "project"], default: "tugas" },
    mapel: { type: String, required: true },
    kelasId: { type: Schema.Types.ObjectId, ref: "Kelas", required: true },
    guruId: { type: Schema.Types.ObjectId, ref: "Guru", required: true },
    deadline: { type: Date, required: true },
    files: { type: [FileSchema], default: [] },
  },
  { timestamps: true }
);

export default models.Tugas || model("Tugas", TugasSchema);