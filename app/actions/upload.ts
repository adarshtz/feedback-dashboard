"use server";

import {
  parseExcelFile,
  getDepartmentStats,
  getTeacherStats,
} from "@/lib/excel-parser";

export async function uploadAndParseExcel(formData: FormData) {
  try {
    const file = formData.get("file") as File;

    if (!file) {
      return { success: false, error: "No file provided" };
    }

    // Check file size (10MB limit)
    const maxSize = 10 * 1024 * 1024; // 10MB in bytes
    if (file.size > maxSize) {
      return {
        success: false,
        error: "File size exceeds 10MB limit. Please use a smaller file.",
      };
    }

    if (!file.name.endsWith(".xlsx") && !file.name.endsWith(".xls")) {
      return {
        success: false,
        error: "Please upload an Excel file (.xlsx or .xls)",
      };
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const parsedData = parseExcelFile(buffer);
    const departmentStats = getDepartmentStats(parsedData.data);
    const teacherStats = getTeacherStats(parsedData.data);

    return {
      success: true,
      data: {
        feedbacks: parsedData.data,
        summary: parsedData.summary,
        departmentStats,
        teacherStats,
      },
    };
  } catch (error) {
    console.error("Error parsing Excel file:", error);
    return {
      success: false,
      error: "Failed to parse Excel file. Please check the file format.",
    };
  }
}
