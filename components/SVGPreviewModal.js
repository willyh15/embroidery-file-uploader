// components/SVGPreviewModal.jsx
import { useEffect } from "react";
import Modal from "./Modal";
import Loader from "./Loader";

export default function SVGPreviewModal({ svgData, onClose }) {
  // If svgData is a URL, we can show it in an <object> tag.
  // If it's raw SVG (string), we can use a div with dangerouslySetInnerHTML.
  const isUrl = svgData && svgData.startsWith("http");

  return (
    <Modal onClose={onClose}>
      <h2>SVG Preview</h2>
      {svgData ? (
        isUrl ? (
          <object
            type="image/svg+xml"
            data={svgData}
            style={{ width: "100%", height: "400px" }}
          >
            Your browser does not support SVG.
          </object>
        ) : (
          <div
            style={{
              width: "100%",
              height: "400px",
              overflow: "auto",
              border: "1px solid #ccc",
            }}
            dangerouslySetInnerHTML={{ __html: svgData }}
          />
        )
      ) : (
        <Loader />
      )}
      <button onClick={onClose} style={{ marginTop: "1rem" }}>
        Close
      </button>
    </Modal>
  );
}