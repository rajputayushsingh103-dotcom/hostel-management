// src/components/StudentManager.tsx
import React, { useState, useEffect } from 'react';
import { hostelDB, StudentRecord } from '../data/hostelDB';
import {
  UserMinus,
  UserPlus,
  Search,
  CheckCircle,
  DoorOpen,
  Edit3,
  X,
  ScanFace,
  Folder,
  FolderOpen,
  ChevronDown,
  ChevronUp,
  AlertCircle,
  Building
} from 'lucide-react';
import { BlockName, Role, Room } from '../types';

interface StudentManagerProps {
  role?: Role;
  rooms?: Room[];
  onAutoAllotToRoom?: (roomNumber: string, block: BlockName, studentData: any) => { success: boolean; message: string };
  onReallotStudentRoom?: (oldRoomNumber: string, newRoomNumber: string, block: BlockName, studentData: any) => { success: boolean; message: string };
  onRemoveOccupantFromRoom?: (roomNumber: string, studentRoll: string) => void;
}

export const StudentManager: React.FC<StudentManagerProps> = ({
  role = 'warden',
  rooms = [],
  onAutoAllotToRoom,
  onReallotStudentRoom,
  onRemoveOccupantFromRoom
}) => {
  const [students, setStudents] = useState<StudentRecord[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState('');
  
  const [isFolderOpen, setIsFolderOpen] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // Add State
  const [name, setName] = useState('');
  const [rollNo, setRollNo] = useState('');
  const [faceId, setFaceId] = useState('');
  const [roomNumber, setRoomNumber] = useState('');
  const [block, setBlock] = useState<BlockName>('Tagore');
  const [year, setYear] = useState<number>(1);
  const [password, setPassword] = useState('');
  const [parentPhone, setParentPhone] = useState('');

  // Edit State & Original Room Store
  const [editingStudent, setEditingStudent] = useState<StudentRecord | null>(null);
  const [originalRollNo, setOriginalRollNo] = useState<string>('');
  const [originalRoomNo, setOriginalRoomNo] = useState<string>('');

  const isReadOnly = role === 'college_admin';

  useEffect(() => {
    setLoading(true);
    const unsubscribe = hostelDB.subscribeToStudents((cloudStudents) => {
      setStudents(cloudStudents);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const handleDeleteStudent = async (student: StudentRecord) => {
    if (isReadOnly) return;
    if (window.confirm(`Kya aap ${student.name} (${student.rollNo}) ko database aur room se remove karna chahte hain?`)) {
      const idToDelete = student.studentId || student.rollNo;
      await hostelDB.deleteStudent(idToDelete);

      if (onRemoveOccupantFromRoom) {
        onRemoveOccupantFromRoom(student.roomNumber, student.rollNo);
      }

      setSuccessMsg(`Student ${student.name} removed from Database and Room Allotment.`);
      setTimeout(() => setSuccessMsg(''), 3500);
    }
  };

  // ADD STUDENT
  const handleAddStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (isReadOnly) return;
    if (!password.trim()) {
      setErrorMsg('Password daalna anivarya hai!');
      return;
    }

    const cleanRoll = rollNo.trim().toUpperCase();
    const cleanRoom = roomNumber.trim();

    if (onAutoAllotToRoom) {
      const allotResult = onAutoAllotToRoom(cleanRoom, block, {
        name: name.trim(),
        rollNo: cleanRoll,
        branch: 'Computer Science / Engg',
        year: Number(year),
        phone: '+91 98765 43210',
        parentPhone: parentPhone.trim(),
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80',
        hostelAttendanceToday: 'present',
        collegeAttendanceToday: 'present'
      });

      if (!allotResult.success) {
        setErrorMsg(allotResult.message);
        return;
      }
    }

    const newStd: StudentRecord = {
      studentId: cleanRoll,
      name: name.trim(),
      rollNo: cleanRoll,
      faceId: faceId.trim() || `FID-${cleanRoll.slice(-3)}`,
      roomNumber: cleanRoom,
      block,
      year: Number(year),
      password: password.trim(),
      parentPhone: parentPhone.trim(),
      registeredAt: new Date().toISOString().split('T')[0]
    };

    await hostelDB.addStudent(newStd);
    setShowAddForm(false);
    setName('');
    setRollNo('');
    setFaceId('');
    setRoomNumber('');
    setPassword('');
    setParentPhone('');

    setSuccessMsg(`✅ Student ${newStd.name} registered & allotted to Room ${cleanRoom}!`);
    setTimeout(() => setSuccessMsg(''), 4500);
  };

  // 🟢 SAVE EDIT WITH AUTOMATIC ROOM RE-ALLOTMENT & CAPACITY VALIDATION
  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (isReadOnly || !editingStudent) return;

    const newRoll = editingStudent.rollNo.trim().toUpperCase();
    const oldRoll = originalRollNo.trim().toUpperCase();
    const newRoom = editingStudent.roomNumber.trim();
    const oldRoom = originalRoomNo.trim();

    // 🟢 Room Transfer Check (Old Room -> New Room)
    if (onReallotStudentRoom) {
      const reallotResult = onReallotStudentRoom(oldRoom, newRoom, editingStudent.block, {
        name: editingStudent.name.trim(),
        rollNo: newRoll,
        branch: 'Computer Science / Engg',
        year: Number(editingStudent.year),
        phone: '+91 98765 43210',
        parentPhone: editingStudent.parentPhone.trim(),
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80',
        hostelAttendanceToday: 'present',
        collegeAttendanceToday: 'present'
      });

      if (!reallotResult.success) {
        setErrorMsg(reallotResult.message);
        return; // ⛔ STOP if new room is full!
      }
    }

    if (oldRoll && oldRoll !== newRoll) {
      await hostelDB.deleteStudent(oldRoll);
    }

    const updatedData: StudentRecord = {
      ...editingStudent,
      studentId: newRoll,
      name: editingStudent.name.trim(),
      rollNo: newRoll,
      faceId: editingStudent.faceId?.trim() || `FID-${newRoll.slice(-3)}`,
      roomNumber: newRoom,
      block: editingStudent.block,
      year: Number(editingStudent.year),
      parentPhone: editingStudent.parentPhone.trim(),
      password: editingStudent.password.trim(),
      registeredAt: editingStudent.registeredAt || new Date().toISOString().split('T')[0]
    };

    await hostelDB.addStudent(updatedData);
    setSuccessMsg(`✅ Student "${updatedData.name}" updated & successfully moved to Room ${newRoom}!`);
    setEditingStudent(null);
    setOriginalRollNo('');
    setOriginalRoomNo('');
    setTimeout(() => setSuccessMsg(''), 4500);
  };

  const filtered = students.filter(
    (s) =>
      s.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.rollNo?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.faceId?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.roomNumber?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 sm:p-6 shadow-xl text-white space-y-4">
      {/* Folder Header Card */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div
          onClick={() => setIsFolderOpen(!isFolderOpen)}
          className="flex items-center gap-3.5 cursor-pointer group select-none"
        >
          <div className={`p-3 rounded-2xl border transition-all shadow-md ${
            isFolderOpen
              ? 'bg-indigo-600 border-indigo-400 text-white shadow-indigo-600/30'
              : 'bg-slate-950 border-slate-800 text-indigo-400 group-hover:border-indigo-500/50'
          }`}>
            {isFolderOpen ? <FolderOpen className="w-6 h-6" /> : <Folder className="w-6 h-6" />}
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base sm:text-lg font-black text-white group-hover:text-indigo-300 transition-colors">
                Student Information & Admission Directory
              </h2>
              <span className="text-xs font-mono font-extrabold bg-indigo-500/20 text-indigo-300 px-2.5 py-0.5 rounded-full border border-indigo-500/30">
                {students.length} Students
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5 flex items-center gap-1">
              <span>{isFolderOpen ? 'Click to minimize directory folder' : 'Click to expand student records database'}</span>
              {isFolderOpen ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 self-start sm:self-auto">
          {!isReadOnly && (
            <button
              onClick={() => {
                setShowAddForm(!showAddForm);
                setEditingStudent(null);
                setErrorMsg('');
                if (!isFolderOpen) setIsFolderOpen(true);
              }}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-lg shadow-indigo-600/20 transition-all"
            >
              <UserPlus className="w-4 h-4" />
              <span>{showAddForm ? 'Cancel Admission' : '+ New Student Admission'}</span>
            </button>
          )}

          <button
            onClick={() => setIsFolderOpen(!isFolderOpen)}
            className="px-3 py-2 bg-slate-950 hover:bg-slate-800 text-slate-300 rounded-xl text-xs font-semibold border border-slate-800 flex items-center gap-1.5 transition-all"
          >
            <span>{isFolderOpen ? 'Collapse ▲' : 'Open Folder ▼'}</span>
          </button>
        </div>
      </div>

      {successMsg && (
        <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-emerald-400 text-xs flex items-center gap-2 animate-fadeIn">
          <CheckCircle className="w-4 h-4 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {errorMsg && (
        <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl text-rose-400 text-xs flex items-center gap-2 animate-fadeIn">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* FOLDER CONTENT */}
      {isFolderOpen && (
        <div className="pt-3 border-t border-slate-800/80 space-y-4 animate-fadeIn">
          
          {/* EDIT FORM */}
          {editingStudent && !isReadOnly && (
            <div className="p-5 bg-slate-950 border-2 border-indigo-500/60 rounded-2xl space-y-4 shadow-xl">
              <div className="flex justify-between items-center pb-2 border-b border-slate-800">
                <span className="text-indigo-300 font-bold text-xs uppercase flex items-center gap-1.5">
                  <Edit3 className="w-3.5 h-3.5 text-indigo-400" />
                  Edit Student & Room Allotment: {editingStudent.name}
                </span>
                <button onClick={() => { setEditingStudent(null); setOriginalRollNo(''); setOriginalRoomNo(''); setErrorMsg(''); }} className="text-slate-400 hover:text-white">
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleSaveEdit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                  <div>
                    <label className="block text-slate-300 mb-1">Student Full Name:</label>
                    <input
                      type="text"
                      value={editingStudent.name}
                      onChange={(e) => setEditingStudent({ ...editingStudent, name: e.target.value })}
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-white"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-indigo-400 font-bold mb-1">Roll Number (Login ID):</label>
                    <input
                      type="text"
                      value={editingStudent.rollNo}
                      onChange={(e) => setEditingStudent({ ...editingStudent, rollNo: e.target.value })}
                      className="w-full bg-slate-900 border border-indigo-500/60 rounded-xl p-2.5 text-white font-bold font-mono"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-emerald-400 font-bold mb-1 flex items-center gap-1">
                      <ScanFace className="w-3.5 h-3.5" />
                      <span>Biometric Face ID:</span>
                    </label>
                    <input
                      type="text"
                      value={editingStudent.faceId || ''}
                      onChange={(e) => setEditingStudent({ ...editingStudent, faceId: e.target.value })}
                      placeholder="e.g. 101 or FID-101"
                      className="w-full bg-slate-900 border border-emerald-500/60 rounded-xl p-2.5 text-emerald-300 font-bold font-mono"
                    />
                  </div>

                  {/* 🟢 EDIT ROOM NUMBER */}
                  <div>
                    <label className="block text-amber-300 font-bold mb-1">Room Number (Auto Allots to Room):</label>
                    <input
                      type="text"
                      value={editingStudent.roomNumber}
                      onChange={(e) => {
                        setEditingStudent({ ...editingStudent, roomNumber: e.target.value });
                        setErrorMsg('');
                      }}
                      className="w-full bg-slate-900 border border-amber-500/60 rounded-xl p-2.5 text-amber-300 font-bold"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-slate-300 mb-1">Hostel Block:</label>
                    <select
                      value={editingStudent.block}
                      onChange={(e) => setEditingStudent({ ...editingStudent, block: e.target.value as BlockName })}
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-white"
                    >
                      <option value="Tagore">Tagore</option>
                      <option value="Tilak">Tilak</option>
                      <option value="Subhash">Subhash</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-slate-300 mb-1">Academic Year:</label>
                    <select
                      value={editingStudent.year}
                      onChange={(e) => setEditingStudent({ ...editingStudent, year: Number(e.target.value) })}
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-white"
                    >
                      <option value={1}>1st Year</option>
                      <option value={2}>2nd Year</option>
                      <option value={3}>3rd Year</option>
                      <option value={4}>4th Year</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-red-400 font-bold mb-1">Password (Login):</label>
                    <input
                      type="text"
                      value={editingStudent.password}
                      onChange={(e) => setEditingStudent({ ...editingStudent, password: e.target.value })}
                      className="w-full bg-slate-900 border border-red-500/60 rounded-xl p-2.5 text-white font-bold"
                      required
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-slate-300 mb-1">Parent Phone:</label>
                    <input
                      type="text"
                      value={editingStudent.parentPhone}
                      onChange={(e) => setEditingStudent({ ...editingStudent, parentPhone: e.target.value })}
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-white"
                      required
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
                  <button
                    type="button"
                    onClick={() => { setEditingStudent(null); setOriginalRollNo(''); setOriginalRoomNo(''); setErrorMsg(''); }}
                    className="px-4 py-2 bg-slate-800 text-slate-300 rounded-xl text-xs"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 rounded-xl text-xs font-bold text-white shadow-lg"
                  >
                    Save Changes & Update Room
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* ADD FORM */}
          {showAddForm && !isReadOnly && (
            <form onSubmit={handleAddStudent} className="p-5 bg-slate-950 border border-indigo-500/40 rounded-2xl space-y-3 shadow-xl">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <h3 className="text-xs font-bold text-indigo-400 uppercase tracking-wider flex items-center gap-1.5">
                  <UserPlus className="w-4 h-4" />
                  New Student Admission & Auto Room Allocation Form
                </h3>
                <span className="text-[10px] text-emerald-400 font-mono">Live Capacity Checked</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                <input
                  type="text"
                  placeholder="Student Full Name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="bg-slate-900 border border-slate-800 rounded-xl p-2.5 text-white"
                  required
                />
                <input
                  type="text"
                  placeholder="Roll Number (Login ID)"
                  value={rollNo}
                  onChange={(e) => setRollNo(e.target.value)}
                  className="bg-slate-900 border border-slate-800 rounded-xl p-2.5 text-white font-mono"
                  required
                />
                <input
                  type="text"
                  placeholder="Biometric Face ID (e.g. 101)"
                  value={faceId}
                  onChange={(e) => setFaceId(e.target.value)}
                  className="bg-slate-900 border border-emerald-500/40 rounded-xl p-2.5 text-emerald-300 font-mono"
                />
                <input
                  type="text"
                  placeholder="Room No (e.g. Tagore-101 or Tilak-201)"
                  value={roomNumber}
                  onChange={(e) => {
                    setRoomNumber(e.target.value);
                    setErrorMsg('');
                  }}
                  className="bg-slate-900 border border-amber-500/50 rounded-xl p-2.5 text-amber-300 font-bold"
                  required
                />
                <select
                  value={block}
                  onChange={(e) => setBlock(e.target.value as BlockName)}
                  className="bg-slate-900 border border-slate-800 rounded-xl p-2.5 text-white"
                >
                  <option value="Tagore">Tagore Block</option>
                  <option value="Tilak">Tilak Block</option>
                  <option value="Subhash">Subhash Block</option>
                </select>
                <select
                  value={year}
                  onChange={(e) => setYear(Number(e.target.value))}
                  className="bg-slate-900 border border-slate-800 rounded-xl p-2.5 text-white"
                >
                  <option value={1}>1st Year</option>
                  <option value={2}>2nd Year</option>
                  <option value={3}>3rd Year</option>
                  <option value={4}>4th Year</option>
                </select>
                <input
                  type="text"
                  placeholder="Parent Phone"
                  value={parentPhone}
                  onChange={(e) => setParentPhone(e.target.value)}
                  className="bg-slate-900 border border-slate-800 rounded-xl p-2.5 text-white"
                  required
                />
                <div className="sm:col-span-2">
                  <input
                    type="text"
                    placeholder="Set Student Password for Login"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-slate-900 border border-emerald-500/50 rounded-xl p-2.5 text-white font-bold"
                    required
                  />
                </div>
              </div>

              <button type="submit" className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 rounded-xl font-bold text-xs mt-2 text-white shadow-lg flex items-center justify-center gap-2">
                <DoorOpen className="w-4 h-4" />
                <span>Save Student & Allocate Room</span>
              </button>
            </form>
          )}

          {/* Quick Search */}
          <div className="relative">
            <input
              type="text"
              placeholder="Search 400+ students by name, roll no, face ID, room..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-2xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 shadow-inner"
            />
            <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
          </div>

          {/* Table Container */}
          <div className="overflow-x-auto rounded-2xl border border-slate-800 max-h-[420px] overflow-y-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-slate-950 text-slate-400 uppercase tracking-wider font-semibold sticky top-0 z-10 border-b border-slate-800">
                <tr>
                  <th className="py-3 px-3.5">Roll No</th>
                  <th className="py-3 px-3.5">Face ID</th>
                  <th className="py-3 px-3.5">Name</th>
                  <th className="py-3 px-3.5">Room & Block</th>
                  <th className="py-3 px-3.5">Year</th>
                  <th className="py-3 px-3.5">Password</th>
                  <th className="py-3 px-3.5">Parent Phone</th>
                  {!isReadOnly && <th className="py-3 px-3.5 text-right">Actions</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 bg-slate-900/40">
                {filtered.map((std) => (
                  <tr key={std.studentId || std.rollNo} className="hover:bg-slate-950/60 transition-colors">
                    <td className="py-3 px-3.5 font-mono font-bold text-indigo-400">{std.rollNo}</td>
                    <td className="py-3 px-3.5 font-mono font-bold text-emerald-400">
                      <span className="bg-emerald-950/60 border border-emerald-500/30 px-2 py-0.5 rounded-md text-[11px]">
                        {std.faceId || `FID-${std.rollNo.slice(-3)}`}
                      </span>
                    </td>
                    <td className="py-3 px-3.5 font-semibold text-white">{std.name}</td>
                    <td className="py-3 px-3.5 text-amber-400 font-bold">{std.roomNumber} ({std.block})</td>
                    <td className="py-3 px-3.5 text-emerald-400">{std.year} Year</td>
                    <td className="py-3 px-3.5 font-mono text-slate-300 bg-slate-950/60 px-2 py-1 rounded">{std.password}</td>
                    <td className="py-3 px-3.5 text-slate-400">{std.parentPhone}</td>
                    {!isReadOnly && (
                      <td className="py-3 px-3.5 text-right">
                        <div className="inline-flex items-center gap-1.5">
                          <button
                            onClick={() => { 
                              setEditingStudent({ ...std }); 
                              setOriginalRollNo(std.rollNo); 
                              setOriginalRoomNo(std.roomNumber); // 👈 Store old room for safe transfer
                              setShowAddForm(false);
                              setErrorMsg('');
                            }}
                            className="px-2.5 py-1.5 bg-indigo-500/10 hover:bg-indigo-600 text-indigo-400 hover:text-white rounded-lg text-[11px] font-bold transition-colors"
                          >
                            <Edit3 className="w-3.5 h-3.5 inline mr-1" />
                            Edit
                          </button>
                          <button
                            onClick={() => handleDeleteStudent(std)}
                            className="px-2.5 py-1.5 bg-red-500/10 hover:bg-red-600 text-red-400 hover:text-white rounded-lg text-[11px] font-bold transition-colors"
                          >
                            <UserMinus className="w-3.5 h-3.5 inline mr-1" />
                            Remove
                          </button>
                        </div>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};