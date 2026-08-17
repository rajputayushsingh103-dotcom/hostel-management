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

const STORAGE_KEY_STUDENTS = 'hostel_hub_real_students_db';

const INITIAL_STUDENTS: StudentRecord[] = [
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
  // 1. Saare Students fetch karna
  getAllStudents: (): StudentRecord[] => {
    const data = localStorage.getItem(STORAGE_KEY_STUDENTS);
    if (!data) {
      localStorage.setItem(STORAGE_KEY_STUDENTS, JSON.stringify(INITIAL_STUDENTS));
      return INITIAL_STUDENTS;
    }
    try {
      return JSON.parse(data);
    } catch (e) {
      return INITIAL_STUDENTS;
    }
  },

  // 2. Naya Student Add karna
  addStudent: (newStudent: StudentRecord): void => {
    const students = hostelDB.getAllStudents();
    students.push(newStudent);
    localStorage.setItem(STORAGE_KEY_STUDENTS, JSON.stringify(students));
  },

  // 3. ✏️ Student Update karna (Roll No, Password, Room sabhi)
  updateStudent: (studentId: string, updatedFields: Partial<StudentRecord>): void => {
    const students = hostelDB.getAllStudents();
    const updated = students.map((s) => {
      if (s.studentId === studentId) {
        return { ...s, ...updatedFields };
      }
      return s;
    });
    localStorage.setItem(STORAGE_KEY_STUDENTS, JSON.stringify(updated));
  },

  // 4. Student Delete karna
  deleteStudent: (studentId: string): void => {
    const students = hostelDB.getAllStudents();
    const updatedStudents = students.filter((s) => s.studentId !== studentId);
    localStorage.setItem(STORAGE_KEY_STUDENTS, JSON.stringify(updatedStudents));
  },

  // 5. 🎯 Real Student Login Match (Roll Number + Password)
  authenticateStudent: (rollNo: string, password: string): StudentRecord | null => {
    const students = hostelDB.getAllStudents();
    const cleanRoll = rollNo.trim().toLowerCase();
    const cleanPass = password.trim();

    const student = students.find(
      (s) =>
        s.rollNo.trim().toLowerCase() === cleanRoll &&
        s.password.trim() === cleanPass
    );
    return student || null;
  },

  verifyWardenPassword: (password: string): boolean => password.trim() === 'warden@123' || password.trim() === 'warden123',
  verifyAdminPassword: (password: string): boolean => password.trim() === 'admin@123' || password.trim() === 'admin123'
};