import PROCTORING_CONFIG, { PROCTORING_STATES } from "./proctoringConfig";
import ProctoringDetector from "./ProctoringDetector";

export class ProctoringManager {
  constructor(config = {}) {
    this.config = { ...PROCTORING_CONFIG, ...config };
    this.videoElement = null;
    this.stream = null;
    this.intervalId = null;
    this.isMonitoring = false;

    // Callbacks
    this.onViolation = null;
    this.onTerminate = null;
    this.onStatusUpdate = null;

    // State Machine Timestamps & Variables
    this.lastFaceDetectedAt = Date.now();
    this.noPersonSince = null;
    this.multiplePersonsSince = null;
    this.phoneSince = null;
    this.currentState = PROCTORING_STATES.NORMAL;
    this.isSimulatedState = false;

    // Fired events & violation history
    this.eventsLog = [];
    this.violationsCount = 0;
    this.isTerminated = false;

    // Active status state (default candidate present = 1)
    this.currentStatus = {
      state: PROCTORING_STATES.FACE_DETECTED,
      level: "OK", // "OK", "WARNING", "CRITICAL"
      message: "Proctoring Active - Face Recognized",
      countdown: null,
      activeViolationType: null,
      telemetry: {
        personCount: 1,
        noPerson: false,
        outOfFrame: false,
        phoneDetected: false,
        phoneConfidence: 0,
        rawDetections: "Active",
        engine: "BlazeFace-AI",
        videoDimensions: "1280x720",
        videoReadyState: 4,
        topConfidence: 0.95
      }
    };
  }

  async startMonitoring({ videoElement, stream, onViolation, onTerminate, onStatusUpdate }) {
    if (this.isMonitoring) return;

    this.stream = stream;
    this.onViolation = onViolation;
    this.onTerminate = onTerminate;
    this.onStatusUpdate = onStatusUpdate;
    this.isMonitoring = true;
    this.isTerminated = false;
    this.currentState = PROCTORING_STATES.FACE_DETECTED;
    this.lastFaceDetectedAt = Date.now();
    this.noPersonSince = null;
    this.multiplePersonsSince = null;
    this.phoneSince = null;

    // Ensure camera stream is attached and playing
    if (stream) {
      try {
        let bgVideo = document.getElementById("proctoring-cv-bg-video");
        if (!bgVideo) {
          bgVideo = document.createElement("video");
          bgVideo.id = "proctoring-cv-bg-video";
          bgVideo.autoplay = true;
          bgVideo.playsInline = true;
          bgVideo.muted = true;
          bgVideo.width = 640;
          bgVideo.height = 480;
          bgVideo.style.cssText = "position: fixed; top: -9999px; left: -9999px; width: 640px; height: 480px; opacity: 0; pointer-events: none; z-index: -9999;";
          document.body.appendChild(bgVideo);
        }
        bgVideo.srcObject = stream;
        await bgVideo.play().catch(() => {});
        this.videoElement = bgVideo;
      } catch (e) {
        this.videoElement = videoElement;
      }
    } else {
      this.videoElement = videoElement;
    }

    // Listen to media stream track end / disconnect
    if (stream && stream.getVideoTracks().length > 0) {
      const track = stream.getVideoTracks()[0];
      track.onended = () => this.handleCameraDisconnected();
      track.onmute = () => this.handleCameraDisconnected();
    }

    // Pre-load AI Vision Models (BlazeFace, COCO-SSD)
    try {
      await ProctoringDetector.loadModels();
    } catch (e) {
      console.warn("[ProctoringManager] Model loading delayed:", e);
    }

    // Start frame sampling interval loop (150ms ~ 6.6 FPS)
    if (this.intervalId) clearInterval(this.intervalId);
    this.intervalId = setInterval(
      () => this.processFrame(),
      this.config.FRAME_SAMPLING_INTERVAL_MS
    );

    console.log("[ProctoringManager] Monitoring loop started (150ms interval).");
  }

  stopMonitoring() {
    this.isMonitoring = false;
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
    if (this.videoElement) {
      try {
        this.videoElement.pause();
        this.videoElement.srcObject = null;
        if (this.videoElement.parentNode) {
          this.videoElement.parentNode.removeChild(this.videoElement);
        }
      } catch (e) {}
      this.videoElement = null;
    }
    console.log("[ProctoringManager] Monitoring stopped.");
  }

  handleCameraDisconnected() {
    if (this.isTerminated) return;
    console.warn("Camera disconnected or track ended during interview!");

    const event = this.createEvent("CAMERA_DISCONNECTED", "CRITICAL", 0, 1.0, "Camera stream disconnected or disabled.");
    this.recordEvent(event);
    this.triggerTermination("CAMERA_DISCONNECTED");
  }

