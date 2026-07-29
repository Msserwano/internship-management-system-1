// src/pages/auth/ForgotPassword.jsx
import { useState } from "react";
import { Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { motion } from "framer-motion";
import { Mail, ArrowLeft, Send, CheckCircle2 } from "lucide-react";
import toast from "react-hot-toast";

const ForgotPassword = () => {
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const { register, handleSubmit, formState: { errors } } = useForm();

  const onSubmit = async (data) => {
    setLoading(true);
    await new Promise((r) => setTimeout(r, 1000));
    setSubmitted(true);
    setLoading(false);
    toast.success("Password reset instructions sent!");
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-slate-50 dark:bg-slate-900">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 mb-4">
            <img src="/kcca-logo.png" alt="KCCA Logo" className="h-10 w-auto object-contain bg-white rounded-xl p-0.5 shadow-md" />
            <span className="text-primary-700 dark:text-primary-300 font-bold text-lg">KCCA Portal</span>
          </Link>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-slate-800 rounded-2xl shadow-card-lg p-8 border border-slate-100 dark:border-slate-700"
        >
          {!submitted ? (
            <>
              <div className="text-center mb-6">
                <div className="w-12 h-12 bg-primary-50 dark:bg-primary-900/30 rounded-2xl flex items-center justify-center mx-auto mb-3">
                  <Mail className="w-6 h-6 text-primary-500" />
                </div>
                <h2 className="text-xl font-bold text-slate-800 dark:text-white">Forgot Password?</h2>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                  Enter your registered email address and we'll send you instructions to reset your password.
                </p>
              </div>

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div>
                  <label className="form-label">Email Address <span className="text-danger">*</span></label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      {...register("email", {
                        required: "Email is required",
                        pattern: { value: /^\S+@\S+$/i, message: "Invalid email address" },
                      })}
                      type="email"
                      placeholder="applicant@kcca.go.ug"
                      className={`form-input pl-9 ${errors.email ? "form-input-error" : ""}`}
                    />
                  </div>
                  {errors.email && <p className="form-error">{errors.email.message}</p>}
                </div>

                <button type="submit" disabled={loading} className="btn btn-primary btn-md w-full py-3">
                  {loading ? (
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>
                      Send Instructions <Send className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>
            </>
          ) : (
            <div className="text-center py-4">
              <div className="w-12 h-12 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-3">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-800 dark:text-white">Check Your Email</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-2 mb-6">
                We have sent password reset instructions to your email address.
              </p>
              <button
                onClick={() => setSubmitted(false)}
                className="text-xs text-primary-500 font-semibold hover:underline"
              >
                Didn't receive email? Try again
              </button>
            </div>
          )}

          <div className="mt-6 pt-6 border-t border-slate-100 dark:border-slate-700 text-center">
            <Link to="/login" className="inline-flex items-center gap-1.5 text-sm text-slate-600 dark:text-slate-400 hover:text-primary-500 transition">
              <ArrowLeft className="w-4 h-4" /> Back to Sign In
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default ForgotPassword;
