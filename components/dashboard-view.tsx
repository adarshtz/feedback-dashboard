"use client";

import { useMemo } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ScatterChart,
  Scatter,
  Legend,
  Line,
  ComposedChart,
} from "recharts";
import {
  TrendingUp,
  TrendingDown,
  Users,
  Building2,
  Star,
  RefreshCw,
  Award,
  Target,
  BarChart3,
  Activity,
  Zap,
  BookOpen,
  AlertTriangle,
  CheckCircle2,
  Medal,
  Sigma,
  Percent,
  Hash,
  Layers,
} from "lucide-react";
import type { FeedbackData } from "@/lib/excel-parser";

interface DashboardViewProps {
  data: {
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
  };
  onReset: () => void;
}

const CHART_COLORS = [
  "#2563eb",
  "#7c3aed",
  "#059669",
  "#d97706",
  "#e11d48",
  "#0891b2",
  "#4f46e5",
  "#0d9488",
  "#c026d3",
  "#ea580c",
  "#16a34a",
  "#9333ea",
  "#0284c7",
  "#dc2626",
];

function getRatingBadgeClass(rating: number): string {
  if (rating >= 4.0) return "rating-excellent";
  if (rating >= 3.0) return "rating-good";
  if (rating >= 2.0) return "rating-average";
  return "rating-poor";
}

function getRatingLabel(rating: number): string {
  if (rating >= 4.5) return "Outstanding";
  if (rating >= 4.0) return "Excellent";
  if (rating >= 3.5) return "Very Good";
  if (rating >= 3.0) return "Good";
  if (rating >= 2.5) return "Average";
  if (rating >= 2.0) return "Below Avg";
  return "Poor";
}

function standardDeviation(values: number[]): number {
  if (values.length === 0) return 0;
  const avg = values.reduce((s, v) => s + v, 0) / values.length;
  const squaredDiffs = values.map((v) => Math.pow(v - avg, 2));
  return Math.sqrt(squaredDiffs.reduce((s, v) => s + v, 0) / values.length);
}

function median(values: number[]): number {
  if (values.length === 0) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 !== 0
    ? sorted[mid]
    : (sorted[mid - 1] + sorted[mid]) / 2;
}

function percentile(values: number[], p: number): number {
  if (values.length === 0) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  const idx = (p / 100) * (sorted.length - 1);
  const lower = Math.floor(idx);
  const upper = Math.ceil(idx);
  if (lower === upper) return sorted[lower];
  return sorted[lower] + (idx - lower) * (sorted[upper] - sorted[lower]);
}

// Custom tooltip component
function CustomTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: Array<{ name: string; value: number; color?: string }>;
  label?: string;
}) {
  if (!active || !payload || payload.length === 0) return null;
  return (
    <div className="bg-white/95 backdrop-blur-sm  rounded-xl px-4 py-3 ">
      <p className="text-xs font-semibold text-slate-900 mb-1.5">{label}</p>
      {payload.map((entry, i) => (
        <div key={i} className="flex items-center gap-2 text-xs">
          <div
            className="w-2 h-2 rounded-full"
            style={{ background: entry.color || "#2563eb" }}
          />
          <span className="text-slate-500">{entry.name}:</span>
          <span className="font-semibold text-slate-800">
            {typeof entry.value === "number"
              ? entry.value.toFixed(2)
              : entry.value}
          </span>
        </div>
      ))}
    </div>
  );
}

