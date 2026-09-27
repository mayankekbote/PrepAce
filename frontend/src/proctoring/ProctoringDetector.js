import * as tf from "@tensorflow/tfjs";
import * as cocoSsd from "@tensorflow-models/coco-ssd";
import * as blazeface from "@tensorflow-models/blazeface";
import PROCTORING_CONFIG from "./proctoringConfig";
import PersonDetector from "./PersonDetector";
import PhoneDetector from "./PhoneDetector";

let cocoModelPromise = null;
let blazefaceModelPromise = null;
let sampleCanvas = null;
let frameCounter = 0;

export class ProctoringDetector {
  /**
   * Pre-loads COCO-SSD and BlazeFace models asynchronously
   */
  static async loadModels() {
    try {
      await tf.ready();
    } catch (e) {}

    if (!cocoModelPromise) {
      cocoModelPromise = cocoSsd
        .load({ base: PROCTORING_CONFIG.MODEL_BASE || "lite_mobilenet_v2" })
        .then((m) => {
          console.log("[AI Vision] COCO-SSD Model Loaded.");
          return m;
        })
        .catch((err) => {
          console.warn("[AI Vision] COCO-SSD load warning:", err);
          cocoModelPromise = null;
          return null;
        });
    }

    if (!blazefaceModelPromise) {
      blazefaceModelPromise = blazeface
        .load()
        .then((m) => {
          console.log("[AI Vision] BlazeFace ML Model Loaded.");
          return m;
        })
        .catch((err) => {
          console.warn("[AI Vision] BlazeFace load warning:", err);
          blazefaceModelPromise = null;
          return null;
        });
    }

    const [cocoModel, blazefaceModel] = await Promise.all([
      cocoModelPromise,
      blazefaceModelPromise
    ]);

    return { cocoModel, blazefaceModel };
  }

