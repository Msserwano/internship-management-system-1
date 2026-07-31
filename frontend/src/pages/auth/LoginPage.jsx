
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { motion, AnimatePresence } from "framer-motion";
import { Eye, EyeOff, Mail, Lock, Briefcase, ArrowRight, CheckCircle, AlertTriangle, MailCheck } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import toast from "react-hot-toast";
import { DEMO_CREDENTIALS } from "../../utils/constants";

const LoginPage = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);
  const { register, handleSubmit, setValue, formState: { errors } } = useForm();

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      const user = await login(data.email, data.password);
      const displayName = user.firstName || user.name?.split(" ")[0] || "there";
      toast.success(`Welcome back, ${displayName}!`);
      const redirects = { applicant:"/applicant/dashboard", hr:"/hr/dashboard", admin:"/admin/dashboard" };
      navigate(redirects[user.role] || "/applicant/dashboard");
    } catch (err) {
      toast.error(err.message || "Login failed. Please check your credentials.");
    } finally {
      setLoading(false);
    }
  };

  const fillDemo = (cred) => { setValue("email", cred.email); setValue("password", cred.password); };

  return (
    <div className="min-h-screen flex">
      {}
      <div className="flex-1 flex flex-col justify-center px-6 py-12 bg-white dark:bg-slate-900">
        <div className="mx-auto w-full max-w-sm">
          <Link to="/" className="flex items-center gap-2 mb-10">
            <img src="/kcca-logo.png" alt="KCCA Logo" className="h-10 w-auto object-contain bg-white rounded-xl p-0.5 shadow-sm" />
            <div>
              <p className="text-primary-700 dark:text-primary-300 font-bold text-sm leading-tight">KCCA</p>
              <p className="text-slate-400 text-[10px]">Internship Portal</p>
            </div>
          </Link>

          <motion.div initial={{opacity:0,y:20}} animate={{opacity:1,y:0}} transition={{duration:.4}}>
            <h1 className="text-2xl font-bold text-slate-800 dark:text-white mb-1">Welcome back</h1>
            <p className="text-slate-500 dark:text-slate-400 text-sm mb-8">Sign in to continue to your portal.</p>

            {}

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
              <div>
                <label className="form-label">Email Address <span className="text-danger">*</span></label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    {...register("email", { required:"Email is required", pattern:{ value:/^\S+@\S+$/i, message:"Invalid email" }})}
                    type="email" placeholder="you@kcca.go.ug"
                    className={`form-input pl-9 ${errors.email?"form-input-error":""}`}
                  />
                </div>
                {errors.email && <p className="form-error">{errors.email.message}</p>}
              </div>

              <div>
                <div className="flex justify-between mb-1">
                  <label className="form-label mb-0">Password <span className="text-danger">*</span></label>
                  <Link to="/forgot-password" className="text-xs text-primary-500 hover:underline">Forgot password?</Link>
                </div>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    {...register("password", { required:"Password is required" })}
                    type={show?"text":"password"} placeholder="••••••••"
                    className={`form-input pl-9 pr-10 ${errors.password?"form-input-error":""}`}
                  />
                  <button type="button" onClick={() => setShow(!show)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                    {show ? <EyeOff className="w-4 h-4"/> : <Eye className="w-4 h-4"/>}
                  </button>
                </div>
                {errors.password && <p className="form-error">{errors.password.message}</p>}
              </div>

              <button type="submit" disabled={loading}
                className="btn btn-primary btn-md w-full text-base py-3"
              >
                {loading ? <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"/>Signing in…</> : <>Sign In <ArrowRight className="w-4 h-4"/></>}
              </button>
            </form>

            <p className="text-center text-sm text-slate-500 dark:text-slate-400 mt-6">
              Don't have an account?{" "}
              <Link to="/register" className="text-primary-500 font-semibold hover:underline">Create Account</Link>
            </p>

            {}
            <div className="mt-8 p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700">
              <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 mb-3 uppercase tracking-wide">Demo Accounts</p>
              <div className="space-y-2">
                {DEMO_CREDENTIALS.map(cred => (
                  <button key={cred.role} onClick={() => fillDemo(cred)}
                    className="w-full flex items-center gap-3 px-3 py-2 rounded-xl bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 hover:border-primary-300 hover:bg-primary-50 dark:hover:bg-primary-900/20 transition text-left"
                  >
                    <CheckCircle className="w-4 h-4 text-primary-400 flex-shrink-0"/>
                    <div>
                      <p className="text-xs font-semibold text-slate-700 dark:text-slate-200">{cred.label}</p>
                      <p className="text-[10px] text-slate-400">{cred.email}</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {}
      <div className="hidden lg:flex flex-1 hero-gradient relative overflow-hidden flex-col items-center justify-center p-12 text-white">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-20 w-64 h-64 rounded-full bg-white blur-3xl"/>
          <div className="absolute bottom-20 right-20 w-64 h-64 rounded-full bg-secondary-400 blur-3xl"/>
        </div>
        <motion.div initial={{opacity:0,x:30}} animate={{opacity:1,x:0}} transition={{delay:.3}} className="relative text-center max-w-md">
          <div className="w-20 h-20 bg-white/20 backdrop-blur-sm rounded-3xl flex items-center justify-center mx-auto mb-8 border border-white/30">
            <Briefcase className="w-10 h-10 text-white"/>
          </div>
          <h2 className="text-3xl font-bold mb-4">Build Your Career with KCCA</h2>
          <p className="text-primary-100 leading-relaxed mb-8">
            Access your applicant dashboard, track your applications, schedule interviews, and launch your public service career.
          </p>
          <div className="grid grid-cols-2 gap-3 text-left">
            {["Real government experience","12+ departments","Mentorship programs","Career references"].map(f=>(
              <div key={f} className="flex items-center gap-2 text-sm text-primary-100">
                <CheckCircle className="w-4 h-4 text-secondary-400 flex-shrink-0"/>{f}
              </div>
            ))}
          </div>
          <div className="mt-10 p-4 bg-white/10 backdrop-blur-sm rounded-2xl border border-white/20 text-left">
            <p className="text-sm font-semibold mb-1">🎯 Challenge Yourself</p>
            <p className="text-xs text-primary-200">Apply · Learn · Make Impact</p>
          </div>
        </motion.div>
      </div>
    </div>
  );
};
export default LoginPage;
