// src/components/StudentManager.tsx
import React, { useState } from 'react';
import { hostelDB, StudentRecord } from '../data/hostelDB';
import { UserMinus, UserPlus, Search, CheckCircle, Phone, DoorOpen, Edit3, X, Save, Building2, Calendar, UserCheck } from 'lucide-react';
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
  const [password, setPassword] = useState('student@123');
  const [parentPhone, setParentPhone] = useState('');

  // ✏️ Edit Student State
  const [editingStudent, setEditingStudent] = useState<StudentRecord | null>(null);

  // 🗑️ Delete Function
  const handleDeleteStudent = (student: StudentRecord) => {
    const confirmDelete = window.confirm(
      `Kya aap sach me ${student.name} (Roll: ${student.rollNo}) ko hostel database se remove karna chahte hain?`
    );

    if (confirmDelete) {
      hostelDB.deleteStudent(student.studentId);
      setStudents(hostelDB.getAllStudents());
      setSuccessMsg(`Student ${student.name} ko successfully remove kar diya gaya.`);
      setTimeout(() => setSuccessMsg(''), 3000);
    }
  };

  // ➕ Add Function
  const handleAddStudent = (e: React.FormEvent) => {
    e.preventDefault();
    const newStudent: StudentRecord = {
      studentId: `std-${Date.now()}`,
      name,
      rollNo,
      roomNumber,
      block,
      year: Number(year),
      password: password || 'student@123',
      parentPhone,
      registeredAt: new Date().toISOString().split('T')[0]
    };

    hostelDB.addStudent(newStudent);
    setStudents(hostelDB.getAllStudents());
    setShowAddForm(false);
    
    setName('');
    setRollNo('');
    setRoomNumber('');
    setParentPhone('');

    setSuccessMsg(`Naya student ${name} successfully register ho gaya!`);
    setTimeout(() => setSuccessMsg(''), 3000);
  };

  // ✏️ Save Edited Details (Room, Block, Year, Parent Contact)
  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingStudent) return;

    // Database me Room, Block, Year aur Parent Phone update hoga
    hostelDB.updateStudent(editingStudent.studentId, {
      name: editingStudent.name,
      roomNumber: editingStudent.roomNumber,
      block: editingStudent.block,
      year: Number(editingStudent.year),
      parentPhone: editingStudent.parentPhone,
      password: editingStudent.password
    });

    setStudents(hostelDB.getAllStudents());
    setSuccessMsg(
      `✅ Updated: ${editingStudent.name} ka Room (${editingStudent.roomNumber} - ${editingStudent.block}), Year (${editingStudent.year}th Yr) aur Parent Phone (${editingStudent.parentPhone}) update ho gaya!`
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
              
              {/* 1. Student Name */}
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

              {/* 2. Room Number Change */}
              <div>
                <label className="block text-amber-300 font-bold mb-1 flex items-center gap-1">
                  <DoorOpen className="w-3.5 h-3.5 text-amber-400" />
                  <span>1. New Room Number:</span>
                </label>
                <input
                  type="text"
                  value={editingStudent.roomNumber}
                  onChange={(e) => setEditingStudent({ ...editingStudent, roomNumber: e.target.value })}
                  className="w-full bg-slate-900 border border-amber-500/60 rounded-xl p-2.5 text-white font-bold"
                  placeholder="e.g. Tagore-202"
                  required
                />
              </div>

              {/* 3. Hostel Block Change */}
              <div>
                <label className="block text-amber-300 font-bold mb-1 flex items-center gap-1">
                  <Building2 className="w-3.5 h-3.5 text-amber-400" />
                  <span>2. Hostel Block:</span>
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

              {/* 4. Academic Year Change */}
              <div>
                <label className="block text-emerald-300 font-bold mb-1 flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-emerald-400" />
                  <span>3. Academic Year (Promotion):</span>
                </label>
                <select
                  value={editingStudent.year}
                  onChange={(e) => setEditingStudent({ ...editingStudent, year: Number(e.target.value) })}
                  className="w-full bg-slate-900 border border-emerald-500/60 rounded-xl p-2.5 text-white font-semibold"
                >
                  <option value={1}>1st Year (Fresher)</option>
                  <option value={2}>2nd Year (Sophomore)</option>
                  <option value={3}>3rd Year (Junior)</option>
                  <option value={4}>4th Year (Senior / Final)</option>
                </select>
              </div>

              {/* 5. Parent Contact Phone Change */}
              <div>
                <label className="block text-sky-300 font-bold mb-1 flex items-center gap-1">
                  <Phone className="w-3.5 h-3.5 text-sky-400" />
                  <span>4. Parent Contact Phone:</span>
                </label>
                <input
                  type="text"
                  value={editingStudent.parentPhone}
                  onChange={(e) => setEditingStudent({ ...editingStudent, parentPhone: e.target.value })}
                  className="w-full bg-slate-900 border border-sky-500/60 rounded-xl p-2.5 text-white"
                  placeholder="+91 98765 43210"
                  required
                />
              </div>

              {/* 6. Student Login Password */}
              <div>
                <label className="block text-slate-300 mb-1">Student Portal Password:</label>
                <input
                  type="text"
                  value={editingStudent.password}
                  onChange={(e) => setEditingStudent({ ...editingStudent, password: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-white"
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

      {/* ➕ Registration Form */}
      {showAddForm && (
        <form onSubmit={handleAddStudent} className="mb-6 p-4 bg-slate-950 border border-indigo-500/30 rounded-2xl space-y-3">
          <h3 className="text-xs font-bold text-indigo-400 uppercase tracking-wider">New Student Admission Form</h3>
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
              placeholder="Roll Number (e.g. 2024CS105)"
              value={rollNo}
              onChange={(e) => setRollNo(e.target.value)}
              className="bg-slate-900 border border-slate-800 rounded-xl p-2.5 text-white"
              required
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
              placeholder="Parent Contact Phone"
              value={parentPhone}
              onChange={(e) => setParentPhone(e.target.value)}
              className="bg-slate-900 border border-slate-800 rounded-xl p-2.5 text-white"
              required
            />
          </div>
          <button type="submit" className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 rounded-xl font-bold text-xs mt-2">
            Save Student to Database
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
              <th className="py-2.5 px-3">Academic Year</th>
              <th className="py-2.5 px-3">Parent Contact</th>
              <th className="py-2.5 px-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60">
            {filteredStudents.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-6 text-center text-slate-500">
                  Database me koi student nahi mila.
                </td>
              </tr>
            ) : (
              filteredStudents.map((std) => (
                <tr key={std.studentId} className="hover:bg-slate-950/50 transition-colors">
                  <td className="py-3 px-3 font-mono font-bold text-indigo-400">{std.rollNo}</td>
                  <td className="py-3 px-3 font-semibold text-white">{std.name}</td>
                  <td className="py-3 px-3 text-amber-400 font-bold">{std.roomNumber} <span className="text-slate-400 font-normal">({std.block})</span></td>
                  <td className="py-3 px-3 text-emerald-400 font-semibold">{std.year}{std.year === 1 ? 'st' : std.year === 2 ? 'nd' : std.year === 3 ? 'rd' : 'th'} Year</td>
                  <td className="py-3 px-3 text-slate-400 flex items-center gap-1">
                    <Phone className="w-3 h-3 text-slate-500" />
                    {std.parentPhone}
                  </td>
                  <td className="py-3 px-3 text-right">
                    <div className="inline-flex items-center gap-1.5">
                      {/* ✏️ EDIT BUTTON */}
                      <button
                        onClick={() => { setEditingStudent(std); setShowAddForm(false); }}
                        title="Room, Block, Year aur Parent Phone update karein"
                        className="px-2.5 py-1.5 bg-indigo-500/10 hover:bg-indigo-600 text-indigo-400 hover:text-white border border-indigo-500/30 rounded-lg text-[11px] font-bold transition-all inline-flex items-center gap-1"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                        <span>Edit Details</span>
                      </button>

                      {/* 🗑️ REMOVE BUTTON */}
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