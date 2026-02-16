"use client";

import { useState } from "react";
import { login } from "@/app/actions/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Lock, Mail } from "lucide-react";

export default function LoginPage() {
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const formData = new FormData(e.currentTarget);

    try {
      const result = await login(formData);
      if (result && result.success) {
        window.location.href = "/dashboard";
      } else if (result && !result.success) {
        setError(result.error || "Login failed");
        setLoading(false);
      }
    } catch (error) {
      console.error("Login error:", error);
      setError("An unexpected error occurred");
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-slate-50 via-white to-slate-100 p-4 relative overflow-hidden">
      {/* Subtle decorative elements */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-150 h-150 bg-linear-to-b from-slate-200/30 to-transparent rounded-full blur-3xl" />
      <div className="absolute bottom-0 right-0 translate-x-1/4 translate-y-1/4 w-125 h-125 bg-linear-to-t from-blue-100/20 to-transparent rounded-full blur-3xl" />

      <div className="w-full max-w-md relative z-10">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight mb-1">
            Feedback Analytics
          </h1>
          <p className="text-sm text-slate-400 font-medium">
            Enterprise Dashboard
          </p>
        </div>

        <Card className="border-slate-200/80 shadow-sm rounded-2xl bg-white">
          <CardHeader className="space-y-1 text-center pb-4 pt-8">
            <CardTitle className="text-lg font-bold text-slate-900">
              Welcome back
            </CardTitle>
            <CardDescription className="text-sm text-slate-400">
              Sign in to access your analytics dashboard
            </CardDescription>
          </CardHeader>
          <CardContent className="px-8 pb-8">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <Label
                  htmlFor="email"
                  className="text-xs font-semibold text-slate-600"
                >
                  Email Address
                </Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-300" />
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="admin@university.edu"
                    required
                    autoComplete="email"
                    className="pl-10 h-10 rounded-xl border-slate-200 bg-slate-50/50 focus:bg-white text-sm"
                  />
                </div>
              </div>
              <div className="space-y-1.5">
                <Label
                  htmlFor="password"
                  className="text-xs font-semibold text-slate-600"
                >
                  Password
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-300" />
                  <Input
                    id="password"
                    name="password"
                    type="password"
                    placeholder="Enter your password"
                    required
                    autoComplete="current-password"
                    className="pl-10 h-10 rounded-xl border-slate-200 bg-slate-50/50 focus:bg-white text-sm"
                  />
                </div>
              </div>
              {error && (
                <div className="bg-red-50 border border-red-100 text-red-600 px-4 py-2.5 rounded-xl text-xs font-medium">
                  {error}
                </div>
              )}
              <Button
                type="submit"
                className="w-full h-10 text-sm font-semibold rounded-xl bg-slate-900 hover:bg-slate-800 text-white shadow-sm mt-2"
                disabled={loading}
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Signing in...
                  </span>
                ) : (
                  "Sign In"
                )}
              </Button>
            </form>

            <div className="mt-5 p-3.5 bg-slate-50/80 border border-slate-100 rounded-xl">
              <p className="text-[0.6rem] font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
                Demo Credentials
              </p>
              <div className="space-y-0.5">
                <p className="text-xs text-slate-600">
                  <span className="font-semibold text-slate-700">Email:</span>{" "}
                  admin@university.edu
                </p>
                <p className="text-xs text-slate-600">
                  <span className="font-semibold text-slate-700">
                    Password:
                  </span>{" "}
                  admin123
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <p className="text-center text-[0.6rem] text-slate-400 mt-6 tracking-wide">
          &copy; 2026 Feedback Analytics. All rights reserved.
        </p>
      </div>
    </div>
  );
}
