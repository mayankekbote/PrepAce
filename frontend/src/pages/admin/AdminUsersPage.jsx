import React, { useEffect, useState } from "react";
import { getUsers, getUserDetails, updateUserRole, deleteUser } from "../../services/adminApi";
import { Card, Button, Input } from "../../components/UI";
import {
  Users,
  Search,
  Filter,
  Shield,
  Trash2,
  ChevronLeft,
  ChevronRight,
  UserCheck,
  Calendar,
  Award,
  Video,
  X,
  ShieldAlert,
  Mail,
  Phone,
  Briefcase,
  ExternalLink
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export const AdminUsersPage = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Search & Filter State
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("ALL");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [sortBy, setSortBy] = useState("createdAt");
  const [sortDir, setSortDir] = useState("desc");

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 8;

  // Selected User Detail Modal
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [userDetail, setUserDetail] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);

  // Role Action & Delete Modal State
  const [roleTargetUser, setRoleTargetUser] = useState(null);
  const [deleteTargetUser, setDeleteTargetUser] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  const fetchUsersList = async () => {
    setLoading(true);
    try {
      const res = await getUsers({ search, role: roleFilter, status: statusFilter, sortBy, sortDir });
      if (res.success) {
        setUsers(res.data);
      }
    } catch (err) {
      setError(err.response?.data?.message || "Failed to fetch users list");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsersList();
  }, [search, roleFilter, statusFilter, sortBy, sortDir]);

  const handleOpenUserDetail = async (userId) => {
    setSelectedUserId(userId);
    setDetailLoading(true);
    try {
      const res = await getUserDetails(userId);
      if (res.success) {
        setUserDetail(res.data);
      }
    } catch (err) {
      console.error("Failed to load user detail:", err);
    } finally {
      setDetailLoading(false);
    }
  };

  const handleConfirmRoleChange = async () => {
    if (!roleTargetUser) return;
    setActionLoading(true);
    try {
      const newRole = roleTargetUser.role === "ADMIN" ? "USER" : "ADMIN";
      const res = await updateUserRole(roleTargetUser.id, newRole);
      if (res.success) {
        setRoleTargetUser(null);
        fetchUsersList();
      }
    } catch (err) {
      alert(err.response?.data?.message || "Failed to update user role");
    } finally {
      setActionLoading(false);
    }
  };

  const handleConfirmDeleteUser = async () => {
    if (!deleteTargetUser) return;
    setActionLoading(true);
    try {
      const res = await deleteUser(deleteTargetUser.id);
      if (res.success) {
        setDeleteTargetUser(null);
        if (selectedUserId === deleteTargetUser.id) setSelectedUserId(null);
        fetchUsersList();
      }
    } catch (err) {
      alert(err.response?.data?.message || "Failed to delete user");
    } finally {
      setActionLoading(false);
    }
  };

  // Pagination calculation
  const totalPages = Math.ceil(users.length / pageSize) || 1;
  const paginatedUsers = users.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight flex items-center gap-3">
            <Users className="text-amber-400" size={32} /> Candidate & User Directory
          </h1>
          <p className="text-text-secondary text-sm">
            Monitor registered users, grant administrative roles, and inspect complete candidate histories.
          </p>
        </div>
        <div className="px-4 py-2 bg-amber-500/10 border border-amber-500/20 rounded-xl text-amber-400 font-mono text-xs font-bold">
          Total Records: {users.length}
        </div>
      </div>

      {/* Search & Filtering Bar */}
      <Card className="p-4 bg-white/[0.02]">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-center">
          {/* Search */}
          <div className="relative md:col-span-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-secondary" size={16} />
            <input
              type="text"
              placeholder="Search name or email..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }}
              className="w-full pl-10 pr-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-sm text-white focus:outline-none focus:border-amber-400"
            />
          </div>

          {/* Role Filter */}
          <div className="flex items-center gap-2">
            <label className="text-xs font-semibold text-text-secondary uppercase">Role:</label>
            <select
              value={roleFilter}
              onChange={(e) => { setRoleFilter(e.target.value); setCurrentPage(1); }}
              className="w-full bg-white/5 border border-white/10 text-white text-sm rounded-xl px-3 py-2.5 focus:outline-none focus:border-amber-400"
            >
              <option value="ALL" className="bg-[#0f0f0f]">All Roles</option>
              <option value="USER" className="bg-[#0f0f0f]">USER</option>
              <option value="ADMIN" className="bg-[#0f0f0f]">ADMIN</option>
            </select>
          </div>

          {/* Status Filter */}
          <div className="flex items-center gap-2">
            <label className="text-xs font-semibold text-text-secondary uppercase">Status:</label>
            <select
              value={statusFilter}
              onChange={(e) => { setStatusFilter(e.target.value); setCurrentPage(1); }}
              className="w-full bg-white/5 border border-white/10 text-white text-sm rounded-xl px-3 py-2.5 focus:outline-none focus:border-amber-400"
            >
              <option value="ALL" className="bg-[#0f0f0f]">All Statuses</option>
              <option value="ACTIVE" className="bg-[#0f0f0f]">ACTIVE</option>
              <option value="INACTIVE" className="bg-[#0f0f0f]">INACTIVE</option>
              <option value="NO_INTERVIEWS" className="bg-[#0f0f0f]">NO INTERVIEWS</option>
            </select>
          </div>

          {/* Sort By */}
          <div className="flex items-center gap-2">
            <label className="text-xs font-semibold text-text-secondary uppercase">Sort:</label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="w-full bg-white/5 border border-white/10 text-white text-sm rounded-xl px-3 py-2.5 focus:outline-none focus:border-amber-400"
            >
              <option value="createdAt" className="bg-[#0f0f0f]">Joined Date</option>
              <option value="score" className="bg-[#0f0f0f]">Average Score</option>
              <option value="interviews" className="bg-[#0f0f0f]">Interview Count</option>
              <option value="name" className="bg-[#0f0f0f]">Full Name</option>
            </select>
          </div>
        </div>
      </Card>

      {/* Users Data Table */}
      <Card>
        {loading ? (
          <div className="py-20 text-center text-amber-400 font-mono text-sm">
            Loading directory users...
          </div>
        ) : paginatedUsers.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-white/10 text-xs font-semibold text-text-secondary uppercase tracking-wider">
                  <th className="py-3 px-4">User</th>
                  <th className="py-3 px-4">Role</th>
                  <th className="py-3 px-4">Interviews</th>
                  <th className="py-3 px-4">Avg Score</th>
                  <th className="py-3 px-4">Best Score</th>
                  <th className="py-3 px-4">Last Activity</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-sm">
                {paginatedUsers.map((u) => (
                  <tr key={u.id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-3">
                        <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-sm border ${
                          u.role === "ADMIN" ? "bg-amber-500/20 text-amber-400 border-amber-500/30" : "bg-white/5 text-accent border-white/10"
                        }`}>
                          {u.fullName?.charAt(0) || "U"}
                        </div>
                        <div>
                          <button
                            onClick={() => handleOpenUserDetail(u.id)}
                            className="font-bold text-white hover:text-amber-400 transition-colors text-left"
                          >
                            {u.fullName}
                          </button>
                          <p className="text-xs text-text-secondary">{u.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <span className={`px-2.5 py-1 text-[10px] font-mono font-bold uppercase rounded-md border ${
                        u.role === "ADMIN" ? "bg-amber-500/20 text-amber-400 border-amber-500/30" : "bg-white/10 text-text-secondary border-white/10"
                      }`}>
                        {u.role}
                      </span>
                    </td>
                    <td className="py-4 px-4 font-mono font-bold text-white">
                      {u.interviewsCount}
                    </td>
                    <td className="py-4 px-4 font-mono font-bold text-accent">
                      {u.avgScore ? `${u.avgScore}%` : "—"}
                    </td>
                    <td className="py-4 px-4 font-mono text-emerald-400">
                      {u.bestScore ? `${u.bestScore}%` : "—"}
                    </td>
                    <td className="py-4 px-4 text-xs font-mono text-text-secondary">
                      {u.lastInterviewDate ? new Date(u.lastInterviewDate).toLocaleDateString() : "Never"}
                    </td>
                    <td className="py-4 px-4">
                      <span className={`px-2 py-0.5 text-[10px] font-mono font-bold uppercase rounded ${
                        u.status === "ACTIVE"
                          ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                          : u.status === "NO_INTERVIEWS"
                          ? "bg-white/5 text-text-secondary border border-white/10"
                          : "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                      }`}>
                        {u.status}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-right space-x-2 whitespace-nowrap">
                      <Button
                        variant="outline"
                        onClick={() => handleOpenUserDetail(u.id)}
                        className="py-1 px-2.5 text-xs border-white/10"
                      >
                        Profile
                      </Button>

                      <button
                        onClick={() => setRoleTargetUser(u)}
                        title={u.role === "ADMIN" ? "Demote to USER" : "Promote to ADMIN"}
                        className="p-1.5 rounded-lg border border-amber-500/20 bg-amber-500/10 text-amber-400 hover:bg-amber-500/20 transition-all inline-flex items-center"
                      >
                        <Shield size={14} />
                      </button>

                      <button
                        onClick={() => setDeleteTargetUser(u)}
                        title="Delete User"
                        className="p-1.5 rounded-lg border border-error/20 bg-error/10 text-error hover:bg-error/20 transition-all inline-flex items-center"
                      >
                        <Trash2 size={14} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="py-16 text-center text-text-secondary font-mono text-sm">
            No users matched the criteria.
          </div>
        )}

        {/* Pagination Footer */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between mt-6 pt-4 border-t border-white/10 text-xs font-mono">
            <span className="text-text-secondary">
              Page {currentPage} of {totalPages} ({users.length} candidates)
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

      {/* User Performance Detail Modal */}
      <AnimatePresence>
        {selectedUserId && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-[#0f0f0f] border border-amber-500/30 rounded-3xl p-6 md:p-8 max-w-4xl w-full max-h-[90vh] overflow-y-auto custom-scrollbar shadow-2xl relative"
            >
              <button
                onClick={() => setSelectedUserId(null)}
                className="absolute top-6 right-6 p-2 rounded-full bg-white/5 text-text-secondary hover:text-white hover:bg-white/10"
              >
                <X size={20} />
              </button>

              {detailLoading || !userDetail ? (
                <div className="py-20 text-center font-mono text-amber-400 text-sm">
                  Fetching complete user profile & telemetry...
                </div>
              ) : (
                <div className="space-y-6">
                  {/* Candidate Header */}
                  <div className="flex items-center gap-4 pb-6 border-b border-white/10">
                    <div className="w-16 h-16 rounded-2xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400 font-extrabold text-2xl">
                      {userDetail.summary?.fullName?.charAt(0)}
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                        {userDetail.summary?.fullName}
                        <span className="px-3 py-0.5 bg-amber-500/20 text-amber-400 text-xs font-mono font-bold uppercase rounded-full border border-amber-500/30">
                          {userDetail.summary?.role}
                        </span>
                      </h2>
                      <div className="flex flex-wrap items-center gap-4 text-xs text-text-secondary mt-1">
                        <span className="flex items-center gap-1"><Mail size={13} /> {userDetail.summary?.email}</span>
                        {userDetail.summary?.phoneNumber && <span className="flex items-center gap-1"><Phone size={13} /> {userDetail.summary?.phoneNumber}</span>}
                        <span className="flex items-center gap-1"><Briefcase size={13} /> {userDetail.summary?.targetRole || "N/A"} ({userDetail.summary?.experienceLevel || "Fresher"})</span>
                      </div>
                    </div>
                  </div>

                  {/* Summary Stats Grid */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5 text-center">
                      <p className="text-xs text-text-secondary font-semibold uppercase">Total Interviews</p>
                      <p className="text-2xl font-bold text-white mt-1">{userDetail.summary?.interviewsCount}</p>
                    </div>
                    <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5 text-center">
                      <p className="text-xs text-text-secondary font-semibold uppercase">Avg Overall Score</p>
                      <p className="text-2xl font-bold text-accent mt-1">{userDetail.summary?.avgScore}%</p>
                    </div>
                    <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5 text-center">
                      <p className="text-xs text-text-secondary font-semibold uppercase">Best Score</p>
                      <p className="text-2xl font-bold text-emerald-400 mt-1">{userDetail.summary?.bestScore}%</p>
                    </div>
                    <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5 text-center">
                      <p className="text-xs text-text-secondary font-semibold uppercase">Joined Date</p>
                      <p className="text-sm font-mono text-white mt-2">
                        {userDetail.summary?.createdAt ? new Date(userDetail.summary?.createdAt).toLocaleDateString() : "N/A"}
                      </p>
                    </div>
                  </div>

                  {/* Complete Interview History */}
                  <div>
                    <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                      <Video size={18} className="text-amber-400" /> Complete Candidate Interview History
                    </h3>
                    {userDetail.interviewHistory?.length > 0 ? (
                      <div className="space-y-3">
                        {userDetail.interviewHistory.map((item) => (
                          <div
                            key={item.id}
                            className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 flex flex-col md:flex-row md:items-center justify-between gap-4"
                          >
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="font-bold text-white">{item.targetRole}</span>
                                <span className="text-xs text-amber-400 font-mono">({item.interviewType})</span>
                                <span className={`px-2 py-0.5 text-[9px] font-mono font-bold uppercase rounded ${
                                  item.status === "COMPLETED" ? "bg-emerald-500/20 text-emerald-400" : "bg-error/20 text-error"
                                }`}>
                                  {item.status}
                                </span>
                              </div>
                              <p className="text-xs text-text-secondary mt-1">
                                Date: {item.createdAt ? new Date(item.createdAt).toLocaleString() : "N/A"} | Duration: {item.durationMinutes || 0} min | Proctor Violations: {item.proctoringViolationsCount}
                              </p>
                              {item.terminationReason && (
                                <p className="text-xs text-error font-mono mt-1">Reason: {item.terminationReason}</p>
                              )}
                            </div>

                            <div className="flex items-center gap-6 shrink-0">
                              <div className="text-right">
                                <p className="text-xs text-text-secondary uppercase">Overall Score</p>
                                <p className="text-xl font-bold text-accent">{item.overallScore}%</p>
                              </div>
                              <div className="text-xs font-mono text-text-secondary border-l border-white/10 pl-4 space-y-0.5">
                                <div>Tech: <span className="text-white font-bold">{item.correctnessScore}%</span></div>
                                <div>Comm: <span className="text-white font-bold">{item.clarityScore}%</span></div>
                                <div>Problem: <span className="text-white font-bold">{item.depthScore}%</span></div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="p-8 text-center border border-dashed border-white/10 rounded-2xl text-xs text-text-secondary font-mono">
                        No interviews conducted yet by this user.
                      </div>
                    )}
                  </div>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Role Toggle Confirmation Modal */}
      <AnimatePresence>
        {roleTargetUser && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-[#0f0f0f] border border-amber-500/40 rounded-2xl p-6 max-w-md w-full text-center space-y-4"
            >
              <Shield className="text-amber-400 mx-auto" size={40} />
              <h3 className="text-xl font-bold text-white">Change User Role?</h3>
              <p className="text-xs text-text-secondary">
                You are about to change role for <strong className="text-white">{roleTargetUser.fullName}</strong> from{" "}
                <span className="text-amber-400 font-mono">{roleTargetUser.role}</span> to{" "}
                <span className="text-accent font-mono">{roleTargetUser.role === "ADMIN" ? "USER" : "ADMIN"}</span>.
              </p>
              <div className="flex gap-3 pt-2">
                <Button variant="outline" onClick={() => setRoleTargetUser(null)} className="flex-1">
                  Cancel
                </Button>
                <Button isLoading={actionLoading} onClick={handleConfirmRoleChange} className="flex-1 bg-amber-400 text-black font-bold">
                  Confirm Change
                </Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Delete User Confirmation Modal */}
      <AnimatePresence>
        {deleteTargetUser && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-[#0f0f0f] border border-error/40 rounded-2xl p-6 max-w-md w-full text-center space-y-4"
            >
              <ShieldAlert className="text-error mx-auto" size={40} />
              <h3 className="text-xl font-bold text-white">Delete User Permanently?</h3>
              <p className="text-xs text-text-secondary">
                Are you sure you want to delete <strong className="text-white">{deleteTargetUser.fullName}</strong> ({deleteTargetUser.email})? This action is irreversible.
              </p>
              <div className="flex gap-3 pt-2">
                <Button variant="outline" onClick={() => setDeleteTargetUser(null)} className="flex-1">
                  Cancel
                </Button>
                <Button isLoading={actionLoading} onClick={handleConfirmDeleteUser} className="flex-1 bg-error text-white font-bold">
                  Delete User
                </Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
export default AdminUsersPage;
