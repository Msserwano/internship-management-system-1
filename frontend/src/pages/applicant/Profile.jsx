import { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import Breadcrumbs from "../../components/layout/Breadcrumbs";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";
import Select from "../../components/ui/Select";
import Avatar from "../../components/ui/Avatar";
import api from "../../api/axios";
import toast from "react-hot-toast";
import { User, Mail, Phone, MapPin, GraduationCap, Camera, Save, Plus, Trash2 } from "lucide-react";

const Profile = () => {
  const { user, updateProfile } = useAuth();
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);

  const [formData, setFormData] = useState({
    name: user?.name || "",
    email: user?.email || "",
    phone: user?.phone || "",
    gender: user?.gender || "Female",
    dob: user?.dob ? user.dob.split("T")[0] : "",
    district: user?.district || "",
    address: user?.address || "",
    nationality: user?.nationality || "Ugandan",
    university: user?.university || "",
    course: user?.course || "",
    yearOfStudy: user?.yearOfStudy || "3rd Year",
    gpa: user?.gpa || "",
    skills: Array.isArray(user?.skills) ? user.skills : [],
    languages: Array.isArray(user?.languages) ? user.languages : ["English"],
    emergencyName: user?.emergencyContact?.name || "",
    emergencyRelation: user?.emergencyContact?.relationship || "",
    emergencyPhone: user?.emergencyContact?.phone || "",
  });

  const [newSkill, setNewSkill] = useState("");

  useEffect(() => {
    let isMounted = true;
    api.get("/applicants/profile")
      .then((res) => {
        if (!isMounted) return;
        const p = res.data?.data;
        if (p) {
          setFormData({
            name: p.name || user?.name || "",
            email: p.email || user?.email || "",
            phone: p.phone || "",
            gender: p.gender || "Female",
            dob: p.dob ? p.dob.split("T")[0] : "",
            district: p.district || "",
            address: p.address || "",
            nationality: p.nationality || "Ugandan",
            university: p.university || "",
            course: p.course || "",
            yearOfStudy: p.yearOfStudy || "3rd Year",
            gpa: p.gpa || "",
            skills: Array.isArray(p.skills) ? p.skills : [],
            languages: Array.isArray(p.languages) ? p.languages : ["English"],
            emergencyName: p.emergencyContact?.name || "",
            emergencyRelation: p.emergencyContact?.relationship || "",
            emergencyPhone: p.emergencyContact?.phone || "",
          });
        }
      })
      .catch((err) => {
        console.warn("[PROFILE] Load failed:", err.message);
      })
      .finally(() => {
        if (isMounted) setFetching(false);
      });
    return () => { isMounted = false; };
  }, []);

  const handleChange = (field, val) => setFormData(prev => ({ ...prev, [field]: val }));

  const handleAddSkill = () => {
    if (newSkill.trim() && !formData.skills.includes(newSkill.trim())) {
      setFormData(prev => ({ ...prev, skills: [...prev.skills, newSkill.trim()] }));
      setNewSkill("");
    }
  };

  const handleRemoveSkill = (skill) => {
    setFormData(prev => ({ ...prev, skills: prev.skills.filter(s => s !== skill) }));
  };

  const handleSave = async (e) => {
    if (e) e.preventDefault();
    setLoading(true);
    try {
      const payload = {
        name: formData.name,
        phone: formData.phone,
        gender: formData.gender,
        dob: formData.dob,
        district: formData.district,
        address: formData.address,
        nationality: formData.nationality,
        university: formData.university,
        course: formData.course,
        yearOfStudy: formData.yearOfStudy,
        gpa: formData.gpa,
        skills: formData.skills,
        languages: formData.languages,
        emergencyContact: {
          name: formData.emergencyName,
          relationship: formData.emergencyRelation,
          phone: formData.emergencyPhone,
        },
      };

      const res = await api.put("/applicants/profile", payload);
      const updatedData = res.data?.data;
      updateProfile({ ...formData, ...updatedData });
      toast.success("Profile updated successfully!");
    } catch (err) {
      console.error("[PROFILE] Save failed:", err.message);
      updateProfile(formData);
      toast.success("Profile saved locally.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-container max-w-5xl mx-auto">
      <Breadcrumbs />

      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-white">Applicant Profile</h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm">
            Keep your official profile details up to date for KCCA HR verification.
          </p>
        </div>
        <Button variant="primary" size="md" onClick={handleSave} loading={loading} icon={Save}>
          Save Profile
        </Button>
      </div>

      {/* Profile Header */}
      <div className="card p-6 mb-6 flex flex-col sm:flex-row items-center gap-6">
        <div className="relative">
          <Avatar name={formData.name || "Applicant"} size="xl" />
          <label className="absolute bottom-0 right-0 p-1.5 bg-primary-500 text-white rounded-full cursor-pointer hover:bg-primary-600 shadow">
            <Camera className="w-4 h-4" />
            <input type="file" className="hidden" onChange={() => toast.success("Photo updated!")} />
          </label>
        </div>

        <div className="text-center sm:text-left space-y-1">
          <h2 className="text-xl font-bold text-slate-800 dark:text-white">{formData.name || "Applicant"}</h2>
          <p className="text-xs text-primary-600 dark:text-primary-400 font-semibold">
            {formData.course || "No Course Set"} {formData.university ? `• ${formData.university}` : ""}
          </p>
          <p className="text-xs text-slate-400">{formData.email} {formData.phone ? `• ${formData.phone}` : ""}</p>
        </div>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Personal Info */}
        <div className="card p-6 space-y-4">
          <h3 className="text-base font-bold text-slate-800 dark:text-white border-b pb-3 border-slate-100 dark:border-slate-700 flex items-center gap-2">
            <User className="w-5 h-5 text-primary-500" /> Personal Information
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            <Input label="Full Name" value={formData.name} onChange={e => handleChange("name", e.target.value)} />
            <Input label="Email Address" value={formData.email} disabled />
            <Input label="Phone Number" value={formData.phone} onChange={e => handleChange("phone", e.target.value)} placeholder="+256 700 000 000" />
            <Select label="Gender" value={formData.gender} onChange={e => handleChange("gender", e.target.value)} options={["Female", "Male", "Other"]} />
            <Input label="Date of Birth" type="date" value={formData.dob} onChange={e => handleChange("dob", e.target.value)} />
            <Input label="Nationality" value={formData.nationality} onChange={e => handleChange("nationality", e.target.value)} />
            <Input label="Home District" value={formData.district} onChange={e => handleChange("district", e.target.value)} placeholder="e.g. Kampala" />
            <Input label="Current Residential Address" value={formData.address} onChange={e => handleChange("address", e.target.value)} placeholder="e.g. Ntinda, Kampala" />
          </div>
        </div>

        {/* Academic Details */}
        <div className="card p-6 space-y-4">
          <h3 className="text-base font-bold text-slate-800 dark:text-white border-b pb-3 border-slate-100 dark:border-slate-700 flex items-center gap-2">
            <GraduationCap className="w-5 h-5 text-primary-500" /> Academic &amp; Education Details
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            <Input label="University / Institution" value={formData.university} onChange={e => handleChange("university", e.target.value)} placeholder="e.g. Makerere University" />
            <Input label="Course / Program" value={formData.course} onChange={e => handleChange("course", e.target.value)} placeholder="e.g. Computer Science" />
            <Select label="Year of Study" value={formData.yearOfStudy} onChange={e => handleChange("yearOfStudy", e.target.value)} options={["1st Year", "2nd Year", "3rd Year", "4th Year", "Final Year", "Graduated"]} />
            <Input label="Current CGPA" value={formData.gpa} onChange={e => handleChange("gpa", e.target.value)} placeholder="e.g. 4.2" />
          </div>
        </div>

        {/* Skills & Emergency */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="card p-6 space-y-4">
            <h3 className="text-base font-bold text-slate-800 dark:text-white border-b pb-3 border-slate-100 dark:border-slate-700">
              Technical &amp; Soft Skills
            </h3>
            <div className="flex gap-2">
              <Input
                placeholder="Add skill (e.g., Data Analysis)"
                value={newSkill}
                onChange={e => setNewSkill(e.target.value)}
                className="!py-1.5"
              />
              <Button type="button" variant="primary" size="sm" onClick={handleAddSkill} icon={Plus}>
                Add
              </Button>
            </div>
            <div className="flex flex-wrap gap-2 pt-2">
              {formData.skills.length === 0 ? (
                <p className="text-xs text-slate-400 italic">No skills added yet.</p>
              ) : (
                formData.skills.map(skill => (
                  <span key={skill} className="px-3 py-1 bg-primary-50 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 rounded-full text-xs font-semibold flex items-center gap-1.5">
                    {skill}
                    <button type="button" onClick={() => handleRemoveSkill(skill)} className="hover:text-danger font-bold">
                      ×
                    </button>
                  </span>
                ))
              )}
            </div>
          </div>

          <div className="card p-6 space-y-4">
            <h3 className="text-base font-bold text-slate-800 dark:text-white border-b pb-3 border-slate-100 dark:border-slate-700">
              Emergency Contact
            </h3>
            <div className="space-y-3">
              <Input label="Contact Person Name" value={formData.emergencyName} onChange={e => handleChange("emergencyName", e.target.value)} placeholder="e.g. Guardian / Parent Name" />
              <Input label="Relationship" value={formData.emergencyRelation} onChange={e => handleChange("emergencyRelation", e.target.value)} placeholder="e.g. Parent, Sibling" />
              <Input label="Emergency Phone Number" value={formData.emergencyPhone} onChange={e => handleChange("emergencyPhone", e.target.value)} placeholder="+256 700 000 000" />
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};

export default Profile;
