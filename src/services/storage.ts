import { addDays, setHours, setMinutes } from "date-fns";
import type { Booking, Review, UserProfile } from "@/src/types/domain";
import { reviews as seedReviews } from "@/src/data/catalog";

const STORAGE_KEY = "gentlemans-chair:v1";
const SESSION_KEY = "gentlemans-chair:session";

interface AppData { version: 1; bookings: Booking[]; reviews: Review[]; profile: UserProfile | null }

function makeSeedBookings(): Booking[] {
  const next = setMinutes(setHours(addDays(new Date(), 3), 16), 0);
  const previous = setMinutes(setHours(addDays(new Date(), -14), 13), 30);
  const customer = { fullName: "Demo Customer", email: "demo@gentlemanschair.example", phone: "+971 50 555 0101", contactMethod: "email" as const };
  return [
    { id: "demo-upcoming", confirmationNumber: "GC-DEMO24", customerId: "demo-user", customer, serviceId: "skin-fade", barberId: "marcus", chairId: "chair-2", startAt: next.toISOString(), endAt: new Date(next.getTime() + 60 * 60000).toISOString(), status: "confirmed", subtotal: 125, discount: 0, tax: 0, total: 125, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
    { id: "demo-completed", confirmationNumber: "GC-PAST18", customerId: "demo-user", customer, serviceId: "hot-towel", barberId: "yusuf", chairId: "chair-4", startAt: previous.toISOString(), endAt: new Date(previous.getTime() + 45 * 60000).toISOString(), status: "completed", subtotal: 110, discount: 0, tax: 0, total: 110, createdAt: previous.toISOString(), updatedAt: previous.toISOString() },
  ];
}

const fallback = (): AppData => ({ version: 1, bookings: makeSeedBookings(), reviews: seedReviews, profile: null });

export const storageRepository = {
  load(): AppData {
    if (typeof window === "undefined") return fallback();
    try {
      const parsed = JSON.parse(localStorage.getItem(STORAGE_KEY) || "null") as AppData | null;
      if (!parsed || parsed.version !== 1 || !Array.isArray(parsed.bookings) || !Array.isArray(parsed.reviews)) return fallback();
      return parsed;
    } catch {
      localStorage.removeItem(STORAGE_KEY);
      return fallback();
    }
  },
  save(data: AppData) {
    if (typeof window === "undefined") return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  },
  loadSession(): { userId?: string } {
    if (typeof window === "undefined") return {};
    try { return JSON.parse(sessionStorage.getItem(SESSION_KEY) || "{}"); } catch { return {}; }
  },
  saveSession(userId?: string) {
    if (typeof window === "undefined") return;
    if (userId) sessionStorage.setItem(SESSION_KEY, JSON.stringify({ userId }));
    else sessionStorage.removeItem(SESSION_KEY);
  },
};

