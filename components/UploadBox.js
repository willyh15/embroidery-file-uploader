// components/UploadBox.js
import { useCallback, useState } from "react";
import {
  Box,
  Flex,
  Text,
  Input,
  Spinner,
  useToast,
  useColorModeValue,
} from "@chakra-ui/react";

const FLASK_BASE = "https://embroideryfiles.duckdns.org";

export default function UploadBox({ uploading, dropRef, onUploadSuccess }) {
  const [localUploading, setLocalUploading] = useState(false);
  const toast = useToast();
  const busy = uploading || localUploading;

  const prevent = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const uploadFiles = async (files) => {
    const form = new FormData();
    files.forEach((f) => form.append("files", f));

    setLocalUploading(true);
    toast({
      id: "upload",
      title: "Uploading…",
      status: "info",
      isClosable: false,
    });

    try {
      const res = await fetch(`${FLASK_BASE}/upload`, {
        method: "POST",
        body: form,
      });
      if (!res.ok) {
        const text = await res.text().catch(() => "");
        throw new Error(`Server ${res.status}: ${text}`);
      }
      const data = await res.json();
      onUploadSuccess?.(data.urls);
      toast.update("upload", {
        title: "Upload complete!",
        status: "success",
        isClosable: true,
      });
    } catch (err) {
      console.error(err);
      toast.update("upload", {
        title: `Upload failed: ${err.message}`,
        status: "error",
        isClosable: true,
      });
    } finally {
      setLocalUploading(false);
    }
  };

  const handleDrop = useCallback(
    async (e) => {
      prevent(e);
      const files = Array.from(e.dataTransfer.files);
      if (files.length) await uploadFiles(files);
    },
    []
  );

  const handleSelect = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length) await uploadFiles(files);
  };

  const borderColor = useColorModeValue("accent", "accent");
  const bg = useColorModeValue("whiteAlpha.100", "whiteAlpha.100");

  return (
    <Box
      ref={dropRef}
      onDragEnter={prevent}
      onDragOver={prevent}
      onDragLeave={prevent}
      onDrop={handleDrop}
      position="relative"
      bg={bg}
      border="2px dashed"
      borderColor={busy ? "gray.500" : borderColor}
      rounded="xl"
      transition="all 0.2s"
      _hover={!busy && { borderColor: "accent", transform: "scale(1.02)" }}
      cursor={busy ? "not-allowed" : "pointer"}
      opacity={busy ? 0.6 : 1}
      p={8}
      textAlign="center"
    >
      <Flex direction="column" align="center" justify="center">
        {busy && (
          <Spinner
            size="lg"
            thickness="4px"
            mb={4}
            color="accent"
            position="absolute"
            top="1rem"
            right="1rem"
          />
        )}
        <Text fontSize="lg" fontWeight="medium" color="primaryTxt" mb={2}>
          {busy
            ? "Uploading…"
            : "Drag & drop files here or click to select"}
        </Text>
        <Input
          type="file"
          multiple
          onChange={handleSelect}
          disabled={busy}
          position="absolute"
          top={0}
          left={0}
          width="100%"
          height="100%"
          opacity={0}
          cursor={busy ? "not-allowed" : "pointer"}
        />
      </Flex>
    </Box>
  );
}