"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import { MessageComposer } from "./MessageComposer";
import { sendMessageAction, markThreadRead } from "@/lib/messaging-actions";

const AVATAR_COLORS = ["bg-sage", "bg-blue", "bg-gold", "bg-clay"];

function initials(name: string) {
  return (
    name
      .split(" ")
      .map((part) => part[0])
      .join("")
      .slice(0, 2)
      .toUpperCase() || "?"
  );
}

export type ThreadPartner = {
  id: string;
  name: string;
  subtitle: string;
  lastMessageSnippet: string | null;
  unread: boolean;
};

export type ThreadMessage = {
  id: string;
  senderId: string;
  body: string;
  createdAt: string;
};

export function MessagingThread({
  currentUserId,
  title,
  subtitle,
  basePath,
  partners,
  selectedPartnerId,
  messages,
}: {
  currentUserId: string;
  title: string;
  subtitle: string;
  basePath: string;
  partners: ThreadPartner[];
  selectedPartnerId: string | null;
  messages: ThreadMessage[];
}) {
  const bottomRef = useRef<HTMLDivElement>(null);
  const markedPartnerRef = useRef<string | null>(null);

  // Viewing a thread clears just that sender's unread notifications —
  // this fires client-side (not during the server render) so it never
  // mutates state on a plain page load without the user actually landing here.
  // Guarded against firing twice for the same partner: React 18 StrictMode
  // double-invokes effects in dev, and two near-simultaneous mutating
  // requests can race Supabase's token refresh and drop the session.
  useEffect(() => {
    if (selectedPartnerId && markedPartnerRef.current !== selectedPartnerId) {
      markedPartnerRef.current = selectedPartnerId;
      markThreadRead(selectedPartnerId);
    }
  }, [selectedPartnerId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ block: "end" });
  }, [messages.length]);

  const selectedIndex = partners.findIndex((p) => p.id === selectedPartnerId);
  const selected = selectedIndex >= 0 ? partners[selectedIndex] : undefined;

  return (
    <>
      <div className="mb-7">
        <h1 className="text-[27px] font-bold tracking-tight">{title}</h1>
        <p className="mt-1 text-[14.5px] text-muted">{subtitle}</p>
      </div>

      <div className="grid h-[560px] grid-cols-[280px_1fr] overflow-hidden rounded-card border border-line bg-surface shadow-paper">
        <div className="overflow-auto border-r border-line">
          {partners.length === 0 ? (
            <p className="p-4 text-sm text-muted">No one to message yet.</p>
          ) : (
            partners.map((p, i) => (
              <Link
                key={p.id}
                href={`${basePath}?with=${p.id}`}
                className={`flex items-center gap-2.5 border-b border-line px-4 py-3.5 transition-colors ${
                  p.id === selectedPartnerId ? "bg-bg" : "hover:bg-bg"
                }`}
              >
                <div
                  className={`grid h-[34px] w-[34px] flex-shrink-0 place-items-center rounded-full text-[13px] font-semibold text-white ${AVATAR_COLORS[i % AVATAR_COLORS.length]}`}
                >
                  {initials(p.name)}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5">
                    <strong className="truncate text-sm">{p.name}</strong>
                    {p.unread && (
                      <span className="h-[7px] w-[7px] flex-shrink-0 rounded-full bg-clay" />
                    )}
                  </div>
                  <p className="truncate text-xs text-muted">
                    {p.lastMessageSnippet ?? "No messages yet"}
                  </p>
                </div>
              </Link>
            ))
          )}
        </div>

        <div className="flex flex-col">
          {selected ? (
            <>
              <div className="flex items-center gap-2.5 border-b border-line px-5 py-4">
                <div
                  className={`grid h-[34px] w-[34px] place-items-center rounded-full text-[13px] font-semibold text-white ${AVATAR_COLORS[selectedIndex % AVATAR_COLORS.length]}`}
                >
                  {initials(selected.name)}
                </div>
                <div>
                  <strong className="text-[15px]">{selected.name}</strong>
                  <p className="text-xs text-muted">{selected.subtitle}</p>
                </div>
              </div>

              <div className="flex flex-1 flex-col gap-3 overflow-auto bg-bg p-5">
                {messages.length === 0 ? (
                  <p className="text-sm text-muted">No messages yet — say hi 👋</p>
                ) : (
                  messages.map((m) => (
                    <div
                      key={m.id}
                      className={`max-w-[64%] rounded-2xl px-4 py-2.5 text-sm ${
                        m.senderId === currentUserId
                          ? "self-end rounded-br-[4px] bg-clay text-white"
                          : "self-start rounded-bl-[4px] border border-line bg-surface"
                      }`}
                    >
                      {m.body}
                    </div>
                  ))
                )}
                <div ref={bottomRef} />
              </div>

              <MessageComposer onSend={(body) => sendMessageAction(selected.id, body)} />
            </>
          ) : (
            <div className="grid flex-1 place-items-center text-sm text-muted">
              Select someone to start chatting
            </div>
          )}
        </div>
      </div>
    </>
  );
}
