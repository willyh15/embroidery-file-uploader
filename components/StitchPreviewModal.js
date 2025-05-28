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
  Checkbox,
  NumberInput,
  NumberInputField,
  Text,
  Button,
  Slider,
  SliderTrack,
  SliderFilledTrack,
  SliderThumb,
  useColorModeValue,
} from "@chakra-ui/react";

const FLASK_BASE = "https://embroideryfiles.duckdns.org";

export default function StitchPreviewModal({ pngUrl, pesUrl, onClose, onReconvert }) {
  const canvasRef = useRef(null);

  // stitch preview data
  const [segments, setSegments] = useState([]);
  const [colors, setColors] = useState([]);
  const [selected, setSelected] = useState(null);

  // pan & zoom
  const [scale, setScale] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [dragging, setDragging] = useState(false);
  const dragStart = useRef({ x: 0, y: 0 });

  // overlay opacity toggle
  const [showStitches, setShowStitches] = useState(true);
  const [stitchOpacity, setStitchOpacity] = useState(0.8);

  const baseName = pesUrl?.split("/").pop()?.replace(/\.pes$/, "");

  // Fetch stitch data
  useEffect(() => {
    if (!pesUrl) {
      console.log("[StitchPreviewModal] No pesUrl provided");
      setSegments([]);
      setColors([]);
      return;
    }
    fetch(`${FLASK_BASE}/api/preview-data/${baseName}.pes`)
      .then((r) => r.json())
      .then((d) => {
        if (d.error) throw new Error(d.error);
        console.log("[StitchPreviewModal] Loaded segments:", d.segments.length, "colors:", d.colors.length);
        if (!isEqual(d.segments, segments)) setSegments(d.segments);
        if (!isEqual(d.colors, colors)) setColors(d.colors);
      })
      .catch((err) => console.error("[StitchPreviewModal] fetch error:", err));
  }, [pesUrl]);

  // Auto-fit canvas on segments change with improved scale clamping and debug logs
  useEffect(() => {
    if (!segments.length) {
      console.log("[StitchPreviewModal] No segments to fit");
      return;
    }
    const pts = segments.flat();
    const xs = pts.map((p) => p[0]),
      ys = pts.map((p) => p[1]);
    const minX = Math.min(...xs),
      maxX = Math.max(...xs);
    const minY = Math.min(...ys),
      maxY = Math.max(...ys);
    const C = canvasRef.current;
    if (!C) {
      console.warn("[StitchPreviewModal] Canvas not found");
      return;
    }
    const rangeX = maxX - minX;
    const rangeY = maxY - minY;

    if (rangeX < 1e-6 || rangeY < 1e-6) {
      console.warn("[StitchPreviewModal] Invalid or zero range, skipping scale calculation.");
      setScale(1);
      setOffset({ x: 0, y: 0 });
      setSelected(null);
      return;
    }

    const rawScale = Math.min(C.width / rangeX, C.height / rangeY) * 0.9;
    const minScale = 0.01; // Prevent scale from being too small
    const fitScale = Math.max(rawScale, minScale);

    console.log("[StitchPreviewModal] minX,maxX:", minX, maxX, "rangeX:", rangeX);
    console.log("[StitchPreviewModal] minY,maxY:", minY, maxY, "rangeY:", rangeY);
    console.log("[StitchPreviewModal] rawScale:", rawScale, "clamped fitScale:", fitScale);

    setScale(fitScale);
    setOffset({ x: 0, y: 0 });
    setSelected(null);
  }, [segments]);

  // Draw canvas with original and stitches overlay
  useEffect(() => {
    const C = canvasRef.current;
    if (!C) return;
    const ctx = C.getContext("2d");
    ctx.clearRect(0, 0, C.width, C.height);

    // Draw original image
    const drawOriginal = () => {
      if (!pngUrl) return Promise.resolve();
      return new Promise((resolve) => {
        const img = new Image();
        img.crossOrigin = "anonymous";
        img.src = pngUrl;
        img.onload = () => {
          ctx.drawImage(img, 0, 0, C.width, C.height);
          resolve();
        };
        img.onerror = (e) => {
          console.error("[StitchPreviewModal] Error loading PNG", e);
          resolve();
        };
      });
    };

    // Draw stitch overlay
    const drawStitches = () => {
      if (!showStitches || !segments.length) return;
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
        ctx.strokeStyle = selected === i ? "#FF0000" : colors[i] || "#00FF00";
        ctx.lineWidth = selected === i ? 3 : 1.5;
        seg.forEach(([x, y], idx) => (idx === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y)));
        ctx.stroke();
      });
      ctx.restore();
    };

    drawOriginal().then(drawStitches);
  }, [pngUrl, segments, colors, scale, offset, selected, showStitches, stitchOpacity]);

  // Interaction handlers (zoom, pan, select)
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

  // Export PNG
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
          <Flex align="center" mb={4} color="primaryTxt" gap={6}>
            <Checkbox
              isChecked={showStitches}
              onChange={(e) => setShowStitches(e.target.checked)}
              colorScheme="accent"
            >
              Show Stitch Overlay
            </Checkbox>
            <Flex align="center" gap={2} w="200px">
              <Text flexShrink={0}>Overlay Opacity:</Text>
              <Slider
                aria-label="stitch-opacity-slider"
                value={stitchOpacity}
                min={0}
                max={1}
                step={0.05}
                onChange={(v) => setStitchOpacity(v)}
              >
                <SliderTrack bg="gray.600">
                  <SliderFilledTrack bg="accent" />
                </SliderTrack>
                <SliderThumb />
              </Slider>
            </Flex>
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
                backgroundImage:
                  "repeating-conic-gradient(rgba(255,255,255,0.1) 0% 25%, transparent 0% 50%)",
                backgroundSize: "16px 16px",
                display: "block",
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