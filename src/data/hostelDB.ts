// src/data/hostelDB.ts
import { BlockName, HomeLeavePass, LeaveStatus } from '../types';
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
  faceId?: string; // Biometric Machine Face ID
  roomNumber: string;
  block: BlockName;
  year: number;
  password: string;
  parentPhone: string;
  registeredAt: string;
}

const STUDENTS_COLLECTION = 'students';
const PASSES_COLLECTION = 'gate_passes';

const INITIAL_STUDENTS: StudentRecord[] = [
  {
    studentId: '2024CS101',
    name: 'Aayush Singh',
    rollNo: '2024CS101',
    faceId: 'FID-101',
    roomNumber: 'Tagore-101',
    block: 'Tagore',
    year: 3,
    password: 'student@123',
    parentPhone: '+91 98123 45678',
    registeredAt: '2026-08-01'
  },
  {
    studentId: '2504221530041',
    name: 'Om Singh',
    rollNo: '2504221530041',
    faceId: 'FID-102',
    roomNumber: 'Tilak-200',
    block: 'Tilak',
    year: 2,
    password: 'om@123',
    parentPhone: '+91 98765 43210',
    registeredAt: '2026-08-01'
  }
];

export const hostelDB = {
  // ---------------- 🟢 1. STUDENTS CLOUD DB ----------------
  
  // Cloud Database se Students fetch karna
  getAllStudents: async (): Promise<StudentRecord[]> => {
    try {
      const colRef = collection(db, STUDENTS_COLLECTION);
      const snapshot = await getDocs(colRef);
      
      if (snapshot.empty) {
        // First time initialization in Cloud
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

  // Real-Time Live Sync (Koi bhi device par student add/edit hoga toh bina refresh ke update hoga)
  subscribeToStudents: (callback: (students: StudentRecord[]) => void) => {
    const colRef = collection(db, STUDENTS_COLLECTION);

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
        console.error('Students Live Sync Error:', error);
      }
    );
  },

  // Naya Student Cloud me Add karna
  addStudent: async (newStudent: StudentRecord): Promise<void> => {
    const cleanRoll = newStudent.rollNo.trim().toUpperCase();
    const docRef = doc(db, STUDENTS_COLLECTION, cleanRoll);
    await setDoc(
      docRef,
      {
        ...newStudent,
        studentId: cleanRoll,
        rollNo: cleanRoll,
        name: newStudent.name.trim(),
        roomNumber: newStudent.roomNumber.trim(),
        password: newStudent.password.trim(),
        parentPhone: newStudent.parentPhone.trim(),
        faceId: newStudent.faceId || `FID-${cleanRoll.slice(-3)}`,
        registeredAt: newStudent.registeredAt || new Date().toISOString().split('T')[0]
      },
      { merge: true }
    );
  },

  // Student Update/Edit karna (Room, Year, Phone, Password)
  updateStudent: async (studentId: string, updatedFields: Partial<StudentRecord>): Promise<void> => {
    const cleanId = studentId.trim().toUpperCase();
    const docRef = doc(db, STUDENTS_COLLECTION, cleanId);
    
    // Clean up fields before saving
    const cleanFields: any = { ...updatedFields };
    if (cleanFields.rollNo) cleanFields.rollNo = cleanFields.rollNo.trim().toUpperCase();
    if (cleanFields.password) cleanFields.password = cleanFields.password.trim();
    if (cleanFields.name) cleanFields.name = cleanFields.name.trim();

    await setDoc(docRef, { ...cleanFields, studentId: cleanId }, { merge: true });
  },

  // Student Delete karna (Hostel chhodne par)
  deleteStudent: async (studentId: string): Promise<void> => {
    const cleanId = studentId.trim().toUpperCase();
    const docRef = doc(db, STUDENTS_COLLECTION, cleanId);
    await deleteDoc(docRef);
  },

  // Student Real Login Match
  authenticateStudent: async (rollNo: string, pass: string): Promise<StudentRecord | null> => {
    const list = await hostelDB.getAllStudents();
    const inputRoll = rollNo.trim().toUpperCase();
    const inputPass = pass.trim();

    const matched = list.find(
      (s) => s.rollNo.trim().toUpperCase() === inputRoll && s.password.trim() === inputPass
    );
    return matched || null;
  },

  // Passwords
  verifyWardenPassword: (password: string): boolean => {
    const p = password.trim();
    return p === 'warden@123' || p === 'warden123';
  },

  verifyAdminPassword: (password: string): boolean => {
    const p = password.trim();
    return p === 'admin@123' || p === 'admin123';
  },

  // ---------------- 🟢 2. GATE PASSES GLOBAL CLOUD DB SYNC ----------------

  // Gate Passes Live Real-Time Listener (Guard, Warden aur Student teeno ke pass sync rahega)
  subscribeToPasses: (callback: (passes: HomeLeavePass[]) => void) => {
    const colRef = collection(db, PASSES_COLLECTION);
    return onSnapshot(
      colRef,
      (snapshot) => {
        const list: HomeLeavePass[] = [];
        snapshot.forEach((docSnap) => {
          list.push({ id: docSnap.id, ...docSnap.data() } as HomeLeavePass);
        });
        // Newest gate pass on top
        list.sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
        callback(list);
      },
      (error) => {
        console.error('Firestore Passes Sync Error:', error);
      }
    );
  },

  // Naya Gate Pass Cloud Database me save karna
  savePassToCloud: async (newPass: HomeLeavePass): Promise<void> => {
    const passId = newPass.id || `pass-${Date.now()}`;
    const docRef = doc(db, PASSES_COLLECTION, passId);
    await setDoc(docRef, { ...newPass, id: passId }, { merge: true });
  },

  // Gate Pass Status Update (Approve / Depart / Return / Reject)
  updatePassStatusInCloud: async (passId: string, status: LeaveStatus, extraData: Partial<HomeLeavePass> = {}): Promise<void> => {
    const docRef = doc(db, PASSES_COLLECTION, passId);
    await setDoc(docRef, { status, ...extraData }, { merge: true });
  }
};