// components/StitchEditorModal.js
import React, { useState } from "react";
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  ModalFooter,
  Button,
  Spinner,
  Text,
  Box,
  VStack,
  HStack,
  FormControl,
  FormLabel,
  Select,
  NumberInput,
  NumberInputField,
  useToast,
  useColorModeValue,
} from "@chakra-ui/react";

export default function StitchEditorModal({ fileUrl, onClose }) {
  const [loading, setLoading] = useState(false);
  const [infoMessage, setInfoMessage] = useState("");
  const [fillType, setFillType] = useState("zigzag");
  const [fillSpacing, setFillSpacing] = useState(1.0);
  const toast = useToast();
  const bg = useColorModeValue("whiteAlpha.100", "whiteAlpha.100");
  const borderColor = useColorModeValue("border", "border");

  const performRequest = async (endpoint, body, successMsg, errorMsg) => {
    setLoading(true);
    setInfoMessage("");
    try {
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || errorMsg);
      setInfoMessage(data.message || successMsg);
      if (data.pesUrl) toast({ status: "success", title: successMsg });
    } catch (err) {
      console.error(err);
      setInfoMessage(errorMsg);
      toast({ status: "error", title: errorMsg });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen onClose={onClose} isCentered size="xl">
      <ModalOverlay bg="blackAlpha.700" />
      <ModalContent bg={bg} border="1px solid" borderColor={borderColor} p={4}>
        <ModalHeader>Stitch Editor</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <Text fontSize="sm" mb={4} color="accentAlt" isTruncated>
            File: {fileUrl}
          </Text>

          {loading && (
            <Text color="accent" mb={2}>
              <Spinner size="sm" mr={2} /> Processing…
            </Text>
          )}
          {infoMessage && (
            <Text color="primaryTxt" mb={4}>
              {infoMessage}
            </Text>
          )}

          <Box
            bg="secondaryBg"
            border="1px solid"
            borderColor={borderColor}
            rounded="lg"
            p={4}
            mb={6}
          >
            <Text textAlign="center" color="accentAlt">
              (Preview of SVG / Canvas editor would go here)
            </Text>
          </Box>

          <VStack spacing={4} align="stretch" mb={6}>
            <HStack spacing={3} wrap="wrap">
              <Button
                onClick={() =>
                  performRequest(
                    "/api/stitch-increase-density",
                    { fileUrl },
                    "Density increased!",
                    "Failed to increase density."
                  )
                }
                isDisabled={loading}
                colorScheme="accent"
                size="sm"
              >
                Increase Density
              </Button>
              <Button
                onClick={() =>
                  performRequest(
                    "/api/stitch-simplify",
                    { fileUrl },
                    "Stitches simplified!",
                    "Failed to simplify stitches."
                  )
                }
                isDisabled={loading}
                colorScheme="accent"
                size="sm"
              >
                Simplify Paths
              </Button>
              <Button
                onClick={() =>
                  performRequest(
                    "/api/stitch-optimize",
                    { fileUrl },
                    "Stitches optimized!",
                    "Failed to optimize stitches."
                  )
                }
                isDisabled={loading}
                colorScheme="accent"
                size="sm"
              >
                Optimize Order
              </Button>
            </HStack>

            <Box bg="secondaryBg" p={4} rounded="lg">
              <Text fontWeight="semibold" mb={2} color="primaryTxt">
                Fill & Trim
              </Text>
              <HStack spacing={3} wrap="wrap" mb={4}>
                <FormControl w="auto">
                  <FormLabel fontSize="sm" color="primaryTxt" mb={1}>
                    Fill Type
                  </FormLabel>
                  <Select
                    value={fillType}
                    onChange={(e) => setFillType(e.target.value)}
                    bg="primaryBg"
                    color="primaryTxt"
                    size="sm"
                  >
                    <option value="zigzag">Zig-zag</option>
                    <option value="tatami">Tatami</option>
                  </Select>
                </FormControl>
                <FormControl w="auto">
                  <FormLabel fontSize="sm" color="primaryTxt" mb={1}>
                    Spacing
                  </FormLabel>
                  <NumberInput
                    step={0.1}
                    min={0.1}
                    value={fillSpacing}
                    onChange={(_, v) => setFillSpacing(v)}
                    size="sm"
                    w="16"
                  >
                    <NumberInputField
                      bg="primaryBg"
                      color="primaryTxt"
                    />
                  </NumberInput>
                </FormControl>
                <Button
                  onClick={() =>
                    performRequest(
                      "/api/stitch-fill",
                      { fileUrl, fillType, fillSpacing },
                      `${fillType.charAt(0).toUpperCase() + fillType.slice(1)} fill applied!`,
                      "Failed to apply fill."
                    )
                  }
                  isDisabled={loading}
                  colorScheme="accentAlt"
                  size="sm"
                >
                  Apply Fill
                </Button>
              </HStack>
              <Button
                onClick={() =>
                  performRequest(
                    "/api/stitch-trim",
                    { fileUrl },
                    "Edge trim applied!",
                    "Failed to trim edges."
                  )
                }
                isDisabled={loading}
                colorScheme="red"
                size="sm"
              >
                Trim Edges
              </Button>
            </Box>

            <Box bg="secondaryBg" p={4} rounded="lg">
              <Text fontWeight="semibold" mb={2} color="primaryTxt">
                Tips & Info
              </Text>
              <Text fontSize="sm" color="accentAlt" lineHeight="tall">
                Use “Increase Density” to pack more stitches, “Simplify Paths” to
                decimate vector noise,
                <br />
                “Optimize Order” to minimize jump stitches,
                <br />
                “Apply Fill” to switch between zig-zag or tatami patterns,
                <br />
                and “Trim Edges” to remove stray jump tails.
              </Text>
            </Box>
          </VStack>
        </ModalBody>

        <ModalFooter justifyContent="center">
          <Button onClick={onClose} variant="outline" size="sm">
            Close
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}