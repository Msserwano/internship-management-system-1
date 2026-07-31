
import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import Breadcrumbs from "../../components/layout/Breadcrumbs";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";
import Select from "../../components/ui/Select";
import useApi from "../../hooks/useApi";
import { applicationService } from "../../api/services";
import { useAuth } from "../../context/AuthContext";
import toast from "react-hot-toast";
import {
  Check, ArrowRight, ArrowLeft, Upload, FileText, User, GraduationCap,
  Building, Paperclip, Send, CheckCircle2
} from "lucide-react";

const STEPS = [
  { id: 1, name: "Personal Details", icon: User },
  { id: 2, name: "Academic Details", icon: GraduationCap },
  { id: 3, name: "University Info", icon: Building },
  { id: 4, name: "Documents", icon: Paperclip },
  { id: 5, name: "Review & Submit", icon: FileText },
];

const ApplyWizard = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { data: internships, loading: loadingJobs } = useApi("/internships");
  
  const targetId = id || (internships.length > 0 ? internships[0].id : null);
  const internship = internships.find((i) => String(i.id) === String(targetId));

  const [currentStep, setCurrentStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    fullName: user?.name || "",
    email: user?.email || "",
    phone: user?.phone || "",
    gender: user?.gender || "Female",
    dob: user?.dob || "",
    district: user?.district || "",
    nin: "",

    qualification: "Bachelor's Degree",
    course: user?.course || "",
    yearOfStudy: user?.yearOfStudy || "3rd Year",
    gpa: user?.gpa || "",

    university: user?.university || "",
    studentId: user?.studentId || "",
    headOfDept: "",
    universityEmail: "",

    nationalIdDoc: "",
    recommendationDoc: "",
    transcriptDoc: "",
    cvDoc: "",
    coverLetterDoc: "",
    photoDoc: "",
  });

  useEffect(() => {
    let isMounted = true;
    import("../../api/axios").then(({ default: api }) => {
      api.get("/applicants/profile")
        .then((res) => {
          if (!isMounted) return;
          const p = res.data?.data;
          if (p) {
            setFormData((prev) => ({
              ...prev,
              fullName: p.name || prev.fullName,
              email: p.email || prev.email,
              phone: p.phone || prev.phone,
              gender: p.gender || prev.gender,
              dob: p.dob ? p.dob.split("T")[0] : prev.dob,
              district: p.district || prev.district,
              university: p.university || prev.university,
              course: p.course || prev.course,
              yearOfStudy: p.yearOfStudy || prev.yearOfStudy,
              gpa: p.gpa || prev.gpa,
            }));
          }
        })
        .catch(() => {});
    });
    return () => { isMounted = false; };
  }, []);

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleFileUpload = (field, e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      toast.error("File size must be under 10MB.");
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const docObj = {
        name: file.name,
        size: (file.size / 1024).toFixed(1) + " KB",
        type: file.type,
        data: event.target.result,
        uploadedAt: new Date().toISOString()
      };

      setFormData((prev) => {
        const nextDocs = { ...(prev.documents || {}), [field]: docObj };
        return {
          ...prev,
          [field]: docObj,
          documents: nextDocs
        };
      });

      toast.success(`${file.name} uploaded successfully!`);
    };

    reader.readAsDataURL(file);
  };

  const handleNext = () => {
    if (currentStep < 5) setCurrentStep(currentStep + 1);
  };

  const handlePrev = () => {
    if (currentStep > 1) setCurrentStep(currentStep - 1);
  };

  const handleSubmit = async () => {
    if (!internship) {
      toast.error("Invalid internship selected.");
      return;
    }
    setSubmitting(true);
    try {
      const docsToSubmit = formData.documents || {};
      if (!docsToSubmit.cvDoc && formData.cvDoc) docsToSubmit.cvDoc = formData.cvDoc;
      if (!docsToSubmit.recommendationDoc && formData.recommendationDoc) docsToSubmit.recommendationDoc = formData.recommendationDoc;
      if (!docsToSubmit.transcriptDoc && formData.transcriptDoc) docsToSubmit.transcriptDoc = formData.transcriptDoc;
      if (!docsToSubmit.nationalIdDoc && formData.nationalIdDoc) docsToSubmit.nationalIdDoc = formData.nationalIdDoc;

      await applicationService.submit({
        internshipId:   internship.id,
        university:     formData.university || "Makerere University",
        course:         formData.course || "General Studies",
        gpa:            formData.gpa || "3.5",
        documents:      docsToSubmit,
      });
      toast.success("Application and attached documents submitted successfully to KCCA!");
      navigate("/applicant/applications");
    } catch (err) {
      const errMsg = err.response?.data?.message || "Failed to submit application. Please try again.";
      toast.error(errMsg);
    } finally {
      setSubmitting(false);
    }
  };

  if (loadingJobs) {
    return (
      <div className="page-container max-w-4xl mx-auto">
        <Breadcrumbs />
        <div className="space-y-4">
          <div className="h-32 bg-slate-200 dark:bg-slate-700 animate-pulse rounded-2xl" />
          <div className="h-96 bg-slate-200 dark:bg-slate-700 animate-pulse rounded-2xl" />
        </div>
      </div>
    );
  }

  if (!internship) {
    return (
      <div className="page-container max-w-xl mx-auto text-center py-16">
        <Breadcrumbs />
        <div className="card p-8 space-y-4">
          <FileText className="w-12 h-12 text-slate-400 mx-auto" />
          <h2 className="text-xl font-bold text-slate-800 dark:text-white">Internship Position Not Found</h2>
          <p className="text-sm text-slate-500">The selected internship posting may have expired or been removed.</p>
          <Link to="/applicant/internships">
            <Button variant="primary" size="md">Browse Available Internships</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container max-w-4xl mx-auto">
      <Breadcrumbs />

      {}
      <div className="card p-6 bg-gradient-to-r from-primary-600 to-primary-800 text-white mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className="text-xs font-semibold bg-white/20 px-2.5 py-1 rounded-full uppercase tracking-wider">
              {internship.department}
            </span>
            <h2 className="text-2xl font-bold mt-2">{internship.title}</h2>
            <p className="text-primary-100 text-xs mt-1">
              Duration: {internship.duration} • Location: {internship.location}
            </p>
          </div>
          <div className="text-right">
            <span className="text-xs text-primary-200">Applying as</span>
            <p className="font-semibold text-sm">{user?.name}</p>
          </div>
        </div>
      </div>

      {}
      <div className="card p-6 mb-8">
        <div className="flex items-center justify-between relative">
          {STEPS.map((step, idx) => {
            const isDone = currentStep > step.id;
            const isCurrent = currentStep === step.id;
            const Icon = step.icon;

            return (
              <div key={step.id} className="flex-1 flex flex-col items-center relative z-10">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-all duration-300 ${
                    isDone
                      ? "bg-accent-500 text-white"
                      : isCurrent
                      ? "bg-primary-500 text-white shadow-lg scale-110 ring-4 ring-primary-100 dark:ring-primary-900/40"
                      : "bg-slate-100 dark:bg-slate-700 text-slate-400"
                  }`}
                >
                  {isDone ? <Check className="w-5 h-5" /> : <Icon className="w-4 h-4" />}
                </div>
                <span
                  className={`text-xs mt-2 font-medium hidden sm:block text-center ${
                    isCurrent
                      ? "text-primary-600 dark:text-primary-400 font-bold"
                      : isDone
                      ? "text-slate-700 dark:text-slate-300"
                      : "text-slate-400"
                  }`}
                >
                  {step.name}
                </span>

                {idx < STEPS.length - 1 && (
                  <div
                    className={`absolute top-5 left-1/2 w-full h-0.5 -z-10 transition-colors ${
                      currentStep > step.id ? "bg-accent-500" : "bg-slate-200 dark:bg-slate-700"
                    }`}
                  />
                )}
              </div>
            );
          })}
        </div>
      </div>

      {}
      <div className="card p-6 md:p-8">
        <AnimatePresence mode="wait">
          {currentStep === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-5"
            >
              <h3 className="text-lg font-bold text-slate-800 dark:text-white border-b pb-3 border-slate-100 dark:border-slate-700">
                Step 1: Personal Details
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="Full Name"
                  required
                  value={formData.fullName}
                  onChange={(e) => handleChange("fullName", e.target.value)}
                />
                <Input
                  label="Email Address"
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => handleChange("email", e.target.value)}
                />
                <Input
                  label="Phone Number"
                  required
                  value={formData.phone}
                  onChange={(e) => handleChange("phone", e.target.value)}
                />
                <Select
                  label="Gender"
                  required
                  value={formData.gender}
                  onChange={(e) => handleChange("gender", e.target.value)}
                  options={["Female", "Male", "Other"]}
                />
                <Input
                  label="Date of Birth"
                  type="date"
                  required
                  value={formData.dob}
                  onChange={(e) => handleChange("dob", e.target.value)}
                />
                <Input
                  label="Home District"
                  required
                  value={formData.district}
                  onChange={(e) => handleChange("district", e.target.value)}
                />
                <Input
                  label="National ID Number (NIN)"
                  required
                  value={formData.nin}
                  onChange={(e) => handleChange("nin", e.target.value)}
                  placeholder="CM..."
                />
              </div>
            </motion.div>
          )}

          {currentStep === 2 && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-5"
            >
              <h3 className="text-lg font-bold text-slate-800 dark:text-white border-b pb-3 border-slate-100 dark:border-slate-700">
                Step 2: Academic Details
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Select
                  label="Current Qualification"
                  required
                  value={formData.qualification}
                  onChange={(e) => handleChange("qualification", e.target.value)}
                  options={["Certificate", "Diploma", "Bachelor's Degree", "Master's Degree"]}
                />
                <Input
                  label="Course / Program of Study"
                  required
                  value={formData.course}
                  onChange={(e) => handleChange("course", e.target.value)}
                />
                <Select
                  label="Year of Study"
                  required
                  value={formData.yearOfStudy}
                  onChange={(e) => handleChange("yearOfStudy", e.target.value)}
                  options={["1st Year", "2nd Year", "3rd Year", "4th Year", "Final Year"]}
                />
                <Input
                  label="Current CGPA / GPA"
                  required
                  value={formData.gpa}
                  onChange={(e) => handleChange("gpa", e.target.value)}
                  placeholder="e.g. 4.2"
                />
              </div>
            </motion.div>
          )}

          {currentStep === 3 && (
            <motion.div
              key="step3"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-5"
            >
              <h3 className="text-lg font-bold text-slate-800 dark:text-white border-b pb-3 border-slate-100 dark:border-slate-700">
                Step 3: University Information
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="University / Institution Name"
                  required
                  value={formData.university}
                  onChange={(e) => handleChange("university", e.target.value)}
                />
                <Input
                  label="Student ID / Registration Number"
                  required
                  value={formData.studentId}
                  onChange={(e) => handleChange("studentId", e.target.value)}
                />
                <Input
                  label="Head of Department Name"
                  required
                  value={formData.headOfDept}
                  onChange={(e) => handleChange("headOfDept", e.target.value)}
                />
                <Input
                  label="University Contact Email"
                  type="email"
                  required
                  value={formData.universityEmail}
                  onChange={(e) => handleChange("universityEmail", e.target.value)}
                />
              </div>
            </motion.div>
          )}

          {currentStep === 4 && (
            <motion.div
              key="step4"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-5"
            >
              <h3 className="text-lg font-bold text-slate-800 dark:text-white border-b pb-3 border-slate-100 dark:border-slate-700">
                Step 4: Upload Required Documents
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[
                  { field: "nationalIdDoc", label: "National ID / Passport", desc: "PDF, PNG or JPG copy" },
                  { field: "recommendationDoc", label: "University Recommendation Letter", desc: "Signed letter from Dean/HOD" },
                  { field: "transcriptDoc", label: "Academic Transcript", desc: "Official academic transcript" },
                  { field: "cvDoc", label: "Curriculum Vitae (CV)", desc: "Updated detailed CV" },
                  { field: "coverLetterDoc", label: "Cover Letter", desc: "Addressed to KCCA HR" },
                  { field: "photoDoc", label: "Passport Photo", desc: "Recent passport photo" },
                ].map((doc) => {
                  const val = formData[doc.field];
                  const isUploaded = !!val;
                  const fileName = typeof val === "object" ? val.name : val;
                  const fileSize = typeof val === "object" ? val.size : "";

                  return (
                    <div
                      key={doc.field}
                      className="p-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-700/40 space-y-3"
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-semibold text-xs text-slate-800 dark:text-white">{doc.label}</p>
                          <p className="text-[11px] text-slate-400">{doc.desc}</p>
                        </div>
                        {isUploaded ? (
                          <span className="badge badge-accepted text-[10px] flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3 text-emerald-500" /> Uploaded
                          </span>
                        ) : (
                          <span className="text-[10px] text-slate-400 font-medium">Pending</span>
                        )}
                      </div>

                      <div className="flex items-center justify-between gap-2 pt-1 border-t border-slate-100 dark:border-slate-700/50">
                        <label className="btn btn-outline btn-xs cursor-pointer flex items-center gap-1">
                          <Upload className="w-3 h-3" /> {isUploaded ? "Replace File" : "Select File"}
                          <input
                            type="file"
                            accept=".pdf,.png,.jpg,.jpeg,.doc,.docx"
                            className="hidden"
                            onChange={(e) => handleFileUpload(doc.field, e)}
                          />
                        </label>
                        {isUploaded && (
                          <span className="text-xs font-semibold text-primary-600 truncate max-w-[150px]" title={fileName}>
                            {fileName} {fileSize && `(${fileSize})`}
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </motion.div>
          )}

          {currentStep === 5 && (
            <motion.div
              key="step5"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <h3 className="text-lg font-bold text-slate-800 dark:text-white border-b pb-3 border-slate-100 dark:border-slate-700">
                Step 5: Review & Submit Application
              </h3>

              <div className="space-y-4 text-sm">
                <div className="p-4 bg-slate-50 dark:bg-slate-700/50 rounded-xl space-y-2">
                  <h4 className="font-bold text-xs text-primary-600 dark:text-primary-400 uppercase">Personal Details</h4>
                  <p><strong>Name:</strong> {formData.fullName}</p>
                  <p><strong>Email:</strong> {formData.email} | <strong>Phone:</strong> {formData.phone}</p>
                  <p><strong>NIN:</strong> {formData.nin} | <strong>District:</strong> {formData.district}</p>
                </div>

                <div className="p-4 bg-slate-50 dark:bg-slate-700/50 rounded-xl space-y-2">
                  <h4 className="font-bold text-xs text-primary-600 dark:text-primary-400 uppercase">Academic Details</h4>
                  <p><strong>Course:</strong> {formData.course} ({formData.qualification})</p>
                  <p><strong>Institution:</strong> {formData.university}</p>
                  <p><strong>Year of Study:</strong> {formData.yearOfStudy} | <strong>GPA:</strong> {formData.gpa}</p>
                </div>

                <div className="p-4 bg-slate-50 dark:bg-slate-700/50 rounded-xl space-y-2">
                  <h4 className="font-bold text-xs text-primary-600 dark:text-primary-400 uppercase">Attached Documents</h4>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <p>✓ National ID</p>
                    <p>✓ Recommendation Letter</p>
                    <p>✓ Academic Transcript</p>
                    <p>✓ Curriculum Vitae</p>
                    <p>✓ Cover Letter</p>
                    <p>✓ Passport Photo</p>
                  </div>
                </div>
              </div>

              <div className="p-4 bg-blue-50 dark:bg-blue-900/20 text-blue-800 dark:text-blue-200 rounded-xl text-xs flex items-start gap-2">
                <CheckCircle2 className="w-5 h-5 text-primary-500 flex-shrink-0 mt-0.5" />
                <p>
                  By submitting this application, you certify that all the provided information and uploaded documents are accurate and authentic according to KCCA policy.
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {}
        <div className="flex items-center justify-between pt-6 mt-6 border-t border-slate-100 dark:border-slate-700">
          {currentStep > 1 ? (
            <Button variant="ghost" size="md" onClick={handlePrev} icon={ArrowLeft}>
              Previous
            </Button>
          ) : (
            <div />
          )}

          {currentStep < 5 ? (
            <Button variant="primary" size="md" onClick={handleNext} iconRight={ArrowRight}>
              Next Step
            </Button>
          ) : (
            <Button
              variant="secondary"
              size="md"
              onClick={handleSubmit}
              loading={submitting}
              icon={Send}
            >
              Submit Application
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ApplyWizard;
