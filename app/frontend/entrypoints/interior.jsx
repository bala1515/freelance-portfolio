import React, { useEffect, useRef, useState } from "react";
import { createRoot } from "react-dom/client";
import "../styles/interior.css";
import InteriorRoom from "../components/InteriorRoom";

const photo = (id, width = 1400) => `https://images.unsplash.com/${id}?auto=format&fit=crop&w=${width}&q=85`;
const projects = [
  { name: "Modern living room", category: "Residential", type: "Living room", image: "photo-1600210492486-724fe5c67fb0", alt: "Light-filled living room with natural textures and neutral seating", text: "A living room concept with comfortable seating, wood furniture, and plenty of natural light.", materials: "Oak · Linen · Neutral colours" },
  { name: "Open kitchen and dining", category: "Residential", type: "Kitchen & dining", image: "photo-1600607687920-4e2a09cf159d", alt: "Airy contemporary interior with a warm natural material palette", text: "An open-plan interior concept with practical storage, easy-to-clean surfaces, and space for family meals.", materials: "Natural stone · Oak · Brushed metal" },
  { name: "Modern office", category: "Commercial", type: "Studio & workspace", image: "photo-1497366754035-f200968a6e72", alt: "Bright workspace with plants and generous daylight", text: "An office concept with shared desks, meeting areas, indoor plants, and good natural lighting.", materials: "Timber · Plants · Natural light" },
];

