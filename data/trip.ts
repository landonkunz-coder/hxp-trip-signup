// =============================================================================
// TRIP CONFIG — single source of truth for all trip content.
//
// Round-2 resilience lives here. Everything the site renders about a trip is
// data, not markup. Plausible change requests are cheap:
//   • "Trip sold out, add a waitlist"  -> set mode: "waitlist" (or "sold_out")
//   • "We added a second trip"         -> add another entry to `trips` and
//                                          point FEATURED_TRIP_SLUG at it, or
//                                          render the record as a list.
// The form and CTA read `mode` and adapt their copy/behavior automatically.
// =============================================================================

export type TripMode = "open" | "waitlist" | "sold_out";

export interface ItineraryDay {
  label: string;
  title: string;
  description: string;
}

export interface Highlight {
  title: string;
  description: string;
}

export interface Trip {
  slug: string;
  name: string;
  tagline: string;
  destination: string;
  country: string;
  startDate: string; // ISO yyyy-mm-dd
  endDate: string; // ISO yyyy-mm-dd
  durationLabel: string;
  priceUSD: number;
  priceNote: string;
  mode: TripMode;
  capacity: number;
  spotsRemaining: number;
  summary: string;
  included: string[];
  notIncluded: string[];
  itinerary: ItineraryDay[];
  highlights: Highlight[];
}

export const trips: Record<string, Trip> = {
  "vanuatu-2027": {
    slug: "vanuatu-2027",
    name: "Vanuatu Build Expedition",
    tagline: "Twelve days building alongside an island community in the South Pacific.",
    destination: "Efate Island, Vanuatu",
    country: "Vanuatu",
    startDate: "2027-02-06",
    endDate: "2027-02-18",
    durationLabel: "12 days",
    priceUSD: 3450,
    priceNote: "Program fee. Covers everything in-country; excludes international airfare.",
    mode: "open",
    capacity: 24,
    spotsRemaining: 9,
    summary:
      "HXP Builders spend twelve days on Efate Island partnering with a local village to raise a rainwater catchment and classroom block — then share meals, language, and kava with the community that hosts them. No construction experience required. Just show up ready to work and to listen.",
    included: [
      "11 nights' lodging (guesthouse + village homestay)",
      "All in-country meals",
      "Airport transfers & ground transport",
      "Project materials & tools",
      "Licensed local guides & build lead",
      "24/7 in-country HXP support",
      "Cultural immersion & an excursion day",
    ],
    notIncluded: [
      "International airfare to Port Vila (VLI)",
      "Travel insurance (required)",
      "Passport & any visa fees",
      "Personal spending money",
    ],
    itinerary: [
      {
        label: "Days 1–2",
        title: "Arrive in Port Vila",
        description:
          "Land at VLI, settle into our guesthouse, and meet your team over a welcome dinner. Orientation, safety brief, and project overview.",
      },
      {
        label: "Days 3–8",
        title: "The build",
        description:
          "Travel to the village and get to work — mixing, framing, and raising a rainwater catchment and classroom block alongside local builders.",
      },
      {
        label: "Days 9–10",
        title: "Community & culture",
        description:
          "Homestay with host families, a language and cooking exchange, and a kava ceremony to celebrate the work together.",
      },
      {
        label: "Day 11",
        title: "Reef & rest",
        description:
          "A well-earned day on the water — snorkeling the reef and debriefing what we built and what it means.",
      },
      {
        label: "Day 12",
        title: "Departure",
        description:
          "Final breakfast, reflections, and transfer back to VLI for onward flights home.",
      },
    ],
    highlights: [
      {
        title: "Real, lasting work",
        description:
          "Every trip leaves behind infrastructure the community chose and helped design — not a photo op.",
      },
      {
        title: "No experience needed",
        description:
          "Local build leads teach you everything on site. Willing hands matter more than skills.",
      },
      {
        title: "Small teams, real bonds",
        description:
          "Capped at 24 Builders, so you actually know your team — and your hosts — by the end.",
      },
      {
        title: "Supported end to end",
        description:
          "Vetted lodging, licensed guides, and 24/7 HXP staff in-country. Your family can always reach you.",
      },
    ],
  },
};

export const FEATURED_TRIP_SLUG = "vanuatu-2027";

export function getFeaturedTrip(): Trip {
  return trips[FEATURED_TRIP_SLUG];
}

// ---- Deterministic formatters (UTC) to avoid SSR/CSR hydration drift -------

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

function parseISO(iso: string): { y: number; m: number; d: number } {
  const [y, m, d] = iso.split("-").map((n) => parseInt(n, 10));
  return { y, m, d };
}

/** "February 6–18, 2027" (or spans months/years gracefully). */
export function formatDateRange(startISO: string, endISO: string): string {
  const s = parseISO(startISO);
  const e = parseISO(endISO);
  if (s.y === e.y && s.m === e.m) {
    return `${MONTHS[s.m - 1]} ${s.d}–${e.d}, ${s.y}`;
  }
  if (s.y === e.y) {
    return `${MONTHS[s.m - 1]} ${s.d} – ${MONTHS[e.m - 1]} ${e.d}, ${s.y}`;
  }
  return `${MONTHS[s.m - 1]} ${s.d}, ${s.y} – ${MONTHS[e.m - 1]} ${e.d}, ${e.y}`;
}

/** "$3,450" */
export function formatPrice(n: number): string {
  return "$" + n.toLocaleString("en-US");
}
