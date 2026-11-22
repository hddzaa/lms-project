"use client";

import { Suspense } from "react";
import { useParams } from "next/navigation";
import FormTugas from "@/components/tugas/FormTugas";

export default function EditTugasPage() {
  const params = useParams<{ id: string }>();
  return (
    <Suspense fallback={null}>
      <FormTugas tugasId={params.id} />
    </Suspense>
  );
}