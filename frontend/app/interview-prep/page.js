"use client";

import { useState } from "react";
import ReactMarkdown from "react-markdown";
import {
  Loader2,
  Sparkles,
  FileText,
  Target,
  HelpCircle,
  Mail,
  CheckCircle,
} from "lucide-react";

const STEP_CONFIG = {
  fetch_resume: {
    title: "Reading Your Resume",
    icon: FileText,
    color: "blue",
  },
  research_job: {
    title: "Researching the Job",
    icon: Sparkles,
    color: "purple",
  },
  gap_analysis: {
    title: "Analyzing Skill Gaps",
    icon: Target,
    color: "orange",
  },
  generate_questions: {
    title: "Generating Interview Questions",
    icon: HelpCircle,
    color: "green",
  },
  write_email: {
    title: "Drafting Your Application Email",
    icon: Mail,
    color: "indigo",
  },
};

const STEP_ORDER = [
  "fetch_resume",
  "research_job",
  "gap_analysis",
  "generate_questions",
  "write_email",
];

const COLOR_MAP = {
  blue: {
    bg: "bg-blue-50",
    border: "border-blue-300",
    icon: "bg-blue-100 text-blue-600",
    badge: "bg-blue-100 text-blue-700",
    dot: "bg-blue-500",
  },
  purple: {
    bg: "bg-purple-50",
    border: "border-purple-300",
    icon: "bg-purple-100 text-purple-600",
    badge: "bg-purple-100 text-purple-700",
    dot: "bg-purple-500",
  },
  orange: {
    bg: "bg-orange-50",
    border: "border-orange-300",
    icon: "bg-orange-100 text-orange-600",
    badge: "bg-orange-100 text-orange-700",
    dot: "bg-orange-500",
  },
  green: {
    bg: "bg-green-50",
    border: "border-green-300",
    icon: "bg-green-100 text-green-600",
    badge: "bg-green-100 text-green-700",
    dot: "bg-green-500",
  },
  indigo: {
    bg: "bg-indigo-50",
    border: "border-indigo-300",
    icon: "bg-indigo-100 text-indigo-600",
    badge: "bg-indigo-100 text-indigo-700",
    dot: "bg-indigo-500",
  },
};

function StepCard({ stepKey, result, isActive }) {
  const config = STEP_CONFIG[stepKey];
  const Icon = config.icon;
  const colors = COLOR_MAP[config.color];
  const isDone = !!result;
  const contentKey = Object.keys(result || {})[0];
  const content = result?.[contentKey];

  return (
    <div
      className={`rounded-2xl border-2 p-6 transition-all duration-500 ${
        isDone
          ? `${colors.bg} ${colors.border}`
          : isActive
          ? "bg-white border-slate-300 animate-pulse"
          : "bg-white border-slate-200"
      }`}
    >
      {/* Header */}
      <div className="flex items-center gap-3 mb-4">
        <div
          className={`w-10 h-10 rounded-xl flex items-center justify-center ${
            isDone ? colors.icon : "bg-slate-100 text-slate-400"
          }`}
        >
          {isDone ? (
            <CheckCircle className="w-5 h-5" />
          ) : (
            <Icon className="w-5 h-5" />
          )}
        </div>
        <div className="flex-1">
          <h3 className="font-bold text-slate-800 text-base">{config.title}</h3>
          {isDone && (
            <span
              className={`text-xs font-medium px-2 py-0.5 rounded-full ${colors.badge}`}
            >
              Complete
            </span>
          )}
        </div>
        {isActive && !isDone && (
          <Loader2 className="w-5 h-5 animate-spin text-blue-500" />
        )}
      </div>

      {/* Content */}
      {isDone && content && (
        <div className="prose prose-sm max-w-none text-slate-700 leading-relaxed">
          <ReactMarkdown>{content}</ReactMarkdown>
        </div>
      )}
    </div>
  );
}

