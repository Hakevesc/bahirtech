import { ArrowIcon, SrvIcon } from "./icons";
import type { SrvIconName } from "./service-types";

type ServeCard = {
  num: string;
  title: string;
  body: string;
  /** Each tag carries its own glyph — the row reads as attributes, not as filter chips. */
  tags: { icon: SrvIconName; label: string }[];
  /** The action is written for the audience rather than repeated verbatim across all three. */
  cta: string;
  /** At most one card sets this: it tints the card and flags it with a chip. */
  chip?: string;
  icon: React.ReactNode;
};

const CARDS: ServeCard[] = [
  {
    num: "01",
    title: "Enterprises & Corporations",
    body:
      "Growth has outrun your systems. We re-architect the core so scale stops breaking things — without a rip-and-replace.",
    tags: [
      { icon: "shield", label: "Security" },
      { icon: "chart", label: "Scalability" },
      { icon: "star", label: "Mission-critical systems" },
    ],
    cta: "Review your systems",
    chip: "Most common fit",
    icon: (
      <path d="M3 21h18M5 21V5a2 2 0 0 1 2-2h6a2 2 0 0 1 2 2v16M9 7h2M9 11h2M9 15h2M15 9h4a2 2 0 0 1 2 2v10" />
    ),
  },
  {
    num: "02",
    title: "Public Institutions",
    body:
      "Service delivery cannot wait on an outage or an audit finding. We build systems that stay up, stay compliant and outlast the project cycle.",
    tags: [
      { icon: "shield", label: "Reliable" },
      { icon: "check", label: "Compliant" },
      { icon: "leaf", label: "Sustainable technology" },
    ],
    cta: "Strengthen your infrastructure",
    icon: (
      <path d="M3 21h18M4 21V10M9 21V10M15 21V10M20 21V10M2.5 10h19L12 3.5 2.5 10Z" />
    ),
  },
  {
    num: "03",
    title: "SMEs & Growing Businesses",
    body:
      "Spreadsheets and manual handoffs are capping your growth. We replace them with systems you can afford now and still use at ten times the size.",
    tags: [
      { icon: "monitor", label: "Smart digital solutions" },
      { icon: "users", label: "Grows with you" },
    ],
    cta: "Plan your next stage",
    icon: <path d="M3 17.5 9 11l4 4 8-8M15 3h6v6" />,
  },
];

export function Serve() {
  return (
    <section className="serve" id="services">
      <div className="container">
        <div className="serve__head">
          <span className="eyebrow">Who We Serve</span>
          <h2>Built for organizations that cannot afford to go down.</h2>
          <p className="lede">
            If any of these describe your week, we have solved it before.
          </p>
        </div>

        <div className="serve__grid">
          {CARDS.map((c) => (
            <article
              className={c.chip ? "scard scard--featured" : "scard"}
              key={c.num}
            >
              <div className="scard__top">
                <span className="scard__icon">
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={1.8}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    {c.icon}
                  </svg>
                </span>
                <span className="scard__num" aria-hidden="true">
                  {c.num}
                </span>
              </div>

              {c.chip ? <span className="scard__chip">{c.chip}</span> : null}

              <h3>{c.title}</h3>
              <p>{c.body}</p>

              <ul className="scard__tags">
                {c.tags.map((t) => (
                  <li key={t.label}>
                    <SrvIcon name={t.icon} />
                    {t.label}
                  </li>
                ))}
              </ul>

              <a
                className="tlink"
                href="#contact"
                aria-label={`${c.cta} — ${c.title}`}
              >
                {c.cta}
                <ArrowIcon />
              </a>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
