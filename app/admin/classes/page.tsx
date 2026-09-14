import { prisma } from "@/lib/prisma";
import { getSignedFileUrl } from "@/lib/supabase-admin";
import { ClassesView } from "./_components/ClassesView";

export default async function ClassesPage() {
  const classes = await prisma.class.findMany({
    include: {
      _count: { select: { subjects: true } },
      subjects: { select: { _count: { select: { lessons: true } } } },
    },
    orderBy: { name: "asc" },
  });

  const withCounts = await Promise.all(
    classes.map(async (c) => ({
      id: c.id,
      name: c.name,
      subjectCount: c._count.subjects,
      lessonCount: c.subjects.reduce((sum, s) => sum + s._count.lessons, 0),
      bannerUrl: c.bannerImagePath ? await getSignedFileUrl(c.bannerImagePath) : null,
    })),
  );

  return (
    <>
      <div className="mb-7">
        <h1 className="text-[27px] font-bold tracking-tight">Classes</h1>
        <p className="mt-1 text-[14.5px] text-muted">
          Manage the classes and subjects available across lessons and assignments
        </p>
      </div>

      <ClassesView classes={withCounts} />
    </>
  );
}
