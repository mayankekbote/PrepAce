import React from "react";
import { AlertTriangle, AlertOctagon, ShieldAlert } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export const ProctoringWarningBanner = ({ statusState }) => {
  if (!statusState || statusState.level === "OK") return null;

  const isCritical = statusState.level === "CRITICAL";

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -20, scale: 0.95 }}
        className={`w-full p-4 rounded-2xl border mb-6 flex items-start gap-4 shadow-xl backdrop-blur-lg ${
          isCritical
            ? "bg-rose-950/80 border-rose-500/50 text-rose-200"
            : "bg-amber-950/80 border-amber-500/50 text-amber-200"
        }`}
      >
        <div className={`p-2.5 rounded-xl shrink-0 ${isCritical ? "bg-rose-500/20 text-rose-400" : "bg-amber-500/20 text-amber-400"}`}>
          {isCritical ? <AlertOctagon size={24} className="animate-pulse" /> : <AlertTriangle size={24} />}
        </div>

        <div className="flex-1">
          <div className="flex items-center justify-between gap-2 mb-1">
            <h4 className="font-bold text-sm tracking-wide uppercase font-mono">
              {isCritical ? "🚨 Critical Proctoring Violation Alert" : "⚠️ Proctoring Warning"}
            </h4>
            {statusState.countdown !== null && statusState.countdown >= 0 && (
              <span className="px-2.5 py-0.5 rounded-full bg-black/40 border border-white/10 font-mono text-xs font-bold text-white">
                Countdown: {statusState.countdown}s
              </span>
            )}
          </div>
          <p className="text-xs leading-relaxed font-dm font-medium">
            {statusState.message}
          </p>
          {isCritical && (
            <p className="text-[11px] font-mono mt-1.5 opacity-80">
              Interview will be automatically terminated if this violation continues!
            </p>
          )}
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export default ProctoringWarningBanner;
