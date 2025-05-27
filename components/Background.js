// components/Background.js
import React, { useEffect, useState, useRef } from "react";
import { Box, keyframes, usePrefersReducedMotion, useTheme } from "@chakra-ui/react";

const gradientShift = keyframes`
  0% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
`;

function AnimatedSvg() {
  const svgRef = useRef(null);
  useEffect(() => {
    const svg = svgRef.current;
    if (!svg) return;

    const circles = svg.querySelectorAll("circle");
    let idx = 0;
    const interval = setInterval(() => {
      circles.forEach((c, i) => {
        c.style.opacity = i === idx ? "1" : "0.25";
      });
      idx = (idx + 1) % circles.length;
    }, 1200);

    return () => clearInterval(interval);
  }, []);

  return (
    <svg
      ref={svgRef}
      style={{ position: "absolute", inset: 0, pointerEvents: "none", zIndex: 0 }}
      viewBox="0 0 100 100"
      preserveAspectRatio="none"
    >
      <circle cx="20" cy="30" r="15" fill="rgba(255, 72, 142, 0.4)" />
      <circle cx="50" cy="70" r="20" fill="rgba(72, 255, 230, 0.3)" />
      <circle cx="80" cy="40" r="12" fill="rgba(255, 200, 50, 0.3)" />
    </svg>
  );
}

export default function Background({
  duration = "30s",
  pink = "#FF488E",
  cyan = "#48FFE6",
  secondary = "#44303D",
}) {
  const prefersReducedMotion = usePrefersReducedMotion();
  const theme = useTheme();

  const [offset, setOffset] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMove = (e) => {
      setOffset({
        x: (e.clientX / window.innerWidth - 0.5) * 20,
        y: (e.clientY / window.innerHeight - 0.5) * 20,
      });
    };
    window.addEventListener("mousemove", handleMove);
    return () => window.removeEventListener("mousemove", handleMove);
  }, []);

  return (
    <Box
      position="fixed"
      inset={0}
      zIndex={-1}
      style={{
        transform: `translate(${offset.x}px, ${offset.y}px)`,
        transition: "transform 0.1s ease-out",
      }}
      _before={{
        content: '""',
        position: "absolute",
        inset: 0,
        bgGradient: `linear-gradient(270deg, ${pink}, ${cyan}, ${secondary}, ${pink})`,
        backgroundSize: "1000% 1000%",
        animation: prefersReducedMotion ? undefined : `${gradientShift} ${duration} ease infinite`,
        filter: "blur(80px)",
        opacity: 0.7,
        borderRadius: "2xl",
        pointerEvents: "none",
        transform: "translateZ(0)",
        zIndex: 0,
      }}
      _after={{
        content: '""',
        position: "absolute",
        top: "25%",
        left: "-10%",
        width: "30rem",
        height: "30rem",
        bgGradient: `radial-gradient(circle at center, ${pink} 0%, transparent 70%)`,
        filter: "blur(130px)",
        opacity: 0.4,
        borderRadius: "50%",
        pointerEvents: "none",
        transform: "translateZ(0)",
        zIndex: 0,
      }}
    >
      {/* Additional glow blobs */}
      <Box
        position="absolute"
        top="20%"
        right="10%"
        width="25rem"
        height="25rem"
        bgGradient={`radial-gradient(circle at center, ${theme.colors.glowCyan || "rgba(72, 255, 230, 0.3)"} 0%, transparent 80%)`}
        filter="blur(100px)"
        opacity={0.3}
        borderRadius="50%"
        animation={prefersReducedMotion ? undefined : `${gradientShift} 35s ease infinite`}
        animationDelay="5s"
        pointerEvents="none"
        zIndex={0}
      />

      <Box
        position="absolute"
        bottom="15%"
        left="5%"
        width="20rem"
        height="20rem"
        bgGradient={`radial-gradient(circle at center, ${theme.colors.glowPink || "rgba(255, 72, 142, 0.4)"} 0%, transparent 80%)`}
        filter="blur(110px)"
        opacity={0.25}
        borderRadius="50%"
        animation={prefersReducedMotion ? undefined : `${gradientShift} 40s ease infinite reverse`}
        animationDelay="2s"
        pointerEvents="none"
        zIndex={0}
      />

      {/* Animated SVG overlay */}
      <AnimatedSvg />
    </Box>
  );
}