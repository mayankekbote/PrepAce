/**
 * Pure Local Computer Vision Face Feature & Contour Scanner
 * Zero network dependencies, instant in-browser webcam face detection
 */
export class LocalCVFaceDetector {
  static detect(canvasElement) {
    if (!canvasElement) return null;

    try {
      const width = canvasElement.width || 320;
      const height = canvasElement.height || 240;
      const ctx = canvasElement.getContext("2d");
      const imageData = ctx.getImageData(0, 0, width, height);
      const data = imageData.data;

      let minX = width, minY = height, maxX = 0, maxY = 0;
      let skinPixelCount = 0;

      // Scan canvas pixels for human skin color range (RGB & YCrCb space)
      for (let y = 0; y < height; y += 2) {
        for (let x = 0; x < width; x += 2) {
          const idx = (y * width + x) * 4;
          const r = data[idx];
          const g = data[idx + 1];
          const b = data[idx + 2];

          // Standard human skin color threshold rules in RGB
          const isSkinRGB =
            r > 80 && g > 40 && b > 20 &&
            (r - g) > 15 && r > g && r > b &&
            Math.max(r, g, b) - Math.min(r, g, b) > 15;

          // YCrCb color space skin detection
          const Y = 0.299 * r + 0.587 * g + 0.114 * b;
          const Cr = (r - Y) * 0.713 + 128;
          const Cb = (b - Y) * 0.564 + 128;
          const isSkinYCrCb = Cr >= 133 && Cr <= 173 && Cb >= 77 && Cb <= 127;

          if (isSkinRGB && isSkinYCrCb) {
            skinPixelCount++;
            if (x < minX) minX = x;
            if (x > maxX) maxX = x;
            if (y < minY) minY = y;
            if (y > maxY) maxY = y;
          }
        }
      }

      const totalSampledPixels = (width * height) / 4;
      const skinRatio = skinPixelCount / totalSampledPixels;

      // Check if skin pixel cluster forms a valid facial region (at least 3% of frame)
      if (skinRatio >= 0.03 && maxX > minX && maxY > minY) {
        const boxW = maxX - minX;
        const boxH = maxY - minY;
        const aspectRatio = boxH / (boxW || 1);
        const cx = minX + boxW / 2;
        const cy = minY + boxH / 2;

        // Check if face bounding box matches facial aspect ratio (0.6 to 2.2)
        const isValidAspect = aspectRatio >= 0.6 && aspectRatio <= 2.2;

        // Check if face center is outside 5% - 95% of frame bounds
        const marginX = width * 0.05;
        const marginY = height * 0.05;
        const isOutOfBounds = cx < marginX || cx > (width - marginX) || cy < marginY || cy > (height - marginY);

        if (isValidAspect && !isOutOfBounds) {
          return {
            faceDetected: true,
            outOfFrame: false,
            confidence: Math.min(0.95, Math.round(skinRatio * 300) / 100),
            box: {
              xMin: minX,
              yMin: minY,
              width: boxW,
              height: boxH
            }
          };
        } else if (isOutOfBounds) {
          return {
            faceDetected: true,
            outOfFrame: true,
            confidence: 0.8,
            box: { xMin: minX, yMin: minY, width: boxW, height: boxH }
          };
        }
      }

      // No face detected or moved out of frame
      return {
        faceDetected: false,
        outOfFrame: true,
        confidence: 0,
        box: null
      };
    } catch (e) {
      console.warn("Local CV Face Detector error:", e);
      return null;
    }
  }
}

export default LocalCVFaceDetector;
