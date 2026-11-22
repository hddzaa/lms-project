import { Suspense } from "react";
import FormTugas from "@/components/tugas/FormTugas";

export default function TambahTugasPage() {
  return (
    <Suspense fallback={null}>
      <FormTugas />
    </Suspense>
  );
}