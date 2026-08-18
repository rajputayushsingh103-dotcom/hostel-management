// src/components/StudentManager.tsx
import React, { useState, useEffect } from 'react';
import { hostelDB, StudentRecord } from '../data/hostelDB';
import { UserMinus, UserPlus, Search, CheckCircle, DoorOpen, Edit3, X, ScanFace } from 'lucide-react';
import { BlockName, Role } from '../types';

interface StudentManagerProps {
  role?: Role;
}

export const StudentManager: React.FC<StudentManagerProps> = ({ role = 'warden' }) => {
  const [students, setStudents] = useState<StudentRecord[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  // Add State
  const [name, setName] = useState('');
  const [rollNo, setRollNo] = useState('');
  const [faceId, setFaceId] = useState('');
  const [roomNumber, setRoomNumber] = useState('');
  const [block, setBlock] = useState<BlockName>('Tagore');
  const [year, setYear] = useState<number>(1);
  const [password, setPassword] = useState('');
  const [parentPhone, setParentPhone] = useState('');

  // Edit State
  const [editingStudent, setEditingStudent] = useState<StudentRecord | null>(null);
  const [originalRollNo, setOriginalRollNo] = useState<string>('');

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
    if (window.confirm(`Kya aap ${student.name} (${student.rollNo}) ko remove karna chahte hain?`)) {
      const idToDelete = student.studentId || student.rollNo;
      await hostelDB.deleteStudent(idToDelete);
      setSuccessMsg(`Student ${student.name} deleted successfully.`);
      setTimeout(() => setSuccessMsg(''), 3000);
    }
  };

  const handleAddStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isReadOnly) return;
    if (!password.trim()) {
      alert('Password dalein!');
      return;
    }

    const cleanRoll = rollNo.trim().toUpperCase();
    const newStd: StudentRecord = {
      studentId: cleanRoll,
      name: name.trim(),
      rollNo: cleanRoll,
      faceId: faceId.trim() || `FID-${cleanRoll.slice(-3)}`,
      roomNumber: roomNumber.trim(),
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

    setSuccessMsg(`✅ Student ${newStd.name} (Face ID: ${newStd.faceId}) saved!`);
    setTimeout(() => setSuccessMsg(''), 4000);
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isReadOnly || !editingStudent) return;

    const newRoll = editingStudent.rollNo.trim().toUpperCase();
    const oldRoll = originalRollNo.trim().toUpperCase();

    if (oldRoll && oldRoll !== newRoll) {
      await hostelDB.deleteStudent(oldRoll);
    }

    const updatedData: StudentRecord = {
      ...editingStudent,
      studentId: newRoll,
      name: editingStudent.name.trim(),
      rollNo: newRoll,
      faceId: editingStudent.faceId?.trim() || `FID-${newRoll.slice(-3)}`,
      roomNumber: editingStudent.roomNumber.trim(),
      block: editingStudent.block,
      year: Number(editingStudent.year),
      parentPhone: editingStudent.parentPhone.trim(),
      password: editingStudent.password.trim(),
      registeredAt: editingStudent.registeredAt || new Date().toISOString().split('T')[0]
    };

    await hostelDB.addStudent(updatedData);
    setSuccessMsg(`✅ Student "${updatedData.name}" (${updatedData.rollNo}) updated!`);
    setEditingStudent(null);
    setOriginalRollNo('');
    setTimeout(() => setSuccessMsg(''), 4000);
  };

  const filtered = students.filter(
    (s) =>
      s.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.rollNo?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.faceId?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.roomNumber?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl text-white">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h2 className="text-xl font-bold flex items-center gap-2">
            <DoorOpen className="w-5 h-5 text-indigo-400" />
            <span>Hostel Student Records & Biometric Face Registry</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            {isReadOnly ? 'College Administration Monitoring Mode (View-Only)' : 'Chief Warden Executive Dashboard • Hardware Biometric ID Integration'}
          </p>
        </div>

        {!isReadOnly && (
          <button
            onClick={() => { setShowAddForm(!showAddForm); setEditingStudent(null); }}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-lg"
          >
            <UserPlus className="w-4 h-4" />
            <span>{showAddForm ? 'Cancel' : 'Register New Student'}</span>
          </button>
        )}
      </div>

      {successMsg && (
        <div className="mb-4 p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-emerald-400 text-xs flex items-center gap-2">
          <CheckCircle className="w-4 h-4" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* EDIT FORM */}
      {editingStudent && !isReadOnly && (
        <div className="mb-6 p-5 bg-slate-950 border-2 border-indigo-500/60 rounded-2xl">
          <div className="flex justify-between items-center mb-4 pb-2 border-b border-slate-800">
            <span className="text-indigo-300 font-bold text-xs uppercase">Edit Student: {editingStudent.name}</span>
            <button onClick={() => { setEditingStudent(null); setOriginalRollNo(''); }} className="text-slate-400 hover:text-white">
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
                  <span>Biometric Machine Face ID:</span>
                </label>
                <input
                  type="text"
                  value={editingStudent.faceId || ''}
                  onChange={(e) => setEditingStudent({ ...editingStudent, faceId: e.target.value })}
                  placeholder="e.g. 101 or FID-101"
                  className="w-full bg-slate-900 border border-emerald-500/60 rounded-xl p-2.5 text-emerald-300 font-bold font-mono"
                />
              </div>

              <div>
                <label className="block text-red-400 font-bold mb-1">Password (Login Password):</label>
                <input
                  type="text"
                  value={editingStudent.password}
                  onChange={(e) => setEditingStudent({ ...editingStudent, password: e.target.value })}
                  className="w-full bg-slate-900 border border-red-500/60 rounded-xl p-2.5 text-white font-bold"
                  required
                />
              </div>

              <div>
                <label className="block text-amber-300 font-bold mb-1">Room Number:</label>
                <input
                  type="text"
                  value={editingStudent.roomNumber}
                  onChange={(e) => setEditingStudent({ ...editingStudent, roomNumber: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-white font-bold"
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
                onClick={() => { setEditingStudent(null); setOriginalRollNo(''); }}
                className="px-4 py-2 bg-slate-800 rounded-xl text-xs text-slate-300"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 rounded-xl text-xs font-bold text-white shadow-lg"
              >
                Save Changes
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ADD FORM */}
      {showAddForm && !isReadOnly && (
        <form onSubmit={handleAddStudent} className="mb-6 p-4 bg-slate-950 border border-indigo-500/40 rounded-2xl space-y-3">
          <h3 className="text-xs font-bold text-indigo-400 uppercase tracking-wider">New Student Admission Form</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
            <input
              type="text"
              placeholder="Full Name"
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
              placeholder="Biometric Machine Face ID (e.g. 101)"
              value={faceId}
              onChange={(e) => setFaceId(e.target.value)}
              className="bg-slate-900 border border-emerald-500/40 rounded-xl p-2.5 text-emerald-300 font-mono"
            />
            <input
              type="text"
              placeholder="Room No (e.g. Tagore-201)"
              value={roomNumber}
              onChange={(e) => setRoomNumber(e.target.value)}
              className="bg-slate-900 border border-slate-800 rounded-xl p-2.5 text-white"
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
          <button type="submit" className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 rounded-xl font-bold text-xs mt-2 text-white shadow-lg">
            Save Student & Face ID
          </button>
        </form>
      )}

      {/* Search */}
      <div className="relative mb-4">
        <input
          type="text"
          placeholder="Search student by name, roll no, face ID, room..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-4 py-2 text-xs text-white"
        />
        <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="border-b border-slate-800 text-slate-400">
              <th className="py-2.5 px-3">Roll No</th>
              <th className="py-2.5 px-3">Face ID</th>
              <th className="py-2.5 px-3">Name</th>
              <th className="py-2.5 px-3">Room</th>
              <th className="py-2.5 px-3">Year</th>
              <th className="py-2.5 px-3">Password</th>
              <th className="py-2.5 px-3">Parent Phone</th>
              {!isReadOnly && <th className="py-2.5 px-3 text-right">Actions</th>}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60">
            {filtered.map((std) => (
              <tr key={std.studentId || std.rollNo} className="hover:bg-slate-950/50">
                <td className="py-3 px-3 font-mono font-bold text-indigo-400">{std.rollNo}</td>
                <td className="py-3 px-3 font-mono font-bold text-emerald-400">
                  <span className="bg-emerald-950/60 border border-emerald-500/30 px-2 py-0.5 rounded-md">
                    {std.faceId || `FID-${std.rollNo.slice(-3)}`}
                  </span>
                </td>
                <td className="py-3 px-3 font-semibold text-white">{std.name}</td>
                <td className="py-3 px-3 text-amber-400 font-bold">{std.roomNumber} ({std.block})</td>
                <td className="py-3 px-3 text-emerald-400">{std.year} Year</td>
                <td className="py-3 px-3 font-mono text-slate-300 bg-slate-950/60 px-2 py-1 rounded">{std.password}</td>
                <td className="py-3 px-3 text-slate-400">{std.parentPhone}</td>
                {!isReadOnly && (
                  <td className="py-3 px-3 text-right">
                    <div className="inline-flex items-center gap-1.5">
                      <button
                        onClick={() => { 
                          setEditingStudent({ ...std }); 
                          setOriginalRollNo(std.rollNo); 
                          setShowAddForm(false); 
                        }}
                        className="px-2.5 py-1.5 bg-indigo-500/10 hover:bg-indigo-600 text-indigo-400 hover:text-white rounded-lg text-[11px] font-bold"
                      >
                        <Edit3 className="w-3.5 h-3.5 inline mr-1" />
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeleteStudent(std)}
                        className="px-2.5 py-1.5 bg-red-500/10 hover:bg-red-600 text-red-400 hover:text-white rounded-lg text-[11px] font-bold"
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
  );
};