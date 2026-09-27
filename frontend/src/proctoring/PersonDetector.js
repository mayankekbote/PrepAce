import PROCTORING_CONFIG from "./proctoringConfig";

/**
 * Calculates Intersection-over-Union (IoU) ratio between two bounding boxes
 */
export function calculateIoU(boxA, boxB) {
  const xA = Math.max(boxA.x, boxB.x);
  const yA = Math.max(boxA.y, boxB.y);
  const xB = Math.min(boxA.x + boxA.w, boxB.x + boxB.w);
  const yB = Math.min(boxA.y + boxA.h, boxB.y + boxB.h);

  const interWidth = Math.max(0, xB - xA);
  const interHeight = Math.max(0, yB - yA);
  const interArea = interWidth * interHeight;

  const areaA = boxA.w * boxA.h;
  const areaB = boxB.w * boxB.h;
  const unionArea = areaA + areaB - interArea;

  if (unionArea <= 0) return 0;
  return interArea / unionArea;
}

/**
 * Non-Maximum Suppression (NMS) for duplicate face proposal filtering
 */
export function applyNMS(rawBoxes, iouThreshold = PROCTORING_CONFIG.NMS_IOU_THRESHOLD || 0.35) {
  if (!rawBoxes || rawBoxes.length === 0) return { uniqueBoxes: [], rejectedBoxes: [] };

  // Sort boxes by confidence score descending
  const sorted = [...rawBoxes].sort((a, b) => b.score - a.score);

  const uniqueBoxes = [];
  const rejectedBoxes = [];

  for (const current of sorted) {
    let isDuplicate = false;

    for (const kept of uniqueBoxes) {
      const iou = calculateIoU(current, kept);
      const centerDistX = Math.abs((current.x + current.w / 2) - (kept.x + kept.w / 2));
      const centerDistY = Math.abs((current.y + current.h / 2) - (kept.y + kept.h / 2));

      // Overlap or center proximity check
      if (iou >= iouThreshold || (centerDistX < Math.min(current.w, kept.w) * 0.5 && centerDistY < Math.min(current.h, kept.h) * 0.5)) {
        isDuplicate = true;
        rejectedBoxes.push({ box: current, reason: `Duplicate (IoU: ${iou.toFixed(2)})` });
        break;
      }
    }

    if (!isDuplicate) {
      uniqueBoxes.push(current);
    }
  }

  return { uniqueBoxes, rejectedBoxes };
}

export class PersonDetector {
  /**
   * Dedicated Face & Person Detector with IoU Non-Maximum Suppression
   */
  static detect({
    facePredictions = null,
    opencvPredictions = null,
    cocoPredictions = null,
    frameWidth = 640,
    frameHeight = 480,
    minConfidence = PROCTORING_CONFIG.FACE_DETECTION_CONFIDENCE
  }) {
    let rawBoxes = [];
    let activeEngine = "None";

    // 1. Collect Raw Face Proposal Bounding Boxes
    if (facePredictions && Array.isArray(facePredictions)) {
      activeEngine = "BlazeFace-AI";

      facePredictions.forEach((face) => {
        let score = 0.95;
        if (typeof face.score === 'number' && !isNaN(face.score)) {
          score = face.score;
        }

        if (score >= (minConfidence || 0.45)) {
          let x = 0, y = 0, w = 0, h = 0;
          if (face.box) {
            x = face.box.xMin;
            y = face.box.yMin;
            w = face.box.width;
            h = face.box.height;
          }
          rawBoxes.push({ x, y, w, h, score });
        }
      });
    }

    // 2. Secondary OpenCV API Boxes
    if (rawBoxes.length === 0 && opencvPredictions && typeof opencvPredictions === "object" && opencvPredictions.faces) {
      activeEngine = opencvPredictions.engine || "OpenCV-HaarCascade";
      (opencvPredictions.faces || []).forEach((f) => {
        rawBoxes.push({ x: f.x, y: f.y, w: f.w, h: f.h, score: 0.9 });
      });
    }

    // 3. Fallback COCO-SSD Person Boxes
    if (rawBoxes.length === 0 && cocoPredictions && Array.isArray(cocoPredictions)) {
      activeEngine = "COCO-SSD";
      cocoPredictions.forEach((p) => {
        if (p.class.toLowerCase() === "person" && p.score >= minConfidence && p.bbox) {
          const [x, y, w, h] = p.bbox;
          rawBoxes.push({ x, y, w, h, score: p.score });
        }
      });
    }

    const rawDetectionsCount = rawBoxes.length;

    // 4. APPLY NON-MAXIMUM SUPPRESSION (NMS) & IOU FILTERING
    const { uniqueBoxes, rejectedBoxes } = applyNMS(rawBoxes, PROCTORING_CONFIG.NMS_IOU_THRESHOLD || 0.35);

    // 5. SPATIAL SEPARATION CHECK FOR MULTIPLE UNIQUE FACES
    let finalUniqueFaces = [];
    if (uniqueBoxes.length > 1) {
      const minSpatialDist = frameWidth * (PROCTORING_CONFIG.MIN_FACE_SPATIAL_SEPARATION || 0.20);
      finalUniqueFaces.push(uniqueBoxes[0]);

      for (let i = 1; i < uniqueBoxes.length; i++) {
        const face = uniqueBoxes[i];
        let isSpatiallySeparate = true;

        for (const accepted of finalUniqueFaces) {
          const cx1 = face.x + face.w / 2;
          const cx2 = accepted.x + accepted.w / 2;
          const dist = Math.abs(cx1 - cx2);
          if (dist < minSpatialDist) {
            isSpatiallySeparate = false;
            console.log(`[Spatial Filter] Merged face proposal too close (dx: ${dist.toFixed(1)}px < ${minSpatialDist.toFixed(1)}px)`);
            break;
          }
        }

        if (isSpatiallySeparate) {
          finalUniqueFaces.push(face);
        }
      }
    } else {
      finalUniqueFaces = uniqueBoxes;
    }

    const uniqueFaceCount = finalUniqueFaces.length;

    // 6. FRAME BOUNDARY & POSITION EVALUATION
    let noPerson = true;
    let singlePerson = false;
    let multiplePersons = false;
    let outOfFrame = false;

    if (uniqueFaceCount === 0) {
      noPerson = true;
      singlePerson = false;
      multiplePersons = false;
      outOfFrame = true;
    } else {
      const marginW = frameWidth * (PROCTORING_CONFIG.FRAME_MARGIN_THRESHOLD || 0.05);
      const marginH = frameHeight * (PROCTORING_CONFIG.FRAME_MARGIN_THRESHOLD || 0.05);
      let facesInFrame = 0;

      finalUniqueFaces.forEach((face) => {
        const cx = face.x + face.w / 2;
        const cy = face.y + face.h / 2;

        if (cx < marginW || cx > (frameWidth - marginW) || cy < marginH || cy > (frameHeight - marginH)) {
          outOfFrame = true;
        } else {
          facesInFrame++;
        }
      });

      noPerson = uniqueFaceCount === 0 || (outOfFrame && facesInFrame === 0);
      singlePerson = uniqueFaceCount === 1 && !noPerson;
      multiplePersons = uniqueFaceCount > 1;
    }

    return {
      rawDetectionsCount,
      personCount: uniqueFaceCount,
      uniqueFaceCount,
      persons: finalUniqueFaces,
      faceBoxes: finalUniqueFaces,
      rejectedBoxes,
      noPerson,
      singlePerson,
      multiplePersons,
      outOfFrame,
      engine: activeEngine
    };
  }
}

export default PersonDetector;
