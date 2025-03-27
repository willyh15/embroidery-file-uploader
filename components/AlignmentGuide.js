import Button from "./Button";
import { HoopIcon } from "./Icons";

export default function AlignmentGuide({ fetchGuide, guideUrl }) {
  return (
    <>
      <Button style={{ marginTop: "1.5rem" }} onClick={fetchGuide}>
        <HoopIcon /> Show Hoop Guides
      </Button>

      {guideUrl && (
        <img
          className="hand-drawn"
          src={guideUrl}
          alt="Hoop Alignment Guide"
          style={{ marginTop: "1rem" }}
        />
      )}
    </>
  );
}