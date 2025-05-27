import React, { useEffect, useRef, useState } from "react";
import isEqual from "lodash.isequal";
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  ModalFooter,
  Box,
  Flex,
  Text,
  Button,
  Slider,
  SliderTrack,
  SliderFilledTrack,
  SliderThumb,
  useColorModeValue,
} from "@chakra-ui/react";

const FLASK_BASE = "https://embroideryfiles.duckdns.org";

export default function StitchPreviewModal({ pngUrl, pesUrl, onClose }) {
  const canvasRef = useRef(null);
  const [segments, setSegments] = useState([]);
  const [colors, setColors] = useState([]);
  const [selected, setSelected] = useState(null);

  // zoom and pan state
  const [scale, setScale] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [dragging, setDragging] = useState(false);
  const dragStart = useRef({ x: 0, y: 0 });

  // opacity for stitch layer overlay
  const [stitchOpacity, setStitchOpacity] = useState(0.7);

  const baseName = pesUrl?.split("/").pop()?.replace(/\.pes$/, "");

  // Load stitch segments and colors
  useEffect(() => {
    if (!pesUrl) {
      setSegments([]);
      setColors([]);
      return;
    }
    fetch(`${FLASK_BASE}/api/preview-data/${baseName}.pes`)
      .then((r) => r.json())
      .then((d) => {
        if (d.error) throw new Error(d.error);
        if (!isEqual(d.segments, segments)) setSegments(d.segments);
        if (!isEqual(d.colors, colors)) setColors(d.colors);
      })
      .catch((err) => console.error("[StitchPreviewModal] fetch error:", err));
  }, [pesUrl]);

  // Auto scale and center on segments
  useEffect(() => {
    if (!segments.length) return;
    const pts = segments.flat();
    const xs = pts.map((p) => p[0]),
      ys = pts.map((p) => p[1]);
    const minX = Math.min(...xs),
      maxX = Math.max(...xs);
    const minY = Math.min(...ys),
      maxY = Math.max(...ys);
    const C = canvasRef.current;
    if (!C) return;
    const f = Math.min(C.width / (maxX - minX), C.height / (maxY - minY)) * 0.9;
    setScale(f);
    setOffset({ x: 0, y: 0 });
    setSelected(null);
  }, [segments]);

  // Draw both original image and stitches on single canvas
  useEffect(() => {
    const C = canvasRef.current;
    if (!C) return;
    const ctx = C.getContext("2d");
    ctx.clearRect(0, 0, C.width, C.height);

    // Draw original image first
    if (pngUrl) {
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.src = pngUrl;
      img.onload = () => {
        ctx.globalAlpha = 1;
        ctx.drawImage(img, 0, 0, C.width, C.height);

        drawStitches(ctx);
      };
      img.onerror = () => {
        // fallback: just draw stitches if image fails to load
        drawStitches(ctx);
      };
    } else {
      drawStitches(ctx);
    }

    function drawStitches(ctx) {
      if (!segments.length) return;
      ctx.save();
      ctx.globalAlpha = stitchOpacity;
      const pts = segments.flat();
      const xs = pts.map((p) => p[0]),
        ys = pts.map((p) => p[1]);
      const minX = Math.min(...xs),
        maxX = Math.max(...xs);
      const minY = Math.min(...ys),
        maxY = Math.max(...ys);

      ctx.translate(C.width / 2, C.height / 2);
      ctx.scale(scale, -scale);
      ctx.translate(-(minX + maxX) / 2, -(minY + maxY) / 2);
      ctx.translate(offset.x / scale, offset.y / scale);

      segments.forEach((seg, i) => {
        ctx.beginPath();
        ctx.strokeStyle = selected === i ? "#000" : colors[i] || "#888";
        ctx.lineWidth = selected === i ? 2.5 : 1.2;
        seg.forEach(([x, y], idx) =>
          idx === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y)
        );
        ctx.stroke();
      });

      ctx.restore();
      ctx.globalAlpha = 1;
    }
  }, [pngUrl, segments, colors, scale, offset, selected, stitchOpacity]);

  // Interaction handlers
  const onWheel = (e) => {
    e.preventDefault();
    setScale((s) => Math.max(0.1, s * (e.deltaY > 0 ? 0.9 : 1.1)));
  };
  const onMouseDown = (e) => {
    setDragging(true);
    dragStart.current = { x: e.clientX, y: e.clientY };
  };
  const onMouseMove = (e) => {
    if (!dragging) return;
    const dx = e.clientX - dragStart.current.x;
    const dy = e.clientY - dragStart.current.y;
    setOffset((o) => ({ x: o.x + dx, y: o.y + dy }));
    dragStart.current = { x: e.clientX, y: e.clientY };
  };
  const onMouseUp = () => setDragging(false);

  const clickSeg = (e) => {
    const C = canvasRef.current,
      rect = C.getBoundingClientRect();
    const mx = e.clientX - rect.left,
      my = e.clientY - rect.top;
    const pts = segments.flat();
    const xs = pts.map((p) => p[0]),
      ys = pts.map((p) => p[1]);
    const minX = Math.min(...xs),
      maxX = Math.max(...xs);
    const minY = Math.min(...ys),
      maxY = Math.max(...ys);
    const midX = (minX + maxX) / 2,
      midY = (minY + maxY) / 2;
    const sx = (mx - C.width / 2 - offset.x) / scale + midX;
    const sy = -((my - C.height / 2 + offset.y) / scale) + midY;

    for (let i = 0; i < segments.length; i++) {
      if (segments[i].some(([x, y]) => Math.hypot(x - sx, y - sy) < 5 / scale)) {
        setSelected(i);
        return;
      }
    }
    setSelected(null);
  };

  // Export canvas as PNG file
  const exportPNG = () => {
    const link = document.createElement("a");
    link.download = "stitch-preview.png";
    link.href = canvasRef.current.toDataURL();
    link.click();
  };

  const bg = useColorModeValue("whiteAlpha.100", "whiteAlpha.100");
  const borderColor = useColorModeValue("border", "border");

  return (
    <Modal isOpen onClose={onClose} size="xl" isCentered>
      <ModalOverlay bg="blackAlpha.700" />
      <ModalContent
        bg={bg}
        border="1px solid"
        borderColor={borderColor}
        rounded="xl"
        p={4}
        maxW="480px"
        w="full"
      >
        <ModalHeader color="primaryTxt" fontWeight="bold">
          Stitch Preview
        </ModalHeader>
        <ModalCloseButton color="primaryTxt" />

        <ModalBody>
          {/* Opacity slider */}
          <Flex align="center" mb={4} gap={4}>
            <Text color="primaryTxt" whiteSpace="nowrap">
              Stitch Overlay Opacity:
            </Text>
            <Slider
              aria-label="Stitch overlay opacity"
              defaultValue={stitchOpacity * 100}
              min={0}
              max={100}
              onChange={(val) => setStitchOpacity(val / 100)}
              flex="1"
            >
              <SliderTrack bg="gray.600">
                <SliderFilledTrack bg="accent" />
              </SliderTrack>
              <SliderThumb />
            </Slider>
          </Flex>

          <Box
            mb={4}
            border="1px solid"
            borderColor={borderColor}
            rounded="md"
            overflow="hidden"
            boxShadow="0 4px 16px rgba(0,0,0,0.1)"
          >
            <canvas
              ref={canvasRef}
              width={450}
              height={450}
              style={{
                width: "100%",
                borderRadius: "4px",
                cursor: dragging ? "grabbing" : "grab",
                userSelect: "none",
                display: "block",
                background: "transparent",
              }}
              onWheel={onWheel}
              onMouseDown={onMouseDown}
              onMouseMove={onMouseMove}
              onMouseUp={onMouseUp}
              onMouseLeave={onMouseUp}
              onClick={clickSeg}
            />
          </Box>

          <Text fontSize="sm" color="accentAlt" mb={4} userSelect="none">
            <strong>Zoom:</strong> Scroll &nbsp;|&nbsp;
            <strong>Pan:</strong> Drag &nbsp;|&nbsp;
            <strong>Select:</strong> Click
          </Text>
        </ModalBody>

        <ModalFooter justifyContent="space-between">
          <Button variant="primary" onClick={exportPNG}>
            Export PNG
          </Button>
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}