function Arrow() { return <span aria-hidden="true">↗</span>; }
function Interior() {
  const [menu, setMenu] = useState(false);
  const [filter, setFilter] = useState("All spaces");
  const [selected, setSelected] = useState(null);
  const dialog = useRef(null);
  const projectTrigger = useRef(null);
  useEffect(() => {
    const observer = new IntersectionObserver(entries => entries.forEach(entry => {
      if (entry.isIntersecting) { entry.target.classList.add("is-visible"); observer.unobserve(entry.target); }
    }), { threshold: 0.08 });
    document.querySelectorAll(".ai-reveal").forEach(el => observer.observe(el));
    return () => observer.disconnect();
  }, []);
  useEffect(() => {
    if (!selected) return;
    dialog.current.showModal();
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = previous; projectTrigger.current?.focus(); };
  }, [selected]);
  const closeProject = () => { dialog.current?.close(); setSelected(null); };
  return <div className="ai-page">
    <a className="ai-skip" href="#ai-main">Skip to content</a>
    <header className="ai-nav">
      <a className="ai-brand" href="#top" aria-label="Aara Interiors home">aara<span>INTERIORS & SPACES</span></a>
      <nav className={menu ? "is-open" : ""} aria-label="Main navigation" id="ai-navigation">
        {[["About us", "philosophy"], ["Projects", "spaces"], ["Services", "services"]].map(([label, id]) => <a href={`#${id}`} key={id} onClick={() => setMenu(false)}>{label}</a>)}
      </nav>
      <a className="ai-nav-cta" href="#conversation">Contact <Arrow /></a>
      <button className="ai-menu" aria-expanded={menu} aria-controls="ai-navigation" onClick={() => setMenu(!menu)}>{menu ? "Close −" : "Menu +"}</button>
    </header>
    <main id="ai-main">
      <InteriorRoom />
      <section className="ai-intro ai-shell ai-reveal" id="philosophy">
        <p className="ai-eyebrow">01 / ABOUT US</p>
        <div><h2>Interior design that<br /><em>works for you.</em></h2><div className="ai-intro-bottom"><span className="ai-line-symbol" aria-hidden="true">⌁</span><p>We plan interiors around your needs, available space, and budget. From room layouts to furniture and finishes, we help you choose what works for your home or business.</p></div></div>
      </section>
      <section className="ai-spaces ai-shell" id="spaces">
        <div className="ai-section-head ai-reveal"><div><p className="ai-eyebrow">02 / DESIGN CONCEPTS</p><h2>Explore our<br /><em>design concepts.</em></h2></div><p>Browse residential and commercial interiors.<br />Select a project to see the details.</p></div>
        <div className="ai-filters" role="group" aria-label="Filter spaces">{["All spaces", "Residential", "Commercial"].map(value => <button key={value} aria-pressed={filter === value} onClick={() => setFilter(value)}>{value}</button>)}</div>
        <p className="ai-sr" role="status">{projects.filter(p => filter === "All spaces" || p.category === filter).length} spaces shown</p>
        <div className="ai-projects">{projects.filter(p => filter === "All spaces" || p.category === filter).map((project) => <button className="ai-project" key={project.name} onClick={event => { projectTrigger.current = event.currentTarget; setSelected(project); }}>
          <div className="ai-project-photo"><img src={photo(project.image, 1000)} alt={project.alt} width="900" height="1000" loading="lazy" /><span className="ai-project-open" aria-hidden="true">↗</span></div><div className="ai-project-label"><div><span>{project.category} / {project.type}</span><h3>{project.name}</h3></div><Arrow /></div>
        </button>)}</div>
        <p className="ai-image-note">These are design concepts using reference photos, not completed client projects.</p>
      </section>
      <section className="ai-services" id="services"><div className="ai-shell ai-services-grid">
        <div className="ai-service-heading ai-reveal"><p className="ai-eyebrow">03 / OUR SERVICES</p><h2>Design support<br /><em>from start to finish.</em></h2><p>We help with room planning, material selection, furniture, lighting, and finishing details.</p><a className="ai-text-link" href="#conversation">Discuss your requirements <Arrow /></a></div>
        <div className="ai-service-list">{[
          ["01", "Residential interiors", "Room layouts, kitchen design, storage, furniture, and finishes for apartments and houses."],
          ["02", "Commercial spaces", "Interior planning for offices, shops, and other business spaces."],
          ["03", "Styling & finishing", "Furniture, curtains, lighting, wall colours, and accessories to complete your room."],
        ].map(([number, name, text]) => <article key={number} className="ai-reveal"><span>{number}</span><div><h3>{name}</h3><p>{text}</p></div><Arrow /></article>)}</div>
      </div></section>
      <section className="ai-materials ai-shell ai-reveal"><div className="ai-material-photo"><img src={photo("photo-1600210491892-03d54c0aaf87", 1100)} alt="Soft neutral furnishings and tactile details in a contemporary living space" width="1100" height="1100" loading="lazy" /></div><div className="ai-material-copy"><p className="ai-eyebrow">MATERIALS AND FINISHES</p><h2>Choose materials<br /><em>that suit your space.</em></h2><p>Compare wood finishes, fabrics, wall colours, and flooring. We help you select materials based on appearance, maintenance, and cost.</p><div className="ai-swatches" aria-label="Material palette: warm oak, soft linen, earthy clay, olive green"><span /><span /><span /><span /></div><span className="ai-material-note">WARM OAK / SOFT LINEN / EARTH / OLIVE</span></div></section>
      <section className="ai-process ai-shell ai-reveal"><div className="ai-section-head"><div><p className="ai-eyebrow">04 / HOW IT WORKS</p><h2>A clear process.<br /><em>Three simple steps.</em></h2></div></div><div className="ai-steps">{[["01", "Share your requirements", "Tell us about your space, budget, preferred style, and timeline."], ["02", "Review the design", "Review room layouts, colour options, furniture, and materials."], ["03", "Plan the next steps", "Finalise the design, confirm the scope, and plan purchases and installation."]].map(([n, title, text]) => <article key={n}><span>{n}</span><h3>{title}</h3><p>{text}</p></article>)}</div></section>
      <section className="ai-contact" id="conversation"><div className="ai-shell"><p className="ai-eyebrow">CONTACT</p><h2>Need a website for<br /><em>your interior business?</em></h2><a className="ai-button ai-button-light" href="/#contact">Discuss a website like this <Arrow /></a><p>Aara Interiors is a studio concept designed by Built by Bala.<br />Have an interiors business? Let’s build your online home.</p><span className="ai-contact-flower" aria-hidden="true">✳</span></div></section>
    </main>
    <footer className="ai-footer ai-shell"><a className="ai-brand" href="#top">aara<span>INTERIORS & SPACES</span></a><span>Interior design for homes and businesses.</span><a href="/#work">A concept by Built by Bala <Arrow /></a><a href="#top">Back to top ↑</a></footer>
    {selected && <dialog ref={dialog} className="ai-dialog" onCancel={event => { event.preventDefault(); closeProject(); }} onClick={event => { if (event.target === event.currentTarget) closeProject(); }} aria-labelledby="ai-dialog-title"><button className="ai-dialog-close" onClick={closeProject} aria-label="Close project">×</button><img src={photo(selected.image, 1200)} alt={selected.alt} /><div className="ai-dialog-copy"><p className="ai-eyebrow">{selected.category} / CONCEPT EXPLORATION</p><h2 id="ai-dialog-title">{selected.name}</h2><p>{selected.text}</p><span>{selected.materials}</span><p className="ai-image-note">Editorial inspiration photograph. Not a completed client project.</p><a className="ai-text-link" href="#conversation" onClick={closeProject}>Let’s talk about your space <Arrow /></a></div></dialog>}
  </div>;
}
createRoot(document.getElementById("interior-root")).render(<Interior />);
