// src/App.tsx
import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { MissedAttendanceManager } from './components/MissedAttendanceManager';
import { LoginPage } from './components/LoginPage';
import { HomeLeaveSection } from './components/HomeLeaveSection';
import { MessMenuSection } from './components/MessMenuSection';
import { RoomOccupancySection } from './components/RoomOccupancySection';
import { ComplaintsSection } from './components/ComplaintsSection';
import { AttendanceSection } from './components/AttendanceSection';
import { BunkAlertSection } from './components/BunkAlertSection';
import { AlertsSection } from './components/AlertsSection';
import { MediaModal } from './components/MediaModal';
import { YearGroupsSection } from './components/YearGroupsSection';
import { StudentManager } from './components/StudentManager';
import { GuardTerminal } from './components/GuardTerminal';
import { hostelDB } from './data/hostelDB';
import {
  INITIAL_MESS_MENU,
  INITIAL_ROOMS,
  INITIAL_COMPLAINTS,
  INITIAL_ATTENDANCE_SUMMARIES,
  INITIAL_ALERTS,
  INITIAL_LEAVE_PASSES,
  DEFAULT_ATTENDANCE_TIMING,
  DEFAULT_OUTING_RULES,
  INITIAL_YEAR_GROUP_MESSAGES
} from './data/mockData';
import {
  UserAuthSession,
  Role,
  DayMessMenu,
  Room,
  Complaint,
  StudentAttendanceSummary,
  AlertNotice,
  ComplaintMedia,
  ComplaintStatus,
  RoomOccupant,
  HomeLeavePass,
  LeaveStatus,
  AttendanceTimingConfig,
  YearGroupMessage,
  OutingRulesConfig,
  BlockName
} from './types';

