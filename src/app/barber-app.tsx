"use client";

import { lazy, Suspense, useEffect } from "react";
import { BrowserRouter, useLocation, useNavigate } from "react-router-dom";
import { Toaster } from "@/components/ui/sonner";
import { AppShell } from "@/src/components/app-shell";
import { ErrorBoundary } from "@/src/components/error-boundary";
import { useAppStore } from "@/src/store/app-store";

const HomePage = lazy(() => import("@/src/views/home-page").then((module) => ({ default: module.HomePage })));
const ServicesPage = lazy(() => import("@/src/views/catalog-pages").then((module) => ({ default: module.ServicesPage })));
const ServiceDetailPage = lazy(() => import("@/src/views/catalog-pages").then((module) => ({ default: module.ServiceDetailPage })));
const BarbersPage = lazy(() => import("@/src/views/catalog-pages").then((module) => ({ default: module.BarbersPage })));
const BarberDetailPage = lazy(() => import("@/src/views/catalog-pages").then((module) => ({ default: module.BarberDetailPage })));
const NotFoundPanel = lazy(() => import("@/src/views/catalog-pages").then((module) => ({ default: module.NotFoundPanel })));
const ReviewsPage = lazy(() => import("@/src/views/reviews-page").then((module) => ({ default: module.ReviewsPage })));
const LoginPage = lazy(() => import("@/src/views/auth-pages").then((module) => ({ default: module.LoginPage })));
const RegisterPage = lazy(() => import("@/src/views/auth-pages").then((module) => ({ default: module.RegisterPage })));
const PasswordPage = lazy(() => import("@/src/views/auth-pages").then((module) => ({ default: module.PasswordPage })));
const AccountPage = lazy(() => import("@/src/views/auth-pages").then((module) => ({ default: module.AccountPage })));
const BookingPage = lazy(() => import("@/src/views/booking-page").then((module) => ({ default: module.BookingPage })));
const ConfirmationPage = lazy(() => import("@/src/views/booking-page").then((module) => ({ default: module.ConfirmationPage })));
const MyBookingsPage = lazy(() => import("@/src/views/bookings-pages").then((module) => ({ default: module.MyBookingsPage })));
const BookingDetailPage = lazy(() => import("@/src/views/bookings-pages").then((module) => ({ default: module.BookingDetailPage })));

function RouteView() {
  const pathname = useLocation().pathname;
  const navigate = useNavigate();
  const hydrated = useAppStore((state) => state.hydrated);
  const hydrate = useAppStore((state) => state.hydrate);
  useEffect(() => hydrate(), [hydrate]);
  useEffect(() => { window.scrollTo({ top: 0, behavior: "instant" }); }, [pathname]);
  useEffect(() => { if (pathname === "/book") navigate("/book/service", { replace: true }); }, [pathname, navigate]);
  useEffect(() => {
    const section = pathname.split("/")[1];
    const labels: Record<string, string> = { services: "Services", barbers: "Barbers", book: "Book Appointment", booking: "Booking Confirmed", reviews: "Reviews", login: "Sign In", register: "Create Account", account: "My Account", "my-bookings": "My Bookings", "forgot-password": "Forgot Password", "reset-password": "Reset Password" };
    document.title = section ? `${labels[section] || "Page"} | The Gentleman's Chair` : "The Gentleman's Chair | Premium Barber Appointments";
  }, [pathname]);
  if (!hydrated) return <div className="app-loading"><span className="brand-loader">GC</span><p>Preparing your appointment desk…</p></div>;
  let page: React.ReactNode;
  if (pathname === "/") page = <HomePage />;
  else if (pathname === "/services") page = <ServicesPage />;
  else if (/^\/services\/[^/]+$/.test(pathname)) page = <ServiceDetailPage id={pathname.split("/")[2]} />;
  else if (pathname === "/barbers") page = <BarbersPage />;
  else if (/^\/barbers\/[^/]+$/.test(pathname)) page = <BarberDetailPage id={pathname.split("/")[2]} />;
  else if (pathname === "/reviews") page = <ReviewsPage />;
  else if (pathname.startsWith("/book/")) page = <BookingPage />;
  else if (/^\/booking\/confirmation\/[^/]+$/.test(pathname)) page = <ConfirmationPage id={pathname.split("/")[3]} />;
  else if (pathname === "/my-bookings") page = <MyBookingsPage />;
  else if (/^\/my-bookings\/[^/]+$/.test(pathname)) page = <BookingDetailPage id={pathname.split("/")[2]} />;
  else if (pathname === "/login") page = <LoginPage />;
  else if (pathname === "/register") page = <RegisterPage />;
  else if (pathname === "/forgot-password") page = <PasswordPage />;
  else if (pathname === "/reset-password") page = <PasswordPage reset />;
  else if (pathname === "/account") page = <AccountPage />;
  else page = <NotFoundPanel />;
  return <AppShell><Suspense fallback={<div className="route-loading"><span /><span /><span /></div>}>{page}</Suspense><Toaster richColors position="top-right" /></AppShell>;
}

export function BarberApp() {
  return <ErrorBoundary><BrowserRouter basename="/online-barber"><Suspense fallback={<div className="app-loading"><span className="brand-loader">GC</span><p>Preparing your appointment desk…</p></div>}><RouteView /></Suspense></BrowserRouter></ErrorBoundary>;
}
