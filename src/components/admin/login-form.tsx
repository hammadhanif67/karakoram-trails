"use client";

import { useRef, useState } from "react";
import { Lock } from "lucide-react";
import { Turnstile, type TurnstileHandle } from "@/components/booking/turnstile";
import { site } from "@/lib/site";

/** Password sign-in form (the page itself is a server component so it can export metadata). */
export function AdminLoginForm() {
  const [password, setPassword] = useState("");
  const [token, setToken] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const turnstile = useRef<TurnstileHandle>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!password) return setError("Enter the admin password.");
    if (!token) return setError("Please complete the security check.");
    setBusy(true);
    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ password, turnstileToken: token }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.message ?? "Sign-in failed.");
      // Full page load on purpose: /admin is gated by the server middleware, which checks the new cookie.
      // eslint-disable-next-line @next/next/no-location-assign-relative-destination
      window.location.assign("/admin/");
    } catch (err) {
      setError((err as Error).message);
      setPassword("");
    } finally {
      setBusy(false);
      turnstile.current?.reset();
    }
  }

  return (
    <main className="flex min-h-svh items-center justify-center bg-stone-100 px-5 font-sans text-stone-900">
      <form onSubmit={submit} noValidate className="w-full max-w-sm space-y-5 rounded-xl border border-stone-200 bg-white p-7 shadow-sm">
        <div>
          <p className="text-xs tracking-widest text-stone-500 uppercase">{site.name}</p>
          <h1 className="mt-1 flex items-center gap-2 text-2xl font-semibold">
            <Lock className="h-5 w-5" aria-hidden /> Admin sign in
          </h1>
        </div>
        <div>
          <label htmlFor="pw" className="text-sm font-medium">Password</label>
          <input
            id="pw"
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="mt-1.5 h-11 w-full rounded border border-stone-300 px-3"
          />
        </div>
        <Turnstile ref={turnstile} action="admin_login" onToken={setToken} />
        {error && <p role="alert" className="rounded bg-red-50 px-3 py-2 text-sm text-red-800">{error}</p>}
        <button type="submit" disabled={busy} className="h-11 w-full cursor-pointer rounded bg-stone-900 font-medium text-white hover:bg-stone-800 disabled:opacity-50">
          {busy ? "Signing in…" : "Sign in"}
        </button>
      </form>
    </main>
  );
}
