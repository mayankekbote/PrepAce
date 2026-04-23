import React from "react";

export const PasswordStrengthBar = ({ password }) => {
  const calculateStrength = (pwd) => {
    let strength = 0;
    if (pwd.length >= 8) strength++;
    if (/[A-Z]/.test(pwd)) strength++;
    if (/[0-9]/.test(pwd)) strength++;
    if (/[^A-Za-z0-9]/.test(pwd)) strength++;
    return strength;
  };

  const strength = calculateStrength(password);
  const colors = ["bg-error", "bg-orange-500", "bg-yellow-500", "bg-accent"];
  
  return (
    <div className="flex gap-1 h-1.5 w-full mt-2 transition-all">
      {[1, 2, 3, 4].map((i) => (
        <div
          key={i}
          className={`flex-1 rounded-full transition-all duration-300 ${
            i <= strength ? colors[strength - 1] : "bg-border"
          }`}
        ></div>
      ))}
    </div>
  );
};
