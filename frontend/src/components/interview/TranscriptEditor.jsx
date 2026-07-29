import React from "react";
import { Send, Loader2, Edit3, Bot, Volume2 } from "lucide-react";
import { Button } from "../UI";

export const TranscriptEditor = ({
  transcript,
  setTranscript,
  inputMode,
  isListening,
  isSpeaking,
  submitting,
  onSubmit,
}) => {
  const isTextEmpty = !transcript || transcript.trim().length === 0;

  if (isSpeaking) {
    return (
      <div className="glass-card rounded-2xl p-6 w-full border border-accent/20 relative flex flex-col items-center justify-center min-h-[180px] text-center">
        <div className="w-12 h-12 rounded-2xl bg-accent/10 border border-accent/20 text-accent flex items-center justify-center mb-3 animate-pulse">
          <Bot size={24} className="animate-bounce" />
        </div>
        <p className="text-xs font-mono font-bold text-accent uppercase tracking-widest mb-1">
          Interviewer Speaking Question...
        </p>
        <p className="text-xs text-text-secondary opacity-70">
          Listen to the question. Microphone and live transcribing will be ready as soon as the interviewer finishes speaking.
        </p>
      </div>
    );
  }

  return (
    <div className="glass-card rounded-2xl p-6 w-full border border-white/10 relative">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Edit3 size={16} className="text-accent" />
          <span className="text-xs font-mono font-bold uppercase tracking-widest text-white">
            {inputMode === "SPEECH" ? "Voice Transcript" : "Your Response"}
          </span>
          {isListening && (
            <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-accent/20 text-accent border border-accent/30 animate-pulse">
              LIVE_TRANSCRIBING
            </span>
          )}
        </div>
        <span className="text-[10px] font-mono text-text-secondary opacity-60">
          {transcript ? `${transcript.trim().length} chars` : "0 chars"}
        </span>
      </div>

      {/* Editable Transcript Textarea */}
      <textarea
        value={transcript}
        onChange={(e) => setTranscript(e.target.value)}
        placeholder={
          inputMode === "SPEECH"
            ? "Click 'Start Speaking' and state your response aloud. Your speech transcript will appear here in real-time..."
            : "Type your detailed technical response here..."
        }
        disabled={submitting}
        rows={5}
        className="w-full bg-white/[0.03] border border-white/10 rounded-xl p-4 text-white placeholder:text-white/20 focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent/30 font-dm text-sm leading-relaxed transition-all resize-none mb-4"
      />

      {/* Submit Button */}
      <div className="flex justify-end">
        <Button
          onClick={onSubmit}
          disabled={submitting || isTextEmpty}
          isLoading={submitting}
          className="w-full md:w-auto px-8"
        >
          {submitting ? (
            <div className="flex items-center gap-2">
              <Loader2 size={16} className="animate-spin text-primary" />
              <span>Analyzing Answer...</span>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Send size={16} />
              <span>Submit Answer</span>
            </div>
          )}
        </Button>
      </div>
    </div>
  );
};

export default TranscriptEditor;