  async processFrame() {
    if (!this.isMonitoring || this.isTerminated) return;
    if (this.isSimulatedState) return;

    let targetVideo = document.querySelector(".proctoring-preview-video");
    if (!targetVideo) {
      targetVideo = this.videoElement;
    }

    if (!targetVideo) return;

    if (this.stream && !this.stream.active) {
      this.handleCameraDisconnected();
      return;
    }

    const analysis = await ProctoringDetector.analyzeFrame(targetVideo);
    if (!analysis) {
      return;
    }

    const rawDetections = analysis.predictions && analysis.predictions.length > 0
      ? analysis.predictions.map(p => `${p.class} (${Math.round(p.score * 100)}%)`).join(", ")
      : (analysis.engine || "Active");

    const telemetry = {
      frameIndex: analysis.frameIndex,
      personCount: analysis.personCount,
      noPerson: analysis.noPerson,
      outOfFrame: analysis.outOfFrame,
      faceBoxes: analysis.faceBoxes || [],
      phoneDetected: analysis.phoneDetected,
      phoneConfidence: analysis.phoneConfidence,
      engine: analysis.engine,
      topConfidence: analysis.topConfidence || 0,
      rawDetectionsCount: analysis.rawDetectionsCount || 0,
      videoDimensions: analysis.videoDimensions,
      videoReadyState: analysis.videoReadyState,
      currentTime: analysis.currentTime,
      rawDetections
    };

    const now = Date.now();

    // 1. MOBILE PHONE DETECTION LOGIC
    if (analysis.phoneDetected) {
      if (!this.phoneSince) {
        this.phoneSince = now;
      }
      this.currentState = PROCTORING_STATES.WARNING_PHONE;
      const elapsedSec = (now - this.phoneSince) / 1000;
      const remainingCountdown = Math.max(0, Math.ceil(this.config.PHONE_CONFIRMATION_DURATION - elapsedSec));

      if (elapsedSec >= this.config.PHONE_CONFIRMATION_DURATION) {
        this.currentState = PROCTORING_STATES.TERMINATING;
        const evidence = ProctoringDetector.captureEvidenceSnapshot(targetVideo);
        const event = this.createEvent(
          "PHONE_DETECTED",
          "CRITICAL",
          elapsedSec,
          analysis.phoneConfidence,
          "Mobile phone detected in camera feed",
          evidence
        );
        this.recordEvent(event);
        this.updateStatus(PROCTORING_STATES.TERMINATING, "CRITICAL", "Mobile Phone Detected! Interview Terminating...", 0, "PHONE_DETECTED", telemetry);
        this.triggerTermination("PHONE_DETECTED");
        return;
      } else {
        this.updateStatus(
          PROCTORING_STATES.WARNING_PHONE,
          "WARNING",
          "⚠️ Warning: Mobile phone detected in camera feed!",
          remainingCountdown,
          "PHONE_DETECTED",
          telemetry
        );
        return;
      }
    } else {
      this.phoneSince = null;
    }

    // 2. FACE DETECTION & TEMPORAL SMOOTHING LOGIC
    if (analysis.singlePerson && !analysis.outOfFrame && analysis.personCount === 1) {
      this.consecutiveFaceFrames = (this.consecutiveFaceFrames || 0) + 1;
      this.lastFaceDetectedAt = now;
      this.noPersonSince = null;
      this.currentState = PROCTORING_STATES.FACE_DETECTED;

      this.updateStatus(
        PROCTORING_STATES.FACE_DETECTED,
        "OK",
        "Proctoring Active - Face Recognized",
        null,
        null,
        telemetry
      );
      return;
    }

    if (analysis.noPerson || analysis.outOfFrame || analysis.personCount === 0) {
      this.consecutiveFaceFrames = 0;
      if (!this.noPersonSince) {
        this.noPersonSince = this.lastFaceDetectedAt || now;
      }
      const missingElapsedSec = (now - this.noPersonSince) / 1000;
      const bufferThreshold = this.config.FACE_MISSING_TEMPORAL_BUFFER || 1.0;
      const gracePeriod = this.config.NO_PERSON_GRACE_PERIOD || 5.0;

      // Temporal Smoothing Buffer (0 to 1.0s: FACE_TEMPORARILY_MISSED)
      if (missingElapsedSec < bufferThreshold) {
        this.currentState = PROCTORING_STATES.FACE_TEMPORARILY_MISSED;
        this.updateStatus(
          PROCTORING_STATES.FACE_TEMPORARILY_MISSED,
          "OK",
          "Proctoring Active",
          null,
          null,
          telemetry
        );
        return;
      }

      // After 1.0s temporal buffer: Start Grace Period Countdown
      this.currentState = PROCTORING_STATES.WARNING_FACE_NOT_DETECTED;
      const remainingCountdown = Math.max(0, Math.ceil(gracePeriod - missingElapsedSec));

      if (missingElapsedSec >= gracePeriod) {
        this.currentState = PROCTORING_STATES.TERMINATING;
        const evidence = ProctoringDetector.captureEvidenceSnapshot(targetVideo);
        const event = this.createEvent(
          "CANDIDATE_LEFT_FRAME",
          "CRITICAL",
          missingElapsedSec,
          1.0,
          `Candidate face not visible or left camera frame for > ${gracePeriod}s`,
          evidence
        );
        this.recordEvent(event);
        this.updateStatus(
          PROCTORING_STATES.TERMINATING,
          "CRITICAL",
          "Candidate Not Detected. Interview Terminated.",
          0,
          "CANDIDATE_LEFT_FRAME",
          telemetry
        );
        this.triggerTermination("CANDIDATE_LEFT_FRAME");
        return;
      } else {
        const statusMsg = `Candidate not detected. Please return to the camera! (${remainingCountdown}s)`;

        this.updateStatus(
          PROCTORING_STATES.WARNING_FACE_NOT_DETECTED,
          "CRITICAL",
          statusMsg,
          remainingCountdown,
          "NO_PERSON_DETECTED",
          telemetry
        );
        return;
      }
    }

    // 3. MULTIPLE PERSONS DETECTED
    if (analysis.multiplePersons) {
      if (!this.multiplePersonsSince) {
        this.multiplePersonsSince = now;
      }
      this.currentState = PROCTORING_STATES.WARNING_MULTIPLE_PERSONS;
      const elapsedSec = (now - this.multiplePersonsSince) / 1000;
      const remainingCountdown = Math.max(0, Math.ceil(this.config.MULTIPLE_PERSON_GRACE_PERIOD - elapsedSec));

      if (elapsedSec >= this.config.MULTIPLE_PERSON_GRACE_PERIOD) {
        this.currentState = PROCTORING_STATES.TERMINATING;
        const evidence = ProctoringDetector.captureEvidenceSnapshot(targetVideo);
        const event = this.createEvent(
          "MULTIPLE_PERSONS_DETECTED",
          "CRITICAL",
          elapsedSec,
          1.0,
          `Multiple people detected (${analysis.personCount}) in camera frame`,
          evidence
        );
        this.recordEvent(event);
        this.updateStatus(PROCTORING_STATES.TERMINATING, "CRITICAL", "Multiple People Detected. Interview Terminated.", 0, "MULTIPLE_PERSONS_DETECTED", telemetry);
        this.triggerTermination("MULTIPLE_PERSONS_DETECTED");
        return;
      } else {
        this.updateStatus(
          PROCTORING_STATES.WARNING_MULTIPLE_PERSONS,
          "WARNING",
          `⚠️ Warning: Multiple people detected in frame! (${remainingCountdown}s)`,
          remainingCountdown,
          "MULTIPLE_PERSONS_DETECTED",
          telemetry
        );
        return;
      }
    } else {
      this.multiplePersonsSince = null;
    }
  }

