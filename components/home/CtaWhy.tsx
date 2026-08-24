import { ArrowIcon, ShotPlaceholderIcon } from "./icons";

export function Cta() {
  return (
    <section className="cta">
      <div className="container">
        <div className="cta__panel">
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
            <a href="#contact" className="btn btn--onDark">
              Schedule a consultation
            </a>
            <a href="#services-section" className="btn btn--ghostDark">
              See our services
              <ArrowIcon />
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}

const WCARDS = [
  {
    className: "wcard",
    title: "Wisdom-Driven Strategy",
    body: "We combine deep understanding of Ethiopian business culture with global standards to build solutions that fit your context.",
  },
  {
    className: "wcard",
    title: "Trusted Execution",
    body: "We don't just plan, we deliver — a proven record of successful projects across sectors shows our commitment to excellence.",
  },
];

export function Why() {
  return (
    <section className="why">
      <div className="container">
        <div className="why__head">
          <div>
            <span className="eyebrow">Why Bahir Tech</span>
            <h2>Why organizations trust us with systems they cannot lose</h2>
            <p className="lede">
              25+ delivered projects across banking, health and the public
              sector. We work to global engineering standards, in your
              timezone, with one team accountable from scope to handover.
            </p>
            <a href="#contact" className="btn btn--primary">
              Talk to an Expert
            </a>
          </div>

          <figure className="shot" data-shot="why">
            <figcaption className="shot__note">
              <ShotPlaceholderIcon />
              <b>Team photograph</b>
              1080 × 660 · the team, the office, or a delivered project
            </figcaption>
          </figure>
        </div>

        <div className="why__cards">
          {WCARDS.map((c) => (
            <article className={c.className} key={c.title}>
              <span className="wcard__ico">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                  <path d="M7 17 17 7" />
                  <path d="M7 7h10v10" />
                </svg>
              </span>
              <h3>{c.title}</h3>
              <p>{c.body}</p>
            </article>
          ))}
          <article className="wcard wcard--accent">
            <span className="wcard__ico">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                <path d="M7 17 17 7" />
                <path d="M7 7h10v10" />
              </svg>
            </span>
            <span>Local Insight,</span>
            <h3>Global Standards</h3>
          </article>
        </div>

        <div className="why__foot">
          <span>#BahireHasab</span>
          <span>#ExecutionExcellence</span>
          <span>#WiseInnovation</span>
          <span>#StrategicIntegrity</span>
        </div>
      </div>
    </section>
  );
}