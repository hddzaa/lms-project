import { Schema, models, model } from "mongoose";

const AktivitasGuruSchema = new Schema(
  {
    guruId: { type: Schema.Types.ObjectId, ref: "Guru", required: true },
    jenis: {
      type: String,
      enum: ["Upload Materi", "Membuat Assessment", "Menilai Tugas", "Mengedit Assessment"],
      required: true,
    },
    keterangan: { type: String, required: true },
  },
  { timestamps: true }
);

const AktivitasGuru = models.AktivitasGuru || model("AktivitasGuru", AktivitasGuruSchema);
export default AktivitasGuru;