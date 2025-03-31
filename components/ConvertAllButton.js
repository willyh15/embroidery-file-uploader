// Component: ConvertAllButton
import Button from "./Button";

export default function ConvertAllButton({ onConvertAll }) {
  if (!onConvertAll) return null;

  return (
    <div style={{ margin: "1rem 0" }}>
      <Button onClick={onConvertAll}>Convert All Files</Button>
    </div>
  );
}
