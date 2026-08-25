import React from "react";

export const Button = ({ children, className = "", variant = "primary", isLoading = false, ...props }) => {
  const baseStyles = "w-full font-bold rounded-xl px-6 py-3.5 transition-colors duration-150 active:scale-[0.98] flex items-center justify-center gap-2 relative overflow-hidden";
  
  const variants = {
    primary: "bg-accent text-primary hover:bg-accent-hover font-bold",
    secondary: "bg-white/5 border border-white/10 text-white hover:bg-white/10 hover:border-accent/40",
    google: "bg-white/5 border border-white/10 text-white hover:bg-white/10 hover:border-accent/40 flex items-center justify-center gap-3",
    outline: "bg-transparent border border-white/20 text-white hover:border-accent hover:text-accent",
  };

  return (
    <button 
      className={`${baseStyles} ${variants[variant]} ${className} ${isLoading ? "opacity-70 cursor-not-allowed" : ""}`}
      disabled={isLoading}
      {...props}
    >
      {isLoading ? <div className="spinner"></div> : children}
    </button>
  );
};

export const Input = ({ label, error, className = "", ...props }) => {
  return (
    <div className="flex flex-col gap-2 w-full">
      {label && (
        <label className="text-xs font-semibold text-text-secondary uppercase tracking-widest ml-1 opacity-70">
          {label}
        </label>
      )}
      <div className="relative group">
        <input
          className={`w-full bg-white/5 border ${error ? "border-error" : "border-white/10"} text-white rounded-xl px-4 py-3.5 focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent/30 placeholder:text-white/20 transition-colors duration-150 input-focus-glow font-dm disabled:opacity-60 disabled:cursor-not-allowed disabled:bg-white/[0.02] read-only:opacity-70 read-only:cursor-not-allowed ${className}`}
          {...props}
        />
      </div>
      {error && <span className="text-xs text-error font-medium ml-1 animate-pulse">{error}</span>}
    </div>
  );
};

export const Card = ({ children, className = "", noPadding = false }) => {
  return (
    <div className={`glass-card rounded-2xl p-8 max-w-md w-full mx-auto relative overflow-hidden ${noPadding ? "p-0" : ""} ${className}`}>
      <div className="relative z-10">
        {children}
      </div>
    </div>
  );
};

export const Spinner = ({ className = "" }) => (
  <div className={`spinner ${className}`}></div>
);
