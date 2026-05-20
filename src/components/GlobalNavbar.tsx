"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import MainLogo from "@/../public/MainLogo.svg";

const navItems = [
  { href: "/", label: "Home" },
  { href: "/#mission", label: "About Us" },
  { href: "/#tiers", label: "Pricing" },
];

export default function GlobalNavbar() {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);

  const isLanding = pathname === "/";
  const showMainNav =
    isLanding ||
    pathname === "/login" ||
    pathname === "/register" ||
    pathname === "/signup";

  if (!showMainNav) {
    return null;
  }

  return (
    <header className="top-nav" role="banner">
      <div className="nav-head">
        <div className="brand-wrap">
          <Link href="/" aria-label="Lastdot Home" className="brand-name" onClick={() => setMenuOpen(false)}>
            <Image src={MainLogo} alt="Lastdot Logo" width={200} height={40} className="w-[150px] sm:w-[200px]" priority />
          </Link>
        </div>

        <button
          type="button"
          className="menu-toggle"
          aria-label="Toggle navigation menu"
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen((prev) => !prev)}
        >
          <span />
          <span />
          <span />
        </button>
      </div>

      <nav className={`nav-links ${menuOpen ? "open" : ""}`} aria-label="Primary navigation">
        {navItems.map((item) => (
          <a key={item.href} href={item.href} className="nav-link-item" onClick={() => setMenuOpen(false)}>
            {item.label}
          </a>
        ))}
        <Link href="/login" className="login-btn" onClick={() => setMenuOpen(false)}>
          <span className="login-lock" aria-hidden />
          <span>Login</span>
        </Link>
      </nav>
    </header>
  );
}
