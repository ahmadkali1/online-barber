import { addDays, addMinutes, format, isBefore, parseISO, startOfDay } from "date-fns";
import { barbers, chairs, services } from "@/src/data/catalog";
import { BUSINESS, BUSINESS_HOURS } from "@/src/config/business";
import type { Booking, BookingDraft } from "@/src/types/domain";

export const formatCurrency = (amount: number) => `${BUSINESS.currency} ${Math.round(amount)}`;
export const intervalsOverlap = (newStart: Date, newEnd: Date, existingStart: Date, existingEnd: Date) => newStart < existingEnd && newEnd > existingStart;
export const toDateTime = (date: string, time: string) => new Date(`${date}T${time}:00+04:00`);

export function calculatePrice(serviceId?: string) {
  const subtotal = services.find((service) => service.id === serviceId)?.price ?? 0;
  const discount = subtotal >= 200 ? 20 : 0;
  const tax = 0;
  return { subtotal, discount, tax, total: subtotal - discount + tax };
}

export function isDateBookable(date: Date, barberPreference?: string) {
  const today = startOfDay(new Date());
  const target = startOfDay(date);
  if (isBefore(target, today) || target > addDays(today, BUSINESS.bookingHorizonDays)) return false;
  if (!BUSINESS_HOURS[target.getDay()]) return false;
  if (barberPreference && barberPreference !== "any") {
    const barber = barbers.find((item) => item.id === barberPreference);
    return Boolean(barber?.schedule.includes(target.getDay()));
  }
  return true;
}

function barberIsFree(barberId: string, start: Date, end: Date, bookings: Booking[], excludedId?: string) {
  return !bookings.some((booking) => booking.id !== excludedId && booking.barberId === barberId && booking.status === "confirmed" && intervalsOverlap(start, end, parseISO(booking.startAt), parseISO(booking.endAt)));
}

export function qualifiedBarbers(serviceId?: string) {
  return barbers.filter((barber) => !serviceId || barber.serviceIds.includes(serviceId));
}

export function availableBarbersForSlot(serviceId: string, date: string, time: string, bookings: Booking[], excludedId?: string) {
  const service = services.find((item) => item.id === serviceId);
  if (!service) return [];
  const start = toDateTime(date, time);
  const end = addMinutes(start, service.duration);
  return qualifiedBarbers(serviceId).filter((barber) => barber.schedule.includes(start.getDay()) && barberIsFree(barber.id, start, end, bookings, excludedId));
}

export function generateTimeSlots(draft: BookingDraft, bookings: Booking[]) {
  const service = services.find((item) => item.id === draft.serviceId);
  if (!service || !draft.date) return [];
  const date = new Date(`${draft.date}T12:00:00+04:00`);
  const hours = BUSINESS_HOURS[date.getDay()];
  if (!hours) return [];
  const opening = toDateTime(draft.date, hours.open);
  const closing = toDateTime(draft.date, hours.close);
  const slots: { time: string; available: boolean }[] = [];
  for (let start = opening; addMinutes(start, service.duration) <= closing; start = addMinutes(start, BUSINESS.appointmentIntervalMinutes)) {
    const time = format(start, "HH:mm");
    const futureEnough = start.getTime() > Date.now() + 30 * 60000;
    const matching = availableBarbersForSlot(service.id, draft.date, time, bookings, draft.originalBookingId);
    const barberAvailable = draft.barberPreference === "any" ? matching.length > 0 : matching.some((barber) => barber.id === draft.barberPreference);
    slots.push({ time, available: futureEnough && barberAvailable });
  }
  return slots;
}

export function availableChairsForSlot(draft: BookingDraft, bookings: Booking[]) {
  const service = services.find((item) => item.id === draft.serviceId);
  if (!service || !draft.date || !draft.time) return [];
  const start = toDateTime(draft.date, draft.time);
  const end = addMinutes(start, service.duration);
  return chairs.map((chair) => ({
    ...chair,
    available: chair.active && !bookings.some((booking) => booking.id !== draft.originalBookingId && booking.chairId === chair.id && booking.status === "confirmed" && intervalsOverlap(start, end, parseISO(booking.startAt), parseISO(booking.endAt))),
  }));
}

export function canModifyBooking(booking: Booking) {
  return booking.status === "confirmed" && parseISO(booking.startAt).getTime() - Date.now() >= BUSINESS.cancellationWindowHours * 60 * 60 * 1000;
}

export function buildBooking(draft: BookingDraft, bookings: Booking[], customerId?: string): Booking | null {
  if (!draft.serviceId || !draft.date || !draft.time || !draft.chairId || !draft.customer) return null;
  const service = services.find((item) => item.id === draft.serviceId);
  if (!service) return null;
  const candidates = availableBarbersForSlot(draft.serviceId, draft.date, draft.time, bookings, draft.originalBookingId);
  const barberId = draft.barberPreference === "any" ? candidates[0]?.id : candidates.find((barber) => barber.id === draft.barberPreference)?.id;
  const chair = availableChairsForSlot(draft, bookings).find((item) => item.id === draft.chairId && item.available);
  if (!barberId || !chair) return null;
  const start = toDateTime(draft.date, draft.time);
  const now = new Date().toISOString();
  const pricing = calculatePrice(draft.serviceId);
  return {
    id: crypto.randomUUID(),
    confirmationNumber: `GC-${Math.random().toString(36).slice(2, 8).toUpperCase()}`,
    customerId,
    customer: draft.customer,
    serviceId: draft.serviceId,
    barberId,
    chairId: draft.chairId,
    startAt: start.toISOString(),
    endAt: addMinutes(start, service.duration).toISOString(),
    status: "confirmed",
    ...pricing,
    createdAt: now,
    updatedAt: now,
    rescheduledFromId: draft.originalBookingId,
  };
}

