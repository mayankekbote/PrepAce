import React, { useState, useEffect, useRef } from "react";
import { Card, Button } from "../components/UI";
import ProctoringManager from "../proctoring/ProctoringManager";
import { Bug, RefreshCw, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

export const ProctoringTestPage = () => {
  const navigate = useNavigate();
  const [stream, setStream] = useState(null);
  const [statusState, setStatusState] = useState({
    state: "FACE_DETECTED",
    level: "OK",
    message: "Proctoring Active - Face Recognized",
    countdown: null,
    telemetry: {
      personCount: 1,
      uniqueFaceCount: 1,
      rawDetectionsCount: 3,
      noPerson: false,
      outOfFrame: false,
      topConfidence: 0.868,
      videoDimensions: "1280x720",
      videoReadyState: 4,
      engine: "BlazeFace-AI"
    }
  });

  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const proctoringManagerRef = useRef(new ProctoringManager());

  useEffect(() => {
    let activeStream = null;

    async function initWebcam() {
      try {
        const s = await navigator.mediaDevices.getUserMedia({
          video: { width: { ideal: 1280 }, height: { ideal: 720 } },
          audio: false
        });
        setStream(s);
        activeStream = s;

        if (videoRef.current) {
          videoRef.current.srcObject = s;
          await videoRef.current.play().catch(() => {});
        }

        proctoringManagerRef.current.startMonitoring({
          videoElement: videoRef.current,
          stream: s,
          onViolation: (e) => console.log("[Test Page] Violation recorded:", e),
          onTerminate: (reason) => console.warn("[Test Page] Termination triggered:", reason),
          onStatusUpdate: (st) => setStatusState(st)
        });
      } catch (err) {
        console.error("Failed to start camera for test page:", err);
      }
    }

    initWebcam();

    return () => {
      proctoringManagerRef.current.stopMonitoring();
      if (activeStream) {
        activeStream.getTracks().forEach((t) => t.stop());
      }
    };
  }, []);

  const telemetry = statusState?.telemetry;
  const faceBoxes = telemetry?.faceBoxes || [];
  const uniqueFaceCount = telemetry ? (telemetry.uniqueFaceCount !== undefined ? telemetry.uniqueFaceCount : telemetry.personCount) : 0;
  const rawCount = telemetry?.rawDetectionsCount || 0;
  const topConfidence = telemetry?.topConfidence || 0;
  const frameIndex = telemetry?.frameIndex || 0;
  const dims = telemetry?.videoDimensions || "1280x720";
  const readyState = telemetry?.videoReadyState || 4;
  const engine = telemetry?.engine || "BlazeFace-AI";

  const isFaceDetected = uniqueFaceCount > 0 && !telemetry?.noPerson && !telemetry?.outOfFrame;

  // Draw Unique Face Bounding Box after NMS Filtering
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    const width = canvas.offsetWidth || 640;
    const height = canvas.offsetHeight || 480;
    canvas.width = width;
    canvas.height = height;

    ctx.clearRect(0, 0, width, height);

    if (faceBoxes && faceBoxes.length > 0 && isFaceDetected) {
      faceBoxes.forEach((box) => {
        const vidW = parseInt(dims.split("x")[0]) || 1280;
        const vidH = parseInt(dims.split("x")[1]) || 720;

        const scaleX = width / vidW;
        const scaleY = height / vidH;

        // Mirrored video (scale-x-[-1]), flip X on canvas
        const rawX = box.x * scaleX;
        const boxY = box.y * scaleY;
        const boxW = box.w * scaleX;
        const boxH = box.h * scaleY;
        const boxX = width - rawX - boxW;

        // Face Bounding Box (Cyan/Emerald)
        ctx.fillStyle = "rgba(6, 182, 212, 0.15)";
        ctx.fillRect(boxX, boxY, boxW, boxH);

        ctx.strokeStyle = "#06b6d4";
        ctx.lineWidth = 3;
        ctx.strokeRect(boxX, boxY, boxW, boxH);

        // Corner Reticles
        const cornerLen = Math.min(16, boxW / 4, boxH / 4);
        ctx.strokeStyle = "#10b981";
        ctx.lineWidth = 4;

        // Top-Left
        ctx.beginPath();
        ctx.moveTo(boxX, boxY + cornerLen);
        ctx.lineTo(boxX, boxY);
        ctx.lineTo(boxX + cornerLen, boxY);
        ctx.stroke();

        // Top-Right
        ctx.beginPath();
        ctx.moveTo(boxX + boxW - cornerLen, boxY);
        ctx.lineTo(boxX + boxW, boxY);
        ctx.lineTo(boxX + boxW, boxY + cornerLen);
        ctx.stroke();

        // Bottom-Left
        ctx.beginPath();
        ctx.moveTo(boxX, boxY + boxH - cornerLen);
        ctx.lineTo(boxX, boxY + boxH);
        ctx.lineTo(boxX + cornerLen, boxY + boxH);
        ctx.stroke();

        // Bottom-Right
        ctx.beginPath();
        ctx.moveTo(boxX + boxW - cornerLen, boxY + boxH);
        ctx.lineTo(boxX + boxW, boxY + boxH);
        ctx.lineTo(boxX + boxW, boxY + boxH - cornerLen);
        ctx.stroke();

        // Face Tag Label
        const confPct = Math.round((box.score || topConfidence) * 100);
        ctx.fillStyle = "rgba(6, 182, 212, 0.9)";
        ctx.fillRect(boxX, Math.max(0, boxY - 20), Math.min(boxW, 160), 20);
        ctx.fillStyle = "#ffffff";
        ctx.font = "bold 11px monospace";
        ctx.fillText(`👤 UNIQUE FACE (${confPct}%)`, boxX + 6, Math.max(14, boxY - 5));
      });
    } else {
      ctx.strokeStyle = "rgba(244, 63, 94, 0.8)";
      ctx.lineWidth = 4;
      ctx.strokeRect(4, 4, width - 8, height - 8);
    }
  }, [faceBoxes, isFaceDetected, dims, topConfidence]);

  return (
    <div className="min-h-screen bg-background text-white p-6 space-y-6">
      {/* Header Bar */}
      <div className="flex items-center justify-between border-b border-white/10 pb-4">
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm" onClick={() => navigate("/dashboard")}>
            <ArrowLeft size={16} /> Dashboard
          </Button>
          <div>
            <h1 className="text-xl font-bold font-dm flex items-center gap-2">
              <Bug className="text-amber-400" /> Isolated Face Detection Diagnostic Test Environment
            </h1>
            <p className="text-xs text-text-secondary">
              Route: <code className="text-accent font-mono">/proctoring-test</code> | Test IoU NMS duplicate box suppression and unique face tracking.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 font-mono text-xs">
          <span className="px-3 py-1 rounded-lg bg-white/5 border border-white/10 text-emerald-400 font-bold">
            Status: {statusState.state}
          </span>
        </div>
      </div>

      {/* Main Grid: Video Stream + Diagnostic HUD */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Live Webcam Stream & Bounding Box Canvas */}
        <div className="lg:col-span-2 space-y-4">
          <Card className="p-4 border-white/10 relative overflow-hidden bg-black/80">
            <div className="relative aspect-video w-full rounded-2xl overflow-hidden bg-black">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="proctoring-preview-video w-full h-full object-cover transform scale-x-[-1]"
              />
              <canvas
                ref={canvasRef}
                className="absolute inset-0 w-full h-full pointer-events-none z-10"
              />

              {/* Status Badge Overlay */}
              <div className="absolute top-3 left-3 z-20">
                <span className={`px-3 py-1.5 rounded-lg border text-xs font-mono font-bold tracking-wider uppercase flex items-center gap-2 backdrop-blur-md ${
                  isFaceDetected ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/40" : "bg-rose-500/20 text-rose-400 border-rose-500/40 animate-pulse"
                }`}>
                  <span className={`w-2.5 h-2.5 rounded-full ${isFaceDetected ? "bg-emerald-400" : "bg-rose-400"} animate-ping`} />
                  <span>{isFaceDetected ? `UNIQUE FACE RECOGNIZED (${uniqueFaceCount})` : "NO FACE DETECTED"}</span>
                </span>
              </div>
            </div>
          </Card>
        </div>

        {/* Right Column: Diagnostic HUD Telemetry Panel */}
        <div className="lg:col-span-1 space-y-4">
          <Card className="p-5 border-amber-500/30 bg-black/80 font-mono text-xs space-y-4">
            <div className="flex items-center justify-between border-b border-amber-500/20 pb-2 text-amber-400 font-bold">
              <span>REAL-TIME DIAGNOSTIC HUD</span>
              <span>Frame #{frameIndex}</span>
            </div>

            <div className="space-y-2.5 text-text-secondary text-[11px]">
              <div className="flex justify-between p-2 rounded bg-white/[0.03]">
                <span>Camera Stream:</span>
                <span className={stream?.active ? "text-emerald-400 font-bold" : "text-rose-400"}>
                  {stream?.active ? "CONNECTED" : "OFFLINE"}
                </span>
              </div>

              <div className="flex justify-between p-2 rounded bg-white/[0.03]">
                <span>Video ReadyState:</span>
                <span className="text-white font-bold">{readyState} (HAVE_ENOUGH_DATA)</span>
              </div>

              <div className="flex justify-between p-2 rounded bg-white/[0.03]">
                <span>Video Dimensions:</span>
                <span className="text-white font-bold">{dims}</span>
              </div>

              <div className="flex justify-between p-2 rounded bg-white/[0.03]">
                <span>AI Vision Engine:</span>
                <span className="text-cyan-400 font-bold">{engine}</span>
              </div>

              <div className="flex justify-between p-2 rounded bg-white/[0.03]">
                <span>Raw Proposals Count:</span>
                <span className="text-amber-400 font-bold">{rawCount}</span>
              </div>

              <div className="flex justify-between p-2 rounded bg-white/[0.03]">
                <span>Unique Faces (NMS Filtered):</span>
                <span className={uniqueFaceCount === 1 ? "text-emerald-400 font-bold" : "text-rose-400 font-bold"}>
                  {uniqueFaceCount}
                </span>
              </div>

              <div className="flex justify-between p-2 rounded bg-white/[0.03]">
                <span>Top Face Confidence:</span>
                <span className="text-amber-400 font-bold">
                  {topConfidence > 0 ? `${(topConfidence * 100).toFixed(1)}%` : "0.0%"}
                </span>
              </div>

              <div className="flex justify-between p-2 rounded bg-white/[0.03]">
                <span>Proctoring State:</span>
                <span className="text-purple-400 font-bold">{statusState.state}</span>
              </div>
            </div>

            {/* Simulation Controls */}
            <div className="pt-3 border-t border-white/10 space-y-2">
              <div className="font-bold text-white uppercase text-[10px]">Test Simulations:</div>
              <div className="grid grid-cols-1 gap-2">
                <button
                  onClick={() => proctoringManagerRef.current.simulateNoPerson()}
                  className="p-2 rounded-lg bg-rose-500/20 border border-rose-500/40 text-rose-300 hover:bg-rose-500/30 text-xs font-bold text-left transition-all"
                >
                  🚨 Test No Person (5s)
                </button>
                <button
                  onClick={() => proctoringManagerRef.current.simulateMultiplePersons()}
                  className="p-2 rounded-lg bg-amber-500/20 border border-amber-500/40 text-amber-300 hover:bg-amber-500/30 text-xs font-bold text-left transition-all"
                >
                  👥 Test Multiple People (2 Faces)
                </button>
                <button
                  onClick={() => proctoringManagerRef.current.simulatePhone()}
                  className="p-2 rounded-lg bg-purple-500/20 border border-purple-500/40 text-purple-300 hover:bg-purple-500/30 text-xs font-bold text-left transition-all"
                >
                  📱 Test Mobile Phone Detection
                </button>
                <button
                  onClick={() => proctoringManagerRef.current.resetSimulation()}
                  className="p-2 rounded-lg bg-white/10 border border-white/20 text-white hover:bg-white/20 text-xs font-bold text-left flex items-center justify-center gap-2 transition-all"
                >
                  <RefreshCw size={14} /> Reset Simulation Test
                </button>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default ProctoringTestPage;
