import React, { useState } from "react";
import { NavLink } from "react-router-dom";
import {
  FileUp,
  UserCircle,
  LayoutDashboard,
  ChevronLeft,
  ChevronRight,
  LogOut,
  FileSearch,
  MessageSquareQuote,
  ShieldCheck,
  Users,
  Video,
  BarChart3
} from "lucide-react";
import { useAuth } from "../context/AuthContext";

export const Sidebar = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const { logout, user, isAdmin } = useAuth();

  const menuItems = [
    {
      name: "Dashboard",
      path: "/dashboard",
      icon: <LayoutDashboard size={20} />,
    },
    {
      name: "Resume Analysis",
      path: "/analysis",
      icon: <FileSearch size={20} />,
    },
    {
      name: "Interview Prep",
      path: "/interview",
      icon: <MessageSquareQuote size={20} />,
    },
    {
      name: "Update Resume",
      path: "/update-resume",
      icon: <FileUp size={20} />,
    },
    {
      name: "Update Details",
      path: "/update-details",
      icon: <UserCircle size={20} />,
    },
  ];

  const adminItems = [
    {
      name: "Admin Overview",
      path: "/admin",
      icon: <ShieldCheck size={20} />,
    },
    {
      name: "User Management",
      path: "/admin/users",
      icon: <Users size={20} />,
    },
    {
      name: "Interview Sessions",
      path: "/admin/interviews",
      icon: <Video size={20} />,
    },
    {
      name: "Analytics & Insights",
      path: "/admin/analytics",
      icon: <BarChart3 size={20} />,
    },
  ];

  return (
    <div
      className={`relative h-screen glass-card border-r border-white/5 transition-all duration-500 ease-in-out z-30 flex flex-col ${isCollapsed ? "w-20" : "w-64"
        }`}
    >
      {/* Toggle Button */}
      <button
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="absolute -right-3 top-24 bg-accent text-primary p-1 rounded-full shadow-[0_0_15px_rgba(217,255,0,0.4)] hover:scale-110 transition-all duration-300 z-50"
      >
        {isCollapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
      </button>

      {/* Profile Header */}
      <div className={`p-6 mb-4 flex items-center gap-4 transition-all duration-500 ${isCollapsed ? "justify-center" : ""}`}>
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border ${
          isAdmin 
            ? "bg-gradient-to-br from-amber-500/20 to-amber-500/5 border-amber-500/30" 
            : "bg-gradient-to-br from-accent/20 to-accent/5 border-accent/20"
        }`}>
          <span className={`font-bold text-lg ${isAdmin ? "text-amber-400" : "text-accent"}`}>
            {user?.fullName?.charAt(0) || "U"}
          </span>
        </div>
        {!isCollapsed && (
          <div className="overflow-hidden">
            <p className="text-sm font-bold text-white truncate">{user?.fullName || "User"}</p>
            <p className={`text-[10px] font-mono uppercase tracking-widest truncate ${isAdmin ? "text-amber-400 font-bold" : "text-accent/60"}`}>
              {user?.role || "Candidate"}
            </p>
          </div>
        )}
      </div>

      {/* Menu Items */}
      <nav className="flex-grow px-3 space-y-1 overflow-y-auto custom-scrollbar">
        {menuItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) => `
              flex items-center gap-4 px-4 py-3 rounded-xl transition-all duration-300 group
              ${isActive
                ? "bg-accent/10 text-accent border border-accent/20 shadow-[0_0_20px_rgba(217,255,0,0.05)]"
                : "text-text-secondary hover:bg-white/5 hover:text-white border border-transparent"}
            `}
          >
            <div className="shrink-0 group-hover:scale-110 transition-transform duration-300">
              {item.icon}
            </div>
            {!isCollapsed && (
              <span className="text-sm font-semibold tracking-tight whitespace-nowrap">
                {item.name}
              </span>
            )}
          </NavLink>
        ))}

        {isAdmin && (
          <div className="pt-4 mt-2 border-t border-white/10">
            {!isCollapsed && (
              <p className="px-4 text-[10px] font-bold text-amber-400/80 font-mono uppercase tracking-widest mb-2">
                Admin Console
              </p>
            )}
            {adminItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) => `
                  flex items-center gap-4 px-4 py-3 rounded-xl transition-all duration-300 group mb-1
                  ${isActive
                    ? "bg-amber-500/15 text-amber-400 border border-amber-500/30 shadow-[0_0_20px_rgba(245,158,11,0.1)]"
                    : "text-amber-200/60 hover:bg-amber-500/10 hover:text-amber-300 border border-transparent"}
                `}
              >
                <div className="shrink-0 group-hover:scale-110 transition-transform duration-300">
                  {item.icon}
                </div>
                {!isCollapsed && (
                  <span className="text-sm font-semibold tracking-tight whitespace-nowrap">
                    {item.name}
                  </span>
                )}
              </NavLink>
            ))}
          </div>
        )}
      </nav>

      {/* Footer / Logout */}
      <div className="p-3 mt-auto mb-4">
        <button
          onClick={logout}
          className={`
            w-full flex items-center gap-4 px-4 py-3 rounded-xl text-error hover:bg-error/10 transition-all duration-300 group
            ${isCollapsed ? "justify-center" : ""}
          `}
        >
          <LogOut size={20} className="group-hover:-translate-x-1 transition-transform duration-300" />
          {!isCollapsed && <span className="text-sm font-bold uppercase tracking-widest">Terminate</span>}
        </button>
      </div>
    </div>
  );
};

