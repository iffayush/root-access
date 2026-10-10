"use client";

import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useRef, type ReactNode } from "react";

gsap.registerPlugin(useGSAP, ScrollTrigger);

export function ScrollMotion({ children }: { children: ReactNode }) {
  const containerRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const scope = containerRef.current;
      if (!scope) return;

      const media = gsap.matchMedia();

      media.add("(prefers-reduced-motion: no-preference)", () => {
        // Section title reveals
        const sectionHeaders = scope.querySelectorAll<HTMLElement>(".section-header");
        sectionHeaders.forEach((header) => {
          gsap.fromTo(
            header,
            { opacity: 0, y: 30 },
            {
              opacity: 1,
              y: 0,
              duration: 0.8,
              ease: "power3.out",
              scrollTrigger: {
                trigger: header,
                start: "top 85%",
                toggleActions: "play none none reverse",
              },
            }
          );
        });

        // Selected Work exhibits reveal
        const exhibits = scope.querySelectorAll<HTMLElement>(".project-exhibit");
        exhibits.forEach((exhibit) => {
          gsap.fromTo(
            exhibit,
            { opacity: 0, y: 50 },
            {
              opacity: 1,
              y: 0,
              duration: 1,
              ease: "power3.out",
              scrollTrigger: {
                trigger: exhibit,
                start: "top 80%",
                toggleActions: "play none none reverse",
              },
            }
          );
        });


        const capabilitiesFlow = scope.querySelector<HTMLElement>(".capabilities-flow");
        const capabilitiesDetail = scope.querySelector<HTMLElement>(".capabilities-detail");
        if (capabilitiesFlow) {
          gsap.fromTo(
            capabilitiesFlow,
            { opacity: 0, y: 40 },
            {
              opacity: 1,
              y: 0,
              duration: 0.85,
              ease: "power3.out",
              scrollTrigger: {
                trigger: capabilitiesFlow,
                start: "top 85%",
                toggleActions: "play none none reverse",
              },
            }
          );
        }
        if (capabilitiesDetail) {
          gsap.fromTo(
            capabilitiesDetail,
            { opacity: 0, y: 32 },
            {
              opacity: 1,
              y: 0,
              duration: 0.85,
              ease: "power3.out",
              delay: 0.08,
              scrollTrigger: {
                trigger: capabilitiesDetail,
                start: "top 85%",
                toggleActions: "play none none reverse",
              },
            }
          );
        }

        // Field Notes rows reveal
        const fieldNoteRows = scope.querySelectorAll<HTMLElement>(".field-note-row");
        if (fieldNoteRows.length > 0) {
          gsap.fromTo(
            fieldNoteRows,
            { opacity: 0, x: -20 },
            {
              opacity: 1,
              x: 0,
              duration: 0.7,
              ease: "power2.out",
              stagger: 0.08,
              scrollTrigger: {
                trigger: fieldNoteRows[0],
                start: "top 85%",
                toggleActions: "play none none reverse",
              },
            }
          );
        }

        // Experience rows reveal
        const experienceRows = scope.querySelectorAll<HTMLElement>(".experience-row");
        if (experienceRows.length > 0) {
          gsap.fromTo(
            experienceRows,
            { opacity: 0, x: -20 },
            {
              opacity: 1,
              x: 0,
              duration: 0.7,
              ease: "power2.out",
              stagger: 0.08,
              scrollTrigger: {
                trigger: experienceRows[0],
                start: "top 85%",
                toggleActions: "play none none reverse",
              },
            }
          );
        }

        const credentialTiles = scope.querySelectorAll<HTMLElement>(".credential-tile");
        if (credentialTiles.length > 0) {
          gsap.fromTo(
            credentialTiles,
            { opacity: 0, y: 48, scale: 0.98 },
            {
              opacity: 1,
              y: 0,
              scale: 1,
              duration: 0.85,
              ease: "power3.out",
              stagger: 0.12,
              scrollTrigger: {
                trigger: credentialTiles[0].closest(".credentials-bento") ?? credentialTiles[0],
                start: "top 82%",
                toggleActions: "play none none reverse",
              },
            }
          );
        }
      });
    },
    { scope: containerRef }
  );

  return <div ref={containerRef}>{children}</div>;
}
