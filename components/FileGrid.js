import { Flex } from "@chakra-ui/react";
import FileCard from "./FileCard";

export default function FileGrid({ files, onConvert, onPreview, onEdit }) {
  return (
    <Flex wrap="wrap" gap={6} mb={8}>
      {files.map((file) =>
        file.url ? (
          <FileCard
            key={file.url}
            file={file}
            onConvert={() => onConvert(file.url)}
            onDownload={() => {}}
            onPreview={() => onPreview(file)}
            onEdit={() => onEdit(file)}
          />
        ) : null
      )}
    </Flex>
  );
}