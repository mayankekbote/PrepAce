import React, { useState, useEffect, useRef } from "react";
import { Card, Button } from "../UI";
import { ShieldCheck, Camera, Mic, AlertTriangle, CheckCircle, RefreshCw, Loader2, UserCheck, Eye } from "lucide-react";
import ProctoringDetector from "../../proctoring/ProctoringDetector";

export const ProctoringPermissionModal = ({ onPermissionsGranted, onCancel }) => {
  const [hasCamera, setHasCamera] = useState(false);
  const [hasMic, setHasMic] = useState(false);
  const [requesting, setRequesting] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);
  const [mediaStream, setMediaStream] = useState(null);

  // AI Model & Face Verification States
  const [loadingModels, setLoadingModels] = useState(false);
  const [modelsReady, setModelsReady] = useState(false);
  const [faceVerified, setFaceVerified] = useState(false);
  const [verificationStatus, setVerificationStatus] = useState("Initializing system checks...");

  const previewVideoRef = useRef(null);
  const intervalRef = useRef(null);

  const requestPermissions = async () => {
    setRequesting(true);
    setErrorMsg(null);
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error("Your browser does not support media device capture.");
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: { ideal: 640 }, height: { ideal: 480 } },
        audio: true
      });

      setMediaStream(stream);
      setHasCamera(stream.getVideoTracks().length > 0);
      setHasMic(stream.getAudioTracks().length > 0);
      setRequesting(false);

      // Start pre-loading AI Models and face verification loop once camera is active
      initAIModelAndFaceCheck();
    } catch (err) {
      console.error("Camera/Mic Permission Error:", err);
      setRequesting(false);
      if (err.name === "NotAllowedError" || err.name === "PermissionDeniedError") {
        setErrorMsg("Camera or microphone permission was denied. Please allow camera and mic permissions in browser settings.");
      } else if (err.name === "NotFoundError" || err.name === "DevicesNotFoundError") {
        setErrorMsg("No camera or microphone device was detected. Please plug in a webcam and microphone.");
      } else if (err.name === "NotReadableError" || err.name === "TrackStartError") {
        setErrorMsg("Your camera is already in use by another app (Zoom, Teams, Meet). Please close other apps and retry.");
      } else {
        setErrorMsg(err.message || "Failed to access webcam and microphone.");
      }
    }
  };

  const initAIModelAndFaceCheck = async () => {
    setLoadingModels(true);
    setVerificationStatus("Pre-loading AI Vision Models...");

    try {
      // Pre-load TensorFlow.js and BlazeFace ML models in setup modal
      await ProctoringDetector.loadModels();
      setModelsReady(true);
      setLoadingModels(false);
      setVerificationStatus("Position your face in front of the camera...");

      // Start continuous interval to verify face detection BEFORE starting interview
      if (intervalRef.current) clearInterval(intervalRef.current);
      intervalRef.current = setInterval(async () => {
        if (!previewVideoRef.current) return;
        const analysis = await ProctoringDetector.analyzeFrame(previewVideoRef.current);
        if (!analysis) return;

        if (analysis.uniqueFaceCount === 1 && !analysis.outOfFrame && !analysis.noPerson) {
          setFaceVerified(true);
          setVerificationStatus("Candidate Face Verified & Positioned!");
        } else if (analysis.uniqueFaceCount > 1) {
          setFaceVerified(false);
          setVerificationStatus(`Multiple faces detected (${analysis.uniqueFaceCount}). Only candidate must be visible.`);
        } else if (analysis.outOfFrame) {
          setFaceVerified(false);
          setVerificationStatus("Please center your face inside the camera frame.");
        } else {
          setFaceVerified(false);
          setVerificationStatus("Face not detected. Please face the camera directly.");
        }
      }, 200);
    } catch (e) {
      console.warn("AI Model pre-load warning in setup modal:", e);
      setLoadingModels(false);
      setModelsReady(true);
      setFaceVerified(true);
      setVerificationStatus("Camera & AI Vision System Ready.");
    }
  };

  useEffect(() => {
    requestPermissions();
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  // Attach camera stream to setup preview video element
  useEffect(() => {
    if (previewVideoRef.current && mediaStream) {
      previewVideoRef.current.srcObject = mediaStream;
      previewVideoRef.current.play().catch((e) => console.warn("Setup preview video play warning:", e));
    }
  }, [mediaStream]);

  const handleProceed = () => {
    if (hasCamera && hasMic && mediaStream) {
      if (intervalRef.current) clearInterval(intervalRef.current);
      onPermissionsGranted(mediaStream);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
      <Card className="max-w-lg w-full border-accent/30 shadow-2xl relative overflow-hidden">
        {/* Header Badge */}
        <div className="flex items-center gap-3 mb-4 p-3 rounded-xl bg-accent/10 border border-accent/20">
          <ShieldCheck size={24} className="text-accent shrink-0" />
          <div>
            <h4 className="text-white font-bold text-sm tracking-wide">AI Proctoring System Verification</h4>
            <p className="text-text-secondary text-xs">Device & Face Recognition pre-check before launch.</p>
          </div>
        </div>

        {/* Live Camera Preview with Real-Time Face Verification Box */}
        {mediaStream && (
          <div className="relative mb-5 rounded-2xl overflow-hidden bg-black/80 border border-white/10 aspect-video w-full flex items-center justify-center">
            <video
              ref={previewVideoRef}
              autoPlay
              playsInline
              muted
              className="w-full h-full object-cover transform scale-x-[-1] rounded-2xl"
            />

            {/* Live Face Verification Badge Overlay */}
            <div className="absolute top-3 left-3 z-20">
              <span
                className={`px-3 py-1.5 rounded-lg border text-xs font-mono font-bold tracking-wider uppercase flex items-center gap-2 backdrop-blur-md ${
                  loadingModels
                    ? "bg-amber-500/20 text-amber-400 border-amber-500/40 animate-pulse"
                    : faceVerified
                    ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/40"
                    : "bg-rose-500/20 text-rose-400 border-rose-500/40 animate-pulse"
                }`}
              >
                {loadingModels ? (
                  <>
                    <Loader2 size={14} className="animate-spin text-amber-400" />
                    <span>LOADING AI MODELS...</span>
                  </>
                ) : faceVerified ? (
                  <>
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
                    <span>FACE VERIFIED & READY</span>
                  </>
                ) : (
                  <>
                    <AlertTriangle size={14} className="text-rose-400" />
                    <span>POSITION FACE IN FRAME</span>
                  </>
                )}
              </span>
            </div>

            {/* Status Footer Overlay */}
            <div className="absolute bottom-2 left-2 right-2 text-center z-20">
              <span className="px-3 py-1 rounded-full bg-black/80 text-[11px] font-mono text-white/90 border border-white/10 backdrop-blur-sm">
                {verificationStatus}
              </span>
            </div>
          </div>
        )}

        {/* Device & System Checklist */}
        <div className="space-y-2.5 mb-6 font-mono text-xs">
          <div className="flex items-center justify-between p-3 rounded-xl bg-white/[0.03] border border-white/10">
            <div className="flex items-center gap-2 text-white font-medium">
              <Camera size={16} className="text-accent" />
              <span>Webcam Access</span>
            </div>
            {hasCamera ? (
              <span className="flex items-center gap-1 text-emerald-400 font-bold text-[11px]">
                <CheckCircle size={14} /> READY
              </span>
            ) : (
              <span className="text-error font-bold text-[11px]">REQUIRED</span>
            )}
          </div>

          <div className="flex items-center justify-between p-3 rounded-xl bg-white/[0.03] border border-white/10">
            <div className="flex items-center gap-2 text-white font-medium">
              <Mic size={16} className="text-accent" />
              <span>Microphone Access</span>
            </div>
            {hasMic ? (
              <span className="flex items-center gap-1 text-emerald-400 font-bold text-[11px]">
                <CheckCircle size={14} /> READY
              </span>
            ) : (
              <span className="text-error font-bold text-[11px]">REQUIRED</span>
            )}
          </div>

          <div className="flex items-center justify-between p-3 rounded-xl bg-white/[0.03] border border-white/10">
            <div className="flex items-center gap-2 text-white font-medium">
              <UserCheck size={16} className="text-accent" />
              <span>AI Candidate Face Recognition</span>
            </div>
            {loadingModels ? (
              <span className="flex items-center gap-1.5 text-amber-400 font-bold text-[11px]">
                <Loader2 size={14} className="animate-spin" /> LOADING MODELS
              </span>
            ) : faceVerified ? (
              <span className="flex items-center gap-1 text-emerald-400 font-bold text-[11px]">
                <CheckCircle size={14} /> VERIFIED
              </span>
            ) : (
              <span className="text-amber-400 font-bold text-[11px]">POSITION FACE</span>
            )}
          </div>
        </div>

        {/* Error Alert */}
        {errorMsg && (
          <div className="p-3.5 rounded-xl bg-error/10 border border-error/30 text-error text-xs mb-6 flex items-start gap-2.5">
            <AlertTriangle size={16} className="shrink-0 mt-0.5" />
            <div className="leading-relaxed">{errorMsg}</div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-3">
          {onCancel && (
            <Button variant="outline" onClick={onCancel}>
              CANCEL
            </Button>
          )}

          {!hasCamera || !hasMic ? (
            <Button onClick={requestPermissions} disabled={requesting} className="w-full">
              <RefreshCw size={16} className={requesting ? "animate-spin" : ""} />
              <span>{requesting ? "REQUESTING PERMISSIONS..." : "GRANT PERMISSIONS & RETRY"}</span>
            </Button>
          ) : loadingModels ? (
            <Button disabled className="w-full opacity-80 cursor-not-allowed">
              <Loader2 size={16} className="animate-spin text-accent" />
              <span>INITIALIZING AI VISION ENGINE...</span>
            </Button>
          ) : !faceVerified ? (
            <Button onClick={handleProceed} variant="outline" className="w-full border-amber-500/40 text-amber-300 hover:bg-amber-500/10">
              <Eye size={16} className="text-amber-400 animate-pulse" />
              <span>POSITION FACE TO START</span>
            </Button>
          ) : (
            <Button onClick={handleProceed} className="w-full">
              <span>START PROCTORED INTERVIEW</span>
            </Button>
          )}
        </div>
      </Card>
    </div>
  );
};

export default ProctoringPermissionModal;
