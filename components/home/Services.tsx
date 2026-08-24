import {
  ShotPlaceholderIcon,
  PhoneIcon,
  SrvIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
} from "./icons";
import { PANEL_INFRA } from "./service-panel-0";
import { PANEL_SOFTWARE } from "./service-panel-1";
import { PANEL_SECURITY } from "./service-panel-2";
import type { SrvPanel } from "./service-types";
import { ServicesScroll } from "./ServicesScroll";

const PANELS: SrvPanel[] = [PANEL_INFRA, PANEL_SOFTWARE, PANEL_SECURITY];

/**
 * OUR SERVICES — scroll-driven. The practice rail is gone; the left column now
 * carries one oversized number that counts 01 → 02 → 03 as the reader scrolls,
 * and the whole right-hand panel swaps with it.
 *
 * The section header stays in normal flow and scrolls away; only `.services__runway`
 * pins. The runway is three viewports tall, so each practice gets one screen of
 * scrolling before the next takes over.
 *
 * Markup ships in its stacked, everything-visible form. ServicesScroll adds
 * `.is-pinned` on mount, and every pinning rule in the CSS is written under that
 * class — so with scripting off, or on a narrow screen, this degrades to three
 * panels laid out one after another rather than an empty pinned frame.
 */
export function Services() {
  return (
    <section className="services" id="services-section">
      <div className="container">
        <div className="services__head">
          <div>
            <span className="eyebrow">Our Services</span>
            <h2>
              Solutions That We Offer
              <br />
              to Our Valued Clients
            </h2>
          </div>
          <p>
            Three practices, and the specific work inside each. Keep scrolling to
            move through them.
          </p>
        </div>
      </div>

      <div className="services__runway">
        <div className="services__sticky">
          <div className="container">
            <div className="services__body">
              <div className="srv-side">
                {/* The counter. All three are stacked and cross-faded, so the
                    column never resizes as the digits change. */}
                <div className="srv-num" aria-hidden="true">
                  {PANELS.map((panel, i) => (
                    <span
                      key={panel.panelId}
                      className={i === 0 ? "srv-num__n is-active" : "srv-num__n"}
                      data-srv-num={i}
                    >
                      {`0${i + 1}`}
                    </span>
                  ))}
                </div>

                <div className="srv-label">
                  {PANELS.map((panel, i) => (
                    <h3
                      key={panel.panelId}
                      className={i === 0 ? "srv-label__t is-active" : "srv-label__t"}
                      data-srv-label={i}
                    >
                      {panel.label}
                    </h3>
                  ))}
                </div>

                {/* The three.js practice icon used to sit here. Dropping it gives the
                    counter the room to run much larger, which is the whole point of the
                    column. home-fx.js registers its `srv:change` listener inside the
                    builder that runs only when `#srvIcon` exists, so removing the element
                    takes the listener with it rather than leaving a dead handler. */}

                {/* Blurb and promise card cross-fade with the counter above them, so all
                    three sets are in the DOM at once and only the active one is shown. */}
                <div className="srv-aside">
                  {PANELS.map((panel, i) => (
                      <div
                        key={panel.panelId}
                        className={i === 0 ? "srv-aside__pane is-active" : "srv-aside__pane"}
                        data-srv-aside={i}
                        aria-hidden={i !== 0}
                      >
                        <p className="srv-aside__blurb">{panel.blurb}</p>
                      </div>
                  ))}
                </div>

                {/* Step through the practices. One control for the whole section rather
                    than one per pane, so it sits outside the cross-fading asides above.
                    Each button scrolls the page to its chapter, which then feeds back
                    through the scroll handler — position stays the single source of truth.
                    Disabled at the ends rather than wrapping: this drives real page
                    scroll, and looping from 03 back to 01 would throw the reader
                    backwards through two screens with no warning. */}
                <div className="srv-nav">
                  <button
                    type="button"
                    className="srv-nav__btn"
                    id="srvPrev"
                    aria-label="Previous service"
                    disabled
                  >
                    <ChevronLeftIcon />
                  </button>
                  <button
                    type="button"
                    className="srv-nav__btn"
                    id="srvNext"
                    aria-label="Next service"
                  >
                    <ChevronRightIcon />
                  </button>
                </div>

                {/* The progress rail doubles as the keyboard route through the
                    practices — losing the old tablist would otherwise leave this
                    section reachable only by scrolling. */}
                <div
                  className="srv-steps"
                  role="tablist"
                  aria-label="Our services"
                  aria-orientation="horizontal"
                >
                  {PANELS.map((panel, i) => (
                    <button
                      key={panel.panelId}
                      type="button"
                      className={i === 0 ? "srv-step is-active" : "srv-step"}
                      id={panel.catId}
                      role="tab"
                      aria-selected={i === 0}
                      aria-controls={panel.panelId}
                      tabIndex={i === 0 ? undefined : -1}
                      data-srv-step={i}
                    >
                      <span className="srv-step__bar" aria-hidden="true" />
                      <span className="srv-step__label">{panel.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="srv-panels">
                {PANELS.map((panel, pIndex) => (
                  <div
                    key={panel.panelId}
                    className={pIndex === 0 ? "srv-panel is-active" : "srv-panel"}
                    id={panel.panelId}
                    role="tabpanel"
                    tabIndex={0}
                    aria-labelledby={panel.catId}
                    data-srv-panel={pIndex}
                  >
                    {/* Narrow screens unpin and stack the panels, which leaves the
                        counter and the practice name behind in the side column. Each
                        panel carries its own name for that case; it is hidden while
                        pinned, where the side column is doing the job. */}
                    <p className="srv-panel__name" aria-hidden="true">
                      <i>{`0${pIndex + 1}`}</i>
                      {panel.label}
                    </p>

                    <div className="srv-tabs" role="tablist" aria-label={panel.label}>
                      {panel.tabs.map((tab, tIndex) => (
                        <button
                          key={tab.id}
                          type="button"
                          className={tIndex === 0 ? "srv-tab is-active" : "srv-tab"}
                          id={tab.id}
                          role="tab"
                          aria-selected={tIndex === 0}
                          aria-controls={panel.cards[tIndex].id}
                          tabIndex={tIndex === 0 ? undefined : -1}
                        >
                          {tab.label}
                        </button>
                      ))}
                    </div>

                    {panel.cards.map((card, cIndex) => (
                      <article
                        key={card.id}
                        className={cIndex === 0 ? "srv-card is-active" : "srv-card"}
                        id={card.id}
                        role="tabpanel"
                        aria-labelledby={card.tabId}
                      >
                        <div className="srv-card__copy">
                          <h4>{card.h}</h4>
                          <p>{card.p}</p>
                          {/* The incident line is keyed to `card.urgent`, which only the
                              cybersecurity cards set. It used to key off `card.photo` —
                              which meant "cyber" only for as long as panel 2 was the one
                              panel with photographs. Once every card had one, all 13 grew
                              an "under attack" number, and the one cyber card still
                              missing a photo lost it. */}
                          <div className={card.urgent ? "srv-act" : undefined}>
                            <a href={card.href} className="btn btn--outline">
                              Learn More
                            </a>
                            {card.urgent ? (
                              <a
                                className="srv-urgent"
                                href={`tel:${card.urgent.replace(/\s/g, "")}`}
                              >
                                <PhoneIcon />
                                <span>
                                  <b>Under attack now?</b>
                                  {card.urgent}
                                </span>
                              </a>
                            ) : null}
                          </div>
                        </div>

                        <figure className="shot" data-shot="service">
                          {card.photo ? (
                            <img
                              className="shot__img"
                              src={card.photo.src}
                              alt={card.photo.alt}
                              loading="lazy"
                              decoding="async"
                            />
                          ) : (
                            <figcaption className="shot__note">
                              <ShotPlaceholderIcon />
                              <b>Service photograph</b>
                              640 × 520 · {card.note}
                            </figcaption>
                          )}
                        </figure>
                      </article>
                    ))}

                    {/* The four-up strip along the bottom of the panel. It belongs to the
                        practice, not to the item, so it stays put as the pill bar changes
                        the card above it. */}
                    <ul className="srv-feats">
                      {panel.features.map((f) => (
                        <li className="srv-feat" key={f.title}>
                          <span className="srv-feat__ico">
                            <SrvIcon name={f.icon} />
                          </span>
                          <div>
                            <b>{f.title}</b>
                            <p>{f.body}</p>
                          </div>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* scripting off: nothing pins and nothing swaps, so show every card of every
          panel and drop the pill bars that would have picked between them */}
      <noscript>
        <style>{`.srv-card{display:grid}.srv-tabs{display:none}.srv-card+.srv-card{margin-top:34px}`}</style>
      </noscript>

      <ServicesScroll count={PANELS.length} />
    </section>
  );
}
