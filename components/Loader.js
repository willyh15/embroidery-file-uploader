export default function Loader({ size = "40px", color = "var(--accent)" }) {
  return (
    <div className="loader" style={{ width: size, height: size, borderColor: color }}></div>
  );
}