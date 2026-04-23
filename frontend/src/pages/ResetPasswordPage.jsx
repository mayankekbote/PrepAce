import React, { useState } from "react";
import { Link, useSearchParams, useNavigate } from "react-router-dom";
import api from "../services/api";
import { Card, Input, Button } from "../components/UI";
import { PasswordStrengthBar } from "../components/PasswordStrengthBar";

const ResetPasswordPage = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }
    setLoading(true);
    setError("");
    try {
      await api.post("/auth/reset-password", { token, newPassword: password });
      setSuccess(true);
      setTimeout(() => navigate("/login"), 3000);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to reset password");
    }
    setLoading(false);
  };

  if (!token) {
    return (
      <div className="flex justify-center items-center py-12">
        <Card className="text-center">
          <h2 className="text-2xl font-bold text-white mb-2">Invalid Link</h2>
          <p className="text-text-secondary text-sm mb-6">This password reset link is invalid or has expired.</p>
          <Link to="/forgot-password" size="sm">
            <Button>Request New Link</Button>
          </Link>
        </Card>
      </div>
    );
  }

  if (success) {
    return (
      <div className="flex justify-center items-center py-12">
        <Card className="text-center">
          <h2 className="text-2xl font-bold text-success mb-2">Password Reset!</h2>
          <p className="text-text-secondary text-sm mb-6">Your password has been successfully updated. Redirecting to login...</p>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex justify-center items-center py-12">
      <Card>
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-white mb-2">New Password</h2>
          <p className="text-text-secondary text-sm">Please enter a strong new password for your account</p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
          <div className="flex flex-col gap-1">
            <Input
              label="New Password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <PasswordStrengthBar password={password} />
          </div>

          <Input
            label="Confirm New Password"
            type="password"
            placeholder="••••••••"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
          />

          {error && <p className="text-sm text-error text-center">{error}</p>}

          <Button type="submit" isLoading={loading}>
            Update Password
          </Button>
        </form>
      </Card>
    </div>
  );
};

export default ResetPasswordPage;
