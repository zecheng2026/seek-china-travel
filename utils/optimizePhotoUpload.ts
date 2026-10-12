/**
 * Compress photographic uploads while preserving logos and review evidence at call sites.
 * PNGs with transparency are preserved; opaque PNG photos may be converted to WebP.
 * Fail closed to the original file if the browser cannot encode a smaller image.
 */
export async function optimizePhotoUpload(file: File): Promise<File> {
  if (!["image/jpeg", "image/webp", "image/png"].includes(file.type)) return file;
  if (typeof document === "undefined" || typeof createImageBitmap === "undefined") return file;
  let bitmap: ImageBitmap | undefined;
  try {
    bitmap = await createImageBitmap(file);
    const scale = Math.min(1, 1920 / Math.max(bitmap.width, bitmap.height));
    if (scale === 1 && file.size < 450_000) return file;
    const canvas = document.createElement("canvas");
    canvas.width = Math.max(1, Math.round(bitmap.width * scale));
    canvas.height = Math.max(1, Math.round(bitmap.height * scale));
    const ctx = canvas.getContext("2d", { willReadFrequently: file.type === "image/png" });
    if (!ctx) return file;
    ctx.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
    let outputType = file.type;
    if (file.type === "image/png") {
      // Never change transparent PNGs: logos and graphic overlays must stay lossless.
      const { data } = ctx.getImageData(0, 0, canvas.width, canvas.height);
      for (let i = 3; i < data.length; i += 4) {
        if (data[i] !== 255) return file;
      }
      outputType = "image/webp";
    }
    const blob = await new Promise<Blob | null>(resolve => canvas.toBlob(resolve, outputType, 0.82));
    if (!blob || blob.type !== outputType || blob.size >= file.size) return file;
    const filename = outputType === "image/webp" && file.type === "image/png"
      ? file.name.replace(/\.png$/i, "") + ".webp"
      : file.name;
    return new File([blob], filename, { type: outputType, lastModified: file.lastModified });
  } catch {
    return file;
  } finally {
    bitmap?.close();
  }
}
