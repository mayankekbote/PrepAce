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
  MessageSquareQuote
} from "lucide-react";
import { useAuth } from "../context/AuthContext";

export const Sidebar = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const { logout, user } = useAuth();

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
      <div className={`p-6 mb-8 flex items-center gap-4 transition-all duration-500 ${isCollapsed ? "justify-center" : ""}`}>
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-accent/20 to-accent/5 border border-accent/20 flex items-center justify-center shrink-0">
          <span className="text-accent font-bold text-lg">{user?.fullName?.charAt(0) || "U"}</span>
        </div>
        {!isCollapsed && (
          <div className="overflow-hidden">
            <p className="text-sm font-bold text-white truncate">{user?.fullName || "User"}</p>
            <p className="text-[10px] text-accent/60 font-mono uppercase tracking-widest truncate">Candidate</p>
          </div>
        )}
      </div>

      {/* Menu Items */}
      <nav className="flex-grow px-3 space-y-2">
        {menuItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) => `
              flex items-center gap-4 px-4 py-3.5 rounded-xl transition-all duration-300 group
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
      </nav>

      {/* Footer / Logout */}
      <div className="p-3 mt-auto mb-6">
        <button
          onClick={logout}
          className={`
            w-full flex items-center gap-4 px-4 py-3.5 rounded-xl text-error hover:bg-error/10 transition-all duration-300 group
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
