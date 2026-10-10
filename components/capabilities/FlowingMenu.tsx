"use client";

import { useRef, useEffect, useState, useCallback, type MouseEvent } from "react";
import gsap from "gsap";

import "./FlowingMenu.css";

export type FlowingMenuItem = {
  text: string;
  image: string;
};

type FlowingMenuProps = {
  items?: readonly FlowingMenuItem[];
  speed?: number;
  textColor?: string;
  bgColor?: string;
  marqueeBgColor?: string;
  marqueeTextColor?: string;
  borderColor?: string;
  activeIndex?: number;
  onActiveIndexChange?: (index: number) => void;
};

const animationDefaults = { duration: 0.6, ease: "expo.out" };

function findClosestEdge(mouseX: number, mouseY: number, width: number, height: number) {
  const topEdgeDist = distMetric(mouseX, mouseY, width / 2, 0);
  const bottomEdgeDist = distMetric(mouseX, mouseY, width / 2, height);
  return topEdgeDist < bottomEdgeDist ? "top" : "bottom";
}

function distMetric(x: number, y: number, x2: number, y2: number) {
  const xDiff = x - x2;
  const yDiff = y - y2;
  return xDiff * xDiff + yDiff * yDiff;
}

export function FlowingMenu({
  items = [],
  speed = 15,
  textColor = "#242423",
  bgColor = "#e8eddf",
  marqueeBgColor = "#242423",
  marqueeTextColor = "#e8eddf",
  borderColor = "color-mix(in srgb, #333533 25%, transparent)",
  activeIndex,
  onActiveIndexChange,
}: FlowingMenuProps) {
  return (
    <div className="flowing-menu menu-wrap" style={{ backgroundColor: bgColor }}>
      <nav className="menu" aria-label="Capability domains">
        {items.map((item, idx) => (
          <MenuItem
            key={item.text}
            {...item}
            index={idx}
            speed={speed}
            textColor={textColor}
            marqueeBgColor={marqueeBgColor}
            marqueeTextColor={marqueeTextColor}
            borderColor={borderColor}
            isActive={activeIndex === idx}
            onActivate={() => onActiveIndexChange?.(idx)}
          />
        ))}
      </nav>
    </div>
  );
}

type MenuItemProps = FlowingMenuItem & {
  index: number;
  speed: number;
  textColor: string;
  marqueeBgColor: string;
  marqueeTextColor: string;
  borderColor: string;
  isActive: boolean;
  onActivate: () => void;
};

