import { describe, it, expect } from 'vitest';
import {
  computeIdCropRect,
  hasEnoughResolutionForOcr,
  ID_CAMERA_VIDEO_CONSTRAINTS,
  MIN_ID_CROP_WIDTH_PX,
} from './idCapture';

describe('computeIdCropRect', () => {
  it('centres an ID-card shaped crop covering 85% of a portrait frame width', () => {
    const rect = computeIdCropRect(1080, 1920);

    expect(rect).toEqual({ x: 81, y: 671, width: 918, height: 578 });
  });

  it('centres the crop on a landscape frame', () => {
    const rect = computeIdCropRect(1920, 1080);

    expect(rect.width).toBe(1632);
    expect(rect.height).toBe(1029);
    expect(rect.x).toBe(144);
    expect(rect.y).toBe(25);
  });

  it('clamps the crop to the frame height on very wide frames', () => {
    const rect = computeIdCropRect(2000, 800);

    expect(rect.height).toBe(800);
    expect(rect.width).toBe(1268);
    expect(rect.y).toBe(0);
    expect(rect.x).toBe(366);
  });
});

describe('hasEnoughResolutionForOcr', () => {
  it('accepts a 1080p portrait stream', () => {
    expect(hasEnoughResolutionForOcr(1080, 1920)).toBe(true);
  });

  it('rejects a 720p portrait stream whose card crop is too small to read', () => {
    expect(hasEnoughResolutionForOcr(720, 1280)).toBe(false);
  });

  it('rejects frames with unknown dimensions', () => {
    expect(hasEnoughResolutionForOcr(0, 0)).toBe(false);
  });

  it('uses the documented minimum crop width', () => {
    expect(MIN_ID_CROP_WIDTH_PX).toBe(900);
  });
});

describe('ID_CAMERA_VIDEO_CONSTRAINTS', () => {
  it('asks for a 4K rear camera stream', () => {
    expect(ID_CAMERA_VIDEO_CONSTRAINTS).toEqual({
      facingMode: { ideal: 'environment' },
      width: { ideal: 3840 },
      height: { ideal: 2160 },
    });
  });
});
