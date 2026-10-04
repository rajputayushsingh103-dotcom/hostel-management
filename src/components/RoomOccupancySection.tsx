// src/components/RoomOccupancySection.tsx
import React, { useState } from 'react';
import {
  Building2,
  Users,
  CheckCircle2,
  AlertCircle,
  Search,
  Phone,
  Filter,
  Plus,
  Edit2,
  Trash2,
  Check,
  UserPlus,
  Eye,
  EyeOff,
  Lock,
  X,
  Layers,
  Building,
  UserCheck
} from 'lucide-react';
import { BlockName, Room, RoomOccupant, Role } from '../types';

interface RoomOccupancySectionProps {
  rooms: Room[];
  onAddRoom?: (room: Omit<Room, 'id' | 'occupants'>) => void;
  onAddOccupant?: (roomId: string, occupant: Omit<RoomOccupant, 'id'>) => void;
  onUpdateRoom?: (roomId: string, updatedFields: Partial<Room>) => void;
  onUpdateOccupant?: (roomId: string, occupantId: string, updatedFields: Partial<RoomOccupant>) => void;
  onRemoveOccupant?: (roomId: string, occupantId: string) => void;
  onDeleteRoom?: (roomId: string) => void;
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
  onDeleteRoom,
  role,
  isRoomDirectoryVisibleToStudents = false,
  onToggleRoomDirectoryVisibility
}) => {
  const [activeBlock, setActiveBlock] = useState<BlockName | 'All'>('All');
  const [statusFilter, setStatusFilter] = useState<'all' | 'vacant' | 'partial' | 'full'>('all');
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
  const [addCapacity, setAddCapacity] = useState(2);

  // Warden Room Editing State
  const [editingRoom, setEditingRoom] = useState<Room | null>(null);
  const [editedRoomNumber, setEditedRoomNumber] = useState('');
  const [editedCapacity, setEditedCapacity] = useState(2);
  const [editedFloor, setEditedFloor] = useState(1);
  const [editedBlock, setEditedBlock] = useState<BlockName>('Tagore');

  // Helper to extract integer from roomNumber like "Tagore-102" -> 102
  const extractRoomNumber = (str: string) => {
    const match = str.match(/\d+/);
    return match ? parseInt(match[0], 10) : 0;
  };

  // Block definitions for structured rendering
  const blockList: { name: BlockName; title: string; color: string; desc: string }[] = [
    {
      name: 'Tagore',
      title: 'Tagore Hostel Block',
      color: 'from-indigo-500/20 via-indigo-900/10 to-transparent border-indigo-500/40 text-indigo-400',
      desc: '1st Floor to 3rd Floor • Primary Resident Block'
    },
    {
      name: 'Tilak',
      title: 'Tilak Hostel Block',
      color: 'from-amber-500/20 via-amber-900/10 to-transparent border-amber-500/40 text-amber-400',
      desc: 'Senior Wing • 1st Floor to 3rd Floor'
    },
    {
      name: 'Subhash',
      title: 'Subhash Hostel Block',
      color: 'from-emerald-500/20 via-emerald-900/10 to-transparent border-emerald-500/40 text-emerald-400',
      desc: 'Seniors & Final Year Wing • Modern Amenities'
    }
  ];

  // Filter & Sort Rooms
  const getBlockRooms = (blockName: BlockName) => {
    return rooms
      .filter((room) => {
        if (room.block !== blockName) return false;

        const currentCount = room.occupants?.length || 0;
        const isVacant = currentCount === 0;
        const isPartial = currentCount > 0 && currentCount < room.capacity;
        const isFull = currentCount >= room.capacity;

        if (statusFilter === 'vacant' && !isVacant) return false;
        if (statusFilter === 'partial' && !isPartial) return false;
        if (statusFilter === 'full' && !isFull) return false;

        if (searchQuery.trim() !== '') {
          const q = searchQuery.toLowerCase();
          const matchRoom = room.roomNumber.toLowerCase().includes(q);
          const matchOccupant = room.occupants?.some(
            (occ) =>
              occ.name.toLowerCase().includes(q) ||
              occ.rollNo.toLowerCase().includes(q) ||
              occ.branch.toLowerCase().includes(q)
          );
          if (!matchRoom && !matchOccupant) return false;
        }
        return true;
      })
      .sort((a, b) => {
        if (a.floor !== b.floor) return a.floor - b.floor;
        return extractRoomNumber(a.roomNumber) - extractRoomNumber(b.roomNumber);
      });
  };

  // Calculate Overall Statistics
  const targetRooms = activeBlock === 'All' ? rooms : rooms.filter((r) => r.block === activeBlock);
  const totalRoomsCount = targetRooms.length;
  const totalBedsCapacity = targetRooms.reduce((acc, r) => acc + r.capacity, 0);
  const totalOccupiedBeds = targetRooms.reduce((acc, r) => acc + (r.occupants?.length || 0), 0);
  const totalVacantBeds = totalBedsCapacity - totalOccupiedBeds;
  const totallyVacantRooms = targetRooms.filter((r) => !r.occupants || r.occupants.length === 0).length;

  const handleCreateRoomSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!addRoomNumber.trim()) return;

    if (onAddRoom) {
      onAddRoom({
        block: addBlock,
        floor: Number(addFloor),
        roomNumber: addRoomNumber.trim(),
        capacity: Number(addCapacity),
        facilities: ['High-Speed LAN', 'Balcony', 'Study Desks'],
        isMaintained: true
      });
    }

    setShowAddRoomModal(false);
    setAddRoomNumber('');
    alert(`✅ Room ${addRoomNumber} created successfully!`);
  };

  const handleSaveRoomEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingRoom || !editedRoomNumber.trim()) return;

    if (onUpdateRoom) {
      onUpdateRoom(editingRoom.id, {
        roomNumber: editedRoomNumber.trim(),
        capacity: Number(editedCapacity),
        floor: Number(editedFloor),
        block: editedBlock
      });
    }

    setEditingRoom(null);
    alert('✅ Room details updated successfully!');
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

  return (
    <div className="space-y-6">
      {/* Top Banner & Block Navigation Tabs */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 sm:p-6 shadow-xl">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-2.5 rounded-2xl bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
                <Building2 className="w-6 h-6" />
              </span>
              <div>
                <h2 className="text-xl font-bold text-white">Hostel Room Directory & Capacity Manager</h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  Click on any Room Card to view allotted students & room details.
                </p>
              </div>
            </div>
          </div>

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
                  >
                    {isRoomDirectoryVisibleToStudents ? (
                      <>
                        <EyeOff className="w-4 h-4" />
                        <span>Hide from Students</span>
                      </>
                    ) : (
                      <>
                        <Eye className="w-4 h-4" />
                        <span>Allow Student View</span>
                      </>
                    )}
                  </button>
                )}

                <button
                  onClick={() => setShowAddRoomModal(true)}
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white flex items-center gap-1.5 shadow-lg shadow-emerald-600/30 transition-all"
                >
                  <Plus className="w-4 h-4" />
                  <span>+ Add New Room & Capacity</span>
                </button>
              </>
            )}

            {(['All', 'Tagore', 'Tilak', 'Subhash'] as const).map((blk) => {
              const isActive = activeBlock === blk;
              return (
                <button
                  key={blk}
                  onClick={() => setActiveBlock(blk)}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
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
          <div className="bg-slate-950/80 border border-slate-800 p-3.5 rounded-2xl">
            <span className="text-xs font-medium text-slate-400 block">Total Rooms</span>
            <span className="text-xl font-bold text-white mt-1 block">{totalRoomsCount}</span>
            <span className="text-[10px] text-slate-500">In {activeBlock} Block</span>
          </div>

          <div className="bg-emerald-950/40 border border-emerald-500/30 p-3.5 rounded-2xl">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-emerald-400 block">Vacant Rooms</span>
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            </div>
            <span className="text-xl font-extrabold text-emerald-300 mt-1 block">{totallyVacantRooms}</span>
            <span className="text-[10px] text-emerald-400/80">Completely empty rooms</span>
          </div>

          <div className="bg-slate-950/80 border border-slate-800 p-3.5 rounded-2xl">
            <span className="text-xs font-medium text-slate-400 block">Available Bed Slots</span>
            <span className="text-xl font-bold text-indigo-400 mt-1 block">{totalVacantBeds}</span>
            <span className="text-[10px] text-slate-500">Out of {totalBedsCapacity} total beds</span>
          </div>

          <div className="bg-slate-950/80 border border-slate-800 p-3.5 rounded-2xl">
            <span className="text-xs font-medium text-slate-400 block">Occupied Beds</span>
            <span className="text-xl font-bold text-amber-400 mt-1 block">{totalOccupiedBeds}</span>
            <span className="text-[10px] text-slate-500">
              {Math.round((totalOccupiedBeds / (totalBedsCapacity || 1)) * 100)}% Occupancy
            </span>
          </div>
        </div>
      </div>

      {/* Filter Toolbar & Search */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-md flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search room number (e.g. 101, 202)..."
            className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
          />
        </div>

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

      {/* 🟢 SEPARATE SECTIONS FOR TAGORE, TILAK & SUBHASH BLOCKS */}
      <div className="space-y-10">
        {blockList
          .filter((b) => activeBlock === 'All' || activeBlock === b.name)
          .map((b) => {
            const blockRooms = getBlockRooms(b.name);

            return (
              <div key={b.name} className="space-y-4">
                {/* 🏛️ BLOCK SECTION HEADER BANNER */}
                <div className={`p-4 rounded-2xl border bg-gradient-to-r ${b.color} flex flex-col sm:flex-row sm:items-center justify-between gap-2 shadow-lg`}>
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-xl bg-slate-950/80 border border-slate-800 text-white shadow-md">
                      <Building className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-base font-black text-white tracking-wide uppercase flex items-center gap-2">
                        <span>{b.title}</span>
                        <span className="text-[11px] font-mono font-bold bg-slate-950/80 px-2.5 py-0.5 rounded-full border border-slate-800 text-slate-300">
                          {blockRooms.length} Rooms
                        </span>
                      </h3>
                      <p className="text-xs text-slate-400 mt-0.5">{b.desc}</p>
                    </div>
                  </div>

                  <span className="text-xs font-mono font-bold text-slate-300 bg-slate-950/70 px-3 py-1.5 rounded-xl border border-slate-800/80 self-start sm:self-auto">
                    {blockRooms.reduce((acc, r) => acc + (r.capacity - (r.occupants?.length || 0)), 0)} Beds Free
                  </span>
                </div>

                {/* 🟢 CLEAN ROOM CARDS (STUDENT LIST HIDDEN INITIALLY, SHOWN ONLY ON CLICK) */}
                {blockRooms.length === 0 ? (
                  <div className="p-6 text-center text-xs text-slate-500 bg-slate-900/40 rounded-2xl border border-dashed border-slate-800">
                    No matching rooms found in {b.title}.
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {blockRooms.map((room) => {
                      const occCount = room.occupants?.length || 0;
                      const freeSlots = room.capacity - occCount;
                      const isCompletelyVacant = occCount === 0;

                      return (
                        <div
                          key={room.id}
                          onClick={() => setSelectedRoom(room)}
                          className={`group relative bg-slate-900/90 border rounded-3xl p-5 shadow-lg hover:shadow-2xl transition-all cursor-pointer flex flex-col justify-between hover:scale-[1.02] active:scale-[0.98] ${
                            isCompletelyVacant
                              ? 'border-emerald-500/40 hover:border-emerald-400 bg-gradient-to-b from-emerald-950/20 to-slate-900'
                              : 'border-slate-800 hover:border-indigo-500/60'
                          }`}
                        >
                          <div>
                            {/* Room Header */}
                            <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
                              <div className="flex items-center space-x-2">
                                <span className="px-2 py-0.5 rounded-lg text-[11px] font-black uppercase bg-slate-950 text-indigo-300 border border-slate-800">
                                  {room.block}
                                </span>
                                <h3 className="text-base font-black text-white">{room.roomNumber}</h3>
                              </div>

                              {isCompletelyVacant ? (
                                <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                                  🟢 Vacant
                                </span>
                              ) : freeSlots > 0 ? (
                                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40">
                                  🟡 {freeSlots} Bed Free
                                </span>
                              ) : (
                                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-800 text-slate-400">
                                  🔴 Full ({occCount}/{room.capacity})
                                </span>
                              )}
                            </div>

                            {/* Clean Room Specs (No list here) */}
                            <div className="mt-3 flex items-center justify-between text-xs">
                              <span className="text-[11px] font-semibold text-slate-400">
                                Floor {room.floor} • <strong>{room.capacity} Bed Capacity</strong>
                              </span>

                              {/* Warden Edit Button */}
                              {role === 'warden' && (
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation(); // prevent opening occupant modal
                                    setEditingRoom(room);
                                    setEditedRoomNumber(room.roomNumber);
                                    setEditedCapacity(room.capacity);
                                    setEditedFloor(room.floor);
                                    setEditedBlock(room.block);
                                  }}
                                  className="p-1.5 text-indigo-400 hover:bg-indigo-600/20 rounded-lg border border-indigo-500/30"
                                  title="Edit Room"
                                >
                                  <Edit2 className="w-3 h-3" />
                                </button>
                              )}
                            </div>

                            {/* Occupancy Indicator Bar */}
                            <div className="mt-3 space-y-1">
                              <div className="flex justify-between text-[10px] font-mono text-slate-400">
                                <span>Allotted Students</span>
                                <span className="font-bold text-white">{occCount} / {room.capacity}</span>
                              </div>
                              <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden border border-slate-800">
                                <div
                                  className={`h-full rounded-full ${
                                    occCount === 0
                                      ? 'bg-transparent'
                                      : occCount < room.capacity
                                      ? 'bg-amber-500'
                                      : 'bg-indigo-500'
                                  }`}
                                  style={{ width: `${(occCount / room.capacity) * 100}%` }}
                                />
                              </div>
                            </div>
                          </div>

                          <div className="mt-4 pt-2.5 border-t border-slate-800/80 flex items-center justify-between text-xs text-indigo-400 font-bold group-hover:text-indigo-300">
                            <span>View Allotted Students →</span>
                            <Users className="w-3.5 h-3.5" />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
      </div>

      {/* 🟢 OCCUPANT DETAIL MODAL (OPENS ONLY ON CLICKING ROOM NUMBER) */}
      {selectedRoom && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 animate-fadeIn">
          <div className="bg-slate-900 border-2 border-indigo-500/60 rounded-3xl max-w-xl w-full p-6 shadow-2xl relative max-h-[90vh] overflow-y-auto space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-black bg-indigo-600 text-white">
                  {selectedRoom.block} Block
                </span>
                <h3 className="text-xl font-black text-white mt-1">Room {selectedRoom.roomNumber} Occupants Roster</h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Floor {selectedRoom.floor} • Total Capacity: {selectedRoom.capacity} Beds
                </p>
              </div>

              <button
                onClick={() => setSelectedRoom(null)}
                className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl"
              >
                ✕
              </button>
            </div>

            {/* Students in this room */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                  Allotted Students ({selectedRoom.occupants?.length || 0}/{selectedRoom.capacity}):
                </h4>

                {role === 'warden' && (selectedRoom.occupants?.length || 0) < selectedRoom.capacity && (
                  <button
                    onClick={() => setShowAllocateModal(true)}
                    className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold flex items-center gap-1 shadow-md"
                  >
                    <UserPlus className="w-3.5 h-3.5" />
                    <span>Allocate Student</span>
                  </button>
                )}
              </div>

              {(!selectedRoom.occupants || selectedRoom.occupants.length === 0) ? (
                <div className="py-8 text-center text-xs text-slate-500 bg-slate-950/60 rounded-2xl border border-dashed border-slate-800 space-y-1">
                  <p className="font-bold text-slate-400">This Room is Completely Vacant</p>
                  <p>No students have been assigned to Room {selectedRoom.roomNumber} yet.</p>
                </div>
              ) : (
                <div className="space-y-2.5">
                  {selectedRoom.occupants.map((student) => (
                    <div
                      key={student.id}
                      className="bg-slate-950 border border-slate-800 p-4 rounded-2xl flex items-center justify-between"
                    >
                      <div className="flex items-center gap-3.5">
                        <img
                          src={student.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80'}
                          alt={student.name}
                          className="w-12 h-12 rounded-2xl object-cover border-2 border-indigo-500/40 shadow-md shrink-0"
                          referrerPolicy="no-referrer"
                        />
                        <div>
                          <h5 className="text-sm font-bold text-white flex items-center gap-2">
                            {student.name}
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                              {student.year || 1} Year
                            </span>
                          </h5>
                          <p className="text-xs text-slate-300 mt-0.5">
                            Roll: <span className="text-white font-mono">{student.rollNo}</span> • Branch: <span className="text-indigo-300">{student.branch}</span>
                          </p>
                          {student.phone && (
                            <p className="text-[11px] text-slate-400 mt-0.5">Contact: {student.phone}</p>
                          )}
                        </div>
                      </div>

                      {role === 'warden' && onRemoveOccupant && (
                        <button
                          onClick={() => onRemoveOccupant(selectedRoom.id, student.id)}
                          className="p-2 bg-slate-900 hover:bg-red-950 text-red-400 rounded-xl text-xs border border-slate-800"
                          title="Deallocate Student"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="pt-3 border-t border-slate-800 flex justify-end">
              <button
                onClick={() => setSelectedRoom(null)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-bold"
              >
                Close Window
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 1. ADD ROOM & CAPACITY MODAL */}
      {showAddRoomModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-4 backdrop-blur-xs">
          <div className="bg-slate-900 border border-indigo-500/40 rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Plus className="w-5 h-5 text-emerald-400" />
                Add New Room & Set Bed Capacity
              </h3>
              <button onClick={() => setShowAddRoomModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateRoomSubmit} className="space-y-3">
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Select Block:</label>
                  <select
                    value={addBlock}
                    onChange={(e) => setAddBlock(e.target.value as BlockName)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white"
                  >
                    <option value="Tagore">Tagore Block</option>
                    <option value="Tilak">Tilak Block</option>
                    <option value="Subhash">Subhash Block</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Floor Number:</label>
                  <select
                    value={addFloor}
                    onChange={(e) => setAddFloor(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white"
                  >
                    <option value={0}>Ground Floor (0)</option>
                    <option value={1}>1st Floor</option>
                    <option value={2}>2nd Floor</option>
                    <option value={3}>3rd Floor</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs text-slate-300 font-semibold mb-1">Room Number (e.g. Tagore-105):</label>
                <input
                  type="text"
                  value={addRoomNumber}
                  onChange={(e) => setAddRoomNumber(e.target.value)}
                  placeholder="e.g. Tagore-105 or Tilak-301"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-white"
                  required
                />
              </div>

              <div>
                <label className="block text-xs text-amber-300 font-semibold mb-1">Total Bed Capacity:</label>
                <select
                  value={addCapacity}
                  onChange={(e) => setAddCapacity(Number(e.target.value))}
                  className="w-full bg-slate-950 border border-amber-500/40 rounded-xl p-2.5 text-xs text-white font-bold"
                >
                  <option value={1}>1 Bed (Single Room)</option>
                  <option value={2}>2 Beds (Double Sharing)</option>
                  <option value={3}>3 Beds (Triple Sharing)</option>
                  <option value={4}>4 Beds (Four Sharing)</option>
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowAddRoomModal(false)}
                  className="px-4 py-2 bg-slate-800 text-slate-300 rounded-xl text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold shadow-lg"
                >
                  Create Room
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 2. EDIT ROOM MODAL */}
      {editingRoom && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-4 backdrop-blur-xs">
          <div className="bg-slate-900 border border-indigo-500/40 rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Edit2 className="w-5 h-5 text-indigo-400" />
                Edit Room & Bed Capacity
              </h3>
              <button onClick={() => setEditingRoom(null)} className="text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveRoomEditSubmit} className="space-y-3">
              <div>
                <label className="block text-xs text-slate-300 font-semibold mb-1">Room Number:</label>
                <input
                  type="text"
                  value={editedRoomNumber}
                  onChange={(e) => setEditedRoomNumber(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-white font-bold"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Block:</label>
                  <select
                    value={editedBlock}
                    onChange={(e) => setEditedBlock(e.target.value as BlockName)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white"
                  >
                    <option value="Tagore">Tagore</option>
                    <option value="Tilak">Tilak</option>
                    <option value="Subhash">Subhash</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Floor:</label>
                  <select
                    value={editedFloor}
                    onChange={(e) => setEditedFloor(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white"
                  >
                    <option value={0}>Ground (0)</option>
                    <option value={1}>1st Floor</option>
                    <option value={2}>2nd Floor</option>
                    <option value={3}>3rd Floor</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs text-amber-300 font-semibold mb-1">Bed Capacity:</label>
                <select
                  value={editedCapacity}
                  onChange={(e) => setEditedCapacity(Number(e.target.value))}
                  className="w-full bg-slate-950 border border-amber-500/40 rounded-xl p-2.5 text-xs text-white font-bold"
                >
                  <option value={1}>1 Bed</option>
                  <option value={2}>2 Beds</option>
                  <option value={3}>3 Beds</option>
                  <option value={4}>4 Beds</option>
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setEditingRoom(null)}
                  className="px-4 py-2 bg-slate-800 text-slate-300 rounded-xl text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold shadow-lg"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 4. STUDENT ALLOCATION MODAL */}
      {showAllocateModal && selectedRoom && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-4 backdrop-blur-xs">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-md w-full p-6 shadow-2xl">
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
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
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
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
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