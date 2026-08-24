import Link from "next/link";
import { VALUES } from "./content";

const svgProps = {
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 2,
  strokeLinecap: "round",
  strokeLinejoin: "round",
} as const;

/** ABOUT HERO */
function AboutHero() {
  return (
    <section className="ab-hero au-hero">
      <div className="ab-hero__bg" aria-hidden="true" />
      <div className="container ab-hero__inner">
        <span className="ab-eyebrow ab-hero__eyebrow">About Bahir Tech</span>
        <h1 className="ab-hero__h1">
          Navigating the Sea of Ideas,
          <br />
          <span className="accent">Shaping the Digital Future</span>
        </h1>
        <p className="ab-hero__lead">
          Bahir Tech PLC (founded 2025) is an Ethiopian technology company
          focused on IT infrastructure, cybersecurity, software development,
          and digital transformation.
        </p>
        <div className="ab-hero__cta">
          <a href="#mission" className="ring-btn ring-btn--green">
            Our Mission
          </a>
          <a href="#values" className="ring-btn ring-btn--white">
            What We Value
          </a>
        </div>
      </div>
    </section>
  );
}

/** THE NAME: BAHIR */
function TheName() {
  return (
    <section className="ab-section ab-section--dark" id="name">
      <div className="container">
        <div className="ab-bahir">
          <div className="ab-bahir__glyph" data-reveal>
            <div className="ab-bahir__amh">ባሕር</div>
            <div className="ab-bahir__word">Bahir</div>
          </div>
          <div className="ab-bahir__body" data-reveal>
            <span className="ab-eyebrow">The Meaning</span>
            <h3 className="ab-h2">
              A name drawn from the <span className="accent">Sea</span>
            </h3>
            <p>
              <strong>“Bahir”</strong> (ባሕር) means <strong>“Sea”</strong> in
              Amharic — symbolizing connectivity, depth, and the continuous
              flow of ideas across boundaries.
            </p>
            <p>
              Just as a sea connects distant shores, we connect people,
              systems, and ideas across Ethiopia and beyond.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

/** VISION & HERITAGE */
function VisionHeritage() {
  return (
    <section className="ab-section ab-white" id="vision">
      <div className="container">
        <span className="ab-eyebrow" data-reveal>
          Our Compass
        </span>
        <h2 className="ab-h2" data-reveal>
          Vision &amp; <span className="accent">Heritage</span>
        </h2>
        <p className="ab-lead" data-reveal>
          Two currents guide everything we build — the future we are heading
          toward and the heritage we draw from.
        </p>
        <div className="ab-split" style={{ marginTop: 44 }}>
          <article className="ab-panel" data-reveal>
            <span className="ab-panel__icon">
              <svg {...svgProps}>
                <circle cx={12} cy={12} r={10} />
                <circle cx={12} cy={12} r={6} />
                <circle cx={12} cy={12} r={2} />
              </svg>
            </span>
            <h3>Our Vision</h3>
            <p>
              To be Ethiopia&apos;s most trusted technology partner, driving
              digital transformation across Ethiopia, Africa, and beyond.
            </p>
            <p>
              We build secure, scalable IT systems that enable sustainable
              growth and empower organizations to thrive in the digital age.
            </p>
          </article>
          <article className="ab-panel" data-reveal>
            <span className="ab-panel__icon">
              <svg {...svgProps}>
                <path d="M9 12l2 2 4-4" />
                <circle cx={12} cy={12} r={10} />
              </svg>
            </span>
            <h3>Inspired by Heritage</h3>
            <p>
              Drawing inspiration from Ethiopia&apos;s maritime heritage and the
              boundless <em>“Sea of Ideas”</em> that connects innovation with
              tradition.
            </p>
          </article>
        </div>
      </div>
    </section>
  );
}
/** OUR MISSION */
const MISSION = [
  "Build reliable, secure, and scalable IT systems",
  "Deliver implementation projects that clients can count on",
  "Provide ongoing support that prevents problems before they happen",
  "Offer smart consulting that helps businesses make the right tech decisions",
];

function Mission() {
  return (
    <section className="ab-section" id="mission">
      <div className="container">
        <span className="ab-eyebrow" data-reveal>
          Why We Exist
        </span>
        <h2 className="ab-h2" data-reveal>
          Our <span className="accent">Mission</span>
        </h2>
        <p className="ab-lead" data-reveal>
          We exist to make technology a dependable foundation for every
          organization we serve.
        </p>
        <div className="ab-mission" data-reveal>
          {MISSION.map((m, i) => (
            <div className="ab-mission__item" key={m}>
              <span className="ab-mission__num">
                {String(i + 1).padStart(2, "0")}
              </span>
              <h4>{m}</h4>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/** WHAT WE VALUE */
function Values() {
  return (
    <section className="ab-section ab-white" id="values">
      <div className="container">
        <span className="ab-eyebrow" data-reveal>
          What We Value
        </span>
        <h2 className="ab-h2" data-reveal>
          The Principles That <span className="accent">Guide Us</span>
        </h2>
        <div className="ab-values">
          {VALUES.map((v) => (
            <article className="ab-value" data-reveal key={v.title}>
              <span className="ab-value__dot">
                <svg {...svgProps}>{v.icon}</svg>
              </span>
              <h4>{v.title}</h4>
              <p>{v.body}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

/** WHAT WE DO */
const DO_CARDS = [
  {
    title: "Implementation & Deployment",
    body: "We take ideas and turn them into reality. Whether it's networks, servers, storage, or virtual environments, we design and build systems that run smoothly.",
    icon: <path d="M3 21h18M5 21V5a2 2 0 0 1 2-2h6a2 2 0 0 1 2 2v16M9 7h2M9 11h2M9 15h2M15 9h4a2 2 0 0 1 2 2v10" />,
  },
  {
    title: "Support & Maintenance",
    body: "We keep systems healthy and running. With preventive checks, quick fixes, and regular updates, downtime becomes a thing of the past.",
    icon: <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />,
  },
  {
    title: "Professional Consulting",
    body: "We guide organizations in making smart IT choices. From audits to planning, we help our clients see clearly and act confidently.",
    icon: (
      <>
        <path d="M9.5 2a2.5 2.5 0 0 0-2.5 2.5v2.5M9.5 2a8.5 8.5 0 0 1 0 17M9.5 2a3 3 0 0 0-3 3v2.5A2.5 2.5 0 0 1 9.5 10" />
        <path d="M14.5 22a2.5 2.5 0 0 0 2.5-2.5V17M14.5 22a8.5 8.5 0 0 1 0-17M14.5 22a3 3 0 0 0 3-3v-4a2.5 2.5 0 0 0-3-2.5" />
      </>
    ),
  },
];

function WhatWeDo() {
  return (
    <section className="ab-section" id="work">
      <div className="container">
        <span className="ab-eyebrow" data-reveal>
          What We Do
        </span>
        <h2 className="ab-h2" data-reveal>
          Three Ways We <span className="accent">Add Value</span>
        </h2>
        <div className="ab-do">
          {DO_CARDS.map((c) => (
            <article className="ab-do__card" data-reveal key={c.title}>
              <span className="ab-do__icon">
                <svg {...svgProps}>{c.icon}</svg>
              </span>
              <h3>{c.title}</h3>
              <p>{c.body}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
/** WHO WE SERVE */
const SERVE_CARDS = [
  {
    title: "Banks & Financial Institutions",
    body: "Secure and always-on systems.",
    icon: (
      <>
        <rect x={2} y={5} width={20} height={14} rx={2} />
        <line x1={2} y1={10} x2={22} y2={10} />
      </>
    ),
  },
  {
    title: "Government Agencies",
    body: "Scalable, reliable infrastructure.",
    icon: <path d="M3 21h18M4 21V10M9 21V10M15 21V10M20 21V10M2.5 10h19L12 3.5 2.5 10Z" />,
  },
  {
    title: "Private Companies & SMEs",
    body: "Efficient, cost-effective IT.",
    icon: <path d="M3 3h7v7H3zM14 3h7v7h-7zM3 14h7v7H3zM14 14h7v7h-7z" />,
  },
  {
    title: "NGOs & Development Programs",
    body: "Dependable technology for critical work.",
    icon: <path d="M12 3l7 4v5c0 5-3 7-7 9-4-2-7-4-7-9V7l7-4z" />,
  },
];

function WhoWeServe() {
  return (
    <section className="ab-section ab-white" id="serve">
      <div className="container">
        <span className="ab-eyebrow" data-reveal>
          Who We Serve
        </span>
        <h2 className="ab-h2" data-reveal>
          Built for Organizations That Want Their IT to{" "}
          <span className="accent">Just Work</span>
        </h2>
        <div className="ab-serve">
          {SERVE_CARDS.map((s) => (
            <article className="ab-serve__card" data-reveal key={s.title}>
              <span className="ab-serve__icon">
                <svg {...svgProps}>{s.icon}</svg>
              </span>
              <div className="ab-serve__body">
                <h3>{s.title}</h3>
                <p>{s.body}</p>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
/** CORE FOCUS AREAS + CTA */
const FOCUS = [
  { title: "IT Infrastructure", body: "Networks, servers, storage & virtual environments" },
  { title: "Cybersecurity", body: "Protecting your systems & data" },
  { title: "Software Development", body: "Custom solutions built for your needs" },
  { title: "Digital Transformation", body: "Modernize and grow with confidence" },
];

function Focus() {
  return (
    <section className="ab-section" id="focus">
      <div className="container">
        <span className="ab-eyebrow" data-reveal>
          Core Focus Areas
        </span>
        <h2 className="ab-h2" data-reveal>
          Where We <span className="accent">Concentrate Our Energy</span>
        </h2>
        <div className="ab-focus">
          {FOCUS.map((f) => (
            <div className="ab-focus__item" data-reveal key={f.title}>
              <h3>{f.title}</h3>
              <p>{f.body}</p>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="cta__panel" style={{ marginTop: 64 }} data-reveal>
          <iframe
            className="cta__logo-anim"
            src="/B-Logo-Icon-Web-loader.html"
            aria-hidden="true"
            loading="lazy"
            title="Bahirtech animated logo"
          />
          <div>
            <h2>Book a 30-minute call with an engineer</h2>
            <p>
              Pick a time that suits you. You will get a plain read on what is
              wrong, what fixing it involves, and how we would{" "}
              <br className="br-wide" />
              position your organization for the long term — whether or not
              you work with us.
            </p>
          </div>
          <div className="cta__actions">
            <Link href="/#contact" className="btn btn--onDark">
              Schedule a consultation
            </Link>
            <Link href="/services" className="btn btn--ghostDark">
              See our services
              <svg
                width={15}
                height={15}
                viewBox="0 0 24 24"
                fill="none"
                aria-hidden="true"
              >
                <path
                  d="M4 12h15"
                  stroke="currentColor"
                  strokeWidth={2}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M13 6l6 6-6 6"
                  stroke="currentColor"
                  strokeWidth={2}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

export function AboutPage() {
  return (
    <>
      <AboutHero />
      <TheName />
      <VisionHeritage />
      <Mission />
      <Values />
      <WhatWeDo />
      <WhoWeServe />
      <Focus />
    </>
  );
}