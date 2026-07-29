import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Card, Button } from "../components/UI";
import { interviewApi } from "../services/interviewApi";
import {
  CheckCircle2,
  AlertTriangle,
  TrendingUp,
  BookOpen,
  ArrowRight,
  RotateCcw,
  Sparkles,
  Clock,
  Zap,
  Brain,
  Layers,
} from "lucide-react";

// ---- helpers -----------------------------------------------------------

const fmt = (n) => Number(n || 0).toFixed(1);
const clamp = (n) => Math.min(100, Math.max(0, Number(n) || 0));

// ---- component ----------------------------------------------------------

export const InterviewResultsPage = () => {
  const { sessionId } = useParams();
  const navigate = useNavigate();

  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isNotCompleted, setIsNotCompleted] = useState(false);

  useEffect(() => {
    const fetchResult = async () => {
      if (!sessionId) return;
      try {
        setLoading(true);
        setError(null);
        setIsNotCompleted(false);

        const res = await interviewApi.getInterviewResult(sessionId);
        if (res.success && res.data) {
          setResult(res.data);
        } else {
          setError(res.message || "Couldn't load this result.");
        }
      } catch (err) {
        console.error("Fetch Result Error:", err);
        if (err.response?.status === 409) {
          setIsNotCompleted(true);
        } else if (err.response?.status === 404) {
          setError("This result doesn't exist, or you don't have access to it.");
        } else {
          setError("Couldn't reach the server. Try again in a moment.");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchResult();
  }, [sessionId]);

  // ---- loading ----
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] gap-4">
        <div className="w-10 h-10 rounded-full border-2 border-accent/20 border-t-accent animate-spin" />
        <p className="text-text-secondary font-mono text-xs uppercase tracking-widest">
          Compiling candidate analytics…
        </p>
      </div>
    );
  }

  // ---- session still in progress ----
  if (isNotCompleted) {
    return (
      <div className="max-w-md mx-auto py-16 text-center px-4">
        <Card className="w-full max-w-none border-warning/30 bg-card/80 backdrop-blur-md p-8">
          <Clock size={40} className="text-warning mx-auto mb-4" />
          <h3 className="text-xl font-bold text-white mb-2 font-space">Not finished yet</h3>
          <p className="text-text-secondary text-sm mb-6 leading-relaxed font-dm">
            This session hasn't been completed. Resume it to answer the remaining questions.
          </p>
          <div className="flex gap-3">
            <Button variant="outline" className="w-full" onClick={() => navigate("/dashboard")}>
              Dashboard
            </Button>
            <Button className="w-full" onClick={() => navigate(`/interview/${sessionId}`)}>
              Resume interview
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  // ---- error ----
  if (error || !result) {
    return (
      <div className="max-w-md mx-auto py-16 text-center px-4">
        <Card className="w-full max-w-none border-error/30 bg-card/80 backdrop-blur-md p-8">
          <AlertTriangle size={40} className="text-error mx-auto mb-4" />
          <h3 className="text-xl font-bold text-white mb-2 font-space">Result unavailable</h3>
          <p className="text-text-secondary text-sm mb-6 font-dm">{error || "No result data found."}</p>
          <Button onClick={() => navigate("/dashboard")}>Back to dashboard</Button>
        </Card>
      </div>
    );
  }

  const overallScore = clamp(result.overallScore);

  return (
    <div className="w-full max-w-[1500px] mx-auto py-8 px-4 md:px-8 font-dm space-y-8">
      {/* Top Meta & Navigation Header */}
      <motion.div
        initial={{ opacity: 0, y: -6 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/10"
      >
        <div className="flex flex-wrap items-center gap-3">
          <span className="px-3 py-1 rounded-md text-xs font-mono font-bold bg-accent/10 border border-accent/30 text-accent uppercase tracking-wider">
            {result.targetRole || "Software Engineer"}
          </span>
          <span className="px-3 py-1 rounded-md text-xs font-mono bg-white/[0.05] border border-white/10 text-white/80 uppercase">
            {result.interviewType || "TECHNICAL"} • {result.difficulty || "MEDIUM"}
          </span>
          {result.feedbackSource === "AI" && (
            <span className="px-3 py-1 rounded-md text-xs font-mono bg-purple-500/10 border border-purple-500/30 text-purple-400 flex items-center gap-1.5 font-semibold">
              <Sparkles size={12} /> AI Reviewed
            </span>
          )}
          <span className="text-xs font-mono text-text-secondary hidden md:inline">
            Completed: {result.completedAt ? new Date(result.completedAt).toLocaleDateString() : "Recently"}
          </span>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <Button variant="outline" size="sm" onClick={() => navigate("/interview")}>
            <RotateCcw size={14} />
            <span>Practice again</span>
          </Button>
          <Button size="sm" onClick={() => navigate("/dashboard")}>
            <span>Dashboard</span>
            <ArrowRight size={14} />
          </Button>
        </div>
      </motion.div>

      {/* Main Grid: Overall Score & Strengths/Growth Areas */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch"
      >
        {/* Overall Score Card (4 Columns on Desktop) */}
        <Card className="w-full max-w-none lg:col-span-4 p-6 md:p-8 border-accent/20 bg-gradient-to-b from-secondary/80 via-card to-accent/[0.02] flex flex-col justify-between space-y-6">
          <div>
            <span className="text-xs font-mono uppercase tracking-widest text-text-secondary block mb-2">
              Overall Score
            </span>
            <div className="flex items-baseline gap-3">
              <span className="text-7xl font-black text-white font-space tracking-tight leading-none">
                {fmt(overallScore)}
              </span>
              <span className="text-lg font-mono text-text-secondary">/ 100</span>
            </div>
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-white/10">
            <span
              className={`px-3.5 py-1 rounded-full text-xs font-mono font-bold uppercase border tracking-wider ${(result.performanceLabel || "").toUpperCase() === "EXCELLENT"
                  ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
                  : (result.performanceLabel || "").toUpperCase() === "STRONG"
                    ? "bg-accent/10 text-accent border-accent/30"
                    : (result.performanceLabel || "").toUpperCase() === "COMPETENT"
                      ? "bg-blue-500/10 text-blue-400 border-blue-500/30"
                      : "bg-error/10 text-error border-error/30"
                }`}
            >
              {result.performanceLabel || "EVALUATED"}
            </span>

            <div className="flex items-center gap-4 text-xs font-mono text-text-secondary">
              <span>{result.totalAnswered ?? 0} answered</span>
              <span>•</span>
              <span>{result.totalSkipped ?? 0} skipped</span>
            </div>
          </div>
        </Card>

        {/* Strengths & Areas for Improvement (8 Columns on Desktop) */}
        <Card className="w-full max-w-none lg:col-span-8 p-6 md:p-8 border-white/10 flex flex-col justify-between space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* What Worked */}
            <div>
              <h2 className="text-sm font-bold text-white font-space uppercase tracking-wider mb-4 flex items-center gap-2">
                <CheckCircle2 size={16} className="text-emerald-400" />
                <span>What Worked</span>
              </h2>
              {result.strengths?.length > 0 ? (
                <ul className="space-y-2.5">
                  {result.strengths.map((item, i) => (
                    <li key={i} className="flex items-start gap-2.5 text-xs text-white/90 leading-relaxed font-dm">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-1.5 shrink-0" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="p-3.5 rounded-xl bg-white/[0.02] border border-white/5 text-text-secondary text-xs font-mono leading-relaxed">
                  No notable technical strengths recorded for this session. Focus on foundational preparation.
                </div>
              )}
            </div>

            {/* What to Work On */}
            <div>
              <h2 className="text-sm font-bold text-white font-space uppercase tracking-wider mb-4 flex items-center gap-2">
                <TrendingUp size={16} className="text-amber-400" />
                <span>What to Work On</span>
              </h2>
              {result.weaknesses?.length > 0 ? (
                <ul className="space-y-2.5">
                  {result.weaknesses.map((item, i) => (
                    <li key={i} className="flex items-start gap-2.5 text-xs text-white/90 leading-relaxed font-dm">
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-400 mt-1.5 shrink-0" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="p-3.5 rounded-xl bg-white/[0.02] border border-white/5 text-text-secondary text-xs font-mono leading-relaxed">
                  No specific weaknesses flagged.
                </div>
              )}
            </div>
          </div>
        </Card>
      </motion.div>

      {/* Full-Width AI Study Roadmap (12 Columns on Desktop with 3 Internal Columns) */}
      <Card className="w-full max-w-none p-6 md:p-8 border-accent/20 bg-gradient-to-b from-card via-secondary/30 to-accent/[0.02] space-y-6">
        <div className="flex items-center gap-3 border-b border-white/10 pb-4">
          <div className="p-2.5 rounded-xl bg-accent/10 border border-accent/30 text-accent">
            <Brain size={22} />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white font-space uppercase tracking-wider">
              Personalized AI Study Roadmap
            </h2>
          </div>
        </div>

        {/* 3 Internal Columns on Desktop */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch">
          {/* Col 1: AI Performance Summary */}
          <div className="p-5 rounded-2xl bg-secondary/50 border border-white/10 space-y-2 flex flex-col">
            <h3 className="text-xs font-mono font-bold text-accent uppercase tracking-wider flex items-center gap-2">
              <Layers size={14} /> Performance Summary
            </h3>
            <p className="text-xs text-white/90 leading-relaxed font-dm flex-1 pt-1">
              {result.feedbackSummary}
            </p>
          </div>

          {/* Col 2: Recommended Next Steps */}
          <div className="p-5 rounded-2xl bg-secondary/50 border border-white/10 space-y-3 flex flex-col">
            <h3 className="text-xs font-mono font-bold text-accent uppercase tracking-wider flex items-center gap-2">
              <Zap size={14} /> Recommended Next Steps
            </h3>
            {result.recommendations?.length > 0 ? (
              <ol className="space-y-2.5 flex-1">
                {result.recommendations.map((rec, i) => (
                  <li key={i} className="flex items-start gap-2.5 text-xs text-white/90 leading-relaxed font-dm">
                    <span className="w-4 h-4 rounded-full bg-accent/10 border border-accent/30 text-accent font-mono font-bold text-[10px] flex items-center justify-center shrink-0 mt-0.5">
                      {i + 1}
                    </span>
                    <span>{rec}</span>
                  </li>
                ))}
              </ol>
            ) : (
              <p className="text-xs font-mono text-text-secondary">No recommendations specified.</p>
            )}
          </div>

          {/* Col 3: Topics to Review */}
          <div className="p-5 rounded-2xl bg-secondary/50 border border-white/10 space-y-3 flex flex-col">
            <h3 className="text-xs font-mono font-bold text-blue-400 uppercase tracking-wider flex items-center gap-2">
              <BookOpen size={14} /> Topics to Review
            </h3>
            {result.suggestedTopicsToStudy?.length > 0 ? (
              <div className="flex flex-wrap gap-2 flex-1 items-start">
                {result.suggestedTopicsToStudy.map((topic, i) => (
                  <span
                    key={i}
                    className="px-3 py-1.5 rounded-lg text-xs font-mono bg-blue-500/10 border border-blue-500/20 text-blue-300 font-medium"
                  >
                    {topic}
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-xs font-mono text-text-secondary">No specific study topics flagged.</p>
            )}
          </div>
        </div>
      </Card>
    </div>
  );
};

export default InterviewResultsPage;