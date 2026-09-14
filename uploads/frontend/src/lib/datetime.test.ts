import { describe, expect, it } from "vitest";

import {
  formatDateTime,
  formatRelativeTime,
  formatRelativeTimeLong,
  RELATIVE_TIME_CUTOFF_MINUTES,
} from "@/lib/datetime";

describe("formatDateTime", () => {
  it("omits seconds from the rendered timestamp", () => {
    const out = formatDateTime("2026-08-27T15:45:12Z");
    expect(out).not.toMatch(/:\d{2}:\d{2}/); // no HH:MM:SS
    expect(out).toMatch(/\d/);
  });

  it("returns an em dash for empty or invalid input", () => {
    expect(formatDateTime(null)).toBe("—");
    expect(formatDateTime(undefined)).toBe("—");
    expect(formatDateTime("not-a-date")).toBe("—");
  });
});

describe("formatRelativeTime", () => {
  const now = new Date("2026-08-27T12:00:00Z");

  it("reports minutes for recent events", () => {
    expect(formatRelativeTime("2026-08-27T11:59:30Z", now)).toBe("just now");
    expect(formatRelativeTime("2026-08-27T11:59:00Z", now)).toBe("1 minute ago");
    expect(formatRelativeTime("2026-08-27T11:55:00Z", now)).toBe("5 minutes ago");
  });

  it("reports hours below the 2-hour cutoff", () => {
    expect(formatRelativeTime("2026-08-27T11:00:00Z", now)).toBe("1 hour ago");
    expect(RELATIVE_TIME_CUTOFF_MINUTES).toBe(120);
  });

  it("falls back to an absolute, seconds-free timestamp at or beyond the cutoff", () => {
    const out = formatRelativeTime("2026-08-27T09:59:00Z", now); // 121 min
    expect(out).not.toMatch(/ago$/);
    expect(out).not.toMatch(/:\d{2}:\d{2}/);
  });
});

describe("formatRelativeTimeLong", () => {
  const now = new Date("2026-08-27T12:00:00Z");

  it("stays relative past the 2-hour cutoff instead of switching to absolute", () => {
    expect(formatRelativeTimeLong("2026-08-27T09:59:00Z", now)).toBe("2 hours ago"); // 121 min
    expect(formatRelativeTimeLong("2026-08-25T12:00:00Z", now)).toBe("2 days ago");
    expect(formatRelativeTimeLong("2026-08-10T12:00:00Z", now)).toBe("2 weeks ago");
    expect(formatRelativeTimeLong("2026-06-01T12:00:00Z", now)).toBe("2 months ago");
    expect(formatRelativeTimeLong("2024-08-27T12:00:00Z", now)).toBe("2 years ago");
  });

  it("keeps the short-scale phrasing", () => {
    expect(formatRelativeTimeLong("2026-08-27T11:59:30Z", now)).toBe("just now");
    expect(formatRelativeTimeLong("2026-08-27T11:00:00Z", now)).toBe("1 hour ago");
    expect(formatRelativeTimeLong("2026-08-26T12:00:00Z", now)).toBe("1 day ago");
  });

  it("returns an em dash for empty or invalid input", () => {
    expect(formatRelativeTimeLong(null)).toBe("—");
    expect(formatRelativeTimeLong("not-a-date")).toBe("—");
  });
});
