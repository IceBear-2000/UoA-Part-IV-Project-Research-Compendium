import { notFound } from "next/navigation";
import Link from "next/link";
import { getCurrentUser } from "@/lib/auth";
import { getAssignedSubjects } from "@/app/facilitator/data";
import { subjectStyle } from "@/app/facilitator/class-style";

export default async function ClassSubjectsPage({
  params,
}: {
  params: { classId: string };
}) {
  const user = await getCurrentUser();
  const data = await getAssignedSubjects(user!.id, params.classId);

  if (!data) notFound();

  return (
    <>
      <p className="mb-1.5 text-[13px] text-muted">
        <Link href="/facilitator" className="hover:text-clay">
          Dashboard
        </Link>{" "}
        › <span>{data.className}</span>
      </p>
      <div className="mb-7">
        <h1 className="text-[27px] font-bold tracking-tight">{data.className}</h1>
        <p className="mt-1 text-[14.5px] text-muted">
          Choose a subject to see its lessons
        </p>
      </div>

      <div className="grid grid-cols-3 gap-[18px]">
        {data.subjects.map((s) => {
          const style = subjectStyle(s.name);
          return (
            <Link
              key={s.id}
              href={`/facilitator/classes/${params.classId}/subjects/${s.id}`}
              className="rounded-card border border-line bg-surface p-[21px] shadow-paper transition-colors hover:border-clay-line hover:bg-white"
            >
              <div
                className={`mb-[15px] grid h-11 w-11 place-items-center rounded-xl text-xl ${style.bg}`}
              >
                {style.icon}
              </div>
              <h2 className="text-[17px] font-semibold tracking-tight">{s.name}</h2>
              <p className="mt-1 text-[14.5px] text-muted">
                {s.lessonCount} lesson{s.lessonCount === 1 ? "" : "s"}
              </p>
            </Link>
          );
        })}
      </div>
    </>
  );
}
