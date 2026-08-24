import Link from "next/link";
import {
  SERVICES,
  VALUE_CARDS,
  INDUSTRIES,
  CHECK,
  ARROW,
  ARROW_MD,
} from "./content";

/** SERVICES HERO */
export function ServicesHero() {
  return (
    <section className="ab-hero sv-hero">
      <div className="ab-hero__bg" aria-hidden="true" />
      <div className="container ab-hero__inner">
        <span className="ab-eyebrow ab-hero__eyebrow">Our Services</span>
        <h1 className="ab-hero__h1">
          Custom Systems Designed
          <br />
          <span className="accent">For Real Operations</span>
        </h1>
        <p className="ab-hero__lead">
          From infrastructure and cybersecurity to software built around your
          workflows, we design, deploy, and support secure, scalable technology
          that keeps your business running smoothly.
        </p>
        <div className="ab-hero__cta">
          <a href="#services" className="ring-btn ring-btn--green">
            Explore Services
          </a>
          <Link href="/#contact" className="ring-btn ring-btn--white">
            Book a Consultation
          </Link>
        </div>
      </div>
    </section>
  );
}

/** CORE SERVICES intro + strip */
export function CoreServices() {
  return (
    <section className="ab-section ab-section--dark" id="services">
      <div className="container">
        <span className="ab-eyebrow" data-reveal>
          Core Services
        </span>
        <h2 className="ab-h2" data-reveal>
          What We <span className="accent">Deliver</span>
        </h2>
        <p className="ab-lead" data-reveal>
          Three core service lines, each engineered to keep your organization
          connected, protected, and ready to scale as the digital future
          unfolds.
        </p>

        <div className="sv-hero-strip" data-reveal>
          <div className="sv-strip__item">
            <b>24/7</b>
            <span>Always-on systems</span>
          </div>
          <div className="sv-strip__item">
            <b>100%</b>
            <span>Tailored to your workflows</span>
          </div>
          <div className="sv-strip__item">
            <b>0%</b>
            <span>Surprise downtime goals</span>
          </div>
        </div>
      </div>
    </section>
  );
}

/** a single sv-service (service 01/02/03) */
export function ServiceCard({
  id,
  num,
  title,
  icon,
  description,
  capabilities,
  more,
}: (typeof SERVICES)[number]) {
  return (
    <section className="ab-section" id={id}>
      <div className="container">
        <article className="sv-service" data-reveal>
          <div className="sv-service__head">
            <div className="sv-service__title">
              <span className="sv-service__icon">
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  {icon}
                </svg>
              </span>
              <h3>{title}</h3>
            </div>
            <span className="sv-service__num">{num}</span>
          </div>
          <div className="sv-service__body">
            <div className="sv-service__desc">
              <h4>At a glance</h4>
              <p>{description}</p>
              {more ? (
                <p>
                  <Link className="sv-more" href={more.href}>
                    {more.label}
                    {ARROW}
                  </Link>
                </p>
              ) : null}
            </div>
            <div className="sv-service__list">
              {capabilities.map((c) => (
                <span className="sv-cap" key={c.label}>
                  <span className="sv-cap__check">{CHECK}</span>
                  {c.label}
                </span>
              ))}
            </div>
          </div>
        </article>
      </div>
    </section>
  );
}
/** WHAT WE DO (Beyond the Core) */
export function WhatWeDo() {
  return (
    <section className="ab-section ab-white" id="work">
      <div className="container">
        <span className="ab-eyebrow" data-reveal>
          Beyond the Core
        </span>
        <h2 className="ab-h2" data-reveal>
          Three Ways We <span className="accent">Add Value</span>
        </h2>
        <p className="ab-lead" data-reveal>
          Whatever you need, we partner with you end-to-end — from first idea to
          everyday operations.
        </p>
        <div className="ab-do">
          {VALUE_CARDS.map((c) => (
            <article className="ab-do__card" data-reveal key={c.title}>
              <span className="ab-do__icon">
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  {c.icon}
                </svg>
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

/** INDUSTRIES WE SERVE */
export function Industries() {
  return (
    <section className="ab-section ab-white" id="serve">
      <div className="container">
        <span className="ab-eyebrow" data-reveal>
          Industries We Serve
        </span>
        <h2 className="ab-h2" data-reveal>
          Trusted Across <span className="accent">Sectors</span>
        </h2>
        <p className="ab-lead" data-reveal>
          We work with organizations that want their IT to just work — secure,
          reliable, and ready for what&apos;s next.
        </p>
        <div className="ab-serve">
          {INDUSTRIES.map((i) => (
            <article className="ab-serve__card" data-reveal key={i.title}>
              <span className="ab-serve__icon">
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  {i.icon}
                </svg>
              </span>
              <div className="ab-serve__body">
                <h3>{i.title}</h3>
                <p>{i.body}</p>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

export function Cta() {
  return (
    <section className="cta" id="focus">
      <div className="container">
        <div className="cta__panel" data-reveal>
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
              position your organization for the long term — whether or not you
              work with us.
            </p>
          </div>
          <div className="cta__actions">
            <Link href="/#contact" className="btn btn--onDark">
              Schedule a consultation
            </Link>
            <a href="#services" className="btn btn--ghostDark">
              See our services
              {ARROW_MD}
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}

export function ServicesPage() {
  return (
    <>
      <ServicesHero />
      <CoreServices />
      {SERVICES.map((s) => (
        <ServiceCard key={s.num} {...s} />
      ))}
      <WhatWeDo />
      <Industries />
      <Cta />
    </>
  );
}