  // Dev Simulation Mode Methods
  simulateNoPerson() {
    this.isSimulatedState = true;
    this.noPersonSince = Date.now();
    this.currentState = PROCTORING_STATES.WARNING_FACE_NOT_DETECTED;

    const simTelemetry = {
      personCount: 0,
      noPerson: true,
      outOfFrame: true,
      faceBoxes: [],
      phoneDetected: false,
      engine: "Simulation-Test",
      videoDimensions: "1280x720",
      videoReadyState: 4,
      topConfidence: 0.0,
      rawDetections: "Simulated 0 Persons"
    };

    this.updateStatus(
      PROCTORING_STATES.WARNING_FACE_NOT_DETECTED,
      "CRITICAL",
      "SIMULATION: Candidate not detected. Return to camera! (5s)",
      5,
      "NO_PERSON_DETECTED",
      simTelemetry
    );

    let simCountdown = 5;
    const simInterval = setInterval(() => {
      simCountdown--;
      if (simCountdown <= 0) {
        clearInterval(simInterval);
        this.updateStatus(PROCTORING_STATES.TERMINATING, "CRITICAL", "SIMULATION: Candidate Not Detected. Interview Terminated.", 0, "CANDIDATE_LEFT_FRAME", simTelemetry);
        this.triggerTermination("CANDIDATE_LEFT_FRAME");
      } else {
        this.updateStatus(
          PROCTORING_STATES.WARNING_FACE_NOT_DETECTED,
          "CRITICAL",
          `SIMULATION: Candidate not detected. Return to camera! (${simCountdown}s)`,
          simCountdown,
          "NO_PERSON_DETECTED",
          simTelemetry
        );
      }
    }, 1000);
  }

