import React from "react";
import { Sparkles, LogOut, CheckCircle2, ShieldAlert } from "lucide-react";

export const InterviewProgress = ({
  currentIndex = 1,
  totalQuestions = 5,
  targetRole = "Software Engineer",
  interviewType = "TECHNICAL",
  difficulty = "MEDIUM",
  status = "IN_PROGRESS",
  onEndInterview,
}) => {
  const percentage = Math.min(100, Math.round((currentIndex / totalQuestions) * 100));

  return (
    <div className="w-full bg-white/[0.02] border border-white/10 rounded-2xl p-4 md:p-6 mb-6 backdrop-blur-md">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-4">
        {/* Role & Badges */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-accent/10 border border-accent/20 flex items-center justify-center text-accent shrink-0">
            <Sparkles size={20} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-white tracking-tight">{targetRole}</h2>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-accent/10 text-accent border border-accent/20">
                {interviewType}
              </span>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-white/5 text-text-secondary border border-white/10">
                {difficulty}
              </span>
            </div>
            <p className="text-xs text-text-secondary font-mono opacity-70">
              Session Protocol Phase {currentIndex} of {totalQuestions}
            </p>
          </div>
        </div>

        {/* End Interview Action */}
        <button
          onClick={onEndInterview}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-error/10 border border-error/20 text-error hover:bg-error/20 transition-all duration-300 text-xs font-bold uppercase tracking-wider self-end md:self-auto"
        >
          <LogOut size={14} />
          <span>End Session</span>
        </button>
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-white/5 h-2 rounded-full overflow-hidden relative">
        <div
          className="bg-accent h-full transition-all duration-500 rounded-full shadow-[0_0_12px_rgba(204,255,0,0.5)]"
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
};

export default InterviewProgress;
