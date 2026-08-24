import { ShotPlaceholderIcon } from "./icons";

const CARDS = [
  {
    parallax: 32,
    title: "Downtime you cannot predict",
    body: "Every outage costs revenue and trust. We remove the single points of failure so one broken component stops being a company-wide stoppage.",
    icon: (
      <>
        <path d="M12.41 6.75 13 2l-2.43 2.92" />
        <path d="M18.57 12.91 21 10h-5.34" />
        <path d="M8 8l-5 6h9l-1 8 5-6" />
        <path d="M1 1l22 22" />
      </>
    ),
  },
  {
    parallax: 22,
    title: "Exposure you cannot see",
    body: "You cannot defend what has never been mapped. We find the gaps, close them, and monitor what is left so a breach is caught in minutes, not months.",
    icon: (
      <>
        <path d="M19.69 14A6.9 6.9 0 0 0 20 12V5l-8-3-3.16 1.18" />
        <path d="M4.73 4.73 4 5v7c0 6 8 10 8 10a20.3 20.3 0 0 0 5.62-4.38" />
        <path d="M1 1l22 22" />
      </>
    ),
  },
  {
    parallax: 12,
    title: "Systems that do not talk",
    body: "Re-keying data between platforms is slow and quietly wrong. We integrate them so one number means the same thing everywhere.",
    icon: (
      <>
        <path d="M18.84 12.25l1.72-1.71a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
        <path d="M5.17 11.75l-1.71 1.71a5 5 0 0 0 7.07 7.07l1.71-1.71" />
        <path d="M8 2v3M2 8h3M16 22v-3M22 16h-3" />
      </>
    ),
  },
  {
    parallax: 2,
    title: "No clear plan to invest against",
    body: "Spending without a roadmap buys tools you do not use. We set the sequence — what to fix now, what can wait, and what it will cost.",
    icon: (
      <>
        <circle cx={12} cy={12} r={10} />
        <path d="m16.24 7.76-2.12 6.36-6.36 2.12 2.12-6.36 6.36-2.12z" />
      </>
    ),
  },
];

export function Problems() {
  return (
    <section className="problems" id="problems">
      <div className="container">
        <div className="problems__head">
          <span className="eyebrow">Problems We Solve</span>
          <h2>
            <span className="green">13+ years</span> of turning complexity into
            secure, scalable digital environments
          </h2>
          <p className="lede">
            Most of what we are called in to fix comes down to four problems.
            Here is what each one costs you — and what changes once it is
            solved.
          </p>

          <div className="hero__stats problems__stats">
            <div className="stat">
              <b>25+</b>
              <span>Projects delivered</span>
            </div>
            <div className="stat">
              <b>13+</b>
              <span>Clients served</span>
            </div>
            <div className="stat">
              <b>3</b>
              <span>Core practices</span>
            </div>
          </div>
        </div>

        <div className="problems__body">
          <figure className="shot" data-shot="problems">
            <figcaption className="shot__note">
              <ShotPlaceholderIcon />
              <b>Problems photograph</b>
              560 × 780 · an engineer at a screen, server room, or a client
              meeting
            </figcaption>
          </figure>

          {/* data-parallax is the drift in px across the viewport pass. The ramp
              (32 down to 2) makes the stack read as depth. */}
          <div className="prows">
            {CARDS.map((c) => (
              <a
                className="pcard"
                key={c.title}
                href="#contact"
                data-parallax={c.parallax}
              >
                <span className="pcard__ico" aria-hidden="true">
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={1.7}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    {c.icon}
                  </svg>
                </span>
                <div className="pcard__body">
                  <h3>{c.title}</h3>
                  <p>{c.body}</p>
                </div>
                <span className="pcard__go" aria-hidden="true">
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={2}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M4 12h15" />
                    <path d="M13 6l6 6-6 6" />
                  </svg>
                </span>
              </a>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}