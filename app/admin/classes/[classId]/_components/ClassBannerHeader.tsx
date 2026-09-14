"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { uploadClassBanner, removeClassBanner } from "../actions";
import { ClassBanner } from "@/lib/class-banner";

export function ClassBannerHeader({
  classId,
  bannerUrl,
  hasCustomBanner,
}: {
  classId: string;
  bannerUrl: string | null;
  hasCustomBanner: boolean;
}) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    setBusy(true);
    setError(null);
    try {
      const formData = new FormData();
      formData.append("file", file);
      await uploadClassBanner(classId, formData);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed.");
    } finally {
      setBusy(false);
    }
  }

  async function handleRemove() {
    setBusy(true);
    setError(null);
    try {
      await removeClassBanner(classId);
      router.refresh();
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="group relative mb-5 aspect-[4/1] w-full overflow-hidden rounded-card border border-line shadow-paper">
      {bannerUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={bannerUrl} alt="" className="h-full w-full object-cover" />
      ) : (
        <ClassBanner classId={classId} className="h-full w-full" />
      )}

      <div className="absolute inset-0 flex items-center justify-center gap-2 bg-black/0 opacity-0 transition-all group-hover:bg-black/35 group-hover:opacity-100">
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={busy}
          className="rounded-input bg-white px-3.5 py-2 text-[13px] font-semibold text-ink shadow-paper hover:bg-bg-2"
        >
          {busy ? "Working…" : hasCustomBanner ? "Change banner" : "Upload banner"}
        </button>
        {hasCustomBanner && (
          <button
            type="button"
            onClick={handleRemove}
            disabled={busy}
            className="rounded-input bg-white px-3.5 py-2 text-[13px] font-semibold text-[#946b76] shadow-paper hover:bg-bg-2"
          >
            Remove
          </button>
        )}
      </div>

      <input ref={inputRef} type="file" accept="image/jpeg,image/png,image/webp" onChange={handleChange} className="hidden" />

      {error && (
        <p className="absolute bottom-2 left-2 rounded-md bg-white px-2.5 py-1.5 text-xs font-semibold text-[#946b76] shadow-paper">
          {error}
        </p>
      )}
    </div>
  );
}
