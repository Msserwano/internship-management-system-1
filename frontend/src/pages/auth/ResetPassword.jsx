// src/pages/auth/ResetPassword.jsx
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { motion } from "framer-motion";
import { Lock, Eye, EyeOff, CheckCircle2, ArrowRight } from "lucide-react";
import toast from "react-hot-toast";

const ResetPassword = () => {
  const navigate = useNavigate();
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);
  const { register, handleSubmit, watch, formState: { errors } } = useForm();
  const pw = watch("password");

  const onSubmit = async () => {
    setLoading(true);
    await new Promise((r) => setTimeout(r, 1000));
    toast.success("Password reset successfully! Please log in.");
    navigate("/login");
    setLoading(false);
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
          <div className="text-center mb-6">
            <div className="w-12 h-12 bg-primary-50 dark:bg-primary-900/30 rounded-2xl flex items-center justify-center mx-auto mb-3">
              <Lock className="w-6 h-6 text-primary-500" />
            </div>
            <h2 className="text-xl font-bold text-slate-800 dark:text-white">Reset Password</h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              Create a new secure password for your account.
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="form-label">New Password <span className="text-danger">*</span></label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  {...register("password", { required: "Password is required", minLength: { value: 8, message: "Minimum 8 characters" } })}
                  type={show ? "text" : "password"}
                  placeholder="At least 8 characters"
                  className={`form-input pl-9 pr-10 ${errors.password ? "form-input-error" : ""}`}
                />
                <button type="button" onClick={() => setShow(!show)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                  {show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {errors.password && <p className="form-error">{errors.password.message}</p>}
            </div>

            <div>
              <label className="form-label">Confirm New Password <span className="text-danger">*</span></label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  {...register("confirmPassword", {
                    required: "Confirm your password",
                    validate: (v) => v === pw || "Passwords do not match",
                  })}
                  type="password"
                  placeholder="Repeat new password"
                  className={`form-input pl-9 ${errors.confirmPassword ? "form-input-error" : ""}`}
                />
              </div>
              {errors.confirmPassword && <p className="form-error">{errors.confirmPassword.message}</p>}
            </div>

            <button type="submit" disabled={loading} className="btn btn-primary btn-md w-full py-3 mt-2">
              {loading ? (
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  Reset Password <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        </motion.div>
      </div>
    </div>
  );
};

export default ResetPassword;
