"use client";

import { cloneElement, isValidElement, useEffect, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { ArrowRight, CheckCircle2, LockKeyhole, Mail, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { NativeSelect, NativeSelectOption } from "@/components/ui/native-select";
import { PageHero } from "@/src/components/shared";
import { barbers } from "@/src/data/catalog";
import { useAppStore } from "@/src/store/app-store";
import type { ContactMethod } from "@/src/types/domain";

const loginSchema = z.object({ email: z.string().trim().email("Enter a valid email"), password: z.string().min(1, "Enter a password") });
const registerSchema = z.object({ firstName: z.string().trim().min(2, "Enter your first name").max(40), lastName: z.string().trim().min(2, "Enter your last name").max(40), email: z.string().trim().email("Enter a valid email"), phone: z.string().trim().regex(/^\+?[0-9\s-]{8,18}$/, "Enter a valid phone number"), password: z.string().min(8, "Use at least 8 characters"), confirmPassword: z.string() }).refine((values) => values.password === values.confirmPassword, { path: ["confirmPassword"], message: "Passwords must match" });
type LoginValues = z.infer<typeof loginSchema>;
type RegisterValues = z.infer<typeof registerSchema>;

function AuthFrame({ title, copy, children }: { title: string; copy: string; children: React.ReactNode }) {
  return <section className="auth-page"><div className="auth-panel"><div className="auth-brand-panel"><span className="eyebrow">The Gentleman's Chair</span><h1>{title}</h1><p>{copy}</p><div className="auth-promise"><span><ShieldCheck /><strong>Demo-safe account</strong><small>Passwords are validated, never stored.</small></span><span><LockKeyhole /><strong>Private to this browser</strong><small>Your profile and appointments stay on your device.</small></span></div></div><div className="auth-form-panel">{children}</div></div></section>;
}

export function LoginPage() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const login = useAppStore((state) => state.login);
  const [serverError, setServerError] = useState("");
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<LoginValues>({ resolver: zodResolver(loginSchema), defaultValues: { email: "demo@gentlemanschair.example", password: "demopass" } });
  const submit = async (values: LoginValues) => { await new Promise((resolve) => setTimeout(resolve, 400)); if (login(values.email)) navigate(params.get("returnTo") || "/account"); else setServerError("No local demo account matches that email. Create an account or use the demo address shown below."); };
  return <AuthFrame title="Welcome back." copy="Sign in to update your preferences and see appointments connected to your profile."><form onSubmit={handleSubmit(submit)} className="form-stack" noValidate><div className="form-heading"><span className="eyebrow">Customer sign in</span><h2>Return to your chair</h2></div>{serverError ? <div className="form-alert" role="alert">{serverError}</div> : null}<Field label="Email" error={errors.email?.message}><Input type="email" autoComplete="email" {...register("email")} aria-invalid={Boolean(errors.email)} /></Field><Field label="Password" error={errors.password?.message}><Input type="password" autoComplete="current-password" {...register("password")} aria-invalid={Boolean(errors.password)} /></Field><div className="form-row-between"><span className="demo-hint">Demo: demo@gentlemanschair.example</span><Link to="/forgot-password">Forgot password?</Link></div><Button size="lg" disabled={isSubmitting}>{isSubmitting ? "Signing in…" : <>Sign in <ArrowRight /></>}</Button><p className="form-switch">New here? <Link to="/register">Create an account</Link></p></form></AuthFrame>;
}

export function RegisterPage() {
  const navigate = useNavigate(); const registerAccount = useAppStore((state) => state.register);
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<RegisterValues>({ resolver: zodResolver(registerSchema) });
  const submit = async (values: RegisterValues) => { await new Promise((resolve) => setTimeout(resolve, 450)); registerAccount({ id: crypto.randomUUID(), firstName: values.firstName.trim(), lastName: values.lastName.trim(), email: values.email.trim().toLowerCase(), phone: values.phone.trim(), contactMethod: "email" }); navigate("/account"); };
  return <AuthFrame title="Make every visit yours." copy="Create a local demo profile for faster booking, saved details, and preferred-barber selection."><form onSubmit={handleSubmit(submit)} className="form-stack" noValidate><div className="form-heading"><span className="eyebrow">Create account</span><h2>Your details</h2></div><div className="form-two"><Field label="First name" error={errors.firstName?.message}><Input autoComplete="given-name" {...register("firstName")} /></Field><Field label="Last name" error={errors.lastName?.message}><Input autoComplete="family-name" {...register("lastName")} /></Field></div><Field label="Email" error={errors.email?.message}><Input type="email" autoComplete="email" {...register("email")} /></Field><Field label="Phone" error={errors.phone?.message}><Input type="tel" autoComplete="tel" placeholder="+971 50 123 4567" {...register("phone")} /></Field><div className="form-two"><Field label="Password" error={errors.password?.message}><Input type="password" autoComplete="new-password" {...register("password")} /></Field><Field label="Confirm password" error={errors.confirmPassword?.message}><Input type="password" autoComplete="new-password" {...register("confirmPassword")} /></Field></div><p className="privacy-note"><ShieldCheck /> Passwords are checked only for this form and are never saved.</p><Button size="lg" disabled={isSubmitting}>{isSubmitting ? "Creating account…" : <>Create account <ArrowRight /></>}</Button><p className="form-switch">Already registered? <Link to="/login">Sign in</Link></p></form></AuthFrame>;
}

export function PasswordPage({ reset = false }: { reset?: boolean }) {
  const [sent, setSent] = useState(false);
  return <AuthFrame title={reset ? "Choose a new password." : "We'll help you back in."} copy="This portfolio experience simulates account recovery without sending or storing credentials."><div className="form-stack">{sent ? <div className="success-panel" aria-live="polite"><CheckCircle2 /><h2>{reset ? "Password updated" : "Check your inbox"}</h2><p>{reset ? "Your simulated password reset is complete." : "A simulated recovery link has been prepared for this demo."}</p><Button asChild><Link to="/login">Return to sign in</Link></Button></div> : <form onSubmit={(event) => { event.preventDefault(); setSent(true); }} className="form-stack"><div className="form-heading"><span className="eyebrow">Account recovery</span><h2>{reset ? "Reset password" : "Forgot password"}</h2></div>{reset ? <><Field label="New password"><Input type="password" minLength={8} required /></Field><Field label="Confirm password"><Input type="password" minLength={8} required /></Field></> : <Field label="Email"><Input type="email" required autoComplete="email" /></Field>}<Button size="lg">{reset ? "Update password" : "Send recovery link"} <Mail /></Button></form>}</div></AuthFrame>;
}

export function AccountPage() {
  const navigate = useNavigate(); const { userId, profile, updateProfile } = useAppStore();
  const base = profile || { id: "demo-user", firstName: "Demo", lastName: "Customer", email: "demo@gentlemanschair.example", phone: "+971 50 555 0101", contactMethod: "email" as ContactMethod };
  const [form, setForm] = useState(base); const [saved, setSaved] = useState(false);
  useEffect(() => { if (!userId) navigate("/login?returnTo=/account", { replace: true }); }, [userId, navigate]);
  if (!userId) return <div className="loading-page">Taking you to sign in…</div>;
  const save = (event: React.FormEvent) => { event.preventDefault(); updateProfile(form); setSaved(true); setTimeout(() => setSaved(false), 2500); };
  return <><PageHero eyebrow="Customer account" title={`Good to see you, ${form.firstName}.`} copy="Keep your booking details and preferences ready for the next visit." /><section className="section-space page-shell account-layout"><aside className="account-card"><div className="account-avatar">{form.firstName[0]}{form.lastName[0]}</div><h2>{form.firstName} {form.lastName}</h2><p>{form.email}</p><div className="account-stat"><span>Profile type</span><strong>Local demo</strong></div><Button variant="outline" onClick={() => navigate("/my-bookings")}>View my bookings</Button></aside><form onSubmit={save} className="profile-form"><div className="section-top"><div><span className="eyebrow">Profile settings</span><h2>Personal details</h2></div>{saved ? <span className="save-success" aria-live="polite"><CheckCircle2 /> Saved</span> : null}</div><div className="form-two"><Field label="First name"><Input value={form.firstName} onChange={(event) => setForm({ ...form, firstName: event.target.value })} required /></Field><Field label="Last name"><Input value={form.lastName} onChange={(event) => setForm({ ...form, lastName: event.target.value })} required /></Field></div><Field label="Email"><Input type="email" value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} required /></Field><Field label="Phone"><Input type="tel" value={form.phone} onChange={(event) => setForm({ ...form, phone: event.target.value })} required /></Field><Field label="Preferred barber"><NativeSelect value={form.preferredBarberId || ""} onChange={(event) => setForm({ ...form, preferredBarberId: event.target.value || undefined })}><NativeSelectOption value="">No preference</NativeSelectOption>{barbers.map((barber) => <NativeSelectOption key={barber.id} value={barber.id}>{barber.name}</NativeSelectOption>)}</NativeSelect></Field><Field label="Communication preference"><NativeSelect value={form.contactMethod} onChange={(event) => setForm({ ...form, contactMethod: event.target.value as ContactMethod })}><NativeSelectOption value="email">Email</NativeSelectOption><NativeSelectOption value="sms">SMS</NativeSelectOption><NativeSelectOption value="phone">Phone call</NativeSelectOption></NativeSelect></Field><div className="profile-actions"><Button type="button" variant="outline" onClick={() => setForm(base)}>Reset</Button><Button>Save changes</Button></div></form></section></>;
}

function Field({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) {
  const id = label.toLowerCase().replace(/\s/g, "-");
  const control = isValidElement<{ id?: string; "aria-describedby"?: string; "aria-invalid"?: boolean }>(children) ? cloneElement(children, { id, "aria-describedby": error ? `${id}-error` : undefined, "aria-invalid": Boolean(error) }) : children;
  return <div className="field"><Label htmlFor={id}>{label}</Label>{control}{error ? <p className="field-error" id={`${id}-error`} role="alert">{error}</p> : null}</div>;
}
