"use client";

import { Link } from "react-router-dom";
import { ArrowRight, CalendarClock, Clock3, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { barbers, services } from "@/src/data/catalog";
import { formatCurrency } from "@/src/utils/booking";
import type { Barber, Review, Service } from "@/src/types/domain";

export function Stars({ value, count, compact = false }: { value: number; count?: number; compact?: boolean }) {
  return <span className="rating" aria-label={`${value} out of 5 stars`}><Star aria-hidden="true" fill="currentColor" /> <strong>{value.toFixed(1)}</strong>{!compact && count !== undefined ? <span>({count})</span> : null}</span>;
}

export function SectionHeading({ eyebrow, title, copy, align = "left" }: { eyebrow: string; title: string; copy?: string; align?: "left" | "center" }) {
  return <div className={`section-heading ${align === "center" ? "center" : ""}`}><span className="eyebrow">{eyebrow}</span><h2>{title}</h2>{copy ? <p>{copy}</p> : null}</div>;
}

export function ServiceCard({ service }: { service: Service }) {
  return <article className="service-card tilt-card">
    <div className="card-number" aria-hidden="true">{String(services.indexOf(service) + 1).padStart(2, "0")}</div>
    <Badge className="bronze-badge">{service.category}</Badge>
    <h3>{service.name}</h3>
    <p>{service.description}</p>
    <div className="service-meta"><span><Clock3 /> {service.duration} min</span><strong>{formatCurrency(service.price)}</strong></div>
    <div className="card-actions"><Button asChild variant="ghost"><Link to={`/services/${service.id}`}>Details</Link></Button><Button asChild><Link to={`/book/service?service=${service.id}`}>Book <ArrowRight /></Link></Button></div>
  </article>;
}

export function BarberCard({ barber }: { barber: Barber }) {
  return <article className="barber-card tilt-card">
    <div className="portrait-wrap"><img src={barber.image} alt={`${barber.name}, ${barber.title}`} loading="lazy" /><span className="available-dot">Available this week</span></div>
    <div className="barber-card-body"><span className="eyebrow">{barber.title}</span><h3>{barber.name}</h3><Stars value={barber.rating} count={barber.reviewCount} /><div className="specialty-row">{barber.specialties.slice(0, 3).map((item) => <span key={item}>{item}</span>)}</div><div className="card-actions"><Button asChild variant="ghost"><Link to={`/barbers/${barber.id}`}>Profile</Link></Button><Button asChild><Link to={`/book/barber?barber=${barber.id}`}>Book <CalendarClock /></Link></Button></div></div>
  </article>;
}

export function ReviewCard({ review }: { review: Review }) {
  const barber = barbers.find((item) => item.id === review.barberId);
  const service = services.find((item) => item.id === review.serviceId);
  return <article className="review-card"><div className="quote-mark" aria-hidden="true">“</div><Stars value={review.rating} compact /><blockquote>{review.body}</blockquote><footer><strong>{review.customerName}</strong><span>{service?.name} · {barber?.name}</span></footer></article>;
}

export function PageHero({ eyebrow, title, copy, children }: { eyebrow: string; title: string; copy: string; children?: React.ReactNode }) {
  return <section className="page-hero"><div className="page-hero-orb" aria-hidden="true"/><div className="page-shell"><span className="eyebrow">{eyebrow}</span><h1>{title}</h1><p>{copy}</p>{children}</div></section>;
}

export function EmptyState({ title, copy, action }: { title: string; copy: string; action?: React.ReactNode }) {
  return <div className="empty-state"><div className="empty-icon"><CalendarClock /></div><h2>{title}</h2><p>{copy}</p>{action}</div>;
}
