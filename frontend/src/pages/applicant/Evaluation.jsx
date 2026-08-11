
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";
import Breadcrumbs from "../../components/layout/Breadcrumbs";
import Skeleton from "../../components/ui/Skeleton";
import useApi from "../../hooks/useApi";
import { evaluationService } from "../../api/services";
import {
  Star, ClipboardCheck, CheckCircle2, ThumbsUp, ThumbsDown,
  Lightbulb, AlertTriangle, MessageSquare, Send, Lock,
} from "lucide-react";

// ---------------------------------------------------------------------------
// Star Rating Input
// ---------------------------------------------------------------------------
const StarRating = ({ value, onChange, disabled }) => (
  <div className="flex gap-1">
    {[1, 2, 3, 4, 5].map((star) => (
      <button
        key={star}
        type="button"
        disabled={disabled}
        onClick={() => !disabled && onChange(star)}
        className={`transition-all duration-150 ${disabled ? "cursor-default" : "hover:scale-110 cursor-pointer"}`}
      >
        <Star
          className={`w-8 h-8 transition-colors duration-150 ${
            star <= value
              ? "fill-yellow-400 text-yellow-400"
              : "fill-none text-slate-300 dark:text-slate-600"
          }`}
        />
      </button>
    ))}
  </div>
);

// Static star display for read-only
const StarDisplay = ({ value, size = "sm" }) => {
  const cls = size === "lg" ? "w-6 h-6" : "w-4 h-4";
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={`${cls} ${
            star <= value ? "fill-yellow-400 text-yellow-400" : "fill-none text-slate-300 dark:text-slate-600"
          }`}
        />
      ))}
    </div>
  );
};

const ratingLabels = ["", "Poor", "Fair", "Good", "Very Good", "Excellent"];

const ratingFields = [
  { key: "overallRating",      label: "Overall Experience",      icon: Star,         description: "How would you rate your overall internship experience?" },
  { key: "supervisorRating",   label: "Supervisor Support",      icon: ClipboardCheck, description: "Was your supervisor supportive, approachable, and helpful?" },
  { key: "learningRating",     label: "Learning Opportunities",  icon: Lightbulb,    description: "Did the internship provide valuable learning and growth?" },
  { key: "facilitiesRating",   label: "Facilities & Resources",  icon: CheckCircle2, description: "Were the workspace, tools, and resources adequate?" },
];

