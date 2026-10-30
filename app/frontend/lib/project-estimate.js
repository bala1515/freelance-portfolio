export const STATIC_RATES = Object.freeze({
  development: 5000,
  domain: 2000,
  deployment: 5000,
});

export function developmentRate(scope = "1–4 pages") {
  if (scope === "5–8 pages") return 7000;
  if (scope === "More than 8 pages") return 13000;
  return STATIC_RATES.development;
}

export function estimateTotal({ type, scope, domain, deployment }) {
  if (type !== "static") return null;
  return (
    developmentRate(scope) +
    (domain ? STATIC_RATES.domain : 0) +
    (deployment ? STATIC_RATES.deployment : 0)
  );
}
