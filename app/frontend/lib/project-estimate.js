export const STATIC_RATES = Object.freeze({
  development: 5000,
  domain: 2000,
  deployment: 5000,
});

export function estimateTotal({ type, domain, deployment }) {
  if (type !== "static") return null;
  return (
    STATIC_RATES.development +
    (domain ? STATIC_RATES.domain : 0) +
    (deployment ? STATIC_RATES.deployment : 0)
  );
}
