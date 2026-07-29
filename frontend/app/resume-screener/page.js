"use client";

import { useState } from "react";
import { UploadCloud, FileText, CheckCircle, AlertCircle, Loader2, Sparkles, TrendingUp, AlertTriangle, Lightbulb, Award } from "lucide-react";

// ------------------------------------------------------------------
// PARSER
// Splits the raw streamed text into structured sections.
// ------------------------------------------------------------------
function parseResult(text) {
  if (!text) {
    return { score: null, strengths: [], improvements: [], missing: [], recommendations: [] };
  }

  // Extract bullet points from a chunk of text.
  const extractBullets = (chunk) => {
    if (!chunk) return [];
    return chunk
      .split("\n")
      .map((line) => line.trim())
      .filter((line) => line.startsWith("-") || line.startsWith("•"))
      .map((line) => line.replace(/^[-•]\s*/, "").trim())
      .filter(Boolean);
  };

  // Section keyword patterns, in the order they usually appear.
  // Each entry: { key, regex } — regex marks where that section starts.
  const sectionDefs = [
    { key: "strengths", regex: /(##\s*)?\(?1\)?[.)]?\s*|Strengths/i },
    { key: "improvements", regex: /(##\s*)?\(?2\)?[.)]?\s*|Improvements?\s*needed|Improvements?/i },
    { key: "missing", regex: /(##\s*)?\(?3\)?[.)]?\s*|Missing\s*Skills|Missing/i },
    { key: "atsScore", regex: /(##\s*)?\(?4\)?[.)]?\s*|ATS\s*score|score\s*out\s*of\s*10/i },
    { key: "recommendations", regex: /(##\s*)?\(?5\)?[.)]?\s*|Recommendations?/i },
  ];

  // Find the first match index for each keyword type, searching in order
  // so we don't re-match the same "1)" style token across sections.
  const keywordFinders = [
    { key: "strengths", regex: /strengths/i },
    { key: "improvements", regex: /improvements?\s*needed|improvements?/i },
    { key: "missing", regex: /missing\s*skills|missing/i },
    { key: "atsScore", regex: /ats\s*score|score\s*out\s*of\s*10/i },
    { key: "recommendations", regex: /recommendations?/i },
  ];

  const found = [];
  keywordFinders.forEach(({ key, regex }) => {
    const match = text.match(regex);
    if (match && match.index !== undefined) {
      found.push({ key, index: match.index });
    }
  });

  // Sort by where they actually appear in the text.
  found.sort((a, b) => a.index - b.index);

  // Build slices between consecutive found sections.
  const slices = {};
  found.forEach((item, i) => {
    const start = item.index;
    const end = i + 1 < found.length ? found[i + 1].index : text.length;
    slices[item.key] = text.slice(start, end);
  });

  const strengths = extractBullets(slices.strengths);
  const improvements = extractBullets(slices.improvements);
  const missing = extractBullets(slices.missing);
  const recommendations = extractBullets(slices.recommendations);

  // ATS score — look across the ats slice first, fall back to full text.
  const scoreSource = slices.atsScore || text;
  const scoreMatch = scoreSource.match(/(\d+)\s*out\s*of\s*10/i) || text.match(/(\d+)\s*out\s*of\s*10/i);
  const score = scoreMatch ? parseInt(scoreMatch[1], 10) : null;

  return { score, strengths, improvements, missing, recommendations };
}

// ------------------------------------------------------------------
// Small presentational helpers
// ------------------------------------------------------------------
function SectionCard({ icon: Icon, title, items, colorClasses, delay }) {
  if (!items || items.length === 0) return null;

  return (
    <div
      className={`bg-white rounded-2xl shadow-lg border border-slate-200 border-l-4 ${colorClasses.border} p-6 animate-fadeIn opacity-0`}
      style={{ animationDelay: `${delay}ms`, animationFillMode: "forwards" }}
    >
      <div className="flex items-center gap-3 mb-4">
        <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${colorClasses.iconBg}`}>
          <Icon className={`w-5 h-5 ${colorClasses.iconText}`} />
        </div>
        <h4 className={`text-lg font-bold ${colorClasses.heading}`}>{title}</h4>
      </div>
      <div className="space-y-2.5">
        {items.map((item, idx) => (
          <div
            key={idx}
            className="flex items-start gap-3 animate-fadeIn opacity-0"
            style={{ animationDelay: `${delay + (idx + 1) * 80}ms`, animationFillMode: "forwards" }}
          >
            <span className={`mt-1.5 w-1.5 h-1.5 rounded-full shrink-0 ${colorClasses.dot}`} />
            <p className="text-slate-700 text-sm leading-relaxed">{item}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function Home() {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [streamedText, setStreamedText] = useState('');

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];

      const maxSize = 10 * 1024 * 1024;
      if (selectedFile.size > maxSize) {
        setError("File size exceeds 10MB limit. Please select a smaller file.");
        return;
      }

      const allowedTypes = ["application/pdf", "text/plain"];
      if (!allowedTypes.includes(selectedFile.type)) {
        setError("Invalid file type. Please upload PDF or TXT files only.");
        return;
      }

      setFile(selectedFile);
      setError(null);
      setResult(null);
      setStreamedText('');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!file) {
      setError("Please select a file first.");
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);
    setStreamedText('');

    const formData = new FormData();
    formData.append("file", file);

    try {
      const token = localStorage.getItem('access_token');

      const response = await fetch("http://localhost:8000/api/v1/resume/upload/stream", {
        method: "POST",
        headers: {
          ...(token && { 'Authorization': `Bearer ${token}` }),
        },
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || "Failed to analyze resume");
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      setLoading(false);

      let fullText = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split('\n');

        for (const line of lines) {
          if (line.startsWith('data: ') && line !== 'data: [DONE]') {
            const text = line.replace('data: ', '');
            fullText += text;
            setStreamedText(fullText);
            await new Promise(resolve => setTimeout(resolve, 30));
          }
        }
      }

      setResult(fullText);

    } catch (err) {
      console.error("Upload error:", err);
      setError("Error analyzing resume: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const parsed = result ? parseResult(result) : null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100 py-12 px-4">

      <div className="max-w-5xl mx-auto">

        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-blue-600 rounded-2xl mb-4 shadow-lg">
            <Sparkles className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-5xl font-bold text-slate-800 mb-3">
            AI Resume Analyzer
          </h1>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto">
            Get instant, professional feedback on your resume powered by advanced AI
          </p>
        </div>

        {/* Upload Card */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-slate-200 mb-8">
          <div className="p-8">
            <form onSubmit={handleSubmit} className="space-y-6">

              {/* File Upload */}
              <div className="relative border-2 border-dashed border-slate-300 rounded-xl p-12 hover:border-blue-500 hover:bg-blue-50/50 transition-all duration-300 text-center cursor-pointer group">
                <input
                  type="file"
                  accept=".pdf,.txt,application/pdf,text/plain"
                  onChange={handleFileChange}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  disabled={loading}
                />
                <div className="flex flex-col items-center gap-4">
                  {file ? (
                    <>
                      <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                        <FileText className="w-8 h-8 text-green-600" />
                      </div>
                      <div>
                        <span className="text-xl font-semibold text-slate-700 block">{file.name}</span>
                        <span className="text-sm text-slate-500 block mt-1">{(file.size / 1024).toFixed(2)} KB</span>
                        <span className="text-sm text-green-600 font-medium flex items-center justify-center gap-1 mt-2">
                          <CheckCircle size={16} />
                          Ready to analyze
                        </span>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                        <UploadCloud className="w-8 h-8 text-blue-600" />
                      </div>
                      <div>
                        <span className="text-xl font-semibold text-slate-700 block">
                          Drop your resume here or click to browse
                        </span>
                        <p className="text-sm text-slate-500 mt-2">Supports PDF and TXT files • Max 10MB</p>
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* Error */}
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-xl flex items-center gap-3">
                  <AlertCircle size={20} className="shrink-0" />
                  <span className="font-medium">{error}</span>
                </div>
              )}

              {/* Button */}
              <button
                type="submit"
                disabled={loading || !file}
                className={`w-full py-4 rounded-xl font-bold text-white text-lg transition-all duration-300 flex items-center justify-center gap-3
                  ${loading || !file
                    ? "bg-slate-300 cursor-not-allowed"
                    : "bg-blue-600 hover:bg-blue-700 hover:shadow-lg hover:scale-[1.02] active:scale-[0.98]"
                  }`}
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Processing Resume...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-5 h-5" />
                    Analyze Resume with AI
                  </>
                )}
              </button>
            </form>
          </div>
        </div>

        {/* Streaming Terminal (raw text while streaming, unchanged) */}
        {streamedText && !result && (
          <div className="bg-slate-900 rounded-2xl shadow-xl border border-slate-700 p-6 mb-8">
            <div className="flex items-center gap-2 mb-4">
              <div className="flex gap-1.5">
                <div className="w-3 h-3 rounded-full bg-red-500" />
                <div className="w-3 h-3 rounded-full bg-yellow-500" />
                <div className="w-3 h-3 rounded-full bg-green-500" />
              </div>
              <span className="text-slate-400 text-xs ml-2 font-mono">analyzing_resume.log</span>
              <div className="ml-auto flex items-center gap-2 text-blue-400">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span className="text-xs font-medium">Analyzing...</span>
              </div>
            </div>
            <div className="max-h-[500px] overflow-y-auto">
              <pre className="whitespace-pre-wrap font-mono text-green-400 text-sm leading-relaxed">
                {streamedText}
                <span className="animate-pulse">▋</span>
              </pre>
            </div>
          </div>
        )}

        {/* Structured Result (after stream completes) */}
        {result && parsed && (
          <div className="space-y-6">

            <div className="flex items-center gap-3 mb-2 animate-fadeIn opacity-0" style={{ animationFillMode: "forwards" }}>
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <Award className="w-5 h-5 text-blue-600" />
              </div>
              <h3 className="text-2xl font-bold text-slate-800">Resume Analysis</h3>
              <div className="ml-auto flex items-center gap-2 text-green-600">
                <CheckCircle className="w-4 h-4" />
                <span className="text-sm font-medium">Complete</span>
              </div>
            </div>

            {/* ATS Score card */}
            {parsed.score !== null && (
              <div
                className="rounded-2xl shadow-xl p-10 text-center bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-700 animate-fadeIn opacity-0"
                style={{ animationFillMode: "forwards" }}
              >
                <p className="text-blue-100 font-semibold tracking-wide uppercase text-sm mb-2">
                  ATS Compatibility Score
                </p>
                <div className="flex items-end justify-center gap-1">
                  <span className="text-8xl font-bold text-white leading-none">{parsed.score}</span>
                  <span className="text-3xl font-bold text-blue-200 mb-2">/10</span>
                </div>
              </div>
            )}

            {/* Strengths */}
            <SectionCard
              icon={TrendingUp}
              title="Strengths"
              items={parsed.strengths}
              delay={100}
              colorClasses={{
                border: "border-l-green-500",
                iconBg: "bg-green-100",
                iconText: "text-green-600",
                heading: "text-green-700",
                dot: "bg-green-500",
              }}
            />

            {/* Improvements */}
            <SectionCard
              icon={AlertTriangle}
              title="Improvements Needed"
              items={parsed.improvements}
              delay={200}
              colorClasses={{
                border: "border-l-orange-500",
                iconBg: "bg-orange-100",
                iconText: "text-orange-600",
                heading: "text-orange-700",
                dot: "bg-orange-500",
              }}
            />

            {/* Missing Skills */}
            <SectionCard
              icon={AlertCircle}
              title="Missing Skills"
              items={parsed.missing}
              delay={300}
              colorClasses={{
                border: "border-l-red-500",
                iconBg: "bg-red-100",
                iconText: "text-red-600",
                heading: "text-red-700",
                dot: "bg-red-500",
              }}
            />

            {/* Recommendations */}
            <SectionCard
              icon={Lightbulb}
              title="Recommendations"
              items={parsed.recommendations}
              delay={400}
              colorClasses={{
                border: "border-l-blue-500",
                iconBg: "bg-blue-100",
                iconText: "text-blue-600",
                heading: "text-blue-700",
                dot: "bg-blue-500",
              }}
            />

            {/* Fallback: nothing parsed at all */}
            {parsed.score === null &&
              parsed.strengths.length === 0 &&
              parsed.improvements.length === 0 &&
              parsed.missing.length === 0 &&
              parsed.recommendations.length === 0 && (
                <div className="bg-white rounded-2xl shadow-xl border border-slate-200 p-8">
                  <div className="bg-slate-50 rounded-xl p-6 border border-slate-200 max-h-[600px] overflow-y-auto">
                    <pre className="whitespace-pre-wrap font-sans text-slate-700 leading-relaxed text-sm">
                      {result}
                    </pre>
                  </div>
                </div>
            )}
          </div>
        )}

      </div>

      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeIn {
          animation: fadeIn 0.6s ease-out;
        }
      `}</style>
    </div>
  );
}