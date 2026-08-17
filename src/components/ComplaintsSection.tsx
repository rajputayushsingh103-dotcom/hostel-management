import React, { useState } from 'react';
import {
  Wrench,
  Plus,
  Image,
  Video,
  X,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Upload,
  Camera,
  UserCheck,
  Building,
  FileText,
  Eye,
  MessageSquare
} from 'lucide-react';
import {
  BlockName,
  Complaint,
  ComplaintCategory,
  ComplaintMedia,
  ComplaintPriority,
  ComplaintStatus,
  Role
} from '../types';

interface ComplaintsSectionProps {
  complaints: Complaint[];
  onAddComplaint: (newComplaint: Omit<Complaint, 'id' | 'createdAt' | 'updatedAt' | 'status'>) => void;
  onUpdateComplaintStatus: (id: string, status: ComplaintStatus, remarks?: string, assignedTo?: string) => void;
  onViewMedia: (media: ComplaintMedia) => void;
  role: Role;
}

const CATEGORIES: ComplaintCategory[] = [
  'Electrical',
  'Plumbing',
  'Wi-Fi / Network',
  'Mess / Food',
  'Cleanliness',
  'Furniture',
  'Other'
];

export const ComplaintsSection: React.FC<ComplaintsSectionProps> = ({
  complaints,
  onAddComplaint,
  onUpdateComplaintStatus,
  onViewMedia,
  role
}) => {
  const [showForm, setShowForm] = useState(false);
  const [filterCategory, setFilterCategory] = useState<string>('All');
  const [filterStatus, setFilterStatus] = useState<string>('All');

  // Form states
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<ComplaintCategory>('Electrical');
  const [priority, setPriority] = useState<ComplaintPriority>('Medium');
  const [block, setBlock] = useState<BlockName>('Tagore');
  const [roomNumber, setRoomNumber] = useState('Tagore-101');
  const [studentName, setStudentName] = useState('Aayush Singh');
  const [studentRoll, setStudentRoll] = useState('2024CS1042');
  const [description, setDescription] = useState('');
  const [mediaList, setMediaList] = useState<ComplaintMedia[]>([]);

  // Warden action state
  const [updatingComplaint, setUpdatingComplaint] = useState<Complaint | null>(null);
  const [wardenStatus, setWardenStatus] = useState<ComplaintStatus>('In Progress');
  const [wardenTechnician, setWardenTechnician] = useState('');
  const [wardenRemarksText, setWardenRemarksText] = useState('');

  // Handle local file upload (photo/video)
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    Array.from(files).forEach((file: File) => {
      const isVideo = file.type.startsWith('video/');
      const fileUrl = URL.createObjectURL(file);

      setMediaList((prev) => [
        ...prev,
        {
          id: `media-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
          type: isVideo ? 'video' : 'image',
          url: fileUrl,
          name: file.name
        }
      ]);
    });
  };

  // Preset demo photo/video attachment loader for instant test
  const addPresetSampleMedia = (type: 'image' | 'video') => {
    if (type === 'image') {
      setMediaList((prev) => [
        ...prev,
        {
          id: `preset-img-${Date.now()}`,
          type: 'image',
          url: 'https://images.unsplash.com/photo-1542013936693-884638332954?auto=format&fit=crop&w=800&q=80',
          name: 'broken_electrical_switch.jpg'
        }
      ]);
    } else {
      setMediaList((prev) => [
        ...prev,
        {
          id: `preset-vid-${Date.now()}`,
          type: 'video',
          url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
          name: 'water_leakage_proof_video.mp4'
        }
      ]);
    }
  };

  const removeMedia = (id: string) => {
    setMediaList((prev) => prev.filter((m) => m.id !== id));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !description.trim()) return;

    onAddComplaint({
      studentName,
      studentRoll,
      block,
      roomNumber,
      category,
      priority,
      title,
      description,
      media: mediaList
    });

    // Reset Form
    setTitle('');
    setDescription('');
    setMediaList([]);
    setShowForm(false);
  };

  const handleWardenSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!updatingComplaint) return;

    onUpdateComplaintStatus(
      updatingComplaint.id,
      wardenStatus,
      wardenRemarksText,
      wardenTechnician
    );

    setUpdatingComplaint(null);
  };

  // Filter complaints list
  const filteredComplaints = complaints.filter((c) => {
    if (filterCategory !== 'All' && c.category !== filterCategory) return false;
    if (filterStatus !== 'All' && c.status !== filterStatus) return false;
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 sm:p-6 shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-2 rounded-xl bg-violet-500/20 text-violet-400 border border-violet-500/30">
                <Wrench className="w-5 h-5" />
              </span>
              <h2 className="text-xl font-bold text-white">Hostel Maintenance & Complaint Portal</h2>
            </div>
            <p className="text-xs sm:text-sm text-slate-400 mt-1">
              Lodge grievances for electrical, plumbing, Wi-Fi or mess issues with photo & video proof.
            </p>
          </div>

          <button
            onClick={() => setShowForm(true)}
            className="px-5 py-2.5 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white rounded-xl font-bold text-xs sm:text-sm flex items-center gap-2 shadow-lg shadow-indigo-600/30 transition-all self-start md:self-auto"
          >
            <Plus className="w-4 h-4" />
            Lodge New Complaint (Photo/Video)
          </button>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-md flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <span className="text-slate-400 font-semibold mr-1">Category:</span>
          {['All', ...CATEGORIES].map((cat) => (
            <button
              key={cat}
              onClick={() => setFilterCategory(cat)}
              className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
                filterCategory === cat
                  ? 'bg-violet-600 text-white'
                  : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2 text-xs">
          <span className="text-slate-400 font-semibold">Status:</span>
          {['All', 'Pending', 'In Progress', 'Resolved'].map((st) => (
            <button
              key={st}
              onClick={() => setFilterStatus(st)}
              className={`px-2.5 py-1 rounded-md font-semibold transition-colors ${
                filterStatus === st
                  ? 'bg-indigo-600 text-white'
                  : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Complaints List */}
      <div className="space-y-4">
        {filteredComplaints.map((item) => {
          const isPending = item.status === 'Pending';
          const isInProgress = item.status === 'In Progress';
          const isResolved = item.status === 'Resolved';

          return (
            <div
              key={item.id}
              className={`bg-slate-900 border rounded-2xl p-5 shadow-lg transition-all ${
                isPending
                  ? 'border-amber-500/40'
                  : isInProgress
                  ? 'border-indigo-500/40'
                  : 'border-emerald-500/40'
              }`}
            >
              <div className="flex flex-col md:flex-row md:items-start justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-xs font-mono text-slate-400 font-semibold">{item.id}</span>
                    <span className="px-2.5 py-0.5 rounded-md text-xs font-bold bg-slate-800 text-violet-300 border border-slate-700">
                      {item.category}
                    </span>
                    <span
                      className={`px-2.5 py-0.5 rounded-md text-xs font-bold ${
                        item.priority === 'Emergency'
                          ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30 animate-pulse'
                          : item.priority === 'High'
                          ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                          : 'bg-slate-800 text-slate-400'
                      }`}
                    >
                      Priority: {item.priority}
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-white mt-1">{item.title}</h3>

                  <p className="text-xs text-slate-400 flex flex-wrap items-center gap-2">
                    <span>Logged by: <strong className="text-slate-200">{item.studentName}</strong> ({item.studentRoll})</span>
                    <span>•</span>
                    <span>Location: <strong className="text-slate-200">{item.roomNumber} ({item.block} Block)</strong></span>
                    <span>•</span>
                    <span className="text-slate-500">{item.createdAt}</span>
                  </p>
                </div>

                {/* Status Badge & Warden Button */}
                <div className="flex items-center gap-2">
                  <span
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-extrabold ${
                      isPending
                        ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                        : isInProgress
                        ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/40'
                        : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                    }`}
                  >
                    {isPending && <Clock className="w-3.5 h-3.5" />}
                    {isInProgress && <Wrench className="w-3.5 h-3.5" />}
                    {isResolved && <CheckCircle2 className="w-3.5 h-3.5" />}
                    {item.status}
                  </span>

                  {role === 'warden' && (
                    <button
                      onClick={() => {
                        setUpdatingComplaint(item);
                        setWardenStatus(item.status);
                        setWardenTechnician(item.assignedTo || '');
                        setWardenRemarksText(item.wardenRemarks || '');
                      }}
                      className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold shadow-xs"
                    >
                      Update Status
                    </button>
                  )}
                </div>
              </div>

              {/* Description */}
              <div className="mt-3 bg-slate-950 p-3.5 rounded-xl border border-slate-800 text-xs text-slate-300">
                {item.description}
              </div>

              {/* Attached Photos / Videos */}
              {item.media.length > 0 && (
                <div className="mt-3">
                  <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-2">
                    📷 Attached Photo & Video Proofs ({item.media.length}):
                  </span>
                  <div className="flex flex-wrap gap-3">
                    {item.media.map((med) => (
                      <div
                        key={med.id}
                        onClick={() => onViewMedia(med)}
                        className="group relative w-32 h-24 bg-slate-950 rounded-xl overflow-hidden border border-slate-800 hover:border-violet-500 cursor-pointer shadow-md transition-all"
                      >
                        {med.type === 'image' ? (
                          <img
                            src={med.url}
                            alt={med.name}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                          />
                        ) : (
                          <div className="w-full h-full flex flex-col items-center justify-center bg-slate-950 text-slate-300">
                            <Video className="w-8 h-8 text-violet-400 group-hover:scale-110 transition-transform" />
                            <span className="text-[10px] text-slate-400 font-mono mt-1">Play Video</span>
                          </div>
                        )}

                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                          <Eye className="w-5 h-5 text-white" />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Remarks & Technician Info */}
              {(item.assignedTo || item.wardenRemarks) && (
                <div className="mt-4 pt-3 border-t border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                  {item.assignedTo && (
                    <div className="flex items-center gap-1.5 text-indigo-300 font-medium">
                      <UserCheck className="w-4 h-4 text-indigo-400" />
                      Assigned Technician: <span className="font-bold text-white">{item.assignedTo}</span>
                    </div>
                  )}

                  {item.wardenRemarks && (
                    <div className="flex items-center gap-1.5 text-slate-300 italic">
                      <MessageSquare className="w-3.5 h-3.5 text-slate-400" />
                      Warden Remarks: "{item.wardenRemarks}"
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}

        {filteredComplaints.length === 0 && (
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-12 text-center text-slate-400 space-y-2">
            <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto" />
            <p className="text-base font-semibold text-white">No complaints found</p>
            <p className="text-xs text-slate-400">Everything is running smoothly or matches current filters.</p>
          </div>
        )}
      </div>

      {/* New Complaint Form Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-4 backdrop-blur-xs">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-2xl w-full p-6 shadow-2xl relative max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div className="flex items-center gap-2">
                <span className="p-2 bg-violet-500/20 text-violet-400 rounded-xl border border-violet-500/30">
                  <Wrench className="w-5 h-5" />
                </span>
                <div>
                  <h3 className="text-lg font-bold text-white">Lodge New Hostel Maintenance Complaint</h3>
                  <p className="text-xs text-slate-400">
                    Submit issue details with photo or video proof for quick repair action.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowForm(false)}
                className="p-2 text-slate-400 hover:text-white rounded-lg"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} className="mt-4 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Your Name:</label>
                  <input
                    type="text"
                    value={studentName}
                    onChange={(e) => setStudentName(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Roll Number:</label>
                  <input
                    type="text"
                    value={studentRoll}
                    onChange={(e) => setStudentRoll(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Hostel Block:</label>
                  <select
                    value={block}
                    onChange={(e) => {
                      const b = e.target.value as BlockName;
                      setBlock(b);
                      setRoomNumber(`${b}-101`);
                    }}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white"
                  >
                    <option value="Tagore">Tagore Block</option>
                    <option value="Tilak">Tilak Block</option>
                    <option value="Subhash">Subhash Block</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Room No:</label>
                  <input
                    type="text"
                    value={roomNumber}
                    onChange={(e) => setRoomNumber(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Category:</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as ComplaintCategory)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white"
                  >
                    {CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Complaint Title:</label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g. Bathroom tap leaking heavily"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Priority Level:</label>
                  <select
                    value={priority}
                    onChange={(e) => setPriority(e.target.value as ComplaintPriority)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white"
                  >
                    <option value="Low">Low (Routine)</option>
                    <option value="Medium">Medium (Regular)</option>
                    <option value="High">High (Urgent)</option>
                    <option value="Emergency">🚨 Emergency (Immediate Action)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Detailed Description:</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                  placeholder="Describe exact issue, e.g. speed regulator loose, water dripping onto bed..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white"
                  required
                />
              </div>

              {/* Photo & Video Attachment Section */}
              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-white flex items-center gap-1.5">
                    <Camera className="w-4 h-4 text-violet-400" />
                    Attach Photo & Video Proofs (फोटो & वीडियो अपलोड)
                  </label>
                  <span className="text-[11px] text-slate-400 font-medium">JPG, PNG, MP4 support</span>
                </div>

                {/* Upload Buttons */}
                <div className="flex flex-wrap items-center gap-2">
                  <label className="cursor-pointer px-4 py-2 bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700 rounded-xl text-xs font-semibold flex items-center gap-2 transition-colors">
                    <Upload className="w-4 h-4 text-indigo-400" />
                    Upload File from Device
                    <input
                      type="file"
                      accept="image/*,video/*"
                      multiple
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                  </label>

                  <button
                    type="button"
                    onClick={() => addPresetSampleMedia('image')}
                    className="px-3 py-2 bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-700 rounded-xl text-xs font-semibold flex items-center gap-1.5"
                  >
                    <Image className="w-4 h-4 text-emerald-400" />
                    + Add Demo Photo
                  </button>

                  <button
                    type="button"
                    onClick={() => addPresetSampleMedia('video')}
                    className="px-3 py-2 bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-700 rounded-xl text-xs font-semibold flex items-center gap-1.5"
                  >
                    <Video className="w-4 h-4 text-amber-400" />
                    + Add Demo Video
                  </button>
                </div>

                {/* Media Thumbnails Preview */}
                {mediaList.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-3">
                    {mediaList.map((m) => (
                      <div
                        key={m.id}
                        className="relative w-28 h-20 bg-slate-900 rounded-xl overflow-hidden border border-slate-700 group"
                      >
                        {m.type === 'image' ? (
                          <img src={m.url} alt={m.name} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex flex-col items-center justify-center text-slate-300 bg-slate-950">
                            <Video className="w-6 h-6 text-violet-400" />
                            <span className="text-[9px] text-slate-400 mt-1">Video</span>
                          </div>
                        )}
                        <button
                          type="button"
                          onClick={() => removeMedia(m.id)}
                          className="absolute top-1 right-1 p-1 bg-red-600 text-white rounded-full hover:bg-red-500 shadow-md"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Form Footer */}
              <div className="flex justify-end gap-3 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 text-xs font-bold bg-violet-600 hover:bg-violet-500 text-white rounded-xl shadow-lg"
                >
                  Submit Complaint
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Warden Status Update Modal */}
      {updatingComplaint && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-xs">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-lg w-full p-6 shadow-2xl">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Wrench className="w-5 h-5 text-indigo-400" />
              Update Complaint #{updatingComplaint.id}
            </h3>

            <form onSubmit={handleWardenSubmit} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Status:</label>
                <select
                  value={wardenStatus}
                  onChange={(e) => setWardenStatus(e.target.value as ComplaintStatus)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white font-bold"
                >
                  <option value="Pending">Pending</option>
                  <option value="In Progress">In Progress (Technician Assigned)</option>
                  <option value="Resolved">Resolved (Completed)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Assign Technician (Electrician/Plumber/IT):
                </label>
                <input
                  type="text"
                  value={wardenTechnician}
                  onChange={(e) => setWardenTechnician(e.target.value)}
                  placeholder="e.g. Ramu K. (Electrician)"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Warden Resolution Remarks:
                </label>
                <textarea
                  value={wardenRemarksText}
                  onChange={(e) => setWardenRemarksText(e.target.value)}
                  rows={3}
                  placeholder="e.g. Capacitor replaced by 4 PM."
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white"
                />
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setUpdatingComplaint(null)}
                  className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl shadow-md"
                >
                  Save Updates
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
