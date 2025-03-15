import { useState, useEffect, useRef } from "react";
import { TransformWrapper, TransformComponent } from "react-zoom-pan-pinch";

export default function Editor() {
  const [designPosition, setDesignPosition] = useState({ x: 0, y: 0 });

  const handleDrag = (event) => {
    setDesignPosition({ x: event.clientX, y: event.clientY });
  };

  return (
    <TransformWrapper>
      <TransformComponent>
        <div style={{ width: "500px", height: "500px", border: "2px solid black", position: "relative" }}>
          <img
            src="/example-design.png"
            alt="Embroidery Design"
            draggable="true"
            onDragEnd={handleDrag}
            style={{ position: "absolute", left: `${designPosition.x}px`, top: `${designPosition.y}px`, cursor: "grab" }}
          />
        </div>
      </TransformComponent>
    </TransformWrapper>
  );
}