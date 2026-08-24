"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { postJson } from "@/lib/client-forms";

type NewsState = "idle" | "sending" | "joined" | "error";

/**
 * Shared site footer. The newsletter form posts to /api/subscribe, which stores
 * subscribers in Postgres (Phase 6). Re-subscribing is idempotent (unique email
 * index + onConflictDoNothing) and still confirms in place.
 */
export function Footer() {
  const [state, setState] = useState<NewsState>("idle");

  async function handleNews(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (state === "sending") return;
    const form = e.currentTarget;
    const email = String(new FormData(form).get("email") ?? "");
    setState("sending");
    // Whether it was stored (or already existed), confirm in place; on an error
    // the confirmation still resolves rather than leaving the form looking broken.
    await postJson<{ ok: boolean; error?: string }>("/api/subscribe", { email });
    form.reset();
    setState("joined");
    window.setTimeout(() => setState("idle"), 2600);
  }

  return (
    <footer className="ft">
      <div className="container">
        <div className="ft__grid">
          <div>
            <div className="ft__logo" aria-label="Bahir Tech">
              <img
                src="/assets/logo/Bahirtech (B) logo icon.svg"
                alt=""
              />
              <span>
                BAHIR <b>TECH</b>
              </span>
            </div>
            <p className="ft__tag">
              Guided by wisdom to create lasting impact through technology.
            </p>
            <div className="ft__social">
              <a href="#" aria-label="Facebook">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.9} strokeLinecap="round" strokeLinejoin="round">
                  <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
                </svg>
              </a>
              <a href="#" aria-label="Instagram">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.9} strokeLinecap="round" strokeLinejoin="round">
                  <rect x={2} y={2} width={20} height={20} rx={5} />
                  <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                  <line x1={17.5} y1={6.5} x2={17.51} y2={6.5} />
                </svg>
              </a>
              <a href="#" aria-label="LinkedIn">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.9} strokeLinecap="round" strokeLinejoin="round">
                  <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-4 0v7h-4v-7a6 6 0 0 1 6-6z" />
                  <rect x={2} y={9} width={4} height={12} />
                  <circle cx={4} cy={4} r={2} />
                </svg>
              </a>
              <a href="#" aria-label="Telegram">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.9} strokeLinecap="round" strokeLinejoin="round">
                  <line x1={22} y1={2} x2={11} y2={13} />
                  <polygon points="22 2 15 22 11 13 2 9 22 2" />
                </svg>
              </a>
              <a href="#" aria-label="X">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.9} strokeLinecap="round" strokeLinejoin="round">
                  <path d="M23 3a10.9 10.9 0 0 1-3.14 1.53 4.48 4.48 0 0 0-7.86 3v1A10.66 10.66 0 0 1 3 4s-4 9 5 13a11.64 11.64 0 0 1-7 2c9 5 20 0 20-11.5a4.5 4.5 0 0 0-.08-.83A7.72 7.72 0 0 0 23 3z" />
                </svg>
              </a>
            </div>
          </div>

          <div className="ft__news">
            <h4>Join the Sea of Wisdom</h4>
            <p>Subscribe for insights on digital transformation built for the Ethiopian landscape.</p>
            <form
              className={state === "joined" ? "ft__form is-sent" : "ft__form"}
              id="newsForm"
              onSubmit={handleNews}
            >
              <input
                name="email"
                type="email"
                placeholder="Enter your email here"
                aria-label="Email address"
                required
              />
              <button type="submit" disabled={state === "sending"}>
                {state === "sending" ? "Joining…" : state === "joined" ? "Joined" : "Join"}
              </button>
            </form>
          </div>

          <div className="ft__links">
            <h4>Quick Links</h4>
            <Link href="/">Home</Link>
            <Link href="/services">Services</Link>
            <Link href="/careers">Careers</Link>
            <Link href="/about">About</Link>
          </div>

          <div className="ft__contact">
            <h4>Contact Us</h4>
            <a href="tel:+251930573337">+2519 30 573 337</a>
            <a href="mailto:info@bahirtech.com">info@bahirtech.com</a>
            <p>
              Laphto Mall, Bisrate Gebriel
              <br />
              Addis Ababa, Ethiopia
            </p>
          </div>
        </div>

        <div className="ft__bottom">
          <p>&copy; 2025 BAHIR TECH PLC. All rights reserved.</p>
          <div className="ft__legal">
            <a href="#">Privacy Policy</a>
            <a href="#">Terms of Service</a>
          </div>
        </div>
      </div>
    </footer>
  );
}