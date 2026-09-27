import PROCTORING_CONFIG from "./proctoringConfig";

const PHONE_CLASSES = new Set([
  "cell phone",
  "phone",
  "mobile phone",
  "remote",
  "telephone",
  "handheld"
]);

export class PhoneDetector {
  static detect(predictions, minConfidence = PROCTORING_CONFIG.PHONE_DETECTION_CONFIDENCE) {
    if (!predictions || !Array.isArray(predictions)) {
      return {
        phoneDetected: false,
        confidence: 0,
        phonePrediction: null
      };
    }

    const phonePredictions = predictions.filter(
      (pred) => PHONE_CLASSES.has(pred.class.toLowerCase()) && pred.score >= minConfidence
    );

    if (phonePredictions.length > 0) {
      const bestPrediction = phonePredictions.reduce((prev, current) =>
        current.score > prev.score ? current : prev
      );
      return {
        phoneDetected: true,
        confidence: bestPrediction.score,
        phonePrediction: bestPrediction
      };
    }

    return {
      phoneDetected: false,
      confidence: 0,
      phonePrediction: null
    };
  }
}

export default PhoneDetector;
