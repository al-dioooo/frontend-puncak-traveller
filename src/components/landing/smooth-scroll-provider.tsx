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
          const headerTargets = root.querySelectorAll(".js-header");
          const heroTargets = root.querySelectorAll(".js-hero-item");
          const revealTargets = root.querySelectorAll(".js-reveal");
          const cardTargets = root.querySelectorAll(".js-card");
          const liveStatTargets = root.querySelectorAll(".js-live-stat");
          const checkoutTargets = root.querySelectorAll(".js-checkout-step");
          const setTargets = (
            targets: NodeListOf<Element> | Element[],
            vars: gsap.TweenVars,
          ) => {
            if (targets.length > 0) {
              gsap.set(targets, vars);
            }
          };

          if (reduceMotion) {
            setTargets(
              [
                ...headerTargets,
                ...heroTargets,
                ...revealTargets,
                ...cardTargets,
                ...liveStatTargets,
                ...checkoutTargets,
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

          setTargets(headerTargets, { autoAlpha: 0, y: -18 });
          setTargets(heroTargets, { autoAlpha: 0, y: 42 });
          setTargets(revealTargets, { autoAlpha: 0, y: 42 });
          setTargets(cardTargets, { autoAlpha: 0, y: 44, scale: 0.985 });
          setTargets(liveStatTargets, { autoAlpha: 0, y: 24, scale: 0.95 });
          setTargets(checkoutTargets, { autoAlpha: 0, y: 28 });

          gsap
            .timeline()
            .to(headerTargets, { autoAlpha: 1, y: 0, duration: 0.6 })
            .to(
              heroTargets,
              {
                autoAlpha: 1,
                y: 0,
                stagger: 0.12,
                duration: 0.9,
              },
              "-=0.22",
            )
            .to(
              checkoutTargets,
              {
                autoAlpha: 1,
                y: 0,
                duration: 0.68,
                stagger: 0.06,
              },
              heroTargets.length > 0 ? "-=0.35" : 0,
            );

          const heroMedia = root.querySelector(".js-hero-media");
          const heroTrigger = root.querySelector(
            ".hero-section, .page-hero, .event-detail-hero, .auth-page",
          );
          if (heroMedia && heroTrigger) {
            gsap.to(heroMedia, {
              yPercent: isDesktop ? 10 : 4,
              ease: "none",
              scrollTrigger: {
                trigger: heroTrigger,
                start: "top top",
                end: "bottom top",
                scrub: 0.8,
              },
            });
          }

          if (revealTargets.length > 0) {
            ScrollTrigger.batch([...revealTargets], {
              start: "top 92%",
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
          }

          if (cardTargets.length > 0) {
            ScrollTrigger.batch([...cardTargets], {
              start: "top 92%",
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
          }

          const livePin = root.querySelector(".js-live-pin");
          const liveVisual = root.querySelector(".js-live-visual");
          if (isDesktop && livePin && liveVisual) {
            const liveTimeline = gsap.timeline({
              scrollTrigger: {
                trigger: livePin,
                start: "top top",
                end: "+=820",
                scrub: 1,
                pin: true,
              },
            });

            liveTimeline.to(liveVisual, { scale: 1.035, y: -24, duration: 1 });

            if (liveStatTargets.length > 0) {
              liveTimeline.to(
                liveStatTargets,
                {
                  autoAlpha: 1,
                  y: 0,
                  scale: 1,
                  stagger: 0.12,
                  duration: 0.7,
                },
                0.08,
              );
            }
          } else if (liveStatTargets.length > 0) {
            gsap.to(liveStatTargets, {
              autoAlpha: 1,
              y: 0,
              scale: 1,
              stagger: 0.1,
              scrollTrigger: {
                trigger: ".live-stats",
                start: "top 92%",
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

          const ctaMedia = root.querySelector(".js-cta-media");
          const ctaSection = root.querySelector(".final-cta-section");
          if (ctaMedia && ctaSection) {
            gsap.to(ctaMedia, {
              scale: 1.08,
              yPercent: -7,
              ease: "none",
              scrollTrigger: {
                trigger: ctaSection,
                start: "top bottom",
                end: "bottom top",
                scrub: 1,
              },
            });
          }
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