// ---------------------------------------------------------------------------
// Main Component
// ---------------------------------------------------------------------------
const EvaluationPage = () => {
  const { data: rawApps, loading: loadingApps } = useApi("/applications");
  const { data: rawMyEvals, loading: loadingEvals, refetch: refetchEvals } = useApi("/evaluations/my");

  const applications = Array.isArray(rawApps) ? rawApps : [];
  const myEvaluations = Array.isArray(rawMyEvals) ? rawMyEvals : [];

  // Accepted / completed applications that can be evaluated
  const evaluatableStatuses = ["accepted", "offer_accepted", "cleared", "completed"];
  const acceptedApps = applications.filter(a =>
    evaluatableStatuses.includes(String(a?.status).toLowerCase())
  );

  // The selected application to evaluate
  const [selectedAppId, setSelectedAppId] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  // Form state
  const [ratings, setRatings] = useState({
    overallRating: 0, supervisorRating: 0, learningRating: 0, facilitiesRating: 0,
  });
  const [wouldRecommend, setWouldRecommend] = useState(true);
  const [highlights, setHighlights] = useState("");
  const [challenges, setChallenges] = useState("");
  const [suggestions, setSuggestions] = useState("");

  // Auto-select first evaluatable app that has no evaluation
  useEffect(() => {
    if (acceptedApps.length > 0 && !selectedAppId) {
      const unevaluated = acceptedApps.find(
        app => !myEvaluations.some(ev => ev.applicationId === app.id || ev.application_id === app.id)
      );
      setSelectedAppId(unevaluated?.id || acceptedApps[0]?.id || "");
    }
  }, [acceptedApps.length, myEvaluations.length]); // eslint-disable-line

  const selectedApp = applications.find(a => a.id === selectedAppId);
  const existingEval = myEvaluations.find(
    ev => ev.applicationId === selectedAppId || ev.application_id === selectedAppId
  );
  const isReadOnly = !!existingEval;

  const allRated = Object.values(ratings).every(v => v > 0);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!allRated) {
      toast.error("Please provide all four star ratings.");
      return;
    }
    if (!selectedApp) {
      toast.error("Please select an internship to evaluate.");
      return;
    }
    setSubmitting(true);
    try {
      await evaluationService.submit({
        applicationId: selectedApp.id,
        internshipId:  selectedApp.internshipId || selectedApp.internship_id,
        ...ratings,
        wouldRecommend,
        highlights:  highlights.trim() || undefined,
        challenges:  challenges.trim() || undefined,
        suggestions: suggestions.trim() || undefined,
      });
      toast.success("🎉 Thank you! Your evaluation has been submitted.");
      setSubmitted(true);
      refetchEvals();
    } catch (err) {
      const msg = err?.response?.data?.message || "Failed to submit evaluation.";
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  // ─── Loading State ───────────────────────────────────────────────────────
  if (loadingApps || loadingEvals) {
    return (
      <div className="page-container">
        <Breadcrumbs />
        <div className="space-y-4">
          <Skeleton className="h-10 w-64 rounded-xl" />
          <Skeleton className="h-48 rounded-2xl" />
          <Skeleton className="h-64 rounded-2xl" />
        </div>
      </div>
    );
  }

  // ─── No eligible applications ────────────────────────────────────────────
  if (acceptedApps.length === 0) {
    return (
      <div className="page-container">
        <Breadcrumbs />
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          className="card p-12 flex flex-col items-center justify-center text-center gap-5 max-w-lg mx-auto mt-10"
        >
          <div className="w-16 h-16 rounded-2xl bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
            <Lock className="w-8 h-8 text-amber-500" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100">Evaluation Not Available</h2>
            <p className="text-slate-500 dark:text-slate-400 mt-2 text-sm leading-relaxed">
              Evaluations become available once your internship application has been accepted and completed.
              Check back here after your internship program is finished.
            </p>
          </div>
        </motion.div>
      </div>
    );
  }

  // ─── Read-only view (already submitted) ─────────────────────────────────
  const displayEval = existingEval;
  const showReadOnly = isReadOnly && displayEval;

  return (
    <div className="page-container">
      <Breadcrumbs />

      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-black text-slate-800 dark:text-slate-100 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-red-500 to-red-700 flex items-center justify-center shadow-md">
            <ClipboardCheck className="w-5 h-5 text-white" />
          </div>
          Internship Evaluation
        </h1>
        <p className="text-slate-500 dark:text-slate-400 mt-1 text-sm">
          Share your experience to help improve the KCCA internship program.
        </p>
      </div>

      {/* Application Selector (multiple accepted apps) */}
      {acceptedApps.length > 1 && (
        <div className="mb-6">
          <label className="form-label">Select Internship to Evaluate</label>
          <select
            className="form-input max-w-md"
            value={selectedAppId}
            onChange={e => setSelectedAppId(e.target.value)}
          >
            {acceptedApps.map(app => {
              const hasEval = myEvaluations.some(ev => ev.applicationId === app.id || ev.application_id === app.id);
              return (
                <option key={app.id} value={app.id}>
                  {app.internshipTitle || app.internship_title || app.internshipId} {hasEval ? "✓ Evaluated" : ""}
                </option>
              );
            })}
          </select>
        </div>
      )}

      <AnimatePresence mode="wait">
        {/* ── READ-ONLY submitted view ── */}
        {showReadOnly ? (
          <motion.div
            key="readonly"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="space-y-5"
          >
            {/* Success Banner */}
            <div className="rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 p-5 text-white flex items-center gap-4 shadow-lg">
              <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center flex-shrink-0">
                <CheckCircle2 className="w-7 h-7 text-emerald-100" />
              </div>
              <div>
                <p className="font-bold text-lg">Evaluation Submitted</p>
                <p className="text-emerald-100 text-sm">
                  Thank you for your feedback! It was submitted on{" "}
                  {displayEval.submittedAt
                    ? new Date(displayEval.submittedAt).toLocaleDateString("en-UG", { day: "numeric", month: "long", year: "numeric" })
                    : "—"}
                </p>
              </div>
            </div>

            {/* Ratings display */}
            <div className="card p-6">
              <h3 className="text-base font-bold text-slate-700 dark:text-slate-200 mb-5">Your Ratings</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                {ratingFields.map(({ key, label }) => {
                  const camelKey = key;
                  const snakeKey = key.replace(/([A-Z])/g, "_$1").toLowerCase();
                  const val = displayEval[camelKey] ?? displayEval[snakeKey] ?? 0;
                  return (
                    <div key={key} className="flex items-center justify-between p-4 rounded-xl bg-slate-50 dark:bg-slate-700/40 border border-slate-100 dark:border-slate-700">
                      <span className="text-sm font-semibold text-slate-600 dark:text-slate-300">{label}</span>
                      <div className="flex items-center gap-2">
                        <StarDisplay value={val} />
                        <span className="text-xs text-slate-400 font-medium min-w-[54px]">{ratingLabels[val] || ""}</span>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Recommendation */}
              <div className="mt-5 flex items-center gap-3 p-4 rounded-xl bg-slate-50 dark:bg-slate-700/40 border border-slate-100 dark:border-slate-700">
                {(displayEval.wouldRecommend ?? displayEval.would_recommend) ? (
                  <><ThumbsUp className="w-5 h-5 text-emerald-500" /><span className="text-sm font-semibold text-slate-600 dark:text-slate-300">Would Recommend</span></>
                ) : (
                  <><ThumbsDown className="w-5 h-5 text-red-500" /><span className="text-sm font-semibold text-slate-600 dark:text-slate-300">Would Not Recommend</span></>
                )}
              </div>
            </div>

            {/* Open responses */}
            <div className="card p-6 space-y-5">
              <h3 className="text-base font-bold text-slate-700 dark:text-slate-200 mb-2">Your Feedback</h3>
              {[
                { label: "Highlights", icon: Star, value: displayEval.highlights },
                { label: "Challenges", icon: AlertTriangle, value: displayEval.challenges },
                { label: "Suggestions", icon: MessageSquare, value: displayEval.suggestions },
              ].map(({ label, icon: Icon, value }) => (
                <div key={label}>
                  <div className="flex items-center gap-2 mb-2">
                    <Icon className="w-4 h-4 text-red-500" />
                    <span className="text-sm font-semibold text-slate-600 dark:text-slate-300">{label}</span>
                  </div>
                  <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed pl-6">
                    {value || <span className="italic text-slate-400">Not provided</span>}
                  </p>
                </div>
              ))}
            </div>
          </motion.div>
        ) : (
          /* ── FORM view ── */
          <motion.form
            key="form"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            onSubmit={handleSubmit}
            className="space-y-6"
          >
            {/* Internship context card */}
            {selectedApp && (
              <div className="card p-5 flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-red-100 dark:bg-red-900/30 flex items-center justify-center flex-shrink-0">
                  <ClipboardCheck className="w-6 h-6 text-red-600" />
                </div>
                <div>
                  <p className="font-bold text-slate-700 dark:text-slate-200">
                    {selectedApp.internshipTitle || selectedApp.internship_title || "Internship"}
                  </p>
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    {selectedApp.department || "KCCA"} · Application #{selectedApp.id}
                  </p>
                </div>
              </div>
            )}

            {/* Star Ratings */}
            <div className="card p-6">
              <h3 className="text-base font-bold text-slate-700 dark:text-slate-200 mb-5 flex items-center gap-2">
                <Star className="w-4 h-4 text-yellow-400" /> Rate Your Experience
              </h3>
              <div className="space-y-6">
                {ratingFields.map(({ key, label, icon: Icon, description }) => (
                  <div key={key} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-4 rounded-xl border border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50">
                    <div className="flex items-start gap-3 flex-1">
                      <div className="w-9 h-9 rounded-lg bg-red-100 dark:bg-red-900/30 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <Icon className="w-4 h-4 text-red-600" />
                      </div>
                      <div>
                        <p className="font-semibold text-sm text-slate-700 dark:text-slate-200">{label}</p>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{description}</p>
                      </div>
                    </div>
                    <div className="flex flex-col items-start sm:items-end gap-1 pl-12 sm:pl-0">
                      <StarRating
                        value={ratings[key]}
                        onChange={(v) => setRatings(prev => ({ ...prev, [key]: v }))}
                      />
                      {ratings[key] > 0 && (
                        <span className="text-xs font-semibold text-yellow-600 dark:text-yellow-400">
                          {ratingLabels[ratings[key]]}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Recommendation */}
            <div className="card p-6">
              <h3 className="text-base font-bold text-slate-700 dark:text-slate-200 mb-4">
                Would you recommend this internship?
              </h3>
              <div className="flex gap-4">
                <button
                  type="button"
                  onClick={() => setWouldRecommend(true)}
                  className={`flex-1 flex flex-col items-center gap-2 p-5 rounded-2xl border-2 transition-all duration-200 ${
                    wouldRecommend
                      ? "border-emerald-500 bg-emerald-50 dark:bg-emerald-900/30 shadow-md"
                      : "border-slate-200 dark:border-slate-600 hover:border-emerald-300 bg-white dark:bg-slate-800/50"
                  }`}
                >
                  <ThumbsUp className={`w-7 h-7 ${wouldRecommend ? "text-emerald-500" : "text-slate-400"}`} />
                  <span className={`font-semibold text-sm ${wouldRecommend ? "text-emerald-700 dark:text-emerald-400" : "text-slate-500"}`}>
                    Yes, definitely!
                  </span>
                </button>
                <button
                  type="button"
                  onClick={() => setWouldRecommend(false)}
                  className={`flex-1 flex flex-col items-center gap-2 p-5 rounded-2xl border-2 transition-all duration-200 ${
                    !wouldRecommend
                      ? "border-red-400 bg-red-50 dark:bg-red-900/30 shadow-md"
                      : "border-slate-200 dark:border-slate-600 hover:border-red-300 bg-white dark:bg-slate-800/50"
                  }`}
                >
                  <ThumbsDown className={`w-7 h-7 ${!wouldRecommend ? "text-red-500" : "text-slate-400"}`} />
                  <span className={`font-semibold text-sm ${!wouldRecommend ? "text-red-600 dark:text-red-400" : "text-slate-500"}`}>
                    Not really
                  </span>
                </button>
              </div>
            </div>

            {/* Open-ended Feedback */}
            <div className="card p-6 space-y-5">
              <h3 className="text-base font-bold text-slate-700 dark:text-slate-200 flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-red-500" /> Written Feedback
                <span className="text-xs font-normal text-slate-400 ml-1">(optional)</span>
              </h3>

              <div>
                <label className="form-label flex items-center gap-2">
                  <Star className="w-3.5 h-3.5 text-yellow-400" /> Highlights
                </label>
                <textarea
                  className="form-input resize-none"
                  rows={3}
                  placeholder="What did you enjoy most? Any stand-out moments or achievements?"
                  value={highlights}
                  onChange={e => setHighlights(e.target.value)}
                  maxLength={1000}
                />
              </div>

              <div>
                <label className="form-label flex items-center gap-2">
                  <AlertTriangle className="w-3.5 h-3.5 text-orange-400" /> Challenges
                </label>
                <textarea
                  className="form-input resize-none"
                  rows={3}
                  placeholder="What difficulties or obstacles did you encounter?"
                  value={challenges}
                  onChange={e => setChallenges(e.target.value)}
                  maxLength={1000}
                />
              </div>

              <div>
                <label className="form-label flex items-center gap-2">
                  <Lightbulb className="w-3.5 h-3.5 text-blue-400" /> Suggestions
                </label>
                <textarea
                  className="form-input resize-none"
                  rows={3}
                  placeholder="How could the internship program be improved?"
                  value={suggestions}
                  onChange={e => setSuggestions(e.target.value)}
                  maxLength={1000}
                />
              </div>
            </div>

            {/* Submit */}
            <motion.button
              type="submit"
              disabled={submitting || !allRated}
              whileHover={!submitting && allRated ? { scale: 1.01 } : {}}
              whileTap={!submitting && allRated ? { scale: 0.99 } : {}}
              className={`w-full flex items-center justify-center gap-3 py-4 rounded-2xl font-bold text-base transition-all duration-200 shadow-lg
                ${allRated && !submitting
                  ? "bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white"
                  : "bg-slate-200 dark:bg-slate-700 text-slate-400 cursor-not-allowed"
                }`}
            >
              {submitting ? (
                <><div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />Submitting...</>
              ) : (
                <><Send className="w-5 h-5" />Submit Evaluation</>
              )}
            </motion.button>

            {!allRated && (
              <p className="text-center text-xs text-slate-400">Please complete all four star ratings to submit.</p>
            )}
          </motion.form>
        )}
      </AnimatePresence>
    </div>
  );
};

export default EvaluationPage;
