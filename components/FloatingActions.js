import Button from "./Button";
import { PlusIcon } from "./Icons";

export default function FloatingActions({ setShowModal, fetchAlignmentGuide, fabOpen, setFabOpen }) {
  return (
    <div className="fab-container" onClick={() => setFabOpen(!fabOpen)}>
      <div className="fab">
        <PlusIcon />
      </div>
      {fabOpen && (
        <div className="fab-options">
          <Button onClick={() => setShowModal(true)}>Upload</Button>
          <Button onClick={fetchAlignmentGuide}>Hoop Guide</Button>
        </div>
      )}
    </div>
  );
}