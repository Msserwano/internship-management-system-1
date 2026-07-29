// src/pages/landing/LandingPage.jsx
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ArrowRight, Briefcase, Building2, CheckCircle2, Users, TrendingUp,
  MapPin, Clock, Award, Phone, Mail, Globe, MessageCircle, Share2,
  Star, ChevronRight, GraduationCap, Shield,
} from "lucide-react";

const fadeUp = { initial:{opacity:0,y:30}, whileInView:{opacity:1,y:0}, viewport:{once:true} };

const STATS = [
  { icon: Briefcase,  value:"120+", label:"Available Positions",   color:"text-primary-400" },
  { icon: Building2,  value:"12",   label:"Departments",           color:"text-secondary-400" },
  { icon: Users,      value:"850+", label:"Applications Received", color:"text-accent-400" },
  { icon: Award,      value:"340+", label:"Interns Placed",        color:"text-purple-400" },
];

const FEATURES = [
  { icon: Briefcase,      title:"Browse Opportunities",  desc:"Explore internships across all KCCA departments filtered by your field, location, and duration." },
  { icon: GraduationCap,  title:"Easy Application",      desc:"Complete your application in minutes with our guided 5-step wizard — no paperwork required." },
  { icon: TrendingUp,     title:"Track Progress",        desc:"Monitor your application status in real-time, from submission to offer letter." },
  { icon: Shield,         title:"Secure & Trusted",      desc:"Government-grade security ensuring your personal data and documents are protected." },
];

const DEPARTMENTS = [
  "Engineering & Technical Services","Public Health Services","Education",
  "Finance & Planning","Legal Services","Urban Planning",
  "Gender & Community Services","ICT","Internal Audit","Environment",
];

const TESTIMONIALS = [
  { name:"Aisha Nakayenga", uni:"Makerere University", dept:"ICT", text:"KCCA's internship gave me real-world experience that accelerated my career. The team was incredibly supportive.", rating:5 },
  { name:"David Ssempijja",  uni:"Kyambogo University", dept:"Engineering", text:"The application process was seamless. I got placed within two weeks and learned so much from the engineers.", rating:5 },
  { name:"Grace Atim",       uni:"Uganda Christian University", dept:"Public Health", text:"Working with the public health team opened my eyes to how city-level health programs are run. Invaluable.", rating:5 },
];

