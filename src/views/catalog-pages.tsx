"use client";

import { useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { ArrowLeft, ArrowRight, CalendarDays, Check, Clock3, Search, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { barbers, reviews, services } from "@/src/data/catalog";
import { BarberCard, EmptyState, PageHero, ReviewCard, SectionHeading, ServiceCard, Stars } from "@/src/components/shared";
import { formatCurrency } from "@/src/utils/booking";

const categories = ["All", "Haircuts", "Beard Services", "Shaving", "Hair + Beard Packages", "Kids", "Premium Treatments"];

export function ServicesPage() {
  const [params] = useSearchParams();
  const demoState = params.get("demoState");
  const [category, setCategory] = useState("All");
  const [query, setQuery] = useState("");
  const filtered = useMemo(() => services.filter((service) => (category === "All" || service.category === category) && service.name.toLowerCase().includes(query.toLowerCase())), [category, query]);
  return <><PageHero eyebrow="Service menu" title="Choose your ritual." copy="Precise timings, transparent prices, and no rushed appointments." />
    <section className="section-space page-shell"><div className="filter-bar"><label className="search-field"><Search /><span className="sr-only">Search services</span><Input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search services" /></label><div className="filter-chips" aria-label="Filter services by category">{categories.map((item) => <button key={item} onClick={() => setCategory(item)} aria-pressed={category === item}>{item}</button>)}</div></div>
      {demoState === "loading" ? <div className="service-grid" aria-label="Loading services">{[1,2,3,4,5,6].map((item) => <Skeleton key={item} className="catalog-skeleton" />)}</div> : demoState === "error" ? <EmptyState title="We couldn't load the menu" copy="The service list is temporarily unavailable." action={<Button onClick={() => location.href="/services"}>Try again</Button>} /> : (demoState === "empty" || filtered.length === 0) ? <EmptyState title="No services found" copy="Try another category or a broader search." action={<Button onClick={() => { setCategory("All"); setQuery(""); }}>Clear filters</Button>} /> : <div className="service-grid catalog-grid">{filtered.map((service) => <ServiceCard service={service} key={service.id} />)}</div>}
    </section></>;
}

export function ServiceDetailPage({ id }: { id: string }) {
  const service = services.find((item) => item.id === id);
  if (!service) return <NotFoundPanel entity="service" />;
  const compatible = barbers.filter((barber) => barber.serviceIds.includes(service.id));
  return <section className="detail-page page-shell"><Link to="/services" className="back-link"><ArrowLeft /> All services</Link><div className="service-detail-grid"><div className="detail-image tilt-stage"><img src={service.image} alt={`Premium ${service.name} service setting`} /><div className="detail-price"><span>From</span><strong>{formatCurrency(service.price)}</strong></div></div><div className="detail-copy"><span className="eyebrow">{service.category}</span><h1>{service.name}</h1><Stars value={service.rating} count={reviews.filter((review) => review.serviceId === id).length} /><p className="lead">{service.description}</p><div className="detail-metrics"><div><Clock3 /><span><small>Duration</small><strong>{service.duration} minutes</strong></span></div><div><Sparkles /><span><small>Investment</small><strong>{formatCurrency(service.price)}</strong></span></div></div><div className="included"><h2>What's included</h2>{service.included.map((item) => <p key={item}><Check /> {item}</p>)}</div><Button asChild size="lg"><Link to={`/book/service?service=${service.id}`}>Book this service <ArrowRight /></Link></Button></div></div><div className="compatible-section"><SectionHeading eyebrow="Available specialists" title="Choose your expert." /><div className="barber-grid compact">{compatible.slice(0, 3).map((barber) => <BarberCard barber={barber} key={barber.id} />)}</div></div></section>;
}

export function BarbersPage() {
  return <><PageHero eyebrow="Our barbers" title="Different hands. One standard." copy="Explore each specialist's craft, schedule, and signature services." /><section className="section-space page-shell"><div className="barber-grid catalog-barbers">{barbers.map((barber) => <BarberCard barber={barber} key={barber.id} />)}</div></section></>;
}

export function BarberDetailPage({ id }: { id: string }) {
  const barber = barbers.find((item) => item.id === id);
  if (!barber) return <NotFoundPanel entity="barber" />;
  const supported = services.filter((service) => barber.serviceIds.includes(service.id));
  const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  return <section className="detail-page page-shell"><Link to="/barbers" className="back-link"><ArrowLeft /> All barbers</Link><div className="barber-profile-grid"><div className="profile-portrait tilt-stage"><img src={barber.image} alt={`${barber.name}, ${barber.title}`} /><div className="experience-float"><strong>{barber.yearsExperience}</strong><span>years<br/>behind the chair</span></div></div><div className="detail-copy"><span className="eyebrow">{barber.title}</span><h1>{barber.name}</h1><Stars value={barber.rating} count={barber.reviewCount} /><p className="lead">{barber.bio}</p><div className="specialty-row large">{barber.specialties.map((item) => <span key={item}>{item}</span>)}</div><div className="weekly-schedule"><h2>Weekly schedule</h2><div>{dayNames.map((day, index) => <span className={barber.schedule.includes(index) ? "works" : "off"} key={day}><strong>{day}</strong><small>{barber.schedule.includes(index) ? "In studio" : "Off"}</small></span>)}</div></div><Button asChild size="lg"><Link to={`/book/barber?barber=${barber.id}`}>Book with {barber.name.split(" ")[0]} <CalendarDays /></Link></Button></div></div><div className="compatible-section"><SectionHeading eyebrow="Signature services" title={`Recommended with ${barber.name.split(" ")[0]}.`} /><div className="service-grid">{supported.slice(0, 3).map((service) => <ServiceCard service={service} key={service.id} />)}</div></div></section>;
}

export function NotFoundPanel({ entity = "page" }: { entity?: string }) {
  return <div className="not-found page-shell"><span>404</span><h1>That {entity} isn't in the chair.</h1><p>The link may be outdated, or the item may no longer be available.</p><Button asChild><Link to="/">Return home</Link></Button></div>;
}
