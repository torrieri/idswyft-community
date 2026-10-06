import sharp from 'sharp';

// Below this long side, ID-card text is only a few pixels tall and the PaddleOCR
// recogniser returns gibberish even though the (much larger) face is still detected.
export const MIN_OCR_LONG_SIDE_PX = 1600;

export interface PreparedOcrImage {
  buffer: Buffer;
  originalWidth: number;
  originalHeight: number;
  upscaled: boolean;
}

/**
 * Deterministically upscale small document images before OCR.
 *
 * The result is for text extraction only: face detection and tamper analysis must
 * keep using the original buffer, because resampling would distort ELA/FFT signals.
 */
export async function prepareImageForOcr(input: Buffer): Promise<PreparedOcrImage> {
  const { width, height } = await sharp(input).metadata();
  if (!width || !height) {
    throw new Error('Unable to read image dimensions for OCR preparation');
  }

  const longSide = Math.max(width, height);
  if (longSide >= MIN_OCR_LONG_SIDE_PX) {
    return { buffer: input, originalWidth: width, originalHeight: height, upscaled: false };
  }

  const scale = MIN_OCR_LONG_SIDE_PX / longSide;
  const buffer = await sharp(input)
    .resize(Math.round(width * scale), Math.round(height * scale), { kernel: sharp.kernel.lanczos3 })
    .jpeg({ quality: 95 })
    .toBuffer();

  return { buffer, originalWidth: width, originalHeight: height, upscaled: true };
}
