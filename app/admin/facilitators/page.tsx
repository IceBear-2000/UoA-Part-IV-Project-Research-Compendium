import { prisma } from "@/lib/prisma";
import { FacilitatorsView } from "./_components/FacilitatorsView";

export const metadata = { title: "Facilitators" };

export default async function FacilitatorsPage() {
  const [facilitators, classes] = await Promise.all([
    prisma.user.findMany({
      where: { role: "FACILITATOR" },
      select: {
        id: true,
        name: true,
        email: true,
        assignments: {
          select: {
            id: true,
            class: { select: { id: true, name: true } },
            subject: { select: { id: true, name: true } },
          },
        },
      },
      orderBy: { name: "asc" },
    }),
    prisma.class.findMany({
      include: { subjects: { select: { id: true, name: true } } },
      orderBy: { name: "asc" },
    }),
  ]);

  return (
    <>
      <div className="mb-7">
        <h1 className="text-[27px] font-bold tracking-tight">Facilitators</h1>
        <p className="mt-1 text-[14.5px] text-muted">
          {facilitators.length} facilitator{facilitators.length === 1 ? "" : "s"} · manage
          assignments
        </p>
      </div>

      <FacilitatorsView facilitators={facilitators} classes={classes} />
    </>
  );
}
