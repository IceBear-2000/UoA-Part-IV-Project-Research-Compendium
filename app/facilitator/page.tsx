import Link from "next/link";
import { getCurrentUser } from "@/lib/auth";
import { getAssignedClassSummaries } from "@/app/facilitator/data";
import { classStyle } from "@/app/facilitator/class-style";

export default async function FacilitatorDashboard() {
  const user = await getCurrentUser();
  const classes = await getAssignedClassSummaries(user!.id);

  return (
    <>
      <div className="mb-7">
        <h1 className="text-[27px] font-bold tracking-tight">
          Kia ora, {user?.name} 👋
        </h1>
        <p className="mt-1 text-[14.5px] text-muted">
          Here&apos;s what&apos;s on for today
        </p>
      </div>

      <p className="mb-3.5 text-[12px] font-semibold uppercase tracking-wide text-muted">
        My classes
      </p>

      {classes.length === 0 ? (
        <div className="rounded-card border border-dashed border-line p-10 text-center text-muted">
          You haven&apos;t been assigned to any classes yet — check with your
          coordinator.
        </div>
      ) : (
        <div className="grid grid-cols-3 gap-[18px]">
          {classes.map((c, i) => {
            const style = classStyle(i);
            return (
              <Link
                key={c.id}
                href={`/facilitator/classes/${c.id}`}
                className="rounded-card border border-line bg-surface p-[21px] shadow-paper transition-colors hover:border-clay-line hover:bg-white"
              >
                <div
                  className={`mb-[15px] grid h-11 w-11 place-items-center rounded-xl text-xl ${style.bg}`}
                >
                  {style.icon}
                </div>
                <h2 className="text-[17px] font-semibold tracking-tight">
                  {c.name}
                </h2>
                <div className="mt-2 flex gap-3.5 text-[13px] text-muted">
                  <span>
                    {c.subjectIds.length} subject
                    {c.subjectIds.length === 1 ? "" : "s"}
                  </span>
                  <span>·</span>
                  <span>
                    {c.lessonCount} lesson{c.lessonCount === 1 ? "" : "s"}
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </>
  );
}
