import type { BoundingBox } from '@/api/types';

/**
 * Convert normalized (0-1) bounding box to CSS percentage values
 * for absolute positioning within a relative container.
 */
export function bboxToCssPercent(bbox: BoundingBox) {
  return {
    left: `${bbox.x_min * 100}%`,
    top: `${bbox.y_min * 100}%`,
    width: `${(bbox.x_max - bbox.x_min) * 100}%`,
    height: `${(bbox.y_max - bbox.y_min) * 100}%`,
  };
}

/**
 * Convert normalized (0-1) bounding box to pixel values
 * given the displayed image dimensions.
 */
export function bboxToPixels(
  bbox: BoundingBox,
  displayWidth: number,
  displayHeight: number,
) {
  return {
    x: bbox.x_min * displayWidth,
    y: bbox.y_min * displayHeight,
    width: (bbox.x_max - bbox.x_min) * displayWidth,
    height: (bbox.y_max - bbox.y_min) * displayHeight,
  };
}
