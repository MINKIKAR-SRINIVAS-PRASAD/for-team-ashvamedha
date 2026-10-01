/**
 * SCHEDULE — three days of battle. Filtering, the day rail and the timeline all
 * read from this array; nothing about layout is hardcoded in the components.
 */
export interface ScheduleSlot {
  id: string;
  day: 1 | 2 | 3;
  /** 24h "HH:MM" in IST — the timeline sorts on this string. */
  time: string;
  title: string;
  venue: string;
  /** Links the slot to an event detail page when present. */
  eventSlug?: string;
  stage: string;
  status: "scheduled" | "live" | "completed";
  duration: string;
}

export const DAYS = [
  {
    day: 1 as const,
    label: "DAY 01",
    date: "09 OCT 2026",
    headline: "IGNITION",
    note: "Opening ceremony, group stages and the first eliminations.",
  },
  {
    day: 2 as const,
    label: "DAY 02",
    date: "10 OCT 2026",
    headline: "ESCALATION",
    note: "Semi-finals across the arena, track finals at first light.",
  },
  {
    day: 3 as const,
    label: "DAY 03",
    date: "11 OCT 2026",
    headline: "FINAL STAND",
    note: "Championship finals, podium ceremony and the closing arena.",
  },
];

export const SCHEDULE: ScheduleSlot[] = [
  // ---- DAY 1 ----
  { id: "d1-0900", day: 1, time: "09:00", title: "Opening Ceremony", venue: "Main Ground", stage: "Ceremony", status: "completed", duration: "45 min" },
  { id: "d1-0900-fb", day: 1, time: "09:45", title: "football — Group Stage", venue: "Main Ground", eventSlug: "football", stage: "Group A / B", status: "completed", duration: "3 hrs" },
  { id: "d1-0930-ch", day: 1, time: "09:30", title: "Kho-Kho — Rounds 1–4", venue: "Lecture Hall Complex", eventSlug: "Kho-Kho", stage: "Swiss", status: "completed", duration: "2 hrs 30 min" },
  { id: "d1-1130-bd", day: 1, time: "11:30", title: "Badminton — Round of 32", venue: "Indoor Hall", eventSlug: "Badminton", stage: "Knockout", status: "completed", duration: "2 hrs" },
  { id: "d1-1300-cr", day: 1, time: "13:00", title: "Mixed Cricket — T10 Knockout", venue: "Main Ground", eventSlug: "Mixed Cricket", stage: "Quarter-finals", status: "completed", duration: "4 hrs" },
  { id: "d1-1400-tt", day: 1, time: "14:00", title: "Table Tennis — Prelims", venue: "Indoor Hall — Bay 2", eventSlug: "table-tennis", stage: "Best of 5", status: "completed", duration: "3 hrs" },
  { id: "d1-1600-vl", day: 1, time: "16:00", title: "chess — Opening Series", venue: "Systems Lab — Chess Bay", eventSlug: "chess", stage: "Bo3", status: "completed", duration: "4 hrs" },
  { id: "d1-1900-ig", day: 1, time: "19:00", title: "Arena Ignition — Light Show", venue: "Main Ground", stage: "Ceremony", status: "completed", duration: "30 min" },

  // ---- DAY 2 ----
  { id: "d2-0630-at", day: 2, time: "06:30", title: "Swimming — Heats", venue: "Swimming Track", eventSlug: "Swimming", stage: "100m / 200m", status: "live", duration: "2 hrs" },
  { id: "d2-0700-lt", day: 2, time: "07:00", title: "Lawn Tennis Tennis — Quarter-finals", venue: "Lawn Tennis Courts", eventSlug: "Lawn Tennis-tennis", stage: "Pro-set", status: "live", duration: "3 hrs" },
  { id: "d2-0900-tt", day: 2, time: "09:00", title: "Table Tennis — Semi-finals", venue: "Indoor Hall — Bay 2", eventSlug: "table-tennis", stage: "Best of 5", status: "scheduled", duration: "2 hrs" },
  { id: "d2-1030-bb", day: 2, time: "10:30", title: "basketball — Knockout Bracket", venue: "Court 01", eventSlug: "basketball", stage: "Round of 16", status: "scheduled", duration: "3 hrs" },
  { id: "d2-1130-bd", day: 2, time: "11:30", title: "Badminton — Quarter-finals", venue: "Indoor Hall", eventSlug: "Badminton", stage: "Knockout", status: "scheduled", duration: "2 hrs" },
  { id: "d2-1330-at", day: 2, time: "13:30", title: "Swimming — Track Finals", venue: "Swimming Track", eventSlug: "Swimming", stage: "400m · Relay · Jump", status: "scheduled", duration: "2 hrs 30 min" },
  { id: "d2-1530-vb", day: 2, time: "15:30", title: "volleyball — Group Stage", venue: "Court 02", eventSlug: "volleyball", stage: "Groups", status: "scheduled", duration: "3 hrs" },
  { id: "d2-1800-fb", day: 2, time: "18:00", title: "football — Semi-final I", venue: "Main Ground", eventSlug: "football", stage: "Semi-final", status: "scheduled", duration: "2 hrs" },
  { id: "d2-2000-vl", day: 2, time: "20:00", title: "chess — Upper Bracket Final", venue: "Systems Lab — Chess Bay", eventSlug: "chess", stage: "Bo3", status: "scheduled", duration: "2 hrs" },

  // ---- DAY 3 ----
  { id: "d3-0800-gy", day: 3, time: "08:00", title: "Power Lifting — Strength Trials", venue: "Strength & Conditioning Centre", eventSlug: "Power Lifting", stage: "3-lift total", status: "scheduled", duration: "3 hrs" },
  { id: "d3-1000-bd", day: 3, time: "10:00", title: "Badminton — Finals", venue: "Indoor Hall", eventSlug: "Badminton", stage: "Gold Medal", status: "scheduled", duration: "2 hrs" },
  { id: "d3-1130-bb", day: 3, time: "11:30", title: "basketball — Final", venue: "Court 01", eventSlug: "basketball", stage: "Gold Medal", status: "scheduled", duration: "2 hrs" },
  { id: "d3-1400-vb", day: 3, time: "14:00", title: "volleyball — Final", venue: "Court 02", eventSlug: "volleyball", stage: "Gold Medal", status: "scheduled", duration: "2 hrs" },
  { id: "d3-1700-vl", day: 3, time: "17:00", title: "chess — Grand Final", venue: "Systems Lab — Chess Bay", eventSlug: "chess", stage: "Bo5", status: "scheduled", duration: "3 hrs" },
  { id: "d3-1900-fb", day: 3, time: "19:00", title: "football — Championship Final", venue: "Main Ground", eventSlug: "football", stage: "Gold Medal", status: "scheduled", duration: "2 hrs" },
  { id: "d3-2100-cl", day: 3, time: "21:00", title: "Podium & Closing Arena", venue: "Main Ground", stage: "Ceremony", status: "scheduled", duration: "60 min" },
];

export const SCHEDULE_FILTERS = [
  { id: "all", label: "All" },
  { id: "1", label: "Day 1" },
  { id: "2", label: "Day 2" },
  { id: "3", label: "Day 3" },
] as const;

export function slotsForDay(day: number) {
  return SCHEDULE.filter((s) => s.day === day).sort((a, b) => a.time.localeCompare(b.time));
}
