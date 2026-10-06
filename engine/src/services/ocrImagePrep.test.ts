import { describe, it, expect } from 'vitest';
import sharp from 'sharp';
import { prepareImageForOcr, MIN_OCR_LONG_SIDE_PX } from './ocrImagePrep.js';

async function makeImage(width: number, height: number): Promise<Buffer> {
  return sharp({
    create: { width, height, channels: 3, background: { r: 200, g: 200, b: 200 } },
  }).jpeg().toBuffer();
}

describe('prepareImageForOcr', () => {
  it('upscales small document crops so the long side reaches the OCR minimum', async () => {
    const input = await makeImage(800, 504);

    const result = await prepareImageForOcr(input);
    const meta = await sharp(result.buffer).metadata();

    expect(result.upscaled).toBe(true);
    expect(meta.width).toBe(MIN_OCR_LONG_SIDE_PX);
    expect(meta.height).toBe(1008);
  });

  it('uses the long side when the image is portrait', async () => {
    const input = await makeImage(504, 800);

    const result = await prepareImageForOcr(input);
    const meta = await sharp(result.buffer).metadata();

    expect(meta.height).toBe(MIN_OCR_LONG_SIDE_PX);
    expect(meta.width).toBe(1008);
  });

  it('returns large images untouched', async () => {
    const input = await makeImage(2400, 1512);

    const result = await prepareImageForOcr(input);

    expect(result.upscaled).toBe(false);
    expect(result.buffer).toBe(input);
  });

  it('reports the original dimensions for diagnostics', async () => {
    const input = await makeImage(640, 400);

    const result = await prepareImageForOcr(input);

    expect(result.originalWidth).toBe(640);
    expect(result.originalHeight).toBe(400);
  });

  it('is deterministic for identical input', async () => {
    const input = await makeImage(700, 440);

    const first = await prepareImageForOcr(input);
    const second = await prepareImageForOcr(input);

    expect(first.buffer.equals(second.buffer)).toBe(true);
  });

  it('rejects buffers that are not images', async () => {
    await expect(prepareImageForOcr(Buffer.from('not an image'))).rejects.toThrow();
  });
});
