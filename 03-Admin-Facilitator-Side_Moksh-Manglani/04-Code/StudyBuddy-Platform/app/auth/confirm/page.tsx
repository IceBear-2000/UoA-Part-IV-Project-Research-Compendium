"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";

const EXPIRED_MESSAGE =
  "This link has expired or already been used. Ask your coordinator to resend it.";

// Links from supabaseAdmin.auth.admin.generateLink() land here with the
// session tokens in the URL *fragment* (#access_token=...), not a ?code=
// query param — PKCE's `code` requires a code_verifier the browser stored
// when it initiated the flow, which doesn't exist for admin-generated
// links (there was no browser involved yet). A Route Handler can't read a
// fragment at all (browsers never send it to the server), so this has to
// run client-side: read the hash, hand the tokens to the browser Supabase
// client, which persists them as cookies for the next Server Component.
export default function AuthConfirmPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const hash = window.location.hash.startsWith("#")
      ? window.location.hash.slice(1)
      : window.location.hash;
    const params = new URLSearchParams(hash);

    const errorDescription = params.get("error_description");
    if (errorDescription) {
      router.replace(`/set-password?error=${encodeURIComponent(errorDescription)}`);
      return;
    }

    const accessToken = params.get("access_token");
    const refreshToken = params.get("refresh_token");
    if (!accessToken || !refreshToken) {
      router.replace(`/set-password?error=${encodeURIComponent(EXPIRED_MESSAGE)}`);
      return;
    }

    const supabase = createClient();
    supabase.auth
      .setSession({ access_token: accessToken, refresh_token: refreshToken })
      .then(({ error: sessionError }) => {
        if (sessionError) {
          setError(sessionError.message);
          router.replace(`/set-password?error=${encodeURIComponent(sessionError.message)}`);
        } else {
          router.replace("/set-password");
        }
      });
  }, [router]);

  return (
    <div className="grid min-h-screen place-items-center p-10">
      <p className="text-sm text-muted">{error ?? "Signing you in…"}</p>
    </div>
  );
}
