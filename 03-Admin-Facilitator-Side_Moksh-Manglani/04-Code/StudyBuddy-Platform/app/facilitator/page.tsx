import Link from "next/link";
import { getCurrentUser } from "@/lib/auth";
import { getAssignedClassSummaries } from "@/app/facilitator/data";
import { ClassBanner } from "@/lib/class-banner";

export const metadata = { title: "Dashboard" };

export default async function FacilitatorDashboard() {
  const user = await getCurrentUser();
  const classes = await getAssignedClassSummaries(user!.id);

  return (
    <>
      <div className="mb-7">
        <h1 className="text-[27px] font-bold tracking-tight">Kia ora, {user?.name}</h1>
        <p className="mt-1 text-[14.5px] text-muted">Here&apos;s what&apos;s on for today</p>
      </div>

      <p className="mb-3.5 text-[12px] font-semibold uppercase tracking-wide text-muted">
        My classes
      </p>

      {classes.length === 0 ? (
        <div className="rounded-card border border-dashed border-line p-10 text-center text-muted">
          You haven&apos;t been assigned to any classes yet. Check with your
          coordinator.
        </div>
      ) : (
        <div className="grid grid-cols-[repeat(auto-fill,minmax(240px,1fr))] gap-[18px]">
          {classes.map((c) => (
            <Link
              key={c.id}
              href={`/facilitator/classes/${c.id}`}
              className="overflow-hidden rounded-card border border-line bg-surface shadow-paper transition-colors hover:border-clay-line hover:shadow-paper-2"
            >
              <div className="relative aspect-[5/2] w-full overflow-hidden bg-bg-2">
                <ClassBanner classId={c.id} className="h-full w-full" />
              </div>
              <div className="p-4">
                <h2 className="text-base font-semibold">{c.name}</h2>
                <p className="mt-1 text-[13px] text-muted">
                  {c.subjectIds.length} subject{c.subjectIds.length === 1 ? "" : "s"} ·{" "}
                  {c.lessonCount} lesson{c.lessonCount === 1 ? "" : "s"}
                </p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </>
  );
}
