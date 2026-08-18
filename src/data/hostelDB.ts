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
    name: 'om singh',
    rollNo: '2504221530041',
    roomNumber: 'Tilak-200',
    block: 'Tilak',
    year: 2,
    password: 'om@123',
    parentPhone: '3434343434',
    registeredAt: '2026-08-01'
  }
];

export const hostelDB = {
  getAllStudents: async (): Promise<StudentRecord[]> => {
    try {
      const colRef = collection(db, COLLECTION_NAME);
      const snapshot = await getDocs(colRef);
      
      if (snapshot.empty) {
        for (const s of INITIAL_STUDENTS) {
          await hostelDB.addStudent(s);
        }
        return INITIAL_STUDENTS;
      }

      const list: StudentRecord[] = [];
      snapshot.forEach((docSnap) => {
        list.push({ ...docSnap.data(), studentId: docSnap.id } as StudentRecord);
      });
      return list;
    } catch (e) {
      console.error('Firestore Error:', e);
      return INITIAL_STUDENTS;
    }
  },

  subscribeToStudents: (callback: (students: StudentRecord[]) => void) => {
    const colRef = collection(db, COLLECTION_NAME);

    return onSnapshot(
      colRef,
      (snapshot) => {
        if (snapshot.empty) {
          INITIAL_STUDENTS.forEach((s) => hostelDB.addStudent(s));
          callback(INITIAL_STUDENTS);
          return;
        }

        const list: StudentRecord[] = [];
        snapshot.forEach((docSnap) => {
          list.push({ ...docSnap.data(), studentId: docSnap.id } as StudentRecord);
        });
        callback(list);
      },
      (error) => {
        console.error('Listener Error:', error);
      }
    );
  },

  addStudent: async (newStudent: StudentRecord): Promise<void> => {
    const cleanRoll = newStudent.rollNo.trim().toUpperCase();
    const docRef = doc(db, COLLECTION_NAME, cleanRoll);
    await setDoc(
      docRef,
      {
        ...newStudent,
        studentId: cleanRoll,
        rollNo: cleanRoll
      },
      { merge: true }
    );
  },

  updateStudent: async (studentId: string, updatedFields: Partial<StudentRecord>): Promise<void> => {
    const cleanId = studentId.trim().toUpperCase();
    const docRef = doc(db, COLLECTION_NAME, cleanId);
    await setDoc(docRef, { ...updatedFields, studentId: cleanId }, { merge: true });
  },

  deleteStudent: async (studentId: string): Promise<void> => {
    const cleanId = studentId.trim().toUpperCase();
    const docRef = doc(db, COLLECTION_NAME, cleanId);
    await deleteDoc(docRef);
  },

  authenticateStudent: async (rollNo: string, pass: string): Promise<StudentRecord | null> => {
    const list = await hostelDB.getAllStudents();
    const inputRoll = rollNo.trim().toUpperCase();
    const inputPass = pass.trim();

    const matched = list.find(
      (s) => s.rollNo.trim().toUpperCase() === inputRoll && s.password.trim() === inputPass
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