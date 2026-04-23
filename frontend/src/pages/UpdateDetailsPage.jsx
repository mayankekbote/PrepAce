import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { Card, Input, Button } from "../components/UI";
import { motion } from "framer-motion";
import { UserCircle, Save } from "lucide-react";

const UpdateDetailsPage = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const { user, completeProfile } = useAuth();

  const [formData, setFormData] = useState({
    fullName: user?.fullName || "",
    phoneNumber: user?.phoneNumber || "",
    linkedinUrl: user?.linkedinUrl || "",
    githubUrl: user?.githubUrl || "",
    targetRole: user?.targetRole || "",
    experienceLevel: user?.experienceLevel || "Fresher",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setSuccess(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess(false);

    const data = new FormData();
    data.append("email", user.email);
    Object.keys(formData).forEach((key) => {
      data.append(key, formData[key]);
    });

    // completeProfile on backend handles partial updates of these fields
    const result = await completeProfile(data);
    if (result.success) {
      setSuccess(true);
    } else {
      setError(result.message);
    }
    setLoading(false);
  };

  return (
    <div className="max-w-3xl mx-auto py-10">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Card className="border-t-2 border-t-accent/50 max-w-none">
          <div className="flex items-center gap-4 mb-10 pb-4 border-b border-white/5">
            <div className="p-3 bg-accent/10 text-accent rounded-xl">
              <UserCircle size={24} />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white tracking-tight">Update Details</h2>
              <p className="text-xs text-text-secondary uppercase tracking-[0.2em] font-bold opacity-50">Manage Your Profile</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <Input
                label="Full Name"
                name="fullName"
                placeholder="Your name"
                value={formData.fullName}
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

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
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
                <div className="flex gap-2">
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
                      <div className={`text-center py-3 border rounded-xl cursor-pointer transition-all duration-300 ${
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
            </div>

            {error && (
              <div className="bg-error/10 border border-error/20 rounded-lg p-3">
                <p className="text-xs text-error text-center font-mono uppercase tracking-tighter">{error}</p>
              </div>
            )}

            {success && (
              <div className="bg-success/10 border border-success/20 rounded-lg p-3">
                <p className="text-xs text-success text-center font-mono uppercase tracking-tighter">Profile updated successfully</p>
              </div>
            )}

            <Button type="submit" isLoading={loading} className="py-4 shadow-[0_0_30px_rgba(217,255,0,0.1)]">
              <Save size={18} className="mr-2" />
              SAVE CHANGES
            </Button>
          </form>
        </Card>
      </motion.div>
    </div>
  );
};

export default UpdateDetailsPage;