export default function App() {
  const [userSession, setUserSession] = useState<UserAuthSession | null>(() => {
    const saved = localStorage.getItem('hostel_user_session');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return null;
      }
    }
    return null;
  });

  // 🟢 THEME ENGINE: Sync with HTML <html> tag for Pure Day/Night transition
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    const savedTheme = localStorage.getItem('hostel_theme_mode');
    return savedTheme ? savedTheme === 'dark' : true;
  });

  useEffect(() => {
    const root = document.documentElement;
    if (isDarkMode) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    localStorage.setItem('hostel_theme_mode', isDarkMode ? 'dark' : 'light');
  }, [isDarkMode]);

  const toggleTheme = () => {
    setIsDarkMode((prev) => !prev);
  };

  const [activeTab, setActiveTab] = useState<string>('leave');

  const [menuList, setMenuList] = useState<DayMessMenu[]>(() => {
    const saved = localStorage.getItem('hostel_menu');
    return saved ? JSON.parse(saved) : INITIAL_MESS_MENU;
  });

  const [rooms, setRooms] = useState<Room[]>(() => {
    const saved = localStorage.getItem('hostel_rooms');
    return saved ? JSON.parse(saved) : INITIAL_ROOMS;
  });

  const [complaints, setComplaints] = useState<Complaint[]>(() => {
    const saved = localStorage.getItem('hostel_complaints');
    return saved ? JSON.parse(saved) : INITIAL_COMPLAINTS;
  });

  const [attendanceSummaries, setAttendanceSummaries] = useState<StudentAttendanceSummary[]>(() => {
    const saved = localStorage.getItem('hostel_attendance');
    return saved ? JSON.parse(saved) : INITIAL_ATTENDANCE_SUMMARIES;
  });

  const [alerts, setAlerts] = useState<AlertNotice[]>(() => {
    const saved = localStorage.getItem('hostel_alerts');
    return saved ? JSON.parse(saved) : INITIAL_ALERTS;
  });

  const [leavePasses, setLeavePasses] = useState<HomeLeavePass[]>(() => {
    const saved = localStorage.getItem('hostel_leave_passes');
    return saved ? JSON.parse(saved) : INITIAL_LEAVE_PASSES;
  });

  const [timingConfig, setTimingConfig] = useState<AttendanceTimingConfig>(() => {
    const saved = localStorage.getItem('hostel_timing_config');
    return saved ? JSON.parse(saved) : DEFAULT_ATTENDANCE_TIMING;
  });

  const [yearGroupMessages, setYearGroupMessages] = useState<YearGroupMessage[]>(() => {
    const saved = localStorage.getItem('hostel_year_group_messages');
    return saved ? JSON.parse(saved) : INITIAL_YEAR_GROUP_MESSAGES;
  });

  const [outingRules, setOutingRules] = useState<OutingRulesConfig>(() => {
    const saved = localStorage.getItem('hostel_outing_rules');
    return saved ? JSON.parse(saved) : DEFAULT_OUTING_RULES;
  });

  const [isRoomDirectoryVisibleToStudents, setIsRoomDirectoryVisibleToStudents] = useState<boolean>(() => {
    const saved = localStorage.getItem('hostel_room_directory_visible');
    return saved ? JSON.parse(saved) : false;
  });

  const [activeMedia, setActiveMedia] = useState<ComplaintMedia | null>(null);

  // Realtime Cloud Passes Sync
  useEffect(() => {
    const unsubscribe = hostelDB.subscribeToPasses((cloudPasses) => {
      if (cloudPasses && cloudPasses.length > 0) {
        setLeavePasses(cloudPasses);
      }
    });
    return () => unsubscribe();
  }, []);

  // Sync to localStorage
  useEffect(() => {
    if (userSession) {
      localStorage.setItem('hostel_user_session', JSON.stringify(userSession));
    } else {
      localStorage.removeItem('hostel_user_session');
    }
  }, [userSession]);

  useEffect(() => {
    localStorage.setItem('hostel_menu', JSON.stringify(menuList));
  }, [menuList]);

  useEffect(() => {
    localStorage.setItem('hostel_rooms', JSON.stringify(rooms));
  }, [rooms]);

  useEffect(() => {
    localStorage.setItem('hostel_complaints', JSON.stringify(complaints));
  }, [complaints]);

  useEffect(() => {
    localStorage.setItem('hostel_attendance', JSON.stringify(attendanceSummaries));
  }, [attendanceSummaries]);

  useEffect(() => {
    localStorage.setItem('hostel_alerts', JSON.stringify(alerts));
  }, [alerts]);

  useEffect(() => {
    localStorage.setItem('hostel_leave_passes', JSON.stringify(leavePasses));
  }, [leavePasses]);

  useEffect(() => {
    localStorage.setItem('hostel_timing_config', JSON.stringify(timingConfig));
  }, [timingConfig]);

  useEffect(() => {
    localStorage.setItem('hostel_year_group_messages', JSON.stringify(yearGroupMessages));
  }, [yearGroupMessages]);

  useEffect(() => {
    localStorage.setItem('hostel_room_directory_visible', JSON.stringify(isRoomDirectoryVisibleToStudents));
  }, [isRoomDirectoryVisibleToStudents]);

  useEffect(() => {
    localStorage.setItem('hostel_outing_rules', JSON.stringify(outingRules));
  }, [outingRules]);

  // AUTO ALLOT ROOM ON ADMISSION
  const handleAutoAllotToRoom = (roomNumber: string, block: BlockName, studentData: any) => {
    const cleanRoomNo = roomNumber.trim();
    const existingRoom = rooms.find(
      (r) => r.roomNumber.toLowerCase() === cleanRoomNo.toLowerCase() || r.roomNumber.toLowerCase().includes(cleanRoomNo.toLowerCase())
    );

    if (existingRoom) {
      const currentOccupants = existingRoom.occupants || [];
      if (currentOccupants.length >= existingRoom.capacity) {
        return {
          success: false,
          message: `⛔ ROOM FULL: Room ${existingRoom.roomNumber} (${existingRoom.block}) pehle se full hai (${currentOccupants.length}/${existingRoom.capacity} Beds Occupied)!`
        };
      }

      const newOccupant: RoomOccupant = {
        ...studentData,
        id: `std-${Date.now()}`
      };

      setRooms(
        rooms.map((r) =>
          r.id === existingRoom.id
            ? { ...r, occupants: [...currentOccupants, newOccupant] }
            : r
        )
      );

      return {
        success: true,
        message: `✅ Allotted to Room ${existingRoom.roomNumber} (${currentOccupants.length + 1}/${existingRoom.capacity} Beds).`
      };
    } else {
      const newRoom: Room = {
        id: `${block.toLowerCase()}-${Date.now()}`,
        block,
        roomNumber: cleanRoomNo,
        floor: parseInt(cleanRoomNo.replace(/\D/g, '')[0] || '1', 10) || 1,
        capacity: 2,
        facilities: ['High-Speed LAN', 'Balcony', 'Study Desks'],
        isMaintained: true,
        occupants: [{ ...studentData, id: `std-${Date.now()}` }]
      };

      setRooms([...rooms, newRoom]);
      return {
        success: true,
        message: `✅ New Room ${cleanRoomNo} created & Student Allotted!`
      };
    }
  };

