// components/Background.js
import { Box, keyframes, usePrefersReducedMotion, useTheme } from "@chakra-ui/react";

const gradientShift = keyframes`
  0% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
`;

export default function Background() {
  const prefersReducedMotion = usePrefersReducedMotion();
  const theme = useTheme();

  return (
    <Box
      position="fixed"
      inset={0}
      zIndex={-1}
      _before={{
        content: '""',
        position: "absolute",
        inset: 0,
        bgGradient:
          `linear-gradient(270deg, ${theme.colors.primaryBg}, ${theme.colors.secondaryBg}, #2C1F2B, #493D4A, ${theme.colors.primaryBg})`,
        backgroundSize: "1000% 1000%",
        animation: prefersReducedMotion ? undefined : `${gradientShift} 30s ease infinite`,
        filter: "blur(60px)",
        opacity: 0.7,
        borderRadius: "2xl",
        pointerEvents: "none",
        transform: "translateZ(0)",
      }}
      _after={{
        content: '""',
        position: "absolute",
        top: "25%",
        left: "-10%",
        width: "30rem",
        height: "30rem",
        bgGradient: `radial-gradient(circle at center, ${theme.colors.neonPink} 0%, transparent 70%)`,
        filter: "blur(120px)",
        opacity: 0.4,
        borderRadius: "50%",
        pointerEvents: "none",
        transform: "translateZ(0)",
      }}
    />
  );
}