const LandingPage = () => (
  <div className="min-h-screen bg-white dark:bg-slate-900 font-sans">
    {/* Navbar */}
    <nav className="sticky top-0 z-50 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-100 dark:border-slate-800 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2.5">
          <img src="/kcca-logo.png" alt="KCCA Logo" className="h-10 w-auto object-contain bg-white rounded-lg p-0.5 shadow-sm" />
          <div>
            <p className="text-primary-700 dark:text-primary-300 font-bold text-sm leading-tight">KCCA</p>
            <p className="text-slate-500 dark:text-slate-400 text-[10px] leading-tight">Internship Portal</p>
          </div>
        </Link>
        <div className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-600 dark:text-slate-300">
          <a href="#internships"  className="hover:text-primary-600 transition">Internships</a>
          <a href="#departments"  className="hover:text-primary-600 transition">Departments</a>
          <a href="#about"        className="hover:text-primary-600 transition">About KCCA</a>
          <a href="#contact"      className="hover:text-primary-600 transition">Contact</a>
        </div>
        <div className="flex items-center gap-3">
          <Link to="/login" className="btn btn-ghost btn-sm hidden sm:flex">Login</Link>
          <Link to="/register" className="btn btn-primary btn-sm">Register</Link>
        </div>
      </div>
    </nav>

    {/* Hero */}
    <section className="hero-gradient relative overflow-hidden">
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-10 left-10 w-64 h-64 rounded-full bg-white blur-3xl" />
        <div className="absolute bottom-10 right-10 w-96 h-96 rounded-full bg-secondary-500 blur-3xl" />
      </div>
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 py-24 md:py-32">
        <div className="max-w-3xl">
          <motion.div initial={{opacity:0,y:20}} animate={{opacity:1,y:0}} transition={{delay:.1}}
            className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm text-white text-sm font-medium px-4 py-1.5 rounded-full mb-6 border border-white/30"
          >
            <span className="w-2 h-2 bg-secondary-400 rounded-full animate-pulse" />
            Applications Open – July 2026
          </motion.div>
          <motion.h1 initial={{opacity:0,y:30}} animate={{opacity:1,y:0}} transition={{delay:.2}}
            className="text-4xl md:text-6xl font-black text-white leading-tight mb-6"
          >
            Kampala Capital City Authority<br />
            <span className="text-secondary-400">Internship Portal</span>
          </motion.h1>
          <motion.p initial={{opacity:0,y:20}} animate={{opacity:1,y:0}} transition={{delay:.35}}
            className="text-xl text-primary-100 mb-10 leading-relaxed max-w-2xl"
          >
            Apply for internship opportunities, monitor your applications, and launch your career with KCCA — Uganda's premier city authority.
          </motion.p>
          <motion.div initial={{opacity:0,y:20}} animate={{opacity:1,y:0}} transition={{delay:.5}}
            className="flex flex-wrap gap-4"
          >
            <Link to="/register" className="btn btn-secondary btn-lg shadow-lg hover:shadow-xl">
              Apply Now <ArrowRight className="w-5 h-5" />
            </Link>
            <a href="#internships" className="btn btn-lg border border-white/40 text-white hover:bg-white/10 bg-transparent">
              Browse Opportunities
            </a>
          </motion.div>
        </div>
      </div>
      
      {/* Stats bar */}
      <div className="relative bg-white/10 backdrop-blur-sm border-t border-white/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 grid grid-cols-2 md:grid-cols-4 gap-6">
          {STATS.map((s, i) => (
            <motion.div key={s.label}
              initial={{opacity:0,y:10}} animate={{opacity:1,y:0}} transition={{delay:.6+i*.1}}
              className="text-center"
            >
              <p className={`text-3xl font-black ${s.color}`}>{s.value}</p>
              <p className="text-primary-100 text-sm mt-1">{s.label}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>

    {/* Features */}
    <section className="py-20 bg-slate-50 dark:bg-slate-800/50" id="about">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <motion.div {...fadeUp} className="text-center mb-14">
          <p className="text-primary-600 dark:text-primary-400 text-sm font-semibold uppercase tracking-wider mb-2">Why KCCA?</p>
          <h2 className="text-3xl md:text-4xl font-bold text-slate-800 dark:text-white">Your Gateway to Public Service</h2>
          <p className="text-slate-500 dark:text-slate-400 mt-3 max-w-xl mx-auto">
            KCCA internships provide hands-on experience in real government operations — shaping Uganda's future leaders.
          </p>
        </motion.div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {FEATURES.map((f, i) => (
            <motion.div {...fadeUp} transition={{delay:i*.1}} key={f.title}
              className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-card hover:shadow-card-md transition-all hover:-translate-y-1 cursor-default"
            >
              <div className="w-12 h-12 bg-primary-50 dark:bg-primary-900/30 rounded-xl flex items-center justify-center mb-4">
                <f.icon className="w-6 h-6 text-primary-500" />
              </div>
              <h3 className="font-bold text-slate-800 dark:text-white mb-2">{f.title}</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">{f.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>

    {/* Departments */}
    <section className="py-20 bg-white dark:bg-slate-900" id="departments">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <motion.div {...fadeUp} className="text-center mb-12">
          <p className="text-primary-600 dark:text-primary-400 text-sm font-semibold uppercase tracking-wider mb-2">Opportunities Await</p>
          <h2 className="text-3xl md:text-4xl font-bold text-slate-800 dark:text-white">Intern Across All Departments</h2>
        </motion.div>
        <div className="flex flex-wrap justify-center gap-3">
          {DEPARTMENTS.map((d, i) => (
            <motion.div key={d} initial={{opacity:0,scale:.95}} whileInView={{opacity:1,scale:1}} viewport={{once:true}} transition={{delay:i*.04}}
              className="px-4 py-2 bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300 rounded-full text-sm font-medium border border-primary-100 dark:border-primary-800 hover:bg-primary-100 dark:hover:bg-primary-900/40 transition cursor-pointer"
            >
              {d}
            </motion.div>
          ))}
        </div>
        <motion.div {...fadeUp} className="mt-12 text-center">
          <Link to="/register" className="btn btn-primary btn-lg inline-flex">
            View All Internships <ChevronRight className="w-5 h-5" />
          </Link>
        </motion.div>
      </div>
    </section>

    {/* Internships preview */}
    <section className="py-20 bg-slate-50 dark:bg-slate-800/50" id="internships">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <motion.div {...fadeUp} className="flex items-end justify-between mb-10">
          <div>
            <p className="text-primary-600 dark:text-primary-400 text-sm font-semibold uppercase tracking-wider mb-1">Currently Open</p>
            <h2 className="text-3xl font-bold text-slate-800 dark:text-white">Featured Internships</h2>
          </div>
          <Link to="/register" className="hidden sm:flex items-center gap-1 text-sm text-primary-500 hover:underline font-medium">
            View all <ArrowRight className="w-4 h-4" />
          </Link>
        </motion.div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {[
            { title:"Software Development Intern", dept:"ICT", duration:"3 Months", location:"City Hall", deadline:"15 Aug 2026", vacancies:4 },
            { title:"Public Health Intern",        dept:"Public Health", duration:"6 Months", location:"Kawempe Div", deadline:"20 Aug 2026", vacancies:6 },
            { title:"Finance & Accounts Intern",   dept:"Finance", duration:"3 Months", location:"City Hall", deadline:"1 Sep 2026", vacancies:5 },
            { title:"Urban Planning Intern",       dept:"Urban Planning", duration:"4 Months", location:"City Hall", deadline:"30 Aug 2026", vacancies:3 },
            { title:"Education Program Intern",    dept:"Education", duration:"6 Months", location:"Rubaga Div", deadline:"10 Sep 2026", vacancies:8 },
            { title:"Civil Engineering Intern",    dept:"Engineering", duration:"4 Months", location:"Nakawa Div", deadline:"18 Aug 2026", vacancies:4 },
          ].map((job, i) => (
            <motion.div key={job.title} {...fadeUp} transition={{delay:i*.07}}
              className="bg-white dark:bg-slate-800 rounded-2xl p-5 shadow-card hover:shadow-card-md hover:-translate-y-1 transition-all cursor-pointer"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="w-10 h-10 bg-primary-50 dark:bg-primary-900/30 rounded-xl flex items-center justify-center">
                  <Briefcase className="w-5 h-5 text-primary-500" />
                </div>
                <span className="badge badge-open text-xs">Open</span>
              </div>
              <h3 className="font-bold text-slate-800 dark:text-white mb-1">{job.title}</h3>
              <p className="text-primary-600 dark:text-primary-400 text-sm font-medium mb-3">{job.dept}</p>
              <div className="space-y-1.5 mb-4">
                <div className="flex items-center gap-1.5 text-xs text-slate-500"><Clock className="w-3.5 h-3.5"/>{job.duration}</div>
                <div className="flex items-center gap-1.5 text-xs text-slate-500"><MapPin className="w-3.5 h-3.5"/>{job.location}</div>
                <div className="flex items-center gap-1.5 text-xs text-slate-500"><Users className="w-3.5 h-3.5"/>{job.vacancies} vacancies</div>
              </div>
              <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-700">
                <span className="text-xs text-slate-500">Deadline: <strong className="text-slate-700 dark:text-slate-300">{job.deadline}</strong></span>
                <Link to="/register" className="btn btn-primary btn-xs">Apply</Link>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>

    {/* Testimonials */}
    <section className="py-20 bg-white dark:bg-slate-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <motion.div {...fadeUp} className="text-center mb-12">
          <h2 className="text-3xl font-bold text-slate-800 dark:text-white">What Our Interns Say</h2>
        </motion.div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {TESTIMONIALS.map((t, i) => (
            <motion.div key={t.name} {...fadeUp} transition={{delay:i*.1}}
              className="bg-slate-50 dark:bg-slate-800 rounded-2xl p-6 border border-slate-100 dark:border-slate-700"
            >
              <div className="flex gap-1 mb-4">
                {[...Array(t.rating)].map((_,j)=><Star key={j} className="w-4 h-4 fill-secondary-400 text-secondary-400"/>)}
              </div>
              <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed mb-4">"{t.text}"</p>
              <div>
                <p className="font-semibold text-slate-800 dark:text-white text-sm">{t.name}</p>
                <p className="text-xs text-slate-500">{t.uni} • {t.dept}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>

    {/* Footer */}
    <footer id="contact" className="bg-slate-900 text-slate-400 py-14">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-10">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <img src="/kcca-logo.png" alt="KCCA Logo" className="h-9 w-auto object-contain bg-white rounded-lg p-0.5 shadow-sm" />
              <div>
                <p className="text-white font-bold text-sm">KCCA</p>
                <p className="text-slate-500 text-xs">Internship Portal</p>
              </div>
            </div>
            <p className="text-sm leading-relaxed">Kampala Capital City Authority – enabling careers through meaningful public service internships.</p>
          </div>
          <div>
            <h4 className="text-white font-semibold mb-4 text-sm">Quick Links</h4>
            <ul className="space-y-2 text-sm">
              {["Home","Internships","Departments","About KCCA"].map(l=>(
                <li key={l}><a href="#" className="hover:text-white transition">{l}</a></li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="text-white font-semibold mb-4 text-sm">Support</h4>
            <ul className="space-y-2 text-sm">
              {["Help Center","Privacy Policy","Terms of Use","FAQs"].map(l=>(
                <li key={l}><a href="#" className="hover:text-white transition">{l}</a></li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="text-white font-semibold mb-4 text-sm">Contact</h4>
            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2"><Phone className="w-4 h-4 text-primary-400"/>+256 417 700 900</div>
              <div className="flex items-center gap-2"><Mail className="w-4 h-4 text-primary-400"/>internships@kcca.go.ug</div>
              <div className="flex items-center gap-2"><MapPin className="w-4 h-4 text-primary-400"/>City Hall, Kampala</div>
            </div>
            <div className="flex gap-3 mt-4">
              {[Globe, MessageCircle, Share2].map((Icon, i) => (
                <a key={i} href="#" className="w-8 h-8 bg-slate-800 hover:bg-primary-600 rounded-lg flex items-center justify-center transition">
                  <Icon className="w-4 h-4 text-slate-400 hover:text-white" />
                </a>
              ))}
            </div>
          </div>
        </div>
        <div className="border-t border-slate-800 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-600">
          <p>© 2026 Kampala Capital City Authority. All rights reserved.</p>
          <p>Designed for Government Excellence</p>
        </div>
      </div>
    </footer>
  </div>
);
export default LandingPage;
