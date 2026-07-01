import OpeningHours from "opening_hours";

export type OpenStatus = "open" | "closed" | "unknown";

export function getOpenStatus(openingHours: string | null): OpenStatus {
  if (!openingHours) return "unknown";

  try {
    const oh = new OpeningHours(openingHours);
    const state = oh.getStateString(undefined, false);
    if (state === "open") return "open";
    if (state === "close") return "closed";
    return "unknown";
  } catch {
    return "unknown";
  }
}
