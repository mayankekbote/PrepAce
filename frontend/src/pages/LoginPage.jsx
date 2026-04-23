import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Card, Input, Button } from "../components/UI";

const LoginPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    const result = await login(email, password);
    if (result.success) {
      if (result.profileComplete === false) {
        navigate("/complete-profile");
      } else {
        navigate("/dashboard");
      }
    } else {
      setError(result.message);
    }
    setLoading(false);
  };

  return (
    <div className="flex justify-center items-center">
      <Card className="border-t-2 border-t-accent/50 shadow-[0_0_50px_rgba(0,0,0,0.5)]">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-bold text-white mb-2 tracking-tight">Access Terminal</h2>
          <p className="text-text-secondary text-sm font-medium">Authentication required to proceed</p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
          <Input
            label="ID / Email Address"
            type="email"
            placeholder="usr_name@domain.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <div className="flex flex-col gap-1.5">
            <div className="flex justify-between items-center px-1 mb-1">
              <label className="text-xs font-semibold text-text-secondary uppercase tracking-widest opacity-70">Security Key</label>
              <Link to="/forgot-password" size="sm" className="text-xs text-accent hover:text-white transition-colors duration-200">
                Recover Key?
              </Link>
            </div>
            <Input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          {error && (
            <div className="bg-error/10 border border-error/20 rounded-lg p-3">
              <p className="text-xs text-error text-center font-mono uppercase tracking-tighter">{error}</p>
            </div>
          )}

          <Button type="submit" isLoading={loading} className="mt-2">
            INITIALIZE SESSION
          </Button>
        </form>

        <p className="text-center text-sm text-text-secondary mt-10">
          New user?{" "}
          <Link to="/register" className="text-accent font-bold hover:text-white transition-colors duration-200 underline decoration-accent/30 underline-offset-4">
            Create Identity
          </Link>
        </p>
      </Card>
    </div>
  );
};

export default LoginPage;
