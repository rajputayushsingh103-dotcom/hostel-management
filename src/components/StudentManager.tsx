// src/components/StudentManager.tsx
import React, { useState } from 'react';
import { hostelDB, StudentRecord } from '../data/hostelDB';
import { UserMinus, UserPlus, Search, CheckCircle, Phone, DoorOpen, Edit3, X, Save, Lock, Building2, Calendar, Hash } from 'lucide-react';
import { BlockName } from '../types';

export const StudentManager: React.FC = () => {
  const [students, setStudents] = useState<StudentRecord[]>(() => hostelDB.getAllStudents());
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  // Add State
  const [name, setName] = useState('');
  const [rollNo, setRollNo] = useState('');
  const [roomNumber, setRoomNumber] = useState('');
  const [block, setBlock] = useState<BlockName>('Tagore');
  const [year, setYear] = useState<number>(1);
  const [password, setPassword] = useState('');
  const [parentPhone, setParentPhone] = useState('');

  // Edit State
  const [editingStudent, setEditingStudent] = useState<StudentRecord | null>(null);

  const refreshList = () => {
    setStudents(hostelDB.getAllStudents());
  };

  // Delete
  const handleDeleteStudent = (student: StudentRecord) => {
    if (window.confirm(`Kya aap ${student.name} (${student.rollNo}) ko remove karna chahte hain?`)) {
      hostelDB.deleteStudent(student.studentId);
      refreshList();
      setSuccessMsg(`Student ${student.name} remove ho gaya.`);
      setTimeout(() => setSuccessMsg(''), 3000);
    }
  };

  // Add
  const handleAddStudent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!password.trim()) {
      alert('Password dalein!');
      return;
    }

    const newStd: StudentRecord = {
      studentId: `std-${Date.now()}`,
      name: name.trim(),
      rollNo: rollNo.trim(),
      roomNumber: roomNumber.trim(),
      block,
      year: Number(year),
      password: password.trim(),
      parentPhone: parentPhone.trim(),
      registeredAt: new Date().toISOString().split('T')[0]
    };

    hostelDB.addStudent(newStd);
    refreshList();
    setShowAddForm(false);

    setName('');
    setRollNo('');
    setRoomNumber('');
    setPassword('');
    setParentPhone('');

    setSuccessMsg(`✅ Student ${newStd.name} add ho gaya! (Roll: ${newStd.rollNo} | Pass: ${newStd.password})`);
    setTimeout(() => setSuccessMsg(''), 4000);
  };

  // Save Edit
  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingStudent) return;

    hostelDB.updateStudent(editingStudent.studentId, {
      name: editingStudent.name.trim(),
      rollNo: editingStudent.rollNo.trim(),
      roomNumber: editingStudent.roomNumber.trim(),
      block: editingStudent.block,
      year: Number(editingStudent.year),
      parentPhone: editingStudent.parentPhone.trim(),
      password: editingStudent.password.trim()
    });

    refreshList();
    setSuccessMsg(`✅ Saved: Naya Roll: ${editingStudent.rollNo} | Naya Pass: ${editingStudent.password}`);
    setEditingStudent(null);
    setTimeout(() => setSuccessMsg(''), 4000);
  };

  const filtered = students.filter(
    (s) =>
      s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.rollNo.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.roomNumber.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl text-white">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h2 className="text-xl font-bold flex items-center gap-2">
            <DoorOpen className="w-5 h-5 text-indigo-400" />
            <span>Hostel Student Records & Room Allocation Manager</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Total Students in Database: <span className="text-indigo-400 font-bold">{students.length}</span>
          </p>
        </div>

        <button
          onClick={() => { setShowAddForm(!showAddForm); setEditingStudent(null); }}
          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold flex items-center gap-2"
        >
          <UserPlus className="w-4 h-4" />
          <span>{showAddForm ? 'Cancel' : 'Register New Student'}</span>
        </button>
      </div>

      {successMsg && (
        <div className="mb-4 p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-emerald-400 text-xs flex items-center gap-2">
          <CheckCircle className="w-4 h-4" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* ✏️ EDIT FORM */}
      {editingStudent && (
        <div className="mb-6 p-5 bg-slate-950 border-2 border-indigo-500/60 rounded-2xl">
          <div className="flex justify-between items-center mb-4 pb-2 border-b border-slate-800">
            <span className="text-indigo-300 font-bold text-xs uppercase">Edit Student: {editingStudent.name}</span>
            <button onClick={() => setEditingStudent(null)} className="text-slate-400 hover:text-white">
              <X className="w-4 h-4" />
            </button>
          </div>

          <form onSubmit={handleSaveEdit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div>
                <label className="block text-slate-300 mb-1">Full Name:</label>
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

              <div className="sm:col-span-3">
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
                onClick={() => setEditingStudent(null)}
                className="px-4 py-2 bg-slate-800 rounded-xl text-xs text-slate-300"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 rounded-xl text-xs font-bold text-white shadow-lg"
              >
                Save Changes to Database
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ➕ ADD FORM */}
      {showAddForm && (
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
              placeholder="Parent Phone"
              value={parentPhone}
              onChange={(e) => setParentPhone(e.target.value)}
              className="bg-slate-900 border border-slate-800 rounded-xl p-2.5 text-white"
              required
            />
            <div className="sm:col-span-3">
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
          <button type="submit" className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 rounded-xl font-bold text-xs mt-2 text-white">
            Save Student & Password
          </button>
        </form>
      )}

      {/* Search */}
      <div className="relative mb-4">
        <input
          type="text"
          placeholder="Search student..."
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
              <th className="py-2.5 px-3">Name</th>
              <th className="py-2.5 px-3">Room</th>
              <th className="py-2.5 px-3">Year</th>
              <th className="py-2.5 px-3">Password</th>
              <th className="py-2.5 px-3">Parent Phone</th>
              <th className="py-2.5 px-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60">
            {filtered.map((std) => (
              <tr key={std.studentId} className="hover:bg-slate-950/50">
                <td className="py-3 px-3 font-mono font-bold text-indigo-400">{std.rollNo}</td>
                <td className="py-3 px-3 font-semibold text-white">{std.name}</td>
                <td className="py-3 px-3 text-amber-400 font-bold">{std.roomNumber} ({std.block})</td>
                <td className="py-3 px-3 text-emerald-400">{std.year} Year</td>
                <td className="py-3 px-3 font-mono text-slate-300 bg-slate-950/60 px-2 py-1 rounded">{std.password}</td>
                <td className="py-3 px-3 text-slate-400">{std.parentPhone}</td>
                <td className="py-3 px-3 text-right">
                  <div className="inline-flex items-center gap-1.5">
                    <button
                      onClick={() => { setEditingStudent({ ...std }); setShowAddForm(false); }}
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
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};