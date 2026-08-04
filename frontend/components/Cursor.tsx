"use client";

import { useEffect, useState } from "react";
import { motion, useMotionValue, useSpring } from "framer-motion";

/**
 * A playful two-part cursor:
 *  - a precise inner dot that tracks the pointer exactly
 *  - a soft glowing ring that lags behind on a spring, so it "chases" the dot
 * The ring swells and brightens when hovering anything clickable, and it
 * squishes on click. Hidden on touch / small screens.
 */
const Cursor = () => {
  const [enabled, setEnabled] = useState(false);
  const [hovering, setHovering] = useState(false);
  const [pressed, setPressed] = useState(false);

  // Raw pointer position
  const x = useMotionValue(-100);
  const y = useMotionValue(-100);

  // The ring trails behind with a springy, slightly bouncy feel
  const ringX = useSpring(x, { stiffness: 220, damping: 22, mass: 0.6 });
  const ringY = useSpring(y, { stiffness: 220, damping: 22, mass: 0.6 });

  useEffect(() => {
    // Only run the custom cursor on precise pointers (mouse) and wide screens
    const canHover = window.matchMedia(
      "(hover: hover) and (pointer: fine) and (min-width: 768px)"
    ).matches;
    if (!canHover) return;

    setEnabled(true);
    document.documentElement.classList.add("custom-cursor");

    const move = (e: MouseEvent) => {
      x.set(e.clientX);
      y.set(e.clientY);

      // Detect whether we're over something interactive
      const target = e.target as HTMLElement | null;
      const interactive = !!target?.closest(
        'a, button, [role="button"], input, textarea, select, label, .cursor-pointer'
      );
      setHovering(interactive);
    };

    const down = () => setPressed(true);
    const up = () => setPressed(false);
    const leave = () => {
      x.set(-100);
      y.set(-100);
    };

    window.addEventListener("mousemove", move);
    window.addEventListener("mousedown", down);
    window.addEventListener("mouseup", up);
    document.addEventListener("mouseleave", leave);

    return () => {
      window.removeEventListener("mousemove", move);
      window.removeEventListener("mousedown", down);
      window.removeEventListener("mouseup", up);
      document.removeEventListener("mouseleave", leave);
      document.documentElement.classList.remove("custom-cursor");
    };
  }, [x, y]);

  if (!enabled) return null;

  return (
    <>
      {/* Trailing glow ring */}
      <motion.div
        aria-hidden
        className="fixed top-0 left-0 z-[999] rounded-full pointer-events-none mix-blend-multiply"
        style={{
          x: ringX,
          y: ringY,
          translateX: "-50%",
          translateY: "-50%",
        }}
        animate={{
          width: hovering ? 64 : 34,
          height: hovering ? 64 : 34,
          backgroundColor: hovering
            ? "rgba(189,47,111,0.18)"
            : "rgba(122,32,72,0.10)",
          borderColor: hovering
            ? "rgba(189,47,111,0.9)"
            : "rgba(122,32,72,0.55)",
          scale: pressed ? 0.7 : 1,
        }}
        transition={{ type: "spring", stiffness: 300, damping: 20 }}
      >
        <div
          className="h-full w-full rounded-full border"
          style={{ borderColor: "inherit", boxShadow: "0 0 22px 2px rgba(189,47,111,0.25)" }}
        />
      </motion.div>

      {/* Precise inner dot */}
      <motion.div
        aria-hidden
        className="fixed top-0 left-0 z-[1000] rounded-full pointer-events-none bg-[#7A2048]"
        style={{
          x,
          y,
          translateX: "-50%",
          translateY: "-50%",
        }}
        animate={{
          width: hovering ? 6 : 8,
          height: hovering ? 6 : 8,
          scale: pressed ? 0.6 : 1,
        }}
        transition={{ type: "spring", stiffness: 500, damping: 28 }}
      />
    </>
  );
};

export default Cursor;
