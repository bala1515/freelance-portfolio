export const localToday = () =>
  new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Kolkata",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
export const money = (value) =>
  Number(value || 0).toLocaleString("en-IN", {
    style: "currency",
    currency: "INR",
  });
export async function workspaceRequest(url, options = {}) {
  const response = await fetch(url, {
    ...options,
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      "X-CSRF-Token":
        document.querySelector('meta[name="csrf-token"]')?.content || "",
    },
  });
  if (!response.headers.get("content-type")?.includes("application/json"))
    throw new Error("Refresh the page to reconnect to your workspace.");
  const result = await response.json();
  if (!response.ok)
    throw new Error(
      result.errors?.join(". ") ||
        "Unable to complete the request. Please try again.",
    );
  return result;
}
