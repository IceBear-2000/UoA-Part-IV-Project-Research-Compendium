import { prisma } from "@/lib/prisma";
import { ClassesView } from "./_components/ClassesView";

export default async function ClassesPage() {
  const classes = await prisma.class.findMany({
    include: { subjects: { orderBy: { name: "asc" } } },
    orderBy: { name: "asc" },
  });

  return (
    <>
      <div className="mb-7">
        <h1 className="text-[27px] font-bold tracking-tight">Classes</h1>
        <p className="mt-1 text-[14.5px] text-muted">
          Manage the classes and subjects available across lessons and assignments
        </p>
      </div>

      <ClassesView classes={classes} />
    </>
  );
}
