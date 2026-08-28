// src/data/hostelDB.ts
import { BlockName, HomeLeavePass, LeaveStatus, Room } from '../types';
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
  faceId?: string; // 👈 Biometric Machine Face ID
  roomNumber: string;
  block: BlockName;
  year: number;
  password: string;
  parentPhone: string;
  registeredAt: string;
}

const STUDENTS_COLLECTION = 'students';
const PASSES_COLLECTION = 'gate_passes';
const ROOMS_COLLECTION = 'hostel_rooms'; // 👈 Cloud Rooms Collection

const INITIAL_STUDENTS: StudentRecord[] = [
  {
    studentId: 'std-101',
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
    studentId: 'std-102',
    name: 'om singh',
    rollNo: '2504221530041',
    faceId: 'FID-102',
    roomNumber: 'Tilak-200',
    block: 'Tilak',
    year: 2,
    password: 'om@123',
    parentPhone: '3434343434',
    registeredAt: '2026-08-01'
  }
];

export const hostelDB = {
  // ---------------- 🟢 1. STUDENTS CLOUD DB ----------------
  getAllStudents: async (): Promise<StudentRecord[]> => {
    try {
      const colRef = collection(db, STUDENTS_COLLECTION);
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
        console.error('Listener Error:', error);
      }
    );
  },

  addStudent: async (newStudent: StudentRecord): Promise<void> => {
    const cleanRoll = newStudent.rollNo.trim().toUpperCase();
    const docRef = doc(db, STUDENTS_COLLECTION, cleanRoll);
    await setDoc(
      docRef,
      {
        ...newStudent,
        studentId: cleanRoll,
        rollNo: cleanRoll,
        faceId: newStudent.faceId || `FID-${cleanRoll.slice(-3)}`
      },
      { merge: true }
    );
  },

  updateStudent: async (studentId: string, updatedFields: Partial<StudentRecord>): Promise<void> => {
    const cleanId = studentId.trim().toUpperCase();
    const docRef = doc(db, STUDENTS_COLLECTION, cleanId);
    await setDoc(docRef, { ...updatedFields, studentId: cleanId }, { merge: true });
  },

  deleteStudent: async (studentId: string): Promise<void> => {
    const cleanId = studentId.trim().toUpperCase();
    const docRef = doc(db, STUDENTS_COLLECTION, cleanId);
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
  },

  // ---------------- 🟢 2. GATE PASSES GLOBAL CLOUD DB SYNC ----------------

  // Live Real-Time Listener: Mobile aur Laptop me turant bina refresh kiye pass aayega
  subscribeToPasses: (callback: (passes: HomeLeavePass[]) => void) => {
    const colRef = collection(db, PASSES_COLLECTION);
    return onSnapshot(
      colRef,
      (snapshot) => {
        const list: HomeLeavePass[] = [];
        snapshot.forEach((docSnap) => {
          list.push({ id: docSnap.id, ...docSnap.data() } as HomeLeavePass);
        });
        // Sort newest first
        list.sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
        callback(list);
      },
      (error) => {
        console.error('Firestore Passes Sync Error:', error);
      }
    );
  },

  // Save / Apply New Gate Pass to Cloud Database
  savePassToCloud: async (newPass: HomeLeavePass): Promise<void> => {
    const passId = newPass.id || `pass-${Date.now()}`;
    const docRef = doc(db, PASSES_COLLECTION, passId);
    await setDoc(docRef, { ...newPass, id: passId }, { merge: true });
  },

  // Update Pass Status (Approve / Reject / Gate Scan) in Cloud Database
  updatePassStatusInCloud: async (passId: string, status: LeaveStatus, extraData: Partial<HomeLeavePass> = {}): Promise<void> => {
    const docRef = doc(db, PASSES_COLLECTION, passId);
    await setDoc(docRef, { status, ...extraData }, { merge: true });
  },

  // ---------------- 🟢 3. 🛏️ ROOM ALLOCATION GLOBAL CLOUD SYNC ----------------

  // Live Real-Time Listener: Har device me Room & Bed Occupancy sync rahegi
  subscribeToRooms: (callback: (rooms: Room[]) => void) => {
    const colRef = collection(db, ROOMS_COLLECTION);
    return onSnapshot(
      colRef,
      (snapshot) => {
        if (!snapshot.empty) {
          const list: Room[] = [];
          snapshot.forEach((docSnap) => {
            list.push({ id: docSnap.id, ...docSnap.data() } as Room);
          });
          callback(list);
        }
      },
      (error) => {
        console.error('Firestore Rooms Sync Error:', error);
      }
    );
  },

  // Rooms aur Occupants ko Cloud Database me Save karna
  saveAllRoomsToCloud: async (roomsList: Room[]): Promise<void> => {
    try {
      for (const room of roomsList) {
        const docRef = doc(db, ROOMS_COLLECTION, room.id);
        await setDoc(docRef, room, { merge: true });
      }
    } catch (e) {
      console.error('Cloud Room Save Error:', e);
    }
  },

  // Room Delete hone par Cloud se hatana
  deleteRoomFromCloud: async (roomId: string): Promise<void> => {
    try {
      const docRef = doc(db, ROOMS_COLLECTION, roomId);
      await deleteDoc(docRef);
    } catch (e) {
      console.error('Cloud Room Delete Error:', e);
    }
  }
};