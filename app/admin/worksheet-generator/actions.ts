"use server";

import { requireAdmin } from "@/lib/auth";
import { generateWorksheet, type WorksheetInput, type WorksheetResult } from "@/lib/worksheet-generator";

export async function generateWorksheetAction(formData: FormData): Promise<WorksheetResult> {
  await requireAdmin();

  const input: WorksheetInput = {
    topic: String(formData.get("topic") ?? "").trim() || "Untitled topic",
    classGrade: String(formData.get("classGrade") ?? "").trim(),
    subject: String(formData.get("subject") ?? "").trim(),
    numQuestions: Math.max(1, Math.min(20, Number(formData.get("numQuestions")) || 8)),
    styleNotes: String(formData.get("styleNotes") ?? "").trim() || undefined,
  };

  return generateWorksheet(input);
}
