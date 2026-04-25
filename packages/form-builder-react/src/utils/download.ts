/**
 * Triggers a browser file download from an in-memory text string.
 *
 * Creates a temporary Blob URL, clicks a hidden anchor, then revokes
 * the URL to free memory.
 */
export function downloadTextFile(
  content: string,
  fileName: string,
  mimeType: string,
) {
  const blob = new Blob([content], { type: mimeType });
  const objectUrl = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = objectUrl;
  anchor.download = fileName;
  anchor.click();
  URL.revokeObjectURL(objectUrl);
}
