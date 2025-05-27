// components/Background.js
import { Box, keyframes, usePrefersReducedMotion } from "@chakra-ui/react";

const gradientShift = keyframes`
  0% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
`;

export default function Background() {
  const prefersReducedMotion = usePrefersReducedMotion();

  return (
    <Box
      position="fixed"
      inset={0}
      zIndex={0}
      _before={{
        content: '""',
        position: "absolute",
        inset: 0,
        bgGradient:
          "linear-gradient(270deg, #33202E, #44303D, #2C1F2B, #493D4A, #33202E)",
        backgroundSize: "1000% 1000%",
        animation: prefersReducedMotion ? undefined : `${gradientShift} 20s ease infinite`,
        filter: "blur(60px)",
        opacity: 0.6,
        borderRadius: "2xl",
        transform: "translateZ(0)",
        pointerEvents: "none",
        zIndex: -1,
      }}
      _after={{
        content: '""',
        position: "absolute",
        top: "20%",
        left: "-10%",
        width: "30rem",
        height: "30rem",
        bgGradient: "radial-gradient(circle at center, #FF488E 0%, transparent 70%)",
        filter: "blur(120px)",
        opacity: 0.4,
        borderRadius: "50%",
        transform: "translateZ(0)",
        pointerEvents: "none",
        zIndex: -1,
      }}
      bg="primaryBg"
    />
  );
}