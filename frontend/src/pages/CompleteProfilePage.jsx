import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Card, Input, Button } from "../components/UI";
import { ResumeDropzone } from "../components/ResumeDropzone";
import { motion } from "framer-motion";

const CompleteProfilePage = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const { user, completeProfile } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    phoneNumber: "",
    linkedinUrl: "",
    githubUrl: "",
    targetRole: "",
    experienceLevel: "Fresher",
    resume: null,
  });

  useEffect(() => {
    if (!user) {
      navigate("/login");
    } else if (user.profileComplete) {
      navigate("/dashboard");
    }
  }, [user, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileSelect = (file) => {
    setFormData((prev) => ({ ...prev, resume: file }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.targetRole) {
      setError("Please select a target role");
      return;
    }
    setLoading(true);
    setError("");

    const data = new FormData();
    data.append("email", user.email);
    data.append("phoneNumber", formData.phoneNumber);
    data.append("linkedinUrl", formData.linkedinUrl);
    data.append("githubUrl", formData.githubUrl);
    data.append("targetRole", formData.targetRole);
    data.append("experienceLevel", formData.experienceLevel);
    if (formData.resume) {
      data.append("resume", formData.resume);
    }

    const result = await completeProfile(data);
    if (result.success) {
      navigate("/dashboard");
    } else {
      setError(result.message);
    }
    setLoading(false);
  };

  if (!user) return null;

  return (
    <div className="flex justify-center items-center">
      <Card className="max-w-xl border-t-2 border-t-accent/50 shadow-[0_0_50px_rgba(0,0,0,0.5)]">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-bold text-white mb-2 tracking-tight">Complete Profile</h2>
          <p className="text-text-secondary text-sm font-medium">
            Just a few more details to get your account ready for interviews.
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.4 }}
            className="flex flex-col gap-6"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Input
                label="Phone Number"
                name="phoneNumber"
                placeholder="+1 (000) 000-0000"
                value={formData.phoneNumber}
                onChange={handleChange}
              />
              <Input
                label="LinkedIn Profile"
                name="linkedinUrl"
                placeholder="linkedin.com/in/..."
                value={formData.linkedinUrl}
                onChange={handleChange}
              />
            </div>

            <Input
              label="GitHub Profile"
              name="githubUrl"
              placeholder="github.com/..."
              value={formData.githubUrl}
              onChange={handleChange}
            />

            <div className="flex flex-col gap-2">
              <label className="text-xs font-semibold text-text-secondary uppercase tracking-widest ml-1 opacity-70">Target Role</label>
              <div className="relative group">
                <select
                  name="targetRole"
                  value={formData.targetRole}
                  onChange={handleChange}
                  className="w-full bg-white/5 border border-white/10 text-white rounded-xl px-4 py-3.5 focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent/30 appearance-none transition-all duration-300 input-focus-glow"
                  required
                >
                  <option value="" className="bg-[#0f0f0f]">Select Role</option>
                  <option value="SDE-1" className="bg-[#0f0f0f]">Software Engineer (L1)</option>
                  <option value="SDE-2" className="bg-[#0f0f0f]">Software Engineer (L2)</option>
                  <option value="Data Analyst" className="bg-[#0f0f0f]">Data Analyst</option>
                  <option value="PM" className="bg-[#0f0f0f]">Product Manager</option>
                  <option value="DevOps" className="bg-[#0f0f0f]">DevOps Engineer</option>
                  <option value="QA" className="bg-[#0f0f0f]">QA Engineer</option>
                </select>
                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-accent">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6"/></svg>
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-xs font-semibold text-text-secondary uppercase tracking-widest ml-1 opacity-70">Experience Level</label>
              <div className="flex gap-3">
                {["Fresher", "Junior", "Mid", "Senior"].map((level) => (
                  <label key={level} className="flex-1 group">
                    <input
                      type="radio"
                      name="experienceLevel"
                      value={level}
                      checked={formData.experienceLevel === level}
                      onChange={handleChange}
                      className="hidden"
                    />
                    <div className={`text-center py-2.5 border rounded-xl cursor-pointer transition-all duration-300 ${
                      formData.experienceLevel === level 
                        ? "border-accent bg-accent/10 text-accent shadow-[0_0_15px_rgba(217,255,0,0.1)]" 
                        : "border-white/10 text-text-secondary hover:border-white/30"
                    }`}>
                      <span className="text-[10px] font-bold uppercase tracking-widest">{level}</span>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-xs font-semibold text-text-secondary uppercase tracking-widest ml-1 opacity-70">Resume File (PDF)</label>
              <div className="group transition-all duration-300">
                <ResumeDropzone onFileSelect={handleFileSelect} />
              </div>
            </div>

            {error && (
              <div className="bg-error/10 border border-error/20 rounded-lg p-3">
                <p className="text-xs text-error text-center font-mono uppercase tracking-tighter">{error}</p>
              </div>
            )}

            <Button type="submit" isLoading={loading} className="mt-4">
              COMPLETE PROFILE
            </Button>
          </motion.div>
        </form>
      </Card>
    </div>
  );
};

export default CompleteProfilePage;
