import assert from "node:assert/strict";
import test from "node:test";
import { addDays, format } from "date-fns";
import { barbers, services } from "../src/data/catalog";
import { availableChairsForSlot, buildBooking, generateTimeSlots, intervalsOverlap, toDateTime } from "../src/utils/booking";
import type { Booking, BookingDraft } from "../src/types/domain";

function nextWorkingDate() {
  let date = addDays(new Date(), 2);
  while (![1, 2, 3, 4].includes(date.getDay())) date = addDays(date, 1);
  return format(date, "yyyy-MM-dd");
}

function existingBooking(overrides: Partial<Booking> = {}): Booking {
  const date = nextWorkingDate();
  return {
    id: "existing",
    confirmationNumber: "GC-TEST01",
    customer: { fullName: "Test Guest", email: "guest@example.com", phone: "+971 50 123 4567", contactMethod: "email" },
    serviceId: "skin-fade",
    barberId: "marcus",
    chairId: "chair-1",
    startAt: toDateTime(date, "10:00").toISOString(),
    endAt: toDateTime(date, "11:00").toISOString(),
    status: "confirmed",
    subtotal: 125,
    discount: 0,
    tax: 0,
    total: 125,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    ...overrides,
  };
}

test("detects interval overlap from either edge", () => {
  const existingStart = new Date("2026-10-01T10:00:00Z");
  const existingEnd = new Date("2026-10-01T11:00:00Z");
  assert.equal(intervalsOverlap(new Date("2026-10-01T10:30:00Z"), new Date("2026-10-01T11:00:00Z"), existingStart, existingEnd), true);
  assert.equal(intervalsOverlap(new Date("2026-10-01T09:30:00Z"), new Date("2026-10-01T10:30:00Z"), existingStart, existingEnd), true);
  assert.equal(intervalsOverlap(new Date("2026-10-01T11:00:00Z"), new Date("2026-10-01T12:00:00Z"), existingStart, existingEnd), false);
});

test("reserves the complete service duration when generating times", () => {
  const date = nextWorkingDate();
  const draft: BookingDraft = { serviceId: "skin-fade", barberPreference: "marcus", date };
  const slots = generateTimeSlots(draft, [existingBooking()]);
  assert.equal(slots.find((slot) => slot.time === "10:00")?.available, false);
  assert.equal(slots.find((slot) => slot.time === "10:30")?.available, false);
  assert.equal(slots.find((slot) => slot.time === "11:00")?.available, true);
});

test("calculates chair conflicts independently from barber conflicts", () => {
  const date = nextWorkingDate();
  const draft: BookingDraft = { serviceId: "skin-fade", barberPreference: barbers[1].id, assignedBarberId: barbers[1].id, date, time: "10:30" };
  const availability = availableChairsForSlot(draft, [existingBooking()]);
  assert.equal(availability.find((chair) => chair.id === "chair-1")?.available, false);
  assert.equal(availability.find((chair) => chair.id === "chair-2")?.available, true);
});

test("assigns an actual qualified barber before confirmation", () => {
  const date = nextWorkingDate();
  const draft: BookingDraft = {
    serviceId: services[0].id,
    barberPreference: "any",
    assignedBarberId: barbers[0].id,
    date,
    time: "12:00",
    chairId: "chair-2",
    customer: { fullName: "Test Guest", email: "guest@example.com", phone: "+971 50 123 4567", contactMethod: "email" },
  };
  const booking = buildBooking(draft, []);
  assert.ok(booking);
  assert.ok(barbers.some((barber) => barber.id === booking.barberId && barber.serviceIds.includes(booking.serviceId)));
});

test("rejects a replacement slot without mutating the original booking", () => {
  const date = nextWorkingDate();
  const original = existingBooking();
  const draft: BookingDraft = {
    serviceId: "skin-fade",
    barberPreference: "marcus",
    date,
    time: "10:30",
    chairId: "chair-1",
    customer: original.customer,
    originalBookingId: "another-booking",
  };
  const replacement = buildBooking(draft, [original]);
  assert.equal(replacement, null);
  assert.equal(original.status, "confirmed");
});
