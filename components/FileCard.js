import { useState, useEffect, useRef } from "react";
import {
  Box,
  Flex,
  Text,
  Badge,
  Button,
  Progress,
  Tooltip,
  Spinner,
  useColorModeValue,
} from "@chakra-ui/react";
import {
  RepeatIcon,
  CheckCircleIcon,
  WarningIcon,
  DownloadIcon,
  ViewIcon,
  EditIcon,
  StarIcon,
} from "@chakra-ui/icons";

export default function FileCard({ file, onConvert, onDownload, onPreview, onEdit }) {
  const [retrying, setRetrying] = useState(false);
  const [countdown, setCountdown] = useState(3);
  const [cooldownActive, setCooldownActive] = useState(false);
  const [isNew, setIsNew] = useState(true);
  const cardRef = useRef(null);

  // Mark “new” for 10s
  useEffect(() => {
    const t = setTimeout(() => setIsNew(false), 10000);
    return () => clearTimeout(t);
  }, []);

  // Countdown timer for retry button
  useEffect(() => {
    if (!retrying || countdown <= 0) return;
    const t = setTimeout(() => setCountdown(c => c - 1), 1000);
    return () => clearTimeout(t);
  }, [retrying, countdown]);

  const handleRetry = async () => {
    setRetrying(true);
    setCountdown(3);
    try {
      await onConvert(file.url);
      setTimeout(() => {
        cardRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
      }, 100);
      setTimeout(() => {
        setRetrying(false);
        setCooldownActive(true);
        setTimeout(() => setCooldownActive(false), 5000);
      }, 3000);
    } catch {
      setRetrying(false);
    }
  };

  const getStageColor = (stage) =>
    ({
      uploading: "blue.300",
      downloading: "blue.500",
      resizing: "yellow.500",
      vectorizing: "orange.500",
      "converting-pes": "purple.500",
      done: "green.600",
      failed: "red.600",
      error: "red.600",
    }[stage] || "gray.400");

  const renderIcon = () => {
    if (file.status === "Uploading" || file.status === "Converting") {
      return <Spinner color="cyan.400" size="sm" />;
    }
    if (file.status === "Converted") {
      return <CheckCircleIcon color="pink.400" />;
    }
    if (file.status === "Error") {
      return <WarningIcon color="red.400" />;
    }
    return null;
  };

  return (
    <Box
      ref={cardRef}
      bg="whiteAlpha.100"
      backdropFilter="blur(10px)"
      border="1px solid"
      borderColor="rgba(255,255,255,0.2)"
      rounded="xl"
      p={4}
      mb={6}
      boxShadow={retrying
        ? "0 0 12px 4px #FF488E"
        : "0 8px 32px rgba(0,0,0,0.18)"
      }
      transition="box-shadow 0.3s ease"
      _hover={{
        boxShadow: "0 0 24px 6px #FF488E",
        cursor: "pointer",
      }}
      data-file-url={file.url}
    >
      <Flex justify="space-between" align="center" mb={4}>
        <Flex align="center" gap={2}>
          <Text fontWeight="bold" isTruncated color="primaryTxt">
            {file.name}
          </Text>
          {isNew && (
            <Badge
              colorScheme="pink"
              rounded="full"
              px={2}
              py={0.5}
              display="flex"
              alignItems="center"
              gap={1}
              fontSize="xs"
            >
              <StarIcon fontSize="xs" /> NEW
            </Badge>
          )}
          {renderIcon()}
        </Flex>
        <Text fontSize="sm" color="primaryTxt">
          {file.status}
        </Text>
      </Flex>

      {file.stage && (
        <Progress
          value={100}
          size="sm"
          colorScheme={getStageColor(file.stage).split(".")[0]}
          bg="whiteAlpha.200"
          mb={4}
          isAnimated
          rounded="md"
        />
      )}

      <Flex wrap="wrap" gap={3} mb={4}>
        {file.uploadProgress != null && file.status === "Uploading" && (
          <Badge colorScheme="blue" px={3} py={1} rounded="full">
            Uploading {file.uploadProgress}%
          </Badge>
        )}

        {file.status === "Uploaded" && (
          <Button
            onClick={() => onConvert(file.url)}
            leftIcon={<RepeatIcon />}
            colorScheme="purple"
            size="sm"
            variant="solid"
            _hover={{ bgGradient: "linear(to-r, neonCyan, neonPink)" }}
          >
            Convert
          </Button>
        )}

        {file.status === "Converting" && (
          <Text fontSize="sm" color="cyan.400" fontWeight="semibold">
            Converting…
          </Text>
        )}

        {file.status === "Converted" && file.pesUrl && (
          <>
            <Button
              as="a"
              href={file.pesUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => onDownload(file.url, "pes")}
              leftIcon={<DownloadIcon />}
              colorScheme="pink"
              size="sm"
              variant="solid"
            >
              Download PES
            </Button>
            <Button
              onClick={() => onPreview(file.pesUrl)}
              leftIcon={<ViewIcon />}
              colorScheme="gray"
              size="sm"
              variant="outline"
            >
              Preview
            </Button>
            <Button
              onClick={() => onEdit(file.url)}
              leftIcon={<EditIcon />}
              colorScheme="teal"
              size="sm"
              variant="outline"
            >
              Edit
            </Button>
          </>
        )}

        {file.status === "Error" && (
          <Tooltip
            label={
              retrying
                ? `Retrying in ${countdown}s`
                : cooldownActive
                ? "Cooldown active"
                : "Retry"
            }
            shouldWrapChildren
            hasArrow
            placement="top"
          >
            <Button
              onClick={handleRetry}
              leftIcon={<RepeatIcon />}
              colorScheme="red"
              size="sm"
              variant="solid"
              disabled={retrying || cooldownActive}
              opacity={retrying || cooldownActive ? 0.5 : 1}
              cursor={retrying || cooldownActive ? "not-allowed" : "pointer"}
            >
              {retrying
                ? `Retrying… (${countdown}s)`
                : cooldownActive
                ? "Cooldown…"
                : "Retry"}
            </Button>
          </Tooltip>
        )}
      </Flex>

      {file.status === "Converted" && (
        <Text fontSize="xs" color="gray.400" userSelect="text" whiteSpace="pre-wrap">
          <strong>Debug Info:</strong> pesUrl: {file.pesUrl || "N/A"}
          {!file.pesUrl && (
            <Text as="div" color="red.400" fontWeight="bold" mt={1}>
              [Missing pesUrl despite Converted status]
            </Text>
          )}
        </Text>
      )}
    </Box>
  );
}