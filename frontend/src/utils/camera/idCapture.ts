export const ID_ASPECT_RATIO = 1.586; // Standard credit card / driver's license
const CROP_WIDTH_FRACTION = 0.85;

// A card crop narrower than this leaves ID text only a few pixels tall, which the
// engine OCR cannot read. Below it we fall back to the native camera's full-res photo.
export const MIN_ID_CROP_WIDTH_PX = 900;

export const ID_CAMERA_VIDEO_CONSTRAINTS: MediaTrackConstraints = {
  facingMode: { ideal: 'environment' },
  width: { ideal: 3840 },
  height: { ideal: 2160 },
};

export interface CropRect {
  x: number;
  y: number;
  width: number;
  height: number;
}

export function computeIdCropRect(frameWidth: number, frameHeight: number): CropRect {
  let width = Math.floor(frameWidth * CROP_WIDTH_FRACTION);
  let height = Math.floor(width / ID_ASPECT_RATIO);
  if (height > frameHeight) {
    height = frameHeight;
    width = Math.floor(height * ID_ASPECT_RATIO);
  }
  return {
    x: Math.floor((frameWidth - width) / 2),
    y: Math.floor((frameHeight - height) / 2),
    width,
    height,
  };
}

export function hasEnoughResolutionForOcr(frameWidth: number, frameHeight: number): boolean {
  if (frameWidth <= 0 || frameHeight <= 0) return false;
  return computeIdCropRect(frameWidth, frameHeight).width >= MIN_ID_CROP_WIDTH_PX;
}
