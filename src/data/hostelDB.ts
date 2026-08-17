// src/data/hostelDB.ts
import { BlockName } from '../types';

export interface StudentRecord {
  studentId: string;
  name: string;
  rollNo: string;
  roomNumber: string;
  block: BlockName;
  year: number;
  password: string;
  parentPhone: string;
  registeredAt: string;
}

const MASTER_DB_KEY = 'HOSTEL_CENTRAL_STUDENT_DATABASE_V1';

const DEFAULT_STUDENTS: StudentRecord[] = [
  {
    studentId: 'std-101',
    name: 'Aayush Singh',
    rollNo: '2024CS101',
    roomNumber: 'Tagore-101',
    block: 'Tagore',
    year: 3,
    password: 'student@123',
    parentPhone: '+91 98123 45678',
    registeredAt: '2026-08-01'
  }
];

export const hostelDB = {
  // 1. Saare Students Lena (Direct LocalStorage)
  getAllStudents: (): StudentRecord[] => {
    try {
      const data = localStorage.getItem(MASTER_DB_KEY);
      if (!data) {
        localStorage.setItem(MASTER_DB_KEY, JSON.stringify(DEFAULT_STUDENTS));
        return DEFAULT_STUDENTS;
      }
      return JSON.parse(data);
    } catch (e) {
      return DEFAULT_STUDENTS;
    }
  },

  // 2. Naya Student Add Karna
  addStudent: (newStudent: StudentRecord): void => {
    const list = hostelDB.getAllStudents();
    list.push(newStudent);
    localStorage.setItem(MASTER_DB_KEY, JSON.stringify(list));
  },

  // 3. Student Update Karna
  updateStudent: (studentId: string, updatedFields: Partial<StudentRecord>): void => {
    const list = hostelDB.getAllStudents();
    const updated = list.map((s) => {
      if (s.studentId === studentId) {
        return { ...s, ...updatedFields };
      }
      return s;
    });
    localStorage.setItem(MASTER_DB_KEY, JSON.stringify(updated));
  },

  // 4. Student Delete Karna
  deleteStudent: (studentId: string): void => {
    const list = hostelDB.getAllStudents();
    const updated = list.filter((s) => s.studentId !== studentId);
    localStorage.setItem(MASTER_DB_KEY, JSON.stringify(updated));
  },

  // 5. 🎯 Real Login Authentication
  authenticateStudent: (rollNo: string, pass: string): StudentRecord | null => {
    const list = hostelDB.getAllStudents();
    const inputRoll = rollNo.trim().toLowerCase();
    const inputPass = pass.trim();

    const matched = list.find(
      (s) => s.rollNo.trim().toLowerCase() === inputRoll && s.password.trim() === inputPass
    );
    return matched || null;
  },

  verifyWardenPassword: (password: string): boolean => {
    const p = password.trim();
    return p === 'warden@123' || p === 'warden123';
  },

  verifyAdminPassword: (password: string): boolean => {
    const p = password.trim();
    return p === 'admin@123' || p === 'admin123';
  }
};