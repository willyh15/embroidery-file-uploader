import { useRouter } from "next/router";

export default function ViewFile() {
  const router = useRouter();
  const { file } = router.query;

  if (!file) {
    return <p>No file provided.</p>;
  }

  return (
    <div style={{ padding: 20 }}>
      <h1>Shared File</h1>
      {file.match(/\.(png|jpe?g|webp)$/) ? (
        <img src={decodeURIComponent(file)} alt="Shared File" style={{ width: "100%", maxWidth: "600px" }} />
      ) : (
        <a href={decodeURIComponent(file)} target="_blank" rel="noopener noreferrer">
          Download File
        </a>
      )}
    </div>
  );
}
