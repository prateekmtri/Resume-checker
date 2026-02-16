"use client";

import { useState } from "react";
import { UploadCloud, FileText, CheckCircle, AlertCircle, Loader2, Sparkles, TrendingUp, AlertTriangle, Lightbulb, Award } from "lucide-react";

export default function Home() {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  // File selection handler
  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      
      // File size check (10MB max)
      const maxSize = 10 * 1024 * 1024; // 10MB in bytes
      if (selectedFile.size > maxSize) {
        setError("File size exceeds 10MB limit. Please select a smaller file.");
        return;
      }

      // File type check
      const allowedTypes = ["application/pdf", "text/plain"];
      if (!allowedTypes.includes(selectedFile.type)) {
        setError("Invalid file type. Please upload PDF or TXT files only.");
        return;
      }

      setFile(selectedFile);
      setError(null);
      setResult(null);
      console.log("✅ File selected:", selectedFile.name, "Size:", (selectedFile.size / 1024).toFixed(2), "KB");
    }
  };

// Form submit (Backend Call)
const handleSubmit = async (e) => {
  e.preventDefault();

  if (!file) {
    setError("Please select a file first.");
    return;
  }

  setLoading(true);
  setError(null);
  setResult(null);

  const formData = new FormData();
  formData.append("file", file);

  console.log("🚀 Starting upload for:", file.name);

  try {
    // ✅ TIMEOUT CONTROLLER ADD KARO (90 seconds)
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 90000); // 90 seconds

    const response = await fetch("https://resume-checker-zhh3.onrender.com/api/v1/resume/upload", {
      method: "POST",
      body: formData,
      signal: controller.signal, // ✅ YE LINE ADD KARO
    });

    clearTimeout(timeoutId); // ✅ YE LINE ADD KARO

    console.log("📡 Response status:", response.status);

    if (!response.ok) {
      let errorMessage = "Failed to connect to the backend.";
      try {
        const errorData = await response.json();
        errorMessage = errorData.detail || errorData.message || errorMessage;
      } catch {
        const errorText = await response.text();
        errorMessage = errorText || `Server error: ${response.status}`;
      }
      
      console.error("❌ Server error:", errorMessage);
      throw new Error(errorMessage);
    }

    const data = await response.json();
    console.log("✅ Response data:", data);
    
    if (data.feedback) {
      setResult(data.feedback);
      console.log("✅ Feedback received successfully");
    } else {
      setError("No feedback received from server.");
      console.warn("⚠️ No feedback in response");
    }

  } catch (err) {
    console.error("❌ Upload error:", err);
    
    let userMessage = "❌ Error analyzing resume. ";
    
    // ✅ TIMEOUT ERROR HANDLING ADD KARO
    if (err.name === 'AbortError') {
      userMessage += "Request timed out after 90 seconds. Server may be loading AI model. Please try again in 2 minutes.";
    } else if (err.message.includes("Failed to fetch") || err.message.includes("NetworkError")) {
      userMessage += "Cannot connect to server. Please check if backend is running.";
    } else if (err.message.includes("timeout")) {
      userMessage += "Request timed out. Please try again.";
    } else {
      userMessage += err.message;
    }
    
    setError(userMessage);
  } finally {
    setLoading(false);
  }
};

  // Parse result into sections
  const parseResult = (text) => {
    if (!text) return null;

    const sections = {
      score: "",
      strengths: [],
      improvements: [],
      missing: [],
      recommendations: [],
      verdict: ""
    };

    const lines = text.split('\n');
    let currentSection = "";

    lines.forEach(line => {
      const trimmedLine = line.trim();
      
      if (trimmedLine.includes('OVERALL SCORE')) {
        const match = trimmedLine.match(/(\d+)\/10/);
        sections.score = match ? match[1] : "";
      } else if (trimmedLine.includes('KEY STRENGTHS')) {
        currentSection = "strengths";
      } else if (trimmedLine.includes('AREAS FOR IMPROVEMENT')) {
        currentSection = "improvements";
      } else if (trimmedLine.includes('MISSING ELEMENTS')) {
        currentSection = "missing";
      } else if (trimmedLine.includes('ACTIONABLE RECOMMENDATIONS')) {
        currentSection = "recommendations";
      } else if (trimmedLine.includes('FINAL VERDICT')) {
        currentSection = "verdict";
      } else if (trimmedLine.startsWith('-')) {
        const content = trimmedLine.replace(/^-\s*/, '').trim();
        if (content && currentSection && currentSection !== "verdict") {
          sections[currentSection].push(content);
        }
      } else if (currentSection === "verdict" && trimmedLine) {
        sections.verdict += trimmedLine + " ";
      }
    });

    // Clean up verdict
    sections.verdict = sections.verdict.trim();

    return sections;
  };

  const parsedResult = result ? parseResult(result) : null;

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
                        <span className="text-xl font-semibold text-slate-700 block">
                          {file.name}
                        </span>
                        <span className="text-sm text-slate-500 block mt-1">
                          {(file.size / 1024).toFixed(2)} KB
                        </span>
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
                        <p className="text-sm text-slate-500 mt-2">
                          Supports PDF and TXT files • Max 10MB
                        </p>
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
                    Analyzing Your Resume...
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

        {/* Result */}
        {parsedResult && (
          <div className="space-y-6 animate-fadeIn">
            
            {/* Score Card */}
            {parsedResult.score && (
              <div className="bg-gradient-to-br from-blue-600 to-blue-700 rounded-2xl p-8 text-white shadow-xl">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-2xl font-bold mb-2">Overall Resume Score</h2>
                    <p className="text-blue-100">AI-powered comprehensive analysis</p>
                  </div>
                  <div className="text-center">
                    <div className="text-6xl font-bold">{parsedResult.score}</div>
                    <div className="text-xl text-blue-100">/10</div>
                  </div>
                </div>
              </div>
            )}

            {/* Strengths */}
            {parsedResult.strengths.length > 0 && (
              <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-8">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                    <TrendingUp className="w-5 h-5 text-green-600" />
                  </div>
                  <h3 className="text-2xl font-bold text-slate-800">Key Strengths</h3>
                </div>
                <div className="space-y-3">
                  {parsedResult.strengths.map((item, idx) => (
                    <div key={idx} className="flex gap-3 p-4 bg-green-50 rounded-lg border border-green-100">
                      <CheckCircle className="w-5 h-5 text-green-600 shrink-0 mt-0.5" />
                      <span className="text-slate-700">{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Improvements */}
            {parsedResult.improvements.length > 0 && (
              <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-8">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                    <AlertTriangle className="w-5 h-5 text-orange-600" />
                  </div>
                  <h3 className="text-2xl font-bold text-slate-800">Areas for Improvement</h3>
                </div>
                <div className="space-y-3">
                  {parsedResult.improvements.map((item, idx) => (
                    <div key={idx} className="flex gap-3 p-4 bg-orange-50 rounded-lg border border-orange-100">
                      <AlertCircle className="w-5 h-5 text-orange-600 shrink-0 mt-0.5" />
                      <span className="text-slate-700">{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Missing Elements */}
            {parsedResult.missing.length > 0 && (
              <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-8">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                    <AlertCircle className="w-5 h-5 text-red-600" />
                  </div>
                  <h3 className="text-2xl font-bold text-slate-800">Missing Elements</h3>
                </div>
                <div className="space-y-3">
                  {parsedResult.missing.map((item, idx) => (
                    <div key={idx} className="flex gap-3 p-4 bg-red-50 rounded-lg border border-red-100">
                      <AlertTriangle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
                      <span className="text-slate-700">{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Recommendations */}
            {parsedResult.recommendations.length > 0 && (
              <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-8">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Lightbulb className="w-5 h-5 text-blue-600" />
                  </div>
                  <h3 className="text-2xl font-bold text-slate-800">Actionable Recommendations</h3>
                </div>
                <div className="space-y-3">
                  {parsedResult.recommendations.map((item, idx) => (
                    <div key={idx} className="flex gap-3 p-4 bg-blue-50 rounded-lg border border-blue-100">
                      <Sparkles className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
                      <span className="text-slate-700">{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Final Verdict */}
            {parsedResult.verdict && (
              <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl p-8 text-white shadow-xl">
                <div className="flex items-center gap-3 mb-4">
                  <Award className="w-8 h-8" />
                  <h3 className="text-2xl font-bold">Final Verdict</h3>
                </div>
                <p className="text-slate-200 text-lg leading-relaxed">
                  {parsedResult.verdict}
                </p>
              </div>
            )}

          </div>
        )}

      </div>

      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fadeIn {
          animation: fadeIn 0.6s ease-out;
        }
      `}</style>
    </div>
  );
}