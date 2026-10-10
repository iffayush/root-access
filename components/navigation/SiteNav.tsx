"use client";

import Link from "next/link";
import { useEffect, useId, useRef, useState, type KeyboardEvent } from "react";
import { PageGrid } from "@/components/layout/PageGrid";
import { siteConfig } from "@/lib/site-config";

function Status({ className = "" }: { className?: string }) {
  const classes = className ? `status ${className}` : "status";

  return (
    <p className={classes} aria-label="System status: operational">
      <span aria-hidden="true" className="status-readout">
        <span className="status-dot" />
        System / Operational
      </span>
    </p>
  );
}

export function SiteNav() {
  const [open, setOpen] = useState(false);
  const panelId = useId();
  const headerRef = useRef<HTMLElement>(null);
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const firstLinkRef = useRef<HTMLAnchorElement>(null);
  const wasOpen = useRef(false);

  useEffect(() => {
    if (!open) {
      return;
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    firstLinkRef.current?.focus();

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [open]);

  useEffect(() => {
    const media = window.matchMedia("(min-width: 64rem)");
    const onChange = () => {
      if (media.matches) {
        setOpen(false);
      }
    };

    media.addEventListener("change", onChange);
    return () => media.removeEventListener("change", onChange);
  }, []);

  useEffect(() => {
    if (wasOpen.current && !open) {
      menuButtonRef.current?.focus();
    }
    wasOpen.current = open;
  }, [open]);

  function onKeyDown(event: KeyboardEvent<HTMLElement>) {
    if (event.key === "Escape") {
      setOpen(false);
      return;
    }

    if (!open || event.key !== "Tab" || !headerRef.current) {
      return;
    }

    const focusable = [...headerRef.current.querySelectorAll<HTMLElement>("a[href], button:not([disabled])")].filter(
      (element) => element.getClientRects().length > 0,
    );

    if (focusable.length === 0) {
      return;
    }

    const first = focusable[0];
    const last = focusable[focusable.length - 1];

    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  }

  return (
    <header ref={headerRef} className="site-nav" onKeyDown={onKeyDown}>
      <PageGrid className="nav-bar">
        <div className="col-span-12 flex items-center justify-between gap-gutter">
          <Link className="nav-link shrink-0" href="/">
            {siteConfig.name}
          </Link>
          <div className="nav-desktop">
            <nav className="flex items-center gap-6" aria-label="Primary">
              {siteConfig.nav.map((item) => (
                <Link key={item.href} className="nav-link" href={item.href}>
                  {item.label}
                </Link>
              ))}
            </nav>
            <Status />
          </div>
          <button
            ref={menuButtonRef}
            type="button"
            className="nav-toggle"
            aria-expanded={open}
            aria-controls={panelId}
            onClick={() => setOpen((current) => !current)}
          >
            {open ? "Close" : "Menu"}
          </button>
        </div>
      </PageGrid>
      <div id={panelId} className="mobile-panel" data-open={open} inert={!open} aria-hidden={!open}>
        <PageGrid>
          <nav className="mobile-links col-span-12" aria-label="Mobile">
            {siteConfig.nav.map((item, index) => (
              <Link
                key={item.href}
                ref={index === 0 ? firstLinkRef : undefined}
                className="nav-link"
                href={item.href}
                onClick={() => setOpen(false)}
              >
                {item.label}
              </Link>
            ))}
            <Status />
          </nav>
        </PageGrid>
      </div>
    </header>
  );
}
