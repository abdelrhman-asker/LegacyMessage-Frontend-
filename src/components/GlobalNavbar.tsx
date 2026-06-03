"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import MainLogo from "@/../public/MainLogo.svg";
import { type Locale } from "@/i18n/config";
import { useI18n } from "@/i18n/I18nProvider";

const navItems = [
  { href: "/", key: "nav.home" },
  { href: "/#mission", key: "nav.about" },
  { href: "/#tiers", key: "nav.pricing" },
] as const;

export default function GlobalNavbar() {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const { t, locale, setLocale, localeLabels } = useI18n();
  const nextLocale: Locale = locale === "en" ? "ar" : "en";

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
          aria-label={t("nav.toggleMenu")}
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
            {t(item.key)}
          </a>
        ))}

        <button
          type="button"
          className="lang-toggle"
          aria-label={t("nav.language")}
          onClick={() => setLocale(nextLocale)}
        >
          <span className={`lang-pill ${locale === "en" ? "active" : ""}`}>{localeLabels.en}</span>
          <span className={`lang-pill ${locale === "ar" ? "active" : ""}`}>{localeLabels.ar}</span>
        </button>

        <Link href="/login" className="login-btn" onClick={() => setMenuOpen(false)}>
          <span className="login-lock" aria-hidden />
          <span>{t("nav.login")}</span>
        </Link>
      </nav>
    </header>
  );
}
