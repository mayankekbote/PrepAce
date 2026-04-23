import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Card } from "../components/UI";
import { useAuth } from "../context/AuthContext";
import api from "../services/api";
import { 
  Code2, 
  Layers, 
  Terminal, 
  ExternalLink, 
  Cpu, 
  Globe,
  Loader2,
  AlertTriangle
} from "lucide-react";

const ResumeAnalysisPage = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [extractedData, setExtractedData] = useState(null);

  useEffect(() => {
    const fetchAnalysis = async () => {
      if (!user?.email) return;
      
      try {
        setLoading(true);
        const response = await api.get(`/user/analysis?email=${user.email}`);
        if (response.data.success) {
          setExtractedData(response.data.data);
          // Store in session storage for the interview page
          sessionStorage.setItem("current_analysis", JSON.stringify(response.data.data));
        } else {
          setError(response.data.message || "Failed to analyze resume.");
        }
      } catch (err) {
        console.error("Analysis Error:", err);
        const backendMessage = err.response?.data?.message;
        const status = err.response?.status;
        
        if (status === 404) {
          setError("Candidate profile not found.");
        } else if (status === 400) {
          setError(backendMessage || "Missing resume file. Please upload a resume first.");
        } else {
          setError(backendMessage || "Connection Error: Check if AI service (port 8000) and Backend (port 8085) are running at 127.0.0.1.");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchAnalysis();
  }, [user?.email]);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1 }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <Loader2 size={40} className="text-accent animate-spin mb-4" />
        <p className="text-text-secondary font-mono text-xs uppercase tracking-widest animate-pulse">
          AI Evaluation Engine Processing Resume...
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] max-w-md mx-auto text-center">
        <AlertTriangle size={40} className="text-error mb-4" />
        <h3 className="text-xl font-bold text-white mb-2">Analysis Failed</h3>
        <p className="text-text-secondary text-sm mb-6">{error}</p>
        <button 
          onClick={() => window.location.reload()}
          className="px-6 py-2 bg-accent/10 border border-accent/20 text-accent rounded-lg text-xs font-bold uppercase tracking-widest"
        >
          Retry Protocol
        </button>
      </div>
    );
  }

  if (!extractedData) return null;

  return (
    <div className="max-w-6xl mx-auto py-6">
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        className="mb-12 border-l-4 border-accent pl-6"
      >
        <h2 className="text-4xl font-bold text-white tracking-tight mb-2">Resume Analysis</h2>
        <p className="text-text-secondary font-mono text-xs uppercase tracking-widest">
          Extracted from: {user?.resumeFilename || "default_profile.pdf"}
        </p>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* Projects Section - Primary Focus */}
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="lg:col-span-2 space-y-8"
        >
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-accent/10 text-accent rounded-lg">
              <Layers size={20} />
            </div>
            <h3 className="text-xl font-bold text-white uppercase tracking-tighter italic">Projects Focus</h3>
          </div>

          {extractedData.projects.map((project, idx) => (
            <motion.div key={idx} variants={itemVariants}>
              <Card className="max-w-none border-white/5 hover:border-accent/30 transition-all duration-500 group">
                <div className="flex justify-between items-start mb-6">
                  <h4 className="text-xl font-bold text-white group-hover:text-accent transition-colors duration-300">
                    {project.title}
                  </h4>
                  <div className="flex gap-2">
                    {project.techStack.map(tech => (
                      <span key={tech} className="text-[9px] font-bold bg-white/5 border border-white/10 px-2 py-1 rounded text-text-secondary uppercase">
                        {tech}
                      </span>
                    ))}
                  </div>
                </div>

                <ul className="space-y-4 mb-6">
                  {project.contributions.map((bullet, i) => (
                    <li key={i} className="flex gap-3 text-sm text-text-secondary leading-relaxed">
                      <span className="text-accent mt-1.5 shrink-0">
                        <Terminal size={14} />
                      </span>
                      {bullet}
                    </li>
                  ))}
                </ul>

                {project.impact && (
                  <div className="mt-6 pt-6 border-t border-white/5">
                    <p className="text-xs font-mono text-success/80 flex items-center gap-2 italic">
                      <Globe size={14} />
                      IMPACT: {project.impact}
                    </p>
                  </div>
                )}
              </Card>
            </motion.div>
          ))}
        </motion.div>

        {/* Skills Section */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
          className="space-y-8"
        >
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-accent/10 text-accent rounded-lg">
              <Cpu size={20} />
            </div>
            <h3 className="text-xl font-bold text-white uppercase tracking-tighter italic">Skill Matrix</h3>
          </div>

          <Card className="max-w-none border-white/5 space-y-8">
            <div>
              <p className="text-[10px] text-accent uppercase tracking-widest font-bold mb-4 flex items-center gap-2">
                <div className="w-1.5 h-1.5 bg-accent rounded-full animate-pulse"></div>
                Programming Languages
              </p>
              <div className="flex flex-wrap gap-2">
                {extractedData.skills.languages.map(skill => (
                  <span key={skill} className="px-3 py-1.5 bg-white/5 border border-white/10 rounded-lg text-xs font-medium text-white hover:border-accent/50 transition-colors cursor-default">
                    {skill}
                  </span>
                ))}
              </div>
            </div>

            <div>
              <p className="text-[10px] text-accent uppercase tracking-widest font-bold mb-4 flex items-center gap-2">
                <div className="w-1.5 h-1.5 bg-accent rounded-full animate-pulse"></div>
                Frameworks & Libraries
              </p>
              <div className="flex flex-wrap gap-2">
                {extractedData.skills.frameworks.map(skill => (
                  <span key={skill} className="px-3 py-1.5 bg-white/5 border border-white/10 rounded-lg text-xs font-medium text-white hover:border-accent/50 transition-colors cursor-default">
                    {skill}
                  </span>
                ))}
              </div>
            </div>

            <div>
              <p className="text-[10px] text-accent uppercase tracking-widest font-bold mb-4 flex items-center gap-2">
                <div className="w-1.5 h-1.5 bg-accent rounded-full animate-pulse"></div>
                Tools & Platforms
              </p>
              <div className="flex flex-wrap gap-2">
                {extractedData.skills.tools.map(skill => (
                  <span key={skill} className="px-3 py-1.5 bg-white/5 border border-white/10 rounded-lg text-xs font-medium text-white hover:border-accent/50 transition-colors cursor-default">
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          </Card>

          <div className="p-6 rounded-2xl bg-gradient-to-br from-accent/5 to-transparent border border-accent/10">
            <h4 className="text-sm font-bold text-white mb-2 italic">Ready for prep?</h4>
            <p className="text-xs text-text-secondary mb-4 leading-relaxed">
              We've generated custom questions based on these technical projects.
            </p>
            <a href="/interview" className="text-accent text-xs font-bold flex items-center gap-2 group hover:translate-x-1 transition-transform">
              GO TO INTERVIEW PREP
              <ExternalLink size={12} />
            </a>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default ResumeAnalysisPage;
