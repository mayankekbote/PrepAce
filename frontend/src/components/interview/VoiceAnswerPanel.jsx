import React from "react";
import { Mic, MicOff, Keyboard, SkipForward, AlertCircle } from "lucide-react";

export const VoiceAnswerPanel = ({
  isListening,
  isSupported,
  isSpeaking,
  submitting,
  inputMode,
  error,
  onStartListening,
  onStopListening,
  onToggleInputMode,
  onSkipQuestion,
}) => {
  return (
    <div className="glass-card rounded-2xl p-6 w-full border border-white/10 mb-6">
      <div className="flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Mic Control Main Action */}
        <div className="flex items-center gap-4 w-full md:w-auto">
          {inputMode === "SPEECH" ? (
            isListening ? (
              <button
                onClick={onStopListening}
                disabled={submitting}
                className="w-full md:w-auto flex items-center justify-center gap-3 px-6 py-3.5 rounded-xl bg-error/20 border border-error/40 text-error hover:bg-error/30 transition-all duration-300 font-bold uppercase tracking-wider animate-pulse shadow-[0_0_25px_rgba(255,68,68,0.2)]"
              >
                <div className="w-3 h-3 rounded-full bg-error animate-ping"></div>
                <MicOff size={18} />
                <span>Stop Listening</span>
              </button>
            ) : (
              <button
                onClick={onStartListening}
                disabled={isSpeaking || submitting || !isSupported}
                className={`w-full md:w-auto flex items-center justify-center gap-3 px-6 py-3.5 rounded-xl font-bold uppercase tracking-wider transition-all duration-300 ${
                  isSpeaking || submitting || !isSupported
                    ? "bg-white/5 border border-white/10 text-text-secondary cursor-not-allowed opacity-60"
                    : "bg-accent text-primary hover:scale-[1.02] shadow-[0_0_30px_rgba(204,255,0,0.3)]"
                }`}
              >
                <Mic size={18} />
                <span>{isSpeaking ? "Interviewer Speaking..." : "Start Speaking"}</span>
              </button>
            )
          ) : (
            <div className="flex items-center gap-2 text-xs font-mono text-accent bg-accent/10 border border-accent/20 px-4 py-3 rounded-xl">
              <Keyboard size={16} />
              <span>Manual Text Input Active</span>
            </div>
          )}

          {/* Toggle Mode Button */}
          <button
            onClick={onToggleInputMode}
            disabled={submitting}
            className="flex items-center gap-2 px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white hover:border-accent/40 hover:text-accent transition-all text-xs font-bold uppercase tracking-wider shrink-0"
            title="Switch input mode"
          >
            {inputMode === "SPEECH" ? (
              <>
                <Keyboard size={16} />
                <span className="hidden sm:inline">Text Mode</span>
              </>
            ) : (
              <>
                <Mic size={16} />
                <span className="hidden sm:inline">Voice Mode</span>
              </>
            )}
          </button>
        </div>

        {/* Skip / IDK Action */}
        <button
          onClick={onSkipQuestion}
          disabled={submitting}
          className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-text-secondary hover:text-white hover:border-white/20 transition-all text-xs font-bold uppercase tracking-wider w-full md:w-auto"
        >
          <SkipForward size={14} />
          <span>I Don't Know / Skip</span>
        </button>
      </div>

      {/* STT Error Banner if any */}
      {error && (
        <div className="mt-4 p-3 rounded-xl bg-error/10 border border-error/20 text-error text-xs flex items-center gap-2">
          <AlertCircle size={16} className="shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Unsupported Browser Warning */}
      {!isSupported && inputMode === "SPEECH" && (
        <div className="mt-4 p-3 rounded-xl bg-warning/10 border border-warning/20 text-warning text-xs flex items-center gap-2">
          <AlertCircle size={16} className="shrink-0" />
          <span>Speech Recognition is not available in your browser. Switched to manual text mode.</span>
        </div>
      )}
    </div>
  );
};

export default VoiceAnswerPanel;
