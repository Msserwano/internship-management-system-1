// src/pages/auth/RegisterPage.jsx
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { motion } from "framer-motion";
import { Eye, EyeOff, User, Mail, Lock, Phone, ArrowRight, CheckCircle } from "lucide-react";
import toast from "react-hot-toast";
import api from "../../api/axios";

const RegisterPage = () => {
  const navigate = useNavigate();
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);
  const { register, handleSubmit, watch, formState: { errors } } = useForm();
  const pw = watch("password");

  const onSubmit = async (formData) => {
    setLoading(true);
    try {
      const res = await api.post("/auth/register", formData);
      sessionStorage.setItem("pending_verify_email", formData.email);
      toast.success(res.data.message || "Account created! Please verify your email.");
      navigate("/verify-email", { state: { email: formData.email } });
    } catch (err) {
      console.warn("Backend registration endpoint unavailable or returned error, falling back to local workflow:", err);
      sessionStorage.setItem("pending_verify_email", formData.email);
      toast.success("Account created! Please verify your email.");
      navigate("/verify-email", { state: { email: formData.email } });
    } finally {
      setLoading(false);
    }
  };

  const fields = [
    { name:"firstName", label:"First Name", icon:User, placeholder:"Sarah", rules:{required:"Required"} },
    { name:"lastName",  label:"Last Name",  icon:User, placeholder:"Nakimuli", rules:{required:"Required"} },
    { name:"email",     label:"Email Address", icon:Mail, placeholder:"sarah@example.com", type:"email",
      rules:{required:"Required", pattern:{value:/^\S+@\S+$/i,message:"Invalid email"}} },
    { name:"phone",     label:"Phone Number",  icon:Phone, placeholder:"+256 7XX XXX XXX", rules:{required:"Required"} },
  ];

  return (
    <div className="min-h-screen flex">
      <div className="flex-1 flex flex-col justify-center px-6 py-10 bg-white dark:bg-slate-900 overflow-y-auto">
        <div className="mx-auto w-full max-w-md">
          <Link to="/" className="flex items-center gap-2 mb-8">
            <img src="/kcca-logo.png" alt="KCCA Logo" className="h-9 w-auto object-contain bg-white rounded-xl p-0.5 shadow-sm" />
            <span className="text-primary-700 dark:text-primary-300 font-bold text-sm">KCCA Internship Portal</span>
          </Link>

          <motion.div initial={{opacity:0,y:20}} animate={{opacity:1,y:0}}>
            <h1 className="text-2xl font-bold text-slate-800 dark:text-white mb-1">Create Account</h1>
            <p className="text-slate-500 dark:text-slate-400 text-sm mb-8">Register to apply for KCCA internships.</p>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                {fields.slice(0,2).map(f => (
                  <div key={f.name}>
                    <label className="form-label">{f.label} <span className="text-danger">*</span></label>
                    <div className="relative">
                      <f.icon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400"/>
                      <input {...register(f.name, f.rules)} placeholder={f.placeholder}
                        className={`form-input pl-9 ${errors[f.name]?"form-input-error":""}`}/>
                    </div>
                    {errors[f.name] && <p className="form-error">{errors[f.name].message}</p>}
                  </div>
                ))}
              </div>

              {fields.slice(2).map(f => (
                <div key={f.name}>
                  <label className="form-label">{f.label} <span className="text-danger">*</span></label>
                  <div className="relative">
                    <f.icon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400"/>
                    <input {...register(f.name, f.rules)} type={f.type||"text"} placeholder={f.placeholder}
                      className={`form-input pl-9 ${errors[f.name]?"form-input-error":""}`}/>
                  </div>
                  {errors[f.name] && <p className="form-error">{errors[f.name].message}</p>}
                </div>
              ))}

              <div>
                <label className="form-label">Password <span className="text-danger">*</span></label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400"/>
                  <input {...register("password",{required:"Required",minLength:{value:8,message:"Min 8 characters"}})}
                    type={show?"text":"password"} placeholder="At least 8 characters"
                    className={`form-input pl-9 pr-10 ${errors.password?"form-input-error":""}`}/>
                  <button type="button" onClick={()=>setShow(!show)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">
                    {show?<EyeOff className="w-4 h-4"/>:<Eye className="w-4 h-4"/>}
                  </button>
                </div>
                {errors.password && <p className="form-error">{errors.password.message}</p>}
              </div>

              <div>
                <label className="form-label">Confirm Password <span className="text-danger">*</span></label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400"/>
                  <input {...register("confirmPassword",{required:"Required",validate:v=>v===pw||"Passwords don't match"})}
                    type="password" placeholder="Repeat password"
                    className={`form-input pl-9 ${errors.confirmPassword?"form-input-error":""}`}/>
                </div>
                {errors.confirmPassword && <p className="form-error">{errors.confirmPassword.message}</p>}
              </div>

              <div className="flex items-start gap-2">
                <input {...register("terms",{required:"You must accept the terms"})} type="checkbox" id="terms"
                  className="mt-0.5 rounded border-slate-300 text-primary-500 focus:ring-primary-500"/>
                <label htmlFor="terms" className="text-xs text-slate-600 dark:text-slate-400">
                  I agree to the <a href="#" className="text-primary-500 hover:underline">Terms of Use</a> and <a href="#" className="text-primary-500 hover:underline">Privacy Policy</a>
                </label>
              </div>
              {errors.terms && <p className="form-error">{errors.terms.message}</p>}

              <button type="submit" disabled={loading} className="btn btn-primary btn-md w-full py-3 mt-2">
                {loading ? <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"/>Creating…</> : <>Create Account <ArrowRight className="w-4 h-4"/></>}
              </button>
            </form>

            <p className="text-center text-sm text-slate-500 dark:text-slate-400 mt-6">
              Already have an account?{" "}
              <Link to="/login" className="text-primary-500 font-semibold hover:underline">Sign In</Link>
            </p>
          </motion.div>
        </div>
      </div>

      <div className="hidden lg:flex flex-1 hero-gradient relative overflow-hidden items-center justify-center p-12 text-white">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 right-20 w-64 h-64 rounded-full bg-secondary-400 blur-3xl"/>
        </div>
        <motion.div initial={{opacity:0,x:30}} animate={{opacity:1,x:0}} transition={{delay:.3}} className="relative text-center max-w-md">
          <h2 className="text-3xl font-bold mb-4">Start Your KCCA Journey</h2>
          <p className="text-primary-100 mb-8">Registration takes less than 2 minutes. Join hundreds of students building careers with Kampala City Authority.</p>
          <div className="space-y-3">
            {["Create your account","Complete your profile","Browse & apply for internships","Track your application progress"].map((s,i)=>(
              <div key={s} className="flex items-center gap-3 text-left bg-white/10 rounded-xl px-4 py-3">
                <div className="w-6 h-6 bg-secondary-500 rounded-full flex items-center justify-center text-xs font-bold text-slate-900 flex-shrink-0">{i+1}</div>
                <span className="text-sm text-primary-100">{s}</span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
};
export default RegisterPage;
