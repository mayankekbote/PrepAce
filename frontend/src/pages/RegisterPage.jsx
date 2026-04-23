import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Card, Input, Button } from "../components/UI";
import { PasswordStrengthBar } from "../components/PasswordStrengthBar";
import { ResumeDropzone } from "../components/ResumeDropzone";
import { motion, AnimatePresence } from "framer-motion";

const RegisterPage = () => {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const { register } = useAuth();

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
    phoneNumber: "",
    linkedinUrl: "",
    githubUrl: "",
    targetRole: "",
    experienceLevel: "",
    resume: null,
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileSelect = (file) => {
    setFormData((prev) => ({ ...prev, resume: file }));
  };

  const nextStep = () => {
    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      return;
    }
    setError("");
    setStep(2);
  };

  const prevStep = () => setStep(1);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.resume) {
      setError("Please upload your resume");
      return;
    }
    setLoading(true);
    setError("");

    const data = new FormData();
    Object.keys(formData).forEach((key) => {
      if (key === "confirmPassword") return;
      if (formData[key] !== null && formData[key] !== "") {
        data.append(key, formData[key]);
      }
    });

    const result = await register(data);
    if (result.success) {
      navigate("/dashboard");
    } else {
      setError(result.message);
    }
    setLoading(false);
  };

  return (
    <div className="flex justify-center items-center">
      <Card className="max-w-xl border-t-2 border-t-accent/50 shadow-[0_0_50px_rgba(0,0,0,0.5)]">
        <div className="flex justify-center gap-3 mb-10">
          <div className={`h-1 rounded-full transition-all duration-500 ${step === 1 ? "bg-accent w-16 shadow-[0_0_10px_rgba(217,255,0,0.5)]" : "bg-white/10 w-8"}`}></div>
          <div className={`h-1 rounded-full transition-all duration-500 ${step === 2 ? "bg-accent w-16 shadow-[0_0_10px_rgba(217,255,0,0.5)]" : "bg-white/10 w-8"}`}></div>
        </div>

        <div className="text-center mb-10">
          <h2 className="text-3xl font-bold text-white mb-2 tracking-tight">
            {step === 1 ? "Create Account" : "Profile Details"}
          </h2>
          <p className="text-text-secondary text-sm font-medium">
            {step === 1 ? "Step 01: Your Info" : "Step 02: Career Info"}
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          <AnimatePresence mode="wait">
            {step === 1 ? (
              <motion.div
                key="step1"
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: 20, opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="flex flex-col gap-6"
              >
                <Input
                  label="Full Name"
                  name="fullName"
                  placeholder="Your name"
                  value={formData.fullName}
                  onChange={handleChange}
                  required
                />
                <Input
                  label="Email Address"
                  name="email"
                  type="email"
                  placeholder="your@email.com"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
                <div className="flex flex-col gap-2">
                  <Input
                    label="Password"
                    name="password"
                    type="password"
                    placeholder="••••••••"
                    value={formData.password}
                    onChange={handleChange}
                    required
                  />
                  <PasswordStrengthBar password={formData.password} />
                </div>
                <Input
                  label="Confirm Password"
                  name="confirmPassword"
                  type="password"
                  placeholder="••••••••"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  required
                />
                <Input
                  label="Phone Number"
                  name="phoneNumber"
                  placeholder="+1 (000) 000-0000"
                  value={formData.phoneNumber}
                  onChange={handleChange}
                />
                
                {error && (
                  <div className="bg-error/10 border border-error/20 rounded-lg p-3">
                    <p className="text-xs text-error text-center font-mono uppercase tracking-tighter">{error}</p>
                  </div>
                )}
                
                <Button type="button" onClick={nextStep} className="mt-4">
                  PROCEED TO DETAILS
                </Button>
              </motion.div>
            ) : (
              <motion.div
                key="step2"
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: 20, opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="flex flex-col gap-6"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Input
                    label="LinkedIn Profile"
                    name="linkedinUrl"
                    placeholder="linkedin.com/in/..."
                    value={formData.linkedinUrl}
                    onChange={handleChange}
                  />
                  <Input
                    label="GitHub Profile"
                    name="githubUrl"
                    placeholder="github.com/..."
                    value={formData.githubUrl}
                    onChange={handleChange}
                  />
                </div>

                <div className="flex flex-col gap-2">
                  <label className="text-xs font-semibold text-text-secondary uppercase tracking-widest ml-1 opacity-70">Target Role</label>
                  <div className="relative group">
                    <select
                      name="targetRole"
                      value={formData.targetRole}
                      onChange={handleChange}
                      className="w-full bg-white/5 border border-white/10 text-white rounded-xl px-4 py-3.5 focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent/30 appearance-none transition-all duration-300 input-focus-glow"
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

                <div className="flex gap-4 mt-4">
                  <Button type="button" variant="outline" onClick={prevStep} className="flex-1">
                    BACK
                  </Button>
                  <Button type="submit" isLoading={loading} className="flex-[2]">
                    CREATE ACCOUNT
                  </Button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </form>

        <p className="text-center text-sm text-text-secondary mt-10">
          Already verified?{" "}
          <Link to="/login" className="text-accent font-bold hover:text-white transition-colors duration-200 underline decoration-accent/30 underline-offset-4">
            Sign in
          </Link>
        </p>
      </Card>
    </div>
  );
};

export default RegisterPage;
