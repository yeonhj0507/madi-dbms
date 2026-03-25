export interface Program {
  id: string;
  name: string;
}

export interface Student {
  id: string;
  name: string;
}

export interface TestItem {
  id: string;
  name: string;
}

export interface TestRecord {
  id: string;
  studentId: string;
  studentName: string;
  testId: string | null;
  testName: string;
  score: number | null;
}

export interface ClinicRecord {
  id: string;
  studentId: string;
  studentName: string;
  programId: string;
  date: string;
  content: string;
  result: string;
  status: "클리닉 전" | "클리닉 완료" | "발송 완료";
  needsReview: boolean;
}
