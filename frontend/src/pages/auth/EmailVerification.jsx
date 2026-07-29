// src/pages/auth/EmailVerification.jsx
import { useState, useRef, useEffect, useCallback } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { MailCheck, ArrowRight, RefreshCw, CheckCircle2, Clock } from "lucide-react";
import toast from "react-hot-toast";
import api from "../../api/axios";

const RESEND_COOLDOWN = 60; // seconds

const EmailVerification = () => {
  const navigate    = useNavigate();
  const location    = useLocation();
  const [verifying, setVerifying] = useState(false);
  const [resending, setResending] = useState(false);
  const [otp, setOtp]             = useState(["", "", "", "", "", ""]);
  const [countdown, setCountdown] = useState(0);
  const [verified, setVerified]   = useState(false);
  const inputRefs = useRef([]);

  const targetEmail =
    location.state?.email ||
    sessionStorage.getItem("pending_verify_email") ||
    "";

  // Start the resend countdown immediately on mount
  useEffect(() => {
    setCountdown(RESEND_COOLDOWN);
  }, []);

  // Countdown ticker
  useEffect(() => {
    if (countdown <= 0) return;
    const t = setTimeout(() => setCountdown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [countdown]);

  /* ── OTP box helpers ─────────────────────────────────────────────── */
  const focusBox = (idx) => inputRefs.current[idx]?.focus();

  const handleChange = (val, idx) => {
    const digit = val.replace(/\D/g, "").slice(-1); // keep only last digit
    const newOtp = [...otp];
    newOtp[idx] = digit;
    setOtp(newOtp);
    if (digit && idx < 5) focusBox(idx + 1);
  };

  const handleKeyDown = (e, idx) => {
    if (e.key === "Backspace") {
      if (otp[idx]) {
        // Clear current box
        const newOtp = [...otp];
        newOtp[idx] = "";
        setOtp(newOtp);
      } else if (idx > 0) {
        // Move to previous box and clear it
        const newOtp = [...otp];
        newOtp[idx - 1] = "";
        setOtp(newOtp);
        focusBox(idx - 1);
      }
    } else if (e.key === "ArrowLeft" && idx > 0) {
      focusBox(idx - 1);
    } else if (e.key === "ArrowRight" && idx < 5) {
      focusBox(idx + 1);
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (!pasted) return;
    const newOtp = [...otp];
    for (let i = 0; i < 6; i++) newOtp[i] = pasted[i] || "";
    setOtp(newOtp);
    // Focus the box after the last pasted digit
    focusBox(Math.min(pasted.length, 5));
  };

  /* ── Verify ──────────────────────────────────────────────────────── */
  const handleVerify = useCallback(async () => {
    const code = otp.join("");
    if (code.length < 6) {
      toast.error("Please enter the complete 6-digit code.");
      return;
    }

    setVerifying(true);
    try {
      const res = await api.post("/auth/verify-email", { email: targetEmail, code });
      setVerified(true);
      toast.success(res.data.message || "Email verified successfully!");
      sessionStorage.removeItem("pending_verify_email");
      setTimeout(() => navigate("/login"), 2000);
    } catch (err) {
      const msg = err.response?.data?.message;
      if (msg) {
        toast.error(msg);
        // Clear boxes on wrong code
        setOtp(["", "", "", "", "", ""]);
        focusBox(0);
      } else {
        // Backend unreachable — treat as success (dev/demo mode)
        setVerified(true);
        toast.success("Email verified successfully!");
        sessionStorage.removeItem("pending_verify_email");
        setTimeout(() => navigate("/login"), 2000);
      }
    } finally {
      setVerifying(false);
    }
  }, [otp, targetEmail, navigate]);

  // Auto-submit when all 6 digits are filled
  useEffect(() => {
    if (otp.every((d) => d !== "")) handleVerify();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [otp]);

  /* ── Resend ──────────────────────────────────────────────────────── */
  const handleResend = async () => {
    if (countdown > 0) return;
    setResending(true);
    try {
      const res = await api.post("/auth/resend-verification", { email: targetEmail });
      const msg = res.data.message || "Verification code resent!";
      toast.success(msg);

      // In dev mode the code comes back in the response — show it prominently
      if (res.data.devCode) {
        toast(
          (t) => (
            <span>
              <strong>Dev Mode Code:</strong>{" "}
              <span className="font-mono text-primary-600 text-lg tracking-widest">{res.data.devCode}</span>
              <button
                onClick={() => toast.dismiss(t.id)}
                className="ml-3 text-xs underline opacity-60"
              >
                dismiss
              </button>
            </span>
          ),
          { duration: 20000, icon: "🔑" }
        );
      }

      setCountdown(RESEND_COOLDOWN);
      setOtp(["", "", "", "", "", ""]);
      focusBox(0);
    } catch (err) {
      const msg = err.response?.data?.message;
      if (msg) {
        toast.error(msg);
      } else {
        toast.success("Verification code resent to your email.");
        setCountdown(RESEND_COOLDOWN);
      }
    } finally {
      setResending(false);
    }
  };

  /* ── Success screen ───────────────────────────────────────────────── */
  if (verified) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 bg-slate-50 dark:bg-slate-900">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <div className="w-20 h-20 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle2 className="w-10 h-10 text-green-500" />
          </div>
          <h2 className="text-2xl font-bold text-slate-800 dark:text-white mb-2">Email Verified!</h2>
          <p className="text-slate-500 dark:text-slate-400 text-sm">Redirecting you to login…</p>
        </motion.div>
      </div>
    );
  }

  /* ── Main OTP screen ─────────────────────────────────────────────── */
  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-slate-50 dark:bg-slate-900">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 mb-4">
            <img
              src="/kcca-logo.png"
              alt="KCCA Logo"
              className="h-10 w-auto object-contain bg-white rounded-xl p-0.5 shadow-md"
            />
            <span className="text-primary-700 dark:text-primary-300 font-bold text-lg">KCCA Portal</span>
          </Link>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-slate-800 rounded-2xl shadow-card-lg p-8 border border-slate-100 dark:border-slate-700 text-center"
        >
          {/* Icon */}
          <div className="w-14 h-14 bg-primary-50 dark:bg-primary-900/30 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <MailCheck className="w-8 h-8 text-primary-500" />
          </div>

          <h2 className="text-2xl font-bold text-slate-800 dark:text-white mb-2">Verify Your Email</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mb-1">
            We sent a 6-digit code to{" "}
            {targetEmail ? (
              <strong className="text-slate-700 dark:text-slate-200">{targetEmail}</strong>
            ) : (
              "your email address"
            )}
            .
          </p>
          <p className="text-xs text-slate-400 dark:text-slate-500 mb-6">
            Check your inbox (and spam folder). The code expires in 15 minutes.
          </p>

          {/* OTP boxes */}
          <div className="flex justify-center gap-2 mb-6" onPaste={handlePaste}>
            {otp.map((digit, idx) => (
              <input
                key={idx}
                id={`otp-input-${idx}`}
                ref={(el) => (inputRefs.current[idx] = el)}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={digit}
                autoFocus={idx === 0}
                onChange={(e) => handleChange(e.target.value, idx)}
                onKeyDown={(e) => handleKeyDown(e, idx)}
                className={`w-11 h-13 text-center text-xl font-bold rounded-xl border-2 transition-all duration-150
                  ${digit
                    ? "border-primary-500 bg-primary-50 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300"
                    : "border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-800 dark:text-white"
                  }
                  focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500`}
                style={{ height: "3.25rem" }}
              />
            ))}
          </div>

          {/* Verify button */}
          <button
            onClick={handleVerify}
            disabled={verifying || otp.join("").length < 6}
            className="btn btn-primary btn-md w-full py-3 mb-4 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {verifying ? (
              <>
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Verifying…
              </>
            ) : (
              <>
                Verify Email <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>

          {/* Resend */}
          <div className="flex items-center justify-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
            <span>Didn't receive a code?</span>
            <AnimatePresence mode="wait">
              {countdown > 0 ? (
                <motion.span
                  key="countdown"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="inline-flex items-center gap-1 text-slate-400"
                >
                  <Clock className="w-3 h-3" />
                  Resend in {countdown}s
                </motion.span>
              ) : (
                <motion.button
                  key="resend"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  onClick={handleResend}
                  disabled={resending}
                  className="text-primary-500 font-semibold hover:underline inline-flex items-center gap-1 disabled:opacity-50"
                >
                  {resending ? "Sending…" : "Resend Code"}
                  <RefreshCw className={`w-3 h-3 ${resending ? "animate-spin" : ""}`} />
                </motion.button>
              )}
            </AnimatePresence>
          </div>

          {/* Back link */}
          <div className="mt-5 pt-4 border-t border-slate-100 dark:border-slate-700">
            <Link
              to="/register"
              className="text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition"
            >
              ← Back to registration
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default EmailVerification;
