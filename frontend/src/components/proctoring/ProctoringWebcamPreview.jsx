import React, { useEffect, useRef, useState } from "react";
import { VideoOff, AlertTriangle, Bug, RotateCcw } from "lucide-react";
import PROCTORING_CONFIG from "../../proctoring/proctoringConfig";

export const ProctoringWebcamPreview = ({ stream, statusState, proctoringManager }) => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [showDebug, setShowDebug] = useState(false);

  useEffect(() => {
    if (videoRef.current && stream) {
      videoRef.current.srcObject = stream;
      videoRef.current.play().catch((e) => console.warn("Preview video play warning:", e));
    }
  }, [stream]);

  const level = statusState?.level || "OK";
  const stateName = statusState?.state || "NORMAL";
  const telemetry = statusState?.telemetry;
  const countdown = statusState?.countdown;

  const faceBoxes = telemetry?.faceBoxes || [];
  const uniqueFaceCount = telemetry ? (telemetry.uniqueFaceCount !== undefined ? telemetry.uniqueFaceCount : telemetry.personCount) : 0;
  const rawDetectionsCount = telemetry ? telemetry.rawDetectionsCount : 0;
  const phoneDetected = telemetry ? telemetry.phoneDetected : false;
  const outOfFrame = telemetry ? telemetry.outOfFrame : false;
  const noPerson = telemetry ? telemetry.noPerson : false;
  const engine = telemetry ? telemetry.engine : "BlazeFace-AI";
  const topConfidence = telemetry ? telemetry.topConfidence : 0;
  const frameIndex = telemetry ? telemetry.frameIndex : 0;
  const dims = telemetry ? telemetry.videoDimensions : "1280x720";
  const readyState = telemetry ? telemetry.videoReadyState : 4;

  const isFaceNotVisible = noPerson || outOfFrame || uniqueFaceCount === 0 || level === "CRITICAL";

  // Draw Unique Face Bounding Box Square after NMS Filtering
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    const width = canvas.offsetWidth || 176;
    const height = canvas.offsetHeight || 128;
    canvas.width = width;
    canvas.height = height;

    ctx.clearRect(0, 0, width, height);

    if (faceBoxes && faceBoxes.length > 0 && !isFaceNotVisible) {
      faceBoxes.forEach((box) => {
        // Dynamic Canvas Scaling based on frame aspect ratio
        const vidW = parseInt(dims.split("x")[0]) || 640;
        const vidH = parseInt(dims.split("x")[1]) || 480;

        const scaleX = width / vidW;
        const scaleY = height / vidH;

        // Video is mirrored via CSS scale-x-[-1], flip X on canvas
        const rawX = box.x * scaleX;
        const boxY = box.y * scaleY;
        const boxW = box.w * scaleX;
        const boxH = box.h * scaleY;
        const boxX = width - rawX - boxW;

        // Glowing Unique Face Box (Cyan/Emerald)
        ctx.fillStyle = "rgba(6, 182, 212, 0.15)";
        ctx.fillRect(boxX, boxY, boxW, boxH);

        ctx.strokeStyle = "#06b6d4";
        ctx.lineWidth = 2;
        ctx.strokeRect(boxX, boxY, boxW, boxH);

        // Corner Reticles
        const cornerLen = Math.min(10, boxW / 4, boxH / 4);
        ctx.strokeStyle = "#10b981";
        ctx.lineWidth = 3;

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

        // Label
        const confPct = Math.round((box.score || topConfidence) * 100);
        ctx.fillStyle = "rgba(6, 182, 212, 0.9)";
        ctx.fillRect(boxX, Math.max(0, boxY - 16), Math.min(boxW, 110), 16);
        ctx.fillStyle = "#ffffff";
        ctx.font = "bold 9px monospace";
        ctx.fillText(`👤 FACE DETECTED (${confPct}%)`, boxX + 4, Math.max(11, boxY - 4));
      });
    } else if (isFaceNotVisible) {
      ctx.strokeStyle = "rgba(244, 63, 94, 0.8)";
      ctx.lineWidth = 4;
      ctx.strokeRect(2, 2, width - 4, height - 4);
    }
  }, [faceBoxes, isFaceNotVisible, dims, topConfidence]);

  let statusBg = "bg-emerald-500/20 text-emerald-400 border-emerald-500/30";
  let dotBg = "bg-emerald-400";
  let statusText = "Proctoring Active";

  if (level === "WARNING") {
    statusBg = "bg-amber-500/20 text-amber-400 border-amber-500/30 animate-pulse";
    dotBg = "bg-amber-400";
    statusText = "Warning Flagged";
  } else if (level === "CRITICAL" || isFaceNotVisible) {
    statusBg = "bg-rose-500/20 text-rose-400 border-rose-500/30 animate-pulse";
    dotBg = "bg-rose-400";
    statusText = "FACE NOT VISIBLE";
  }

  return (
    <div className="space-y-3">
      {/* Main Webcam Preview Widget */}
      <div className="relative rounded-2xl overflow-hidden bg-black/60 border border-white/10 shadow-xl group">
        {stream ? (
          <div className="relative w-full h-36">
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="proctoring-preview-video w-full h-full object-cover rounded-2xl transform scale-x-[-1]"
            />
            <canvas
              ref={canvasRef}
              className="absolute inset-0 w-full h-full pointer-events-none rounded-2xl z-10"
            />
          </div>
        ) : (
          <div className="w-full h-36 flex flex-col items-center justify-center bg-white/[0.03] text-text-secondary text-xs p-2 text-center">
            <VideoOff size={20} className="mb-1 text-error" />
            <span>Camera Offline</span>
          </div>
        )}

        {/* Top Status Overlay Badge */}
        <div className="absolute top-2 left-2 right-2 flex items-center justify-between z-20">
          <div className={`px-2 py-1 rounded-md border text-[10px] font-mono font-bold tracking-wider uppercase flex items-center gap-1.5 backdrop-blur-md ${statusBg}`}>
            <span className={`w-2 h-2 rounded-full ${dotBg} animate-ping`} />
            <span>{statusText}</span>
          </div>

          {PROCTORING_CONFIG.DEBUG_MODE && (
            <button
              onClick={() => setShowDebug(!showDebug)}
              className="p-1 rounded bg-black/60 border border-white/20 text-white/80 hover:text-white transition-all text-[10px] flex items-center gap-1"
              title="Toggle Dev Proctoring Telemetry"
            >
              <Bug size={12} className="text-amber-400" />
              <span>DEBUG</span>
            </button>
          )}
        </div>

        {/* Face Not Visible Banner Overlay */}
        {isFaceNotVisible && (
          <div className="absolute inset-0 bg-rose-950/85 backdrop-blur-sm flex flex-col items-center justify-center text-center p-2 z-15 border-2 border-rose-500/50 rounded-2xl animate-pulse">
            <AlertTriangle size={24} className="text-rose-400 mb-1 animate-bounce" />
            <span className="text-[11px] font-mono font-bold text-rose-200 uppercase tracking-wide leading-tight">
              FACE NOT VISIBLE!
            </span>
            <span className="text-[9px] font-mono text-rose-300/90 mt-1 bg-black/60 px-2.5 py-0.5 rounded-full border border-rose-500/30 font-bold">
              Return in {countdown !== null && countdown !== undefined ? `${countdown}s` : "5s"}
            </span>
          </div>
        )}

        {/* Bottom Telemetry Label */}
        <div className="absolute bottom-1.5 left-1.5 right-1.5 text-center flex flex-col gap-0.5 items-center z-20">
          <span className="text-[9px] font-mono text-white/90 bg-black/80 backdrop-blur-sm px-2 py-0.5 rounded-full border border-white/10 inline-flex items-center gap-1">
            <span className={isFaceNotVisible ? "text-rose-400 font-bold" : "text-emerald-400"}>
              👤 {isFaceNotVisible ? "Face Not Visible" : `Faces Recognized: ${uniqueFaceCount}`}
            </span>
            {phoneDetected && <span className="text-amber-400 font-bold ml-1 animate-pulse">📱 Phone!</span>}
          </span>
        </div>
      </div>

      {/* Developer Debug Panel & IoU NMS Telemetry */}
      {PROCTORING_CONFIG.DEBUG_MODE && showDebug && (
        <div className="p-3 rounded-xl bg-black/80 border border-amber-500/30 font-mono text-[10px] space-y-2 text-amber-200/90 shadow-2xl backdrop-blur-md">
          <div className="flex items-center justify-between font-bold border-b border-amber-500/20 pb-1 text-amber-400">
            <span>REAL-TIME DIAGNOSTIC HUD</span>
            <span>Frame #{frameIndex}</span>
          </div>

          <div className="grid grid-cols-2 gap-1 text-[9px]">
            <div>Camera Stream: <span className={stream?.active ? "text-emerald-400 font-bold" : "text-rose-400"}>{stream?.active ? "CONNECTED" : "OFFLINE"}</span></div>
            <div>Video ReadyState: <span className="text-white font-bold">{readyState} (HAVE_ENOUGH_DATA)</span></div>
            <div>Video Dimensions: <span className="text-white font-bold">{dims}</span></div>
            <div>AI Vision Engine: <span className="text-cyan-400 font-bold">{engine}</span></div>
            <div>Raw Proposals: <span className="text-amber-400 font-bold">{rawDetectionsCount}</span></div>
            <div>Unique Faces (NMS): <span className={uniqueFaceCount === 1 ? "text-emerald-400 font-bold" : "text-rose-400 font-bold"}>{uniqueFaceCount}</span></div>
            <div>Top Face Score: <span className="text-emerald-400 font-bold">{(topConfidence * 100).toFixed(1)}%</span></div>
            <div>Proctoring State: <span className="text-purple-400 font-bold">{stateName}</span></div>
          </div>

          {/* Test Proctoring Simulation Buttons */}
          <div className="pt-2 border-t border-white/10 space-y-1">
            <div className="text-[9px] font-bold text-white/60 uppercase">Test Proctoring Simulations:</div>
            <div className="grid grid-cols-2 gap-1">
              <button
                onClick={() => proctoringManager?.simulateNoPerson()}
                className="px-2 py-1 rounded bg-rose-500/20 border border-rose-500/40 text-rose-300 hover:bg-rose-500/30 text-[9px] font-bold transition-all text-left truncate"
              >
                🚨 Test No Person (5s)
              </button>
              <button
                onClick={() => proctoringManager?.simulateMultiplePersons()}
                className="px-2 py-1 rounded bg-amber-500/20 border border-amber-500/40 text-amber-300 hover:bg-amber-500/30 text-[9px] font-bold transition-all text-left truncate"
              >
                👥 Test 2 People
              </button>
              <button
                onClick={() => proctoringManager?.simulatePhone()}
                className="px-2 py-1 rounded bg-purple-500/20 border border-purple-500/40 text-purple-300 hover:bg-purple-500/30 text-[9px] font-bold transition-all text-left truncate"
              >
                📱 Test Phone
              </button>
              <button
                onClick={() => proctoringManager?.resetSimulation()}
                className="px-2 py-1 rounded bg-white/10 border border-white/20 text-white/80 hover:bg-white/20 text-[9px] font-bold transition-all text-left flex items-center gap-1"
              >
                <RotateCcw size={10} /> Reset Test
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProctoringWebcamPreview;
