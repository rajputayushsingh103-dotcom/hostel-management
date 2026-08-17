// src/data/hostelDB.ts
import { BlockName } from '../types';
import { db } from '../firebase';
import {
  collection,
  getDocs,
  setDoc,
  doc,
  deleteDoc,
  onSnapshot
} from 'firebase/firestore';

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

const COLLECTION_NAME = 'students';

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
  // 🟢 1. Saare Students Cloud Se Fetch Karna
  getAllStudents: async (): Promise<StudentRecord[]> => {
    try {
      const colRef = collection(db, COLLECTION_NAME);
      const snapshot = await getDocs(colRef);
      if (snapshot.empty) {
        // Agar database khali ho toh default student daal do
        for (const std of DEFAULT_STUDENTS) {
          await hostelDB.addStudent(std);
        }
        return DEFAULT_STUDENTS;
      }
      const list: StudentRecord[] = [];
      snapshot.forEach((docSnap) => {
        list.push(docSnap.data() as StudentRecord);
      });
      return list;
    } catch (e) {
      console.error('Error fetching students from Firestore:', e);
      return DEFAULT_STUDENTS;
    }
  },

  // 🟢 2. Real-time Live Listener (Laptop aur Mobile dono me automatic refresh)
  subscribeToStudents: (callback: (students: StudentRecord[]) => void) => {
    const colRef = collection(db, COLLECTION_NAME);
    return onSnapshot(
      colRef,
      (snapshot) => {
        const list: StudentRecord[] = [];
        snapshot.forEach((docSnap) => {
          list.push(docSnap.data() as StudentRecord);
        });
        callback(list.length > 0 ? list : DEFAULT_STUDENTS);
      },
      (error) => {
        console.error('Firestore listener error:', error);
      }
    );
  },

  // 🟢 3. Naya Student Global Cloud Par Add Karna
  addStudent: async (newStudent: StudentRecord): Promise<void> => {
    const cleanRoll = newStudent.rollNo.trim().toUpperCase();
    const docRef = doc(db, COLLECTION_NAME, cleanRoll);
    await setDoc(
      docRef,
      {
        ...newStudent,
        rollNo: cleanRoll
      },
      { merge: true }
    );
  },

  // 🟢 4. Student Update Karna (Cloud Database)
  updateStudent: async (studentId: string, updatedFields: Partial<StudentRecord>): Promise<void> => {
    const roll = (updatedFields.rollNo || studentId).trim().toUpperCase();
    const docRef = doc(db, COLLECTION_NAME, roll);
    await setDoc(docRef, { ...updatedFields, studentId }, { merge: true });
  },

  // 🟢 5. Student Delete Karna (Cloud Database)
  deleteStudent: async (rollNoOrId: string): Promise<void> => {
    const cleanKey = rollNoOrId.trim().toUpperCase();
    const docRef = doc(db, COLLECTION_NAME, cleanKey);
    await deleteDoc(docRef);
  },

  // 🟢 6. Real Global Cloud Login Authentication
  authenticateStudent: async (rollNo: string, pass: string): Promise<StudentRecord | null> => {
    try {
      const list = await hostelDB.getAllStudents();
      const inputRoll = rollNo.trim().toUpperCase();
      const inputPass = pass.trim();

      const matched = list.find(
        (s) => s.rollNo.trim().toUpperCase() === inputRoll && s.password.trim() === inputPass
      );
      return matched || null;
    } catch (err) {
      console.error('Authentication error:', err);
      return null;
    }
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