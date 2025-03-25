export default function HoopSelector({ hoopSizes, setHoopSize }) {
  return (
    <select
      className="dropdown"
      onChange={(e) =>
        setHoopSize(hoopSizes.find((h) => h.name === e.target.value))
      }
    >
      <option value="">Select Hoop Size</option>
      {hoopSizes.map((size) => (
        <option key={size.name} value={size.name}>
          {size.name} ({size.width}x{size.height} mm)
        </option>
      ))}
    </select>
  );
}