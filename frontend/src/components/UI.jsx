import React from "react";

export const Button = ({ children, className = "", variant = "primary", isLoading = false, ...props }) => {
  const baseStyles = "w-full font-bold rounded-xl px-6 py-3.5 transition-all duration-300 active:scale-[0.98] flex items-center justify-center gap-2 relative overflow-hidden group";
  
  const variants = {
    primary: "bg-accent text-primary hover:shadow-[0_0_30px_rgba(217,255,0,0.4)] hover:scale-[1.02]",
    secondary: "bg-white/5 border border-white/10 text-white hover:bg-white/10 hover:border-accent/50",
    google: "bg-white/5 border border-white/10 text-white hover:bg-white/10 hover:border-accent/50 flex items-center justify-center gap-3",
    outline: "bg-transparent border border-white/20 text-white hover:border-accent hover:text-accent",
  };

  return (
    <button 
      className={`${baseStyles} ${variants[variant]} ${className} ${isLoading ? "opacity-70 cursor-not-allowed" : ""}`}
      disabled={isLoading}
      {...props}
    >
      {/* Shine effect on hover */}
      <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700 pointer-events-none"></div>
      
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
          className={`w-full bg-white/5 border ${error ? "border-error" : "border-white/10"} text-white rounded-xl px-4 py-3.5 focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent/30 placeholder:text-white/20 transition-all duration-300 input-focus-glow font-dm ${className}`}
          {...props}
        />
        {/* Subtle highlight line at bottom */}
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-0 h-[2px] bg-accent transition-all duration-300 group-focus-within:w-[90%]"></div>
      </div>
      {error && <span className="text-xs text-error font-medium ml-1 animate-pulse">{error}</span>}
    </div>
  );
};

export const Card = ({ children, className = "", noPadding = false }) => {
  return (
    <div className={`glass-card rounded-2xl p-8 max-w-md w-full mx-auto relative overflow-hidden ${noPadding ? "p-0" : ""} ${className}`}>
      {/* Subtle corner highlight */}
      <div className="absolute top-0 right-0 w-16 h-16 bg-accent/5 blur-2xl rounded-full -translate-y-1/2 translate-x-1/2"></div>
      <div className="relative z-10">
        {children}
      </div>
    </div>
  );
};

export const Spinner = ({ className = "" }) => (
  <div className={`spinner ${className}`}></div>
);