export default function InterviewPrepPage() {
  const [company, setCompany] = useState("");
  const [role, setRole] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [completedSteps, setCompletedSteps] = useState({});
  const [activeStep, setActiveStep] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!company || !role) {
      setError("Please enter both company and role.");
      return;
    }

    setLoading(true);
    setError(null);
    setCompletedSteps({});
    setActiveStep("fetch_resume");

    try {
      const token = localStorage.getItem("token");

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/v1/interview-prep/generate`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...(token && { Authorization: `Bearer ${token}` }),
          },
          body: JSON.stringify({ company, role }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to start interview prep");
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split("\n");

        for (const line of lines) {
          if (line.startsWith("data: ") && line !== "data: [DONE]") {
            const jsonText = line.replace("data: ", "");
            try {
              const parsed = JSON.parse(jsonText);
              if (parsed.step) {
                // set active next step
                const currentIndex = STEP_ORDER.indexOf(parsed.step);
                const nextStep = STEP_ORDER[currentIndex + 1] || null;

                setCompletedSteps((prev) => ({
                  ...prev,
                  [parsed.step]: parsed.result,
                }));

                setActiveStep(nextStep);

                // delay between steps for smooth feel
                await new Promise((resolve) => setTimeout(resolve, 600));
              }
            } catch (err) {
              console.error("Failed to parse step:", err);
            }
          }
        }
      }
    } catch (err) {
      setError("Error: " + err.message);
    } finally {
      setLoading(false);
      setActiveStep(null);
    }
  };

  const completedCount = Object.keys(completedSteps).length;
  const totalSteps = STEP_ORDER.length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100 py-12 px-4">
      <div className="max-w-3xl mx-auto">

        {/* Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-600 rounded-2xl mb-4 shadow-lg">
            <Sparkles className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-slate-800 mb-3">
            Interview Prep Agent
          </h1>
          <p className="text-lg text-slate-600">
            Tell us the role — watch the agent prep you step by step
          </p>
        </div>

        {/* Input Card */}
        <div className="bg-white rounded-2xl shadow-xl border border-slate-200 p-8 mb-8">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Company
              </label>
              <input
                type="text"
                placeholder="e.g. Google, Amazon, Microsoft"
                value={company}
                onChange={(e) => setCompany(e.target.value)}
                disabled={loading}
                className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 focus:border-blue-500 focus:outline-none transition-colors"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Role
              </label>
              <input
                type="text"
                placeholder="e.g. AI Engineer, DevOps Engineer, Backend Developer"
                value={role}
                onChange={(e) => setRole(e.target.value)}
                disabled={loading}
                className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 focus:border-blue-500 focus:outline-none transition-colors"
              />
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 rounded-xl font-bold text-white bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 transition-all flex items-center justify-center gap-2 text-lg shadow-lg hover:shadow-xl"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Agent is working...
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5" />
                  Start Interview Prep
                </>
              )}
            </button>
          </form>
        </div>

        {/* Progress Bar */}
        {(loading || completedCount > 0) && (
          <div className="bg-white rounded-2xl border border-slate-200 p-4 mb-6 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-semibold text-slate-700">
                Progress
              </span>
              <span className="text-sm font-bold text-blue-600">
                {completedCount}/{totalSteps} steps
              </span>
            </div>
            <div className="w-full bg-slate-100 rounded-full h-3">
              <div
                className="bg-blue-600 h-3 rounded-full transition-all duration-700"
                style={{
                  width: `${(completedCount / totalSteps) * 100}%`,
                }}
              />
            </div>
          </div>
        )}

        {/* Steps */}
        <div className="space-y-4">
          {STEP_ORDER.map((stepKey, index) => {
            const result = completedSteps[stepKey];
            const isDone = !!result;
            const isActive = activeStep === stepKey;

            if (!isDone && !isActive && !loading) return null;
            if (!isDone && !isActive && loading && index > completedCount)
              return null;

            return (
              <StepCard
                key={stepKey}
                stepKey={stepKey}
                result={result}
                isActive={isActive}
              />
            );
          })}
        </div>

        {/* Done Message */}
        {completedCount === totalSteps && (
          <div className="mt-8 bg-green-50 border-2 border-green-300 rounded-2xl p-6 text-center">
            <CheckCircle className="w-12 h-12 text-green-600 mx-auto mb-3" />
            <h3 className="text-xl font-bold text-green-800 mb-1">
              You're ready for the interview!
            </h3>
            <p className="text-green-700 text-sm">
              Review the analysis above and practice your answers.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}