"use client";

import { useEffect, useRef, useState } from "react";

const WA_NUMBER = "251915965321"; // wa.me wants digits only — no +, spaces or dashes
const DEFAULT_MSG = "Hello Bahir Tech, I'd like to talk about a project.";

type Phase = "closed" | "opening" | "open" | "closing";

/**
 * Floating support dock + panel. Behaviour is ported from public/assets/js/
 * page-ui.js: the "Send now" link opens WhatsApp's compose screen with the
 * typed message prefilled (never sent automatically). As a React component it
 * works on every page and survives client-side navigation.
 */
export function Support() {
  const [phase, setPhase] = useState<Phase>("closed");
  const [msg, setMsg] = useState(DEFAULT_MSG);
  const popRef = useRef<HTMLDivElement>(null);
  const btnRef = useRef<HTMLButtonElement>(null);

  const waHref =
    "https://wa.me/" +
    WA_NUMBER +
    (msg.trim() ? "?text=" + encodeURIComponent(msg) : "");

  const open = () => setPhase("opening");
  const shut = () => {
    if (phase === "closed") return;
    setPhase("closing");
    window.setTimeout(() => {
      setPhase((p) => (p === "closing" ? "closed" : p));
    }, 230);
  };
  const toggle = () =>
    phase === "closed" || phase === "closing" ? open() : shut();

  /* opening animation: render with is-closed, force a reflow, then drop it. */
  useEffect(() => {
    if (phase !== "opening") return;
    const raf = requestAnimationFrame(() => setPhase("open"));
    return () => cancelAnimationFrame(raf);
  }, [phase]);

  /* click-outside + Escape + open-in-new-tab tidy-up. */
  useEffect(() => {
    if (phase === "closed") return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") shut();
    };
    const onClick = (e: MouseEvent) => {
      if (popRef.current?.contains(e.target as Node)) return;
      if (btnRef.current?.contains(e.target as Node)) return;
      shut();
    };
    document.addEventListener("keydown", onKey);
    document.addEventListener("click", onClick);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("click", onClick);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase]);

  const visible = phase !== "closed";

  return (
    <>
      <button
        type="button"
        className="support"
        id="supportDock"
        aria-label="Support — get in touch"
        aria-expanded={visible}
        aria-controls="supportPop"
        onClick={() => toggle()}
        ref={btnRef}
      >
        <span className="support__label">Support</span>
      </button>

      <div
        className={phase === "open" ? "spop" : "spop is-closed"}
        id="supportPop"
        role="dialog"
        aria-modal={false}
        aria-labelledby="spopTitle"
        hidden={!visible}
        ref={popRef}
      >
        <div className="spop__head">
          <span className="spop__dot" aria-hidden="true" />
          <div>
            <b id="spopTitle">Bahir Tech Support</b>
            <span>Typically replies within a few hours</span>
          </div>
          <button
            type="button"
            className="spop__x"
            id="spopClose"
            aria-label="Close support panel"
            onClick={() => shut()}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round">
              <path d="M18 6 6 18M6 6l12 12" />
            </svg>
          </button>
        </div>

        <label className="spop__label" htmlFor="spopMsg">
          Your message
        </label>
        <textarea
          id="spopMsg"
          className="spop__msg"
          rows={3}
          placeholder="How can we help?"
          value={msg}
          onChange={(e) => setMsg(e.target.value)}
          onFocus={open}
        />

        <a
          className="btn btn--primary spop__send"
          id="spopSend"
          href={waHref}
          target="_blank"
          rel="noopener noreferrer"
          onClick={() => window.setTimeout(shut, 150)}
        >
          Send now
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
            <path d="M22 2 11 13" />
            <path d="M22 2 15 22l-4-9-9-4Z" />
          </svg>
        </a>

        <div className="spop__rows">
          <a className="spop__row" href="tel:+251915965321">
            <span className="spop__ico" aria-hidden="true">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.9} strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1 1 .4 1.9.7 2.8a2 2 0 0 1-.5 2.1L8.1 9.9a16 16 0 0 0 6 6l1.3-1.2a2 2 0 0 1 2.1-.5c.9.3 1.8.6 2.8.7a2 2 0 0 1 1.7 2Z" />
              </svg>
            </span>
            <span>
              <b>Call us</b>+251 91 596 5321
            </span>
          </a>
          <div className="spop__row spop__row--static">
            <span className="spop__ico" aria-hidden="true">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.9} strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 10c0 6-9 12-9 12s-9-6-9-12a9 9 0 0 1 18 0Z" />
                <circle cx={12} cy={10} r={3} />
              </svg>
            </span>
            <span>
              <b>Visit us</b>Laphto Mall, Bisrate Gebriel
              <br />
              Addis Ababa, Ethiopia
            </span>
          </div>
        </div>
      </div>
    </>
  );
}