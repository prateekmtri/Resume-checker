"use client";

import { useState } from "react";
import { UploadCloud, FileText, CheckCircle, AlertCircle, Loader2, Sparkles, TrendingUp, AlertTriangle, Lightbulb, Award } from "lucide-react";

// ------------------------------------------------------------------
// PARSER
// Splits the raw streamed text into structured sections.
// ------------------------------------------------------------------
function parseResult(text) {
  if (!text) return { score: null, strengths: [], improvements: [], missing: [], recommendations: [] };
  
  const scoreMatch = text.match(/(\d+)\s*(?:out of|\/)\s*10/i);
  const score = scoreMatch ? parseInt(scoreMatch[1]) : null;
  
  const extractSection = (startKeyword, endKeywords) => {
    const startRegex = new RegExp(startKeyword, 'i');
    const startMatch = text.search(startRegex);
    if (startMatch === -1) return '';
    let endIndex = text.length;
    endKeywords.forEach(kw => {
      const idx = text.search(new RegExp(kw, 'i'));
      if (idx > startMatch && idx < endIndex) endIndex = idx;
    });
    return text.slice(startMatch, endIndex);
  };
  
  const extractBullets = (chunk) => {
    if (!chunk) return [];
    const lines = chunk.split('\n').map(l => l.trim()).filter(Boolean);
    const bullets = [];
    lines.forEach(line => {
      const match = line.match(/^(?:[-*•]|\d+[.)]) (.+)/);
      if (match) bullets.push(match[1].trim());
    });
    if (bullets.length === 0) {
      return chunk.split(/\.\s+/)
        .map(s => s.replace(/^[\-*•\d.)]+\s*/, '').trim())
        .filter(s => s.length > 20);
    }
    return bullets;
  };
  
  const strengthsChunk = extractSection('strength', ['improvement', 'missing', 'ats', 'recommendation', '##']);
  const improvementsChunk = extractSection('improvement|areas for', ['missing', 'ats', 'recommendation', '##']);
  const missingChunk = extractSection('missing', ['ats', 'recommendation', '##']);
  const recommendationsChunk = extractSection('recommendation', ['##', '$']);
  
  return {
    score,
    strengths: extractBullets(strengthsChunk),
    improvements: extractBullets(improvementsChunk),
    missing: extractBullets(missingChunk),
    recommendations: extractBullets(recommendationsChunk),
  };
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
        {result && parsedResult && (
          <div className="space-y-6 mt-8">
            {parsedResult.score && (
              <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-2xl p-8 text-white text-center shadow-xl">
                <p className="text-lg font-semibold mb-2">ATS Compatibility Score</p>
                <div className="text-8xl font-bold">{parsedResult.score}</div>
                <div className="text-2xl text-blue-200">/10</div>
              </div>
            )}
            {parsedResult.strengths.length > 0 && (
              <div className="bg-white rounded-2xl shadow-lg border-l-4 border-green-500 p-6">
                <h3 className="text-xl font-bold text-green-700 mb-4">✅ Strengths</h3>
                <div className="space-y-2">
                  {parsedResult.strengths.map((item, i) => (
                    <div key={i} className="bg-green-50 rounded-lg px-4 py-2 text-green-800 text-sm">{item}</div>
                  ))}
                </div>
              </div>
            )}
            {parsedResult.improvements.length > 0 && (
              <div className="bg-white rounded-2xl shadow-lg border-l-4 border-orange-500 p-6">
                <h3 className="text-xl font-bold text-orange-700 mb-4">⚠️ Areas for Improvement</h3>
                <div className="space-y-2">
                  {parsedResult.improvements.map((item, i) => (
                    <div key={i} className="bg-orange-50 rounded-lg px-4 py-2 text-orange-800 text-sm">{item}</div>
                  ))}
                </div>
              </div>
            )}
            {parsedResult.missing.length > 0 && (
              <div className="bg-white rounded-2xl shadow-lg border-l-4 border-red-500 p-6">
                <h3 className="text-xl font-bold text-red-700 mb-4">❌ Missing Skills</h3>
                <div className="space-y-2">
                  {parsedResult.missing.map((item, i) => (
                    <div key={i} className="bg-red-50 rounded-lg px-4 py-2 text-red-800 text-sm">{item}</div>
                  ))}
                </div>
              </div>
            )}
            {parsedResult.recommendations.length > 0 && (
              <div className="bg-white rounded-2xl shadow-lg border-l-4 border-blue-500 p-6">
                <h3 className="text-xl font-bold text-blue-700 mb-4">💡 Recommendations</h3>
                <div className="space-y-2">
                  {parsedResult.recommendations.map((item, i) => (
                    <div key={i} className="bg-blue-50 rounded-lg px-4 py-2 text-blue-800 text-sm">{item}</div>
                  ))}
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