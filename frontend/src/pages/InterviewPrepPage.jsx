import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Card, Button, Input } from "../components/UI";
import { useAuth } from "../context/AuthContext";
import { interviewApi } from "../services/interviewApi";
import { Sparkles, Mic, Play, Shield, Layers, HelpCircle, Loader2, AlertTriangle } from "lucide-react";

const InterviewPrepPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [targetRole, setTargetRole] = useState(user?.targetRole || "Software Engineer");
  const [interviewType, setInterviewType] = useState("TECHNICAL");
  const [difficulty, setDifficulty] = useState("MEDIUM");
  const [totalQuestions, setTotalQuestions] = useState(5);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleStartInterview = async (e) => {
    e.preventDefault();
    if (loading) return;

    setError(null);
    setLoading(true);

    try {
      // 1. Create Session
      const createRes = await interviewApi.createSession({
        targetRole,
        interviewType,
        difficulty,
        totalQuestions: parseInt(totalQuestions, 10),
        durationMinutes: 30,
      });

      const sessionId = createRes.data?.session?.id || createRes.data?.id;

      if (!createRes.success || !sessionId) {
        throw new Error(createRes.message || "Failed to initialize interview session.");
      }

      // 2. Start Session
      await interviewApi.startSession(sessionId);

      // 3. Navigate to Voice Room
      navigate(`/interview/${sessionId}`);
    } catch (err) {
      console.error("Session Start Error:", err);
      const msg = err.response?.data?.message || err.message || "Failed to launch interview session.";
      setError(msg);
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-6">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-12"
      >
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent/10 border border-accent/20 mb-6">
          <Sparkles size={14} className="text-accent" />
          <span className="text-[10px] font-bold text-accent uppercase tracking-[0.2em]">
            Speech_First_Protocol
          </span>
        </div>
        <h2 className="text-4xl font-bold text-white tracking-tighter mb-4">AI Voice Mock Interview</h2>
        <p className="text-text-secondary max-w-xl mx-auto text-sm leading-relaxed italic">
          Configure your tailored mock interview environment. You will speak your answers directly to our AI interviewer in real-time.
        </p>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Left Side Info Banner */}
        <div className="space-y-4">
          <Card noPadding className="p-6 bg-white/[0.02] border-white/10">
            <div className="flex items-center gap-3 mb-4 text-accent">
              <Mic size={20} />
              <h4 className="text-sm font-bold uppercase tracking-wider">Voice Interview Flow</h4>
            </div>
            <ul className="space-y-3 text-xs text-text-secondary leading-relaxed opacity-80 font-dm">
              <li className="flex items-start gap-2">
                <span className="text-accent font-bold font-mono">1.</span>
                <span>AI Interviewer reads the question aloud using voice synthesis.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-accent font-bold font-mono">2.</span>
                <span>Click <strong>Start Speaking</strong> and state your answer via microphone.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-accent font-bold font-mono">3.</span>
                <span>Verify transcript & submit. AI evaluates answer & adaptively generates next question.</span>
              </li>
            </ul>
          </Card>

          <div className="p-4 rounded-xl border border-white/5 bg-white/[0.02] text-[10px] font-mono text-text-secondary opacity-60">
            Fallback manual text input & "I Don't Know / Skip" capabilities are fully supported during the session.
          </div>
        </div>

        {/* Configuration Form */}
        <div className="md:col-span-2">
          <Card className="max-w-none border-white/10">
            <form onSubmit={handleStartInterview} className="space-y-6">
              <Input
                label="Target Job Role"
                value={targetRole}
                onChange={(e) => setTargetRole(e.target.value)}
                placeholder="e.g. Senior Backend Engineer"
                required
              />

              {/* Interview Type Selection */}
              <div>
                <label className="text-xs font-semibold text-text-secondary uppercase tracking-widest opacity-70 mb-2 block">
                  Interview Focus Type
                </label>
                <div className="grid grid-cols-3 gap-3">
                  {["TECHNICAL", "MANAGERIAL", "HR"].map((type) => (
                    <button
                      key={type}
                      type="button"
                      onClick={() => setInterviewType(type)}
                      className={`py-3 px-4 rounded-xl text-xs font-bold font-mono uppercase tracking-wider border transition-all ${
                        interviewType === type
                          ? "bg-accent/10 border-accent text-accent shadow-[0_0_15px_rgba(204,255,0,0.15)]"
                          : "bg-white/5 border-white/10 text-text-secondary hover:border-white/20"
                      }`}
                    >
                      {type}
                    </button>
                  ))}
                </div>
              </div>

              {/* Difficulty Selection */}
              <div>
                <label className="text-xs font-semibold text-text-secondary uppercase tracking-widest opacity-70 mb-2 block">
                  Difficulty Level
                </label>
                <div className="grid grid-cols-3 gap-3">
                  {["EASY", "MEDIUM", "HARD"].map((diff) => (
                    <button
                      key={diff}
                      type="button"
                      onClick={() => setDifficulty(diff)}
                      className={`py-3 px-4 rounded-xl text-xs font-bold font-mono uppercase tracking-wider border transition-all ${
                        difficulty === diff
                          ? "bg-accent/10 border-accent text-accent shadow-[0_0_15px_rgba(204,255,0,0.15)]"
                          : "bg-white/5 border-white/10 text-text-secondary hover:border-white/20"
                      }`}
                    >
                      {diff}
                    </button>
                  ))}
                </div>
              </div>

              {/* Question Count Selection */}
              <div>
                <label className="text-xs font-semibold text-text-secondary uppercase tracking-widest opacity-70 mb-2 block">
                  Total Questions
                </label>
                <div className="grid grid-cols-3 gap-3">
                  {[3, 5, 10].map((num) => (
                    <button
                      key={num}
                      type="button"
                      onClick={() => setTotalQuestions(num)}
                      className={`py-3 px-4 rounded-xl text-xs font-bold font-mono uppercase tracking-wider border transition-all ${
                        totalQuestions === num
                          ? "bg-accent/10 border-accent text-accent shadow-[0_0_15px_rgba(204,255,0,0.15)]"
                          : "bg-white/5 border-white/10 text-text-secondary hover:border-white/20"
                      }`}
                    >
                      {num} Questions
                    </button>
                  ))}
                </div>
              </div>

              {error && (
                <div className="p-3 rounded-xl bg-error/10 border border-error/20 text-error text-xs flex items-center gap-2">
                  <AlertTriangle size={16} className="shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <Button type="submit" isLoading={loading} disabled={loading} className="py-4 text-sm mt-4">
                {loading ? (
                  <div className="flex items-center gap-2">
                    <Loader2 size={18} className="animate-spin text-primary" />
                    <span>Generating Tailored Interview Protocol...</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <Play size={18} />
                    <span>LAUNCH VOICE INTERVIEW</span>
                  </div>
                )}
              </Button>
            </form>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default InterviewPrepPage;
