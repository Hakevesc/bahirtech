"use client";

import { useState, type FormEvent } from "react";
import { postJson } from "@/lib/client-forms";

type SendState = "idle" | "sending" | "sent" | "error";

const CINFO = [
  {
    b: "Address",
    body: (
      <>
        Laphto Mall, Bisrate Gebriel
        <br />
        Addis Ababa, Ethiopia
      </>
    ),
    icon: (
      <path d="M21 10c0 7-9 12-9 12s-9-5-9-12a9 9 0 0 1 18 0z" />
    ),
  },
  {
    b: "Call Us",
    body: (
      <>
        +2519 30 573 337
        <br />
        Mon–Fri, 8:00 AM – 6:00 PM
      </>
    ),
    icon: (
      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
    ),
  },
  {
    b: "Email Us",
    body: (
      <>
        info@bahirtech.com
        <br />
        support@bahirtech.com
      </>
    ),
    icon: (
      <>
        <rect x={2} y={4} width={20} height={16} rx={2} />
        <polyline points="22,6 12,13 2,6" />
      </>
    ),
  },
];
export function Contact() {
  const [state, setState] = useState<SendState>("idle");
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (state === "sending") return;

    const form = e.currentTarget;
    const data = new FormData(form);
    setState("sending");
    setError(null);

    const res = await postJson<{ ok: boolean; error?: string }>("/api/contact", {
      firstName: String(data.get("firstName") ?? ""),
      lastName: String(data.get("lastName") ?? ""),
      email: String(data.get("email") ?? ""),
      phone: String(data.get("phone") ?? ""),
      company: String(data.get("company") ?? ""),
      service: String(data.get("service") ?? ""),
      message: String(data.get("message") ?? ""),
    });

    if (res.ok) {
      form.reset();
      setState("sent");
      window.setTimeout(() => setState("idle"), 4000);
    } else {
      setState("error");
      setError(res.error ?? "Something went wrong. Please try again.");
    }
  }

  return (
    <section className="contact" id="contact">
      <div className="container contact__grid">
        <div className="contact__head">
          <span className="eyebrow">Free Consultation</span>
          <h2>Tell us what is breaking</h2>
          <p className="lede">
            A 30-minute call with an engineer, not a salesperson. You leave with
            a clear read on the problem and what fixing it involves — whether or
            not you work with us.
          </p>

          <ul className="cinfo">
            {CINFO.map((c) => (
              <li key={c.b}>
                <span className="cinfo__ico">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.9} strokeLinecap="round" strokeLinejoin="round">
                    {c.icon}
                  </svg>
                </span>
                <div>
                  <b>{c.b}</b>
                  <span>{c.body}</span>
                </div>
              </li>
            ))}
          </ul>
        </div>
<form
          className={state === "sent" ? "cform is-sent" : "cform"}
          id="contactForm"
          onSubmit={handleSubmit}
        >
          <h3>Send us a message</h3>
          <div className="cform__row">
            <div className="cfield">
              <label htmlFor="cFirst">First Name</label>
              <input id="cFirst" name="firstName" type="text" autoComplete="given-name" placeholder="Your first name" required />
            </div>
            <div className="cfield">
              <label htmlFor="cLast">Last Name</label>
              <input id="cLast" name="lastName" type="text" autoComplete="family-name" placeholder="Your last name" />
            </div>
          </div>
          <div className="cform__row">
            <div className="cfield">
              <label htmlFor="cEmail">Email Address</label>
              <input id="cEmail" name="email" type="email" autoComplete="email" placeholder="you@example.com" required />
            </div>
            <div className="cfield">
              <label htmlFor="cPhone">Phone Number</label>
              <input id="cPhone" name="phone" type="tel" autoComplete="tel" placeholder="+251 XXX XXX XXX" />
            </div>
          </div>
          <div className="cfield">
            <label htmlFor="cCompany">Company / Organization</label>
            <input id="cCompany" name="company" type="text" autoComplete="organization" placeholder="Your company name" />
          </div>
          <div className="cfield">
            <label htmlFor="cService">Service Interest</label>
            <select id="cService" name="service" defaultValue="">
              <option value="" disabled>
                Select a service
              </option>
              <option>IT Infrastructure &amp; Networking</option>
              <option>Software Development</option>
              <option>Cybersecurity Operations</option>
              <option>Something else</option>
            </select>
          </div>
          <div className="cfield">
            <label htmlFor="cMessage">Message</label>
            <textarea id="cMessage" name="message" rows={3} placeholder="Tell us about your project — and a good day and time to call" required />
          </div>

          {state === "error" ? (
            <p role="alert" style={{ color: "#b00020", fontSize: "14px" }}>
              {error}
            </p>
          ) : null}

          <button
            type="submit"
            className="btn btn--primary"
            disabled={state === "sending"}
          >
            {state === "sending" ? "Sending…" : state === "sent" ? "Message sent ✓" : "Send Message"}
          </button>
        </form>
      </div>
    </section>
  );
}