import { useState } from "react";
import { TransformWrapper, TransformComponent } from "react-zoom-pan-pinch";

const [designPosition, setDesignPosition] = useState({ x: 0, y: 0 });

const handleDrag = (event) => {
  setDesignPosition({ x: event.clientX, y: event.clientY });
};

<TransformWrapper>
  <TransformComponent>
    <div
      style={{
        width: `${hoopSize?.width}px`,
        height: `${hoopSize?.height}px`,
        background: "white",
        border: "2px solid black",
        position: "relative",
        overflow: "hidden",
      }}
    >
      <img
        src={fileUrl}
        alt="Embroidery Design"
        draggable="true"
        onDragEnd={handleDrag}
        style={{
          position: "absolute",
          left: `${designPosition.x}px`,
          top: `${designPosition.y}px`,
          cursor: "grab",
        }}
      />
    </div>
  </TransformComponent>
</TransformWrapper>