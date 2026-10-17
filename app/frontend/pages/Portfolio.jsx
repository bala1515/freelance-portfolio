import React, { lazy, Suspense, useEffect, useState } from "react";
import {
  ArrowUpRight,
  ArrowDown,
  Code2,
  Monitor,
  Layers3,
  ArrowRight,
  Menu,
  X,
  RotateCcw,
  Pause,
  Play,
  Check,
  Copy,
  Sparkles,
  Scissors,
  ExternalLink,
  Send,
  Plus,
} from "lucide-react";
const HeroWorkspace = lazy(() => import("../components/HeroWorkspace"));
const EMAIL = "balabharathiprofessional@gmail.com";
const WHATSAPP = "https://wa.me/919361985078";
const BILLING = "/qmnrofoqrygpvip/billing";
const services = [
  {
    number: "01",
    name: "Websites with personality.",
    text: "A distinctive home for your brand. Fast, responsive websites that make the first impression count.",
    tags: ["Business websites", "Landing pages", "Portfolios"],
    Icon: Monitor,
  },
  {
    number: "02",
    name: "Software that does the work.",
    text: "Turn your day-to-day processes into an application that fits your business. Fewer spreadsheets. Clearer workflows.",
    tags: ["Business applications", "Dashboards", "Custom workflows"],
    Icon: Layers3,
  },
  {
    number: "03",
    name: "The details that make it click.",
    text: "Thoughtful interfaces, useful integrations, and improvements that make your existing product easier to use.",
    tags: ["UI development", "API integration", "Product improvements"],
    Icon: Code2,
  },
];
function useReducedMotion() {
  const [reduced, setReduced] = useState(
    () => window.matchMedia("(prefers-reduced-motion: reduce)").matches,
  );
  useEffect(() => {
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    const change = () => setReduced(query.matches);
    query.addEventListener("change", change);
    return () => query.removeEventListener("change", change);
  }, []);
  return reduced;
}
export default function Portfolio() {
  const reducedMotion = useReducedMotion();
  const [phase, setPhase] = useState("loading");
  const [replay, setReplay] = useState(0);
  const [paused, setPaused] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [copyError, setCopyError] = useState("");
  const [brief, setBrief] = useState({ name: "", email: "", idea: "" });
  useEffect(() => {
    const nodes = document.querySelectorAll(".bb-reveal");
    const observer = new IntersectionObserver(
      (entries) =>
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
          }
        }),
      { threshold: 0.1, rootMargin: "0px 0px -40px 0px" },
    );
    nodes.forEach((node) => {
      const rect = node.getBoundingClientRect();
      if (rect.top < window.innerHeight - 60 && rect.bottom > 0) {
        node.classList.add("is-visible");
      } else {
        observer.observe(node);
      }
    });
    return () => observer.disconnect();
  }, []);
  useEffect(() => {
    let ticking = false;
    const onScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          const sy = window.scrollY || window.pageYOffset || 0;
          const heroProgress = Math.max(0, Math.min(2.0, sy / 450));
          document.documentElement.style.setProperty(
            "--hero-scroll",
            heroProgress.toFixed(4),
          );

          const hero = document.getElementById("home");
          if (hero) {
            hero.style.setProperty("--hero-scroll", heroProgress.toFixed(4));
          }

          const preview = document.querySelector(".bb-browser-frame");
          if (preview) {
            const r = preview.getBoundingClientRect();
            const winH = window.innerHeight;
            if (r.top < winH && r.bottom > 0) {
              const p = (winH - r.top) / (winH + r.height) - 0.5;
              preview.style.setProperty(
                "--preview-parallax",
                `${(p * -50).toFixed(2)}px`,
              );
            }
          }
          ticking = false;
        });
        ticking = true;
      }
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  useEffect(() => {
    if (!copied) return;
    const timeout = setTimeout(() => setCopied(false), 2500);
    return () => clearTimeout(timeout);
  }, [copied]);
  const restart = () => {
    setPaused(false);
    setReplay((value) => value + 1);
  };
  const copyEmail = async () => {
    try {
      await navigator.clipboard.writeText(EMAIL);
      setCopied(true);
      setCopyError("");
    } catch {
      setCopyError(
        "Select the email address below to copy it, or use the email link.",
      );
    }
  };
  const sendBrief = (event) => {
    event.preventDefault();
    const subject = `A project idea from ${brief.name.trim()}`;
    const body = `Hi Bala,\n\n${brief.idea.trim()}\n\nName: ${brief.name.trim()}\nEmail: ${brief.email.trim()}\n`;
    window.location.href = `mailto:${EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  };
  const closeMenu = () => setMenuOpen(false);
  return (
    <>
      <a className="bb-skip" href="#main">
        Skip to content
      </a>
      <header className="bb-header">
        <a className="bb-logo" href="#home" aria-label="Built by Bala home">
          <span className="bb-logo-mark">
            b<span>.</span>
          </span>
          <span>
            built by <strong>bala</strong>
            <i>INDEPENDENT DEVELOPER</i>
          </span>
        </a>
        <nav className="bb-desktop-nav" aria-label="Main navigation">
          <a href="#work">
            Selected work <sup>01</sup>
          </a>
          <a href="#services">What I do</a>
          <a href="#about">About me</a>
        </nav>
        <a className="bb-header-cta" href="#contact">
          Let’s talk <ArrowUpRight size={16} />
        </a>
        <button
          className="bb-menu-toggle"
          aria-label={menuOpen ? "Close navigation" : "Open navigation"}
          aria-expanded={menuOpen}
          aria-controls="portfolio-navigation"
          onClick={() => setMenuOpen(!menuOpen)}
        >
          {menuOpen ? <X /> : <Menu />}
        </button>
        {menuOpen && (
          <nav
            className="bb-mobile-nav"
            id="portfolio-navigation"
            aria-label="Mobile navigation"
            onKeyDown={(event) => {
              if (event.key === "Escape") {
                setMenuOpen(false);
                document.querySelector(".bb-menu-toggle")?.focus();
              }
            }}
          >
            <a href="#work" onClick={closeMenu}>
              Selected work
            </a>
            <a href="#services" onClick={closeMenu}>
              What I do
            </a>
            <a href="#about" onClick={closeMenu}>
              About me
            </a>
            <a href="#contact" onClick={closeMenu}>
              Let’s talk <ArrowUpRight size={16} />
            </a>
          </nav>
        )}
      </header>
      <main id="main">
        <section className="bb-hero" id="home" aria-labelledby="hero-title">
          <div className="bb-hero-copy">
            <div className="bb-eyebrow">
              <span className="bb-status-dot" /> SMALL STUDIO ENERGY. BIG IDEAS.
            </div>
            <h1 id="hero-title">
              Big ideas.
              <br />
              Better <em>landings.</em>
              <span className="bb-title-star" aria-hidden="true">
                ✳
              </span>
            </h1>
            <p>
              I’m Bala Bharathi, a freelance web developer based in Sivakasi.
              I build websites and business software that{" "}
              <strong>bring your ideas to life.</strong>
            </p>
            <div className="bb-hero-actions">
              <a className="bb-button bb-button-dark" href="#work">
                Explore my work <ArrowUpRight size={19} />
              </a>
              <a className="bb-text-link" href="#contact">
                Got an idea? <ArrowRight size={17} />
              </a>
            </div>
            <div className="bb-hero-note">
              <span className="bb-note-line" />
              <span>Thoughtfully designed. Personally built.</span>
            </div>
          </div>
          <div className={`bb-hero-scene bb-phase-${phase}`}>
            <div className="bb-scene-orbit" aria-hidden="true" />
            <div className="bb-scene-dots" aria-hidden="true" />
            <span className="bb-scene-caption">
              INTERACTIVE 3D WORKSPACE
            </span>
            <div className="bb-floating-code" aria-hidden="true">
              <Code2 size={23} />
              <span>ideas → reality</span>
            </div>
            <div className="bb-scene-stage">
              <Suspense
                fallback={
                  <div className="bb-scene-loading">
                    <span />
                    Loading workspace…
                  </div>
                }
              >
                <HeroWorkspace
                  replay={replay}
                  paused={paused}
                  reducedMotion={reducedMotion}
                  onPhase={setPhase}
                />
              </Suspense>
            </div>
            <div
              className="bb-identity"
              data-visible={phase === "ready"}
              aria-hidden={phase !== "ready"}
            >
              <span className="bb-id-clip" />
              <div className="bb-id-top">
                <Code2 size={15} />
                <span>BUILT BY BALA</span>
                <span>001</span>
              </div>
              <div className="bb-id-main">
                <div className="bb-id-avatar">b.</div>
                <div>
                  <small>HELLO, I’M</small>
                  <strong>BALA</strong>
                  <span>Developer & problem solver</span>
                </div>
              </div>
              <div className="bb-id-bottom">
                <span className="bb-id-barcode" />
                <span>IDEAS WELCOME ↗</span>
              </div>
            </div>
            <div className="bb-scene-controls">
              <button
                onClick={restart}
                disabled={reducedMotion}
                aria-label="Reset workspace view"
                title={
                  reducedMotion
                    ? "Animation disabled by reduced motion preference"
                    : "Reset workspace view"
                }
              >
                <RotateCcw size={14} />
                <span>Reset view</span>
              </button>
              <button
                onClick={() => setPaused(!paused)}
                disabled={reducedMotion}
                aria-label={
                  paused
                    ? "Resume workspace animation"
                    : "Pause workspace animation"
                }
              >
                {paused ? <Play size={14} /> : <Pause size={14} />}
              </button>
            </div>
            <span className="bb-scene-status" role="status">
              {phase === "loading"
                ? "Preparing workspace…"
                : "Interactive 3D workspace · Move pointer to explore"}
            </span>
          </div>
          <a className="bb-scroll-cue" href="#work">
            <span className="bb-scroll-circle">
              <ArrowDown size={17} />
            </span>
            <span>THERE’S MORE BELOW</span>
          </a>
          <div className="bb-hero-index" aria-hidden="true">
            DESIGN + DEVELOPMENT
            <br />
            <span>WITH A HUMAN TOUCH</span>
          </div>
        </section>
        <div className="bb-capability-strip" aria-label="Specialisms">
          <span>WEB EXPERIENCES</span>
          <span aria-hidden="true">✳</span>
          <span>BUSINESS SOFTWARE</span>
          <span aria-hidden="true">✳</span>
          <span>THOUGHTFUL INTERFACES</span>
          <span aria-hidden="true">✳</span>
          <span>BUILT WITH CARE</span>
        </div>
        <section
          className="bb-section bb-work"
          id="work"
          aria-labelledby="work-title"
        >
          <div className="bb-section-heading bb-reveal">
            <div>
              <div className="bb-eyebrow">01 / SELECTED WORK</div>
              <h2 id="work-title">
                Less talk.
                <br />
                <em>More shipped.</em>
              </h2>
            </div>
            <p>
              A closer look at something I built.
              <br />
              Real workflows. Every detail considered.
            </p>
          </div>
          <article className="bb-project bb-reveal">
            <a
              href={BILLING}
              className="bb-project-visual"
              aria-label="Open Newbilling salon management application, sign-in required"
            >
              <div className="bb-project-art-heading">
                <span>
                  <Scissors size={19} /> newbilling.
                </span>
                <span>SALON MANAGEMENT SYSTEM</span>
              </div>
              <div className="bb-browser-frame">
                <div className="bb-browser-bar">
                  <span />
                  <span />
                  <span />
                  <small>newbilling / workspace</small>
                  <ExternalLink size={12} />
                </div>
                <img
                  src="/portfolio/newbilling-preview.jpg"
                  alt="Newbilling application with a plum navigation bar, service catalogue, customer form, and bill summary. Sample data shown."
                  width="1265"
                  height="1220"
                  loading="lazy"
                />
              </div>
              <div className="bb-project-open">
                <ArrowUpRight size={26} />
              </div>
              <span className="bb-preview-caption">
                PRODUCT PREVIEW · SAMPLE DATA
              </span>
            </a>
            <div className="bb-project-info">
              <div className="bb-project-title">
                <div>
                  <span className="bb-project-kicker">
                    FEATURED BUILD / FULL-STACK APPLICATION
                  </span>
                  <h3>A better day at the salon.</h3>
                </div>
                <span className="bb-project-number">01</span>
              </div>
              <p>
                From the first haircut to the final bill. A complete workspace
                for billing, customer memberships, service management, staff
                assignments, and clear business reports.
              </p>
              <div className="bb-project-tags">
                <span>Ruby on Rails</span>
                <span>React</span>
                <span>Responsive UI</span>
              </div>
              <div className="bb-project-links">
                <a className="bb-text-link" href={BILLING}>
                  Explore the application <ArrowUpRight size={18} />
                </a>
                <small>Sign-in required</small>
              </div>
              <details className="bb-case-study">
                <summary>
                  Inside the build <Plus size={16} />
                </summary>
                <div>
                  <h4>One connected workflow.</h4>
                  <p>
                    Service prices flow into the bill, member discounts apply
                    automatically, and every saved bill contributes to the
                    reports.
                  </p>
                  <ul>
                    <li>Editable bills, history, and receipt printing</li>
                    <li>Walk-in customers and annual memberships</li>
                    <li>Staff assignments and service catalogue management</li>
                    <li>Daily, weekly, monthly, and yearly reporting</li>
                  </ul>
                  <p className="bb-case-note">
                    I built the application interface, Rails APIs, and connected
                    business workflows.
                  </p>
                </div>
              </details>
            </div>
          </article>
        </section>
        <section
          className="bb-section bb-services"
          id="services"
          aria-labelledby="services-title"
        >
          <div className="bb-section-heading bb-reveal">
            <div>
              <div className="bb-eyebrow">02 / WHAT I CAN BUILD</div>
              <h2 id="services-title">
                Your next idea.
                <br />
                <em>My kind of project.</em>
              </h2>
            </div>
            <a
              className="bb-round-link"
              href="#contact"
              aria-label="Discuss your project"
            >
              <ArrowUpRight size={27} />
            </a>
          </div>
          <div className="bb-service-list">
            {services.map(({ number, name, text, tags, Icon }) => (
              <div className="bb-service-row bb-reveal" key={number}>
                <span className="bb-service-number">{number}</span>
                <div className="bb-service-name">
                  <Icon size={23} />
                  <h3>{name}</h3>
                </div>
                <div>
                  <p>{text}</p>
                  <div className="bb-service-tags">
                    {tags.map((tag) => (
                      <span key={tag}>{tag}</span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
        <section className="bb-about" id="about" aria-labelledby="about-title">
          <div className="bb-about-inner">
            <div className="bb-about-copy bb-reveal">
              <div className="bb-eyebrow">
                03 / THE PERSON BEHIND THE PIXELS
              </div>
              <h2 id="about-title">
                Hi, I’m Bala.
                <br />I like making
                <br />
                <em>things click.</em>
              </h2>
              <p>
                I’m Bala Bharathi, the developer behind Built by Bala.
                Based in Sivakasi, I build websites, web applications, and
                custom business software for businesses in Sivakasi and beyond.
              </p>
              <p>
                When we work together, you work directly with the person
                designing the screens, writing the code, and connecting the
                dots.
              </p>
              <a className="bb-text-link" href="#contact">
                Tell me what you’re thinking <ArrowUpRight size={18} />
              </a>
            </div>
            <div className="bb-process bb-reveal">
              <span className="bb-process-label">
                A SIMPLE WAY TO WORK TOGETHER
              </span>
              {[
                {
                  n: "01",
                  title: "Understand the idea",
                  text: "We talk through your business, the people using it, and what a good result looks like.",
                },
                {
                  n: "02",
                  title: "Make it tangible",
                  text: "I shape the flow and interface so we can agree on the direction before building.",
                },
                {
                  n: "03",
                  title: "Build, refine, launch",
                  text: "We review real progress, work through the details, and get your project ready to use.",
                },
              ].map((item) => (
                <div className="bb-process-step" key={item.n}>
                  <span>{item.n}</span>
                  <div>
                    <h3>{item.title}</h3>
                    <p>{item.text}</p>
                  </div>
                </div>
              ))}
              <div className="bb-process-signature">
                <Sparkles size={18} />
                <span>Good communication. Thoughtful execution.</span>
              </div>
            </div>
          </div>
        </section>
        <section
          className="bb-section bb-contact"
          id="contact"
          aria-labelledby="contact-title"
        >
          <div className="bb-contact-copy bb-reveal">
            <div className="bb-eyebrow">04 / YOUR MOVE</div>
            <h2 id="contact-title">
              Got a <em>“what if”?</em>
              <br />
              Let’s build it<span>.</span>
            </h2>
            <p>
              A rough idea is a good place to start.
              <br />
              Tell me what you have in mind.
            </p>
            <a className="bb-email" href={`mailto:${EMAIL}`}>
              {EMAIL}
              <ArrowUpRight size={18} />
            </a>
            <div className="bb-contact-links">
              <a
                href={`${WHATSAPP}?text=${encodeURIComponent("Hi Bala, I have a project idea I would like to discuss.")}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                Chat on WhatsApp <ArrowUpRight size={15} />
              </a>
              <button onClick={copyEmail}>
                {copied ? <Check size={14} /> : <Copy size={14} />}{" "}
                {copied ? "Email copied" : "Copy email"}
              </button>
            </div>
            <p className="bb-copy-status" role="status">
              {copied ? "Email address copied to clipboard." : copyError}
            </p>
          </div>
          <form className="bb-contact-form bb-reveal" onSubmit={sendBrief}>
            <span className="bb-form-title">A little about your idea</span>
            <div className="bb-form-row">
              <label>
                Your name
                <input
                  autoComplete="name"
                  name="name"
                  required
                  maxLength={100}
                  placeholder="What should I call you?"
                  value={brief.name}
                  onChange={(e) => setBrief({ ...brief, name: e.target.value })}
                />
              </label>
              <label>
                Email address
                <input
                  type="email"
                  autoComplete="email"
                  name="email"
                  required
                  maxLength={254}
                  placeholder="you@company.com"
                  value={brief.email}
                  onChange={(e) =>
                    setBrief({ ...brief, email: e.target.value })
                  }
                />
              </label>
            </div>
            <label>
              What are you thinking?
              <textarea
                name="idea"
                required
                maxLength={2000}
                rows={4}
                placeholder="A website, an app, a better way to run your business…"
                value={brief.idea}
                onChange={(e) => setBrief({ ...brief, idea: e.target.value })}
              />
            </label>
            <div className="bb-form-bottom">
              <small>Opens your email app with your project brief.</small>
              <button className="bb-button bb-button-dark" type="submit">
                Let’s talk <Send size={16} />
              </button>
            </div>
          </form>
        </section>
      </main>
      <footer className="bb-footer">
        <a href="#home" className="bb-footer-brand">
          built by <strong>bala.</strong>
          <ArrowUpRight size={19} />
        </a>
        <span>Ideas welcome. Always.</span>
        <span>© {new Date().getFullYear()} Built by Bala</span>
        <a href="#home" className="bb-back-top">
          Back to top <ArrowUpRight size={15} />
        </a>
      </footer>
    </>
  );
}
