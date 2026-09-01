export const BUSINESS = {
  name: "The Gentleman's Chair",
  tagline: "Precision cuts. Timeless style.",
  timezone: "Asia/Dubai",
  currency: "AED",
  bookingHorizonDays: 90,
  appointmentIntervalMinutes: 30,
  cancellationWindowHours: 2,
  address: "Al Wasl District, Dubai, UAE",
  phone: "+971 4 555 0188",
  email: "hello@gentlemanschair.example",
} as const;

export const BUSINESS_HOURS: Record<number, { open: string; close: string } | null> = {
  0: null,
  1: { open: "10:00", close: "22:00" },
  2: { open: "10:00", close: "22:00" },
  3: { open: "10:00", close: "22:00" },
  4: { open: "10:00", close: "22:00" },
  5: { open: "14:00", close: "22:00" },
  6: { open: "10:00", close: "22:00" },
};

export const HOURS_LABELS = [
  ["Monday – Thursday", "10:00 – 22:00"],
  ["Friday", "14:00 – 22:00"],
  ["Saturday", "10:00 – 22:00"],
  ["Sunday", "Closed"],
] as const;

