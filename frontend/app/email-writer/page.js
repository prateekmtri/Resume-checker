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
    // Updated: bg-gradient-to-br -> bg-linear-to-br
    <div className="min-h-screen bg-linear-to-br from-blue-50 via-indigo-50 to-purple-50 p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Mail className="w-12 h-12 text-indigo-600" />
            <h1 className="text-5xl font-bold text-gray-800">AI Email Writer</h1>
          </div>
          <p className="text-gray-600 text-lg">
            Generate professional emails instantly using AI ✨
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Input Section */}
          <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
            <h2 className="text-2xl font-bold mb-6 text-gray-800 flex items-center gap-2">
              <Sparkles className="w-6 h-6 text-indigo-600" />
              Email Details
            </h2>

            {/* Topic Input */}
            <div className="mb-6">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                What's your email about?
              </label>
              <textarea
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="e.g., Follow-up on meeting, Job application, Request for information..."
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-indigo-500 focus:outline-none resize-none"
                rows="4"
              />
            </div>

            {/* Tone Selection */}
            <div className="mb-6">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Tone
              </label>
              <div className="grid grid-cols-3 gap-3">
                {['professional', 'friendly', 'formal'].map((t) => (
                  <button
                    key={t}
                    onClick={() => setTone(t)}
                    className={`px-4 py-2 rounded-lg font-medium transition-all ${
                      tone === t
                        ? 'bg-indigo-600 text-white shadow-lg scale-105'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {t.charAt(0).toUpperCase() + t.slice(1)}
                  </button>
                ))}
              </div>
            </div>

            {/* Length Selection */}
            <div className="mb-6">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Length
              </label>
              <div className="grid grid-cols-3 gap-3">
                {['short', 'medium', 'long'].map((l) => (
                  <button
                    key={l}
                    onClick={() => setLength(l)}
                    className={`px-4 py-2 rounded-lg font-medium transition-all ${
                      length === l
                        ? 'bg-indigo-600 text-white shadow-lg scale-105'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {l.charAt(0).toUpperCase() + l.slice(1)}
                  </button>
                ))}
              </div>
            </div>

            {/* Generate Button */}
            <button
              onClick={generateEmail}
              disabled={loading}
              // Updated: bg-gradient-to-r -> bg-linear-to-r
              className="w-full bg-linear-to-r from-indigo-600 to-purple-600 text-white py-4 rounded-xl font-bold text-lg hover:from-indigo-700 hover:to-purple-700 transition-all shadow-lg hover:shadow-xl disabled:opacity-50 flex items-center justify-center gap-2"
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
          <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
            <h2 className="text-2xl font-bold mb-6 text-gray-800 flex items-center gap-2">
              <Mail className="w-6 h-6 text-indigo-600" />
              Generated Email
            </h2>

            {!result && !loading && (
              <div className="flex flex-col items-center justify-center h-64 text-gray-400">
                <Mail className="w-16 h-16 mb-4" />
                <p className="text-center">
                  Your AI-generated email will appear here
                </p>
              </div>
            )}

            {loading && (
              <div className="flex flex-col items-center justify-center h-64">
                <div className="w-16 h-16 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mb-4" />
                <p className="text-gray-600">Crafting your perfect email...</p>
              </div>
            )}

            {result && (
              <div className="space-y-4">
                {/* Subject */}
                <div className="bg-indigo-50 p-4 rounded-lg border-l-4 border-indigo-600">
                  <p className="text-sm font-semibold text-indigo-900 mb-1">Subject</p>
                  <p className="text-gray-800 font-medium">{result.subject}</p>
                </div>

                {/* Email Body */}
                <div className="bg-gray-50 p-6 rounded-lg border border-gray-200 max-h-96 overflow-y-auto">
                  <pre className="whitespace-pre-wrap font-sans text-gray-800 leading-relaxed">
                    {result.email}
                  </pre>
                </div>

                {/* Copy Button */}
                <button
                  onClick={copyToClipboard}
                  className="w-full bg-gray-800 text-white py-3 rounded-xl font-semibold hover:bg-gray-900 transition-all flex items-center justify-center gap-2"
                >
                  {copied ? (
                    <>
                      <CheckCircle className="w-5 h-5" />
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
        <div className="text-center mt-12 text-gray-600">
          <p>Powered by Groq LLaMA 3.3 🚀 | Built with ❤️ by Prateek</p>
        </div>
      </div>
    </div>
  );
}