import { Schema, models, model } from "mongoose";

const AktivitasGuruSchema = new Schema(
  {
    guruId: { type: Schema.Types.ObjectId, ref: "Guru", required: true },
    jenis: {
      type: String,
      enum: ["Upload Materi", "Membuat Assessment", "Mengedit Assessment", "Membuat Tugas", "Menilai Tugas"],
      required: true,
    },
    keterangan: { type: String, required: true },
  },
  { timestamps: true }
);

export default models.AktivitasGuru || model("AktivitasGuru", AktivitasGuruSchema);