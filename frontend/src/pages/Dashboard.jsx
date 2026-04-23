import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Button, Card } from "../components/UI";
import { LogOut, User as UserIcon, ShieldCheck } from "lucide-react";

const Dashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      navigate("/login");
    } else if (!user.targetRole || user.targetRole === "" || user.targetRole === "null") {
      navigate("/complete-profile");
    }
  }, [user, navigate]);

  if (!user) return null;

  return (
    <div className="max-w-5xl mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 gap-6">
        <div>
          <h2 className="text-4xl font-bold text-white tracking-tight mb-2">User Dashboard</h2>
          <div className="flex items-center gap-3">
            <div className="w-2 h-2 rounded-full bg-success animate-pulse"></div>
            <p className="text-text-secondary font-mono text-sm uppercase tracking-widest">Active Session: {(user.fullName || "GUEST").toUpperCase()}</p>
          </div>
        </div>
        <Button variant="outline" onClick={logout} className="w-auto px-8 group">
          <LogOut size={18} className="group-hover:rotate-12 transition-transform duration-300" />
          TERMINATE SESSION
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-8">
        <Card className="max-w-none border-l-4 border-l-accent/30">
          <div className="flex items-center justify-between mb-8 pb-4 border-b border-white/5">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-accent/10 text-accent rounded-xl">
                <UserIcon size={22} />
              </div>
              <h3 className="text-xl font-bold tracking-tight">Profile Info</h3>
            </div>
            <div className="text-[10px] font-mono text-accent/50 uppercase tracking-widest">System Status: OK</div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="space-y-1">
              <p className="text-[10px] text-text-secondary uppercase tracking-[0.2em] font-bold opacity-50">Full Name</p>
              <p className="text-lg text-white font-medium">{user.fullName}</p>
            </div>
            <div className="space-y-1">
              <p className="text-[10px] text-text-secondary uppercase tracking-[0.2em] font-bold opacity-50">Email Address</p>
              <p className="text-md text-white font-medium break-all">{user.email}</p>
            </div>
            <div className="space-y-1">
              <p className="text-[10px] text-text-secondary uppercase tracking-[0.2em] font-bold opacity-50">Target Role</p>
              <p className="text-lg text-accent px-3 font-bold tracking-tight">{user.targetRole || "NOT SET"}</p>
            </div>
            <div className="space-y-1">
              <p className="text-[10px] text-text-secondary uppercase tracking-[0.2em] font-bold opacity-50">Experience Level</p>
              <p className="text-lg text-white font-medium">{user.experienceLevel || "NOT SET"}</p>
            </div>
          </div>
        </Card>
      </div>

      <div className="mt-12 group">
        <div className="relative p-1 bg-gradient-to-r from-transparent via-accent/20 to-transparent rounded-2xl">
          <div className="relative text-center p-16 rounded-2xl bg-[#080808] border border-white/5 overflow-hidden">
            {/* Animated background element */}
            <div className="absolute inset-0 bg-accent/5 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none"></div>

            <p className="text-text-secondary font-mono text-sm uppercase tracking-[0.3em] mb-6 opacity-60">Ready to begin</p>
            <h3 className="text-3xl font-bold text-white mb-8 tracking-tighter">Start Your Interview</h3>
            <Button className="max-w-md mx-auto py-5 text-lg tracking-[0.2em] shadow-[0_0_30px_rgba(217,255,0,0.1)] group-hover:shadow-[0_0_50px_rgba(217,255,0,0.3)] transition-all duration-500">
              LAUNCH MOCK INTERVIEW
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
