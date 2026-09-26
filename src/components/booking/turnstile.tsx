"use client";

import Script from "next/script";
import { useCallback, useEffect, useImperativeHandle, useRef, type Ref } from "react";

// Cloudflare Turnstile, rendered explicitly so each form keeps its own widget id and can reset it
// after every submit (tokens are single-use). Verification happens on the server (server/turnstile.ts).

type TurnstileApi = {
  render: (
    el: HTMLElement,
    opts: {
      sitekey: string;
      action: string;
      theme?: "light" | "dark" | "auto";
      callback: (token: string) => void;
      "expired-callback"?: () => void;
      "error-callback"?: () => void;
    },
  ) => string;
  reset: (id: string) => void;
  remove: (id: string) => void;
};

declare global {
  interface Window {
    turnstile?: TurnstileApi;
  }
}

export const TURNSTILE_SITE_KEY = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY ?? "";

export type TurnstileHandle = { reset: () => void };

type Props = {
  action: "booking_create" | "receipt_upload";
  onToken: (token: string) => void;
  ref?: Ref<TurnstileHandle>;
};

export function Turnstile({ action, onToken, ref }: Props) {
  const box = useRef<HTMLDivElement>(null);
  const widgetId = useRef<string | null>(null);
  const tokenCb = useRef(onToken);
  useEffect(() => {
    tokenCb.current = onToken;
  }, [onToken]);

  const render = useCallback(() => {
    if (!TURNSTILE_SITE_KEY || !box.current || !window.turnstile || widgetId.current !== null) return;
    widgetId.current = window.turnstile.render(box.current, {
      sitekey: TURNSTILE_SITE_KEY,
      action,
      theme: "light",
      callback: (t) => tokenCb.current(t),
      "expired-callback": () => tokenCb.current(""),
      "error-callback": () => tokenCb.current(""),
    });
  }, [action]);

  // Script already loaded (e.g. a second widget, or client-side navigation back to this page).
  useEffect(() => {
    render();
    return () => {
      if (widgetId.current !== null) window.turnstile?.remove(widgetId.current);
      widgetId.current = null;
    };
  }, [render]);

  useImperativeHandle(ref, () => ({
    reset: () => {
      if (widgetId.current !== null) window.turnstile?.reset(widgetId.current);
      tokenCb.current("");
    },
  }));

  if (!TURNSTILE_SITE_KEY) {
    return (
      <p className="rounded-lg border border-line bg-white/60 p-3 text-sm text-mist">
        Online booking isn&apos;t switched on yet. Please contact us on WhatsApp.
      </p>
    );
  }

  return (
    <>
      <Script src="https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit" strategy="afterInteractive" onReady={render} />
      <div ref={box} className="min-h-[65px]" />
    </>
  );
}
