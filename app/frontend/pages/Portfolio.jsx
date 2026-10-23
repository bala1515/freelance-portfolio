import React, { useEffect, useState } from "react";
import ProjectEstimator from "../components/ProjectEstimator";
import { MotionHeading, DraggableChip } from "../components/PortfolioMotion";
import {
  ArrowUpRight,
  ArrowRight,
  Menu,
  X,
  Plus,
  Send,
  Code2,
  Monitor,
  Search,
  Layers3,
  Wrench,
  Sparkles,
} from "lucide-react";
const EMAIL = "balabharathiprofessional@gmail.com";
const WHATSAPP = "https://wa.me/919361985078";
const CASE_STUDY = "/work/salon-billing-app";
const BILLING = "/qmnrofoqrygpvip/billing";
const services = [
  {
    title: "Business websites",
    text: "A distinctive website that explains what you do and gives your next customer a clear way to get in touch.",
    icon: Monitor,
    style: "browser",
    label: "Your next customer starts here",
  },
  {
    title: "Custom web applications",
    text: "A connected workspace built around your day-to-day work, from customer records to billing and business reports.",
    icon: Layers3,
    style: "app",
    label: "Less admin. More doing.",
  },
  {
    title: "Website improvements",
    text: "Give an existing website a fresh direction with clearer layouts, better mobile usability, and useful new features.",
    icon: Wrench,
    style: "calendar",
    label: "A little better, every detail",
  },
  {
    title: "SEO foundations",
    text: "Page titles, descriptions, sitemaps, structured data, and public content that help search engines understand your site.",
    icon: Search,
    style: "search",
    label: "Make the right introduction",
  },
  {
    title: "Interface development",
    text: "Thoughtful screens and responsive components that make a product easier to understand and a pleasure to use.",
    icon: Sparkles,
    style: "type",
    label: "Small details. Big difference.",
  },
  {
    title: "API integrations",
    text: "Connect your interface, backend, and the services your business needs, with validation and useful error handling.",
    icon: Code2,
    style: "code",
    label: "Everything, talking together",
  },
];
const faqs = [
  [
    "What can you build for my business?",
    "Business websites, landing pages, portfolios, and custom web applications. My Newbilling project connects salon billing, memberships, customers, staff, and reporting in one workspace.",
  ],
  [
    "Do you work with businesses outside Sivakasi?",
    "Yes. I’m based in Sivakasi, Tamil Nadu, and can discuss projects remotely. Send a brief with your goals and we can work out the next steps.",
  ],
  [
    "How much will my project cost?",
    "The scope decides the price. Tell me the pages, features, integrations, and timeline you have in mind. I’ll discuss the requirements with you before agreeing the work.",
  ],
  [
    "Can you improve a website I already have?",
    "Yes. Share your current website and what is not working for you. We can look at the design, mobile experience, content, or functionality and choose the right changes.",
  ],
  [
    "Will I work directly with you?",
    "Yes. You’ll speak directly with Bala Bharathi, the developer planning the interface and writing the code.",
  ],
];
function ServiceArt({ type, label }) {
  return (
    <div className={`eb-service-art eb-art-${type}`} aria-hidden="true">
      {type === "browser" && (
        <div className="eb-mini-browser">
          <div>
            ● ● ● <span>yourbusiness.site</span>
          </div>
          <b>
            YOUR NEXT
            <br />
            BIG THING.
          </b>
          <i>Let’s make it happen ↗</i>
        </div>
      )}
      {type === "app" && (
        <div className="eb-mini-app">
          <span>
            YOUR WORKSPACE <i>● Live</i>
          </span>
          <div>
            <b>
              One place.
              <br />
              Clearer days.
            </b>
            <aside>
              ▥<small>Reports</small>
            </aside>
          </div>
          <footer>
            <i />
            <i />
            <i />
            <i />
            <i />
          </footer>
        </div>
      )}
      {type === "calendar" && (
        <div className="eb-mini-calendar">
          <b>The next chapter</b>
          <div>
            {Array.from({ length: 21 }, (_, i) => (
              <span key={i} className={i === 11 ? "marked" : ""}>
                {i + 1}
              </span>
            ))}
          </div>
          <em>looking good ✓</em>
        </div>
      )}
      {type === "search" && (
        <div className="eb-mini-search">
          <span>⌕ &nbsp; web developer in Sivakasi</span>
          <small>YOUR BUSINESS</small>
          <b>Make a good first impression.</b>
          <i>A clearer website. A useful next step.</i>
        </div>
      )}
      {type === "type" && (
        <div className="eb-mini-type">
          <small>YOUR BRAND, YOUR WAY</small>
          <b>
            Aa<span>↗</span>
          </b>
          <div>
            <i />
            <i />
            <i />
            <i />
          </div>
        </div>
      )}
      {type === "code" && (
        <div className="eb-mini-code">
          <span>● ● ●</span>
          <p>
            <i>const</i> idea = <em>"what if?"</em>;<br />
            <br />
            <i>build</i>({`{`}
            <br />
            &nbsp; design: <em>"thoughtful"</em>,<br />
            &nbsp; details: <em>"considered"</em>
            <br />
            {`}`});
          </p>
        </div>
      )}
      <span className="eb-art-label">{label}</span>
    </div>
  );
}
export default function Portfolio() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [brief, setBrief] = useState({ name: "", email: "", idea: "" });
  const [sending, setSending] = useState(false);
  const [status, setStatus] = useState({ error: false, text: "" });

  useEffect(() => {
    const id = window.location.hash.slice(1);
    if (id)
      document.getElementById(id)?.scrollIntoView({ behavior: "instant" });
  }, []);

  useEffect(() => {
    const root = document.querySelector(".eb-site");
    if (!root || !window.IntersectionObserver) return;
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (media.matches) return;
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("eb-is-visible");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12 },
    );
    root
      .querySelectorAll(
        ".eb-motion-heading, .eb-service, .eb-notepad, .eb-project-preview, .eb-process article, .eb-form, .eb-estimate-form, .eb-receipt-stage",
      )
      .forEach((node, index) => {
        node.classList.add("eb-scroll-reveal");
        node.style.setProperty(
          "--reveal-delay",
          `${node.classList.contains("eb-service") ? (index % 3) * 80 : 0}ms`,
        );
        observer.observe(node);
      });
    root.classList.add("eb-motion-ready");
    const disableMotion = () => {
      if (media.matches) root.classList.remove("eb-motion-ready");
    };
    media.addEventListener("change", disableMotion);
    return () => {
      observer.disconnect();
      root.classList.remove("eb-motion-ready");
      media.removeEventListener("change", disableMotion);
    };
  }, []);

  useEffect(() => {
    if (!menuOpen) return;
    const close = (e) => {
      if (e.key === "Escape") setMenuOpen(false);
    };
    document.addEventListener("keydown", close);
    return () => document.removeEventListener("keydown", close);
  }, [menuOpen]);
  const sendBrief = async (e) => {
    e.preventDefault();
    if (sending) return;
    setSending(true);
    setStatus({ error: false, text: "" });
    try {
      const response = await fetch("/contact/enquiries", {
        method: "POST",
        credentials: "same-origin",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          "X-CSRF-Token":
            document.querySelector('meta[name="csrf-token"]')?.content || "",
        },
        body: JSON.stringify(brief),
      });
      const result = await response.json();
      if (!response.ok)
        throw new Error(result.error || "Unable to send. Please try again.");
      setStatus({ error: false, text: result.message });
      setBrief({ name: "", email: "", idea: "" });
    } catch (error) {
      setStatus({
        error: true,
        text: error.message || "Unable to send. Please contact me on WhatsApp.",
      });
    } finally {
      setSending(false);
    }
  };
  return (
    <div className="eb-site">
      <a href="#main" className="eb-skip">
        Skip to content
      </a>
      <header className="eb-header">
        <a className="eb-logo" href="#home" aria-label="Built by Bala home">
          <span>
            BUILT
            <br />
            BY
          </span>
          <b>BALA</b>
        </a>
        <nav className="eb-desktop-nav" aria-label="Main navigation">
          <a href="#about">About</a>
          <a href="#services">Services</a>
          <a href="#work">Work</a>
          <a href="#estimate">Estimate</a>
          <a href="#faq">FAQs</a>
        </nav>
        <div className="eb-header-actions">
          <a className="eb-pill eb-call" href="#contact">
            <span className="eb-avatar">
              <img src="/portfolio/bala-relaxed-v2.png" alt="" />
              <i />
            </span>
            Let’s talk <ArrowUpRight size={18} />
          </a>
          <button
            className="eb-menu-button"
            aria-label={menuOpen ? "Close navigation" : "Open navigation"}
            aria-expanded={menuOpen}
            aria-controls="portfolio-menu"
            onClick={() => setMenuOpen(!menuOpen)}
          >
            {menuOpen ? <X /> : <Menu />}
          </button>
        </div>
        {menuOpen && (
          <nav
            className="eb-menu"
            id="portfolio-menu"
            aria-label="Expanded navigation"
          >
            {[
              ["Home", "home"],
              ["About", "about"],
              ["Services", "services"],
              ["Work", "work"],
              ["Estimate", "estimate"],
              ["FAQs", "faq"],
              ["Contact", "contact"],
            ].map(([label, id]) => (
              <a key={id} href={`#${id}`} onClick={() => setMenuOpen(false)}>
                {label}
                <ArrowUpRight />
              </a>
            ))}
          </nav>
        )}
      </header>
      <main id="main">
        <section
          className="eb-hero eb-blue eb-grid"
          id="home"
          aria-labelledby="hero-title"
        >
          <div className="eb-shell eb-hero-grid">
            <div className="eb-hero-copy">
              <p className="eb-eyebrow">
                <span /> INDEPENDENT DEVELOPER. BIG IDEAS.
              </p>
              <MotionHeading as="h1" id="hero-title">
                BIG IDEAS.
                <br />
                BETTER
                <br />
                <span>LANDINGS.</span>
              </MotionHeading>
              <p className="eb-hero-intro">
                I’m Bala Bharathi, a freelance web developer based in Sivakasi.
                I build distinctive websites and business software that turn
                your “what if” into something that works.
              </p>
              <div className="eb-hero-buttons">
                <a className="eb-pill" href="#contact">
                  Tell me your idea <ArrowUpRight />
                </a>
                <a className="eb-pill eb-outline" href="#work">
                  See what I build <ArrowRight />
                </a>
              </div>
            </div>
            <div className="eb-hero-person">
              <p className="eb-hand">
                your idea. my code.
                <br />
                let’s make it happen <span>↴</span>
              </p>
              <span className="eb-orbit eb-orbit-one" />
              <span className="eb-orbit eb-orbit-two" />
              <span className="eb-person-spark">✳</span>
              <img
                className="eb-person"
                src="/portfolio/bala-relaxed-v2.png"
                alt="Illustrated avatar of Bala Bharathi"
                width="408"
                height="612"
              />
              <span className="eb-person-label">
                BALA BHARATHI <i>●</i>
                <small>THE PERSON BEHIND THE BUILD</small>
              </span>
            </div>
          </div>
          <div className="eb-hero-bottom">
            <span>BASED IN SIVAKASI. BUILDING BEYOND.</span>
            <a href="#services">GOOD THINGS BELOW ↓</a>
          </div>
        </section>
        <section
          className="eb-capabilities eb-shell"
          aria-label="Development capabilities"
        >
          <p>Good ideas meet the right tools.</p>
          <div>
            <span>Ruby on Rails</span>
            <span>
              React<span className="eb-tool-star">✳</span>
            </span>
            <span>MySQL</span>
            <span>
              Vite<span className="eb-tool-arrow">↗</span>
            </span>
            <span>Custom code.</span>
          </div>
        </section>
        <section
          className="eb-problem eb-shell"
          aria-labelledby="problem-title"
        >
          <div>
            <span className="eb-kicker">LET’S START WITH YOU</span>
            <MotionHeading id="problem-title">
              SOUND
              <br />
              FAMILIAR?
            </MotionHeading>
            <p>
              You have a business to run. Your website and everyday tools should
              make that easier.
            </p>
            <span className="eb-hand eb-yellow-note">
              we can do better than this.
            </span>
          </div>
          <div className="eb-notepad">
            <div className="eb-notepad-top" />
            {[
              "Your website doesn’t feel like your business anymore.",
              "It looks good on a laptop. On a phone? Not so much.",
              "Customer details live in one too many spreadsheets.",
              "Simple everyday tasks take more clicks than they should.",
              "You have a good idea, but need someone to build it.",
            ].map((t, index) => (
              <div
                className="eb-note-row"
                key={t}
                style={{ "--cross-delay": `${index * 260}ms` }}
              >
                <span className="eb-note-cross" aria-hidden="true">
                  <svg viewBox="0 0 32 32" fill="none">
                    <path
                      className="eb-cross-first"
                      d="M8 7 C12 12 19 20 25 25"
                    />
                    <path
                      className="eb-cross-second"
                      d="M25 7 C20 13 13 21 7 25"
                    />
                  </svg>
                </span>
                <p>{t}</p>
              </div>
            ))}
          </div>
        </section>
        <section
          className="eb-work eb-shell"
          id="work"
          aria-labelledby="work-title"
        >
          <div className="eb-section-head">
            <div>
              <span className="eb-hand">less talk. more building.</span>
              <MotionHeading id="work-title">
                A REAL BUILD.
                <br />A <span>CLOSER LOOK.</span>
              </MotionHeading>
            </div>
            <a className="eb-pill eb-pill-blue" href={CASE_STUDY}>
              Read the case study <ArrowUpRight />
            </a>
          </div>
          <div className="eb-project-grid">
          <article className="eb-project-card">
            <a className="eb-salon-preview" href="/projects/vettri-academy" aria-label="View Vettri Academy website preview">
              <div className="eb-preview-top"><span>● ● ●</span><span>vettri academy / coaching centre</span><ArrowUpRight /></div>
              <img className="eb-salon-cover-image" src="https://images.unsplash.com/photo-1503676260728-1c00da094a0b?auto=format&fit=crop&w=900&q=85" alt="Study books and stationery in the Vettri Academy coaching centre website concept." width="900" height="600" loading="lazy" />
            </a>
            <div className="eb-project-caption">
              <div><span>EDUCATION / COACHING CENTRE WEBSITE</span><h3>Tuition and exam preparation.</h3><p>A Tamil Nadu coaching centre concept with course filters, opening times, a Google reviews section, and a demo enquiry form.</p></div>
              <a href="/projects/vettri-academy">View website <ArrowUpRight size={20} /><small>Public concept preview · No sign-in</small></a>
            </div>
          </article>
          <article className="eb-project-card">
            <a className="eb-salon-preview" href="/projects/aara-interiors" aria-label="View Aara Interiors website preview">
              <div className="eb-preview-top"><span>● ● ●</span><span>aara interiors / studio concept</span><ArrowUpRight /></div>
              <img className="eb-salon-cover-image" src="https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=900&q=85" alt="Warm, light-filled interior featured in the Aara Interiors website concept." width="900" height="600" loading="lazy" />
            </a>
            <div className="eb-project-caption">
              <div><span>INTERIOR DESIGN / STUDIO WEBSITE</span><h3>Modern interior design.</h3><p>An interior design website with room photos that change on scroll, project filters, and material options.</p></div>
              <a href="/projects/aara-interiors">View website <ArrowUpRight size={20} /><small>Public concept preview · No sign-in</small></a>
            </div>
          </article>
          <article className="eb-project-card">
            <a className="eb-salon-preview" href="/projects/abc-salon" aria-label="View ABC Salon website preview">
              <div className="eb-preview-top"><span>● ● ●</span><span>abc salon / website concept</span><ArrowUpRight /></div>
              <img className="eb-salon-cover-image" src="/portfolio/abc-salon-preview.png" alt="ABC Salon website with its animated 3D clipper and scissors hero." width="699" height="654" loading="lazy" />
            </a>
            <div className="eb-project-caption">
              <div><span>SALON WEBSITE / REACT & INTERACTIVE 3D</span><h3>A fresh look. Online.</h3><p>An animated salon website with 3D tools, service filters, a style gallery, and salon details.</p></div>
              <a href="/projects/abc-salon">View website <ArrowUpRight size={20} /><small>Public concept preview · No sign-in</small></a>
            </div>
          </article>
          <article className="eb-project-card">
          <a className="eb-project-preview" href={CASE_STUDY}>
            <div className="eb-preview-top">
              <span>● ● ●</span>
              <span>newbilling / salon workspace</span>
              <ArrowUpRight />
            </div>
            <img
              src="/portfolio/newbilling-preview.jpg"
              alt="Newbilling salon application with services, customer details, and bill summary. Sample data shown."
              width="1265"
              height="1220"
              loading="lazy"
            />
            <span className="eb-project-sticker">
              from the first service
              <br />
              to the final bill ↗
            </span>
          </a>
          <div className="eb-project-caption">
            <div>
              <span>SALON MANAGEMENT / FULL-STACK APPLICATION</span>
              <h3>A better day at the salon.</h3>
              <p>
                Billing, memberships, customers, staff, and reporting. One
                connected workspace.
              </p>
            </div>
            <a href={BILLING}>
              Open the application <ArrowUpRight size={20} />
              <small>Sign-in required</small>
            </a>
          </div>
          </article>
          </div>
        </section>
        <section className="eb-fix eb-blue eb-grid">
          <div className="eb-shell">
            <span className="eb-hand">a little clarity goes a long way ↘</span>
            <MotionHeading>
              LET’S MAKE
              <br />
              IT <span>CLICK.</span>
            </MotionHeading>
            <div className="eb-fix-bottom">
              <p>
                A thoughtful website. A useful application. The right details,
                connected properly. I work directly with you, from the first
                conversation to the finished build.
              </p>
              <a className="eb-pill" href={CASE_STUDY}>
                Inside a real project <ArrowUpRight />
              </a>
            </div>
            <div className="eb-work-ribbon" aria-hidden="true">
              <span>
                DESIGN THAT FEELS RIGHT ✳ CODE THAT DOES THE WORK ✳ DETAILS
                THAT MATTER ✳
              </span>
            </div>
          </div>
        </section>
        <section
          className="eb-services eb-shell"
          id="services"
          aria-labelledby="services-title"
        >
          <div className="eb-section-head">
            <div>
              <span className="eb-hand">the things I can help with</span>
              <MotionHeading id="services-title">
                FROM IDEA
                <br />
                TO <span>“IT’S LIVE.”</span>
              </MotionHeading>
            </div>
            <p>
              Websites and software built around your business. You’ll speak
              directly with the person doing the work.
            </p>
          </div>
          <div className="eb-service-grid">
            {services.map((s) => (
              <article className="eb-service" key={s.title}>
                <ServiceArt type={s.style} label={s.label} />
                <div className="eb-service-body">
                  <s.icon size={24} />
                  <h3>{s.title}</h3>
                  <p>{s.text}</p>
                  <a href="#contact">
                    Let’s discuss it <ArrowUpRight size={19} />
                  </a>
                </div>
              </article>
            ))}
          </div>
        </section>
        <section className="eb-included eb-blue eb-grid">
          <div className="eb-shell">
            <span className="eb-hand">the details come with it</span>
            <MotionHeading>
              THOUGHT THROUGH.
              <br />
              BUILT <span>WITH CARE.</span>
            </MotionHeading>
            <div className="eb-chip-cloud">
              {[
                "Responsive layouts",
                "Custom development",
                "SEO foundations",
                "Clear navigation",
                "Useful integrations",
                "Server validation",
                "Considered details",
                "Direct communication",
                "Your business, your way",
              ].map((t, i) => (
                <DraggableChip key={t} index={i}>
                  {t}
                </DraggableChip>
              ))}
            </div>
          </div>
        </section>
        <ProjectEstimator
          onEnquire={(summary) => {
            setBrief((current) => ({ ...current, idea: summary }));
            document.getElementById("contact").scrollIntoView({
              behavior: window.matchMedia("(prefers-reduced-motion: reduce)")
                .matches
                ? "auto"
                : "smooth",
            });
          }}
        />

        <section className="eb-about eb-blue eb-grid" id="about">
          <div className="eb-shell eb-about-grid">
            <div className="eb-about-portrait">
              <span className="eb-hand">hello, I’m Bala! ↴</span>
              <img
                src="/portfolio/bala-relaxed-v2.png"
                alt="Bala’s illustrated developer avatar"
                width="408"
                height="612"
                loading="lazy"
              />
              <span className="eb-about-tag">SIVAKASI, TAMIL NADU ↗</span>
            </div>
            <div>
              <span className="eb-kicker">THE PERSON BEHIND THE PIXELS</span>
              <MotionHeading>
                YOUR IDEA.
                <br />
                MY <span>KIND OF PROJECT.</span>
              </MotionHeading>
              <p>
                I’m Bala Bharathi, the developer behind Built by Bala. I’m based
                in Sivakasi and build websites, web applications, and custom
                business software for businesses here and beyond.
              </p>
              <p>
                I enjoy turning everyday business problems into useful digital
                products. When we work together, you speak directly with the
                person designing the screens, writing the code, and connecting
                the dots.
              </p>
              <a className="eb-pill" href="#contact">
                Tell me what you’re thinking <ArrowUpRight />
              </a>
            </div>
          </div>
        </section>
        <section className="eb-process eb-shell">
          <span className="eb-hand">no mystery. just a clear next step.</span>
          <MotionHeading>
            A SIMPLE WAY
            <br />
            TO <span>WORK TOGETHER.</span>
          </MotionHeading>
          <div>
            {[
              [
                "01",
                "Talk it through",
                "Tell me the idea, the problem, and what a good result looks like.",
              ],
              [
                "02",
                "Make a plan",
                "Agree the requirements, design direction, scope, and next steps.",
              ],
              [
                "03",
                "Build the details",
                "Connect the interface and the business logic, with your feedback along the way.",
              ],
              [
                "04",
                "Get it out there",
                "Check the finished work and prepare it for the people who will use it.",
              ],
            ].map(([n, t, p]) => (
              <article key={n}>
                <span>{n} ↗</span>
                <h3>{t}</h3>
                <p>{p}</p>
              </article>
            ))}
          </div>
        </section>
        <section className="eb-faq eb-shell" id="faq">
          <div>
            <span className="eb-hand">a few things you might be wondering</span>
            <MotionHeading>
              GOOD
              <br />
              <span>QUESTIONS.</span>
            </MotionHeading>
            <p>
              Something else on your mind? <a href="#contact">Just ask ↗</a>
            </p>
          </div>
          <div>
            {faqs.map(([q, a]) => (
              <details key={q}>
                <summary>
                  {q}
                  <Plus size={20} />
                </summary>
                <p>{a}</p>
              </details>
            ))}
          </div>
        </section>
        <section className="eb-contact eb-blue eb-grid" id="contact">
          <div className="eb-shell eb-contact-grid">
            <div>
              <span className="eb-hand">your move ↘</span>
              <MotionHeading>
                GOT A<br />
                <span>“WHAT IF”?</span>
              </MotionHeading>
              <p>
                A rough idea is a good place to start. Tell me what you have in
                mind.
              </p>
              <a className="eb-contact-email" href={`mailto:${EMAIL}`}>
                {EMAIL}
                <ArrowUpRight size={20} />
              </a>
              <a
                className="eb-pill"
                href={`${WHATSAPP}?text=${encodeURIComponent("Hi Bala, I have a project idea I would like to discuss.")}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                Chat on WhatsApp <ArrowUpRight />
              </a>
            </div>
            <form onSubmit={sendBrief} className="eb-form">
              <h3>Let’s make something useful.</h3>
              <div className="eb-form-row">
                <label>
                  Your name
                  <input
                    name="name"
                    autoComplete="name"
                    required
                    maxLength={100}
                    placeholder="What should I call you?"
                    value={brief.name}
                    onChange={(e) =>
                      setBrief({ ...brief, name: e.target.value })
                    }
                  />
                </label>
                <label>
                  Email address
                  <input
                    name="email"
                    type="email"
                    autoComplete="email"
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
                  rows={5}
                  placeholder="A website, an app, a better way to run your business…"
                  value={brief.idea}
                  onChange={(e) => setBrief({ ...brief, idea: e.target.value })}
                />
              </label>
              <button
                className="eb-pill eb-pill-blue"
                type="submit"
                disabled={sending}
              >
                {sending ? "Sending…" : "Send your idea"}
                <Send size={18} />
              </button>
              <p
                className={`eb-form-status ${status.error ? "is-error" : ""}`}
                role={status.error ? "alert" : "status"}
                aria-live="polite"
              >
                {status.text}
              </p>
            </form>
          </div>
        </section>
      </main>
      <footer className="eb-footer">
        <div className="eb-shell">
          <a className="eb-footer-wordmark" href="#home">
            BUILT BY BALA<span>↗</span>
          </a>
          <div>
            <span>© {new Date().getFullYear()} Built by Bala</span>
            <span>Independent developer. Sivakasi & beyond.</span>
            <a href="#home">Back to top ↑</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
