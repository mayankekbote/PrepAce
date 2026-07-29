import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { useAuth } from "../context/AuthContext";
import { interviewApi } from "../services/interviewApi";
import { Card, Button } from "../components/UI";
import {
  Sparkles,
  Mic,
  FileSearch,
  FileUp,
  UserCheck,
  Play,
  ArrowRight,
  Clock,
  CheckCircle2,
  AlertCircle,
  TrendingUp,
  Briefcase,
  Layers,
  LogOut,
  ChevronRight,
  ShieldCheck,
  Loader2
} from "lucide-react";

const Dashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [sessions, setSessions] = useState([]);
  const [loadingSessions, setLoadingSessions] = useState(true);

  useEffect(() => {
    if (!user) {
      navigate("/login");
    } else if (!user.targetRole || user.targetRole === "" || user.targetRole === "null") {
      navigate("/complete-profile");
    }
  }, [user, navigate]);

  // Fetch recent interview sessions
  useEffect(() => {
    const fetchUserSessions = async () => {
      if (!user) return;
      try {
        setLoadingSessions(true);
        const res = await interviewApi.getUserSessions();
        if (res.success && Array.isArray(res.data)) {
          setSessions(res.data);
        }
      } catch (err) {
        console.warn("Could not fetch user sessions:", err);
      } finally {
        setLoadingSessions(false);
      }
    };

    fetchUserSessions();
  }, [user]);

  if (!user) return null;

  const totalSessions = sessions.length;
  const completedSessions = sessions.filter((s) => s.status === "COMPLETED").length;
  const inProgressSessions = sessions.filter((s) => s.status === "IN_PROGRESS").length;

  return (
    <div className="max-w-6xl mx-auto space-y-10 py-4">
      {/* 1. Header Banner */}
      <motion.div
        initial={{ opacity: 0, y: -15 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 glass-card p-8 rounded-2xl border border-white/10 relative overflow-hidden"
      >
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-2">
            <span className="px-3 py-1 rounded-full text-[10px] font-mono font-bold uppercase tracking-widest bg-accent/10 border border-accent/20 text-accent flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse"></span>
              Candidate Active
            </span>
            {user.experienceLevel && (
              <span className="px-3 py-1 rounded-full text-[10px] font-mono font-bold uppercase tracking-widest bg-white/5 border border-white/10 text-text-secondary">
                {user.experienceLevel}
              </span>
            )}
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-white tracking-tight">
            Welcome, <span className="text-accent">{user.fullName || "Candidate"}</span>
          </h1>
          <p className="text-text-secondary text-sm mt-1 font-dm">
            Target Position: <strong className="text-white">{user.targetRole || "Software Engineer"}</strong>
          </p>
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto relative z-10">
          <Button
            onClick={() => navigate("/interview")}
            className="w-full md:w-auto px-6 py-3.5 text-xs tracking-wider uppercase font-bold"
          >
            <Play size={16} />
            <span>Launch Interview</span>
          </Button>
          <button
            onClick={logout}
            className="p-3.5 rounded-xl bg-white/5 border border-white/10 text-text-secondary hover:text-error hover:border-error/30 transition-all shrink-0"
            title="Terminate Session"
          >
            <LogOut size={18} />
          </button>
        </div>
      </motion.div>

      {/* 2. Key Metrics Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Metric 1: Target Position */}
        <div className="glass-card p-6 rounded-2xl border border-white/10 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-mono font-bold text-text-secondary uppercase tracking-wider">
              Target Role
            </span>
            <div className="p-2.5 rounded-xl bg-accent/10 text-accent">
              <Briefcase size={18} />
            </div>
          </div>
          <div>
            <p className="text-xl font-bold text-white truncate">{user.targetRole || "Not Configured"}</p>
            <p className="text-xs text-text-secondary opacity-60 font-mono mt-1">
              Level: {user.experienceLevel || "Mid"}
            </p>
          </div>
        </div>

        {/* Metric 2: Resume Status */}
        <div className="glass-card p-6 rounded-2xl border border-white/10 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-mono font-bold text-text-secondary uppercase tracking-wider">
              Resume Context
            </span>
            <div className="p-2.5 rounded-xl bg-success/10 text-success">
              <UserCheck size={18} />
            </div>
          </div>
          <div>
            <p className="text-xl font-bold text-white truncate">
              {user.resumeFilename ? "Indexed & Parsed" : "No Resume Uploaded"}
            </p>
            <Link
              to="/analysis"
              className="text-xs text-accent hover:underline font-mono inline-flex items-center gap-1 mt-1"
            >
              <span>View Candidate Profile</span>
              <ChevronRight size={12} />
            </Link>
          </div>
        </div>

        {/* Metric 3: Total Interviews Created */}
        <div className="glass-card p-6 rounded-2xl border border-white/10 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-mono font-bold text-text-secondary uppercase tracking-wider">
              Mock Sessions
            </span>
            <div className="p-2.5 rounded-xl bg-accent/10 text-accent">
              <Layers size={18} />
            </div>
          </div>
          <div>
            <p className="text-2xl font-bold text-white">{totalSessions}</p>
            <p className="text-xs text-text-secondary opacity-60 font-mono mt-1">
              {completedSessions} Completed • {inProgressSessions} In Progress
            </p>
          </div>
        </div>

        {/* Metric 4: Voice Engine Status */}
        <div className="glass-card p-6 rounded-2xl border border-white/10 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-mono font-bold text-text-secondary uppercase tracking-wider">
              AI Speech Engine
            </span>
            <div className="p-2.5 rounded-xl bg-accent/10 text-accent">
              <Mic size={18} />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-success animate-pulse"></span>
              <p className="text-sm font-bold text-white font-mono">Speech-First Active</p>
            </div>
            <p className="text-xs text-text-secondary opacity-60 font-mono mt-1">
              Single Groq LLM Turn Loop
            </p>
          </div>
        </div>
      </div>

      {/* 3. Action Launchpad Grid */}
      <div>
        <h3 className="text-xl font-bold text-white tracking-tight mb-4 flex items-center gap-2">
          <Sparkles size={18} className="text-accent" />
          <span>Launchpad & Controls</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Action Card 1: Voice Interview Room */}
          <div
            onClick={() => navigate("/interview")}
            className="glass-card p-6 rounded-2xl border border-white/10 hover:border-accent/50 transition-all duration-300 cursor-pointer group flex flex-col justify-between relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-24 h-24 bg-accent/5 rounded-full blur-xl group-hover:bg-accent/15 transition-all"></div>
            <div>
              <div className="w-12 h-12 rounded-xl bg-accent/10 border border-accent/20 text-accent flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Mic size={24} />
              </div>
              <h4 className="text-lg font-bold text-white mb-2 group-hover:text-accent transition-colors">
                AI Voice Interview Room
              </h4>
              <p className="text-xs text-text-secondary leading-relaxed font-dm mb-6">
                Start a live speech-first mock interview room tailored to your resume, projects, and target role concepts.
              </p>
            </div>
            <div className="flex items-center justify-between pt-4 border-t border-white/5 text-accent text-xs font-bold font-mono">
              <span>START SESSION</span>
              <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
            </div>
          </div>

          {/* Action Card 2: Resume Analysis */}
          <div
            onClick={() => navigate("/analysis")}
            className="glass-card p-6 rounded-2xl border border-white/10 hover:border-accent/50 transition-all duration-300 cursor-pointer group flex flex-col justify-between relative overflow-hidden"
          >
            <div>
              <div className="w-12 h-12 rounded-xl bg-white/5 border border-white/10 text-white flex items-center justify-center mb-6 group-hover:scale-110 transition-transform group-hover:border-accent/40 group-hover:text-accent">
                <FileSearch size={24} />
              </div>
              <h4 className="text-lg font-bold text-white mb-2 group-hover:text-accent transition-colors">
                Resume Intelligence Analysis
              </h4>
              <p className="text-xs text-text-secondary leading-relaxed font-dm mb-6">
                Inspect extracted technical skills, project contributions, and candidate profile used by the AI engine.
              </p>
            </div>
            <div className="flex items-center justify-between pt-4 border-t border-white/5 text-text-secondary group-hover:text-accent text-xs font-bold font-mono transition-colors">
              <span>VIEW ANALYSIS</span>
              <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
            </div>
          </div>

          {/* Action Card 3: Update Resume */}
          <div
            onClick={() => navigate("/update-resume")}
            className="glass-card p-6 rounded-2xl border border-white/10 hover:border-accent/50 transition-all duration-300 cursor-pointer group flex flex-col justify-between relative overflow-hidden"
          >
            <div>
              <div className="w-12 h-12 rounded-xl bg-white/5 border border-white/10 text-white flex items-center justify-center mb-6 group-hover:scale-110 transition-transform group-hover:border-accent/40 group-hover:text-accent">
                <FileUp size={24} />
              </div>
              <h4 className="text-lg font-bold text-white mb-2 group-hover:text-accent transition-colors">
                Update Resume & Target Role
              </h4>
              <p className="text-xs text-text-secondary leading-relaxed font-dm mb-6">
                Upload a new PDF resume or update your target position and experience level settings.
              </p>
            </div>
            <div className="flex items-center justify-between pt-4 border-t border-white/5 text-text-secondary group-hover:text-accent text-xs font-bold font-mono transition-colors">
              <span>UPDATE PROFILE</span>
              <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
            </div>
          </div>
        </div>
      </div>

      {/* 4. Recent Interview Sessions Table */}
      <div className="glass-card rounded-2xl p-6 md:p-8 border border-white/10">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-xl font-bold text-white tracking-tight">Recent Interview Sessions</h3>
            <p className="text-xs text-text-secondary opacity-70 font-mono mt-0.5">
              History of candidate mock sessions
            </p>
          </div>
          <Button
            variant="outline"
            onClick={() => navigate("/interview")}
            className="w-auto px-4 py-2 text-xs"
          >
            + New Session
          </Button>
        </div>

        {loadingSessions ? (
          <div className="py-12 text-center text-text-secondary font-mono text-xs flex flex-col items-center gap-3">
            <Loader2 size={24} className="animate-spin text-accent" />
            <span>Loading interview sessions history...</span>
          </div>
        ) : sessions.length === 0 ? (
          <div className="py-12 text-center border border-dashed border-white/10 rounded-xl p-8">
            <Clock size={32} className="text-text-secondary mx-auto mb-3 opacity-40" />
            <h4 className="text-base font-bold text-white mb-1">No Interview Sessions Yet</h4>
            <p className="text-xs text-text-secondary max-w-sm mx-auto mb-6">
              You haven't launched any AI mock interview sessions. Configure and start your first voice interview below!
            </p>
            <Button onClick={() => navigate("/interview")} className="w-auto px-6 py-2.5 mx-auto text-xs">
              START YOUR FIRST INTERVIEW
            </Button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-white/10 text-[10px] font-mono uppercase tracking-widest text-text-secondary opacity-60">
                  <th className="py-3 px-4">Session Role</th>
                  <th className="py-3 px-4">Focus Type</th>
                  <th className="py-3 px-4">Difficulty</th>
                  <th className="py-3 px-4">Progress</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-xs font-dm">
                {sessions.map((sess) => (
                  <tr key={sess.id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="py-4 px-4 font-bold text-white">
                      {sess.targetRole}
                    </td>
                    <td className="py-4 px-4 font-mono text-accent">
                      {sess.interviewType}
                    </td>
                    <td className="py-4 px-4 font-mono text-text-secondary">
                      {sess.difficulty}
                    </td>
                    <td className="py-4 px-4 font-mono text-white">
                      {sess.currentQuestionIndex} / {sess.totalQuestions} Questions
                    </td>
                    <td className="py-4 px-4">
                      <span
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-mono font-bold ${
                          sess.status === "COMPLETED"
                            ? "bg-success/10 text-success border border-success/20"
                            : sess.status === "IN_PROGRESS"
                            ? "bg-accent/10 text-accent border border-accent/20 animate-pulse"
                            : "bg-white/5 text-text-secondary border border-white/10"
                        }`}
                      >
                        {sess.status === "COMPLETED" && <CheckCircle2 size={12} />}
                        {sess.status === "IN_PROGRESS" && <Clock size={12} />}
                        <span>{sess.status}</span>
                      </span>
                    </td>
                    <td className="py-4 px-4 text-right">
                      <button
                        onClick={() => navigate(`/interview/${sess.id}`)}
                        className="px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-white hover:border-accent/40 hover:text-accent font-mono text-xs font-bold transition-all"
                      >
                        {sess.status === "IN_PROGRESS" ? "Resume" : "Open Room"}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
