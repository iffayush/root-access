"use client";

import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { SplitText } from "gsap/SplitText";
import { useRef, type ReactNode } from "react";
import { isPreloadGateReleased, onPreloadGateRelease } from "@/lib/preload-gate";

gsap.registerPlugin(useGSAP, SplitText);

const FIRST_VISIT = 3.2;
const RETURN_VISIT = 1.2;

type HeroMotionProps = {
  children: ReactNode;
};

export function HeroMotion({ children }: HeroMotionProps) {
  const root = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const scope = root.current;
      if (!scope) {
        return;
      }

      const media = gsap.matchMedia();

      media.add("(prefers-reduced-motion: reduce)", () => {
        document.documentElement.classList.remove("motion");
      });

      media.add("(prefers-reduced-motion: no-preference)", () => {
        const failsafe = window.setTimeout(() => {
          document.documentElement.classList.remove("motion");
        }, 9000);

        const splits: SplitText[] = [];
        const lineInners = scope.querySelectorAll<HTMLElement>(".hero-line-inner");

        try {
          lineInners.forEach((line) => {
            splits.push(
              SplitText.create(line, {
                type: "words",
                mask: "words",
                aria: "auto",
                ignore: ".hero-secure-sizer",
              }),
            );
          });
        } catch {
          document.documentElement.classList.remove("motion");
          window.clearTimeout(failsafe);
          return;
        }

        const words = splits.flatMap((item) => item.words);
        const heading = scope.querySelector<HTMLElement>(".hero-title");
        if (heading) {
          gsap.set(heading, { opacity: 1 });
        }
        const strokes = scope.querySelectorAll<SVGGeometryElement>(".hero-stroke path");
        const coords = scope.querySelectorAll<SVGTextElement>(".hero-coord");
        const reveals = scope.querySelectorAll<HTMLElement>(".hero-reveal");
        const secure = scope.querySelector<HTMLElement>(".hero-secure-live");
        const status = document.querySelector<HTMLElement>(".status");

        if (!secure) {
          document.documentElement.classList.remove("motion");
          window.clearTimeout(failsafe);
          splits.forEach((item) => item.revert());
          return;
        }

        const seen = readSeen();
        const scale = seen ? RETURN_VISIT / FIRST_VISIT : 1;
        const at = (time: number) => time * scale;

        gsap.set(words, { yPercent: 120 });

        const timeline = gsap.timeline({
          paused: true,
          defaults: { overwrite: "auto" },
          onComplete: () => {
            window.clearTimeout(failsafe);
            document.documentElement.classList.add("is-live");
            writeSeen();
            scope.classList.remove("is-animating");
          },
        });

        scope.classList.add("is-animating");

        coords.forEach((node) => {
          const target = Number(node.dataset.target ?? "0");
          const axis = node.dataset.axis ?? "";
          const state = { value: 0 };
          timeline.to(
            state,
            {
              value: target,
              duration: at(0.55),
              ease: "none",
              onUpdate: () => {
                node.textContent = `${axis} ${state.value.toFixed(3).padStart(7, "0")}`;
              },
            },
            0,
          );
        });

        timeline.fromTo(
          strokes,
          { strokeDashoffset: 1 },
          { strokeDashoffset: 0, duration: at(0.7), ease: "none" },
          at(0.4),
        );

        const wordDuration = at(1.45);
        const wordStagger = 0.18 * scale;
        timeline.to(
          words,
          { yPercent: 0, duration: wordDuration, ease: "expo.out", stagger: wordStagger },
          at(1.2),
        );

        const secureWord = words.findIndex((word) => word.querySelector(".hero-secure-live"));
        const widthAxis = { value: 75 };
        timeline.to(
          widthAxis,
          {
            value: 100,
            duration: wordDuration,
            ease: "expo.out",
            onUpdate: () => {
              secure.style.fontVariationSettings = `"wdth" ${widthAxis.value.toFixed(2)}`;
            },
          },
          at(1.2) + Math.max(secureWord, 0) * wordStagger,
        );

        const revealAt = at(2.1);
        const revealTargets = [...reveals, ...(status ? [status] : [])];
        timeline.to(
          revealTargets,
          { opacity: 1, y: 0, duration: at(0.6), ease: "expo.out", stagger: 0.08 * scale },
          revealAt,
        );

        // Hold the intro behind the preload curtain; play it as the curtain
        // starts lifting so the reveal is seamless.
        let releaseCleanup: (() => void) | undefined;
        if (isPreloadGateReleased()) {
          timeline.play(0);
        } else {
          releaseCleanup = onPreloadGateRelease(() => timeline.play(0));
        }

        return () => {
          window.clearTimeout(failsafe);
          timeline.kill();
          splits.forEach((item) => item.revert());
          scope.classList.remove("is-animating");
          releaseCleanup?.();
        };
      });

      return () => media.revert();
    },
    { scope: root },
  );

  return (
    <div ref={root} className="contents">
      {children}
    </div>
  );
}

function readSeen() {
  try {
    return sessionStorage.getItem("hero-intro") === "seen";
  } catch {
    return false;
  }
}

function writeSeen() {
  try {
    sessionStorage.setItem("hero-intro", "seen");
  } catch {
    // Session storage can be blocked. The intro still plays.
  }
}
