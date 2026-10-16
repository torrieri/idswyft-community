export const ID_ASPECT_RATIO = 1.586; // Standard credit card / driver's license
const CROP_WIDTH_FRACTION = 0.85;

// A card crop narrower than this leaves ID text only a few pixels tall, which the
// engine OCR cannot read. Below it we fall back to the native camera's full-res photo.
export const MIN_ID_CROP_WIDTH_PX = 900;

// The card crop of the 4K stream we request. Larger crops only come from sensors that
// ignore the requested resolution; capping them keeps the capture canvas allocatable on
// phones without dropping below the resolution OCR is tuned for.
export const MAX_ID_CAPTURE_WIDTH_PX = 3264;

export const ID_CAMERA_VIDEO_CONSTRAINTS: MediaTrackConstraints = {
  facingMode: { ideal: 'environment' },
  width: { ideal: 3840 },
  height: { ideal: 2160 },
};

export interface CaptureSize {
  width: number;
  height: number;
}

export interface CropRect extends CaptureSize {
  x: number;
  y: number;
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

export function computeIdCaptureOutputSize(crop: CaptureSize): CaptureSize {
  if (crop.width <= MAX_ID_CAPTURE_WIDTH_PX) return { width: crop.width, height: crop.height };
  return {
    width: MAX_ID_CAPTURE_WIDTH_PX,
    height: Math.floor((MAX_ID_CAPTURE_WIDTH_PX * crop.height) / crop.width),
  };
}
