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
  },
  {
    studentId: 'std-102',
    name: 'Rohan Verma',
    rollNo: '2026CS102',
    roomNumber: 'Tagore-102',
    block: 'Tagore',
    year: 1,
    password: 'student@123',
    parentPhone: '+91 98765 11111',
    registeredAt: '2026-08-02'
  }
];

export const hostelDB = {
  // 1. Saare Students ki list lana
  getAllStudents: (): StudentRecord[] => {
    const data = localStorage.getItem(STORAGE_KEY_STUDENTS);
    if (!data) {
      localStorage.setItem(STORAGE_KEY_STUDENTS, JSON.stringify(INITIAL_STUDENTS));
      return INITIAL_STUDENTS;
    }
    return JSON.parse(data);
  },

  // 2. Naya Student Add karna
  addStudent: (newStudent: StudentRecord): void => {
    const students = hostelDB.getAllStudents();
    students.push(newStudent);
    localStorage.setItem(STORAGE_KEY_STUDENTS, JSON.stringify(students));
  },

  // 3. Student Delete / Remove karna
  deleteStudent: (studentId: string): void => {
    const students = hostelDB.getAllStudents();
    const updatedStudents = students.filter((s) => s.studentId !== studentId);
    localStorage.setItem(STORAGE_KEY_STUDENTS, JSON.stringify(updatedStudents));
  },

  // 4. Student Login Auth
  authenticateStudent: (rollNo: string, password: string): StudentRecord | null => {
    const students = hostelDB.getAllStudents();
    return students.find(
      (s) =>
        s.rollNo.trim().toLowerCase() === rollNo.trim().toLowerCase() &&
        s.password.trim() === password.trim()
    ) || null;
  },

  verifyWardenPassword: (password: string): boolean => password === 'warden@123' || password === 'warden123',
  verifyAdminPassword: (password: string): boolean => password === 'admin@123' || password === 'admin123'
};