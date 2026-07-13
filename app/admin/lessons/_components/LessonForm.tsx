"use client";

import { useState } from "react";
import { SubmitButton } from "@/components/SubmitButton";

type SubjectOption = { id: string; name: string };
type ClassOption = { id: string; name: string; subjects: SubjectOption[] };

type LessonFormValues = {
  name: string;
  subjectId: string;
  durationMinutes: number | null;
  description: string | null;
  learningObjectives: string | null;
};

const inputClasses =
  "w-full rounded-input border border-line bg-white px-3 py-2.5 text-sm text-ink focus:border-clay focus:outline-none focus:ring-[3px] focus:ring-clay-soft";

const recommendedTag = (
  <span className="ml-1.5 rounded-[5px] bg-bg-2 px-[7px] py-[2px] text-[11px] font-medium text-muted">
    Recommended
  </span>
);

export function LessonForm({
  classes,
  initialValues,
  action,
  errorMessage,
  submitLabel,
}: {
  classes: ClassOption[];
  initialValues?: LessonFormValues;
  action: (formData: FormData) => void | Promise<void>;
  errorMessage?: string;
  submitLabel: string;
}) {
  const initialClassId =
    classes.find((c) => c.subjects.some((s) => s.id === initialValues?.subjectId))?.id ??
    classes[0]?.id ??
    "";

  const [classId, setClassId] = useState(initialClassId);
  const subjectsForClass = classes.find((c) => c.id === classId)?.subjects ?? [];

  return (
    <div className="rounded-card border border-line bg-surface p-[21px] shadow-paper">
      <h2 className="mb-4 text-[17px] font-semibold tracking-tight">
        Lesson details
      </h2>

      {errorMessage && (
        <p className="mb-4 rounded-input border border-rose bg-rose-soft px-3 py-2 text-sm text-[#946b76]">
          {errorMessage}
        </p>
      )}

      <form action={action} className="flex flex-col gap-[15px]">
        <div>
          <label className="mb-1.5 block text-[13px] font-semibold">
            Lesson name <span className="text-clay">*</span>
          </label>
          <input
            name="name"
            defaultValue={initialValues?.name}
            required
            className={inputClasses}
          />
        </div>

        <div>
          <label className="mb-1.5 block text-[13px] font-semibold">
            Class / Grade <span className="text-clay">*</span>
          </label>
          <select
            value={classId}
            onChange={(e) => setClassId(e.target.value)}
            className={inputClasses}
          >
            {classes.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="mb-1.5 block text-[13px] font-semibold">
            Subject <span className="text-clay">*</span>
          </label>
          <select
            name="subjectId"
            defaultValue={initialValues?.subjectId}
            required
            className={inputClasses}
          >
            {subjectsForClass.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="mb-1.5 block text-[13px] font-semibold">
            Duration {recommendedTag}
          </label>
          <input
            name="durationMinutes"
            type="number"
            min={0}
            placeholder="e.g. 45"
            defaultValue={initialValues?.durationMinutes ?? ""}
            className={inputClasses}
          />
        </div>

        <div>
          <label className="mb-1.5 block text-[13px] font-semibold">
            Description {recommendedTag}
          </label>
          <textarea
            name="description"
            placeholder="What this lesson covers…"
            defaultValue={initialValues?.description ?? ""}
            className={`min-h-[70px] resize-y ${inputClasses}`}
          />
        </div>

        <div>
          <label className="mb-1.5 block text-[13px] font-semibold">
            Learning objectives {recommendedTag}
          </label>
          <textarea
            name="learningObjectives"
            placeholder="Students will be able to…"
            defaultValue={initialValues?.learningObjectives ?? ""}
            className={`min-h-[70px] resize-y ${inputClasses}`}
          />
        </div>

        <SubmitButton label={submitLabel} />
      </form>
    </div>
  );
}
