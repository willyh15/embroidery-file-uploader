const [paletteName, setPaletteName] = useState("");
const [colors, setColors] = useState([]);
const [palettes, setPalettes] = useState([]);

const savePalette = async () => {
  await fetch("/api/save-color-palette", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ paletteName, colors }),
  });

  alert("Palette saved!");
};

<button onClick={savePalette}>Save Palette</button>

<input type="text" placeholder="Palette Name" value={paletteName} onChange={(e) => setPaletteName(e.target.value)} />
<input type="color" onChange={(e) => setColors([...colors, e.target.value])} />

<ul>
  {colors.map((color, index) => (
    <li key={index} style={{ background: color }}>{color}</li>
  ))}
</ul>