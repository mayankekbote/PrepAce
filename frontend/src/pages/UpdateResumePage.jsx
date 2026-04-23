import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { Card, Button } from "../components/UI";
import { ResumeDropzone } from "../components/ResumeDropzone";
import { motion } from "framer-motion";
import { FileUp, CheckCircle } from "lucide-react";
import api from "../services/api";

const UpdateResumePage = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const { user, completeProfile } = useAuth();
  const [resume, setResume] = useState(null);

  const handleFileSelect = (file) => {
    setResume(file);
    setSuccess(false);
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!resume) {
      setError("Please select a file first");
      return;
    }
    setLoading(true);
    setError("");

    const formData = new FormData();
    formData.append("email", user.email);
    formData.append("resume", resume);
    // Reuse completeProfile endpoint for simplicity as it handles resume updates
    // In a real app, you might have a dedicated update endpoint
    
    // Using completeProfile from context to update the user state as well
    const result = await completeProfile(formData);
    if (result.success) {
      setSuccess(true);
      setResume(null);
    } else {
      setError(result.message);
    }
    setLoading(false);
  };

  return (
    <div className="max-w-2xl mx-auto py-10">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Card className="border-t-2 border-t-accent/50">
          <div className="flex items-center gap-4 mb-8 pb-4 border-b border-white/5">
            <div className="p-3 bg-accent/10 text-accent rounded-xl">
              <FileUp size={24} />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white tracking-tight">Update Resume</h2>
              <p className="text-xs text-text-secondary uppercase tracking-[0.2em] font-bold opacity-50">Upload New File</p>
            </div>
          </div>

          <div className="mb-8">
            <p className="text-sm text-text-secondary mb-6 leading-relaxed">
              Keep your profile up to date by uploading your latest resume. 
              Our AI uses this file to create custom interview questions for you.
            </p>
            
            {user?.resumeFilename && (
              <div className="p-4 bg-white/5 rounded-xl border border-white/10 mb-6 flex items-center justify-between">
                <div>
                  <p className="text-[10px] text-text-secondary uppercase tracking-widest font-bold opacity-50 mb-1">Current Resume</p>
                  <p className="text-sm text-white font-medium truncate max-w-[200px]">{user.resumeFilename}</p>
                </div>
                <div className="text-success flex items-center gap-2">
                  <CheckCircle size={16} />
                  <span className="text-[10px] font-bold uppercase tracking-widest">Active</span>
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="group transition-all duration-300">
                <ResumeDropzone onFileSelect={handleFileSelect} />
              </div>

              {error && (
                <div className="bg-error/10 border border-error/20 rounded-lg p-3">
                  <p className="text-xs text-error text-center font-mono uppercase tracking-tighter">{error}</p>
                </div>
              )}

              {success && (
                <div className="bg-success/10 border border-success/20 rounded-lg p-3">
                  <p className="text-xs text-success text-center font-mono uppercase tracking-tighter">Resume successfully updated</p>
                </div>
              )}

              <Button type="submit" isLoading={loading} className="py-4 shadow-[0_0_30px_rgba(217,255,0,0.1)]">
                {success ? "UPLOAD ANOTHER" : "SAVE NEW RESUME"}
              </Button>
            </form>
          </div>
        </Card>
      </motion.div>
    </div>
  );
};

export default UpdateResumePage;
