"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation"; // Navigation ke liye
import { User, Mail, Lock, UserPlus, Loader2, AlertCircle } from "lucide-react";

export default function SignupPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({ fullName: "", email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Backend API Call
      const response = await fetch("http://127.0.0.1:8000/api/v1/auth/signup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          full_name: formData.fullName, // Backend expects snake_case
          email: formData.email,
          password: formData.password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || "Signup failed");
      }

      // Success! Redirect to Login page
      alert("Account created successfully! Please login.");
      router.push("/authentication/Login");

    } catch (err) {
      console.error(err);
      setError(err.message || "Something went wrong. Is backend running?");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl overflow-hidden border border-slate-200">
        
        {/* Header */}
        <div className="bg-blue-600 p-8 text-center">
          <div className="mx-auto bg-white/20 w-16 h-16 rounded-full flex items-center justify-center mb-4 backdrop-blur-sm">
            <UserPlus className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-3xl font-bold text-white">Create Account</h2>
          <p className="text-blue-100 mt-2">Join us and start your journey</p>
        </div>

        {/* Form Section */}
        <div className="p-8">
          <form onSubmit={handleSubmit} className="space-y-5">
            
            {/* Full Name */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Full Name</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                <input
                  type="text"
                  name="fullName"
                  required
                  placeholder="John Doe"
                  className="w-full pl-10 pr-4 py-3 border border-slate-300 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all text-slate-700"
                  onChange={handleChange}
                />
              </div>
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                <input
                  type="email"
                  name="email"
                  required
                  placeholder="name@example.com"
                  className="w-full pl-10 pr-4 py-3 border border-slate-300 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all text-slate-700"
                  onChange={handleChange}
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                <input
                  type="password"
                  name="password"
                  required
                  placeholder="Create a strong password"
                  className="w-full pl-10 pr-4 py-3 border border-slate-300 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all text-slate-700"
                  onChange={handleChange}
                />
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="bg-red-50 text-red-600 p-3 rounded-lg flex items-center gap-2 text-sm">
                <AlertCircle size={16} /> {error}
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 text-white py-3 rounded-xl font-bold hover:bg-blue-700 transition-all shadow-lg hover:shadow-xl disabled:opacity-70 flex items-center justify-center gap-2"
            >
              {loading ? <Loader2 className="animate-spin" /> : "Sign Up"}
            </button>
          </form>

          {/* Footer Link */}
          <div className="mt-6 text-center text-slate-600 text-sm">
            Already have an account?{" "}
            <Link href="/authentication/Login" className="text-blue-600 font-semibold hover:underline">
              Sign In
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}