"use client"

import React, { useState } from 'react';
import { Send, Mail, Copy, CheckCircle, Sparkles } from 'lucide-react';

export default function EmailWriter() {
  const [topic, setTopic] = useState('');
  const [tone, setTone] = useState('professional');
  const [length, setLength] = useState('medium');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [copied, setCopied] = useState(false);

  const generateEmail = async () => {
    if (!topic.trim()) {
      alert('Please enter a topic!');
      return;
    }

    setLoading(true);
    setResult(null);

    try {
      const response = await fetch('http://127.0.0.1:8000/api/v1/email/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ topic, tone, length }),
      });

      const data = await response.json();
      setResult(data);
    } catch (error) {
      alert('Error generating email. Make sure backend is running!');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = () => {
    const fullEmail = `Subject: ${result.subject}\n\n${result.email}`;
    navigator.clipboard.writeText(fullEmail);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    // Updated: Background matched to screenshot (Clean Slate/Grayish Blue)
    <div className="min-h-screen bg-slate-100 p-8 flex flex-col items-center">
      
      <div className="max-w-6xl w-full">
        
        {/* Header - Updated to match the Solid Blue Header from Screenshot */}
        <div className="bg-blue-600 rounded-3xl p-8 text-center mb-12 shadow-lg">
          <div className="flex items-center justify-center gap-3 mb-2">
            {/* Kept icon white to match header text */}
            <Mail className="w-12 h-12 text-white" />
            <h1 className="text-4xl font-bold text-white">AI Email Writer</h1>
          </div>
          <p className="text-blue-100 text-lg">
            Generate professional emails instantly using AI ✨
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          
          {/* Input Section */}
          <div className="bg-white rounded-2xl shadow-md p-8 border border-slate-200">
            <h2 className="text-2xl font-bold mb-6 text-slate-800 flex items-center gap-2">
              <Sparkles className="w-6 h-6 text-blue-600" />
              Email Details
            </h2>

            {/* Topic Input */}
            <div className="mb-6">
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                What's your email about?
              </label>
              <textarea
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="e.g., Follow-up on meeting, Job application, Request for information..."
                className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:border-blue-500 focus:outline-none resize-none transition-colors"
                rows="4"
              />
            </div>

            {/* Tone Selection */}
            <div className="mb-6">
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Tone
              </label>
              <div className="grid grid-cols-3 gap-3">
                {['professional', 'friendly', 'formal'].map((t) => (
                  <button
                    key={t}
                    onClick={() => setTone(t)}
                    className={`px-4 py-2 rounded-lg font-medium transition-all ${
                      tone === t
                        ? 'bg-blue-600 text-white shadow-md' // Updated to Blue
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {t.charAt(0).toUpperCase() + t.slice(1)}
                  </button>
                ))}
              </div>
            </div>

            {/* Length Selection */}
            <div className="mb-6">
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Length
              </label>
              <div className="grid grid-cols-3 gap-3">
                {['short', 'medium', 'long'].map((l) => (
                  <button
                    key={l}
                    onClick={() => setLength(l)}
                    className={`px-4 py-2 rounded-lg font-medium transition-all ${
                      length === l
                        ? 'bg-blue-600 text-white shadow-md' // Updated to Blue
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {l.charAt(0).toUpperCase() + l.slice(1)}
                  </button>
                ))}
              </div>
            </div>

            {/* Generate Button - Updated to Solid Blue */}
            <button
              onClick={generateEmail}
              disabled={loading}
              className="w-full bg-blue-600 text-white py-4 rounded-xl font-bold text-lg hover:bg-blue-700 transition-all shadow-lg hover:shadow-xl disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Send className="w-5 h-5" />
                  Generate Email
                </>
              )}
            </button>
          </div>

          {/* Output Section */}
          <div className="bg-white rounded-2xl shadow-md p-8 border border-slate-200">
            <h2 className="text-2xl font-bold mb-6 text-slate-800 flex items-center gap-2">
              <Mail className="w-6 h-6 text-blue-600" />
              Generated Email
            </h2>

            {!result && !loading && (
              <div className="flex flex-col items-center justify-center h-64 text-slate-400">
                <Mail className="w-16 h-16 mb-4 opacity-50" />
                <p className="text-center font-medium">
                  Your AI-generated email will appear here
                </p>
              </div>
            )}

            {loading && (
              <div className="flex flex-col items-center justify-center h-64">
                {/* Spinner matched to Blue theme */}
                <div className="w-16 h-16 border-4 border-blue-100 border-t-blue-600 rounded-full animate-spin mb-4" />
                <p className="text-slate-600 font-medium">Crafting your perfect email...</p>
              </div>
            )}

            {result && (
              <div className="space-y-4">
                {/* Subject - Updated to Blue theme */}
                <div className="bg-blue-50 p-4 rounded-lg border-l-4 border-blue-600">
                  <p className="text-sm font-semibold text-blue-900 mb-1">Subject</p>
                  <p className="text-slate-800 font-medium">{result.subject}</p>
                </div>

                {/* Email Body */}
                <div className="bg-slate-50 p-6 rounded-lg border border-slate-200 max-h-96 overflow-y-auto">
                  <pre className="whitespace-pre-wrap font-sans text-slate-700 leading-relaxed">
                    {result.email}
                  </pre>
                </div>

                {/* Copy Button */}
                <button
                  onClick={copyToClipboard}
                  className="w-full bg-slate-800 text-white py-3 rounded-xl font-semibold hover:bg-slate-900 transition-all flex items-center justify-center gap-2"
                >
                  {copied ? (
                    <>
                      <CheckCircle className="w-5 h-5 text-green-400" />
                      Copied!
                    </>
                  ) : (
                    <>
                      <Copy className="w-5 h-5" />
                      Copy to Clipboard
                    </>
                  )}
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-12 text-slate-500">
          <p>Powered by Groq LLaMA 3.3 🚀 | Built with ❤️ by Prateek</p>
        </div>
      </div>
    </div>
  );
}