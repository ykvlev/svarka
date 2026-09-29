"use client";

import { NAV_LINKS, SITE } from "@/lib/site";

export default function SiteHeader({ onRequest }: { onRequest: () => void }) {
  return (
    <header className="nav">
      <a className="brand" href="#top">
        <b>К</b>
        <span>
          {SITE.brand.toUpperCase()}
          <small>{SITE.city.toUpperCase()}</small>
        </span>
      </a>
      <nav aria-label="Разделы страницы">
        {NAV_LINKS.map((link) => (
          <a key={link.href} href={link.href}>
            {link.label}
          </a>
        ))}
      </nav>
      <button className="nav-request" type="button" onClick={onRequest}>
        Оставить заявку
      </button>
    </header>
  );
}
