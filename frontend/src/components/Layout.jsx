import React from "react";
import { Sidebar } from "./Sidebar";
import { useAuth } from "../context/AuthContext";

export const Layout = ({ children }) => {
  const { user } = useAuth();

  // Pages that don't show the sidebar (Auth pages)
  const noSidebarPaths = ["/login", "/register", "/forgot-password", "/reset-password", "/verify-email"];
  const showSidebar = user && !noSidebarPaths.includes(window.location.pathname);

  return (
    <div className="relative min-h-screen bg-primary text-white overflow-hidden flex">
      {/* Design Layers */}
      <div className="ambient-glow"></div>
      <div className="tech-grid"></div>
      <div className="scanline-overlay"></div>
      
      {showSidebar && <Sidebar />}

      <div className="relative z-10 flex flex-col flex-grow min-h-screen overflow-y-auto">
        {!showSidebar && (
          <header className="py-10 text-center">
            <h1 className="text-4xl font-bold tracking-tighter text-glow flex items-center justify-center gap-2">
              <span className="text-accent">Prep</span>
              <span className="text-white">Ace</span>
            </h1>
            <div className="h-[1px] w-24 bg-gradient-to-r from-transparent via-accent/30 to-transparent mx-auto mt-4"></div>
          </header>
        )}

        <main className={`flex-grow container mx-auto px-4 ${showSidebar ? "py-10" : "pb-20 flex flex-col justify-center"}`}>
          {children}
        </main>

        <footer className="py-8 text-center text-xs text-text-secondary opacity-40 hover:opacity-100 transition-opacity duration-500">
          <p className="font-mono uppercase tracking-widest">© 2026 PREPACE // SYSTEM VERSION 4.0.1</p>
        </footer>
      </div>
    </div>
  );
};
