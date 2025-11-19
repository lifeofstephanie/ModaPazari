"use client";

import { useEffect, useRef } from "react";

const Cursor = () => {
  const cursorRef = useRef<HTMLDivElement>(null);
  const glowStyle = {
    boxShadow: "0 0 8px #7a2048, 0 0 16px #bd2f6f, 0 0 24px #631639",
    // Add the transform property here to ensure movement works with inline styles
    transform: "translate3d(var(--x), var(--y), 0)",
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (cursorRef.current) {
        const { clientX: x, clientY: y } = e;
        cursorRef.current.style.transform = `translate3d(${x}px, ${y}px, 0)`;
      }
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  return (
    <div
      ref={cursorRef}
      className="hidden md:block fixed top-0 left-0 w-2 h-2 bg-[#7A2048] rounded-full pointer-events-none z-50 shadow-cursor transition-transform duration-75"
      style={glowStyle}
    />
  );
};

export default Cursor;
