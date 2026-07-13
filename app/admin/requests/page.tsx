import { prisma } from "@/lib/prisma";
import { SignupRequestStatus } from "@prisma/client";
import { RequestsView } from "./_components/RequestsView";

export default async function RequestsPage() {
  const [requests, classes] = await Promise.all([
    prisma.signupRequest.findMany({
      where: { status: SignupRequestStatus.PENDING },
      orderBy: { createdAt: "asc" },
    }),
    prisma.class.findMany({
      include: { subjects: { select: { id: true, name: true } } },
      orderBy: { name: "asc" },
    }),
  ]);

  return (
    <>
      <div className="mb-7">
        <h1 className="text-[27px] font-bold tracking-tight">Requests</h1>
        <p className="mt-1 text-[14.5px] text-muted">
          {requests.length} pending request{requests.length === 1 ? "" : "s"}
        </p>
      </div>

      <RequestsView requests={requests} classes={classes} />
    </>
  );
}
