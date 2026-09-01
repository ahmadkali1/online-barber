import type { Barber, Chair, Review, Service } from "@/src/types/domain";

const interior = "https://www.clearpath-digital.com/assets/case-barber-DkGGAgdD.jpg";

export const services: Service[] = [
  { id: "classic-cut", name: "Classic Haircut", category: "Haircuts", description: "A tailored scissor and clipper cut finished with a precise neckline and style consultation.", duration: 45, price: 95, image: interior, included: ["Style consultation", "Hot towel prep", "Cut and finish"], rating: 4.9 },
  { id: "skin-fade", name: "Skin Fade", category: "Haircuts", description: "A seamless skin fade blended to your preferred length with razor-sharp detailing.", duration: 60, price: 125, image: interior, included: ["Consultation", "Skin fade", "Line-up and styling"], rating: 4.9 },
  { id: "beard-trim", name: "Sculpted Beard Trim", category: "Beard Services", description: "Shape, balance and define your beard with trimmer and scissor work.", duration: 30, price: 70, image: interior, included: ["Beard mapping", "Trim and shape", "Conditioning oil"], rating: 4.8 },
  { id: "cut-beard", name: "Signature Cut + Beard", category: "Hair + Beard Packages", description: "Our complete grooming ritual pairing a tailored haircut with a sculpted beard.", duration: 90, price: 175, image: interior, included: ["Hair consultation", "Tailored cut", "Beard sculpt", "Hot towel finish"], rating: 5 },
  { id: "kids-cut", name: "Young Gentleman's Cut", category: "Kids", description: "A patient, polished cut for guests aged 12 and under.", duration: 30, price: 65, image: interior, included: ["Style consultation", "Gentle cut", "Finish"], rating: 4.8 },
  { id: "hot-towel", name: "Royal Hot Towel Shave", category: "Shaving", description: "A traditional straight-razor shave with aromatic steam and post-shave care.", duration: 45, price: 110, image: interior, included: ["Pre-shave oil", "Two hot towels", "Straight-razor shave", "Aftercare"], rating: 4.9 },
  { id: "grey-blend", name: "Natural Grey Blend", category: "Premium Treatments", description: "A subtle tonal service designed to soften grey while keeping a natural finish.", duration: 60, price: 145, image: interior, included: ["Colour consultation", "Custom blend", "Wash and finish"], rating: 4.7 },
  { id: "scalp-reset", name: "Scalp Reset Ritual", category: "Premium Treatments", description: "Deep cleanse, exfoliation and restorative scalp massage for healthier hair.", duration: 45, price: 120, image: interior, included: ["Scalp analysis", "Deep cleanse", "Exfoliation", "Massage"], rating: 4.8 },
  { id: "executive", name: "Executive Grooming", category: "Hair + Beard Packages", description: "Cut, beard detail, facial cleanse and styling for a complete boardroom-ready finish.", duration: 90, price: 225, image: interior, included: ["Cut", "Beard detail", "Facial cleanse", "Premium styling"], rating: 5 },
];

