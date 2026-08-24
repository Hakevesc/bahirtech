import Link from "next/link";
import { CAPABILITIES } from "./content";

/** CYBERSECURITY HERO */
function CyHero() {
  return (
    <section className="ab-hero cy-hero">
      <div className="ab-hero__bg" aria-hidden="true" />
      <div className="container ab-hero__inner">
        <span className="ab-eyebrow ab-hero__eyebrow">
          Cybersecurity Operations
        </span>
        <h1 className="ab-hero__h1">
          Security You Can Point At
          <br />
          <span className="accent">Not Just Advise On</span>
        </h1>
        <p className="ab-hero__lead">
          We map your exposure, close it, and watch what is left around the
          clock. Every commitment on this page is one we put in a contract —
          response times, review cycles, and who picks up the phone at 3am.
        </p>
        <div className="ab-hero__cta">
          <a href="#capabilities" className="ring-btn ring-btn--green">
            See what we cover
          </a>
          <a href="tel:+251930573337" className="ring-btn ring-btn--white">
            Under attack? Call now
          </a>
        </div>
      </div>
    </section>
  );
}

/** WHY THIS MATTERS */
const GAPS = [
  {
    num: "01",
    h: "Policy that rots",
    p: "Rules get added under pressure and never removed. After a few years nobody can say what half of them are for, or what they now allow through.",
  },
  {
    num: "02",
    h: "Devices nobody counted",
    p: "The machines that cause incidents are usually the ones missing from the inventory — a contractor's laptop, a forgotten server, a phone with company mail on it.",
  },
  {
    num: "03",
    h: "Backups nobody tested",
    p: "A backup that has never been restored is a hope, not a plan. The first restore should not be the one happening during an incident.",
  },
  {
    num: "04",
    h: "Alerts nobody read",
    p: "Monitoring that emails a queue is not monitoring. Someone has to be awake, looking, and authorised to act on what they find.",
  },
];

function WhyMatters() {
  return (
    <section className="cy-section cy-section--dark" id="why">
      <div className="container">
        <span className="ab-eyebrow" data-reveal>
          Why this matters
        </span>
        <h2 className="ab-h2" data-reveal>
          Most breaches are not clever.
          <br />
          <span className="accent">They are unattended.</span>
        </h2>
        <p className="ab-lead" data-reveal>
          The incidents we get called into are rarely exotic. They are a
          firewall rule nobody reviewed, a laptop nobody had on the inventory,
          a backup nobody had restored, or an alert that arrived at 2am and sat
          in an inbox until Monday. Each one is preventable, and each one is a
          job somebody has to actually own.
        </p>

        <div className="cy-gaps" data-reveal>
          {GAPS.map((g) => (
            <article className="cy-gap" key={g.num}>
              <span className="cy-gap__mark" aria-hidden="true">
                {g.num}
              </span>
              <h3>{g.h}</h3>
              <p>{g.p}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
/** THE FOUR CAPABILITIES */
function Capabilities() {
  return (
    <section className="cy-section cy-section--alt" id="capabilities">
      <div className="container">
        <span className="ab-eyebrow" data-reveal>
          What we cover
        </span>
        <h2 className="ab-h2" data-reveal>
          Four jobs, and who <span className="accent">owns each one</span>
        </h2>
        <p className="ab-lead" data-reveal>
          These are the four things we are accountable for. Each one has a
          scope, a review cycle, and a named engineer behind it.
        </p>
      </div>

      {CAPABILITIES.map((cap) => (
        <div
          className={cap.flip ? "container cy-cap cy-cap--flip" : "container cy-cap"}
          id={cap.id}
          data-reveal
          key={cap.id}
        >
          <div className="cy-cap__copy">
            <span className="cy-cap__num">{cap.num}</span>
            <h3>{cap.title}</h3>
            <p className="cy-cap__lead">{cap.lead}</p>
            <ul className="cy-list">
              {cap.list.map((li) => (
                <li key={li}>{li}</li>
              ))}
            </ul>
            <dl className="cy-spec">
              {cap.spec.map((s) => (
                <div key={s.dt}>
                  <dt>{s.dt}</dt>
                  <dd>{s.dd}</dd>
                </div>
              ))}
            </dl>
          </div>
          <figure className="cy-cap__shot">
            <img
              src="/assets/Images/Cybersecurity.jpg"
              alt={cap.shotAlt}
              loading="lazy"
              decoding="async"
            />
          </figure>
        </div>
      ))}
    </section>
  );
}

/** HOW AN INCIDENT ACTUALLY GOES */
const STEPS = [
  {
    b: "You reach a person",
    span: "One number, answered by an engineer who can act — not a ticket queue and not a callback promise.",
  },
  {
    b: "We contain it",
    span: "Isolate the affected devices and accounts and cut the path the attacker is using, before anything else. Stopping the spread comes ahead of understanding it.",
  },
  {
    b: "We work out what happened",
    span: "What got in, how far it reached, and what it touched — from logs and endpoint data rather than guesswork.",
  },
  {
    b: "We get you running",
    span: "Restore from a backup we have already tested, on the recovery time we agreed with you up front.",
  },
  {
    b: "We write it down and close the hole",
    span: "A plain report of what happened and what we changed, plus the fix that stops the same route being used twice.",
  },
];

function Response() {
  return (
    <section className="cy-section" id="response">
      <div className="container">
        <span className="ab-eyebrow" data-reveal>
          Incident response
        </span>
        <h2 className="ab-h2" data-reveal>
          What happens in the <span className="accent">first hour</span>
        </h2>
        <p className="ab-lead" data-reveal>
          The value of a security partner is decided in the first hour, so here
          is the sequence, in order, before you ever need it.
        </p>

        <ol className="cy-steps" data-reveal>
          {STEPS.map((s) => (
            <li key={s.b}>
              <b>{s.b}</b>
              <span>{s.span}</span>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

/** UNDER ATTACK */
function Urgent() {
  return (
    <section className="cy-section cy-section--alt" id="urgent">
      <div className="container">
        <div className="cy-alarm" data-reveal>
          <div>
            <span className="cy-alarm__tag">Under attack right now?</span>
            <h2>Call us. We will help you contain it, client or not.</h2>
            <p>
              If systems are encrypted, accounts are compromised, or something
              is moving through your network as you read this — do not email.
              Call, and you will get an engineer.
            </p>
          </div>
          <div className="cy-alarm__act">
            <a href="tel:+251930573337" className="ring-btn ring-btn--green">
              +251 930 573 337
            </a>
            <span>
              Mon–Fri 8:00–18:00 for everything else · monitoring clients are
              covered 24/7
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}

/** CTA */
function Cta() {
  return (
    <section className="ab-section" id="focus">
      <div className="container">
        <div className="ab-cta" data-reveal>
          <h2>Start with an exposure review</h2>
          <p>
            Thirty minutes with an engineer. We look at what you have, tell you
            plainly where the gaps are, and put a number and a timeline on
            closing them — whether or not you work with us.
          </p>
          <Link href="/#contact" className="ring-btn ring-btn--green">
            Book a consultation
            <svg
              width={16}
              height={16}
              viewBox="0 0 24 24"
              fill="none"
              aria-hidden="true"
            >
              <path
                d="M7 17 17 7m0 0H9m8 0v8"
                stroke="currentColor"
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </Link>
        </div>
      </div>
    </section>
  );
}

export function CybersecurityPage() {
  return (
    <>
      <CyHero />
      <WhyMatters />
      <Capabilities />
      <Response />
      <Urgent />
      <Cta />
    </>
  );
}