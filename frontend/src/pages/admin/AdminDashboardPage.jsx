import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getDashboardStats, getInterviews } from "../../services/adminApi";
import { Card, Button } from "../../components/UI";
import {
  Users,
  Video,
  CheckCircle2,
  XCircle,
  Clock,
  ShieldAlert,
  Award,
  Brain,
  MessageSquare,
  Zap,
  ChevronRight,
  TrendingUp,
  BarChart3
} from "lucide-react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell
} from "recharts";

export const AdminDashboardPage = () => {
  const [stats, setStats] = useState(null);
  const [recentInterviews, setRecentInterviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchData = async () => {
    setLoading(true);
    setError("");
    try {
      const statsRes = await getDashboardStats();
      const interviewsRes = await getInterviews({ sortBy: "createdAt", sortDir: "desc" });

      if (statsRes.success) setStats(statsRes.data);
      if (interviewsRes.success) setRecentInterviews(interviewsRes.data.slice(0, 5));
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load admin statistics");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col justify-center items-center h-96 gap-4">
        <div className="w-12 h-12 border-4 border-amber-400 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-sm font-mono text-amber-400/80 uppercase tracking-widest">Loading Central Admin Dashboard...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-error/10 border border-error/30 rounded-2xl p-8 text-center max-w-lg mx-auto my-12">
        <ShieldAlert size={48} className="text-error mx-auto mb-4" />
        <h3 className="text-xl font-bold text-white mb-2">Access Error</h3>
        <p className="text-sm text-text-secondary mb-6">{error}</p>
        <Button onClick={fetchData}>Retry Loading</Button>
      </div>
    );
  }

  const COLORS = ["#d9ff00", "#3b82f6", "#f59e0b", "#ef4444"];

  const pieData = stats?.completedVsTerminated
    ? Object.keys(stats.completedVsTerminated).map((key) => ({
        name: key,
        value: stats.completedVsTerminated[key],
      }))
    : [];

  return (
    <div className="space-y-8 pb-12">
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 glass-card p-8 rounded-3xl border border-amber-500/20 bg-gradient-to-r from-amber-500/10 via-primary to-primary">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="px-3 py-1 bg-amber-500/20 text-amber-400 text-xs font-mono font-bold uppercase rounded-full border border-amber-500/30">
              Admin Portal
            </span>
            <span className="text-xs text-text-secondary font-mono">Live Monitoring Engine</span>
          </div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">
            Centralized Platform Overview
          </h1>
          <p className="text-text-secondary text-sm mt-1">
            Real-time telemetry, user performance distributions, and proctoring metrics.
          </p>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <Link to="/admin/users">
            <Button variant="outline" className="border-amber-500/30 text-amber-300 hover:bg-amber-500/10">
              Manage Users
            </Button>
          </Link>
          <Link to="/admin/interviews">
            <Button className="bg-amber-400 text-black hover:bg-amber-300 font-bold">
              View All Interviews
            </Button>
          </Link>
        </div>
      </div>

      {/* Primary KPI Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="border-t-2 border-t-amber-400">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-text-secondary uppercase tracking-wider mb-1">Registered Users</p>
              <h3 className="text-3xl font-extrabold text-white">{stats?.totalUsers || 0}</h3>
              <p className="text-[11px] text-accent/80 font-mono mt-1">Active Accounts</p>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-amber-400/10 border border-amber-400/20 flex items-center justify-center text-amber-400">
              <Users size={24} />
            </div>
          </div>
        </Card>

        <Card className="border-t-2 border-t-blue-400">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-text-secondary uppercase tracking-wider mb-1">Total Interviews</p>
              <h3 className="text-3xl font-extrabold text-white">{stats?.totalInterviews || 0}</h3>
              <p className="text-[11px] text-blue-400/80 font-mono mt-1">{stats?.completedInterviews || 0} Completed</p>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-blue-400/10 border border-blue-400/20 flex items-center justify-center text-blue-400">
              <Video size={24} />
            </div>
          </div>
        </Card>

        <Card className="border-t-2 border-t-accent">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-text-secondary uppercase tracking-wider mb-1">Avg Overall Score</p>
              <h3 className="text-3xl font-extrabold text-white">{stats?.avgOverallScore || 0}%</h3>
              <p className="text-[11px] text-accent font-mono mt-1">Platform-Wide Average</p>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-accent/10 border border-accent/20 flex items-center justify-center text-accent">
              <Award size={24} />
            </div>
          </div>
        </Card>

        <Card className="border-t-2 border-t-error">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-text-secondary uppercase tracking-wider mb-1">Terminated Sessions</p>
              <h3 className="text-3xl font-extrabold text-white">{stats?.terminatedInterviews || 0}</h3>
              <p className="text-[11px] text-error/80 font-mono mt-1">{stats?.totalProctoringViolations || 0} Proctor Flagged</p>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-error/10 border border-error/20 flex items-center justify-center text-error">
              <ShieldAlert size={24} />
            </div>
          </div>
        </Card>
      </div>

      {/* Secondary Performance Metrics Breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="flex items-center gap-4 bg-white/[0.02]">
          <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
            <Zap size={20} />
          </div>
          <div>
            <p className="text-xs text-text-secondary uppercase font-semibold">Technical Score</p>
            <p className="text-xl font-bold text-white">{stats?.avgTechnicalScore || 0}%</p>
          </div>
        </Card>

        <Card className="flex items-center gap-4 bg-white/[0.02]">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
            <MessageSquare size={20} />
          </div>
          <div>
            <p className="text-xs text-text-secondary uppercase font-semibold">Communication Score</p>
            <p className="text-xl font-bold text-white">{stats?.avgCommunicationScore || 0}%</p>
          </div>
        </Card>

        <Card className="flex items-center gap-4 bg-white/[0.02]">
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
            <Brain size={20} />
          </div>
          <div>
            <p className="text-xs text-text-secondary uppercase font-semibold">Problem-Solving Score</p>
            <p className="text-xl font-bold text-white">{stats?.avgProblemSolvingScore || 0}%</p>
          </div>
        </Card>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Scores Over Time Chart */}
        <Card className="lg:col-span-2">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <TrendingUp size={18} className="text-accent" /> Score Performance Trends
              </h3>
              <p className="text-xs text-text-secondary">Average scores logged over recent test runs</p>
            </div>
          </div>
          <div className="h-64 w-full">
            {stats?.scoresOverTime?.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={stats.scoresOverTime}>
                  <defs>
                    <linearGradient id="scoreColor" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#d9ff00" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#d9ff00" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="date" stroke="#666" fontSize={12} tickLine={false} />
                  <YAxis domain={[0, 100]} stroke="#666" fontSize={12} tickLine={false} />
                  <Tooltip
                    contentStyle={{ backgroundColor: "#0f0f0f", borderColor: "#333", borderRadius: "12px" }}
                    itemStyle={{ color: "#d9ff00" }}
                  />
                  <Area type="monotone" dataKey="avgScore" stroke="#d9ff00" strokeWidth={2} fillOpacity={1} fill="url(#scoreColor)" />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex justify-center items-center h-full text-xs text-text-secondary font-mono">
                No score trend data recorded yet.
              </div>
            )}
          </div>
        </Card>

        {/* Status Breakdown Pie Chart */}
        <Card>
          <div className="mb-6">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <BarChart3 size={18} className="text-amber-400" /> Session Statuses
            </h3>
            <p className="text-xs text-text-secondary">Distribution of interview statuses</p>
          </div>
          <div className="h-64 w-full flex flex-col items-center justify-center">
            {pieData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={pieData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={5} dataKey="value">
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ backgroundColor: "#0f0f0f", borderColor: "#333", borderRadius: "12px" }} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="text-xs text-text-secondary font-mono">No sessions recorded yet.</div>
            )}
          </div>
        </Card>
      </div>

      {/* Recent Interviews Table */}
      <Card>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-bold text-white">Recent Interview Activity</h3>
            <p className="text-xs text-text-secondary">Latest interviews conducted on the platform</p>
          </div>
          <Link to="/admin/interviews" className="text-xs font-bold text-amber-400 hover:underline flex items-center gap-1">
            VIEW ALL <ChevronRight size={14} />
          </Link>
        </div>

        {recentInterviews.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-white/10 text-xs font-semibold text-text-secondary uppercase tracking-wider">
                  <th className="py-3 px-4">Candidate</th>
                  <th className="py-3 px-4">Role & Type</th>
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4">Overall Score</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-sm">
                {recentInterviews.map((item) => (
                  <tr key={item.id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="py-4 px-4 font-semibold text-white">
                      {item.userName}
                      <span className="block text-xs text-text-secondary font-normal">{item.userEmail}</span>
                    </td>
                    <td className="py-4 px-4">
                      <span className="text-white font-medium">{item.targetRole}</span>
                      <span className="block text-xs text-amber-400 font-mono">{item.interviewType}</span>
                    </td>
                    <td className="py-4 px-4 text-xs font-mono text-text-secondary">
                      {item.createdAt ? new Date(item.createdAt).toLocaleDateString() : "N/A"}
                    </td>
                    <td className="py-4 px-4 font-mono font-bold text-accent">
                      {item.overallScore ? `${item.overallScore}%` : "N/A"}
                    </td>
                    <td className="py-4 px-4">
                      <span className={`px-2.5 py-1 text-[10px] font-mono font-bold uppercase rounded-md border ${
                        item.status === "COMPLETED"
                          ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                          : item.status === "TERMINATED"
                          ? "bg-error/10 text-error border-error/20"
                          : item.status === "IN_PROGRESS"
                          ? "bg-blue-500/10 text-blue-400 border-blue-500/20"
                          : "bg-white/10 text-text-secondary border-white/10"
                      }`}>
                        {item.status}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-right">
                      <Link to={`/admin/interviews`}>
                        <Button variant="outline" className="text-xs py-1.5 px-3 border-white/10">
                          Inspect
                        </Button>
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-12 border border-dashed border-white/10 rounded-2xl">
            <Clock size={32} className="text-text-secondary mx-auto mb-2 opacity-50" />
            <p className="text-sm text-text-secondary font-mono">No recent interview sessions recorded.</p>
          </div>
        )}
      </Card>
    </div>
  );
};
export default AdminDashboardPage;
