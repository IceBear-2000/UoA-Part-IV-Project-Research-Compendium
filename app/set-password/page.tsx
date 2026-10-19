import { getCurrentUser } from "@/lib/auth";
import { SubmitButton } from "@/components/SubmitButton";
import { setPassword } from "./actions";

export const metadata = { title: "Set your password" };

export default async function SetPasswordPage({
  searchParams,
}: {
  searchParams: { error?: string };
}) {
  const user = await getCurrentUser();

  return (
    <div className="grid min-h-screen place-items-center p-10">
      <div className="w-full max-w-[356px]">
        <div className="flex items-center gap-2.5 text-[22px] font-bold tracking-tight">
          <div className="grid h-8 w-8 place-items-center rounded-[9px] bg-clay text-base text-white">
            📚
          </div>
          StudyBuddy
        </div>

        {!user ? (
          <>
            <h1 className="mt-6 text-[23px] font-bold tracking-tight">
              Link expired
            </h1>
            <p className="mt-2 text-[14.5px] leading-relaxed text-muted">
              {searchParams?.error ??
                "This invite link is no longer valid. Ask your coordinator to resend it from the Requests page."}
            </p>
          </>
        ) : (
          <>
            <h1 className="mt-6 text-[23px] font-bold tracking-tight">
              Set your password
            </h1>
            <p className="mt-1 text-[14.5px] text-muted">
              Kia ora {user.name.split(" ")[0]} — one last step to activate
              your account
            </p>

            {searchParams?.error && (
              <p className="mt-4 rounded-input border border-rose bg-rose-soft px-3 py-2 text-sm text-[#946b76]">
                {searchParams.error}
              </p>
            )}

            <form action={setPassword} className="mt-6 flex flex-col gap-3.5">
              <div>
                <label htmlFor="set-password-password" className="mb-1.5 block text-[13px] font-semibold">
                  Password
                </label>
                <input
                  id="set-password-password" name="password"
                autoComplete="new-password"
                  type="password"
                  required
                  minLength={6}
                  className="w-full rounded-input border border-line bg-white px-3 py-2.5 text-sm text-ink focus:border-clay focus:outline-none focus:ring-[3px] focus:ring-clay-soft"
                />
              </div>
              <div>
                <label htmlFor="set-password-confirm" className="mb-1.5 block text-[13px] font-semibold">
                  Confirm password
                </label>
                <input
                  id="set-password-confirm" name="confirm"
                autoComplete="new-password"
                  type="password"
                  required
                  minLength={6}
                  className="w-full rounded-input border border-line bg-white px-3 py-2.5 text-sm text-ink focus:border-clay focus:outline-none focus:ring-[3px] focus:ring-clay-soft"
                />
              </div>
              <SubmitButton label="Set password & continue →" />
            </form>
          </>
        )}
      </div>
    </div>
  );
}
