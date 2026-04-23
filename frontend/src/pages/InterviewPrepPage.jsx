import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, Button } from "../components/UI";
import { useAuth } from "../context/AuthContext";
import api from "../services/api";
import { 
  HelpCircle, 
  ChevronRight, 
  Sparkles, 
  AlertCircle,
  Lightbulb,
  Loader2,
  AlertTriangle
} from "lucide-react";

const InterviewPrepPage = () => {
  const { user } = useAuth();
  const [activeQuestion, setActiveQuestion] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [questions, setQuestions] = useState([]);

  useEffect(() => {
    const fetchQuestions = async () => {
      if (!user?.email) return;

      try {
        setLoading(true);
        // Check if we already have analysis in session storage
        const cached = sessionStorage.getItem("current_analysis");
        if (cached) {
          const data = JSON.parse(cached);
          setQuestions(data.questions || []);
          setLoading(false);
          return;
        }

        const response = await api.get(`/user/analysis?email=${user.email}`);
        if (response.data.success) {
          setQuestions(response.data.data.questions || []);
          sessionStorage.setItem("current_analysis", JSON.stringify(response.data.data));
        } else {
          setError(response.data.message || "Failed to generate questions.");
        }
      } catch (err) {
        console.error("Analysis Error:", err);
        const backendMessage = err.response?.data?.message;
        const status = err.response?.status;
        
        if (status === 404) {
          setError("Candidate profile not found. Please try logging in again.");
        } else if (status === 400) {
          setError(backendMessage || "Missing resume file. Please upload a resume first.");
        } else {
          setError(backendMessage || "Connection Error: Backend or AI service might be offline. Tried 127.0.0.1:8085");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchQuestions();
  }, [user?.email]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <Loader2 size={40} className="text-accent animate-spin mb-4" />
        <p className="text-text-secondary font-mono text-xs uppercase tracking-widest animate-pulse">
          Generating Tailored Question Set...
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] max-w-md mx-auto text-center">
        <AlertTriangle size={40} className="text-error mb-4" />
        <h3 className="text-xl font-bold text-white mb-2">Question Generation Failed</h3>
        <p className="text-text-secondary text-sm mb-6">{error}</p>
        <button 
          onClick={() => window.location.reload()}
          className="px-6 py-2 bg-accent/10 border border-accent/20 text-accent rounded-lg text-xs font-bold uppercase tracking-widest"
        >
          Retry
        </button>
      </div>
    );
  }

  if (!questions || questions.length === 0) return null;

  return (
    <div className="max-w-4xl mx-auto py-6">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-16"
      >
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent/10 border border-accent/20 mb-6">
          <Sparkles size={14} className="text-accent" />
          <span className="text-[10px] font-bold text-accent uppercase tracking-[0.2em]">AI_Tailored_Protocol</span>
        </div>
        <h2 className="text-4xl font-bold text-white tracking-tighter mb-4">Mock Interview Prep</h2>
        <p className="text-text-secondary max-w-xl mx-auto text-sm leading-relaxed italic">
          Based on your {user?.targetRole || "SDE"} profile and project history, we've generated 3 high-impact questions to test your technical depth.
        </p>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
        {/* Progress Sidebar */}
        <div className="space-y-4">
          {questions.map((q, idx) => (
            <button
              key={q.id}
              onClick={() => setActiveQuestion(idx)}
              className={`w-full text-left p-4 rounded-xl border transition-all duration-300 ${
                activeQuestion === idx 
                  ? "bg-accent/10 border-accent text-accent shadow-[0_0_20px_rgba(217,255,0,0.1)]" 
                  : "bg-white/5 border-white/5 text-text-secondary hover:border-white/20"
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-[10px] font-mono opacity-60">PHASE_0{q.id}</span>
                {activeQuestion === idx && <ChevronRight size={14} />}
              </div>
              <p className="text-xs font-bold truncate uppercase tracking-tight">{q.category}</p>
            </button>
          ))}
          
          <div className="mt-8 p-4 rounded-xl border border-white/5 bg-white/[0.02]">
            <p className="text-[10px] text-text-secondary uppercase tracking-widest font-bold mb-2">Instructions</p>
            <p className="text-[10px] text-text-secondary leading-relaxed opacity-60">
              Spend 10-15 mins reflecting on each scenario. Focus on technical justification rather than just listing features.
            </p>
          </div>
        </div>

        {/* Question Display */}
        <div className="md:col-span-3">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeQuestion}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              <Card className="max-w-none border-white/10 min-h-[400px] flex flex-col">
                <div className="flex items-center gap-4 mb-8">
                  <div className="w-12 h-12 rounded-2xl bg-accent/10 text-accent flex items-center justify-center">
                    <HelpCircle size={24} />
                  </div>
                  <div>
                    <p className="text-[10px] text-accent font-bold uppercase tracking-widest">{questions[activeQuestion].category}</p>
                    <h3 className="text-xl font-bold text-white tracking-tight">{questions[activeQuestion].title}</h3>
                  </div>
                </div>

                <div className="flex-grow">
                  <div className="p-8 rounded-2xl bg-white/[0.02] border border-white/5 relative group">
                    <div className="absolute -top-3 -left-3 p-2 bg-primary rounded-lg border border-white/5 text-text-secondary group-hover:text-accent transition-colors">
                      <MessageSquareQuote size={16} />
                    </div>
                    <p className="text-lg text-white leading-relaxed font-medium">
                      {questions[activeQuestion].text}
                    </p>
                  </div>
                </div>

                <div className="mt-10 space-y-6">
                  <div className="flex items-start gap-3 p-4 rounded-xl bg-success/5 border border-success/10 text-success">
                    <Lightbulb size={18} className="shrink-0 mt-0.5" />
                    <div>
                      <p className="text-xs font-bold uppercase tracking-widest mb-1">Analyst Insight / Hint</p>
                      <p className="text-sm opacity-80 italic">{questions[activeQuestion].hint}</p>
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <Button 
                      variant="outline" 
                      onClick={() => setActiveQuestion(prev => Math.max(0, prev - 1))}
                      disabled={activeQuestion === 0}
                      className="flex-1"
                    >
                      PREVIOUS
                    </Button>
                    <Button 
                      onClick={() => setActiveQuestion(prev => Math.min(questions.length - 1, prev + 1))}
                      disabled={activeQuestion === questions.length - 1}
                      className="flex-1"
                    >
                      {activeQuestion === questions.length - 1 ? "FINISH PREP" : "NEXT QUESTION"}
                    </Button>
                  </div>
                </div>
              </Card>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

// Placeholder for missing icon in my local scope if any
const MessageSquareQuote = ({ size, className }) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    width={size} 
    height={size} 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    className={className}
  >
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
    <path d="m8 9 2 2 4-4"/>
  </svg>
);

export default InterviewPrepPage;
