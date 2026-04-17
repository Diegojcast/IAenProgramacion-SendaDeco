/**
 * lib/image-processing.ts
 * Server-side image utilities (Node.js only — do not import in Client Components).
 *
 * - Validates mime type and file size
 * - Converts to WebP
 * - Resizes to max dimension
 * - Returns Buffer + metadata
 */

import sharp from "sharp"

// ── Config ────────────────────────────────────────────────────────────────────

export const IMAGE_CONFIG = {
  maxSizeBytes: 2 * 1024 * 1024, // 2 MB
  maxDimension: 1200,             // px — longest edge
  quality: 82,                    // WebP quality (0–100)
  allowedMimes: ["image/jpeg", "image/png", "image/webp"] as const,
} as const

export type AllowedMime = (typeof IMAGE_CONFIG.allowedMimes)[number]

export type ProcessedImage = {
  data: Uint8Array<ArrayBuffer>
  mime: string       // always "image/webp" after processing
  width: number
  height: number
  originalSize: number
  processedSize: number
}

// ── Validation ────────────────────────────────────────────────────────────────

export function validateImageFile(
  buffer: Buffer,
  mime: string,
  filename = "file"
): { ok: true } | { ok: false; error: string } {
  if (!IMAGE_CONFIG.allowedMimes.includes(mime as AllowedMime)) {
    return {
      ok: false,
      error: `Tipo de archivo no permitido: ${mime}. Permitidos: JPEG, PNG, WebP.`,
    }
  }
  if (buffer.byteLength > IMAGE_CONFIG.maxSizeBytes) {
    const mb = (buffer.byteLength / 1024 / 1024).toFixed(1)
    return {
      ok: false,
      error: `${filename} pesa ${mb} MB. El máximo permitido es 2 MB.`,
    }
  }
  return { ok: true }
}

// ── Processing ────────────────────────────────────────────────────────────────

/**
 * Converts an image buffer to optimised WebP.
 * Resizes so the longest edge ≤ maxDimension (preserving aspect ratio).
 */
export async function processImage(
  input: Buffer,
  maxDimension = IMAGE_CONFIG.maxDimension
): Promise<ProcessedImage> {
  const pipeline = sharp(input)
    .resize(maxDimension, maxDimension, {
      fit: "inside",
      withoutEnlargement: true,
    })
    .webp({ quality: IMAGE_CONFIG.quality })

  const rawBuffer = await pipeline.toBuffer()
  // Slice into a strict ArrayBuffer so Prisma v7's Uint8Array<ArrayBuffer> check passes
  const ownedArrayBuffer = rawBuffer.buffer.slice(
    rawBuffer.byteOffset,
    rawBuffer.byteOffset + rawBuffer.byteLength
  ) as ArrayBuffer
  const data = new Uint8Array(ownedArrayBuffer) as Uint8Array<ArrayBuffer>
  const meta = await sharp(rawBuffer).metadata()

  return {
    data,
    mime: "image/webp",
    width: meta.width ?? 0,
    height: meta.height ?? 0,
    originalSize: input.byteLength,
    processedSize: rawBuffer.byteLength,
  }
}

// ── FormData helper ───────────────────────────────────────────────────────────

/**
 * Extracts and validates an image from a Next.js FormData request.
 * Returns the validated + processed image, or an error string.
 */
export async function extractAndProcessImage(
  formData: FormData,
  fieldName = "image"
): Promise<ProcessedImage | { error: string }> {
  const file = formData.get(fieldName)
  if (!file || !(file instanceof File)) {
    return { error: "No se recibió ninguna imagen." }
  }

  const buffer = Buffer.from(await file.arrayBuffer())
  const validation = validateImageFile(buffer, file.type, file.name)
  if (!validation.ok) return { error: validation.error }

  return processImage(buffer)
}