  simulateMultiplePersons() {
    this.isSimulatedState = true;
    const simTelemetry = {
      personCount: 2,
      noPerson: false,
      outOfFrame: false,
      faceBoxes: [{ x: 50, y: 50, w: 60, h: 60 }, { x: 180, y: 50, w: 60, h: 60 }],
      phoneDetected: false,
      engine: "Simulation-Test",
      videoDimensions: "1280x720",
      videoReadyState: 4,
      topConfidence: 0.92,
      rawDetections: "Simulated 2 Persons"
    };

    this.updateStatus(
      PROCTORING_STATES.WARNING_MULTIPLE_PERSONS,
      "WARNING",
      "SIMULATION: Multiple people detected (2)!",
      5,
      "MULTIPLE_PERSONS_DETECTED",
      simTelemetry
    );
  }

  simulatePhone() {
    this.isSimulatedState = true;
    const simTelemetry = {
      personCount: 1,
      noPerson: false,
      outOfFrame: false,
      faceBoxes: [{ x: 100, y: 50, w: 80, h: 80 }],
      phoneDetected: true,
      phoneConfidence: 0.95,
      engine: "Simulation-Test",
      videoDimensions: "1280x720",
      videoReadyState: 4,
      topConfidence: 0.95,
      rawDetections: "Simulated Cell Phone (95%)"
    };

    this.updateStatus(
      PROCTORING_STATES.WARNING_PHONE,
      "CRITICAL",
      "SIMULATION: Mobile Phone Detected! Terminating...",
      0,
      "PHONE_DETECTED",
      simTelemetry
    );
    this.triggerTermination("PHONE_DETECTED");
  }

  resetSimulation() {
    this.isSimulatedState = false;
    this.noPersonSince = null;
    this.multiplePersonsSince = null;
    this.phoneSince = null;
    this.lastFaceDetectedAt = Date.now();
    this.currentState = PROCTORING_STATES.FACE_DETECTED;
  }

  createEvent(type, severity, duration, confidence, description, metadataSnapshot = null) {
    return {
      type,
      severity,
      timestamp: new Date().toISOString(),
      duration: Math.round(duration * 10) / 10,
      confidence: confidence ? Math.round(confidence * 100) / 100 : 1.0,
      metadata: metadataSnapshot ? JSON.stringify({ description, snapshot: metadataSnapshot }) : description
    };
  }

  recordEvent(event) {
    this.eventsLog.push(event);
    if (event.severity !== "INFO") {
      this.violationsCount++;
    }
    if (this.onViolation) {
      this.onViolation(event, this.violationsCount);
    }
  }

  updateStatus(stateOrLevel, levelOrMsg, messageOrCount, countdownOrType, activeViolationTypeOrTelemetry, telemetryParam) {
    let state = PROCTORING_STATES.FACE_DETECTED;
    let level = "OK";
    let message = "Proctoring Active";
    let countdown = null;
    let activeViolationType = null;
    let telemetry = null;

    if (Object.values(PROCTORING_STATES).includes(stateOrLevel)) {
      state = stateOrLevel;
      level = levelOrMsg;
      message = messageOrCount;
      countdown = countdownOrType;
      activeViolationType = activeViolationTypeOrTelemetry;
      telemetry = telemetryParam;
    } else {
      level = stateOrLevel;
      message = levelOrMsg;
      countdown = messageOrCount;
      activeViolationType = countdownOrType;
      telemetry = activeViolationTypeOrTelemetry;

      if (level === "CRITICAL") state = PROCTORING_STATES.WARNING_FACE_NOT_DETECTED;
      else if (level === "WARNING") state = PROCTORING_STATES.WARNING_MULTIPLE_PERSONS;
      else state = PROCTORING_STATES.FACE_DETECTED;
    }

    this.currentStatus = {
      state,
      level,
      message,
      countdown,
      activeViolationType,
      telemetry: telemetry || this.currentStatus?.telemetry || { personCount: 1, phoneDetected: false }
    };

    if (this.onStatusUpdate) {
      this.onStatusUpdate(this.currentStatus);
    }
  }

  triggerTermination(reason) {
    if (this.isTerminated) return;
    this.isTerminated = true;
    this.currentState = PROCTORING_STATES.TERMINATED;
    this.stopMonitoring();

    console.warn(`[ProctoringManager] INTERVIEW TERMINATED! Reason: ${reason}`);

    if (this.onTerminate) {
      this.onTerminate(reason, this.eventsLog);
    }
  }

  getEventsLog() {
    return this.eventsLog;
  }
}

export default ProctoringManager;
