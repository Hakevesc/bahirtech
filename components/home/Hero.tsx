import { ArrowIcon } from "./icons";

export function Hero() {
  return (
    <section className="hero">
      {/* Interactive globe + ocean, full-bleed behind the hero. Decorative: it
          carries no information the copy does not, and it cannot be operated
          from the keyboard. three.js renders into #gl / #globeContainer. */}
      <div className="hero__bg" id="stage" aria-hidden="true">
        <canvas id="gl" />
        <div id="globeContainer" />
      </div>
      <div className="hero__scrim" aria-hidden="true" />

      <div className="container hero__inner">
        <div className="hero__mid">
          <div className="hero__copy">
            <span className="eyebrow">Bahir Tech</span>
            <h1>
              Connecting Ethiopia to the World,{" "}
              <span className="accent">Again</span>
            </h1>
            <p className="lede">
              Downtime, security gaps and disconnected systems cost you more
              than technology ever will. We build and secure the systems your
              operations run on — and stay accountable for them.
            </p>

            <div className="hero__cta">
              <a href="#contact" className="btn btn--primary">
                Talk to an Expert
                <ArrowIcon />
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}