export type BookingStatus = "confirmed" | "completed" | "cancelled" | "rescheduled";
export type ContactMethod = "email" | "phone" | "sms";

export interface Service {
  id: string;
  name: string;
  category: string;
  description: string;
  duration: 30 | 45 | 60 | 90;
  price: number;
  image: string;
  included: string[];
  rating: number;
}

export interface Barber {
  id: string;
  name: string;
  title: string;
  bio: string;
  specialties: string[];
  yearsExperience: number;
  rating: number;
  reviewCount: number;
  serviceIds: string[];
  image: string;
  schedule: number[];
}

export interface Chair {
  id: string;
  name: string;
  description: string;
  active: boolean;
}

export interface CustomerDetails {
  fullName: string;
  email: string;
  phone: string;
  notes?: string;
  contactMethod: ContactMethod;
}

export interface Booking {
  id: string;
  confirmationNumber: string;
  customerId?: string;
  customer: CustomerDetails;
  serviceId: string;
  barberId: string;
  chairId: string;
  startAt: string;
  endAt: string;
  status: BookingStatus;
  subtotal: number;
  discount: number;
  tax: number;
  total: number;
  createdAt: string;
  updatedAt: string;
  rescheduledFromId?: string;
}

export interface Review {
  id: string;
  bookingId: string;
  customerName: string;
  barberId: string;
  serviceId: string;
  rating: number;
  barberRating?: number;
  body: string;
  createdAt: string;
}

export interface UserProfile {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  preferredBarberId?: string;
  contactMethod: ContactMethod;
}

export interface BookingDraft {
  serviceId?: string;
  barberPreference?: string;
  assignedBarberId?: string;
  date?: string;
  time?: string;
  chairId?: string;
  customer?: CustomerDetails;
  originalBookingId?: string;
}

