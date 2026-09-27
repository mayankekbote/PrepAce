import React, { useEffect, useState } from "react";
import { getInterviews, getInterviewReport, terminateInterview } from "../../services/adminApi";
import { Card, Button } from "../../components/UI";
import {
  Video,
  Search,
  Filter,
  ShieldAlert,
  CheckCircle2,
  XCircle,
  Clock,
  ChevronLeft,
  ChevronRight,
  FileText,
  AlertTriangle,
  X,
  Award,
  HelpCircle,
  User,
  Zap
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export const AdminInterviewsPage = () => {
  const [interviews, setInterviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Filters & Search
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [typeFilter, setTypeFilter] = useState("ALL");
  const [sortBy, setSortBy] = useState("createdAt");
  const [sortDir, setSortDir] = useState("desc");

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 8;

  // Selected Report Modal
  const [selectedReportId, setSelectedReportId] = useState(null);
  const [reportData, setReportData] = useState(null);
  const [reportLoading, setReportLoading] = useState(false);

  // Terminate Modal
  const [terminateTargetSession, setTerminateTargetSession] = useState(null);
  const [terminateReason, setTerminateReason] = useState("");
  const [terminateLoading, setTerminateLoading] = useState(false);

  const fetchInterviewsList = async () => {
    setLoading(true);
    try {
      const res = await getInterviews({ search, status: statusFilter, interviewType: typeFilter, sortBy, sortDir });
      if (res.success) {
        setInterviews(res.data);
      }
    } catch (err) {
      setError(err.response?.data?.message || "Failed to fetch interviews list");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInterviewsList();
  }, [search, statusFilter, typeFilter, sortBy, sortDir]);

  const handleOpenReport = async (sessionId) => {
    setSelectedReportId(sessionId);
    setReportLoading(true);
    try {
      const res = await getInterviewReport(sessionId);
      if (res.success) {
        setReportData(res.data);
      }
    } catch (err) {
      console.error("Failed to load interview report:", err);
    } finally {
      setReportLoading(false);
    }
  };

  const handleConfirmTerminate = async () => {
    if (!terminateTargetSession) return;
    setTerminateLoading(true);
    try {
      const res = await terminateInterview(terminateTargetSession.id, terminateReason);
      if (res.success) {
        setTerminateTargetSession(null);
        setTerminateReason("");
        fetchInterviewsList();
      }
    } catch (err) {
      alert(err.response?.data?.message || "Failed to terminate interview");
    } finally {
      setTerminateLoading(false);
    }
  };

  const totalPages = Math.ceil(interviews.length / pageSize) || 1;
  const paginatedInterviews = interviews.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight flex items-center gap-3">
            <Video className="text-amber-400" size={32} /> Interview Sessions & Monitoring
          </h1>
          <p className="text-text-secondary text-sm">
            Inspect all completed, ongoing, and terminated interview simulations across candidates.
          </p>
        </div>
        <div className="px-4 py-2 bg-amber-500/10 border border-amber-500/20 rounded-xl text-amber-400 font-mono text-xs font-bold">
          Total Sessions: {interviews.length}
        </div>
      </div>

      {/* Filter Bar */}
      <Card className="p-4 bg-white/[0.02]">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-center">
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-secondary" size={16} />
            <input
              type="text"
              placeholder="Search candidate or role..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }}
              className="w-full pl-10 pr-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-sm text-white focus:outline-none focus:border-amber-400"
            />
          </div>

          <div className="flex items-center gap-2">
            <label className="text-xs font-semibold text-text-secondary uppercase">Status:</label>
            <select
              value={statusFilter}
              onChange={(e) => { setStatusFilter(e.target.value); setCurrentPage(1); }}
              className="w-full bg-white/5 border border-white/10 text-white text-sm rounded-xl px-3 py-2.5 focus:outline-none focus:border-amber-400"
            >
              <option value="ALL" className="bg-[#0f0f0f]">All Statuses</option>
              <option value="COMPLETED" className="bg-[#0f0f0f]">COMPLETED</option>
              <option value="IN_PROGRESS" className="bg-[#0f0f0f]">IN PROGRESS</option>
              <option value="TERMINATED" className="bg-[#0f0f0f]">TERMINATED</option>
              <option value="ABANDONED" className="bg-[#0f0f0f]">ABANDONED</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <label className="text-xs font-semibold text-text-secondary uppercase">Type:</label>
            <select
              value={typeFilter}
              onChange={(e) => { setTypeFilter(e.target.value); setCurrentPage(1); }}
              className="w-full bg-white/5 border border-white/10 text-white text-sm rounded-xl px-3 py-2.5 focus:outline-none focus:border-amber-400"
            >
              <option value="ALL" className="bg-[#0f0f0f]">All Types</option>
              <option value="TECHNICAL" className="bg-[#0f0f0f]">TECHNICAL</option>
              <option value="BEHAVIORAL" className="bg-[#0f0f0f]">BEHAVIORAL</option>
              <option value="SYSTEM_DESIGN" className="bg-[#0f0f0f]">SYSTEM DESIGN</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <label className="text-xs font-semibold text-text-secondary uppercase">Sort:</label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="w-full bg-white/5 border border-white/10 text-white text-sm rounded-xl px-3 py-2.5 focus:outline-none focus:border-amber-400"
            >
              <option value="createdAt" className="bg-[#0f0f0f]">Date Created</option>
              <option value="score" className="bg-[#0f0f0f]">Overall Score</option>
              <option value="duration" className="bg-[#0f0f0f]">Duration</option>
            </select>
          </div>
        </div>
      </Card>

      {/* Table */}
      <Card>
        {loading ? (
          <div className="py-20 text-center text-amber-400 font-mono text-sm">
            Loading interview sessions...
          </div>
        ) : paginatedInterviews.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-white/10 text-xs font-semibold text-text-secondary uppercase tracking-wider">
                  <th className="py-3 px-4">Candidate</th>
                  <th className="py-3 px-4">Target Role & Type</th>
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4">Score</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Proctoring</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-sm">
                {paginatedInterviews.map((item) => (
                  <tr key={item.id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="py-4 px-4">
                      <span className="font-bold text-white block">{item.userName}</span>
                      <span className="text-xs text-text-secondary">{item.userEmail}</span>
                    </td>
                    <td className="py-4 px-4">
                      <span className="text-white font-medium block">{item.targetRole}</span>
                      <span className="text-xs text-amber-400 font-mono">{item.interviewType}</span>
                    </td>
                    <td className="py-4 px-4 text-xs font-mono text-text-secondary">
                      {item.createdAt ? new Date(item.createdAt).toLocaleString() : "N/A"}
                    </td>
                    <td className="py-4 px-4 font-mono font-bold text-accent">
                      {item.overallScore ? `${item.overallScore}%` : "—"}
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
                      {item.terminationReason && (
                        <p className="text-[10px] text-error font-mono mt-1 max-w-[150px] truncate" title={item.terminationReason}>
                          {item.terminationReason}
                        </p>
                      )}
                    </td>
                    <td className="py-4 px-4 font-mono text-xs">
                      {item.proctoringViolationsCount > 0 ? (
                        <span className="px-2 py-0.5 bg-error/20 text-error border border-error/30 rounded font-bold inline-flex items-center gap-1">
                          <AlertTriangle size={12} /> {item.proctoringViolationsCount} Flagged
                        </span>
                      ) : (
                        <span className="text-text-secondary opacity-60">Clean</span>
                      )}
                    </td>
                    <td className="py-4 px-4 text-right space-x-2 whitespace-nowrap">
                      <Button
                        variant="outline"
                        onClick={() => handleOpenReport(item.id)}
                        className="py-1 px-3 text-xs border-amber-500/30 text-amber-300 hover:bg-amber-500/10"
                      >
                        Full Report
                      </Button>

                      {item.status === "IN_PROGRESS" && (
                        <Button
                          onClick={() => setTerminateTargetSession(item)}
                          className="py-1 px-2.5 text-xs bg-error/20 text-error border border-error/30 hover:bg-error/30"
                        >
                          Terminate
                        </Button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="py-16 text-center text-text-secondary font-mono text-sm">
            No interview sessions found matching filters.
          </div>
        )}

        {totalPages > 1 && (
          <div className="flex items-center justify-between mt-6 pt-4 border-t border-white/10 text-xs font-mono">
            <span className="text-text-secondary">
              Page {currentPage} of {totalPages} ({interviews.length} sessions)
            </span>
            <div className="flex gap-2">
              <Button
                variant="outline"
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                className="py-1 px-3 text-xs"
              >
                <ChevronLeft size={14} /> Previous
              </Button>
              <Button
                variant="outline"
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
                className="py-1 px-3 text-xs"
              >
                Next <ChevronRight size={14} />
              </Button>
            </div>
          </div>
        )}
      </Card>

      {/* Interview Detailed Report Modal */}
      <AnimatePresence>
        {selectedReportId && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-[#0f0f0f] border border-amber-500/30 rounded-3xl p-6 md:p-8 max-w-4xl w-full max-h-[90vh] overflow-y-auto custom-scrollbar shadow-2xl relative space-y-6"
            >
              <button
                onClick={() => setSelectedReportId(null)}
                className="absolute top-6 right-6 p-2 rounded-full bg-white/5 text-text-secondary hover:text-white hover:bg-white/10"
              >
                <X size={20} />
              </button>

              {reportLoading || !reportData ? (
                <div className="py-20 text-center font-mono text-amber-400 text-sm">
                  Loading comprehensive interview audit report...
                </div>
              ) : (
                <div className="space-y-6">
                  {/* Session Header */}
                  <div className="pb-6 border-b border-white/10">
                    <div className="flex flex-wrap items-center justify-between gap-4 mb-2">
                      <div>
                        <span className="px-3 py-1 bg-amber-500/20 text-amber-400 text-xs font-mono font-bold uppercase rounded-full border border-amber-500/30">
                          Interview Audit Report
                        </span>
                        <h2 className="text-2xl font-bold text-white mt-2">
                          {reportData.targetRole} ({reportData.interviewType})
                        </h2>
                        <p className="text-xs text-text-secondary mt-1">
                          Candidate: <strong className="text-white">{reportData.userName}</strong> ({reportData.userEmail})
                        </p>
                      </div>

                      <div className="text-right">
                        <span className={`px-3 py-1 text-xs font-mono font-bold uppercase rounded-lg border ${
                          reportData.status === "COMPLETED" ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/30" : "bg-error/20 text-error border-error/30"
                        }`}>
                          {reportData.status}
                        </span>
                        <p className="text-xs font-mono text-text-secondary mt-2">
                          {reportData.startedAt ? new Date(reportData.startedAt).toLocaleString() : ""}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Score Summary Grid */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5 text-center">
                      <p className="text-xs text-text-secondary font-semibold uppercase">Overall Score</p>
                      <p className="text-3xl font-extrabold text-accent mt-1">
                        {reportData.result?.overallScore != null ? `${reportData.result.overallScore}%` : "N/A"}
                      </p>
                    </div>

                    <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5 text-center">
                      <p className="text-xs text-text-secondary font-semibold uppercase">Technical Score</p>
                      <p className="text-2xl font-bold text-white mt-1">
                        {reportData.result?.correctnessScore != null ? `${reportData.result.correctnessScore}%` : "N/A"}
                      </p>
                    </div>

                    <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5 text-center">
                      <p className="text-xs text-text-secondary font-semibold uppercase">Communication Score</p>
                      <p className="text-2xl font-bold text-white mt-1">
                        {reportData.result?.clarityScore != null ? `${reportData.result.clarityScore}%` : "N/A"}
                      </p>
                    </div>

                    <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5 text-center">
                      <p className="text-xs text-text-secondary font-semibold uppercase">Problem-Solving</p>
                      <p className="text-2xl font-bold text-white mt-1">
                        {reportData.result?.depthScore != null ? `${reportData.result.depthScore}%` : "N/A"}
                      </p>
                    </div>
                  </div>

                  {/* Proctoring & Violation Audit Log */}
                  <div className="p-4 rounded-2xl bg-error/5 border border-error/20 space-y-3">
                    <div className="flex items-center justify-between">
                      <h4 className="text-sm font-bold text-error flex items-center gap-2">
                        <AlertTriangle size={16} /> Proctoring & Integrity Telemetry
                      </h4>
                      <span className="text-xs font-mono text-text-secondary">
                        Total Flagged Violations: <strong className="text-white font-mono">{reportData.proctoringViolationsCount || 0}</strong>
                      </span>
                    </div>

                    {reportData.terminationReason && (
                      <div className="p-3 rounded-xl bg-error/10 border border-error/30 text-error text-xs font-mono">
                        <strong>Termination Reason:</strong> {reportData.terminationReason}
                      </div>
                    )}

                    {reportData.proctoringEventsLog && reportData.proctoringEventsLog.length > 0 ? (
                      <div className="rounded-xl border border-white/10 bg-black/40 overflow-hidden mt-3">
                        <table className="w-full text-left font-mono text-xs">
                          <thead className="bg-white/[0.05] text-text-secondary border-b border-white/10">
                            <tr>
                              <th className="py-2.5 px-3">Timestamp</th>
                              <th className="py-2.5 px-3">Violation Event</th>
                              <th className="py-2.5 px-3">Severity</th>
                              <th className="py-2.5 px-3">Details / Evidence</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-white/5">
                            {reportData.proctoringEventsLog.map((ev, idx) => {
                              let snapshot = null;
                              let detailsText = "";
                              try {
                                if (ev.metadata && typeof ev.metadata === "string" && ev.metadata.startsWith("{")) {
                                  const meta = JSON.parse(ev.metadata);
                                  snapshot = meta.snapshot;
                                  detailsText = meta.description || "";
                                } else {
                                  detailsText = ev.metadata || "";
                                }
                              } catch (e) {
                                detailsText = ev.metadata || "";
                              }

                              return (
                                <tr key={idx} className="hover:bg-white/[0.02]">
                                  <td className="py-2.5 px-3 text-text-secondary whitespace-nowrap">
                                    {ev.timestamp ? new Date(ev.timestamp).toLocaleTimeString() : `#${idx + 1}`}
                                  </td>
                                  <td className="py-2.5 px-3 font-bold text-white">{ev.type}</td>
                                  <td className="py-2.5 px-3">
                                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                      ev.severity === "CRITICAL"
                                        ? "bg-error/20 text-error border border-error/30"
                                        : "bg-amber-500/20 text-amber-400 border border-amber-500/30"
                                    }`}>
                                      {ev.severity || "WARNING"}
                                    </span>
                                  </td>
                                  <td className="py-2.5 px-3 text-text-secondary">
                                    {detailsText && <span className="block text-[11px] mb-1">{detailsText}</span>}
                                    {snapshot && (
                                      <img
                                        src={snapshot}
                                        alt="Evidence Snapshot"
                                        className="w-20 h-14 object-cover rounded border border-white/20 mt-1"
                                      />
                                    )}
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    ) : (
                      <p className="text-xs text-text-secondary font-mono italic">No individual proctoring events recorded for this session.</p>
                    )}
                  </div>

                  {/* Questions & Candidate Answers Evaluation */}
                  <div>
                    <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                      <HelpCircle size={18} className="text-amber-400" /> Questions & Evaluations Breakdown
                    </h3>
                    {reportData.questions?.length > 0 ? (
                      <div className="space-y-4">
                        {reportData.questions.map((q, idx) => (
                          <div key={q.id || idx} className="p-5 rounded-2xl bg-white/[0.02] border border-white/5 space-y-3">
                            <div className="flex items-center justify-between text-xs">
                              <span className="font-mono text-amber-400 font-bold">Question {q.sequence || idx + 1}</span>
                              <span className="text-text-secondary font-mono">{q.topic}</span>
                            </div>

                            <p className="text-sm font-bold text-white">{q.questionText}</p>

                            {q.candidateAnswer ? (
                              <div className="bg-white/5 p-3.5 rounded-xl border border-white/10 space-y-1">
                                <p className="text-[11px] text-text-secondary uppercase font-semibold">Candidate Answer:</p>
                                <p className="text-xs text-text-primary whitespace-pre-wrap">{q.candidateAnswer.answerText}</p>
                              </div>
                            ) : (
                              <p className="text-xs text-text-secondary italic">No answer submitted for this question.</p>
                            )}

                            {q.evaluation && (
                              <div className="bg-amber-500/10 p-3.5 rounded-xl border border-amber-500/20 text-xs space-y-1 text-amber-200">
                                <div className="flex items-center justify-between font-bold text-amber-400">
                                  <span>AI Evaluation Score: {q.evaluation.score}%</span>
                                  <span>Clarity: {q.evaluation.clarityScore}% | Depth: {q.evaluation.depthScore}%</span>
                                </div>
                                <p className="mt-1">{q.evaluation.feedback}</p>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-xs text-text-secondary font-mono italic">No questions recorded for this session.</p>
                    )}
                  </div>

                  {/* AI Feedback Summary */}
                  {reportData.result?.feedbackSummary && (
                    <div className="p-5 rounded-2xl bg-accent/5 border border-accent/20 space-y-2">
                      <h4 className="text-sm font-bold text-accent flex items-center gap-2">
                        <Zap size={16} /> Final Executive AI Summary
                      </h4>
                      <p className="text-xs text-text-primary leading-relaxed">{reportData.result.feedbackSummary}</p>
                    </div>
                  )}
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Force Terminate Modal */}
      <AnimatePresence>
        {terminateTargetSession && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-[#0f0f0f] border border-error/40 rounded-2xl p-6 max-w-md w-full space-y-4 text-center"
            >
              <AlertTriangle className="text-error mx-auto" size={40} />
              <h3 className="text-xl font-bold text-white">Force Terminate Interview?</h3>
              <p className="text-xs text-text-secondary">
                You are about to terminate the active interview for <strong className="text-white">{terminateTargetSession.userName}</strong>.
              </p>

              <div className="text-left space-y-1">
                <label className="text-xs font-semibold text-text-secondary uppercase">Termination Reason:</label>
                <input
                  type="text"
                  placeholder="e.g. Excessive proctoring violation / Admin Override"
                  value={terminateReason}
                  onChange={(e) => setTerminateReason(e.target.value)}
                  className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-xl text-xs text-white focus:outline-none focus:border-error"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <Button variant="outline" onClick={() => setTerminateTargetSession(null)} className="flex-1">
                  Cancel
                </Button>
                <Button isLoading={terminateLoading} onClick={handleConfirmTerminate} className="flex-1 bg-error text-white font-bold">
                  Confirm Termination
                </Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
export default AdminInterviewsPage;
