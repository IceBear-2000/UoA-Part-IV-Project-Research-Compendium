import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { WorksheetWizard } from "./_components/WorksheetWizard";

export const metadata = { title: "Worksheet generator" };

export default async function WorksheetGeneratorPage({ params }: { params: { id: string } }) {
  const lesson = await prisma.lesson.findUnique({
    where: { id: params.id },
    select: { id: true, name: true },
  });
  if (!lesson) notFound();

  return (
    <>
      <p className="mb-1.5 text-[13px] text-muted">
        <Link href="/admin/lessons" className="hover:text-clay">
          Lessons
        </Link>{" "}
        ›{" "}
        <Link href={`/admin/lessons/${lesson.id}`} className="hover:text-clay">
          {lesson.name}
        </Link>{" "}
        › <span>Generate AI worksheet</span>
      </p>
      <div className="mb-7">
        <h1 className="text-[27px] font-bold tracking-tight">Generate AI worksheet</h1>
        <p className="mt-1 text-[14.5px] text-muted">
          For {lesson.name}. Review the AI&apos;s understanding before it writes any questions.
        </p>
      </div>

      <WorksheetWizard lessonId={lesson.id} />
    </>
  );
}
