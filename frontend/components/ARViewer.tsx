"use client";

import { useEffect, useRef, useState } from "react";

interface TryOnProps {
  overlaySrc: string;
}

export default function CameraTryOn({ overlaySrc }: TryOnProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const initCamera = async () => {
      if (typeof navigator !== "undefined" && navigator.mediaDevices) {
        try {
          const stream = await navigator.mediaDevices.getUserMedia({
            video: true,
          });
          if (videoRef.current) {
            videoRef.current.srcObject = stream;
          }
        } catch (err) {
          console.error("Error accessing camera:", err);
          setTimeout(
            () => setError("Camera not available or permission denied."),
            0
          );
        }
      } else {
        // Wrap in setTimeout to avoid synchronous setState warning
        setTimeout(
          () => setError("Camera not available on this device/browser."),
          0
        );
      }
    };

    initCamera();
  }, []);

  if (error) {
    return <p className="text-red-600 text-center">{error}</p>;
  }

  return (
    <div className="relative w-full max-w-md mx-auto mt-10">
      <video
        ref={videoRef}
        autoPlay
        playsInline
        className="w-full rounded-xl h-fit"
      />
      <img
        src={overlaySrc}
        className="absolute top-24 left-1/2 -translate-x-1/2 w-64 pointer-events-none"
      />
    </div>
  );
}
