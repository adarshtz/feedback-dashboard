import * as XLSX from "xlsx";

export interface FeedbackData {
  programName: string;
  semester: string;
  section: string;
  facultyName: string;
  courseName: string;
  timeManagementRating: number; // Q1: Class starts and ends on time
  preparednessRating: number; // Q2: Faculty is well-prepared
  contentDeliveryRating: number; // Q3: Content delivery and technology use
  communicationRating: number; // Q4: Clear and simple language
  interactionRating: number; // Q5: Encourages questions and discussions
  averageRating: number; // Average of all 5 ratings
  specialRemarks?: string;
  // Legacy fields for compatibility
  teacherName: string;
  subject: string;
  department: string;
  rating: number;
  comments?: string;
}

export interface ParsedExcelData {
  data: FeedbackData[];
  summary: {
    totalFeedbacks: number;
    averageRating: number;
    departmentCount: number;
    teacherCount: number;
  };
}

export function parseExcelFile(buffer: Buffer): ParsedExcelData {
  const workbook = XLSX.read(buffer, { type: "buffer" });
  const sheetName = workbook.SheetNames[0];
  const worksheet = workbook.Sheets[sheetName];
  const rawData = XLSX.utils.sheet_to_json(worksheet) as Record<
    string,
    unknown
  >[];

  const data: FeedbackData[] = rawData.map((row) => {
    // Parse the 5 rating criteria
    const timeManagementRating = parseFloat(
      String(
        row[
          "Class starts and ends on time; sufficient time is allocated for explanations, examples, and interaction. ( rating out of 5 )"
        ] || 0,
      ),
    );

    const preparednessRating = parseFloat(
      String(
        row[
          "Faculty is well-prepared, confident, and demonstrates strong understanding of the subject matter.  ( rating out of 5 )"
        ] || 0,
      ),
    );

    const contentDeliveryRating = parseFloat(
      String(
        row[
          "Content is delivered clearly and confidently, with effective use of technology and visuals, supported by relevant examples and real-life applications; integrates pedagogical innovations to enhance student engagement and learning.  ( rating out of 5 )"
        ] || 0,
      ),
    );

    const communicationRating = parseFloat(
      String(
        row[
          "Faculty uses respectful, clear, and simple language with an appropriate tone and pace; explanations are easy to understand and follow.  ( rating out of 5 )"
        ] || 0,
      ),
    );

    const interactionRating = parseFloat(
      String(
        row[
          "Faculty encourages questions, discussions, and interaction to keep students actively involved in the learning process."
        ] || 0,
      ),
    );

    // Calculate average rating
    const ratings = [
      timeManagementRating,
      preparednessRating,
      contentDeliveryRating,
      communicationRating,
      interactionRating,
    ].filter((r) => r > 0);

    const averageRating =
      ratings.length > 0
        ? ratings.reduce((sum, r) => sum + r, 0) / ratings.length
        : 0;

    const programName = String(row["Program Name"] || "");
    const semester = String(row["Semester"] || "");
    const section = String(row["Section"] || "");
    const facultyName = String(row["Faculty Name"] || "");
    const courseName = String(row["Course Name"] || "");
    const specialRemarks = String(
      row[
        "Special Remarks (Any major issues or additional observations not covered in the form)  ( remarks from students )"
      ] || "",
    );

    return {
      programName,
      semester,
      section,
      facultyName,
      courseName,
      timeManagementRating,
      preparednessRating,
      contentDeliveryRating,
      communicationRating,
      interactionRating,
      averageRating,
      specialRemarks,
      // Legacy fields for compatibility
      teacherName: facultyName,
      subject: courseName,
      department: programName,
      rating: averageRating,
      comments: specialRemarks,
    };
  });

  const departments = new Set(data.map((d) => d.programName));
  const teachers = new Set(data.map((d) => d.facultyName));
  const totalRating = data.reduce((sum, d) => sum + d.averageRating, 0);

  return {
    data,
    summary: {
      totalFeedbacks: data.length,
      averageRating: data.length > 0 ? totalRating / data.length : 0,
      departmentCount: departments.size,
      teacherCount: teachers.size,
    },
  };
}

export function getDepartmentStats(data: FeedbackData[]) {
  const deptMap = new Map<
    string,
    { total: number; count: number; rating: number }
  >();

  data.forEach((item) => {
    const dept = item.programName || item.department || "Unknown";
    if (!deptMap.has(dept)) {
      deptMap.set(dept, { total: 0, count: 0, rating: 0 });
    }
    const deptData = deptMap.get(dept)!;
    deptData.total += item.averageRating;
    deptData.count += 1;
    deptData.rating = deptData.total / deptData.count;
  });

  return Array.from(deptMap.entries()).map(([name, stats]) => ({
    department: name,
    averageRating: stats.rating,
    feedbackCount: stats.count,
  }));
}

export function getTeacherStats(data: FeedbackData[]) {
  const teacherMap = new Map<
    string,
    {
      total: number;
      count: number;
      rating: number;
      department: string;
      subjects: Set<string>;
    }
  >();

  data.forEach((item) => {
    const teacher = item.facultyName || item.teacherName || "Unknown";
    if (!teacherMap.has(teacher)) {
      teacherMap.set(teacher, {
        total: 0,
        count: 0,
        rating: 0,
        department: item.programName || item.department || "Unknown",
        subjects: new Set(),
      });
    }
    const teacherData = teacherMap.get(teacher)!;
    teacherData.total += item.averageRating;
    teacherData.count += 1;
    teacherData.rating = teacherData.total / teacherData.count;
    teacherData.subjects.add(item.courseName || item.subject || "Unknown");
  });

  return Array.from(teacherMap.entries()).map(([name, stats]) => ({
    teacherName: name,
    department: stats.department,
    averageRating: stats.rating,
    feedbackCount: stats.count,
    subjectsCount: stats.subjects.size,
  }));
}
