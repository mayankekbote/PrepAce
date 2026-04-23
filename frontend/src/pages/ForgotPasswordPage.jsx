import React, { useState } from "react";
import { Link } from "react-router-dom";
import api from "../services/api";
import { Card, Input, Button } from "../components/UI";
import { CheckCircle2 } from "lucide-react";

const ForgotPasswordPage = () => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      await api.post("/auth/forgot-password", { email });
      setSuccess(true);
    } catch (err) {
      setError(err.response?.data?.message || "Something went wrong");
    }
    setLoading(false);
  };

  if (success) {
    return (
      <div className="flex justify-center items-center py-12">
        <Card className="text-center">
          <div className="flex justify-center mb-6">
            <div className="w-16 h-16 rounded-full bg-success/10 flex items-center justify-center text-success">
              <CheckCircle2 size={32} />
            </div>
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">Check your email</h2>
          <p className="text-text-secondary text-sm mb-8">
            We've sent a password reset link to <span className="text-white font-medium">{email}</span>.
          </p>
          <Link to="/login" className="w-full">
            <Button variant="secondary">Return to Login</Button>
          </Link>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex justify-center items-center py-12">
      <Card>
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-white mb-2">Reset Password</h2>
          <p className="text-text-secondary text-sm">Enter your email and we'll send you a link to reset your password</p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
          <Input
            label="Email Address"
            type="email"
            placeholder="name@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          {error && <p className="text-sm text-error text-center">{error}</p>}

          <Button type="submit" isLoading={loading}>
            Send Reset Link
          </Button>
        </form>

        <p className="text-center text-sm text-text-secondary mt-8">
          Remembered your password?{" "}
          <Link to="/login" className="text-accent font-bold hover:underline">
            Sign in
          </Link>
        </p>
      </Card>
    </div>
  );
};

export default ForgotPasswordPage;
