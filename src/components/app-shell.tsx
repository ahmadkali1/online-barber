"use client";

import { Link, useLocation, useNavigate } from "react-router-dom";
import { CalendarDays, Camera, ChevronDown, LogOut, Menu, Scissors, UserRound } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetClose, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { BUSINESS, HOURS_LABELS } from "@/src/config/business";
import { useAppStore } from "@/src/store/app-store";

const links = [
  ["Home", "/"], ["Services", "/services"], ["Barbers", "/barbers"], ["Book", "/book/service"], ["Reviews", "/reviews"], ["My Bookings", "/my-bookings"],
];

function Brand() {
  return <Link to="/" className="brand" aria-label="The Gentleman's Chair home"><span className="brand-mark"><Scissors /></span><span><strong>The Gentleman's</strong><small>Chair · Dubai</small></span></Link>;
}

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = useLocation().pathname;
  const navigate = useNavigate();
  const { userId, profile, logout } = useAppStore();
  const name = profile ? profile.firstName : "Demo";
  const signOut = () => { logout(); navigate("/"); };

  return <div className="site-frame">
    <a href="#main-content" className="skip-link">Skip to content</a>
    <header className="site-header"><div className="nav-shell"><Brand />
      <nav className="desktop-nav" aria-label="Primary navigation">{links.map(([label, href]) => <Link key={href} to={href} className={pathname === href || (href !== "/" && pathname.startsWith(href)) ? "active" : ""}>{label}</Link>)}</nav>
      <div className="nav-actions">
        {userId ? <DropdownMenu><DropdownMenuTrigger asChild><Button variant="ghost" className="profile-trigger"><span className="avatar-mini">{name.slice(0, 1)}</span>{name}<ChevronDown /></Button></DropdownMenuTrigger><DropdownMenuContent align="end" className="profile-menu"><DropdownMenuLabel>Customer account</DropdownMenuLabel><DropdownMenuItem onClick={() => navigate("/account")}><UserRound /> My profile</DropdownMenuItem><DropdownMenuItem onClick={() => navigate("/my-bookings")}><CalendarDays /> My bookings</DropdownMenuItem><DropdownMenuSeparator /><DropdownMenuItem onClick={signOut}><LogOut /> Sign out</DropdownMenuItem></DropdownMenuContent></DropdownMenu> : <><Button asChild variant="ghost" className="sign-in"><Link to="/login">Sign in</Link></Button><Button asChild><Link to="/register">Create account</Link></Button></>}
        <Sheet><SheetTrigger asChild><Button variant="ghost" size="icon" className="mobile-menu" aria-label="Open navigation"><Menu /></Button></SheetTrigger><SheetContent className="mobile-drawer"><SheetHeader><SheetTitle><Brand /></SheetTitle><SheetDescription>Navigate The Gentleman's Chair</SheetDescription></SheetHeader><nav aria-label="Mobile navigation">{links.map(([label, href]) => <SheetClose asChild key={href}><Link to={href} className={pathname === href ? "active" : ""}>{label}</Link></SheetClose>)}<div className="drawer-rule" />{userId ? <><SheetClose asChild><Link to="/account">Account</Link></SheetClose><button onClick={signOut}>Sign out</button></> : <><SheetClose asChild><Link to="/login">Sign in</Link></SheetClose><SheetClose asChild><Link to="/register">Create account</Link></SheetClose></>}</nav></SheetContent></Sheet>
      </div>
    </div></header>
    <main id="main-content">{children}</main>
    <footer className="site-footer"><div className="page-shell footer-grid"><div><Brand /><p>Unhurried grooming, exacting craft, and a chair reserved for you.</p><a href="https://www.instagram.com" aria-label="Instagram"><Camera /> Instagram</a></div><div><h2>Visit</h2><p>{BUSINESS.address}</p><p>{BUSINESS.phone}<br />{BUSINESS.email}</p></div><div><h2>Hours</h2>{HOURS_LABELS.map(([day, value]) => <div className="hours-row" key={day}><span>{day}</span><strong>{value}</strong></div>)}</div><div><h2>Explore</h2>{links.slice(1).map(([label, href]) => <Link key={href} to={href}>{label}</Link>)}</div></div><div className="footer-bottom"><span>© {new Date().getFullYear()} The Gentleman's Chair</span><span>Dubai · Prices in AED · Times in GST</span></div></footer>
  </div>;
}
