import { Schema, models, model } from "mongoose";

const MateriFileSchema = new Schema(
  {
    name: String,
    url: String,
    type: String,
    size: Number,
  },
  { _id: false }
);

const MateriSchema = new Schema(
  {
    judul: { type: String, required: true },
    mapel: { type: String, required: true },
    kelasId: { type: Schema.Types.ObjectId, ref: "Kelas", required: true },
    deskripsi: { type: String, default: "" },
    guruId: { type: Schema.Types.ObjectId, ref: "Guru", required: true },
    guruNama: { type: String, required: true },
    files: [MateriFileSchema],
    status: { type: String, enum: ["Aktif", "Nonaktif"], default: "Aktif" },
  },
  { timestamps: true }
);

const Materi = models.Materi || model("Materi", MateriSchema);
export default Materi;