"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { postJson } from "@/lib/client-forms";

export function LoginForm() {
  const router = useRouter();
  const [state, setState] = useState<"idle" | "submitting">("idle");
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (state === "submitting") return;
    const fd = new FormData(e.currentTarget);
    setState("submitting");
    setError(null);

    const res = await postJson<{ ok: boolean; error?: string }>("/api/admin/login", {
      email: String(fd.get("email") ?? ""),
      password: String(fd.get("password") ?? ""),
    });

    if (res.ok) {
      router.replace("/admin");
      router.refresh();
    } else {
      setState("idle");
      setError(res.error ?? "Could not sign in. Please verify your credentials.");
    }
  }

  return (
    <div className="adm-login-shell">
      <div className="adm-login-card">
        <div className="adm-login-header">
          <div className="adm-login-logo">
            <img src="/assets/logo/Bahirtech (B) logo icon white.svg" alt="Bahir Tech" />
          </div>
          <h1>Bahir Tech Admin</h1>
          <p>Sign in to access the Enterprise CMS & Management Portal</p>
        </div>

        <form onSubmit={onSubmit}>
          <div className="adm-field">
            <label htmlFor="admEmail">Email address</label>
            <input
              id="admEmail"
              name="email"
              type="email"
              autoComplete="username"
              required
              placeholder="admin@bahirtech.com"
            />
          </div>

          <div className="adm-field">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <label htmlFor="admPass">Password</label>
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="adm-btn adm-btn--ghost adm-btn--sm"
                style={{ padding: "0 4px", fontSize: "0.75rem", color: "var(--adm-primary)" }}
              >
                {showPassword ? "Hide" : "Show"}
              </button>
            </div>
            <div style={{ position: "relative" }}>
              <input
                id="admPass"
                name="password"
                type={showPassword ? "text" : "password"}
                autoComplete="current-password"
                required
                placeholder="••••••••••••"
                style={{ width: "100%" }}
              />
            </div>
          </div>

          {error ? (
            <div
              style={{
                background: "var(--adm-danger-bg)",
                color: "var(--adm-danger-ink)",
                border: "1px solid var(--adm-danger-border)",
                borderRadius: "var(--adm-radius-sm)",
                padding: "0.65rem 0.85rem",
                fontSize: "0.8125rem",
                marginBottom: "1.25rem",
                display: "flex",
                alignItems: "center",
                gap: "0.5rem",
              }}
              role="alert"
            >
              <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} style={{ width: 16, height: 16, flexShrink: 0 }}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>{error}</span>
            </div>
          ) : null}

          <button
            type="submit"
            className="adm-btn"
            disabled={state === "submitting"}
            style={{ width: "100%", padding: "0.7rem 1rem", fontSize: "0.9375rem" }}
          >
            {state === "submitting" ? (
              <span style={{ display: "inline-flex", alignItems: "center", gap: "0.5rem" }}>
                <svg
                  style={{ width: 16, height: 16, animation: "spin 1s linear infinite" }}
                  viewBox="0 0 24 24"
                  fill="none"
                >
                  <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" opacity="0.25" />
                  <path fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                </svg>
                Authenticating…
              </span>
            ) : (
              "Sign In to Dashboard"
            )}
          </button>
        </form>

        <div style={{ marginTop: "1.5rem", paddingTop: "1.25rem", borderTop: "1px solid var(--adm-border-light)", display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: "0.75rem", color: "var(--adm-ink-subtle)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.35rem" }}>
            <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} style={{ width: 13, height: 13, color: "var(--adm-success)" }}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
            <span>Session-secured</span>
          </div>

          <Link href="/" style={{ color: "var(--adm-ink-muted)", textDecoration: "none", fontWeight: 500 }}>
            ← Return to Website
          </Link>
        </div>
      </div>
    </div>
  );
}