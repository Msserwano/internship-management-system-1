import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { motion } from "framer-motion";
import { Eye, EyeOff, Mail, Lock, Briefcase, ArrowRight, CheckCircle } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import toast from "react-hot-toast";

const LoginPage = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);
  const { register, handleSubmit, formState: { errors } } = useForm();

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      const user = await login(data.email, data.password);
      const displayName = user.firstName || user.name?.split(" ")[0] || "there";
      toast.success(`Welcome back, ${displayName}!`);
      const userRole = user?.role ? String(user.role).toLowerCase() : "applicant";
      const redirects = { applicant:"/applicant/dashboard", hr:"/hr/dashboard", admin:"/admin/dashboard" };
      navigate(redirects[userRole] || "/applicant/dashboard");
    } catch (err) {
      toast.error(err.message || "Login failed. Please check your credentials.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {}
      <div className="flex-1 flex flex-col justify-center px-6 py-12 bg-white dark:bg-slate-900">
        <div className="mx-auto w-full max-w-sm">
          <Link to="/" className="flex flex-col items-center justify-center mb-8 group">
            <div className="p-4 bg-white rounded-2xl shadow-md border border-slate-100 dark:border-slate-800 mb-3 group-hover:scale-105 transition-transform duration-300">
              <img src="/kcca-logo.png" alt="KCCA Logo" className="h-28 w-auto object-contain" />
            </div>
            <div className="text-center">
              <p className="text-green-600 dark:text-green-400 font-black text-xl tracking-wide uppercase">KCCA INTERNSHIP PORTAL</p>
              <p className="text-green-700/80 dark:text-green-300/80 text-xs font-bold tracking-wider">KAMPALA CAPITAL CITY AUTHORITY</p>
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
                className="btn bg-green-600 hover:bg-green-700 text-white btn-md w-full text-base py-3 shadow-md shadow-green-600/20"
              >
                {loading ? <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"/>Signing in…</> : <>Sign In <ArrowRight className="w-4 h-4"/></>}
              </button>
            </form>

            <p className="text-center text-sm text-slate-500 dark:text-slate-400 mt-6">
              Don't have an account?{" "}
              <Link to="/register" className="text-green-600 dark:text-green-400 font-semibold hover:underline">Create Account</Link>
            </p>
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
          <div className="w-36 h-36 bg-white rounded-3xl flex items-center justify-center mx-auto mb-8 p-3 shadow-2xl border border-white/40">
            <img src="/kcca-logo.png" alt="KCCA Official Logo" className="w-full h-full object-contain" />
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
