import React, { useEffect, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import api from "../services/api";
import { Card, Button, Spinner } from "../components/UI";
import { CheckCircle2, XCircle } from "lucide-react";

const VerifyEmailPage = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");
  const [status, setStatus] = useState("verifying"); // verifying, success, error
  const [message, setMessage] = useState("");

  useEffect(() => {
    const verify = async () => {
      if (!token) {
        setStatus("error");
        setMessage("Invalid verification link.");
        return;
      }
      try {
        await api.get(`/auth/verify-email?token=${token}`);
        setStatus("success");
      } catch (err) {
        setStatus("error");
        setMessage(err.response?.data?.message || "Verification failed.");
      }
    };
    verify();
  }, [token]);

  return (
    <div className="flex justify-center items-center py-12">
      <Card className="text-center">
        {status === "verifying" && (
          <div className="flex flex-col items-center gap-4">
            <Spinner className="w-12 h-12" />
            <h2 className="text-2xl font-bold text-white">Verifying Email</h2>
            <p className="text-text-secondary text-sm">Please wait while we verify your account...</p>
          </div>
        )}

        {status === "success" && (
          <div className="flex flex-col items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-success/10 flex items-center justify-center text-success">
              <CheckCircle2 size={32} />
            </div>
            <h2 className="text-2xl font-bold text-white">Email Verified!</h2>
            <p className="text-text-secondary text-sm mb-4">Your email has been successfully verified. You can now access all features.</p>
            <Link to="/login" className="w-full">
              <Button>Go to Login</Button>
            </Link>
          </div>
        )}

        {status === "error" && (
          <div className="flex flex-col items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-error/10 flex items-center justify-center text-error">
              <XCircle size={32} />
            </div>
            <h2 className="text-2xl font-bold text-white">Verification Failed</h2>
            <p className="text-text-secondary text-sm mb-4">{message}</p>
            <Link to="/login" className="w-full">
              <Button variant="secondary">Return to Login</Button>
            </Link>
          </div>
        )}
      </Card>
    </div>
  );
};

export default VerifyEmailPage;
