import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { getSignedFileUrl } from "@/lib/supabase-admin";
import { SubjectsView } from "./_components/SubjectsView";
import { ClassBannerHeader } from "./_components/ClassBannerHeader";

export const metadata = { title: "Class" };

export default async function ClassDetailPage({ params }: { params: { classId: string } }) {
  const classRow = await prisma.class.findUnique({
    where: { id: params.classId },
    include: {
      subjects: {
        include: { _count: { select: { lessons: true } } },
        orderBy: { name: "asc" },
      },
    },
  });
  if (!classRow) notFound();

  const bannerUrl = classRow.bannerImagePath ? await getSignedFileUrl(classRow.bannerImagePath) : null;

  const subjects = classRow.subjects.map((s) => ({
    id: s.id,
    name: s.name,
    lessonCount: s._count.lessons,
  }));

  return (
    <>
      <p className="mb-1.5 text-[13px] text-muted">
        <Link href="/admin/classes" className="hover:text-clay">
          Classes
        </Link>{" "}
        › <span>{classRow.name}</span>
      </p>

      <ClassBannerHeader
        classId={classRow.id}
        bannerUrl={bannerUrl}
        hasCustomBanner={!!classRow.bannerImagePath}
      />

      <div className="mb-7">
        <h1 className="text-[27px] font-bold tracking-tight">{classRow.name}</h1>
        <p className="mt-1 text-[14.5px] text-muted">
          {subjects.length} subject{subjects.length === 1 ? "" : "s"}
        </p>
      </div>

      <SubjectsView classId={classRow.id} subjects={subjects} />
    </>
  );
}
