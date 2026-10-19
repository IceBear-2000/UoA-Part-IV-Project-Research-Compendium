import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";

// Not a real page — just sends people to the right place based on role,
// right after signing in.
export default async function DashboardPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  redirect(user!.role === "ADMIN" ? "/admin" : "/facilitator");
}
