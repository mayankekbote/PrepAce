import React from "react";
import { Card, Button } from "../UI";
import { AlertOctagon, ShieldAlert, Home, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

export const ProctoringTerminationScreen = ({ reason, events = [], session }) => {
  const navigate = useNavigate();

  const getFriendlyReason = (r) => {
    switch (r) {
      case "PHONE_DETECTED":
        return "Mobile phone or unauthorized electronic device was detected in the camera feed.";
      case "CANDIDATE_LEFT_FRAME":
        return "Candidate left the camera frame for an extended period exceeding the allowed grace period.";
      case "MULTIPLE_PERSONS_DETECTED":
        return "Multiple individuals were detected inside the camera frame.";
      case "CAMERA_DISCONNECTED":
        return "Camera stream was disconnected or disabled during the active interview session.";
      default:
        return r || "A critical proctoring violation occurred during the interview.";
    }
  };

  return (
    <div className="max-w-2xl mx-auto py-12 px-4 text-center">
      <Card className="max-w-none border-error/40 bg-black/60 shadow-2xl relative overflow-hidden">
        {/* Glow Header */}
        <div className="w-20 h-20 rounded-full bg-error/10 border border-error/30 text-error flex items-center justify-center mx-auto mb-6 shadow-inner">
          <AlertOctagon size={40} className="animate-pulse" />
        </div>

        <h2 className="text-3xl font-bold text-white tracking-tight mb-2">
          Interview Terminated
        </h2>
        
        <p className="text-error font-mono text-sm font-semibold tracking-wide uppercase mb-4">
          Proctoring & Integrity Security Action
        </p>

        <div className="p-4 rounded-xl bg-error/10 border border-error/20 text-rose-200 text-sm max-w-lg mx-auto mb-6 leading-relaxed font-dm">
          Interview terminated due to a proctoring violation.
          <div className="mt-2 font-bold font-mono text-white text-xs border-t border-error/20 pt-2">
            Reason: {reason}
          </div>
        </div>

        <p className="text-text-secondary text-xs max-w-md mx-auto mb-6 leading-relaxed font-dm">
          {getFriendlyReason(reason)}
        </p>

        {/* Violations Log Table */}
        {events && events.length > 0 && (
          <div className="text-left mb-8">
            <h4 className="text-xs font-mono font-bold text-white uppercase tracking-wider mb-3 flex items-center gap-2">
              <ShieldAlert size={14} className="text-error" />
              Recorded Proctoring Telemetry ({events.length})
            </h4>
            <div className="rounded-xl border border-white/10 bg-white/[0.02] overflow-hidden">
              <table className="w-full text-left font-mono text-xs">
                <thead className="bg-white/[0.05] text-text-secondary border-b border-white/10">
                  <tr>
                    <th className="py-2.5 px-3">Time</th>
                    <th className="py-2.5 px-3">Violation Type</th>
                    <th className="py-2.5 px-3">Severity</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {events.map((ev, idx) => (
                    <tr key={idx} className="hover:bg-white/[0.02]">
                      <td className="py-2.5 px-3 text-text-secondary">
                        {ev.timestamp ? new Date(ev.timestamp).toLocaleTimeString() : `Event #${idx + 1}`}
                      </td>
                      <td className="py-2.5 px-3 font-bold text-white">{ev.type}</td>
                      <td className="py-2.5 px-3">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-error/20 text-error border border-error/30">
                          {ev.severity || "CRITICAL"}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        <div className="flex gap-4 justify-center">
          <Button onClick={() => navigate("/dashboard")}>
            <Home size={16} />
            <span>RETURN TO DASHBOARD</span>
          </Button>
        </div>
      </Card>
    </div>
  );
};

export default ProctoringTerminationScreen;
