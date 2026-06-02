"use client";

import { useRef, type ReactNode } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Lenis from "lenis";

gsap.registerPlugin(useGSAP, ScrollTrigger);

type SmoothScrollProviderProps = {
  children: ReactNode;
};

export function SmoothScrollProvider({ children }: SmoothScrollProviderProps) {
  const scopeRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const root = scopeRef.current;
      if (!root) return;

      const prefersReducedMotion = window.matchMedia(
        "(prefers-reduced-motion: reduce)",
      ).matches;

      let lenis: Lenis | null = null;
      let ticker: ((time: number) => void) | null = null;

      if (!prefersReducedMotion) {
        lenis = new Lenis({
          duration: 1.12,
          lerp: 0.08,
          smoothWheel: true,
          wheelMultiplier: 0.9,
        });

        lenis.on("scroll", ScrollTrigger.update);
        ticker = (time: number) => {
          lenis?.raf(time * 1000);
        };
        gsap.ticker.add(ticker);
        gsap.ticker.lagSmoothing(0);
      }

      const mm = gsap.matchMedia();

      mm.add(
        {
          isDesktop: "(min-width: 960px)",
          isTablet: "(min-width: 700px) and (max-width: 959px)",
          reduceMotion: "(prefers-reduced-motion: reduce)",
        },
        (context) => {
          const { isDesktop, reduceMotion } = context.conditions ?? {};

          if (reduceMotion) {
            gsap.set(
              [
                ".js-header",
                ".js-hero-item",
                ".js-reveal",
                ".js-card",
                ".js-live-stat",
              ],
              {
                autoAlpha: 1,
                y: 0,
                scale: 1,
                clearProps: "transform,visibility,opacity",
              },
            );
            return;
          }

          gsap.defaults({ duration: 0.82, ease: "power3.out" });

          gsap.set(".js-header", { autoAlpha: 0, y: -18 });
          gsap.set(".js-hero-item", { autoAlpha: 0, y: 42 });
          gsap.set(".js-reveal", { autoAlpha: 0, y: 42 });
          gsap.set(".js-card", { autoAlpha: 0, y: 44, scale: 0.985 });
          gsap.set(".js-live-stat", { autoAlpha: 0, y: 24, scale: 0.95 });

          gsap
            .timeline({ delay: 0.12 })
            .to(".js-header", { autoAlpha: 1, y: 0, duration: 0.6 })
            .to(
              ".js-hero-item",
              {
                autoAlpha: 1,
                y: 0,
                stagger: 0.12,
                duration: 0.9,
              },
              "-=0.22",
            );

          gsap.to(".js-hero-media", {
            yPercent: isDesktop ? 10 : 4,
            ease: "none",
            scrollTrigger: {
              trigger: ".hero-section",
              start: "top top",
              end: "bottom top",
              scrub: 0.8,
            },
          });

          ScrollTrigger.batch(".js-reveal", {
            start: "top 84%",
            once: true,
            onEnter: (elements) => {
              gsap.to(elements, {
                autoAlpha: 1,
                y: 0,
                stagger: 0.08,
                overwrite: true,
              });
            },
          });

          ScrollTrigger.batch(".js-card", {
            start: "top 86%",
            once: true,
            interval: 0.08,
            batchMax: 4,
            onEnter: (elements) => {
              gsap.to(elements, {
                autoAlpha: 1,
                y: 0,
                scale: 1,
                stagger: 0.08,
                overwrite: true,
              });
            },
          });

          if (isDesktop) {
            const liveTimeline = gsap.timeline({
              scrollTrigger: {
                trigger: ".js-live-pin",
                start: "top top",
                end: "+=820",
                scrub: 1,
                pin: true,
              },
            });

            liveTimeline
              .to(".js-live-visual", { scale: 1.035, y: -24, duration: 1 })
              .to(
                ".js-live-stat",
                {
                  autoAlpha: 1,
                  y: 0,
                  scale: 1,
                  stagger: 0.12,
                  duration: 0.7,
                },
                0.08,
              );
          } else {
            gsap.to(".js-live-stat", {
              autoAlpha: 1,
              y: 0,
              scale: 1,
              stagger: 0.1,
              scrollTrigger: {
                trigger: ".live-stats",
                start: "top 86%",
                once: true,
              },
            });
          }

          const galleryTrack = root.querySelector<HTMLElement>(".js-gallery-track");
          if (galleryTrack && isDesktop) {
            gsap.to(galleryTrack, {
              x: () => {
                const overflow = galleryTrack.scrollWidth - window.innerWidth + 96;
                return overflow > 0 ? -overflow : 0;
              },
              ease: "none",
              scrollTrigger: {
                trigger: ".js-gallery",
                start: "top 68%",
                end: () => `+=${Math.max(720, galleryTrack.scrollWidth * 0.55)}`,
                scrub: 1,
                invalidateOnRefresh: true,
              },
            });
          }

          gsap.to(".js-cta-media", {
            scale: 1.08,
            yPercent: -7,
            ease: "none",
            scrollTrigger: {
              trigger: ".final-cta-section",
              start: "top bottom",
              end: "bottom top",
              scrub: 1,
            },
          });
        },
        root,
      );

      const refresh = () => ScrollTrigger.refresh();
      window.addEventListener("load", refresh);

      return () => {
        window.removeEventListener("load", refresh);
        mm.revert();
        if (ticker) gsap.ticker.remove(ticker);
        lenis?.destroy();
      };
    },
    { scope: scopeRef },
  );

  return (
    <div ref={scopeRef} className="smooth-root">
      {children}
    </div>
  );
}