  /**
   * Calls Python AI Service OpenCV endpoint for server-side face detection
   */
  static async analyzeWithOpenCV(canvasElement) {
    if (!canvasElement || !PROCTORING_CONFIG.OPENCV_SERVICE_URL) return null;
    try {
      const base64Data = canvasElement.toDataURL("image/jpeg", 0.6);
      const res = await fetch(PROCTORING_CONFIG.OPENCV_SERVICE_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ image_base64: base64Data })
      });
      if (res.ok) {
        return await res.json();
      }
    } catch (e) {}
    return null;
  }

  static parseNumericScore(prob) {
    if (prob === null || prob === undefined) return 0.95;
    if (typeof prob === "number" && !isNaN(prob)) return prob;
    if (Array.isArray(prob) || ArrayBuffer.isView(prob)) return prob[0] || 0.95;
    if (typeof prob.dataSync === "function") {
      try {
        return prob.dataSync()[0] || 0.95;
      } catch (e) {}
    }
    return 0.95;
  }

  static parseCoordinate(val) {
    if (val === null || val === undefined) return 0;
    if (typeof val === "number" && !isNaN(val)) return val;
    if (Array.isArray(val) || ArrayBuffer.isView(val)) return val[0] || 0;
    if (typeof val.dataSync === "function") {
      try {
        return val.dataSync()[0] || 0;
      } catch (e) {}
    }
    return 0;
  }

  /**
   * Analyzes CURRENT video frame dynamically matching video aspect ratio with IoU NMS
   */
  static async analyzeFrame(videoElement) {
    if (!videoElement) return null;

    if (videoElement.readyState < 2 || videoElement.videoWidth === 0 || videoElement.videoHeight === 0) {
      return null;
    }

    frameCounter++;
    const currentFrameIndex = frameCounter;

    try {
      const videoWidth = videoElement.videoWidth;
      const videoHeight = videoElement.videoHeight;

      if (!sampleCanvas) {
        sampleCanvas = document.createElement("canvas");
      }
      sampleCanvas.width = videoWidth;
      sampleCanvas.height = videoHeight;

      const ctx = sampleCanvas.getContext("2d");
      ctx.drawImage(videoElement, 0, 0, videoWidth, videoHeight);

      const { cocoModel, blazefaceModel } = await this.loadModels();

      let facePredictions = null;
      let cocoPredictions = null;
      let opencvPredictions = null;

      const engineConfig = (PROCTORING_CONFIG.DETECTION_ENGINE || "HYBRID").toUpperCase();

      // 1. Run BlazeFace ML Face Detector
      if (blazefaceModel && (engineConfig === "HYBRID" || engineConfig === "BLAZEFACE" || engineConfig === "MEDIAPIPE_FACE")) {
        try {
          const rawFaces = await blazefaceModel.estimateFaces(sampleCanvas, false);
          if (rawFaces && Array.isArray(rawFaces)) {
            facePredictions = rawFaces.map((f, idx) => {
              const xMin = this.parseCoordinate(f.topLeft ? f.topLeft[0] : 0);
              const yMin = this.parseCoordinate(f.topLeft ? f.topLeft[1] : 0);
              const xMax = this.parseCoordinate(f.bottomRight ? f.bottomRight[0] : 0);
              const yMax = f.bottomRight ? this.parseCoordinate(f.bottomRight[1]) : 0;
              const width = xMax - xMin;
              const height = yMax - yMin;
              const score = this.parseNumericScore(f.probability);

              if (PROCTORING_CONFIG.DEBUG_MODE) {
                console.log(`[FACE DETECTION #${idx + 1}] Confidence: ${score.toFixed(3)} | Box: [x:${xMin.toFixed(0)}, y:${yMin.toFixed(0)}, w:${width.toFixed(0)}, h:${height.toFixed(0)}]`);
              }
              return { score, box: { xMin, yMin, width, height } };
            });
          }
        } catch (e) {
          console.warn("[AI CV] BlazeFace estimation error:", e);
        }
      }

      // 2. Run COCO-SSD Object Detector for Mobile Phone
      if (cocoModel) {
        try {
          cocoPredictions = await cocoModel.detect(sampleCanvas);
        } catch (e) {
          console.warn("[AI CV] COCO-SSD detection error:", e);
        }
      }

      // 3. Fallback to Python OpenCV Service ONLY if BlazeFace ML model is unavailable or engine is explicitly OPENCV
      if (engineConfig === "OPENCV" || (!blazefaceModel && (engineConfig === "HYBRID" || engineConfig === "OPENCV"))) {
        opencvPredictions = await this.analyzeWithOpenCV(sampleCanvas);
      }

      // 4. Combine Person & Phone results with IoU NMS Filtering
      const personResult = PersonDetector.detect({
        facePredictions,
        opencvPredictions,
        cocoPredictions,
        frameWidth: videoWidth,
        frameHeight: videoHeight
      });

      const phoneResult = PhoneDetector.detect(cocoPredictions);
      const topConfidence = personResult.faceBoxes.length > 0 ? personResult.faceBoxes[0].score : 0.0;

      // Verbose Log showing NMS Suppression Result
      if (PROCTORING_CONFIG.DEBUG_MODE) {
        console.log(
          `[Detection Frame #${currentFrameIndex}] Raw Proposals: ${personResult.rawDetectionsCount} | NMS Unique Faces: ${personResult.uniqueFaceCount} | Top Confidence: ${(topConfidence * 100).toFixed(1)}% | Engine: ${personResult.engine}`
        );
      }

      return {
        frameIndex: currentFrameIndex,
        timestamp: Date.now(),
        personCount: personResult.uniqueFaceCount,
        uniqueFaceCount: personResult.uniqueFaceCount,
        rawDetectionsCount: personResult.rawDetectionsCount,
        noPerson: personResult.noPerson,
        singlePerson: personResult.singlePerson,
        multiplePersons: personResult.multiplePersons,
        outOfFrame: personResult.outOfFrame,
        faceBoxes: personResult.faceBoxes || [],
        rejectedBoxes: personResult.rejectedBoxes || [],
        phoneDetected: phoneResult.phoneDetected,
        phoneConfidence: phoneResult.confidence,
        engine: personResult.engine,
        topConfidence,
        videoDimensions: `${videoWidth}x${videoHeight}`,
        videoReadyState: videoElement.readyState,
        currentTime: videoElement.currentTime || 0,
        predictions: cocoPredictions || [],
        rawResult: {
          persons: personResult.persons,
          phone: phoneResult.phonePrediction,
          engine: personResult.engine
        }
      };
    } catch (err) {
      console.error("[AI CV] Error analyzing frame:", err);
      return null;
    }
  }

  /**
   * Captures Base64 evidence snapshot
   */
  static captureEvidenceSnapshot(videoElement, maxWidth = PROCTORING_CONFIG.EVIDENCE_SNAPSHOT_MAX_WIDTH) {
    if (!videoElement) return null;
    try {
      const canvas = document.createElement("canvas");
      const aspect = (videoElement.videoHeight || 240) / (videoElement.videoWidth || 320);
      canvas.width = maxWidth;
      canvas.height = Math.round(maxWidth * aspect);
      const ctx = canvas.getContext("2d");
      ctx.drawImage(videoElement, 0, 0, canvas.width, canvas.height);
      return canvas.toDataURL("image/jpeg", 0.6);
    } catch (e) {
      return null;
    }
  }
}

export default ProctoringDetector;
