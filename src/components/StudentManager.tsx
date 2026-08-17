// src/components/StudentManager.tsx
import React, { useState } from 'react';
import { hostelDB, StudentRecord } from '../data/hostelDB';
import { UserMinus, UserPlus, Search, CheckCircle, Phone, DoorOpen, Edit3, X, Save, Lock, Building2, Calendar } from 'lucide-react';
import { BlockName } from '../types';

export const StudentManager: React.FC = () => {
  const [students, setStudents] = useState<StudentRecord[]>(() => hostelDB.getAllStudents());
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  // ➕ Add New Student State
  const [name, setName] = useState('');
  const [rollNo, setRollNo] = useState('');
  const [roomNumber, setRoomNumber] = useState('');
  const [block, setBlock] = useState<BlockName>('Tagore');
  const [year, setYear] = useState<number>(1);
  const [password, setPassword] = useState(''); // Password state
  const [parentPhone, setParentPhone] = useState('');

  // ✏️ Edit Student State
  const [editingStudent, setEditingStudent] = useState<StudentRecord | null>(null);

  // 🗑️ Delete Function
  const handleDeleteStudent = (student: StudentRecord) => {
    const confirmDelete = window.confirm(
      `Kya aap sach me ${student.name} (Roll: ${student.rollNo}) ko database se delete karna chahte hain?`
    );

    if (confirmDelete) {
      hostelDB.deleteStudent(student.studentId);
      setStudents(hostelDB.getAllStudents());
      setSuccessMsg(`Student ${student.name} ko successfully remove kar diya gaya.`);
      setTimeout(() => setSuccessMsg(''), 3000);
    }
  };

  // ➕ Add New Student Function (With Custom Password)
  const handleAddStudent = (e: React.FormEvent) => {
    e.preventDefault();

    if (!password.trim()) {
      alert('Kripya student ka password dalein!');
      return;
    }

    const newStudent: StudentRecord = {
      studentId: `std-${Date.now()}`,
      name: name.trim(),
      rollNo: rollNo.trim(),
      roomNumber: roomNumber.trim(),
      block,
      year: Number(year),
      password: password.trim(), // Warden set karega password
      parentPhone: parentPhone.trim(),
      registeredAt: new Date().toISOString().split('T')[0]
    };

    hostelDB.addStudent(newStudent);
    setStudents(hostelDB.getAllStudents());
    setShowAddForm(false);
    
    // Form Reset
    setName('');
    setRollNo('');
    setRoomNumber('');
    setPassword('');
    setParentPhone('');

    setSuccessMsg(`✅ Naya student ${newStudent.name} (Password: ${newStudent.password}) successfully add ho gaya!`);
    setTimeout(() => setSuccessMsg(''), 4000);
  };

  // ✏️ Save Edited Details & Password
  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingStudent) return;

    // Database Update
    hostelDB.updateStudent(editingStudent.studentId, {
      name: editingStudent.name.trim(),
      rollNo: editingStudent.rollNo.trim(),
      roomNumber: editingStudent.roomNumber.trim(),
      block: editingStudent.block,
      year: Number(editingStudent.year),
      parentPhone: editingStudent.parentPhone.trim(),
      password: editingStudent.password.trim() // Updated Password
    });

    // Screen State Update
    setStudents(hostelDB.getAllStudents());
    setSuccessMsg(
      `✅ Updated: ${editingStudent.name} ka Room (${editingStudent.roomNumber}), Year (${editingStudent.year}th Yr), Phone aur Password successfully save ho gaya!`
    );
    setEditingStudent(null);
    setTimeout(() => setSuccessMsg(''), 4000);
  };

  const filteredStudents = students.filter(
    (s) =>
      s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.rollNo.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.roomNumber.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl text-white">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h2 className="text-xl font-bold flex items-center gap-2">
            <DoorOpen className="w-5 h-5 text-indigo-400" />
            <span>Hostel Student Records & Room Allocation Manager</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Total Enrolled Students: <span className="text-indigo-400 font-bold">{students.length}</span>
          </p>
        </div>

        <button
          onClick={() => { setShowAddForm(!showAddForm); setEditingStudent(null); }}
          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-lg transition-all"
        >
          <UserPlus className="w-4 h-4" />
          <span>{showAddForm ? 'Cancel Form' : 'Register New Student'}</span>
        </button>
      </div>

      {/* Success Notification */}
      {successMsg && (
        <div className="mb-4 p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-emerald-400 text-xs flex items-center gap-2">
          <CheckCircle className="w-4 h-4" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* ✏️ EDIT STUDENT MODAL / FORM */}
      {editingStudent && (
        <div className="mb-6 p-5 bg-slate-950 border-2 border-indigo-500/60 rounded-2xl shadow-2xl">
          <div className="flex justify-between items-center mb-4 pb-2 border-b border-slate-800">
            <div className="flex items-center gap-2 text-indigo-300 font-bold text-sm">
              <Edit3 className="w-4 h-4 text-indigo-400" />
              <span>Edit Student Profile: {editingStudent.name} (Roll: {editingStudent.rollNo})</span>
            </div>
            <button onClick={() => setEditingStudent(null)} className="text-slate-400 hover:text-white">
              <X className="w-4 h-4" />
            </button>
          </div>

          <form onSubmit={handleSaveEdit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 text-xs">
              
              {/* Student Name */}
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

              {/* Room Number */}
              <div>
                <label className="block text-amber-300 font-bold mb-1 flex items-center gap-1">
                  <DoorOpen className="w-3.5 h-3.5 text-amber-400" />
                  <span>Room Number:</span>
                </label>
                <input
                  type="text"
                  value={editingStudent.roomNumber}
                  onChange={(e) => setEditingStudent({ ...editingStudent, roomNumber: e.target.value })}
                  className="w-full bg-slate-900 border border-amber-500/60 rounded-xl p-2.5 text-white font-bold"
                  required
                />
              </div>

              {/* Hostel Block */}
              <div>
                <label className="block text-amber-300 font-bold mb-1 flex items-center gap-1">
                  <Building2 className="w-3.5 h-3.5 text-amber-400" />
                  <span>Hostel Block:</span>
                </label>
                <select
                  value={editingStudent.block}
                  onChange={(e) => setEditingStudent({ ...editingStudent, block: e.target.value as BlockName })}
                  className="w-full bg-slate-900 border border-amber-500/60 rounded-xl p-2.5 text-white font-semibold"
                >
                  <option value="Tagore">Tagore Block</option>
                  <option value="Tilak">Tilak Block</option>
                  <option value="Subhash">Subhash Block</option>
                </select>
              </div>

              {/* Academic Year */}
              <div>
                <label className="block text-emerald-300 font-bold mb-1 flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Academic Year:</span>
                </label>
                <select
                  value={editingStudent.year}
                  onChange={(e) => setEditingStudent({ ...editingStudent, year: Number(e.target.value) })}
                  className="w-full bg-slate-900 border border-emerald-500/60 rounded-xl p-2.5 text-white font-semibold"
                >
                  <option value={1}>1st Year</option>
                  <option value={2}>2nd Year</option>
                  <option value={3}>3rd Year</option>
                  <option value={4}>4th Year</option>
                </select>
              </div>

              {/* Parent Contact Phone */}
              <div>
                <label className="block text-sky-300 font-bold mb-1 flex items-center gap-1">
                  <Phone className="w-3.5 h-3.5 text-sky-400" />
                  <span>Parent Contact Phone:</span>
                </label>
                <input
                  type="text"
                  value={editingStudent.parentPhone}
                  onChange={(e) => setEditingStudent({ ...editingStudent, parentPhone: e.target.value })}
                  className="w-full bg-slate-900 border border-sky-500/60 rounded-xl p-2.5 text-white"
                  required
                />
              </div>

              {/* 🔑 EDIT PASSWORD */}
              <div>
                <label className="block text-red-300 font-bold mb-1 flex items-center gap-1">
                  <Lock className="w-3.5 h-3.5 text-red-400" />
                  <span>Change Password:</span>
                </label>
                <input
                  type="text"
                  value={editingStudent.password}
                  onChange={(e) => setEditingStudent({ ...editingStudent, password: e.target.value })}
                  className="w-full bg-slate-900 border border-red-500/60 rounded-xl p-2.5 text-white font-bold"
                  placeholder="Set New Password"
                  required
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-800/80">
              <button
                type="button"
                onClick={() => setEditingStudent(null)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 rounded-xl text-xs font-bold text-slate-300"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 bg-gradient-to-r from-indigo-600 to-emerald-600 hover:from-indigo-500 hover:to-emerald-500 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-lg text-white"
              >
                <Save className="w-3.5 h-3.5" />
                <span>Save All Changes to Database</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ➕ ADD NEW STUDENT FORM (With Password Input) */}
      {showAddForm && (
        <form onSubmit={handleAddStudent} className="mb-6 p-4 bg-slate-950 border border-indigo-500/40 rounded-2xl space-y-3 shadow-xl">
          <h3 className="text-xs font-bold text-indigo-400 uppercase tracking-wider flex items-center gap-1.5">
            <UserPlus className="w-4 h-4" />
            <span>New Student Admission Form</span>
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
            <div>
              <label className="block text-slate-400 mb-1">Student Full Name:</label>
              <input
                type="text"
                placeholder="Full Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2.5 text-white"
                required
              />
            </div>
            <div>
              <label className="block text-slate-400 mb-1">Roll Number:</label>
              <input
                type="text"
                placeholder="e.g. 2024CS105"
                value={rollNo}
                onChange={(e) => setRollNo(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2.5 text-white"
                required
              />
            </div>
            <div>
              <label className="block text-slate-400 mb-1">Room Number:</label>
              <input
                type="text"
                placeholder="e.g. Tagore-201"
                value={roomNumber}
                onChange={(e) => setRoomNumber(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2.5 text-white"
                required
              />
            </div>
            <div>
              <label className="block text-slate-400 mb-1">Hostel Block:</label>
              <select
                value={block}
                onChange={(e) => setBlock(e.target.value as BlockName)}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2.5 text-white"
              >
                <option value="Tagore">Tagore Block</option>
                <option value="Tilak">Tilak Block</option>
                <option value="Subhash">Subhash Block</option>
              </select>
            </div>
            <div>
              <label className="block text-slate-400 mb-1">Academic Year:</label>
              <select
                value={year}
                onChange={(e) => setYear(Number(e.target.value))}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2.5 text-white"
              >
                <option value={1}>1st Year</option>
                <option value={2}>2nd Year</option>
                <option value={3}>3rd Year</option>
                <option value={4}>4th Year</option>
              </select>
            </div>
            <div>
              <label className="block text-slate-400 mb-1">Parent Phone:</label>
              <input
                type="text"
                placeholder="+91 98765 43210"
                value={parentPhone}
                onChange={(e) => setParentPhone(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2.5 text-white"
                required
              />
            </div>
            
            {/* 🔑 NEW: SET PASSWORD INPUT */}
            <div className="sm:col-span-3">
              <label className="block text-emerald-400 font-bold mb-1">Set Student Portal Login Password:</label>
              <input
                type="text"
                placeholder="Enter password for student login (e.g. rahul@123)"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-slate-900 border border-emerald-500/50 rounded-xl p-2.5 text-white font-bold"
                required
              />
            </div>
          </div>

          <button type="submit" className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 rounded-xl font-bold text-xs mt-2 text-white shadow-lg">
            Save Student & Password to Database
          </button>
        </form>
      )}

      {/* Search Bar */}
      <div className="relative mb-4">
        <input
          type="text"
          placeholder="Search student by Name, Roll No or Room..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-4 py-2 text-xs text-white focus:border-indigo-500"
        />
        <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="border-b border-slate-800 text-slate-400">
              <th className="py-2.5 px-3">Roll No</th>
              <th className="py-2.5 px-3">Name</th>
              <th className="py-2.5 px-3">Room & Block</th>
              <th className="py-2.5 px-3">Year</th>
              <th className="py-2.5 px-3">Password</th>
              <th className="py-2.5 px-3">Parent Phone</th>
              <th className="py-2.5 px-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60">
            {filteredStudents.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-6 text-center text-slate-500">
                  Database me koi student nahi mila.
                </td>
              </tr>
            ) : (
              filteredStudents.map((std) => (
                <tr key={std.studentId} className="hover:bg-slate-950/50 transition-colors">
                  <td className="py-3 px-3 font-mono font-bold text-indigo-400">{std.rollNo}</td>
                  <td className="py-3 px-3 font-semibold text-white">{std.name}</td>
                  <td className="py-3 px-3 text-amber-400 font-bold">{std.roomNumber} <span className="text-slate-400 font-normal">({std.block})</span></td>
                  <td className="py-3 px-3 text-emerald-400 font-semibold">{std.year} Year</td>
                  <td className="py-3 px-3 font-mono text-slate-300 bg-slate-950/60 px-2 py-1 rounded">{std.password}</td>
                  <td className="py-3 px-3 text-slate-400">{std.parentPhone}</td>
                  <td className="py-3 px-3 text-right">
                    <div className="inline-flex items-center gap-1.5">
                      <button
                        onClick={() => { setEditingStudent({ ...std }); setShowAddForm(false); }}
                        title="Room, Block, Year aur Password update karein"
                        className="px-2.5 py-1.5 bg-indigo-500/10 hover:bg-indigo-600 text-indigo-400 hover:text-white border border-indigo-500/30 rounded-lg text-[11px] font-bold transition-all inline-flex items-center gap-1"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                        <span>Edit</span>
                      </button>

                      <button
                        onClick={() => handleDeleteStudent(std)}
                        title="Hostel chhodne par delete karein"
                        className="px-2.5 py-1.5 bg-red-500/10 hover:bg-red-600 text-red-400 hover:text-white border border-red-500/30 rounded-lg text-[11px] font-bold transition-all inline-flex items-center gap-1"
                      >
                        <UserMinus className="w-3.5 h-3.5" />
                        <span>Remove</span>
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};