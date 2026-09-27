/**
 * Centralized Configuration & State Constants for AI Proctoring System
 */

export const PROCTORING_STATES = {
  NORMAL: "NORMAL",
  FACE_DETECTED: "FACE_DETECTED",
  FACE_TEMPORARILY_MISSED: "FACE_TEMPORARILY_MISSED",
  WARNING_FACE_NOT_DETECTED: "WARNING_FACE_NOT_DETECTED",
  WARNING_MULTIPLE_PERSONS: "WARNING_MULTIPLE_PERSONS",
  WARNING_PHONE: "WARNING_PHONE",
  TERMINATING: "TERMINATING",
  TERMINATED: "TERMINATED",
  CAMERA_NOT_READY: "CAMERA_NOT_READY",
  MODEL_NOT_READY: "MODEL_NOT_READY",
  DETECTION_ERROR: "DETECTION_ERROR"
};

export const PROCTORING_CONFIG = {
  // Mobile Phone Detection Parameters
  PHONE_DETECTION_CONFIDENCE: 0.25,       // Optimal threshold for cell phone / remote / handheld device detection
  PHONE_CONFIRMATION_DURATION: 1.5,        // 1.5s confirmation duration before violation trigger

  // Face & Person Detection Parameters
  PERSON_DETECTION_CONFIDENCE: 0.45,      // Calibrated threshold to detect real human candidate
  FACE_DETECTION_CONFIDENCE: 0.45,        // Calibrated threshold for BlazeFace ML face detector
  NMS_IOU_THRESHOLD: 0.35,                // Intersection-over-Union threshold (35%) to suppress duplicate face proposals
  MIN_FACE_SPATIAL_SEPARATION: 0.20,      // Minimum horizontal center separation (20% frame width) for separate faces
  FRAME_MARGIN_THRESHOLD: 0.05,           // 5% margin from frame edge to flag out of bounds
  FACE_MISSING_TEMPORAL_BUFFER: 1.0,      // 1.0s temporal smoothing buffer for temporary missed frames
  NO_PERSON_GRACE_PERIOD: 5.0,            // 5.0s total continuous absence threshold before candidate leaving frame terminates interview
  MULTIPLE_PERSON_GRACE_PERIOD: 5.0,      // 5.0s warning countdown before multiple persons terminates interview
  PROCTORING_GRACE_PERIOD: 2.5,           // General grace period threshold

  // Performance & Sampling
  FRAME_SAMPLING_INTERVAL_MS: 150,         // Frame sampling frequency (150ms ~ 6.6 FPS)
  CANVAS_MAX_WIDTH: 640,                   // Scaled width for AI inference
  CANVAS_MAX_HEIGHT: 480,                  // Scaled height for AI inference

  // Violations & Privacy
  MAX_ALLOWED_VIOLATIONS: 3,               // Max non-critical warnings allowed
  ENABLE_EVIDENCE_SNAPSHOT: true,          // Capture low-res evidence thumbnail on violation
  EVIDENCE_SNAPSHOT_MAX_WIDTH: 200,        // Max width for privacy-preserving base64 thumbnail

  // AI Vision Engines & Models
  DETECTION_ENGINE: 'HYBRID',
  OPENCV_SERVICE_URL: 'http://localhost:8000/proctor/detect-frame',
  MODEL_BASE: 'lite_mobilenet_v2',

  // Developer Debug & Telemetry Mode
  DEBUG_MODE: true
};

export default PROCTORING_CONFIG;
