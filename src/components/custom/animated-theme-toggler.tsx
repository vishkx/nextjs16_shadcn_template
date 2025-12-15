"use client";

import type { ComponentPropsWithoutRef } from "react";
import { useCallback, useRef, useSyncExternalStore } from "react";
import { Moon, Sun } from "lucide-react";
import { flushSync } from "react-dom";
import { useTheme } from "next-themes";

import { Button } from "@/components/ui/button";

type StartViewTransition = (callback: () => void) => { ready: Promise<void> };

interface AnimatedThemeTogglerProps
  extends ComponentPropsWithoutRef<"button"> {
  duration?: number;
}

function useIsMounted() {
  return useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );
}

export const AnimatedThemeToggler = ({
  duration = 400,
  ...props
}: AnimatedThemeTogglerProps) => {
  const { resolvedTheme, setTheme } = useTheme();
  const buttonRef = useRef<HTMLButtonElement>(null);
  const isMounted = useIsMounted();

  // Derive isDark directly from resolvedTheme (undefined treated as light for SSR)
  // Only use resolvedTheme after mount to avoid hydration mismatch
  const isDark = isMounted && resolvedTheme === "dark";

  const toggleTheme = useCallback(async () => {
    if (!buttonRef.current) return;

    const nextTheme = isDark ? "light" : "dark";
    const startViewTransition = (
      document as Document & { startViewTransition?: StartViewTransition }
    ).startViewTransition?.bind(document);

    const runThemeToggle = () => {
      flushSync(() => {
        setTheme(nextTheme);
      });
    };

    if (!startViewTransition) {
      runThemeToggle();
      return;
    }

    const transition = startViewTransition(runThemeToggle);
    await transition.ready;

    const { top, left, width, height } =
      buttonRef.current.getBoundingClientRect();
    const x = left + width / 2;
    const y = top + height / 2;
    const maxRadius = Math.hypot(
      Math.max(left, window.innerWidth - left),
      Math.max(top, window.innerHeight - top)
    );

    document.documentElement.animate(
      {
        clipPath: [
          `circle(0px at ${x}px ${y}px)`,
          `circle(${maxRadius}px at ${x}px ${y}px)`,
        ],
      },
      {
        duration,
        easing: "ease-in-out",
        pseudoElement: "::view-transition-new(root)",
      }
    );
  }, [isDark, setTheme, duration]);

  // Render consistent markup during SSR to avoid hydration mismatch
  // The dark: classes will work correctly once the theme is applied on the client
  return (
    <Button
      variant="outline"
      size="icon"
      onClick={toggleTheme}
      {...props}
    >
      <Sun
        className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0"
      />
      <Moon
        className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100"
      />
      <span ref={buttonRef} className="sr-only">Toggle theme</span>
    </Button>
  );
};
