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

const STORAGE_KEY = 'hostel_master_students_v3';

const DEFAULT_DATA: StudentRecord[] = [
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
  // Direct Live Read
  getAllStudents: (): StudentRecord[] => {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      if (!data) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_DATA));
        return DEFAULT_DATA;
      }
      return JSON.parse(data);
    } catch (e) {
      return DEFAULT_DATA;
    }
  },

  // Add Student
  addStudent: (newStudent: StudentRecord): void => {
    const students = hostelDB.getAllStudents();
    students.push(newStudent);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(students));
  },

  // Update Student
  updateStudent: (studentId: string, updatedFields: Partial<StudentRecord>): void => {
    const students = hostelDB.getAllStudents();
    const updated = students.map((s) => {
      if (s.studentId === studentId) {
        return { ...s, ...updatedFields };
      }
      return s;
    });
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  },

  // Delete Student
  deleteStudent: (studentId: string): void => {
    const students = hostelDB.getAllStudents();
    const updated = students.filter((s) => s.studentId !== studentId);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  },

  // 🎯 Live Direct Login Check
  authenticateStudent: (rollNo: string, password: string): StudentRecord | null => {
    const data = localStorage.getItem(STORAGE_KEY);
    const students: StudentRecord[] = data ? JSON.parse(data) : DEFAULT_DATA;
    
    const inputRoll = rollNo.trim().toLowerCase();
    const inputPass = password.trim();

    const matched = students.find(
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