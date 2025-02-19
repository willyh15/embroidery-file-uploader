const [alignedFile, setAlignedFile] = useState(null);

const handleAlignMultiHoop = async (fileUrls) => {
  const response = await fetch("/api/align-multi-hoop", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ fileUrls }),
  });

  const data = await response.json();
  setAlignedFile(data.alignedFile);
};

<button onClick={() => handleAlignMultiHoop(fileUrls)}>Align Multi-Hoop Design</button>

{alignedFile && <img src={alignedFile} alt="Aligned Multi-Hoop Preview" />}