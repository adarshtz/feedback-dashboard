"use client";

import { useState } from "react";
import { uploadAndParseExcel } from "@/app/actions/upload";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Upload,
  FileSpreadsheet,
  AlertCircle,
  CheckCircle2,
  Sparkles,
} from "lucide-react";
import DashboardView from "@/components/dashboard-view";
import type { FeedbackData } from "@/lib/excel-parser";

interface DashboardData {
  feedbacks: FeedbackData[];
  summary: {
    totalFeedbacks: number;
    averageRating: number;
    departmentCount: number;
    teacherCount: number;
  };
  departmentStats: Array<{
    department: string;
    averageRating: number;
    feedbackCount: number;
  }>;
  teacherStats: Array<{
    teacherName: string;
    department: string;
    averageRating: number;
    feedbackCount: number;
    subjectsCount: number;
  }>;
}

export default function DashboardPage() {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(
    null,
  );

  async function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setError("");
    setUploading(true);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const result = await uploadAndParseExcel(formData);

      if (result.success && result.data) {
        setDashboardData(result.data);
      } else {
        setError(result.error || "Failed to upload file");
      }
    } catch (err) {
      setError("An unexpected error occurred");
      console.error(err);
    } finally {
      setUploading(false);
    }
  }

  if (dashboardData) {
    return (
      <DashboardView
        data={dashboardData}
        onReset={() => setDashboardData(null)}
      />
    );
  }

  const requiredColumns = [
    "Program Name",
    "Semester",
    "Section",
    "Faculty Name",
    "Course Name",
    "Time Management Rating (out of 5)",
    "Preparedness Rating (out of 5)",
    "Content Delivery Rating (out of 5)",
    "Communication Rating (out of 5)",
    "Interaction Rating (out of 5)",
    "Special Remarks",
  ];

  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-200px)] px-4">
      <Card className="w-full max-w-2xl border-slate-200/80 shadow-sm rounded-2xl bg-white">
        <CardHeader className="text-center pb-4 pt-10">
          <div className="flex justify-center mb-6">
            <div className="relative">
              <div className="w-20 h-20 bg-gradient-to-br from-slate-900 to-slate-700 rounded-2xl flex items-center justify-center shadow-lg">
                <FileSpreadsheet className="h-9 w-9 text-white" />
              </div>
              <div className="absolute -bottom-1 -right-1 w-7 h-7 bg-emerald-400 rounded-lg flex items-center justify-center border-[3px] border-white">
                <Sparkles className="h-3.5 w-3.5 text-white" />
              </div>
            </div>
          </div>
          <CardTitle className="text-2xl font-bold text-slate-900 tracking-tight">
            Upload Feedback Data
          </CardTitle>
          <CardDescription className="text-sm mt-2 text-slate-500 max-w-md mx-auto">
            Upload an Excel file with teacher feedback evaluations to generate
            comprehensive analytics and performance insights
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-5 px-8 pb-10">
          {/* Required Columns */}
          <div className="bg-slate-50/80 border border-slate-100 rounded-xl p-5">
            <h4 className="font-semibold text-xs text-slate-700 mb-3 uppercase tracking-wider">
              Required Excel Columns
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
              {requiredColumns.map((col, i) => (
                <div
                  key={i}
                  className="flex items-center gap-2 text-xs text-slate-600"
                >
                  <CheckCircle2 className="h-3 w-3 text-emerald-500 shrink-0" />
                  <span className="font-medium">{col}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Error */}
          {error && (
            <div className="bg-red-50 border border-red-100 rounded-xl p-4 flex items-start gap-3">
              <AlertCircle className="h-4 w-4 text-red-500 shrink-0 mt-0.5" />
              <div>
                <h4 className="font-semibold text-xs text-red-800">
                  Upload Error
                </h4>
                <p className="text-xs text-red-600 mt-0.5">{error}</p>
              </div>
            </div>
          )}

          {/* Upload Zone */}
          <div className="relative group">
            <div className="border-2 border-dashed border-slate-200 rounded-2xl p-10 text-center hover:border-slate-400 hover:bg-slate-50/50 transition-all duration-300 cursor-pointer">
              <input
                type="file"
                id="file-upload"
                accept=".xlsx,.xls"
                onChange={handleFileUpload}
                disabled={uploading}
                className="hidden"
              />
              <label
                htmlFor="file-upload"
                className={`cursor-pointer ${uploading ? "opacity-50 cursor-not-allowed" : ""}`}
              >
                <div className="w-14 h-14 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:bg-slate-200/80 transition-colors">
                  <Upload
                    className={`h-6 w-6 text-slate-500 ${uploading ? "animate-bounce" : ""}`}
                  />
                </div>
                <p className="text-sm font-semibold text-slate-800 mb-1">
                  {uploading
                    ? "Analyzing your data..."
                    : "Drop your Excel file here"}
                </p>
                <p className="text-xs text-slate-400">
                  or click to browse &bull; .xlsx and .xls formats &bull; Max
                  10MB
                </p>
              </label>
            </div>
          </div>

          <Button
            onClick={() => document.getElementById("file-upload")?.click()}
            className="w-full h-11 text-sm font-semibold rounded-xl bg-slate-900 hover:bg-slate-800 text-white shadow-sm"
            disabled={uploading}
          >
            {uploading ? (
              <span className="flex items-center gap-2">
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Processing File...
              </span>
            ) : (
              <span className="flex items-center gap-2">
                <Upload className="h-4 w-4" />
                Select Excel File
              </span>
            )}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
