import Button from "./Button";

export default function VisibilityToggle({ visibility, onToggle }) {
  const isPublic = visibility === "public";

  return (
    <Button onClick={onToggle} style={{ marginLeft: "0.5rem" }}>
      {isPublic ? "Make Private" : "Make Public"}
    </Button>
  );
}