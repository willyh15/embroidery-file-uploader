import StitchPreviewModal from "./StitchPreviewModal";
import StitchEditorModal from "./StitchEditorModal";

export default function PreviewModals({
  previewPNG,
  previewPES,
  editFileUrl,
  onClosePreview,
  onCloseEditor,
  onReconvert,
}) {
  return (
    <>
      {previewPES && previewPNG && (
        <StitchPreviewModal
          pngUrl={previewPNG}
          pesUrl={previewPES}
          onReconvert={() => onReconvert(previewPNG)}
          onClose={onClosePreview}
        />
      )}

      {editFileUrl && (
        <StitchEditorModal fileUrl={editFileUrl} onClose={onCloseEditor} />
      )}
    </>
  );
}