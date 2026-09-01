"use client";

import { useEffect, useMemo, useState } from "react";
import { Link, useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { addDays, addMinutes, format, parseISO } from "date-fns";
import { ArrowLeft, ArrowRight, CalendarDays, Check, CheckCircle2, Clock3, Scissors, Sparkles, UserRound } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { NativeSelect, NativeSelectOption } from "@/components/ui/native-select";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { BUSINESS } from "@/src/config/business";
import { barbers, chairs, services } from "@/src/data/catalog";
import { useAppStore } from "@/src/store/app-store";
import { availableBarbersForSlot, availableChairsForSlot, buildBooking, calculatePrice, formatCurrency, generateTimeSlots, isDateBookable } from "@/src/utils/booking";
import type { ContactMethod, CustomerDetails } from "@/src/types/domain";
import { Stars } from "@/src/components/shared";

const steps = [
  ["Service", "/book/service"], ["Barber", "/book/barber"], ["Date", "/book/date"], ["Time", "/book/time"], ["Chair", "/book/chair"], ["Details", "/book/details"], ["Summary", "/book/summary"],
] as const;

const customerSchema = z.object({
  fullName: z.string().trim().min(2, "Enter your full name").max(80),
  email: z.string().trim().email("Enter a valid email").max(100),
  phone: z.string().trim().regex(/^\+?[0-9\s-]{8,18}$/, "Enter a valid phone number"),
  notes: z.string().trim().max(300, "Keep notes under 300 characters").optional(),
  contactMethod: z.enum(["email", "phone", "sms"]),
});

export function BookingPage() {
  const pathname = useLocation().pathname; const navigate = useNavigate(); const [params] = useSearchParams();
  const { draft, updateDraft, bookings, profile, userId, resetDraft, addBooking, rescheduleBooking } = useAppStore();
  const currentIndex = Math.max(0, steps.findIndex(([, href]) => pathname === href));
  const [availabilityState, setAvailabilityState] = useState<"ready" | "loading" | "error">("ready");

  useEffect(() => {
    const serviceId = params.get("service"); const barberId = params.get("barber");
    const updates: Record<string, unknown> = {};
    if (serviceId && services.some((service) => service.id === serviceId)) updates.serviceId = serviceId;
    if (barberId && barbers.some((barber) => barber.id === barberId)) updates.barberPreference = barberId;
    if (!draft.customer && profile) updates.customer = { fullName: `${profile.firstName} ${profile.lastName}`, email: profile.email, phone: profile.phone, contactMethod: profile.contactMethod };
    if (!draft.barberPreference && profile?.preferredBarberId) updates.barberPreference = profile.preferredBarberId;
    if (Object.keys(updates).length) updateDraft(updates);
  }, [params, profile]);

  const next = (path: string) => navigate(path);
  const selectedService = services.find((service) => service.id === draft.serviceId);
  const selectedBarber = barbers.find((barber) => barber.id === (draft.assignedBarberId || draft.barberPreference));
  const pricing = calculatePrice(draft.serviceId);

  const confirm = () => {
    const booking = buildBooking(draft, bookings, userId);
    if (!booking) { toast.error("That time is no longer available. Your original booking is unchanged."); navigate("/book/time"); return; }
    if (draft.originalBookingId) rescheduleBooking(draft.originalBookingId, booking); else addBooking(booking);
    resetDraft();
    navigate(`/booking/confirmation/${booking.id}`);
  };

  return <section className="booking-page"><div className="page-shell booking-heading"><span className="eyebrow">Book your appointment</span><h1>{draft.originalBookingId ? "Reschedule with confidence." : "Your chair, on your time."}</h1><p>{draft.originalBookingId ? "Your original appointment stays active until the new time is confirmed." : "Complete each step and review every detail before confirming."}</p></div>
    <div className="booking-stepper-wrap"><ol className="booking-stepper page-shell" aria-label="Booking progress">{steps.map(([label, href], index) => <li key={href} className={index === currentIndex ? "current" : index < currentIndex ? "done" : ""}><span>{index < currentIndex ? <Check /> : index + 1}</span><small>{label}</small></li>)}</ol></div>
    <div className="page-shell booking-layout"><div className="booking-workspace">
      {pathname === "/book/service" && <ServiceStep selected={draft.serviceId} onSelect={(serviceId) => updateDraft({ serviceId, barberPreference: undefined, assignedBarberId: undefined, date: undefined, time: undefined, chairId: undefined })} />}
      {pathname === "/book/barber" && <BarberStep serviceId={draft.serviceId} selected={draft.barberPreference} onSelect={(barberPreference) => updateDraft({ barberPreference, assignedBarberId: undefined, date: undefined, time: undefined, chairId: undefined })} />}
      {pathname === "/book/date" && <DateStep selected={draft.date} barberPreference={draft.barberPreference} onSelect={(date) => updateDraft({ date, time: undefined, chairId: undefined, assignedBarberId: undefined })} />}
      {pathname === "/book/time" && <TimeStep draft={draft} bookings={bookings} state={availabilityState} setState={setAvailabilityState} onSelect={(time, assignedBarberId) => updateDraft({ time, assignedBarberId, chairId: undefined })} />}
      {pathname === "/book/chair" && <ChairStep draft={draft} bookings={bookings} onSelect={(chairId) => updateDraft({ chairId })} />}
      {pathname === "/book/details" && <DetailsStep initial={draft.customer || (profile ? { fullName: `${profile.firstName} ${profile.lastName}`, email: profile.email, phone: profile.phone, contactMethod: profile.contactMethod } : undefined)} onComplete={(customer) => { updateDraft({ customer }); next("/book/summary"); }} />}
      {pathname === "/book/summary" && <SummaryStep draft={draft} onConfirm={confirm} />}
      {pathname !== "/book/details" && pathname !== "/book/summary" ? <div className="step-actions"><Button variant="ghost" onClick={() => currentIndex === 0 ? navigate("/") : navigate(steps[currentIndex - 1][1])}><ArrowLeft /> {currentIndex === 0 ? "Exit" : "Back"}</Button><Button onClick={() => navigate(steps[currentIndex + 1][1])} disabled={!canContinue(currentIndex, draft)}>Continue <ArrowRight /></Button></div> : null}
    </div><aside className="booking-summary-side"><BookingSummary service={selectedService} barber={selectedBarber} date={draft.date} time={draft.time} chairId={draft.chairId} pricing={pricing} /></aside></div>
  </section>;
}

function canContinue(index: number, draft: ReturnType<typeof useAppStore.getState>["draft"]) {
  return index === 0 ? Boolean(draft.serviceId) : index === 1 ? Boolean(draft.barberPreference) : index === 2 ? Boolean(draft.date) : index === 3 ? Boolean(draft.time && draft.assignedBarberId) : index === 4 ? Boolean(draft.chairId) : true;
}

function ServiceStep({ selected, onSelect }: { selected?: string; onSelect: (id: string) => void }) {
  return <div><StepHeader number="01" title="Select a service" copy="Choose one ritual. You can review the full price before confirming." /><div className="selection-grid services-select">{services.map((service) => <button key={service.id} className={`selection-card ${selected === service.id ? "selected" : ""}`} onClick={() => onSelect(service.id)} aria-pressed={selected === service.id}><span className="selection-check"><Check /></span><small>{service.category}</small><h3>{service.name}</h3><p>{service.description}</p><div><span><Clock3 /> {service.duration} min</span><strong>{formatCurrency(service.price)}</strong></div></button>)}</div></div>;
}

function BarberStep({ serviceId, selected, onSelect }: { serviceId?: string; selected?: string; onSelect: (id: string) => void }) {
  const compatible = barbers.filter((barber) => !serviceId || barber.serviceIds.includes(serviceId));
  if (!serviceId) return <MissingStep href="/book/service" label="Choose a service first" />;
  return <div><StepHeader number="02" title="Choose your barber" copy="Pick a specialist or let us assign the best available match." /><div className="selection-grid barber-select"><button className={`selection-card any-barber ${selected === "any" ? "selected" : ""}`} onClick={() => onSelect("any")} aria-pressed={selected === "any"}><span className="selection-check"><Check /></span><span className="any-icon"><Sparkles /></span><small>Fastest option</small><h3>Any available barber</h3><p>We'll match your service and time with a qualified specialist, then show the assignment before confirmation.</p></button>{compatible.map((barber) => <button className={`selection-card barber-choice ${selected === barber.id ? "selected" : ""}`} key={barber.id} onClick={() => onSelect(barber.id)} aria-pressed={selected === barber.id}><span className="selection-check"><Check /></span><img src={barber.image} alt="" /><span><small>{barber.title}</small><h3>{barber.name}</h3><Stars value={barber.rating} count={barber.reviewCount} /></span></button>)}</div></div>;
}

function DateStep({ selected, barberPreference, onSelect }: { selected?: string; barberPreference?: string; onSelect: (date: string) => void }) {
  const days = Array.from({ length: 14 }, (_, index) => addDays(new Date(), index));
  const min = format(new Date(), "yyyy-MM-dd"); const max = format(addDays(new Date(), BUSINESS.bookingHorizonDays), "yyyy-MM-dd");
  if (!barberPreference) return <MissingStep href="/book/barber" label="Choose a barber first" />;
  return <div><StepHeader number="03" title="Choose a date" copy="Book up to 90 days ahead. Sundays and unavailable barber days are closed." /><div className="date-strip">{days.map((date) => { const value = format(date, "yyyy-MM-dd"); const available = isDateBookable(date, barberPreference); return <button key={value} disabled={!available} className={selected === value ? "selected" : ""} onClick={() => onSelect(value)} aria-label={`${format(date, "EEEE, d MMMM")}${available ? "" : ", unavailable"}`}><small>{format(date, "EEE")}</small><strong>{format(date, "d")}</strong><span>{available ? format(date, "MMM") : "Closed"}</span></button>; })}</div><div className="calendar-field"><Label htmlFor="booking-date">Or choose any date within 90 days</Label><Input id="booking-date" type="date" min={min} max={max} value={selected || ""} onChange={(event) => { const date = new Date(`${event.target.value}T12:00:00`); if (isDateBookable(date, barberPreference)) onSelect(event.target.value); else toast.error("That date is closed or unavailable for this barber."); }} /></div></div>;
}

function TimeStep({ draft, bookings, state, setState, onSelect }: { draft: ReturnType<typeof useAppStore.getState>["draft"]; bookings: ReturnType<typeof useAppStore.getState>["bookings"]; state: string; setState: (state: "ready" | "loading" | "error") => void; onSelect: (time: string, barberId: string) => void }) {
  const slots = useMemo(() => generateTimeSlots(draft, bookings), [draft, bookings]);
  if (!draft.date || !draft.serviceId || !draft.barberPreference) return <MissingStep href="/book/date" label="Choose a valid date first" />;
  if (state === "loading") return <div><StepHeader number="04" title="Finding open times" copy="Checking the full service duration against barber schedules." /><div className="time-grid">{Array.from({ length: 12 }, (_, index) => <Skeleton key={index} className="time-skeleton" />)}</div></div>;
  if (state === "error") return <div><StepHeader number="04" title="Times are temporarily unavailable" copy="Nothing in your booking has been lost." /><Button onClick={() => setState("ready")}>Try again</Button></div>;
  const choose = (time: string) => { const candidates = availableBarbersForSlot(draft.serviceId!, draft.date!, time, bookings, draft.originalBookingId); const assigned = draft.barberPreference === "any" ? candidates[0] : candidates.find((barber) => barber.id === draft.barberPreference); if (assigned) onSelect(time, assigned.id); };
  return <div><StepHeader number="04" title="Choose a start time" copy={`${format(new Date(`${draft.date}T12:00:00`), "EEEE, d MMMM")} · times shown in Dubai (GST).`} />{slots.some((slot) => slot.available) ? <div className="time-grid">{slots.map((slot) => <button key={slot.time} disabled={!slot.available} className={draft.time === slot.time ? "selected" : ""} onClick={() => choose(slot.time)}><Clock3 />{slot.time}<small>{slot.available ? "Available" : "Unavailable"}</small></button>)}</div> : <div className="inline-empty"><CalendarDays /><h3>No available appointments for this date.</h3><p>Try another day or choose Any Available Barber.</p></div>}{draft.assignedBarberId ? <div className="assignment-note"><CheckCircle2 /><span><small>Your barber for this time</small><strong>{barbers.find((barber) => barber.id === draft.assignedBarberId)?.name}</strong></span></div> : null}</div>;
}

function ChairStep({ draft, bookings, onSelect }: { draft: ReturnType<typeof useAppStore.getState>["draft"]; bookings: ReturnType<typeof useAppStore.getState>["bookings"]; onSelect: (id: string) => void }) {
  if (!draft.time) return <MissingStep href="/book/time" label="Choose a time first" />;
  const availability = availableChairsForSlot(draft, bookings);
  return <div><StepHeader number="05" title="Choose your chair" copy="Availability is specific to your selected date, time, and full service duration." /><div className="chair-grid">{availability.map((chair) => <button key={chair.id} disabled={!chair.available} className={draft.chairId === chair.id ? "selected" : ""} onClick={() => onSelect(chair.id)}><span className="chair-visual"><i /><i /></span><span><small>{chair.available ? "Available" : "Reserved"}</small><h3>{chair.name}</h3><p>{chair.description}</p></span><span className="selection-check"><Check /></span></button>)}</div></div>;
}

function DetailsStep({ initial, onComplete }: { initial?: CustomerDetails; onComplete: (values: CustomerDetails) => void }) {
  const navigate = useNavigate();
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<CustomerDetails>({ resolver: zodResolver(customerSchema), defaultValues: initial || { fullName: "", email: "", phone: "", notes: "", contactMethod: "email" } });
  return <form onSubmit={handleSubmit(onComplete)} noValidate><StepHeader number="06" title="Your details" copy="We'll use these details for your booking confirmation. No payment is collected online." /><div className="details-form"><FormField label="Full name" error={errors.fullName?.message}><Input id="fullName" autoComplete="name" {...register("fullName")} aria-invalid={Boolean(errors.fullName)} /></FormField><div className="form-two"><FormField label="Email" error={errors.email?.message}><Input id="email" type="email" autoComplete="email" {...register("email")} aria-invalid={Boolean(errors.email)} /></FormField><FormField label="Phone" error={errors.phone?.message}><Input id="phone" type="tel" autoComplete="tel" placeholder="+971 50 123 4567" {...register("phone")} aria-invalid={Boolean(errors.phone)} /></FormField></div><FormField label="Preferred contact"><NativeSelect id="contactMethod" {...register("contactMethod")}><NativeSelectOption value="email">Email</NativeSelectOption><NativeSelectOption value="sms">SMS</NativeSelectOption><NativeSelectOption value="phone">Phone call</NativeSelectOption></NativeSelect></FormField><FormField label="Notes for your barber" error={errors.notes?.message}><Textarea id="notes" placeholder="Style goals, sensitivities, accessibility needs…" maxLength={300} {...register("notes")} /></FormField></div><div className="step-actions"><Button type="button" variant="ghost" onClick={() => navigate("/book/chair")}><ArrowLeft /> Back</Button><Button disabled={isSubmitting}>Review booking <ArrowRight /></Button></div></form>;
}

function SummaryStep({ draft, onConfirm }: { draft: ReturnType<typeof useAppStore.getState>["draft"]; onConfirm: () => void }) {
  const navigate = useNavigate(); const service = services.find((item) => item.id === draft.serviceId); const barber = barbers.find((item) => item.id === draft.assignedBarberId); const chair = chairs.find((item) => item.id === draft.chairId); const pricing = calculatePrice(draft.serviceId); const start = draft.date && draft.time ? new Date(`${draft.date}T${draft.time}:00`) : null;
  if (!service || !barber || !chair || !draft.customer || !start) return <MissingStep href="/book/service" label="Complete the booking details first" />;
  return <div><StepHeader number="07" title="Review and confirm" copy="Check every detail. Your appointment is reserved only after confirmation." /><div className="final-summary"><div className="summary-main"><span className="eyebrow">Appointment</span><h2>{service.name}</h2><div className="summary-details"><p><Scissors /><span><small>Barber</small><strong>{barber.name}</strong></span></p><p><CalendarDays /><span><small>Date</small><strong>{format(start, "EEEE, d MMMM yyyy")}</strong></span></p><p><Clock3 /><span><small>Time</small><strong>{format(start, "HH:mm")} – {format(addMinutes(start, service.duration), "HH:mm")}</strong></span></p><p><UserRound /><span><small>Chair</small><strong>{chair.name}</strong></span></p></div></div><div className="summary-customer"><span className="eyebrow">Guest details</span><h3>{draft.customer.fullName}</h3><p>{draft.customer.email}<br />{draft.customer.phone}</p>{draft.customer.notes ? <blockquote>“{draft.customer.notes}”</blockquote> : null}</div><div className="pricing-table"><div><span>Service</span><strong>{formatCurrency(pricing.subtotal)}</strong></div>{pricing.discount ? <div><span>Package saving</span><strong>−{formatCurrency(pricing.discount)}</strong></div> : null}<div><span>Tax</span><strong>Included</strong></div><div className="total"><span>Total due at the shop</span><strong>{formatCurrency(pricing.total)}</strong></div></div></div><div className="policy-note"><CheckCircle2 /><p>Free cancellation or rescheduling until 2 hours before the appointment. Your original slot remains protected during rescheduling.</p></div><div className="step-actions"><Button variant="ghost" onClick={() => navigate("/book/details")}><ArrowLeft /> Edit details</Button><Button size="lg" onClick={onConfirm}>Confirm appointment <Check /></Button></div></div>;
}

function BookingSummary({ service, barber, date, time, chairId, pricing }: { service?: (typeof services)[number]; barber?: (typeof barbers)[number]; date?: string; time?: string; chairId?: string; pricing: ReturnType<typeof calculatePrice> }) {
  const chair = chairs.find((item) => item.id === chairId);
  return <div className="mini-summary"><span className="eyebrow">Your appointment</span><h2>{service?.name || "Start with a service"}</h2><dl><div><dt>Barber</dt><dd>{barber?.name || "—"}</dd></div><div><dt>Date</dt><dd>{date ? format(new Date(`${date}T12:00:00`), "d MMM yyyy") : "—"}</dd></div><div><dt>Time</dt><dd>{time || "—"}</dd></div><div><dt>Chair</dt><dd>{chair?.name || "—"}</dd></div><div><dt>Duration</dt><dd>{service ? `${service.duration} min` : "—"}</dd></div></dl><div className="mini-total"><span>Estimated total</span><strong>{formatCurrency(pricing.total)}</strong></div><p>No payment required today.</p></div>;
}

function StepHeader({ number, title, copy }: { number: string; title: string; copy: string }) { return <header className="step-header"><span>{number}</span><div><h2>{title}</h2><p>{copy}</p></div></header>; }
function MissingStep({ href, label }: { href: string; label: string }) { return <div className="inline-empty"><CalendarDays /><h2>{label}</h2><p>Complete the previous step so availability can be calculated accurately.</p><Button asChild><Link to={href}>Go back</Link></Button></div>; }
function FormField({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) { const childId = (children as React.ReactElement<{ id?: string }>).props?.id; const id = childId || (label === "Preferred contact" ? "contactMethod" : label.toLowerCase().replace(/ /g, "")); return <div className="field"><Label htmlFor={id}>{label}</Label>{children}{error ? <p className="field-error" id={`${id}-error`} role="alert">{error}</p> : null}</div>; }

export function ConfirmationPage({ id }: { id: string }) {
  const booking = useAppStore((state) => state.bookings.find((item) => item.id === id));
  if (!booking) return <div className="not-found page-shell"><span>404</span><h1>Confirmation not found.</h1><p>Try opening My Bookings or search with your confirmation number.</p><Button asChild><Link to="/my-bookings">View my bookings</Link></Button></div>;
  const service = services.find((item) => item.id === booking.serviceId)!; const barber = barbers.find((item) => item.id === booking.barberId)!; const chair = chairs.find((item) => item.id === booking.chairId)!;
  return <section className="confirmation-page page-shell" aria-live="polite"><div className="confirmation-orbit" aria-hidden="true"><span/><span/><Check /></div><span className="eyebrow">Appointment confirmed</span><h1>We'll see you in the chair.</h1><p>Your confirmation number is <strong>{booking.confirmationNumber}</strong></p><div className="confirmation-ticket"><div><small>Service</small><strong>{service.name}</strong></div><div><small>Barber</small><strong>{barber.name}</strong></div><div><small>Date</small><strong>{format(parseISO(booking.startAt), "EEEE, d MMMM yyyy")}</strong></div><div><small>Time</small><strong>{format(parseISO(booking.startAt), "HH:mm")} – {format(parseISO(booking.endAt), "HH:mm")}</strong></div><div><small>Chair</small><strong>{chair.name}</strong></div><div><small>Total</small><strong>{formatCurrency(booking.total)}</strong></div><div className="ticket-customer"><small>Booked for</small><strong>{booking.customer.fullName}</strong><span>{booking.customer.email} · {booking.customer.phone}</span></div></div><div className="confirmation-actions"><Button asChild><Link to="/my-bookings">View my bookings</Link></Button><Button asChild variant="outline"><Link to="/book/service">Book another</Link></Button><Button asChild variant="ghost"><Link to="/">Return home</Link></Button></div></section>;
}
