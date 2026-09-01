"use client";

import { useMemo, useState } from "react";
import { Star } from "lucide-react";
import { NativeSelect, NativeSelectOption } from "@/components/ui/native-select";
import { barbers, services } from "@/src/data/catalog";
import { PageHero, ReviewCard } from "@/src/components/shared";
import { useAppStore } from "@/src/store/app-store";

export function ReviewsPage() {
  const reviews = useAppStore((state) => state.reviews);
  const [sort, setSort] = useState("recent");
  const [barberId, setBarberId] = useState("all");
  const [serviceId, setServiceId] = useState("all");
  const visible = useMemo(() => reviews.filter((review) => (barberId === "all" || review.barberId === barberId) && (serviceId === "all" || review.serviceId === serviceId)).sort((a, b) => sort === "high" ? b.rating - a.rating : sort === "low" ? a.rating - b.rating : +new Date(b.createdAt) - +new Date(a.createdAt)), [reviews, sort, barberId, serviceId]);
  const overall = reviews.length ? reviews.reduce((sum, item) => sum + item.rating, 0) / reviews.length : 0;
  return <><PageHero eyebrow="Guest reviews" title="Earned, one appointment at a time." copy="Real feedback tied to completed services and the barbers who delivered them." /><section className="section-space page-shell"><div className="rating-overview"><div className="score"><strong>{overall.toFixed(1)}</strong><span><span className="score-stars">★★★★★</span><small>Based on {reviews.length} verified appointments</small></span></div><div className="distribution">{[5,4,3,2,1].map((value) => { const count = reviews.filter((review) => review.rating === value).length; const percent = reviews.length ? (count / reviews.length) * 100 : 0; return <div key={value}><span>{value} <Star fill="currentColor" /></span><i><b style={{ width: `${percent}%` }} /></i><small>{count}</small></div>; })}</div></div><div className="review-filters"><label>Sort by<NativeSelect value={sort} onChange={(event) => setSort(event.target.value)}><NativeSelectOption value="recent">Most recent</NativeSelectOption><NativeSelectOption value="high">Highest rating</NativeSelectOption><NativeSelectOption value="low">Lowest rating</NativeSelectOption></NativeSelect></label><label>Barber<NativeSelect value={barberId} onChange={(event) => setBarberId(event.target.value)}><NativeSelectOption value="all">All barbers</NativeSelectOption>{barbers.map((barber) => <NativeSelectOption key={barber.id} value={barber.id}>{barber.name}</NativeSelectOption>)}</NativeSelect></label><label>Service<NativeSelect value={serviceId} onChange={(event) => setServiceId(event.target.value)}><NativeSelectOption value="all">All services</NativeSelectOption>{services.map((service) => <NativeSelectOption key={service.id} value={service.id}>{service.name}</NativeSelectOption>)}</NativeSelect></label></div><div className="review-grid review-list">{visible.map((review) => <ReviewCard review={review} key={review.id} />)}</div></section></>;
}

