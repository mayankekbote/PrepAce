import React from "react";
import { Volume2, VolumeX, RotateCcw, Bot, MessageSquare } from "lucide-react";

export const InterviewQuestionCard = ({
  question,
  interviewType,
  isSpeaking,
  onReplay,
  onStopAudio,
}) => {
  if (!question) return null;

  const roundType = (interviewType || "TECHNICAL").toUpperCase();

  return (
    <div className="glass-card rounded-2xl p-6 md:p-8 w-full border border-white/10 relative overflow-hidden mb-6">
      {/* Top Bar: Topic, Round Type & Speaking Status */}
      <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
        <div className="flex items-center gap-2 flex-wrap">
          {/* Round Badge */}
          {roundType === "HR" && (
            <span className="px-3 py-1 rounded-full text-xs font-mono font-bold uppercase tracking-wider bg-purple-500/20 border border-purple-500/40 text-purple-300">
              HR Round
            </span>
          )}
          {roundType === "MANAGERIAL" && (
            <span className="px-3 py-1 rounded-full text-xs font-mono font-bold uppercase tracking-wider bg-indigo-500/20 border border-indigo-500/40 text-indigo-300">
              Managerial Round (MR)
            </span>
          )}
          {roundType === "TECHNICAL" && (
            <span className="px-3 py-1 rounded-full text-xs font-mono font-bold uppercase tracking-wider bg-accent/10 border border-accent/20 text-accent">
              Technical Round
            </span>
          )}

          <span className="px-3 py-1 rounded-full text-xs font-mono font-bold uppercase tracking-wider bg-white/5 border border-white/10 text-white/80">
            Topic: {question.topic || "Core Concepts"}
          </span>

          {question.questionKind === "RETRY" ? (
            <span className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-bold uppercase tracking-wider bg-amber-500/20 border border-amber-500/40 text-amber-400 animate-pulse">
              <RotateCcw size={12} />
              Re-Asked Question (Focus Area from Past Test)
            </span>
          ) : question.questionKind && (
            <span className="px-2 py-0.5 rounded text-[10px] font-mono uppercase bg-white/5 border border-white/10 text-text-secondary">
              {question.questionKind}
            </span>
          )}
        </div>

        {/* TTS Controls */}
        <div className="flex items-center gap-2">
          {isSpeaking ? (
            <button
              onClick={onStopAudio}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-error/10 border border-error/20 text-error text-xs font-bold uppercase tracking-wider hover:bg-error/20 transition-all"
              title="Stop AI voice"
            >
              <VolumeX size={14} />
              <span>Stop Audio</span>
            </button>
          ) : (
            <button
              onClick={onReplay}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-text-secondary hover:text-accent hover:border-accent/40 text-xs font-bold uppercase tracking-wider transition-all"
              title="Replay question audio"
            >
              <RotateCcw size={14} />
              <span>Replay Audio</span>
            </button>
          )}
        </div>
      </div>

      {/* Retry Question Notification Banner */}
      {question.questionKind === "RETRY" && (
        <div className="flex items-center gap-2 mb-4 p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-mono">
          <RotateCcw size={16} className="shrink-0 text-amber-400" />
          <span>
            <strong>Project Guide Feature:</strong> This question is being re-tested because it was unanswered or scored low (&lt; 3.5) in a previous test. Answer well to master it!
          </span>
        </div>
      )}

      {/* Speaking Indicator */}
      {isSpeaking && (
        <div className="flex items-center gap-2 mb-4 p-2.5 rounded-xl bg-accent/10 border border-accent/20 text-accent text-xs font-bold uppercase tracking-widest animate-pulse">
          <Bot size={16} className="animate-bounce" />
          <span>Interviewer Speaking...</span>
          <div className="flex items-center gap-1 ml-auto">
            <span className="w-1 h-3 bg-accent animate-pulse"></span>
            <span className="w-1 h-4 bg-accent animate-pulse delay-75"></span>
            <span className="w-1 h-2 bg-accent animate-pulse delay-150"></span>
          </div>
        </div>
      )}

      {/* Question Text */}
      <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/5 relative group">
        <div className="flex items-start gap-4">
          <div className="w-10 h-10 rounded-xl bg-accent/10 text-accent flex items-center justify-center shrink-0 mt-1">
            <MessageSquare size={20} />
          </div>
          <p className="text-lg md:text-xl font-medium text-white leading-relaxed font-dm">
            {question.questionText}
          </p>
        </div>
      </div>
    </div>
  );
};

export default InterviewQuestionCard;