function MenuItem({
  text,
  image,
  index,
  speed,
  textColor,
  marqueeBgColor,
  marqueeTextColor,
  borderColor,
  isActive,
  onActivate,
}: MenuItemProps) {
  const itemRef = useRef<HTMLDivElement>(null);
  const marqueeRef = useRef<HTMLDivElement>(null);
  const marqueeInnerRef = useRef<HTMLDivElement>(null);
  const animationRef = useRef<gsap.core.Tween | null>(null);
  const [repetitions, setRepetitions] = useState(4);
  const [reducedMotion, setReducedMotion] = useState(false);
  const [hoverCapable, setHoverCapable] = useState(true);

  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => setReducedMotion(media.matches);
    sync();
    media.addEventListener("change", sync);
    return () => media.removeEventListener("change", sync);
  }, []);

  useEffect(() => {
    const media = window.matchMedia("(hover: hover) and (pointer: fine)");
    const sync = () => setHoverCapable(media.matches);
    sync();
    media.addEventListener("change", sync);
    return () => media.removeEventListener("change", sync);
  }, []);

  useEffect(() => {
    const calculateRepetitions = () => {
      if (!marqueeInnerRef.current) return;

      const marqueeContent = marqueeInnerRef.current.querySelector<HTMLElement>(".marquee__part");
      if (!marqueeContent) return;

      const contentWidth = marqueeContent.offsetWidth;
      const viewportWidth = window.innerWidth;
      const needed = Math.ceil(viewportWidth / contentWidth) + 2;
      setRepetitions(Math.max(4, needed));
    };

    calculateRepetitions();
    window.addEventListener("resize", calculateRepetitions);
    return () => window.removeEventListener("resize", calculateRepetitions);
  }, [text, image]);

  useEffect(() => {
    if (reducedMotion) {
      animationRef.current?.kill();
      animationRef.current = null;
      return;
    }

    const setupMarquee = () => {
      if (!marqueeInnerRef.current) return;

      const marqueeContent = marqueeInnerRef.current.querySelector<HTMLElement>(".marquee__part");
      if (!marqueeContent) return;

      const contentWidth = marqueeContent.offsetWidth;
      if (contentWidth === 0) return;

      animationRef.current?.kill();

      animationRef.current = gsap.to(marqueeInnerRef.current, {
        x: -contentWidth,
        duration: speed,
        ease: "none",
        repeat: -1,
      });
    };

    const timer = window.setTimeout(setupMarquee, 50);

    return () => {
      window.clearTimeout(timer);
      animationRef.current?.kill();
    };
  }, [text, image, repetitions, speed, reducedMotion]);

  const revealMarquee = useCallback(
    (edge: "top" | "bottom") => {
      if (!marqueeRef.current || !marqueeInnerRef.current) return;

      if (reducedMotion) {
        gsap.set(marqueeRef.current, { y: "0%" });
        gsap.set(marqueeInnerRef.current, { y: "0%" });
        return;
      }

      gsap
        .timeline({ defaults: animationDefaults })
        .set(marqueeRef.current, { y: edge === "top" ? "-101%" : "101%" }, 0)
        .set(marqueeInnerRef.current, { y: edge === "top" ? "101%" : "-101%" }, 0)
        .to([marqueeRef.current, marqueeInnerRef.current], { y: "0%" }, 0);
    },
    [reducedMotion]
  );

  const hideMarquee = useCallback(
    (edge: "top" | "bottom") => {
      if (!marqueeRef.current || !marqueeInnerRef.current) return;

      if (reducedMotion) {
        gsap.set(marqueeRef.current, { y: "101%" });
        gsap.set(marqueeInnerRef.current, { y: "-101%" });
        return;
      }

      gsap
        .timeline({ defaults: animationDefaults })
        .to(marqueeRef.current, { y: edge === "top" ? "-101%" : "101%" }, 0)
        .to(marqueeInnerRef.current, { y: edge === "top" ? "101%" : "-101%" }, 0);
    },
    [reducedMotion]
  );

  useEffect(() => {
    if (hoverCapable) return;

    if (isActive) {
      revealMarquee("bottom");
    } else {
      hideMarquee("bottom");
    }
  }, [hoverCapable, isActive, revealMarquee, hideMarquee]);

  const handlePointer = (ev: MouseEvent<HTMLButtonElement>, entering: boolean) => {
    if (!hoverCapable || !itemRef.current) return;
    const rect = itemRef.current.getBoundingClientRect();
    const x = ev.clientX - rect.left;
    const y = ev.clientY - rect.top;
    const edge = findClosestEdge(x, y, rect.width, rect.height);

    if (entering) {
      onActivate();
      revealMarquee(edge);
    } else {
      hideMarquee(edge);
    }
  };

  const handleClick = () => {
    onActivate();
    if (hoverCapable || !itemRef.current) return;
    revealMarquee("bottom");
  };

  return (
    <div
      className="menu__item"
      ref={itemRef}
      style={{
        borderColor,
        backgroundColor: isActive ? "color-mix(in srgb, var(--color-graphite) 4%, transparent)" : undefined,
      }}
    >
      <button
        type="button"
        className="menu__item-link"
        aria-pressed={isActive}
        onMouseEnter={(ev) => handlePointer(ev, true)}
        onMouseLeave={(ev) => handlePointer(ev, false)}
        onClick={handleClick}
        onFocus={() => {
          onActivate();
          if (!hoverCapable) return;
          revealMarquee("bottom");
        }}
        onBlur={() => {
          if (!hoverCapable) return;
          hideMarquee("bottom");
        }}
        style={{ color: textColor }}
      >
        <span className="font-mono text-[11px] tracking-widest text-[var(--color-graphite)] absolute left-4 top-1/2 -translate-y-1/2 hidden sm:inline">
          CAP_{String(index + 1).padStart(2, "0")}
        </span>
        {text}
      </button>
      <div className="marquee" ref={marqueeRef} style={{ backgroundColor: marqueeBgColor }}>
        <div className="marquee__inner-wrap">
          <div className="marquee__inner" ref={marqueeInnerRef} aria-hidden="true">
            {[...Array(repetitions)].map((_, idx) => (
              <div className="marquee__part" key={idx} style={{ color: marqueeTextColor }}>
                <span>{text}</span>
                <div className="marquee__img" style={{ backgroundImage: `url(${image})` }} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
