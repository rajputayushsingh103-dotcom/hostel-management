import React, { useState } from 'react';
import {
  Building2,
  Users,
  CheckCircle2,
  AlertCircle,
  Search,
  Phone,
  Filter,
  UserCheck,
  UserX,
  Plus,
  Wifi,
  Wind,
  BedDouble,
  Home,
  ShieldAlert,
  Edit2,
  Trash2,
  Check,
  UserPlus,
  Eye,
  EyeOff,
  Lock
} from 'lucide-react';
import { BlockName, Room, RoomOccupant, Role } from '../types';

interface RoomOccupancySectionProps {
  rooms: Room[];
  onAddRoom?: (room: Omit<Room, 'id' | 'occupants'>) => void;
  onAddOccupant?: (roomId: string, occupant: Omit<RoomOccupant, 'id'>) => void;
  onUpdateRoom?: (roomId: string, updatedFields: Partial<Room>) => void;
  onUpdateOccupant?: (roomId: string, occupantId: string, updatedFields: Partial<RoomOccupant>) => void;
  onRemoveOccupant?: (roomId: string, occupantId: string) => void;
  role: Role;
  isRoomDirectoryVisibleToStudents?: boolean;
  onToggleRoomDirectoryVisibility?: () => void;
}

export const RoomOccupancySection: React.FC<RoomOccupancySectionProps> = ({
  rooms,
  onAddRoom,
  onAddOccupant,
  onUpdateRoom,
  onUpdateOccupant,
  onRemoveOccupant,
  role,
  isRoomDirectoryVisibleToStudents = false,
  onToggleRoomDirectoryVisibility
}) => {
  const [activeBlock, setActiveBlock] = useState<BlockName | 'All'>('All');
  const [statusFilter, setStatusFilter] = useState<'all' | 'vacant' | 'partial' | 'full'>('all');
  const [floorFilter, setFloorFilter] = useState<number | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);

  // Quick allocation modal state
  const [showAllocateModal, setShowAllocateModal] = useState(false);
  const [newStudentName, setNewStudentName] = useState('');
  const [newStudentRoll, setNewStudentRoll] = useState('');
  const [newStudentBranch, setNewStudentBranch] = useState('Computer Science');
  const [newStudentYear, setNewStudentYear] = useState(1);
  const [newStudentPhone, setNewStudentPhone] = useState('+91 98000 00000');
  const [newParentPhone, setNewParentPhone] = useState('+91 98123 45678');
  const [newStudentAvatar, setNewStudentAvatar] = useState('https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80');

  // Warden Room Creation Modal State
  const [showAddRoomModal, setShowAddRoomModal] = useState(false);
  const [addBlock, setAddBlock] = useState<BlockName>('Tagore');
  const [addFloor, setAddFloor] = useState(1);
  const [addRoomNumber, setAddRoomNumber] = useState('');
  const [addCapacity, setAddCapacity] = useState(3);

  // Warden Room Capacity & Number Editing State
  const [isEditingRoomNo, setIsEditingRoomNo] = useState(false);
  const [editedRoomNumber, setEditedRoomNumber] = useState('');
  const [editedCapacity, setEditedCapacity] = useState(2);

  // Warden Student Editing State
  const [editingOccupantId, setEditingOccupantId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [editRoll, setEditRoll] = useState('');
  const [editBranch, setEditBranch] = useState('Computer Science');
  const [editYear, setEditYear] = useState(1);
  const [editPhone, setEditPhone] = useState('');
  const [editParentPhone, setEditParentPhone] = useState('');
  const [editAvatar, setEditAvatar] = useState('');

  // Filtered rooms logic
  const filteredRooms = rooms.filter((room) => {
    if (activeBlock !== 'All' && room.block !== activeBlock) return false;
    if (floorFilter !== 'all' && room.floor !== floorFilter) return false;

    const currentCount = room.occupants.length;
    const isVacant = currentCount === 0;
    const isPartial = currentCount > 0 && currentCount < room.capacity;
    const isFull = currentCount >= room.capacity;

    if (statusFilter === 'vacant' && !isVacant) return false;
    if (statusFilter === 'partial' && !isPartial) return false;
    if (statusFilter === 'full' && !isFull) return false;

    if (searchQuery.trim() !== '') {
      const q = searchQuery.toLowerCase();
      const matchRoom = room.roomNumber.toLowerCase().includes(q);
      const matchOccupant = room.occupants.some(
        (occ) =>
          occ.name.toLowerCase().includes(q) ||
          occ.rollNo.toLowerCase().includes(q) ||
          occ.branch.toLowerCase().includes(q) ||
          occ.phone.includes(q)
      );
      if (!matchRoom && !matchOccupant) return false;
    }

    return true;
  });

  // Calculate Overall Statistics
  const targetRooms = activeBlock === 'All' ? rooms : rooms.filter((r) => r.block === activeBlock);
  const totalRoomsCount = targetRooms.length;
  const totalBedsCapacity = targetRooms.reduce((acc, r) => acc + r.capacity, 0);
  const totalOccupiedBeds = targetRooms.reduce((acc, r) => acc + r.occupants.length, 0);
  const totalVacantBeds = totalBedsCapacity - totalOccupiedBeds;
  const totallyVacantRooms = targetRooms.filter((r) => r.occupants.length === 0).length;

  const handleCreateRoomSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!onAddRoom || !addRoomNumber.trim()) return;

    onAddRoom({
      block: addBlock,
      floor: Number(addFloor),
      roomNumber: addRoomNumber.trim(),
      capacity: Number(addCapacity),
      facilities: ['High-Speed LAN', 'Balcony', 'Study Desks'],
      isMaintained: true
    });

    setShowAddRoomModal(false);
    setAddRoomNumber('');
  };

  const handleAllocateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRoom || !onAddOccupant) return;
    if (!newStudentName || !newStudentRoll) return;

    onAddOccupant(selectedRoom.id, {
      name: newStudentName,
      rollNo: newStudentRoll,
      branch: newStudentBranch,
      year: Number(newStudentYear),
      phone: newStudentPhone,
      parentPhone: newParentPhone,
      avatar: newStudentAvatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80',
      hostelAttendanceToday: 'present',
      collegeAttendanceToday: 'present'
    });

    setShowAllocateModal(false);
    setNewStudentName('');
    setNewStudentRoll('');
  };

  const handleSaveRoomDetails = (roomId: string) => {
    if (!onUpdateRoom || !editedRoomNumber.trim()) return;
    onUpdateRoom(roomId, {
      roomNumber: editedRoomNumber,
      capacity: Number(editedCapacity)
    });
    setIsEditingRoomNo(false);
    if (selectedRoom) {
      setSelectedRoom({
        ...selectedRoom,
        roomNumber: editedRoomNumber,
        capacity: Number(editedCapacity)
      });
    }
  };

  const handleStartEditOccupant = (occ: RoomOccupant) => {
    setEditingOccupantId(occ.id);
    setEditName(occ.name);
    setEditRoll(occ.rollNo);
    setEditBranch(occ.branch || 'Computer Science');
    setEditYear(occ.year || 1);
    setEditPhone(occ.phone);
    setEditParentPhone(occ.parentPhone || '+91 98123 45678');
    setEditAvatar(occ.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80');
  };

  const handleSaveOccupant = (roomId: string, occupantId: string) => {
    if (!onUpdateOccupant) return;
    onUpdateOccupant(roomId, occupantId, {
      name: editName,
      rollNo: editRoll,
      branch: editBranch,
      year: Number(editYear),
      avatar: editAvatar,
      phone: editPhone,
      parentPhone: editParentPhone
    });
    setEditingOccupantId(null);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner & Block Navigation Tabs */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 sm:p-6 shadow-xl">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-2 rounded-xl bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
                <Building2 className="w-5 h-5" />
              </span>
              <h2 className="text-xl font-bold text-white">Hostel Room Directory & Warden Edit Access</h2>
            </div>
            <p className="text-xs sm:text-sm text-slate-400 mt-1">
              Check real-time room vacancy. Warden can edit room numbers on any floor, edit student names & reallocate beds.
            </p>
          </div>

          {/* Block Selection Tabs & Warden Room Structure Control */}
          <div className="flex flex-wrap items-center gap-2">
            {role === 'warden' && (
              <>
                {onToggleRoomDirectoryVisibility && (
                  <button
                    onClick={onToggleRoomDirectoryVisibility}
                    className={`px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shadow-md ${
                      isRoomDirectoryVisibleToStudents
                        ? 'bg-amber-600 hover:bg-amber-500 text-white shadow-amber-600/20'
                        : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-indigo-600/20'
                    }`}
                    title="Toggle student room directory access"
                  >
                    {isRoomDirectoryVisibleToStudents ? (
                      <>
                        <EyeOff className="w-4 h-4" />
                        <span>Hide Rooms from Students</span>
                      </>
                    ) : (
                      <>
                        <Eye className="w-4 h-4" />
                        <span>Allow Student Room View</span>
                      </>
                    )}
                  </button>
                )}

                <button
                  onClick={() => setShowAddRoomModal(true)}
                  className="px-3 py-2 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white flex items-center gap-1.5 shadow-md shadow-emerald-600/20"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Floor / Room & Capacity</span>
                </button>
              </>
            )}

            {(['All', 'Tagore', 'Tilak', 'Subhash'] as const).map((blk) => {
              const isActive = activeBlock === blk;
              return (
                <button
                  key={blk}
                  onClick={() => setActiveBlock(blk)}
                  className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
                    isActive
                      ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30 ring-2 ring-indigo-500/50'
                      : 'bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white'
                  }`}
                >
                  {blk === 'All' ? 'All 3 Blocks' : `${blk} Block`}
                </button>
              );
            })}
          </div>
        </div>

        {/* Summary Metric Cards */}
        <div className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="bg-slate-950/80 border border-slate-800 p-3.5 rounded-xl">
            <span className="text-xs font-medium text-slate-400 block">Total Rooms</span>
            <span className="text-xl font-bold text-white mt-1 block">{totalRoomsCount}</span>
            <span className="text-[10px] text-slate-500">In {activeBlock} Block</span>
          </div>

          <div className="bg-emerald-950/40 border border-emerald-500/30 p-3.5 rounded-xl">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-emerald-400 block">Vacant Rooms</span>
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            </div>
            <span className="text-xl font-extrabold text-emerald-300 mt-1 block">{totallyVacantRooms}</span>
            <span className="text-[10px] text-emerald-400/80">Completely empty rooms</span>
          </div>

          <div className="bg-slate-950/80 border border-slate-800 p-3.5 rounded-xl">
            <span className="text-xs font-medium text-slate-400 block">Available Bed Slots</span>
            <span className="text-xl font-bold text-indigo-400 mt-1 block">{totalVacantBeds}</span>
            <span className="text-[10px] text-slate-500">Out of {totalBedsCapacity} total beds</span>
          </div>

          <div className="bg-slate-950/80 border border-slate-800 p-3.5 rounded-xl">
            <span className="text-xs font-medium text-slate-400 block">Occupied Beds</span>
            <span className="text-xl font-bold text-amber-400 mt-1 block">{totalOccupiedBeds}</span>
            <span className="text-[10px] text-slate-500">
              {Math.round((totalOccupiedBeds / (totalBedsCapacity || 1)) * 100)}% Occupancy
            </span>
          </div>
        </div>
      </div>

      {/* Student Abstraction Privacy Guard */}
      {role === 'student' && !isRoomDirectoryVisibleToStudents ? (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 sm:p-12 text-center max-w-2xl mx-auto shadow-2xl space-y-4 my-6">
          <div className="w-16 h-16 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20 flex items-center justify-center mx-auto">
            <Lock className="w-8 h-8" />
          </div>
          <h3 className="text-xl font-extrabold text-white">Room Occupancy Directory Restricted</h3>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            Detailed room allotment listings are kept private by the Chief Warden Office for student safety and administrative records. Only Warden Admin can view room occupancy structure currently.
          </p>
          <div className="p-4 bg-slate-950 border border-slate-800 rounded-2xl text-xs text-slate-400 text-left space-y-1">
            <p className="font-bold text-indigo-300">💡 Student Portal Access:</p>
            <p>• When Warden Office publishes room notices, room allocation list will automatically appear here.</p>
            <p>• Check your personal biometric attendance, mess menu, or submit home passes using the top navigation bar.</p>
          </div>
        </div>
      ) : (
        <>
          {/* Filter Toolbar & Search */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-md flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="relative w-full md:w-80">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search room no, student name or roll..."
                className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2 text-xs sm:text-sm text-white focus:outline-hidden focus:border-indigo-500 placeholder-slate-500"
              />
            </div>

            <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
              <div className="flex items-center space-x-1 bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs">
                <Filter className="w-3.5 h-3.5 text-slate-400 ml-1.5" />
                <button
                  onClick={() => setStatusFilter('all')}
                  className={`px-2.5 py-1 rounded-lg font-medium transition-colors ${
                    statusFilter === 'all' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  All
                </button>
                <button
                  onClick={() => setStatusFilter('vacant')}
                  className={`px-2.5 py-1 rounded-lg font-semibold transition-colors ${
                    statusFilter === 'vacant' ? 'bg-emerald-600 text-white' : 'text-emerald-400 hover:text-white'
                  }`}
                >
                  🟢 Vacant
                </button>
                <button
                  onClick={() => setStatusFilter('partial')}
                  className={`px-2.5 py-1 rounded-lg font-medium transition-colors ${
                    statusFilter === 'partial' ? 'bg-amber-600 text-white' : 'text-amber-400 hover:text-white'
                  }`}
                >
                  🟡 Partial
                </button>
              </div>
            </div>
          </div>

          {/* Rooms Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredRooms.map((room) => {
              const occCount = room.occupants.length;
              const freeSlots = room.capacity - occCount;
              const isCompletelyVacant = occCount === 0;

              return (
                <div
                  key={room.id}
                  onClick={() => {
                    setSelectedRoom(room);
                    setEditedRoomNumber(room.roomNumber);
                    setEditedCapacity(room.capacity);
                    setIsEditingRoomNo(false);
                  }}
                  className={`group relative bg-slate-900 border rounded-2xl p-5 shadow-lg hover:shadow-2xl transition-all cursor-pointer flex flex-col justify-between ${
                    isCompletelyVacant
                      ? 'border-emerald-500/50 hover:border-emerald-400 bg-gradient-to-b from-emerald-950/20 to-slate-900'
                      : 'border-slate-800 hover:border-indigo-500/50'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                      <div className="flex items-center space-x-2">
                        <span className="px-2.5 py-1 rounded-lg text-xs font-bold uppercase bg-slate-800 text-indigo-300 border border-slate-700">
                          {room.block}
                        </span>
                        <h3 className="text-lg font-black text-white">{room.roomNumber}</h3>
                      </div>

                      {isCompletelyVacant ? (
                        <span className="inline-flex items-center gap-1 text-xs font-extrabold px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                          🟢 Vacant
                        </span>
                      ) : freeSlots > 0 ? (
                        <span className="inline-flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40">
                          🟡 {freeSlots} Bed Available
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-800 text-slate-400">
                          🔴 Full ({occCount}/{room.capacity})
                        </span>
                      )}
                    </div>

                    <div className="mt-3 flex flex-wrap gap-1.5">
                      <span className="text-[11px] font-semibold bg-slate-950 text-slate-400 px-2 py-0.5 rounded-md border border-slate-800">
                        Floor {room.floor} • {room.capacity} Beds
                      </span>
                    </div>

                    <div className="mt-4 space-y-2">
                      {room.occupants.map((occ) => (
                        <div
                          key={occ.id}
                          className="flex items-center gap-3 bg-slate-950/90 border border-slate-800 p-2.5 rounded-xl"
                        >
                          <img
                            src={occ.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80'}
                            alt={occ.name}
                            className="w-10 h-10 rounded-full object-cover border border-indigo-500/40 shrink-0 shadow-xs"
                            referrerPolicy="no-referrer"
                          />
                          <div className="overflow-hidden">
                            <p className="text-xs font-bold text-white truncate">{occ.name}</p>
                            <p className="text-[10px] text-indigo-300 font-semibold truncate">
                              🎓 {occ.year || 1}{occ.year === 1 ? 'st' : occ.year === 2 ? 'nd' : occ.year === 3 ? 'rd' : 'th'} Year • {occ.branch || 'CSE'}
                            </p>
                            <p className="text-[10px] text-slate-400 truncate">
                              Roll: {occ.rollNo}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="mt-5 pt-3 border-t border-slate-800 flex items-center justify-between text-xs text-indigo-400">
                    <span className="font-semibold">
                      {role === 'warden' ? '⚙️ Edit Room No & Students →' : 'View Details →'}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}

      {/* Room Detail & Warden Editing Modal */}
      {selectedRoom && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-xs p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-xl w-full p-6 shadow-2xl relative max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div>
                {role === 'warden' && isEditingRoomNo ? (
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={editedRoomNumber}
                      onChange={(e) => setEditedRoomNumber(e.target.value)}
                      className="bg-slate-950 border border-indigo-500 rounded-xl px-3 py-1.5 text-sm font-bold text-white"
                    />
                    <select
                      value={editedCapacity}
                      onChange={(e) => setEditedCapacity(Number(e.target.value))}
                      className="bg-slate-950 border border-indigo-500 rounded-xl px-2 py-1.5 text-xs text-white"
                    >
                      <option value={2}>2 Beds</option>
                      <option value={3}>3 Beds</option>
                      <option value={4}>4 Beds</option>
                    </select>
                    <button
                      onClick={() => handleSaveRoomDetails(selectedRoom.id)}
                      className="px-3 py-1.5 bg-emerald-600 text-white rounded-xl text-xs font-bold"
                    >
                      Save
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-indigo-600 text-white">
                      {selectedRoom.block} Block
                    </span>
                    <h3 className="text-xl font-extrabold text-white">Room {selectedRoom.roomNumber}</h3>
                    {role === 'warden' && (
                      <button
                        onClick={() => setIsEditingRoomNo(true)}
                        className="p-1 text-indigo-400 hover:bg-slate-800 rounded-lg text-xs flex items-center gap-1 ml-2"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                        <span>Edit Room No</span>
                      </button>
                    )}
                  </div>
                )}
                <p className="text-xs text-slate-400 mt-1">
                  Floor {selectedRoom.floor} • Capacity: {selectedRoom.capacity} Beds
                </p>
              </div>

              <button
                onClick={() => setSelectedRoom(null)}
                className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg"
              >
                ✕
              </button>
            </div>

            {/* Occupants Roster & Warden Edit Controls */}
            <div className="mt-4 space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                  Students In Room ({selectedRoom.occupants.length}/{selectedRoom.capacity}):
                </h4>

                {role === 'warden' && selectedRoom.occupants.length < selectedRoom.capacity && (
                  <button
                    onClick={() => setShowAllocateModal(true)}
                    className="px-3 py-1 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold flex items-center gap-1"
                  >
                    <UserPlus className="w-3.5 h-3.5" />
                    <span>Add / Allocate Student</span>
                  </button>
                )}
              </div>

              <div className="space-y-3">
                {selectedRoom.occupants.map((student) => {
                  const isEditingThis = editingOccupantId === student.id;

                  return (
                    <div
                      key={student.id}
                      className="bg-slate-950 border border-slate-800 p-4 rounded-xl space-y-3"
                    >
                      {isEditingThis ? (
                        <div className="space-y-3">
                          <p className="text-xs font-bold text-indigo-400">Editing Student Profile:</p>
                          <div>
                            <label className="block text-[11px] font-semibold text-slate-300 mb-1">Student Name:</label>
                            <input
                              type="text"
                              value={editName}
                              onChange={(e) => setEditName(e.target.value)}
                              placeholder="Student Full Name"
                              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-white"
                            />
                          </div>

                          <div className="grid grid-cols-2 gap-2">
                            <div>
                              <label className="block text-[11px] font-semibold text-slate-300 mb-1">Roll Number:</label>
                              <input
                                type="text"
                                value={editRoll}
                                onChange={(e) => setEditRoll(e.target.value)}
                                placeholder="Roll Number"
                                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-white"
                              />
                            </div>
                            <div>
                              <label className="block text-[11px] font-semibold text-slate-300 mb-1">Branch:</label>
                              <select
                                value={editBranch}
                                onChange={(e) => setEditBranch(e.target.value)}
                                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-2 py-1.5 text-xs text-white"
                              >
                                <option value="Computer Science">Computer Science</option>
                                <option value="Electronics & Comm.">Electronics & Comm.</option>
                                <option value="Electrical Engg">Electrical Engg</option>
                                <option value="Mechanical Engg">Mechanical Engg</option>
                                <option value="Civil Engg">Civil Engg</option>
                              </select>
                            </div>
                          </div>

                          <div className="grid grid-cols-2 gap-2">
                            <div>
                              <label className="block text-[11px] font-semibold text-slate-300 mb-1">Year of Study:</label>
                              <select
                                value={editYear}
                                onChange={(e) => setEditYear(Number(e.target.value))}
                                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-2 py-1.5 text-xs text-white"
                              >
                                <option value={1}>1st Year</option>
                                <option value={2}>2nd Year</option>
                                <option value={3}>3rd Year</option>
                                <option value={4}>4th Year</option>
                              </select>
                            </div>
                            <div>
                              <label className="block text-[11px] font-semibold text-slate-300 mb-1">Student Phone:</label>
                              <input
                                type="text"
                                value={editPhone}
                                onChange={(e) => setEditPhone(e.target.value)}
                                placeholder="Phone"
                                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-white"
                              />
                            </div>
                          </div>

                          <div>
                            <label className="block text-[11px] font-semibold text-slate-300 mb-1">Parent Phone (for SMS):</label>
                            <input
                              type="text"
                              value={editParentPhone}
                              onChange={(e) => setEditParentPhone(e.target.value)}
                              placeholder="Parent Phone for SMS"
                              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-white"
                            />
                          </div>

                          <div>
                            <label className="block text-[11px] font-semibold text-slate-300 mb-1">Photo URL:</label>
                            <input
                              type="text"
                              value={editAvatar}
                              onChange={(e) => setEditAvatar(e.target.value)}
                              placeholder="Photo URL"
                              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-white"
                            />
                          </div>

                          <div className="flex justify-end gap-2 pt-2">
                            <button
                              onClick={() => setEditingOccupantId(null)}
                              className="px-3 py-1 text-xs text-slate-400"
                            >
                              Cancel
                            </button>
                            <button
                              onClick={() => handleSaveOccupant(selectedRoom.id, student.id)}
                              className="px-3 py-1 bg-emerald-600 text-white rounded-lg text-xs font-bold"
                            >
                              Save Student Profile
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <img
                              src={student.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80'}
                              alt={student.name}
                              className="w-12 h-12 rounded-full object-cover border-2 border-indigo-500/50 shadow-md shrink-0"
                              referrerPolicy="no-referrer"
                            />
                            <div>
                              <h5 className="text-sm font-bold text-white flex items-center gap-2">
                                {student.name}
                                <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                                  {student.year || 1}{student.year === 1 ? 'st' : student.year === 2 ? 'nd' : student.year === 3 ? 'rd' : 'th'} Year
                                </span>
                              </h5>
                              <p className="text-xs text-slate-300 mt-0.5">
                                Roll: <span className="text-white font-mono">{student.rollNo}</span> • Branch: <span className="text-indigo-300">{student.branch}</span>
                              </p>
                              <p className="text-[11px] text-slate-400 mt-1">
                                Mobile: {student.phone} | Parent SMS: {student.parentPhone || 'Not set'}
                              </p>
                            </div>
                          </div>

                          {(role === 'warden' || role === 'college_admin') && (
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => handleStartEditOccupant(student)}
                                className="p-1.5 bg-slate-900 hover:bg-slate-800 text-indigo-400 rounded-lg text-xs flex items-center gap-1 border border-slate-700"
                                title="Edit Student Profile & Verified Guardian Contact"
                              >
                                <Edit2 className="w-3.5 h-3.5" />
                              </button>

                              {onRemoveOccupant && (
                                <button
                                  onClick={() => onRemoveOccupant(selectedRoom.id, student.id)}
                                  className="p-1.5 bg-slate-900 hover:bg-red-950 text-red-400 rounded-lg text-xs border border-slate-700"
                                  title="Deallocate Student"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              )}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Warden Student Allocation Form Modal */}
      {showAllocateModal && selectedRoom && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-4 backdrop-blur-xs">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Plus className="w-5 h-5 text-indigo-400" />
              Allocate Student to {selectedRoom.roomNumber}
            </h3>

            <form onSubmit={handleAllocateSubmit} className="mt-4 space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Student Full Name:</label>
                <input
                  type="text"
                  value={newStudentName}
                  onChange={(e) => setNewStudentName(e.target.value)}
                  placeholder="e.g. Rahul Sharma"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-hidden focus:border-indigo-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Roll Number:</label>
                <input
                  type="text"
                  value={newStudentRoll}
                  onChange={(e) => setNewStudentRoll(e.target.value)}
                  placeholder="e.g. 2024CS1099"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-hidden focus:border-indigo-500"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Branch:</label>
                  <select
                    value={newStudentBranch}
                    onChange={(e) => setNewStudentBranch(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white"
                  >
                    <option value="Computer Science">Computer Science</option>
                    <option value="Electronics & Comm.">Electronics & Comm.</option>
                    <option value="Electrical Engg">Electrical Engg</option>
                    <option value="Mechanical Engg">Mechanical Engg</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Year of Study:</label>
                  <select
                    value={newStudentYear}
                    onChange={(e) => setNewStudentYear(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white"
                  >
                    <option value={1}>1st Year</option>
                    <option value={2}>2nd Year</option>
                    <option value={3}>3rd Year</option>
                    <option value={4}>4th Year</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Student Phone:</label>
                <input
                  type="text"
                  value={newStudentPhone}
                  onChange={(e) => setNewStudentPhone(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-sm text-white"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Parent Phone (for SMS Alerts):</label>
                <input
                  type="text"
                  value={newParentPhone}
                  onChange={(e) => setNewParentPhone(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-sm text-white"
                  required
                />
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowAllocateModal(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl shadow-lg"
                >
                  Confirm Allocation
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
