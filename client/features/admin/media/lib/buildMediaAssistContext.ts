import type { MediaItem } from "../type";
import { formatSize } from "../utils/mediaHelpers";

export function buildMediaSummary(item: MediaItem): string {
  const lines = [
    `File ID: ${item._id}`,
    `Filename: ${item.filename}`,
    `MIME type: ${item.mimetype || "unknown"}`,
    `Size: ${formatSize(item.size)}`,
    `Uploaded: ${new Date(item.createdAt).toISOString()}`,
    `URL: ${item.url}`,
  ];

  return lines.join("\n");
}

export function isVisionEligible(item: MediaItem): boolean {
  return Boolean(item.mimetype?.startsWith("image/") && item.url);
}

export function buildMediaAssistPayload(
  item: MediaItem,
  options: { useVision: boolean; contextHint?: string },
) {
  const useVision = options.useVision && isVisionEligible(item);

  return {
    mediaSummary: buildMediaSummary(item),
    filename: item.filename,
    mimetype: item.mimetype || undefined,
    imageUrl: useVision ? item.url : undefined,
    useVision,
    contextHint: options.contextHint?.trim() || undefined,
  };
}
