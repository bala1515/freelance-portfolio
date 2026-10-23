import React, { useState } from "react";
import { ArrowRight, ArrowUpRight, RotateCcw, Printer } from "lucide-react";
import { STATIC_RATES, estimateTotal } from "../lib/project-estimate";
const money = (value) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value);
const initial = {
  type: "static",
  scope: "1–4 pages",
  domain: true,
  deployment: true,
};
export default function ProjectEstimator({ onEnquire }) {
  const [selection, setSelection] = useState(initial);
  const [step, setStep] = useState(0);
  const [revision, setRevision] = useState(0);
  const total = estimateTotal(selection);
  const update = (changes) => {
    setSelection((current) => ({ ...current, ...changes }));
    setRevision((n) => n + 1);
  };
  const summary = `Project estimate\nType: ${selection.type === "static" ? "Static website" : "Custom web application"}\nScope: ${selection.scope}\nDevelopment: ${total === null ? "Quote after discussion" : money(STATIC_RATES.development)}\nDomain: ${selection.domain ? (total === null ? "Required — quote separately" : money(STATIC_RATES.domain)) : "Already have / not required"}\nDeployment: ${selection.deployment ? (total === null ? "Required — quote separately" : money(STATIC_RATES.deployment)) : "Already arranged"}\nEstimate: ${total === null ? "Custom quote" : money(total)}\nPlease confirm the scope and final quote with me.`;
  const printReceipt = () => {
    document.body.classList.add("printing-estimate");
    try {
      window.print();
    } finally {
      document.body.classList.remove("printing-estimate");
    }
  };
  return (
    <section
      className="eb-estimator eb-blue eb-grid"
      id="estimate"
      aria-labelledby="estimate-title"
    >
      <div className="eb-shell">
        <div className="eb-section-head">
          <div>
            <span className="eb-hand">a little clarity before we start ↘</span>
            <h2 id="estimate-title">
              YOUR IDEA.
              <br />
              <span>ON PAPER.</span>
            </h2>
          </div>
          <p>
            Choose what you need. Watch your estimate print itself. No signup;
            nothing is sent until you submit an enquiry.
          </p>
        </div>
        <div className="eb-estimate-grid">
          <div className="eb-estimate-form">
            <div className="eb-estimate-progress">
              <span>STEP {step + 1} / 3</span>
              <div>
                <i style={{ width: `${((step + 1) / 3) * 100}%` }} />
              </div>
            </div>
            <fieldset className="eb-estimate-step" key={step}>
              <legend>
                {
                  [
                    "What are we building?",
                    "How much room does your idea need?",
                    "What else should I take care of?",
                  ][step]
                }
              </legend>
              {step === 0 && (
                <div className="eb-estimate-options">
                  {[
                    [
                      "static",
                      "A static business website",
                      "A portfolio, landing page, or business website.",
                      "DEVELOPMENT ₹5,000",
                    ],
                    [
                      "app",
                      "A custom web application",
                      "Billing, accounts, dashboards, or a connected workflow.",
                      "CUSTOM QUOTE",
                    ],
                  ].map(([value, title, description, price]) => (
                    <label
                      className={`eb-estimate-choice ${selection.type === value ? "selected" : ""}`}
                      key={value}
                    >
                      <input
                        type="radio"
                        name="project-type"
                        value={value}
                        checked={selection.type === value}
                        onChange={() =>
                          update({
                            type: value,
                            scope:
                              value === "static"
                                ? "1–4 pages"
                                : "Core workflow",
                          })
                        }
                      />
                      <span>
                        <strong>{title}</strong>
                        <small>{description}</small>
                        <b>{price}</b>
                      </span>
                    </label>
                  ))}
                </div>
              )}
              {step === 1 && (
                <>
                  <p className="eb-estimate-hint">
                    {selection.type === "static"
                      ? "A rough page count is enough. We’ll confirm the scope together; this choice does not add an automatic fee."
                      : "Choose the level of functionality to discuss. App pricing is quoted after we understand the requirements."}
                  </p>
                  <div className="eb-estimate-options">
                    {(selection.type === "static"
                      ? ["1–4 pages", "5–8 pages", "More than 8 pages"]
                      : [
                          "Core workflow",
                          "Multiple connected workflows",
                          "Integrations & advanced features",
                        ]
                    ).map((scope) => (
                      <label
                        key={scope}
                        className={`eb-estimate-choice ${selection.scope === scope ? "selected" : ""}`}
                      >
                        <input
                          type="radio"
                          name="project-scope"
                          checked={selection.scope === scope}
                          onChange={() => update({ scope })}
                        />
                        <span>
                          <strong>{scope}</strong>
                        </span>
                      </label>
                    ))}
                  </div>
                </>
              )}
              {step === 2 && (
                <div className="eb-estimate-options">
                  {[
                    [
                      "domain",
                      "Domain setup",
                      "I need a domain for this project.",
                      STATIC_RATES.domain,
                    ],
                    [
                      "deployment",
                      "Deployment",
                      "Set up and publish the finished website.",
                      STATIC_RATES.deployment,
                    ],
                  ].map(([key, title, description, price]) => (
                    <label
                      key={key}
                      className={`eb-estimate-choice ${selection[key] ? "selected" : ""}`}
                    >
                      <input
                        type="checkbox"
                        checked={selection[key]}
                        onChange={(e) => update({ [key]: e.target.checked })}
                      />
                      <span>
                        <strong>{title}</strong>
                        <small>{description}</small>
                        <b>
                          {selection.type === "static"
                            ? money(price)
                            : "QUOTE SEPARATELY"}
                        </b>
                      </span>
                    </label>
                  ))}
                  <p className="eb-estimate-hint">
                    Already have a domain or deployment arranged? Untick it
                    here.
                  </p>
                </div>
              )}
            </fieldset>
            <div className="eb-estimate-actions">
              {step > 0 && (
                <button
                  type="button"
                  className="eb-estimate-back"
                  onClick={() => setStep(step - 1)}
                >
                  ← Back
                </button>
              )}
              {step < 2 ? (
                <button
                  type="button"
                  className="eb-pill eb-pill-blue"
                  onClick={() => setStep(step + 1)}
                >
                  Next <ArrowRight size={18} />
                </button>
              ) : (
                <button
                  type="button"
                  className="eb-pill eb-pill-blue"
                  onClick={() => onEnquire(summary)}
                >
                  Discuss this estimate <ArrowUpRight size={18} />
                </button>
              )}
            </div>
          </div>
          <aside
            className="eb-receipt-stage"
            aria-label="Your project estimate"
          >
            <div className="eb-printer-slot">
              <span>BUILT BY BALA / ESTIMATE STUDIO</span>
              <i />
            </div>
            <div className="eb-receipt-feed">
              <article className="eb-receipt" key={revision}>
                <header>
                  <span className="eb-receipt-brand">
                    BUILT BY BALA<span>✳</span>
                  </span>
                  <p>PROJECT ESTIMATE</p>
                  <small>
                    SIVAKASI · INDIA
                    <br />
                    builtbybala.site
                  </small>
                </header>
                <div className="eb-receipt-meta">
                  <span>PROJECT</span>
                  <b>
                    {selection.type === "static"
                      ? "STATIC WEBSITE"
                      : "CUSTOM APPLICATION"}
                  </b>
                </div>
                <dl className="eb-receipt-lines">
                  <div>
                    <dt>Development</dt>
                    <dd>
                      {total === null
                        ? "To discuss"
                        : money(STATIC_RATES.development)}
                    </dd>
                  </div>
                  <div>
                    <dt>Domain</dt>
                    <dd>
                      {selection.domain
                        ? total === null
                          ? "To discuss"
                          : money(STATIC_RATES.domain)
                        : "Not included"}
                    </dd>
                  </div>
                  <div>
                    <dt>Deployment</dt>
                    <dd>
                      {selection.deployment
                        ? total === null
                          ? "To discuss"
                          : money(STATIC_RATES.deployment)
                        : "Not included"}
                    </dd>
                  </div>
                  <div>
                    <dt>Scope</dt>
                    <dd>{selection.scope}</dd>
                  </div>
                </dl>
                <div className="eb-receipt-total">
                  <span>ESTIMATE</span>
                  <strong>
                    {total === null ? "Custom quote" : money(total)}
                  </strong>
                  <svg viewBox="0 0 220 75" aria-hidden="true">
                    <ellipse cx="110" cy="37" rx="102" ry="29" />
                  </svg>
                </div>
                <p className="eb-receipt-fine">
                  Planning estimate, not an invoice. Final price and scope
                  agreed before work starts. Ongoing hosting, renewals, and any
                  taxes confirmed separately.
                </p>
                <div className="eb-receipt-barcode" aria-hidden="true" />
                <footer>
                  GOOD IDEAS START WITH A CONVERSATION.
                  <br />
                  THANK YOU FOR THINKING OF BALA.
                </footer>
              </article>
            </div>
            <span className="eb-receipt-caption eb-hand">
              a first draft of something good.
            </span>
          </aside>
        </div>
        <div className="eb-estimate-tools">
          <button
            type="button"
            onClick={() => {
              setSelection(initial);
              setStep(0);
              setRevision((n) => n + 1);
            }}
          >
            <RotateCcw size={15} /> Start again
          </button>
          <button type="button" onClick={printReceipt}>
            <Printer size={16} /> Print estimate
          </button>
        </div>
        <p className="eb-estimate-live" aria-live="polite" aria-atomic="true">
          {selection.type === "static"
            ? `Static website estimate: ${money(total)}.`
            : "Custom application: quote after discussion."}
        </p>
      </div>
    </section>
  );
}
