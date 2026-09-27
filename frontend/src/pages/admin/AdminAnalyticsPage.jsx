import React, { useEffect, useState } from "react";
import { getDashboardStats } from "../../services/adminApi";
import { Card, Button } from "../../components/UI";
import {
  BarChart3,
  TrendingUp,
  PieChart as PieChartIcon,
  ShieldAlert,
  Zap,
  Award,
  Brain,
  MessageSquare
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
  Cell,
  Legend
} from "recharts";

export const AdminAnalyticsPage = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchStats = async () => {
    setLoading(true);
    try {
      const res = await getDashboardStats();
      if (res.success) {
        setStats(res.data);
      }
    } catch (err) {
      setError(err.response?.data?.message || "Failed to fetch analytics data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col justify-center items-center h-96 gap-4">
        <div className="w-12 h-12 border-4 border-amber-400 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-sm font-mono text-amber-400/80 uppercase tracking-widest">Generating Visual Analytics Telemetry...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-error/10 border border-error/30 rounded-2xl p-8 text-center max-w-lg mx-auto my-12">
        <ShieldAlert size={48} className="text-error mx-auto mb-4" />
        <h3 className="text-xl font-bold text-white mb-2">Analytics Error</h3>
        <p className="text-sm text-text-secondary mb-6">{error}</p>
        <Button onClick={fetchStats}>Retry Loading</Button>
      </div>
    );
  }

  const COLORS = ["#d9ff00", "#3b82f6", "#f59e0b", "#ef4444", "#a855f7"];

  // Format data for Recharts
  const scoreTrendData = stats?.scoresOverTime || [];

  const typeData = stats?.avgScoreByInterviewType
    ? Object.keys(stats.avgScoreByInterviewType).map((key) => ({
        type: key,
        score: stats.avgScoreByInterviewType[key],
      }))
    : [];

  const perfDistributionData = stats?.performanceDistribution
    ? Object.keys(stats.performanceDistribution).map((key) => ({
        name: key,
        value: stats.performanceDistribution[key],
      }))
    : [];

  const statusData = stats?.completedVsTerminated
    ? Object.keys(stats.completedVsTerminated).map((key) => ({
        name: key,
        count: stats.completedVsTerminated[key],
      }))
    : [];

  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 mb-1">
          <span className="px-3 py-1 bg-amber-500/20 text-amber-400 text-xs font-mono font-bold uppercase rounded-full border border-amber-500/30">
            Telemetry Insights
          </span>
        </div>
        <h1 className="text-3xl font-extrabold text-white tracking-tight flex items-center gap-3">
          <BarChart3 className="text-amber-400" size={32} /> Platform Analytics & Score Insights
        </h1>
        <p className="text-text-secondary text-sm">
          Detailed breakdown of score distributions, candidate skill evaluations, and interview outcome metrics.
        </p>
      </div>

      {/* Category Averages Row */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="border-t-2 border-t-amber-400">
          <div className="flex items-center gap-3 mb-2">
            <Award className="text-amber-400" size={20} />
            <span className="text-xs font-semibold text-text-secondary uppercase">Overall Average</span>
          </div>
          <p className="text-3xl font-extrabold text-white">{stats?.avgOverallScore || 0}%</p>
        </Card>

        <Card className="border-t-2 border-t-purple-400">
          <div className="flex items-center gap-3 mb-2">
            <Zap className="text-purple-400" size={20} />
            <span className="text-xs font-semibold text-text-secondary uppercase">Technical Accuracy</span>
          </div>
          <p className="text-3xl font-extrabold text-white">{stats?.avgTechnicalScore || 0}%</p>
        </Card>

        <Card className="border-t-2 border-t-emerald-400">
          <div className="flex items-center gap-3 mb-2">
            <MessageSquare className="text-emerald-400" size={20} />
            <span className="text-xs font-semibold text-text-secondary uppercase">Communication</span>
          </div>
          <p className="text-3xl font-extrabold text-white">{stats?.avgCommunicationScore || 0}%</p>
        </Card>

        <Card className="border-t-2 border-t-blue-400">
          <div className="flex items-center gap-3 mb-2">
            <Brain className="text-blue-400" size={20} />
            <span className="text-xs font-semibold text-text-secondary uppercase">Problem Solving</span>
          </div>
          <p className="text-3xl font-extrabold text-white">{stats?.avgProblemSolvingScore || 0}%</p>
        </Card>
      </div>

      {/* Chart Grid 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Scores Over Time */}
        <Card>
          <div className="mb-6">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <TrendingUp size={18} className="text-accent" /> Scores Over Time
            </h3>
            <p className="text-xs text-text-secondary">Chronological progression of candidate scores</p>
          </div>
          <div className="h-72 w-full">
            {scoreTrendData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={scoreTrendData}>
                  <defs>
                    <linearGradient id="scoreColorAnalytics" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#d9ff00" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#d9ff00" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="date" stroke="#666" fontSize={12} tickLine={false} />
                  <YAxis domain={[0, 100]} stroke="#666" fontSize={12} tickLine={false} />
                  <Tooltip contentStyle={{ backgroundColor: "#0f0f0f", borderColor: "#333", borderRadius: "12px" }} />
                  <Area type="monotone" dataKey="avgScore" stroke="#d9ff00" strokeWidth={2.5} fillOpacity={1} fill="url(#scoreColorAnalytics)" />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex justify-center items-center h-full text-xs text-text-secondary font-mono">
                No trend data available.
              </div>
            )}
          </div>
        </Card>

        {/* Avg Score by Interview Type */}
        <Card>
          <div className="mb-6">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <BarChart3 size={18} className="text-amber-400" /> Average Score by Interview Type
            </h3>
            <p className="text-xs text-text-secondary">Performance comparison across Technical, Behavioral & System Design</p>
          </div>
          <div className="h-72 w-full">
            {typeData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={typeData}>
                  <XAxis dataKey="type" stroke="#666" fontSize={12} tickLine={false} />
                  <YAxis domain={[0, 100]} stroke="#666" fontSize={12} tickLine={false} />
                  <Tooltip contentStyle={{ backgroundColor: "#0f0f0f", borderColor: "#333", borderRadius: "12px" }} />
                  <Bar dataKey="score" fill="#f59e0b" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex justify-center items-center h-full text-xs text-text-secondary font-mono">
                No type scores recorded yet.
              </div>
            )}
          </div>
        </Card>
      </div>

      {/* Chart Grid 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Performance Distribution */}
        <Card>
          <div className="mb-6">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <PieChartIcon size={18} className="text-blue-400" /> User Performance Distribution
            </h3>
            <p className="text-xs text-text-secondary">Percentage of candidates in Excellent, Good, and Average tiers</p>
          </div>
          <div className="h-72 w-full flex items-center justify-center">
            {perfDistributionData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={perfDistributionData}
                    cx="50%"
                    cy="50%"
                    outerRadius={90}
                    dataKey="value"
                    label={({ name, percent }) => `${(percent * 100).toFixed(0)}%`}
                  >
                    {perfDistributionData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ backgroundColor: "#0f0f0f", borderColor: "#333", borderRadius: "12px" }} />
                  <Legend wrapperStyle={{ fontSize: "12px" }} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="text-xs text-text-secondary font-mono">No candidate evaluations available.</div>
            )}
          </div>
        </Card>

        {/* Completed vs Terminated vs Abandoned */}
        <Card>
          <div className="mb-6">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <ShieldAlert size={18} className="text-error" /> Session Outcomes & Proctoring
            </h3>
            <p className="text-xs text-text-secondary">Comparison of completed sessions vs terminated/flagged sessions</p>
          </div>
          <div className="h-72 w-full">
            {statusData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={statusData}>
                  <XAxis dataKey="name" stroke="#666" fontSize={12} tickLine={false} />
                  <YAxis stroke="#666" fontSize={12} tickLine={false} />
                  <Tooltip contentStyle={{ backgroundColor: "#0f0f0f", borderColor: "#333", borderRadius: "12px" }} />
                  <Bar dataKey="count" fill="#ef4444" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex justify-center items-center h-full text-xs text-text-secondary font-mono">
                No outcome statistics recorded.
              </div>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
};
export default AdminAnalyticsPage;