export default function DashboardView({ data, onReset }: DashboardViewProps) {
  const { feedbacks, summary, departmentStats, teacherStats } = data;

  // ===================== COMPUTE ALL ANALYTICS =====================
  const analytics = useMemo(() => {
    const allRatings = feedbacks.map((f) => f.averageRating);
    const med = median(allRatings);
    const stdDev = standardDeviation(allRatings);
    const p25 = percentile(allRatings, 25);
    const p75 = percentile(allRatings, 75);
    const p90 = percentile(allRatings, 90);
    const p10 = percentile(allRatings, 10);

    // Criteria averages
    const criteriaAvg = {
      timeManagement:
        feedbacks.reduce((s, f) => s + f.timeManagementRating, 0) /
        feedbacks.length,
      preparedness:
        feedbacks.reduce((s, f) => s + f.preparednessRating, 0) /
        feedbacks.length,
      contentDelivery:
        feedbacks.reduce((s, f) => s + f.contentDeliveryRating, 0) /
        feedbacks.length,
      communication:
        feedbacks.reduce((s, f) => s + f.communicationRating, 0) /
        feedbacks.length,
      interaction:
        feedbacks.reduce((s, f) => s + f.interactionRating, 0) /
        feedbacks.length,
    };

    // Best & worst criteria
    const criteriaEntries = Object.entries(criteriaAvg) as [string, number][];
    const bestCriteria = criteriaEntries.reduce((a, b) =>
      b[1] > a[1] ? b : a,
    );
    const worstCriteria = criteriaEntries.reduce((a, b) =>
      b[1] < a[1] ? b : a,
    );

    // Criteria labels
    const criteriaLabels: Record<string, string> = {
      timeManagement: "Time Management",
      preparedness: "Preparedness",
      contentDelivery: "Content Delivery",
      communication: "Communication",
      interaction: "Interaction",
    };

    // Teacher performance tiers
    const excellent = teacherStats.filter((t) => t.averageRating >= 4.0).length;
    const good = teacherStats.filter(
      (t) => t.averageRating >= 3.0 && t.averageRating < 4.0,
    ).length;
    const average = teacherStats.filter(
      (t) => t.averageRating >= 2.0 && t.averageRating < 3.0,
    ).length;
    const needsImprovement = teacherStats.filter(
      (t) => t.averageRating < 2.0,
    ).length;

    // Sorted teachers
    const sortedByRating = [...teacherStats].sort(
      (a, b) => b.averageRating - a.averageRating,
    );
    const topTeachers = sortedByRating.slice(0, 10);
    const bottomTeachers = sortedByRating.slice(-5).reverse();
    const bestTeacher = sortedByRating[0];
    const worstTeacher = sortedByRating[sortedByRating.length - 1];

    // Teacher consistency (lower std dev = more consistent)
    const teacherConsistency = teacherStats.map((t) => {
      const teacherFeedbacks = feedbacks.filter(
        (f) =>
          f.facultyName === t.teacherName || f.teacherName === t.teacherName,
      );
      const ratings = teacherFeedbacks.map((f) => f.averageRating);
      return {
        ...t,
        stdDev: standardDeviation(ratings),
        consistency:
          ratings.length > 1 ? 100 - standardDeviation(ratings) * 20 : 100,
      };
    });
    const mostConsistent = [...teacherConsistency]
      .sort((a, b) => a.stdDev - b.stdDev)
      .slice(0, 5);

    // Department analysis
    const sortedDepts = [...departmentStats].sort(
      (a, b) => b.averageRating - a.averageRating,
    );
    const bestDept = sortedDepts[0];
    const worstDept = sortedDepts[sortedDepts.length - 1];

    // Department criteria breakdown
    const deptCriteriaData = Array.from(
      new Set(feedbacks.map((f) => f.programName || f.department)),
    ).map((dept) => {
      const deptFeedbacks = feedbacks.filter(
        (f) => (f.programName || f.department) === dept,
      );
      const count = deptFeedbacks.length;
      return {
        department: dept,
        "Time Mgmt":
          count > 0
            ? deptFeedbacks.reduce((s, f) => s + f.timeManagementRating, 0) /
              count
            : 0,
        Preparedness:
          count > 0
            ? deptFeedbacks.reduce((s, f) => s + f.preparednessRating, 0) /
              count
            : 0,
        Delivery:
          count > 0
            ? deptFeedbacks.reduce((s, f) => s + f.contentDeliveryRating, 0) /
              count
            : 0,
        Communication:
          count > 0
            ? deptFeedbacks.reduce((s, f) => s + f.communicationRating, 0) /
              count
            : 0,
        Interaction:
          count > 0
            ? deptFeedbacks.reduce((s, f) => s + f.interactionRating, 0) / count
            : 0,
      };
    });

    // Rating distribution (more granular)
    const ratingDistribution = [
      {
        range: "0-1",
        count: feedbacks.filter((f) => f.rating >= 0 && f.rating < 1).length,
        fill: "#ef4444",
      },
      {
        range: "1-2",
        count: feedbacks.filter((f) => f.rating >= 1 && f.rating < 2).length,
        fill: "#f97316",
      },
      {
        range: "2-3",
        count: feedbacks.filter((f) => f.rating >= 2 && f.rating < 3).length,
        fill: "#eab308",
      },
      {
        range: "3-4",
        count: feedbacks.filter((f) => f.rating >= 3 && f.rating < 4).length,
        fill: "#3b82f6",
      },
      {
        range: "4-5",
        count: feedbacks.filter((f) => f.rating >= 4 && f.rating <= 5).length,
        fill: "#22c55e",
      },
    ];

    // Radar data for criteria
    const radarData = [
      { criteria: "Time Mgmt", value: criteriaAvg.timeManagement, fullMark: 5 },
      {
        criteria: "Preparedness",
        value: criteriaAvg.preparedness,
        fullMark: 5,
      },
      { criteria: "Delivery", value: criteriaAvg.contentDelivery, fullMark: 5 },
      {
        criteria: "Communication",
        value: criteriaAvg.communication,
        fullMark: 5,
      },
      { criteria: "Interaction", value: criteriaAvg.interaction, fullMark: 5 },
    ];

    // Course analysis
    const courseMap = new Map<string, { total: number; count: number }>();
    feedbacks.forEach((f) => {
      const course = f.courseName || f.subject || "Unknown";
      if (!courseMap.has(course)) courseMap.set(course, { total: 0, count: 0 });
      const c = courseMap.get(course)!;
      c.total += f.averageRating;
      c.count++;
    });
    const courseStats = Array.from(courseMap.entries())
      .map(([name, s]) => ({
        course: name,
        avgRating: s.total / s.count,
        count: s.count,
      }))
      .sort((a, b) => b.avgRating - a.avgRating);
    const uniqueCourses = courseStats.length;

    // Semester analysis
    const semesterMap = new Map<string, { total: number; count: number }>();
    feedbacks.forEach((f) => {
      const sem = f.semester || "Unknown";
      if (!semesterMap.has(sem)) semesterMap.set(sem, { total: 0, count: 0 });
      const s = semesterMap.get(sem)!;
      s.total += f.averageRating;
      s.count++;
    });
    const semesterStats = Array.from(semesterMap.entries())
      .map(([name, s]) => ({
        semester: name,
        avgRating: s.total / s.count,
        count: s.count,
      }))
      .sort((a, b) => a.semester.localeCompare(b.semester));

    // Section analysis
    const sectionMap = new Map<string, { total: number; count: number }>();
    feedbacks.forEach((f) => {
      const sec = f.section || "Unknown";
      if (!sectionMap.has(sec)) sectionMap.set(sec, { total: 0, count: 0 });
      const s = sectionMap.get(sec)!;
      s.total += f.averageRating;
      s.count++;
    });
    const sectionStats = Array.from(sectionMap.entries())
      .map(([name, s]) => ({
        section: name,
        avgRating: s.total / s.count,
        count: s.count,
      }))
      .sort((a, b) => b.avgRating - a.avgRating);

    // Scatter: feedback count vs avg rating per teacher
    const scatterData = teacherStats.map((t) => ({
      x: t.feedbackCount,
      y: t.averageRating,
      name: t.teacherName,
    }));

    // Performance tier data for pie
    const performanceTiers = [
      { name: "Excellent (4+)", value: excellent, fill: "#22c55e" },
      { name: "Good (3-4)", value: good, fill: "#3b82f6" },
      { name: "Average (2-3)", value: average, fill: "#eab308" },
      { name: "Needs Work (<2)", value: needsImprovement, fill: "#ef4444" },
    ].filter((t) => t.value > 0);

    // Criteria comparison bar data
    const criteriaBarData = [
      { name: "Time Mgmt", value: criteriaAvg.timeManagement, fill: "#2563eb" },
      {
        name: "Preparedness",
        value: criteriaAvg.preparedness,
        fill: "#7c3aed",
      },
      { name: "Delivery", value: criteriaAvg.contentDelivery, fill: "#059669" },
      {
        name: "Communication",
        value: criteriaAvg.communication,
        fill: "#d97706",
      },
      { name: "Interaction", value: criteriaAvg.interaction, fill: "#e11d48" },
    ];

    // Teachers above/below avg
    const aboveAvg = teacherStats.filter(
      (t) => t.averageRating >= summary.averageRating,
    ).length;
    const belowAvg = teacherStats.filter(
      (t) => t.averageRating < summary.averageRating,
    ).length;

    // Highest & lowest rated courses
    const topCourses = courseStats.slice(0, 5);
    const bottomCourses = [...courseStats]
      .sort((a, b) => a.avgRating - b.avgRating)
      .slice(0, 5);

    // Feedback per teacher avg
    const avgFeedbacksPerTeacher =
      feedbacks.length / (teacherStats.length || 1);

    // Subjects per teacher avg
    const avgSubjectsPerTeacher =
      teacherStats.reduce((s, t) => s + t.subjectsCount, 0) /
      (teacherStats.length || 1);

    return {
      med,
      stdDev,
      p25,
      p75,
      p90,
      p10,
      criteriaAvg,
      bestCriteria,
      worstCriteria,
      criteriaLabels,
      excellent,
      good,
      average,
      needsImprovement,
      topTeachers,
      bottomTeachers,
      bestTeacher,
      worstTeacher,
      teacherConsistency,
      mostConsistent,
      sortedDepts,
      bestDept,
      worstDept,
      deptCriteriaData,
      ratingDistribution,
      radarData,
      courseStats,
      uniqueCourses,
      semesterStats,
      sectionStats,
      scatterData,
      performanceTiers,
      criteriaBarData,
      aboveAvg,
      belowAvg,
      topCourses,
      bottomCourses,
      avgFeedbacksPerTeacher,
      avgSubjectsPerTeacher,
      sortedByRating: [...teacherStats].sort(
        (a, b) => b.averageRating - a.averageRating,
      ),
    };
  }, [feedbacks, summary, departmentStats, teacherStats]);

  return (
    <div className="space-y-8">
      {/* ==================== HEADER ==================== */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
            Analytics Dashboard
          </h2>
          <p className="text-sm text-slate-500 mt-0.5">
            Comprehensive feedback analysis across {summary.departmentCount}{" "}
            departments &bull; {summary.teacherCount} faculty members &bull;{" "}
            {feedbacks.length} evaluations
          </p>
        </div>
        <Button
          onClick={onReset}
          variant="outline"
          className="gap-2 rounded-xl border-slate-200 hover:bg-slate-50 text-sm font-medium"
        >
          <RefreshCw className="h-3.5 w-3.5" />
          New Analysis
        </Button>
      </div>

      {/* ==================== PRIMARY STAT CARDS (8 cards) ==================== */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* 1. Total Feedbacks */}
        <div className="stat-card stat-card-blue bg-white rounded-2xl border border-slate-200/80 p-5 ">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[0.65rem] font-semibold uppercase tracking-wider text-slate-400">
              Total Feedbacks
            </span>
            <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center">
              <Hash className="h-4 w-4 text-blue-600" />
            </div>
          </div>
          <p className="text-3xl font-extrabold text-slate-900 tracking-tight">
            {summary.totalFeedbacks.toLocaleString()}
          </p>
          <p className="text-[0.65rem] text-slate-400 mt-1">
            All submitted evaluations
          </p>
        </div>

        {/* 2. Average Rating */}
        <div className="stat-card stat-card-emerald bg-white rounded-2xl border border-slate-200/80 p-5">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[0.65rem] font-semibold uppercase tracking-wider text-slate-400">
              Avg Rating
            </span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center">
              <Star className="h-4 w-4 text-emerald-600" />
            </div>
          </div>
          <p className="text-3xl font-extrabold text-slate-900 tracking-tight">
            {summary.averageRating.toFixed(2)}
          </p>
          <div className="flex items-center gap-1.5 mt-1">
            <span
              className={`rating-badge text-[0.6rem] ${getRatingBadgeClass(summary.averageRating)}`}
            >
              {getRatingLabel(summary.averageRating)}
            </span>
            <span className="text-[0.65rem] text-slate-400">/ 5.00</span>
          </div>
        </div>

        {/* 3. Faculty Count */}
        <div className="stat-card stat-card-violet bg-white rounded-2xl border border-slate-200/80 p-5 ">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[0.65rem] font-semibold uppercase tracking-wider text-slate-400">
              Faculty
            </span>
            <div className="w-8 h-8 rounded-lg bg-violet-50 flex items-center justify-center">
              <Users className="h-4 w-4 text-violet-600" />
            </div>
          </div>
          <p className="text-3xl font-extrabold text-slate-900 tracking-tight">
            {summary.teacherCount}
          </p>
          <p className="text-[0.65rem] text-slate-400 mt-1">
            Unique instructors evaluated
          </p>
        </div>

        {/* 4. Departments */}
        <div className="stat-card stat-card-amber bg-white rounded-2xl border border-slate-200/80 p-5">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[0.65rem] font-semibold uppercase tracking-wider text-slate-400">
              Programs
            </span>
            <div className="w-8 h-8 rounded-lg bg-amber-50 flex items-center justify-center">
              <Building2 className="h-4 w-4 text-amber-600" />
            </div>
          </div>
          <p className="text-3xl font-extrabold text-slate-900 tracking-tight">
            {summary.departmentCount}
          </p>
          <p className="text-[0.65rem] text-slate-400 mt-1">
            Academic programs
          </p>
        </div>

        {/* 5. Median Rating */}
        <div className="stat-card stat-card-cyan bg-white rounded-2xl border border-slate-200/80 p-5">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[0.65rem] font-semibold uppercase tracking-wider text-slate-400">
              Median
            </span>
            <div className="w-8 h-8 rounded-lg bg-cyan-50 flex items-center justify-center">
              <Activity className="h-4 w-4 text-cyan-600" />
            </div>
          </div>
          <p className="text-3xl font-extrabold text-slate-900 tracking-tight">
            {analytics.med.toFixed(2)}
          </p>
          <p className="text-[0.65rem] text-slate-400 mt-1">
            Central tendency measure
          </p>
        </div>

        {/* 6. Std Deviation */}
        <div className="stat-card stat-card-rose bg-white rounded-2xl border border-slate-200/80 p-5">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[0.65rem] font-semibold uppercase tracking-wider text-slate-400">
              Std Deviation
            </span>
            <div className="w-8 h-8 rounded-lg bg-rose-50 flex items-center justify-center">
              <Sigma className="h-4 w-4 text-rose-600" />
            </div>
          </div>
          <p className="text-3xl font-extrabold text-slate-900 tracking-tight">
            {analytics.stdDev.toFixed(3)}
          </p>
          <p className="text-[0.65rem] text-slate-400 mt-1">
            Rating spread measure
          </p>
        </div>

        {/* 7. Total Courses */}
        <div className="stat-card stat-card-indigo bg-white rounded-2xl border border-slate-200/80 p-5">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[0.65rem] font-semibold uppercase tracking-wider text-slate-400">
              Courses
            </span>
            <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center">
              <BookOpen className="h-4 w-4 text-indigo-600" />
            </div>
          </div>
          <p className="text-3xl font-extrabold text-slate-900 tracking-tight">
            {analytics.uniqueCourses}
          </p>
          <p className="text-[0.65rem] text-slate-400 mt-1">
            Unique courses evaluated
          </p>
        </div>

        {/* 8. Excellent Performers */}
        <div className="stat-card stat-card-teal bg-white rounded-2xl border border-slate-200/80 p-5">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[0.65rem] font-semibold uppercase tracking-wider text-slate-400">
              Excellent
            </span>
            <div className="w-8 h-8 rounded-lg bg-teal-50 flex items-center justify-center">
              <Award className="h-4 w-4 text-teal-600" />
            </div>
          </div>
          <p className="text-3xl font-extrabold text-slate-900 tracking-tight">
            {analytics.excellent}
          </p>
          <p className="text-[0.65rem] text-slate-400 mt-1">
            Faculty rating 4.0+
          </p>
        </div>
      </div>

      {/* ==================== SECONDARY INSIGHTS ROW ==================== */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        {/* Best Teacher */}
        <div className="bg-emerald-50/60 border border-emerald-100 rounded-xl p-4">
          <div className="flex items-center gap-1.5 mb-2">
            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
            <span className="text-[0.6rem] font-semibold uppercase tracking-wider text-emerald-700">
              Best Faculty
            </span>
          </div>
          <p className="text-sm font-bold text-slate-900 truncate">
            {analytics.bestTeacher?.teacherName || "N/A"}
          </p>
          <p className="text-xs text-emerald-600 font-semibold">
            {analytics.bestTeacher?.averageRating.toFixed(2)} / 5
          </p>
        </div>

        {/* Lowest Teacher */}
        <div className="bg-rose-50/60 border border-rose-100 rounded-xl p-4">
          <div className="flex items-center gap-1.5 mb-2">
            <AlertTriangle className="h-3.5 w-3.5 text-rose-500" />
            <span className="text-[0.6rem] font-semibold uppercase tracking-wider text-rose-700">
              Needs Attention
            </span>
          </div>
          <p className="text-sm font-bold text-slate-900 truncate">
            {analytics.worstTeacher?.teacherName || "N/A"}
          </p>
          <p className="text-xs text-rose-600 font-semibold">
            {analytics.worstTeacher?.averageRating.toFixed(2)} / 5
          </p>
        </div>

        {/* Best Dept */}
        <div className="bg-blue-50/60 border border-blue-100 rounded-xl p-4">
          <div className="flex items-center gap-1.5 mb-2">
            <Medal className="h-3.5 w-3.5 text-blue-600" />
            <span className="text-[0.6rem] font-semibold uppercase tracking-wider text-blue-700">
              Top Program
            </span>
          </div>
          <p className="text-sm font-bold text-slate-900 truncate">
            {analytics.bestDept?.department || "N/A"}
          </p>
          <p className="text-xs text-blue-600 font-semibold">
            {analytics.bestDept?.averageRating.toFixed(2)} / 5
          </p>
        </div>

        {/* P25 */}
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
          <div className="flex items-center gap-1.5 mb-2">
            <Percent className="h-3.5 w-3.5 text-slate-500" />
            <span className="text-[0.6rem] font-semibold uppercase tracking-wider text-slate-500">
              25th Percentile
            </span>
          </div>
          <p className="text-lg font-bold text-slate-900">
            {analytics.p25.toFixed(2)}
          </p>
        </div>

        {/* P75 */}
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
          <div className="flex items-center gap-1.5 mb-2">
            <Percent className="h-3.5 w-3.5 text-slate-500" />
            <span className="text-[0.6rem] font-semibold uppercase tracking-wider text-slate-500">
              75th Percentile
            </span>
          </div>
          <p className="text-lg font-bold text-slate-900">
            {analytics.p75.toFixed(2)}
          </p>
        </div>

        {/* Above Avg */}
        <div className="bg-violet-50/60 border border-violet-100 rounded-xl p-4">
          <div className="flex items-center gap-1.5 mb-2">
            <TrendingUp className="h-3.5 w-3.5 text-violet-600" />
            <span className="text-[0.6rem] font-semibold uppercase tracking-wider text-violet-700">
              Above Average
            </span>
          </div>
          <p className="text-lg font-bold text-slate-900">
            {analytics.aboveAvg}{" "}
            <span className="text-xs font-normal text-slate-400">
              / {summary.teacherCount}
            </span>
          </p>
        </div>
      </div>

      {/* ==================== TABS ==================== */}
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="bg-white border border-slate-200 rounded-xl p-1  w-full sm:w-auto inline-flex">
          <TabsTrigger
            value="overview"
            className="rounded-lg text-xs font-semibold data-[state=active]:bg-slate-900 data-[state=active]:text-white px-4"
          >
            Overview
          </TabsTrigger>
          <TabsTrigger
            value="criteria"
            className="rounded-lg text-xs font-semibold data-[state=active]:bg-slate-900 data-[state=active]:text-white px-4"
          >
            Criteria Analysis
          </TabsTrigger>
          <TabsTrigger
            value="departments"
            className="rounded-lg text-xs font-semibold data-[state=active]:bg-slate-900 data-[state=active]:text-white px-4"
          >
            Departments
          </TabsTrigger>
          <TabsTrigger
            value="teachers"
            className="rounded-lg text-xs font-semibold data-[state=active]:bg-slate-900 data-[state=active]:text-white px-4"
          >
            Faculty
          </TabsTrigger>
          <TabsTrigger
            value="courses"
            className="rounded-lg text-xs font-semibold data-[state=active]:bg-slate-900 data-[state=active]:text-white px-4"
          >
            Courses
          </TabsTrigger>
        </TabsList>

        {/* ==================== OVERVIEW TAB ==================== */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Department Performance */}
            <Card className="bg-white border-slate-200/80 shadow-none rounded-2xl">
              <CardHeader className="pb-2">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-blue-50 flex items-center justify-center">
                    <BarChart3 className="h-3.5 w-3.5 text-blue-600" />
                  </div>
                  <div>
                    <CardTitle className="text-sm font-semibold text-slate-900">
                      Department Performance
                    </CardTitle>
                    <CardDescription className="text-xs text-slate-400">
                      Average ratings by program
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={analytics.sortedDepts} barSize={32}>
                    <CartesianGrid
                      strokeDasharray="3 3"
                      stroke="#f1f5f9"
                      vertical={false}
                    />
                    <XAxis
                      dataKey="department"
                      tick={{ fontSize: 10, fill: "#94a3b8" }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <YAxis
                      domain={[0, 5]}
                      tick={{ fontSize: 10, fill: "#94a3b8" }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar
                      dataKey="averageRating"
                      name="Avg Rating"
                      radius={[8, 8, 0, 0]}
                    >
                      {analytics.sortedDepts.map((_, i) => (
                        <Cell
                          key={i}
                          fill={CHART_COLORS[i % CHART_COLORS.length]}
                        />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Performance Tier Pie */}
            <Card className="bg-white border-slate-200/80 rounded-2xl shadow-none">
              <CardHeader className="pb-2">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg  bg-violet-50 flex items-center justify-center">
                    <Target className="h-3.5 w-3.5 text-violet-600" />
                  </div>
                  <div>
                    <CardTitle className="text-sm font-semibold text-slate-900">
                      Faculty Performance Tiers
                    </CardTitle>
                    <CardDescription className="text-xs text-slate-400">
                      Distribution by rating category
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-6">
                  <ResponsiveContainer width="55%" height={260}>
                    <PieChart>
                      <Pie
                        data={analytics.performanceTiers}
                        dataKey="value"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={100}
                        strokeWidth={2}
                        stroke="#fff"
                      >
                        {analytics.performanceTiers.map((entry, i) => (
                          <Cell key={i} fill={entry.fill} />
                        ))}
                      </Pie>
                      <Tooltip content={<CustomTooltip />} />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="flex-1 space-y-3">
                    {analytics.performanceTiers.map((tier, i) => (
                      <div key={i} className="flex items-center gap-2">
                        <div
                          className="w-3 h-3 rounded-full"
                          style={{ background: tier.fill }}
                        />
                        <span className="text-xs text-slate-600 flex-1">
                          {tier.name}
                        </span>
                        <span className="text-xs font-bold text-slate-900">
                          {tier.value}
                        </span>
                      </div>
                    ))}
                    <div className="pt-2 border-t border-slate-100">
                      <div className="flex justify-between text-xs">
                        <span className="text-slate-400">Total Faculty</span>
                        <span className="font-bold text-slate-900">
                          {summary.teacherCount}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Rating Distribution */}
            <Card className="bg-white shadow-none border-slate-200/80 rounded-2xl">
              <CardHeader className="pb-2">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-amber-50 flex items-center justify-center">
                    <Layers className="h-3.5 w-3.5 text-amber-600" />
                  </div>
                  <div>
                    <CardTitle className="text-sm font-semibold text-slate-900">
                      Rating Distribution
                    </CardTitle>
                    <CardDescription className="text-xs text-slate-400">
                      Frequency across all {feedbacks.length} evaluations
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={analytics.ratingDistribution} barSize={40}>
                    <CartesianGrid
                      strokeDasharray="3 3"
                      stroke="#f1f5f9"
                      vertical={false}
                    />
                    <XAxis
                      dataKey="range"
                      tick={{ fontSize: 11, fill: "#94a3b8" }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <YAxis
                      tick={{ fontSize: 10, fill: "#94a3b8" }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar dataKey="count" name="Feedbacks" radius={[8, 8, 0, 0]}>
                      {analytics.ratingDistribution.map((entry, i) => (
                        <Cell key={i} fill={entry.fill} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Scatter: Volume vs Quality */}
            <Card className="bg-white shadow-none border-slate-200/80  rounded-2xl">
              <CardHeader className="pb-2">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-rose-50 flex items-center justify-center">
                    <Zap className="h-3.5 w-3.5 text-rose-600" />
                  </div>
                  <div>
                    <CardTitle className="text-sm font-semibold text-slate-900">
                      Volume vs Quality
                    </CardTitle>
                    <CardDescription className="text-xs text-slate-400">
                      Feedback count vs average rating per teacher
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <ScatterChart>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                    <XAxis
                      dataKey="x"
                      name="Feedbacks"
                      tick={{ fontSize: 10, fill: "#94a3b8" }}
                      axisLine={false}
                      tickLine={false}
                      label={{
                        value: "Feedback Count",
                        position: "insideBottom",
                        offset: -5,
                        style: { fontSize: 10, fill: "#94a3b8" },
                      }}
                    />
                    <YAxis
                      dataKey="y"
                      name="Rating"
                      domain={[0, 5]}
                      tick={{ fontSize: 10, fill: "#94a3b8" }}
                      axisLine={false}
                      tickLine={false}
                      label={{
                        value: "Avg Rating",
                        angle: -90,
                        position: "insideLeft",
                        style: { fontSize: 10, fill: "#94a3b8" },
                      }}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Scatter
                      data={analytics.scatterData}
                      fill="#7c3aed"
                      fillOpacity={0.6}
                    />
                  </ScatterChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Top 10 Teachers */}
            <Card className="bg-white shadow-none border-slate-200/80  rounded-2xl lg:col-span-2">
              <CardHeader className="pb-2">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-emerald-50 flex items-center justify-center">
                    <Award className="h-3.5 w-3.5 text-emerald-600" />
                  </div>
                  <div>
                    <CardTitle className="text-sm font-semibold text-slate-900">
                      Top 10 Faculty by Rating
                    </CardTitle>
                    <CardDescription className="text-xs text-slate-400">
                      Highest performing instructors
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={350}>
                  <BarChart
                    data={analytics.topTeachers}
                    layout="vertical"
                    barSize={20}
                  >
                    <CartesianGrid
                      strokeDasharray="3 3"
                      stroke="#f1f5f9"
                      horizontal={false}
                    />
                    <XAxis
                      type="number"
                      domain={[0, 5]}
                      tick={{ fontSize: 10, fill: "#94a3b8" }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <YAxis
                      dataKey="teacherName"
                      type="category"
                      width={140}
                      tick={{ fontSize: 11, fill: "#334155" }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar
                      dataKey="averageRating"
                      name="Avg Rating"
                      radius={[0, 8, 8, 0]}
                    >
                      {analytics.topTeachers.map((_, i) => (
                        <Cell
                          key={i}
                          fill={
                            i === 0 ? "#059669" : i < 3 ? "#10b981" : "#34d399"
                          }
                        />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Quick Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white border border-slate-200/80 rounded-2xl p-5 text-center ">
              <p className="text-[0.6rem] font-semibold uppercase tracking-wider text-slate-400 mb-1">
                90th Percentile
              </p>
              <p className="text-2xl font-extrabold text-slate-900">
                {analytics.p90.toFixed(2)}
              </p>
              <p className="text-[0.65rem] text-slate-400">Top 10% threshold</p>
            </div>
            <div className="bg-white border border-slate-200/80 rounded-2xl p-5 text-center ">
              <p className="text-[0.6rem] font-semibold uppercase tracking-wider text-slate-400 mb-1">
                10th Percentile
              </p>
              <p className="text-2xl font-extrabold text-slate-900">
                {analytics.p10.toFixed(2)}
              </p>
              <p className="text-[0.65rem] text-slate-400">
                Bottom 10% threshold
              </p>
            </div>
            <div className="bg-white border border-slate-200/80 rounded-2xl p-5 text-center ">
              <p className="text-[0.6rem] font-semibold uppercase tracking-wider text-slate-400 mb-1">
                Avg Feedbacks/Faculty
              </p>
              <p className="text-2xl font-extrabold text-slate-900">
                {analytics.avgFeedbacksPerTeacher.toFixed(1)}
              </p>
              <p className="text-[0.65rem] text-slate-400">
                Evaluations per teacher
              </p>
            </div>
            <div className="bg-white border border-slate-200/80 rounded-2xl p-5 text-center ">
              <p className="text-[0.6rem] font-semibold uppercase tracking-wider text-slate-400 mb-1">
                Avg Subjects/Faculty
              </p>
              <p className="text-2xl font-extrabold text-slate-900">
                {analytics.avgSubjectsPerTeacher.toFixed(1)}
              </p>
              <p className="text-[0.65rem] text-slate-400">
                Courses per teacher
              </p>
            </div>
          </div>
        </TabsContent>

        {/* ==================== CRITERIA ANALYSIS TAB ==================== */}
        <TabsContent value="criteria" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Radar Chart */}
            <Card className="bg-white border-slate-200/80 shadow-sm hover:shadow-md rounded-2xl">
              <CardHeader className="pb-2">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-indigo-50 flex items-center justify-center">
                    <Target className="h-3.5 w-3.5 text-indigo-600" />
                  </div>
                  <div>
                    <CardTitle className="text-sm font-semibold text-slate-900">
                      Criteria Radar
                    </CardTitle>
                    <CardDescription className="text-xs text-slate-400">
                      Overall performance shape across 5 criteria
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={340}>
                  <RadarChart data={analytics.radarData}>
                    <PolarGrid stroke="#e2e8f0" />
                    <PolarAngleAxis
                      dataKey="criteria"
                      tick={{ fontSize: 11, fill: "#64748b" }}
                    />
                    <PolarRadiusAxis
                      angle={90}
                      domain={[0, 5]}
                      tick={{ fontSize: 9, fill: "#94a3b8" }}
                    />
                    <Radar
                      name="Average"
                      dataKey="value"
                      stroke="#4f46e5"
                      fill="#4f46e5"
                      fillOpacity={0.2}
                      strokeWidth={2}
                    />
                    <Tooltip content={<CustomTooltip />} />
                  </RadarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Criteria Bar Comparison */}
            <Card className="bg-white border-slate-200/80 shadow-sm hover:shadow-md rounded-2xl">
              <CardHeader className="pb-2">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-cyan-50 flex items-center justify-center">
                    <BarChart3 className="h-3.5 w-3.5 text-cyan-600" />
                  </div>
                  <div>
                    <CardTitle className="text-sm font-semibold text-slate-900">
                      Criteria Comparison
                    </CardTitle>
                    <CardDescription className="text-xs text-slate-400">
                      Side-by-side evaluation dimension scores
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={340}>
                  <BarChart data={analytics.criteriaBarData} barSize={36}>
                    <CartesianGrid
                      strokeDasharray="3 3"
                      stroke="#f1f5f9"
                      vertical={false}
                    />
                    <XAxis
                      dataKey="name"
                      tick={{ fontSize: 10, fill: "#94a3b8" }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <YAxis
                      domain={[0, 5]}
                      tick={{ fontSize: 10, fill: "#94a3b8" }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar dataKey="value" name="Score" radius={[8, 8, 0, 0]}>
                      {analytics.criteriaBarData.map((entry, i) => (
                        <Cell key={i} fill={entry.fill} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Criteria Detail Cards */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {analytics.criteriaBarData.map((c, i) => (
              <div
                key={i}
                className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-sm hover:shadow-md text-center"
              >
                <div
                  className="w-10 h-10 rounded-xl mx-auto mb-3 flex items-center justify-center"
                  style={{ background: `${c.fill}12` }}
                >
                  <Star className="h-4 w-4" style={{ color: c.fill }} />
                </div>
                <p className="text-[0.6rem] font-semibold uppercase tracking-wider text-slate-400 mb-1">
                  {c.name}
                </p>
                <p className="text-2xl font-extrabold text-slate-900">
                  {c.value.toFixed(2)}
                </p>
                <div className="mt-2 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full"
                    style={{
                      width: `${(c.value / 5) * 100}%`,
                      background: c.fill,
                    }}
                  />
                </div>
                <p className="text-[0.55rem] text-slate-400 mt-1">
                  {((c.value / 5) * 100).toFixed(0)}% of max
                </p>
              </div>
            ))}
          </div>

          {/* Strengths & Weaknesses */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-emerald-50/50 border border-emerald-100 rounded-2xl p-6">
              <div className="flex items-center gap-2 mb-4">
                <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                <h3 className="text-sm font-bold text-emerald-900">
                  Strongest Criterion
                </h3>
              </div>
              <p className="text-2xl font-extrabold text-emerald-700">
                {analytics.criteriaLabels[analytics.bestCriteria[0]]}
              </p>
              <p className="text-sm text-emerald-600 mt-1">
                Score: {analytics.bestCriteria[1].toFixed(3)} / 5.00
              </p>
              <div className="mt-3 h-2 bg-emerald-200/50 rounded-full overflow-hidden">
                <div
                  className="h-full bg-emerald-500 rounded-full"
                  style={{ width: `${(analytics.bestCriteria[1] / 5) * 100}%` }}
                />
              </div>
            </div>
            <div className="bg-amber-50/50 border border-amber-100 rounded-2xl p-6">
              <div className="flex items-center gap-2 mb-4">
                <AlertTriangle className="h-5 w-5 text-amber-600" />
                <h3 className="text-sm font-bold text-amber-900">
                  Area for Improvement
                </h3>
              </div>
              <p className="text-2xl font-extrabold text-amber-700">
                {analytics.criteriaLabels[analytics.worstCriteria[0]]}
              </p>
              <p className="text-sm text-amber-600 mt-1">
                Score: {analytics.worstCriteria[1].toFixed(3)} / 5.00
              </p>
              <div className="mt-3 h-2 bg-amber-200/50 rounded-full overflow-hidden">
                <div
                  className="h-full bg-amber-500 rounded-full"
                  style={{
                    width: `${(analytics.worstCriteria[1] / 5) * 100}%`,
                  }}
                />
              </div>
            </div>
          </div>

          {/* Department x Criteria Heatmap Table */}
          <Card className="bg-white border-slate-200/80 shadow-sm rounded-2xl">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold text-slate-900">
                Department x Criteria Matrix
              </CardTitle>
              <CardDescription className="text-xs text-slate-400">
                Average score per criteria per department
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table className="premium-table">
                  <TableHeader>
                    <TableRow>
                      <TableHead className="min-w-35">Department</TableHead>
                      <TableHead className="text-center">Time Mgmt</TableHead>
                      <TableHead className="text-center">
                        Preparedness
                      </TableHead>
                      <TableHead className="text-center">Delivery</TableHead>
                      <TableHead className="text-center">
                        Communication
                      </TableHead>
                      <TableHead className="text-center">Interaction</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {analytics.deptCriteriaData.map((dept, i) => (
                      <TableRow key={i}>
                        <TableCell className="font-semibold text-slate-800 text-xs">
                          {dept.department}
                        </TableCell>
                        {(
                          [
                            "Time Mgmt",
                            "Preparedness",
                            "Delivery",
                            "Communication",
                            "Interaction",
                          ] as const
                        ).map((key) => (
                          <TableCell key={key} className="text-center">
                            <span
                              className={`rating-badge text-xs ${getRatingBadgeClass(dept[key])}`}
                            >
                              {dept[key].toFixed(2)}
                            </span>
                          </TableCell>
                        ))}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ==================== DEPARTMENTS TAB ==================== */}
        <TabsContent value="departments" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Dept Bar Chart */}
            <Card className="bg-white border-slate-200/80 shadow-sm hover:shadow-md rounded-2xl">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-semibold text-slate-900">
                  Department Rankings
                </CardTitle>
                <CardDescription className="text-xs text-slate-400">
                  Sorted by average rating
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart
                    data={analytics.sortedDepts}
                    layout="vertical"
                    barSize={20}
                  >
                    <CartesianGrid
                      strokeDasharray="3 3"
                      stroke="#f1f5f9"
                      horizontal={false}
                    />
                    <XAxis
                      type="number"
                      domain={[0, 5]}
                      tick={{ fontSize: 10, fill: "#94a3b8" }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <YAxis
                      dataKey="department"
                      type="category"
                      width={130}
                      tick={{ fontSize: 10, fill: "#334155" }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar
                      dataKey="averageRating"
                      name="Avg Rating"
                      radius={[0, 8, 8, 0]}
                    >
                      {analytics.sortedDepts.map((_, i) => (
                        <Cell
                          key={i}
                          fill={CHART_COLORS[i % CHART_COLORS.length]}
                        />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Feedback Volume Distribution */}
            <Card className="bg-white border-slate-200/80 shadow-sm hover:shadow-md rounded-2xl">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-semibold text-slate-900">
                  Feedback Volume
                </CardTitle>
                <CardDescription className="text-xs text-slate-400">
                  Number of evaluations per department
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-6">
                  <ResponsiveContainer width="55%" height={260}>
                    <PieChart>
                      <Pie
                        data={departmentStats}
                        dataKey="feedbackCount"
                        nameKey="department"
                        cx="50%"
                        cy="50%"
                        innerRadius={55}
                        outerRadius={95}
                        strokeWidth={2}
                        stroke="#fff"
                      >
                        {departmentStats.map((_, i) => (
                          <Cell
                            key={i}
                            fill={CHART_COLORS[i % CHART_COLORS.length]}
                          />
                        ))}
                      </Pie>
                      <Tooltip content={<CustomTooltip />} />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="flex-1 space-y-2 max-h-65 overflow-y-auto pr-2">
                    {departmentStats.map((dept, i) => (
                      <div key={i} className="flex items-center gap-2">
                        <div
                          className="w-2.5 h-2.5 rounded-full shrink-0"
                          style={{
                            background: CHART_COLORS[i % CHART_COLORS.length],
                          }}
                        />
                        <span className="text-xs text-slate-600 flex-1 truncate">
                          {dept.department}
                        </span>
                        <span className="text-xs font-bold text-slate-900">
                          {dept.feedbackCount}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Department Table */}
          <Card className="bg-white border-slate-200/80 shadow-sm rounded-2xl">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold text-slate-900">
                Department Statistics
              </CardTitle>
              <CardDescription className="text-xs text-slate-400">
                Complete breakdown by program
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table className="premium-table">
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-8">#</TableHead>
                    <TableHead>Department</TableHead>
                    <TableHead className="text-center">Avg Rating</TableHead>
                    <TableHead className="text-center">Feedbacks</TableHead>
                    <TableHead className="text-center">Performance</TableHead>
                    <TableHead className="text-center">Grade</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {analytics.sortedDepts.map((dept, i) => (
                    <TableRow key={i}>
                      <TableCell className="text-xs text-slate-400 font-medium">
                        {i + 1}
                      </TableCell>
                      <TableCell className="font-semibold text-slate-800 text-sm">
                        {dept.department}
                      </TableCell>
                      <TableCell className="text-center">
                        <span
                          className={`rating-badge text-xs ${getRatingBadgeClass(dept.averageRating)}`}
                        >
                          {dept.averageRating.toFixed(2)}
                        </span>
                      </TableCell>
                      <TableCell className="text-center text-sm font-medium text-slate-700">
                        {dept.feedbackCount}
                      </TableCell>
                      <TableCell className="text-center">
                        <div className="flex items-center justify-center gap-2">
                          <div className="w-20 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                            <div
                              className="h-full rounded-full bg-blue-500"
                              style={{
                                width: `${(dept.averageRating / 5) * 100}%`,
                              }}
                            />
                          </div>
                          <span className="text-[10px] text-slate-400 font-medium w-8">
                            {((dept.averageRating / 5) * 100).toFixed(0)}%
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="text-center">
                        <span className="text-xs font-semibold text-slate-600">
                          {getRatingLabel(dept.averageRating)}
                        </span>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {/* Semester Analysis */}
          {analytics.semesterStats.length > 1 && (
            <Card className="bg-white border-slate-200/80 shadow-sm hover:shadow-md rounded-2xl">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-semibold text-slate-900">
                  Semester Breakdown
                </CardTitle>
                <CardDescription className="text-xs text-slate-400">
                  Performance by semester
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={280}>
                  <ComposedChart data={analytics.semesterStats}>
                    <CartesianGrid
                      strokeDasharray="3 3"
                      stroke="#f1f5f9"
                      vertical={false}
                    />
                    <XAxis
                      dataKey="semester"
                      tick={{ fontSize: 10, fill: "#94a3b8" }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <YAxis
                      yAxisId="left"
                      domain={[0, 5]}
                      tick={{ fontSize: 10, fill: "#94a3b8" }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <YAxis
                      yAxisId="right"
                      orientation="right"
                      tick={{ fontSize: 10, fill: "#94a3b8" }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend wrapperStyle={{ fontSize: 11 }} />
                    <Bar
                      yAxisId="right"
                      dataKey="count"
                      name="Feedbacks"
                      fill="#e2e8f0"
                      radius={[4, 4, 0, 0]}
                      barSize={30}
                    />
                    <Line
                      yAxisId="left"
                      dataKey="avgRating"
                      name="Avg Rating"
                      stroke="#2563eb"
                      strokeWidth={2.5}
                      dot={{ r: 4, fill: "#2563eb" }}
                    />
                  </ComposedChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* ==================== TEACHERS TAB ==================== */}
        <TabsContent value="teachers" className="space-y-6">
          {/* Top & Bottom Comparison */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Best Performers */}
            <Card className="bg-white border-slate-200/80 shadow-sm rounded-2xl">
              <CardHeader className="pb-3">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-emerald-50 flex items-center justify-center">
                    <TrendingUp className="h-3.5 w-3.5 text-emerald-600" />
                  </div>
                  <div>
                    <CardTitle className="text-sm font-semibold text-slate-900">
                      Top Performers
                    </CardTitle>
                    <CardDescription className="text-xs text-slate-400">
                      Highest rated faculty members
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-2">
                {analytics.topTeachers.slice(0, 5).map((t, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-slate-50"
                  >
                    <div
                      className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold text-white ${
                        i === 0
                          ? "bg-amber-400"
                          : i === 1
                            ? "bg-slate-400"
                            : i === 2
                              ? "bg-amber-600"
                              : "bg-slate-300"
                      }`}
                    >
                      {i + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-slate-800 truncate">
                        {t.teacherName}
                      </p>
                      <p className="text-[10px] text-slate-400">
                        {t.department} &bull; {t.feedbackCount} feedbacks
                      </p>
                    </div>
                    <span
                      className={`rating-badge text-xs ${getRatingBadgeClass(t.averageRating)}`}
                    >
                      {t.averageRating.toFixed(2)}
                    </span>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Needs Improvement */}
            <Card className="bg-white border-slate-200/80 shadow-sm rounded-2xl">
              <CardHeader className="pb-3">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-rose-50 flex items-center justify-center">
                    <TrendingDown className="h-3.5 w-3.5 text-rose-600" />
                  </div>
                  <div>
                    <CardTitle className="text-sm font-semibold text-slate-900">
                      Needs Improvement
                    </CardTitle>
                    <CardDescription className="text-xs text-slate-400">
                      Faculty requiring attention
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-2">
                {analytics.bottomTeachers.slice(0, 5).map((t, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-slate-50"
                  >
                    <div className="w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold bg-rose-100 text-rose-600">
                      {summary.teacherCount - i}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-slate-800 truncate">
                        {t.teacherName}
                      </p>
                      <p className="text-[10px] text-slate-400">
                        {t.department} &bull; {t.feedbackCount} feedbacks
                      </p>
                    </div>
                    <span
                      className={`rating-badge text-xs ${getRatingBadgeClass(t.averageRating)}`}
                    >
                      {t.averageRating.toFixed(2)}
                    </span>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          {/* Consistency Leaders */}
          <Card className="bg-white border-slate-200/80 shadow-sm rounded-2xl">
            <CardHeader className="pb-2">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-indigo-50 flex items-center justify-center">
                  <Activity className="h-3.5 w-3.5 text-indigo-600" />
                </div>
                <div>
                  <CardTitle className="text-sm font-semibold text-slate-900">
                    Consistency Leaders
                  </CardTitle>
                  <CardDescription className="text-xs text-slate-400">
                    Faculty with most consistent ratings (lowest std deviation)
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                {analytics.mostConsistent.map((t, i) => (
                  <div
                    key={i}
                    className="bg-slate-50/80 border border-slate-100 rounded-xl p-4 text-center"
                  >
                    <div className="w-8 h-8 rounded-lg bg-indigo-100 flex items-center justify-center mx-auto mb-2">
                      <span className="text-xs font-bold text-indigo-700">
                        #{i + 1}
                      </span>
                    </div>
                    <p className="text-xs font-semibold text-slate-800 truncate">
                      {t.teacherName}
                    </p>
                    <p className="text-[10px] text-slate-400 mt-0.5">
                      &sigma; = {t.stdDev.toFixed(3)}
                    </p>
                    <p className="text-lg font-extrabold text-slate-900 mt-1">
                      {t.averageRating.toFixed(2)}
                    </p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Full Teacher Table */}
          <Card className="bg-white border-slate-200/80 shadow-sm rounded-2xl">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-sm font-semibold text-slate-900">
                    Complete Faculty Directory
                  </CardTitle>
                  <CardDescription className="text-xs text-slate-400">
                    {summary.teacherCount} faculty members across{" "}
                    {summary.departmentCount} programs
                  </CardDescription>
                </div>
                <div className="flex gap-2 text-xs">
                  <span className="rating-badge rating-excellent text-[0.55rem]">
                    4+ Excellent
                  </span>
                  <span className="rating-badge rating-good text-[0.55rem]">
                    3-4 Good
                  </span>
                  <span className="rating-badge rating-average text-[0.55rem]">
                    2-3 Avg
                  </span>
                  <span className="rating-badge rating-poor text-[0.55rem]">
                    &lt;2 Poor
                  </span>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="max-h-125 overflow-y-auto">
                <Table className="premium-table">
                  <TableHeader className="sticky top-0 bg-white z-10">
                    <TableRow>
                      <TableHead className="w-8">#</TableHead>
                      <TableHead>Faculty Name</TableHead>
                      <TableHead>Department</TableHead>
                      <TableHead className="text-center">Rating</TableHead>
                      <TableHead className="text-center">Feedbacks</TableHead>
                      <TableHead className="text-center">Courses</TableHead>
                      <TableHead className="text-center">Grade</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {analytics.sortedByRating.map((teacher, i) => (
                      <TableRow key={i}>
                        <TableCell className="text-xs text-slate-400 font-medium">
                          {i + 1}
                        </TableCell>
                        <TableCell className="font-semibold text-slate-800 text-sm">
                          {teacher.teacherName}
                        </TableCell>
                        <TableCell className="text-xs text-slate-500">
                          {teacher.department}
                        </TableCell>
                        <TableCell className="text-center">
                          <span
                            className={`rating-badge text-xs ${getRatingBadgeClass(teacher.averageRating)}`}
                          >
                            {teacher.averageRating.toFixed(2)}
                          </span>
                        </TableCell>
                        <TableCell className="text-center text-sm font-medium text-slate-700">
                          {teacher.feedbackCount}
                        </TableCell>
                        <TableCell className="text-center text-sm font-medium text-slate-700">
                          {teacher.subjectsCount}
                        </TableCell>
                        <TableCell className="text-center">
                          <span className="text-xs font-semibold text-slate-600">
                            {getRatingLabel(teacher.averageRating)}
                          </span>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ==================== COURSES TAB ==================== */}
        <TabsContent value="courses" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Top Courses Chart */}
            <Card className="bg-white border-slate-200/80 shadow-sm hover:shadow-md rounded-2xl">
              <CardHeader className="pb-2">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-emerald-50 flex items-center justify-center">
                    <BookOpen className="h-3.5 w-3.5 text-emerald-600" />
                  </div>
                  <div>
                    <CardTitle className="text-sm font-semibold text-slate-900">
                      Top Rated Courses
                    </CardTitle>
                    <CardDescription className="text-xs text-slate-400">
                      Best performing courses by average rating
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart
                    data={analytics.topCourses}
                    layout="vertical"
                    barSize={18}
                  >
                    <CartesianGrid
                      strokeDasharray="3 3"
                      stroke="#f1f5f9"
                      horizontal={false}
                    />
                    <XAxis
                      type="number"
                      domain={[0, 5]}
                      tick={{ fontSize: 10, fill: "#94a3b8" }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <YAxis
                      dataKey="course"
                      type="category"
                      width={140}
                      tick={{ fontSize: 10, fill: "#334155" }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar
                      dataKey="avgRating"
                      name="Avg Rating"
                      radius={[0, 8, 8, 0]}
                    >
                      {analytics.topCourses.map((_, i) => (
                        <Cell
                          key={i}
                          fill={
                            [
                              "#059669",
                              "#10b981",
                              "#34d399",
                              "#6ee7b7",
                              "#a7f3d0",
                            ][i]
                          }
                        />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Lowest Courses Chart */}
            <Card className="bg-white border-slate-200/80 shadow-sm hover:shadow-md rounded-2xl">
              <CardHeader className="pb-2">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-rose-50 flex items-center justify-center">
                    <AlertTriangle className="h-3.5 w-3.5 text-rose-600" />
                  </div>
                  <div>
                    <CardTitle className="text-sm font-semibold text-slate-900">
                      Courses Needing Attention
                    </CardTitle>
                    <CardDescription className="text-xs text-slate-400">
                      Lowest rated courses for improvement focus
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart
                    data={analytics.bottomCourses}
                    layout="vertical"
                    barSize={18}
                  >
                    <CartesianGrid
                      strokeDasharray="3 3"
                      stroke="#f1f5f9"
                      horizontal={false}
                    />
                    <XAxis
                      type="number"
                      domain={[0, 5]}
                      tick={{ fontSize: 10, fill: "#94a3b8" }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <YAxis
                      dataKey="course"
                      type="category"
                      width={140}
                      tick={{ fontSize: 10, fill: "#334155" }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar
                      dataKey="avgRating"
                      name="Avg Rating"
                      radius={[0, 8, 8, 0]}
                    >
                      {analytics.bottomCourses.map((_, i) => (
                        <Cell
                          key={i}
                          fill={
                            [
                              "#ef4444",
                              "#f87171",
                              "#fca5a5",
                              "#fecaca",
                              "#fee2e2",
                            ][i]
                          }
                        />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Section Breakdown */}
          {analytics.sectionStats.length > 1 && (
            <Card className="bg-white border-slate-200/80 shadow-sm hover:shadow-md rounded-2xl">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-semibold text-slate-900">
                  Section Performance
                </CardTitle>
                <CardDescription className="text-xs text-slate-400">
                  Average ratings breakdown by section
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={280}>
                  <BarChart data={analytics.sectionStats} barSize={32}>
                    <CartesianGrid
                      strokeDasharray="3 3"
                      stroke="#f1f5f9"
                      vertical={false}
                    />
                    <XAxis
                      dataKey="section"
                      tick={{ fontSize: 10, fill: "#94a3b8" }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <YAxis
                      domain={[0, 5]}
                      tick={{ fontSize: 10, fill: "#94a3b8" }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar
                      dataKey="avgRating"
                      name="Avg Rating"
                      radius={[8, 8, 0, 0]}
                    >
                      {analytics.sectionStats.map((_, i) => (
                        <Cell
                          key={i}
                          fill={CHART_COLORS[i % CHART_COLORS.length]}
                        />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          )}

          {/* Course Table */}
          <Card className="bg-white border-slate-200/80 shadow-sm rounded-2xl">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold text-slate-900">
                All Courses
              </CardTitle>
              <CardDescription className="text-xs text-slate-400">
                {analytics.uniqueCourses} courses evaluated
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="max-h-100 overflow-y-auto">
                <Table className="premium-table">
                  <TableHeader className="sticky top-0 bg-white z-10">
                    <TableRow>
                      <TableHead className="w-8">#</TableHead>
                      <TableHead>Course Name</TableHead>
                      <TableHead className="text-center">Avg Rating</TableHead>
                      <TableHead className="text-center">Evaluations</TableHead>
                      <TableHead className="text-center">Grade</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {analytics.courseStats.map((course, i) => (
                      <TableRow key={i}>
                        <TableCell className="text-xs text-slate-400 font-medium">
                          {i + 1}
                        </TableCell>
                        <TableCell className="font-semibold text-slate-800 text-sm">
                          {course.course}
                        </TableCell>
                        <TableCell className="text-center">
                          <span
                            className={`rating-badge text-xs ${getRatingBadgeClass(course.avgRating)}`}
                          >
                            {course.avgRating.toFixed(2)}
                          </span>
                        </TableCell>
                        <TableCell className="text-center text-sm font-medium text-slate-700">
                          {course.count}
                        </TableCell>
                        <TableCell className="text-center">
                          <span className="text-xs font-semibold text-slate-600">
                            {getRatingLabel(course.avgRating)}
                          </span>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* ==================== FOOTER ==================== */}
      <div className="text-center py-4 border-t border-slate-100">
        <p className="text-[0.6rem] text-slate-400 tracking-wide">
          Feedback Analytics Dashboard &bull; Generated from {feedbacks.length}{" "}
          evaluations across {summary.departmentCount} programs
        </p>
      </div>
    </div>
  );
}
