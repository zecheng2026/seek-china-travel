/**
 * Reduce future Supabase Storage egress by resizing large photographic uploads.
 * Preserve file format (URLs and content types remain compatible).
 * Never recompress PNG/AVIF, SVG, logos, or review evidence.
 * Original file is used if canvas processing is unavailable or fails.
 */
export async function optimizePhotoUpload(file: File): Promise<File> {
  if (!["image/jpeg", "image/webp"].includes(file.type)) return file;
  if (typeof document === "undefined" || typeof createImageBitmap === "undefined") return file;
  let bitmap: ImageBitmap | undefined;
  try {
    bitmap = await createImageBitmap(file);
    const maxDimension = 1920;
    const scale = Math.min(1, maxDimension / Math.max(bitmap.width, bitmap.height));
    if (scale === 1 && file.size < 450_000) return file;
    const canvas = document.createElement("canvas");
    canvas.width = Math.max(1, Math.round(bitmap.width * scale));
    canvas.height = Math.max(1, Math.round(bitmap.height * scale));
    const context = canvas.getContext("2d");
    if (!context) return file;
    context.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
    const blob = await new Promise<Blob | null>(resolve => canvas.toBlob(resolve, file.type, 0.82));
    if (!blob || blob.size >= file.size) return file;
    return new File([blob], file.name, { type: file.type, lastModified: file.lastModified });
  } catch {
    return file;
  } finally {
    bitmap?.close();
  }
}