export const barbers: Barber[] = [
  { id: "marcus", name: "Marcus Cole", title: "Master Barber", bio: "Marcus blends London-trained precision with relaxed Dubai hospitality. His fades and classic scissor work are meticulous without ever feeling overworked.", specialties: ["Skin fades", "Scissor work", "Restyles"], yearsExperience: 14, rating: 4.9, reviewCount: 184, serviceIds: services.map((service) => service.id), image: "https://www.gentscobarbers.ca/_next/image?q=75&url=%2Fimages%2FHeadshots-14.jpg&w=2048", schedule: [1, 2, 3, 4, 5] },
  { id: "omar", name: "Omar Haddad", title: "Senior Barber", bio: "Known for sculpted beards and clean geometry, Omar creates balanced looks that grow out beautifully.", specialties: ["Beard design", "Hot towel shave", "Fades"], yearsExperience: 11, rating: 4.9, reviewCount: 149, serviceIds: services.filter((service) => service.id !== "kids-cut").map((service) => service.id), image: "https://taperfadepro.com/storage/2025/09/Ethan-Cole-Taper-Fade-Pro.png", schedule: [1, 2, 3, 5, 6] },
  { id: "daniel", name: "Daniel Reyes", title: "Style Director", bio: "Daniel specialises in modern texture, longer styles and confident transformations tailored to face shape and lifestyle.", specialties: ["Textured cuts", "Long hair", "Colour blending"], yearsExperience: 12, rating: 4.8, reviewCount: 126, serviceIds: services.filter((service) => !["hot-towel", "kids-cut"].includes(service.id)).map((service) => service.id), image: "https://cdn.shopify.com/s/files/1/0561/7732/8209/files/GI_Galaxy_Barbershop-3.jpg?v=1686628487", schedule: [2, 3, 4, 5, 6] },
  { id: "yusuf", name: "Yusuf Kareem", title: "Classic Grooming Specialist", bio: "Yusuf is a calm hand with a passion for traditional shaves, beard rituals and timeless gentleman's cuts.", specialties: ["Classic cuts", "Straight razor", "Beard care"], yearsExperience: 16, rating: 5, reviewCount: 211, serviceIds: services.filter((service) => service.id !== "grey-blend").map((service) => service.id), image: "https://images.squarespace-cdn.com/content/v1/61b9febbd2e0fb042487ab37/1639599942465-H3NR6WXQIUQULF5HZVAG/HF%2BPortrait-11.jpg?format=2500w", schedule: [1, 3, 4, 5, 6] },
  { id: "leo", name: "Leo Bennett", title: "Barber & Kids Specialist", bio: "Leo brings easy conversation and patient technique to every appointment, from first haircuts to sharp weekend fades.", specialties: ["Kids cuts", "Classic cuts", "Natural styling"], yearsExperience: 8, rating: 4.8, reviewCount: 98, serviceIds: services.filter((service) => !["grey-blend", "hot-towel"].includes(service.id)).map((service) => service.id), image: "https://images.squarespace-cdn.com/content/v1/61b9febbd2e0fb042487ab37/1639599202307-BL456IKMI2V8GYMZ0YC3/HF%2BPortrait-4.jpg?format=2500w", schedule: [1, 2, 4, 5, 6] },
];

export const chairs: Chair[] = Array.from({ length: 6 }, (_, index) => ({
  id: `chair-${index + 1}`,
  name: `Chair ${String(index + 1).padStart(2, "0")}`,
  description: index < 2 ? "Window station · natural light" : index < 4 ? "Main floor · full station" : "Private station · quieter setting",
  active: true,
}));

const reviewBodies = [
  "The consultation was thoughtful and the cut still looks sharp three weeks later.",
  "Impeccable fade, relaxed atmosphere and right on time. Exactly what I wanted.",
  "The hot towel shave was a proper ritual. Yusuf's attention to detail is exceptional.",
  "Marcus understood the reference immediately and adapted it perfectly to my hair.",
  "My son usually dislikes haircuts, but Leo made the whole visit easy and fun.",
  "A polished space with genuine hospitality. The booking experience was effortless too.",
  "Omar reshaped my beard without taking away too much length. Excellent work.",
  "Daniel's grey blend is subtle and natural. Nobody can tell it was coloured.",
  "Consistent, calm and professional. This is now my regular barbershop.",
  "The executive package was worth every dirham. I left feeling completely reset.",
];

export const reviews: Review[] = reviewBodies.map((body, index) => ({
  id: `review-${index + 1}`,
  bookingId: `historic-${index + 1}`,
  customerName: ["Rami A.", "James L.", "Khalid M.", "Theo R.", "Samir N."][index % 5],
  barberId: barbers[index % barbers.length].id,
  serviceId: services[index % services.length].id,
  rating: index === 7 ? 4 : 5,
  barberRating: 5,
  body,
  createdAt: new Date(Date.now() - index * 86400000 * 8).toISOString(),
}));

