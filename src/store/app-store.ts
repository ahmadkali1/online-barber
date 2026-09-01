"use client";

import { create } from "zustand";
import type { Booking, BookingDraft, Review, UserProfile } from "@/src/types/domain";
import { storageRepository } from "@/src/services/storage";

interface AppState {
  hydrated: boolean;
  bookings: Booking[];
  reviews: Review[];
  profile: UserProfile | null;
  userId?: string;
  draft: BookingDraft;
  hydrate: () => void;
  updateDraft: (values: Partial<BookingDraft>) => void;
  resetDraft: () => void;
  addBooking: (booking: Booking) => void;
  cancelBooking: (id: string) => void;
  rescheduleBooking: (originalId: string, replacement: Booking) => void;
  addReview: (review: Review) => void;
  register: (profile: UserProfile) => void;
  login: (email: string) => boolean;
  logout: () => void;
  updateProfile: (profile: UserProfile) => void;
}

const persist = (state: Pick<AppState, "bookings" | "reviews" | "profile">) => storageRepository.save({ version: 1, bookings: state.bookings, reviews: state.reviews, profile: state.profile });

export const useAppStore = create<AppState>((set, get) => ({
  hydrated: false,
  bookings: [],
  reviews: [],
  profile: null,
  draft: {},
  hydrate: () => {
    if (get().hydrated) return;
    const data = storageRepository.load();
    const session = storageRepository.loadSession();
    set({ ...data, userId: session.userId, hydrated: true });
  },
  updateDraft: (values) => set((state) => ({ draft: { ...state.draft, ...values } })),
  resetDraft: () => set({ draft: {} }),
  addBooking: (booking) => set((state) => {
    const next = { bookings: [booking, ...state.bookings], reviews: state.reviews, profile: state.profile };
    persist(next); return { bookings: next.bookings };
  }),
  cancelBooking: (id) => set((state) => {
    const bookings = state.bookings.map((booking) => booking.id === id ? { ...booking, status: "cancelled" as const, updatedAt: new Date().toISOString() } : booking);
    persist({ bookings, reviews: state.reviews, profile: state.profile }); return { bookings };
  }),
  rescheduleBooking: (originalId, replacement) => set((state) => {
    const bookings = [replacement, ...state.bookings.map((booking) => booking.id === originalId ? { ...booking, status: "rescheduled" as const, updatedAt: new Date().toISOString() } : booking)];
    persist({ bookings, reviews: state.reviews, profile: state.profile }); return { bookings };
  }),
  addReview: (review) => set((state) => {
    if (state.reviews.some((item) => item.bookingId === review.bookingId)) return state;
    const reviews = [review, ...state.reviews]; persist({ bookings: state.bookings, reviews, profile: state.profile }); return { reviews };
  }),
  register: (profile) => { persist({ bookings: get().bookings, reviews: get().reviews, profile }); storageRepository.saveSession(profile.id); set({ profile, userId: profile.id }); },
  login: (email) => {
    const profile = get().profile;
    const valid = email.trim().toLowerCase() === (profile?.email.toLowerCase() || "demo@gentlemanschair.example");
    if (valid) { const userId = profile?.id || "demo-user"; storageRepository.saveSession(userId); set({ userId }); }
    return valid;
  },
  logout: () => { storageRepository.saveSession(); set({ userId: undefined }); },
  updateProfile: (profile) => { persist({ bookings: get().bookings, reviews: get().reviews, profile }); set({ profile }); },
}));

