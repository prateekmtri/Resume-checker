"use client";

import { useState } from "react";
import { UploadCloud, FileText, CheckCircle, AlertCircle, Loader2 } from "lucide-react";

export default function Home() {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  // File selection handler
  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setError(null);
      setResult(null);
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

    try {
      const response = await fetch("http://127.0.0.1:8000/upload/", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Failed to connect to the backend.");
      }

      const data = await response.json();
      setResult(data.feedback || "No feedback received.");
    } catch (err) {
      console.error(err);
      setError("❌ Error fetching feedback. Is the backend running?");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-100 to-slate-200 flex items-center justify-center p-4">
      
      <div className="max-w-2xl w-full bg-white rounded-2xl shadow-xl overflow-hidden border border-slate-100">
        
        {/* Header */}
        <div className="bg-blue-600 p-8 text-center">
          <h1 className="text-3xl font-bold text-white flex items-center justify-center gap-3">
            <span className="text-4xl">🧠</span> AI Resume Screener
          </h1>
          <p className="text-blue-100 mt-2">
            Upload your resume and let AI analyze it for you.
          </p>
        </div>

        <div className="p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            
            {/* File Upload */}
            <div className="relative border-2 border-dashed border-slate-300 rounded-xl p-8 hover:border-blue-400 hover:bg-blue-50 text-center cursor-pointer">
              <input
                type="file"
                accept=".pdf,.txt"
                onChange={handleFileChange}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
              <div className="flex flex-col items-center gap-3">
                {file ? (
                  <>
                    <FileText className="w-12 h-12 text-blue-500" />
                    <span className="text-lg font-medium text-slate-700">
                      {file.name}
                    </span>
                    <span className="text-sm text-green-600 font-medium">
                      File Selected
                    </span>
                  </>
                ) : (
                  <>
                    <UploadCloud className="w-12 h-12 text-slate-400" />
                    <span className="text-lg font-medium text-slate-600">
                      Click to Upload Resume
                    </span>
                    <p className="text-sm text-slate-400">
                      Supports PDF or TXT
                    </p>
                  </>
                )}
              </div>
            </div>

            {/* Error */}
            {error && (
              <div className="bg-red-50 text-red-600 p-3 rounded-lg flex items-center gap-2">
                <AlertCircle size={18} />
                {error}
              </div>
            )}

            {/* Button */}
            <button
              type="submit"
              disabled={loading || !file}
              className={`w-full py-3 rounded-lg font-bold text-white
                ${loading || !file
                  ? "bg-slate-300"
                  : "bg-blue-600 hover:bg-blue-700"
                }`}
            >
              {loading ? "Analyzing..." : "Analyze Resume"}
            </button>
          </form>

          {/* Result */}
          {result && (
            <div className="mt-8">
              <h2 className="text-xl font-bold mb-2">Analysis Result</h2>
              <div className="bg-slate-50 p-4 rounded-lg border">
                {result}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