// 🎯 Push Notice Handler (Only Name + Face ID)
  const handlePushMissedAttendanceNotice = (yearGroup: 1 | 2 | 3 | 4, studentName: string, faceId: string) => {
    const now = new Date();
    const timeStr = `${now.toLocaleDateString('en-US', { month: 'short', day: '2-digit' })} ${now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;

    const missedMsg: YearGroupMessage = {
      id: `auto-${Date.now()}`,
      yearGroup,
      senderName: 'Hostel System Automation',
      senderRole: 'System Automation',
      message: `🚨 MISSED BIOMETRIC ATTENDANCE ALERT:\n👤 Student Name: ${studentName}\n🆔 Biometric Face ID: ${faceId}\n\n⚠️ Turant Main Gate par jakar apna Biometric Face ID punch karein.`,
      timestamp: timeStr,
      isAutomatedMissedNotice: true,
      flaggedStudentName: studentName
    };

    setYearGroupMessages((prev) => [missedMsg, ...prev]);
  };

  // RE-ALLOT ON STUDENT EDIT
  const handleReallotStudentRoom = (oldRoomNumber: string, newRoomNumber: string, block: BlockName, studentData: any) => {
    const cleanOldRoom = oldRoomNumber.trim();
    const cleanNewRoom = newRoomNumber.trim();

    if (cleanOldRoom.toLowerCase() === cleanNewRoom.toLowerCase()) {
      setRooms(
        rooms.map((r) => {
          if (r.roomNumber.toLowerCase() === cleanOldRoom.toLowerCase() && r.occupants) {
            return {
              ...r,
              occupants: r.occupants.map((occ) =>
                occ.rollNo.toUpperCase() === studentData.rollNo.toUpperCase()
                  ? { ...occ, ...studentData }
                  : occ
              )
            };
          }
          return r;
        })
      );
      return { success: true, message: 'Profile updated in same room.' };
    }

    const targetNewRoom = rooms.find(
      (r) => r.roomNumber.toLowerCase() === cleanNewRoom.toLowerCase()
    );

    if (targetNewRoom) {
      const occupantsInNew = targetNewRoom.occupants || [];
      if (occupantsInNew.length >= targetNewRoom.capacity) {
        return {
          success: false,
          message: `⛔ NEW ROOM FULL: Room ${targetNewRoom.roomNumber} is already full (${occupantsInNew.length}/${targetNewRoom.capacity} Beds)!`
        };
      }
    }

    let updatedRoomsList = rooms.map((r) => {
      if (r.roomNumber.toLowerCase() === cleanOldRoom.toLowerCase() && r.occupants) {
        return {
          ...r,
          occupants: r.occupants.filter((occ) => occ.rollNo.toUpperCase() !== studentData.rollNo.toUpperCase())
        };
      }
      return r;
    });

    if (targetNewRoom) {
      updatedRoomsList = updatedRoomsList.map((r) => {
        if (r.id === targetNewRoom.id) {
          return {
            ...r,
            occupants: [...(r.occupants || []), { ...studentData, id: `std-${Date.now()}` }]
          };
        }
        return r;
      });
    } else {
      const brandNewRoom: Room = {
        id: `${block.toLowerCase()}-${Date.now()}`,
        block,
        roomNumber: cleanNewRoom,
        floor: parseInt(cleanNewRoom.replace(/\D/g, '')[0] || '1', 10) || 1,
        capacity: 2,
        facilities: ['High-Speed LAN', 'Balcony', 'Study Desks'],
        isMaintained: true,
        occupants: [{ ...studentData, id: `std-${Date.now()}` }]
      };
      updatedRoomsList.push(brandNewRoom);
    }

    setRooms(updatedRoomsList);
    return {
      success: true,
      message: `✅ Student moved from Room ${cleanOldRoom} to Room ${cleanNewRoom}!`
    };
  };

  const handleRemoveOccupantFromRoom = (roomNumber: string, studentRoll: string) => {
    setRooms(
      rooms.map((r) => {
        if (r.occupants) {
          return {
            ...r,
            occupants: r.occupants.filter((occ) => occ.rollNo.toUpperCase() !== studentRoll.toUpperCase())
          };
        }
        return r;
      })
    );
  };

  if (!userSession) {
    return <LoginPage onLogin={(session) => setUserSession(session)} />;
  }

  const role = userSession.role;

  if (role === 'guard') {
    return (
      <GuardTerminal
        leavePasses={leavePasses}
        onRecordGateScan={async (id, action, guardName) => {
          const now = new Date();
          const nowStr = `${now.toLocaleDateString('en-US', { month: 'short', day: '2-digit' })} ${now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;

          const targetPass = leavePasses.find((p) => p.id === id);
          if (!targetPass) return;

          const currentLogs = targetPass.gateScanLogs || [];
          const newCount = (targetPass.gateMovementCount || 0) + 1;
          const newLog = { timestamp: nowStr, action, verifiedByGuard: guardName || 'Main Gate Guard' };
          const newStatus = action === 'EXITED' ? ('Departed' as LeaveStatus) : (action === 'RE_ENTERED' && targetPass.passCategory === 'Outstation Vacation' ? ('Returned' as LeaveStatus) : targetPass.status);

          await hostelDB.updatePassStatusInCloud(id, newStatus, {
            gateMovementCount: newCount,
            gateScanLogs: [newLog, ...currentLogs]
          });
        }}
        userSession={userSession}
        onLogout={() => setUserSession(null)}
      />
    );
  }

  const activeAlertCount = alerts.filter((a) => a.active).length;
  const bunkCount = attendanceSummaries.filter((s) => s.collegeBunkFlagToday).length;
  const missedBiometricCount = attendanceSummaries.filter((s) =>
    s.missedDates.includes('2026-08-03')
  ).length;
  const activeLeavePassCount = leavePasses.filter((p) => p.status === 'Applied' || p.status === 'Departed').length;

  const handleLogout = () => {
    setUserSession(null);
  };

  const handleApplyLeavePass = async (
    newPassData: Omit<HomeLeavePass, 'id' | 'createdAt' | 'status' | 'parentSmsSent'>
  ) => {
    const newPass: HomeLeavePass = {
      ...newPassData,
      id: `pass-${Date.now()}`,
      status: 'Applied',
      parentSmsSent: false,
      createdAt: new Date().toISOString()
    };

    await hostelDB.savePassToCloud(newPass);
    setLeavePasses((prev) => [newPass, ...prev.filter((p) => p.id !== newPass.id)]);
  };

  const handleUpdateLeaveStatus = async (id: string, status: LeaveStatus) => {
    if (role !== 'warden') return;

    const generatedToken = `WDN-SEAL-${Math.floor(1000 + Math.random() * 9000)}-AUTHENTICATED`;

    await hostelDB.updatePassStatusInCloud(id, status, {
      verificationToken: generatedToken,
      wardenApprovedBy: 'Chief Warden Office'
    });

    setLeavePasses((prev) =>
      prev.map((p) =>
        p.id === id
          ? { ...p, status, verificationToken: generatedToken, wardenApprovedBy: 'Chief Warden Office' }
          : p
      )
    );
  };

  const handleRecordGateScan = async (id: string, action: 'EXITED' | 'RE_ENTERED', guardName: string = 'Main Gate Security Guard') => {
    const now = new Date();
    const nowStr = `${now.toLocaleDateString('en-US', { month: 'short', day: '2-digit' })} ${now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;

    const targetPass = leavePasses.find((p) => p.id === id);
    if (!targetPass) return;

    const currentLogs = targetPass.gateScanLogs || [];
    const newCount = (targetPass.gateMovementCount || 0) + 1;
    const newLog = { timestamp: nowStr, action, verifiedByGuard: guardName };
    const newStatus = action === 'EXITED' ? ('Departed' as LeaveStatus) : (action === 'RE_ENTERED' && targetPass.passCategory === 'Outstation Vacation' ? ('Returned' as LeaveStatus) : targetPass.status);

    await hostelDB.updatePassStatusInCloud(id, newStatus, {
      gateMovementCount: newCount,
      gateScanLogs: [newLog, ...currentLogs]
    });
  };

  const handleUpdateMenu = (updatedMenu: DayMessMenu[]) => {
    if (role !== 'warden') return;
    setMenuList(updatedMenu);
  };

  const handleUpdateRoom = (roomId: string, updatedFields: Partial<Room>) => {
    if (role !== 'warden') return;
    setRooms(
      rooms.map((r) => {
        if (r.id === roomId) {
          return { ...r, ...updatedFields };
        }
        return r;
      })
    );
  };

  const handleAddRoom = (newRoomData: Omit<Room, 'id' | 'occupants'>) => {
    if (role !== 'warden') return;
    const newRoom: Room = {
      ...newRoomData,
      id: `${newRoomData.block.toLowerCase()}-${Date.now()}`,
      occupants: []
    };
    setRooms([...rooms, newRoom]);
  };

  const handleDeleteRoom = (roomId: string) => {
    if (role !== 'warden') return;
    setRooms(rooms.filter((r) => r.id !== roomId));
  };

  const handleUpdateOccupant = (
    roomId: string,
    occupantId: string,
    updatedFields: Partial<RoomOccupant>
  ) => {
    if (role !== 'warden') return;
    setRooms(
      rooms.map((r) => {
        if (r.id === roomId) {
          return {
            ...r,
            occupants: r.occupants.map((occ) => {
              if (occ.id === occupantId) {
                return { ...occ, ...updatedFields };
              }
              return occ;
            })
          };
        }
        return r;
      })
    );
  };

  const handleRemoveOccupant = (roomId: string, occupantId: string) => {
    if (role !== 'warden') return;
    setRooms(
      rooms.map((r) => {
        if (r.id === roomId) {
          return {
            ...r,
            occupants: r.occupants.filter((occ) => occ.id !== occupantId)
          };
        }
        return r;
      })
    );
  };

  const handleAddOccupant = (roomId: string, occupantData: Omit<RoomOccupant, 'id'>) => {
    if (role !== 'warden') return;
    const newOccupant: RoomOccupant = {
      ...occupantData,
      id: `std-${Date.now()}`
    };

    setRooms(
      rooms.map((r) => {
        if (r.id === roomId) {
          return {
            ...r,
            occupants: [...r.occupants, newOccupant]
          };
        }
        return r;
      })
    );
  };

  const handleAddComplaint = (
    newComplaintData: Omit<Complaint, 'id' | 'createdAt' | 'updatedAt' | 'status'>
  ) => {
    const now = new Date();
    const formattedDate = `${now.getFullYear()}-${(now.getMonth() + 1)
      .toString()
      .padStart(2, '0')}-${now.getDate().toString().padStart(2, '0')} ${now
      .getHours()
      .toString()
      .padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;

    const newComplaint: Complaint = {
      ...newComplaintData,
      id: `CMP-${Math.floor(800 + Math.random() * 200)}`,
      status: 'Pending',
      createdAt: formattedDate,
      updatedAt: formattedDate
    };

    setComplaints([newComplaint, ...complaints]);
  };

  const handleUpdateComplaintStatus = (
    id: string,
    status: ComplaintStatus,
    remarks?: string,
    assignedTo?: string
  ) => {
    if (role !== 'warden') return;
    setComplaints(
      complaints.map((c) => {
        if (c.id === id) {
          return {
            ...c,
            status,
            wardenRemarks: remarks || c.wardenRemarks,
            assignedTo: assignedTo || c.assignedTo,
            updatedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          };
        }
        return c;
      })
    );
  };

  const handleToggleBiometricToday = (studentId: string) => {
    if (role !== 'warden') return;
    setAttendanceSummaries(
      attendanceSummaries.map((s) => {
        if (s.studentId === studentId) {
          const hasMissedToday = s.missedDates.includes('2026-08-03');
          if (hasMissedToday) {
            return {
              ...s,
              presentCount: s.presentCount + 1,
              missedCount: Math.max(0, s.missedCount - 1),
              missedDates: s.missedDates.filter((d) => d !== '2026-08-03')
            };
          } else {
            return {
              ...s,
              presentCount: Math.max(0, s.presentCount - 1),
              missedCount: s.missedCount + 1,
              missedDates: [...s.missedDates, '2026-08-03']
            };
          }
        }
        return s;
      })
    );
  };

  const handleExcuseMissedDate = (studentId: string, date: string) => {
    if (role !== 'warden') return;
    setAttendanceSummaries(
      attendanceSummaries.map((s) => {
        if (s.studentId === studentId) {
          return {
            ...s,
            leaveCount: s.leaveCount + 1,
            missedCount: Math.max(0, s.missedCount - 1),
            missedDates: s.missedDates.filter((d) => d !== date)
          };
        }
        return s;
      })
    );
  };

  const handleAddAlert = (newAlertData: Omit<AlertNotice, 'id' | 'timestamp' | 'active'>) => {
    if (role !== 'warden') return;
    const newAlert: AlertNotice = {
      ...newAlertData,
      id: `alt-${Date.now()}`,
      timestamp: new Date().toLocaleDateString('en-US', {
        month: 'short',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      }),
      active: true
    };

    setAlerts([newAlert, ...alerts]);
  };

  const handleToggleAlertStatus = (id: string) => {
    if (role !== 'warden') return;
    setAlerts(
      alerts.map((a) => {
        if (a.id === id) {
          return { ...a, active: !a.active };
        }
        return a;
      })
    );
  };

  const handleSendYearGroupMessage = (yearGroup: 1 | 2 | 3 | 4, text: string) => {
    if (role !== 'warden') return;
    const now = new Date();
    const timeStr = `${now.toLocaleDateString('en-US', { month: 'short', day: '2-digit' })} ${now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;

    const newMsg: YearGroupMessage = {
      id: `msg-${Date.now()}`,
      yearGroup,
      senderName: 'Chief Warden Office',
      senderRole: role,
      message: text,
      timestamp: timeStr
    };

    setYearGroupMessages([newMsg, ...yearGroupMessages]);
  };

  return (
    <div className={`min-h-screen font-sans transition-colors duration-200 ${
      isDarkMode ? 'bg-[#0B1220] text-[#F8FAFC]' : 'bg-[#FFFFFF] text-[#000000]'
    }`}>
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        role={role}
        userSession={userSession}
        onLogout={handleLogout}
        isDarkMode={isDarkMode}
        onToggleTheme={toggleTheme}
        activeAlertCount={activeAlertCount}
        bunkCount={bunkCount}
        missedBiometricCount={missedBiometricCount}
        activeLeavePassCount={activeLeavePassCount}
      />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Tab: Student Admission Manager */}
        {activeTab === 'students' && (role === 'warden' || role === 'college_admin') && (
          <StudentManager
            role={role}
            rooms={rooms}
            onAutoAllotToRoom={handleAutoAllotToRoom}
            onReallotStudentRoom={handleReallotStudentRoom}
            onRemoveOccupantFromRoom={handleRemoveOccupantFromRoom}
          />
        )}

        {activeTab === 'leave' && (
          <HomeLeaveSection
            leavePasses={leavePasses}
            onApplyLeavePass={handleApplyLeavePass}
            onUpdateLeaveStatus={handleUpdateLeaveStatus}
            userSession={userSession}
            role={role}
            outingRules={outingRules}
            onUpdateOutingRules={(newRules) => {
              if (role === 'warden') setOutingRules(newRules);
            }}
            onRecordGateScan={handleRecordGateScan}
          />
        )}

        {activeTab === 'mess' && (
          <MessMenuSection
            menuList={menuList}
            onUpdateMenu={handleUpdateMenu}
            role={role}
          />
        )}

        {activeTab === 'rooms' && (
          <div className="space-y-8">
            {(role === 'warden' || role === 'college_admin') && (
              <StudentManager
                role={role}
                rooms={rooms}
                onAutoAllotToRoom={handleAutoAllotToRoom}
                onReallotStudentRoom={handleReallotStudentRoom}
                onRemoveOccupantFromRoom={handleRemoveOccupantFromRoom}
              />
            )}

            <RoomOccupancySection
              rooms={rooms}
              onAddRoom={handleAddRoom}
              onDeleteRoom={handleDeleteRoom}
              onAddOccupant={handleAddOccupant}
              onUpdateRoom={handleUpdateRoom}
              onUpdateOccupant={handleUpdateOccupant}
              onRemoveOccupant={handleRemoveOccupant}
              role={role}
              isRoomDirectoryVisibleToStudents={isRoomDirectoryVisibleToStudents}
              onToggleRoomDirectoryVisibility={() => {
                if (role === 'warden') setIsRoomDirectoryVisibleToStudents(!isRoomDirectoryVisibleToStudents);
              }}
            />
          </div>
        )}

        {activeTab === 'complaints' && (
          <ComplaintsSection
            complaints={complaints}
            onAddComplaint={handleAddComplaint}
            onUpdateComplaintStatus={handleUpdateComplaintStatus}
            onViewMedia={(media) => setActiveMedia(media)}
            role={role}
          />
        )}

       {activeTab === 'attendance' && (
          <div className="space-y-6">
            {/* 🎯 Year-Wise Missed Attendance & 1-Click Push Terminal */}
            <MissedAttendanceManager
              role={role}
              onSendNoticeToGroup={(yearGroup, studentName, faceId) => {
                const now = new Date();
                const timeStr = `${now.toLocaleDateString('en-US', { month: 'short', day: '2-digit' })} ${now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;

                const missedMsg: YearGroupMessage = {
                  id: `auto-${Date.now()}`,
                  yearGroup,
                  senderName: 'Hostel System Automation',
                  senderRole: 'System Automation',
                  message: `🚨 MISSED BIOMETRIC ATTENDANCE ALERT:\n👤 Student Name: ${studentName}\n🆔 Biometric Face ID: ${faceId}\n\n⚠️ Turant Main Gate par jakar apna Biometric Face ID punch karein.`,
                  timestamp: timeStr,
                  isAutomatedMissedNotice: true,
                  flaggedStudentName: studentName
                };

                setYearGroupMessages((prev) => [missedMsg, ...prev]);
              }}
            />

            <AttendanceSection
              summaries={attendanceSummaries}
              onToggleBiometricToday={handleToggleBiometricToday}
              onExcuseMissedDate={handleExcuseMissedDate}
              role={role}
              userSession={userSession}
              timingConfig={timingConfig}
              onUpdateTimingConfig={(newTiming) => {
                if (role === 'warden') setTimingConfig(newTiming);
              }}
            />
          </div>
        )}

        {activeTab === 'groups' && (
          <YearGroupsSection
            messages={yearGroupMessages}
            onSendMessage={handleSendYearGroupMessage}
            userSession={userSession}
            role={role}
          />
        )}

        {activeTab === 'bunk' && (
          <BunkAlertSection
            summaries={attendanceSummaries}
            role={role}
            rooms={rooms}
            onUpdateOccupant={handleUpdateOccupant}
            onUpdateAttendanceSummaries={(newSummaries) => setAttendanceSummaries(newSummaries)}
          />
        )}

        {activeTab === 'alerts' && (
          <AlertsSection
            alerts={alerts}
            onAddAlert={handleAddAlert}
            onToggleAlertStatus={handleToggleAlertStatus}
            role={role}
          />
        )}
      </main>

      <MediaModal
        media={activeMedia}
        onClose={() => setActiveMedia(null)}
      />
    </div>
  );
}