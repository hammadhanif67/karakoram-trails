// Payment receipt checks. Receipts go to a private R2 bucket; they are never publicly readable.
import { HttpError } from "./http";

export const MAX_RECEIPT_BYTES = 5 * 1024 * 1024;

const TYPES = [
  { ext: "pdf", mime: "application/pdf", magic: [0x25, 0x50, 0x44, 0x46] }, // %PDF
  { ext: "png", mime: "image/png", magic: [0x89, 0x50, 0x4e, 0x47] },
  { ext: "jpg", mime: "image/jpeg", magic: [0xff, 0xd8, 0xff] },
] as const;

/** Identifies the file by its first bytes (the browser-supplied type and name are not trusted). */
export async function checkReceipt(file: unknown): Promise<{ bytes: ArrayBuffer; ext: string; mime: string }> {
  if (!(file instanceof File) || file.size === 0) throw new HttpError(422, "invalid_receipt", "Attach your payment receipt.");
  if (file.size > MAX_RECEIPT_BYTES) throw new HttpError(413, "receipt_too_large", "Receipt must be 5 MB or smaller.");
  const bytes = await file.arrayBuffer();
  const head = new Uint8Array(bytes.slice(0, 8));
  const type = TYPES.find((t) => t.magic.every((b, i) => head[i] === b));
  if (!type) throw new HttpError(415, "invalid_receipt_type", "Upload a JPG, PNG or PDF.");
  return { bytes, ext: type.ext, mime: type.mime };
}
