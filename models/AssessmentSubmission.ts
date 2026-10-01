import { Schema, models, model } from "mongoose";

const JawabanSchema = new Schema(
  { soalId: { type: String, required: true }, jawaban: { type: String, default: "" } },
  { _id: false }
);

const AssessmentSubmissionSchema = new Schema(
  {
    assessmentId: { type: Schema.Types.ObjectId, ref: "Assessment", required: true },
    siswaId: { type: Schema.Types.ObjectId, ref: "Siswa", required: true },
    jawaban: [JawabanSchema],
    status: { type: String, enum: ["Sedang Dikerjakan", "Perlu Dinilai", "Selesai"], default: "Sedang Dikerjakan" },
    nilai: { type: Number, default: null },
    waktuMulai: { type: Date, default: Date.now },
    waktuSelesai: { type: Date, default: null },
  },
  { timestamps: true }
);

AssessmentSubmissionSchema.index({ assessmentId: 1, siswaId: 1 }, { unique: true });

const AssessmentSubmission = models.AssessmentSubmission || model("AssessmentSubmission", AssessmentSubmissionSchema);
export default AssessmentSubmission;