import { DayMessMenu, Room, StudentAttendanceSummary, Complaint, AlertNotice, HomeLeavePass, AttendanceTimingConfig, YearGroupMessage, OutingRulesConfig } from '../types';

export const DEFAULT_ATTENDANCE_TIMING: AttendanceTimingConfig = {
  firstYearMessTime: '07:00 PM - 08:15 PM',
  firstYearBiometricCutoff: '20:30', // 08:30 PM
  seniorYearsMessTime: '08:15 PM - 09:30 PM',
  seniorYearsBiometricCutoff: '21:30' // 09:30 PM
};

export const DEFAULT_OUTING_RULES: OutingRulesConfig = {
  firstYearOutingDay: 'Sunday',
  firstYearStartTime: '09:00 AM',
  firstYearEndTime: '06:00 PM',
  seniorRestrictedDay: 'Wednesday',
  curfewReturnTime: '08:30 PM',
  gymDailyOutingEnabled: true,
  multiEntryPerDayEnabled: true
};

export const INITIAL_YEAR_GROUP_MESSAGES: YearGroupMessage[] = [
  {
    id: 'msg-1',
    yearGroup: 1,
    senderName: 'Hostel System Bot',
    senderRole: 'System Automation',
    message: '🚨 MISSED BIOMETRIC ATTENDANCE ALERT: Rohan Verma (Face ID: FID-2026-1001, Room Tagore-102) missed the 08:30 PM biometric punch-in today. Warden & Parent notified.',
    timestamp: '2026-08-03 08:35 PM',
    isAutomatedMissedNotice: true,
    flaggedStudentName: 'Rohan Verma',
    flaggedStudentRoom: 'Tagore-102',
    flaggedStudentFaceId: 'FID-2026-1001'
  },
  {
    id: 'msg-2',
    yearGroup: 1,
    senderName: 'Chief Warden Office',
    senderRole: 'warden',
    message: 'Attention 1st Year Students: Your dinner mess timing is 07:00 PM to 08:15 PM. Complete your biometric punch before 08:30 PM daily at the main gate.',
    timestamp: '2026-08-03 06:00 PM'
  },
  {
    id: 'msg-3',
    yearGroup: 3,
    senderName: 'Hostel System Bot',
    senderRole: 'System Automation',
    message: '🚨 MISSED BIOMETRIC ATTENDANCE ALERT: Aayush Singh (Face ID: FID-2024-1042, Room Tagore-101) missed the 09:30 PM biometric punch-in on 03-Aug. Warden & Parent notified.',
    timestamp: '2026-08-03 09:35 PM',
    isAutomatedMissedNotice: true,
    flaggedStudentName: 'Aayush Singh',
    flaggedStudentRoom: 'Tagore-101',
    flaggedStudentFaceId: 'FID-2024-1042'
  },
  {
    id: 'msg-4',
    yearGroup: 2,
    senderName: 'Chief Warden Office',
    senderRole: 'warden',
    message: 'Notice to 2nd Year Sophomores: Tomorrow morning breakfast menu updated to Idli Sambhar & Filter Coffee.',
    timestamp: '2026-08-03 07:10 PM'
  }
];

export const INITIAL_MESS_MENU: DayMessMenu[] = [
  {
    day: 'Monday',
    breakfast: {
      time: '07:30 AM - 09:15 AM',
      items: ['Aloo Paratha', 'Green Chutney', 'Curd', 'Boiled Eggs / Banana', 'Tea / Coffee'],
      special: 'Crispy Butter Aloo Paratha',
      calories: 450
    },
    lunch: {
      time: '12:30 PM - 02:15 PM',
      items: ['Rajma Masala', 'Jeera Rice', 'Roti', 'Bhoondi Raita', 'Green Salad'],
      special: 'Punjabi Rajma Curry',
      calories: 680
    },
    snacks: {
      time: '05:00 PM - 06:15 PM',
      items: ['Vegetable Samosa (2 pcs)', 'Mint Chutney', 'Hot Milk / Tea'],
      special: 'Desi Samosa & Adrak Chai',
      calories: 320
    },
    dinner: {
      time: '07:30 PM - 09:30 PM',
      items: ['Paneer Butter Masala', 'Dal Tadka', 'Butter Roti', 'Steam Rice', 'Gulab Jamun'],
      special: 'Shahi Paneer & Hot Gulab Jamun',
      calories: 750
    }
  },
  {
    day: 'Tuesday',
    breakfast: {
      time: '07:30 AM - 09:15 AM',
      items: ['Idli Sambar', 'Coconut Chutney', 'Tomato Chutney', 'Tea / Coffee'],
      special: 'South Indian Combo',
      calories: 380
    },
    lunch: {
      time: '12:30 PM - 02:15 PM',
      items: ['Kadhi Pakoda', 'Plain Rice', 'Tandoori Roti', 'Mix Veg Sukhi', 'Papad'],
      special: 'Rajasthani Kadhi Pakoda',
      calories: 620
    },
    snacks: {
      time: '05:00 PM - 06:15 PM',
      items: ['Poha with Bhujia', 'Lemon Wedges', 'Tea / Coffee'],
      special: 'Indori Masala Poha',
      calories: 260
    },
    dinner: {
      time: '07:30 PM - 09:30 PM',
      items: ['Chicken Curry / Kadhai Paneer', 'Yellow Dal', 'Roti', 'Jeera Rice', 'Fruit Custard'],
      special: 'Non-Veg / Special Paneer Feast',
      calories: 780
    }
  },
  {
    day: 'Wednesday',
    breakfast: {
      time: '07:30 AM - 09:15 AM',
      items: ['Puri Bhaji', 'Halwa', 'Sprouts Salad', 'Tea / Coffee'],
      special: 'Puri Chana & Suji Halwa',
      calories: 520
    },
    lunch: {
      time: '12:30 PM - 02:15 PM',
      items: ['Chole Bhature', 'Pulao', 'Cucumber Raita', 'Onion Salad'],
      special: 'Amritsari Chole Bhature',
      calories: 750
    },
    snacks: {
      time: '05:00 PM - 06:15 PM',
      items: ['Bread Pakoda', 'Tomato Ketchup', 'Chai'],
      special: 'Stuffed Stuffed Bread Pakoda',
      calories: 340
    },
    dinner: {
      time: '07:30 PM - 09:30 PM',
      items: ['Mix Veg Handi', 'Dal Fry', 'Plain Roti', 'Rice', 'Rasgulla'],
      special: 'Veg Handi Special',
      calories: 640
    }
  },
  {
    day: 'Thursday',
    breakfast: {
      time: '07:30 AM - 09:15 AM',
      items: ['Uttapam', 'Sambar', 'Groundnut Chutney', 'Tea / Coffee'],
      special: 'Onion Tomato Uttapam',
      calories: 410
    },
    lunch: {
      time: '12:30 PM - 02:15 PM',
      items: ['Dal Makhani', 'Rice', 'Missi Roti / Tandoori Roti', 'Aloo Gobi', 'Salad'],
      special: 'Dhaba Style Dal Makhani',
      calories: 690
    },
    snacks: {
      time: '05:00 PM - 06:15 PM',
      items: ['Veg Chowmein / Hakka Noodles', 'Tea / Cold Coffee'],
      special: 'Desi Hakka Noodles',
      calories: 380
    },
    dinner: {
      time: '07:30 PM - 09:30 PM',
      items: ['Matar Paneer', 'Moong Dal', 'Roti', 'Jeera Rice', 'Kheer'],
      special: 'Matar Paneer & Rice Kheer',
      calories: 710
    }
  },
  {
    day: 'Friday',
    breakfast: {
      time: '07:30 AM - 09:15 AM',
      items: ['Gobhi Paratha', 'Pickle', 'Curd', 'Butter', 'Tea / Coffee'],
      special: 'Stuffed Stuffed Gobhi Paratha',
      calories: 460
    },
    lunch: {
      time: '12:30 PM - 02:15 PM',
      items: ['Veg Biryani', 'Mirchi Ka Salan', 'Onion Raita', 'Papad'],
      special: 'Hyderabadi Dum Veg Biryani',
      calories: 720
    },
    snacks: {
      time: '05:00 PM - 06:15 PM',
      items: ['Pav Bhaji', 'Butter Pav', 'Lemon & Onion', 'Tea'],
      special: 'Mumbai Style Pav Bhaji',
      calories: 440
    },
    dinner: {
      time: '07:30 PM - 09:30 PM',
      items: ['Egg Curry / Dum Aloo', 'Dal Tadka', 'Roti', 'Steamed Rice', 'Ice Cream'],
      special: 'Egg Curry & Vanilla Cone',
      calories: 740
    }
  },
  {
    day: 'Saturday',
    breakfast: {
      time: '07:30 AM - 09:15 AM',
      items: ['Masala Dosa', 'Sambar', 'Coconut Chutney', 'Tea / Coffee'],
      special: 'Crispy Butter Masala Dosa',
      calories: 430
    },
    lunch: {
      time: '12:30 PM - 02:15 PM',
      items: ['Kala Chana Masala', 'Plain Rice', 'Roti', 'Veg Jhalfrezi', 'Curd'],
      special: 'Desi Kala Chana Curry',
      calories: 610
    },
    snacks: {
      time: '05:00 PM - 06:15 PM',
      items: ['Aloo Tikki Chaat', 'Sweet & Green Chutney', 'Tea'],
      special: 'Street Style Aloo Tikki',
      calories: 350
    },
    dinner: {
      time: '07:30 PM - 09:30 PM',
      items: ['Malai Kofta', 'Arhar Dal', 'Butter Naan / Roti', 'Jeera Rice', 'Moong Dal Halwa'],
      special: 'Shahi Malai Kofta & Warm Halwa',
      calories: 820
    }
  },
  {
    day: 'Sunday',
    breakfast: {
      time: '08:00 AM - 10:00 AM',
      items: ['Paneer Paratha', 'Chutney', 'Butter', 'Omelette / Fruit', 'Special Coffee'],
      special: 'Sunday Lazy Breakfast',
      calories: 490
    },
    lunch: {
      time: '01:00 PM - 02:30 PM',
      items: ['Special Dum Biryani (Veg/Chicken)', 'Burani Raita', 'Salad', 'Cold Drink'],
      special: 'Sunday Grand Feast Biryani',
      calories: 850
    },
    snacks: {
      time: '05:30 PM - 06:30 PM',
      items: ['Cream Biscuits / Mathri', 'Chai'],
      special: 'Snack Break',
      calories: 220
    },
    dinner: {
      time: '07:30 PM - 09:30 PM',
      items: ['Kadhai Paneer / Chicken Masala', 'Dal Makhani', 'Butter Roti', 'Pulao', 'Ice Cream Cup'],
      special: 'Weekend Celebration Dinner',
      calories: 890
    }
  }
];

export const INITIAL_ROOMS: Room[] = [
  // TAGORE BLOCK
  {
    id: 'tagore-101',
    block: 'Tagore',
    roomNumber: 'Tagore-101',
    floor: 1,
    capacity: 2,
    facilities: ['Attached Bath', 'Balcony', 'High-Speed LAN'],
    isMaintained: true,
    occupants: [
      {
        id: 'std-101',
        name: 'Aayush Singh (You)',
        rollNo: '2024CS1042',
        branch: 'Computer Science',
        year: 3,
        phone: '+91 98765 43210',
        parentPhone: '+91 98123 45678',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80',
        hostelAttendanceToday: 'present',
        collegeAttendanceToday: 'present'
      },
      {
        id: 'std-102',
        name: 'Rohan Verma',
        rollNo: '2024CS1088',
        branch: 'Computer Science',
        year: 3,
        phone: '+91 98765 12345',
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80',
        hostelAttendanceToday: 'present',
        collegeAttendanceToday: 'present'
      }
    ]
  },
  {
    id: 'tagore-102',
    block: 'Tagore',
    roomNumber: 'Tagore-102',
    floor: 1,
    capacity: 3,
    facilities: ['Balcony', 'Study Desks', 'LAN'],
    isMaintained: true,
    occupants: [
      {
        id: 'std-103',
        name: 'Aditya Srivastava',
        rollNo: '2024EC1012',
        branch: 'Electronics & Comm.',
        year: 2,
        phone: '+91 99887 76655',
        avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=150&q=80',
        hostelAttendanceToday: 'present',
        collegeAttendanceToday: 'absent' // Bunking!
      },
      {
        id: 'std-104',
        name: 'Shivam Tiwari',
        rollNo: '2024EC1045',
        branch: 'Electronics & Comm.',
        year: 2,
        phone: '+91 98111 22334',
        avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=150&q=80',
        hostelAttendanceToday: 'present',
        collegeAttendanceToday: 'absent' // Bunking!
      }
    ]
  },
  {
    id: 'tagore-103',
    block: 'Tagore',
    roomNumber: 'Tagore-103',
    floor: 1,
    capacity: 2,
    facilities: ['AC', 'Attached Bath', 'Balcony'],
    isMaintained: true,
    occupants: [] // VACANT ROOM
  },
  {
    id: 'tagore-201',
    block: 'Tagore',
    roomNumber: 'Tagore-201',
    floor: 2,
    capacity: 3,
    facilities: ['Balcony', 'High-Speed Wi-Fi'],
    isMaintained: true,
    occupants: [
      {
        id: 'std-105',
        name: 'Kunal Sharma',
        rollNo: '2023ME1005',
        branch: 'Mechanical Engg',
        year: 4,
        phone: '+91 97654 32109',
        avatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=150&q=80',
        hostelAttendanceToday: 'absent', // Missed biometric!
        collegeAttendanceToday: 'present'
      }
    ]
  },
  {
    id: 'tagore-202',
    block: 'Tagore',
    roomNumber: 'Tagore-202',
    floor: 2,
    capacity: 2,
    facilities: ['Balcony', 'Study Table'],
    isMaintained: true,
    occupants: [] // VACANT ROOM
  },

  // TILAK BLOCK
  {
    id: 'tilak-101',
    block: 'Tilak',
    roomNumber: 'Tilak-101',
    floor: 1,
    capacity: 2,
    facilities: ['Attached Bath', 'AC'],
    isMaintained: true,
    occupants: [
      {
        id: 'std-201',
        name: 'Harsh Gupta',
        rollNo: '2024EE1023',
        branch: 'Electrical Engg',
        year: 2,
        phone: '+91 99112 23344',
        avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=150&q=80',
        hostelAttendanceToday: 'present',
        collegeAttendanceToday: 'present'
      },
      {
        id: 'std-202',
        name: 'Prashant Mishra',
        rollNo: '2024EE1077',
        branch: 'Electrical Engg',
        year: 2,
        phone: '+91 99223 34455',
        avatar: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?auto=format&fit=crop&w=150&q=80',
        hostelAttendanceToday: 'absent', // Missed biometric!
        collegeAttendanceToday: 'absent'
      }
    ]
  },
  {
    id: 'tilak-102',
    block: 'Tilak',
    roomNumber: 'Tilak-102',
    floor: 1,
    capacity: 3,
    facilities: ['Study Lamps', 'Balcony'],
    isMaintained: true,
    occupants: [
      {
        id: 'std-203',
        name: 'Vikas Kumar',
        rollNo: '2025CE1002',
        branch: 'Civil Engg',
        year: 1,
        phone: '+91 98334 45566',
        avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=150&q=80',
        hostelAttendanceToday: 'present',
        collegeAttendanceToday: 'absent' // Bunking!
      }
    ]
  },
  {
    id: 'tilak-201',
    block: 'Tilak',
    roomNumber: 'Tilak-201',
    floor: 2,
    capacity: 2,
    facilities: ['AC', 'Attached Bath'],
    isMaintained: true,
    occupants: [] // VACANT ROOM
  },
  {
    id: 'tilak-301',
    block: 'Tilak',
    roomNumber: 'Tilak-301',
    floor: 3,
    capacity: 4,
    facilities: ['Large Balcony', 'Corner Room'],
    isMaintained: true,
    occupants: [
      {
        id: 'std-204',
        name: 'Aman Deep',
        rollNo: '2024IT1055',
        branch: 'Information Tech',
        year: 3,
        phone: '+91 97445 56677',
        avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=150&q=80',
        hostelAttendanceToday: 'absent', // Missed biometric!
        collegeAttendanceToday: 'present'
      },
      {
        id: 'std-205',
        name: 'Deepak Yadav',
        rollNo: '2024IT1089',
        branch: 'Information Tech',
        year: 3,
        phone: '+91 96556 67788',
        avatar: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?auto=format&fit=crop&w=150&q=80',
        hostelAttendanceToday: 'present',
        collegeAttendanceToday: 'present'
      }
    ]
  },

  // SUBHASH BLOCK
  {
    id: 'subhash-101',
    block: 'Subhash',
    roomNumber: 'Subhash-101',
    floor: 1,
    capacity: 2,
    facilities: ['Ground Floor Access', 'Attached Bath'],
    isMaintained: true,
    occupants: [
      {
        id: 'std-301',
        name: 'Saurabh Singh',
        rollNo: '2023CS1102',
        branch: 'Computer Science',
        year: 4,
        phone: '+91 95667 78899',
        avatar: 'https://images.unsplash.com/photo-1501196354995-cbb51c65aaea?auto=format&fit=crop&w=150&q=80',
        hostelAttendanceToday: 'present',
        collegeAttendanceToday: 'present'
      },
      {
        id: 'std-302',
        name: 'Nikhil Saxena',
        rollNo: '2023CS1140',
        branch: 'Computer Science',
        year: 4,
        phone: '+91 94778 89900',
        avatar: 'https://images.unsplash.com/photo-1463453091185-61582044d556?auto=format&fit=crop&w=150&q=80',
        hostelAttendanceToday: 'absent', // Missed biometric!
        collegeAttendanceToday: 'absent'
      }
    ]
  },
  {
    id: 'subhash-102',
    block: 'Subhash',
    roomNumber: 'Subhash-102',
    floor: 1,
    capacity: 2,
    facilities: ['Study Table', 'Balcony'],
    isMaintained: true,
    occupants: [] // VACANT ROOM
  },
  {
    id: 'subhash-204',
    block: 'Subhash',
    roomNumber: 'Subhash-204',
    floor: 2,
    capacity: 3,
    facilities: ['AC', 'High-Speed LAN', 'Balcony'],
    isMaintained: true,
    occupants: [
      {
        id: 'std-303',
        name: 'Gaurav Pandey',
        rollNo: '2024ME1090',
        branch: 'Mechanical Engg',
        year: 2,
        phone: '+91 93889 90011',
        avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=150&q=80',
        hostelAttendanceToday: 'present',
        collegeAttendanceToday: 'absent' // Bunking!
      }
    ]
  }
];

export const INITIAL_COMPLAINTS: Complaint[] = [
  {
    id: 'CMP-801',
    studentName: 'Aayush Singh',
    studentRoll: '2024CS1042',
    block: 'Tagore',
    roomNumber: 'Tagore-101',
    category: 'Electrical',
    priority: 'High',
    title: 'Ceiling Fan Making Loud Noise & Rotating Slowly',
    description: 'The ceiling fan regulator seems faulty and the fan is making sparking sound when set to speed 4.',
    media: [
      {
        id: 'm-1',
        type: 'image',
        url: 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?auto=format&fit=crop&w=800&q=80',
        name: 'fan_regulator_spark.jpg'
      }
    ],
    status: 'In Progress',
    createdAt: '2026-08-02 14:30',
    updatedAt: '2026-08-03 09:15',
    assignedTo: 'Ramu K. (Electrician)',
    wardenRemarks: 'Electrician assigned for capacitor replacement today by 4 PM.'
  },
  {
    id: 'CMP-802',
    studentName: 'Harsh Gupta',
    studentRoll: '2024EE1023',
    block: 'Tilak',
    roomNumber: 'Tilak-101',
    category: 'Plumbing',
    priority: 'Emergency',
    title: 'Bathroom Tap Leakage Flooding Room',
    description: 'Main washbasin pipe cracked in Tilak-101. Water is leaking rapidly onto the floor near study tables.',
    media: [
      {
        id: 'm-2',
        type: 'image',
        url: 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=800&q=80',
        name: 'water_leakage_photo.jpg'
      }
    ],
    status: 'Pending',
    createdAt: '2026-08-03 08:10',
    updatedAt: '2026-08-03 08:10',
    wardenRemarks: 'Urgent ticket sent to plumber supervisor.'
  },
  {
    id: 'CMP-803',
    studentName: 'Saurabh Singh',
    studentRoll: '2023CS1102',
    block: 'Subhash',
    roomNumber: 'Subhash-101',
    category: 'Wi-Fi / Network',
    priority: 'Medium',
    title: 'Subhash 2nd Floor LAN Port Not Working',
    description: 'Ethernet port speed is dropping completely to 0 kbps. Checked with multiple CAT-6 cables.',
    media: [],
    status: 'Resolved',
    createdAt: '2026-08-01 19:00',
    updatedAt: '2026-08-02 11:20',
    assignedTo: 'Sanjay (IT Admin)',
    wardenRemarks: 'Switch port #14 reset completed. Cable tested successfully.'
  }
];

export const INITIAL_ATTENDANCE_SUMMARIES: StudentAttendanceSummary[] = [
  {
    studentId: 'std-101',
    name: 'Aayush Singh',
    rollNo: '2024CS1042',
    block: 'Tagore',
    roomNumber: 'Tagore-101',
    phone: '+91 98765 43210',
    month: 'August 2026',
    totalDays: 31,
    presentCount: 28,
    missedCount: 2,
    leaveCount: 1,
    missedDates: ['2026-08-01', '2026-08-03'],
    collegeBunkFlagToday: false,
    monthlyLogs: [
      { date: '2026-08-01', biometricStatus: 'missed', collegeStatus: 'present', notes: 'Missed biometric check-in window' },
      { date: '2026-08-02', biometricStatus: 'present', collegeStatus: 'present', inTime: '21:14', outTime: '08:10' },
      { date: '2026-08-03', biometricStatus: 'missed', collegeStatus: 'present', notes: 'Late entry after 10 PM' }
    ]
  },
  {
    studentId: 'std-103',
    name: 'Aditya Srivastava',
    rollNo: '2024EC1012',
    block: 'Tagore',
    roomNumber: 'Tagore-102',
    phone: '+91 99887 76655',
    month: 'August 2026',
    totalDays: 31,
    presentCount: 26,
    missedCount: 4,
    leaveCount: 1,
    missedDates: ['2026-08-02', '2026-08-03'],
    collegeBunkFlagToday: true, // BUNKING TODAY!
    monthlyLogs: [
      { date: '2026-08-01', biometricStatus: 'present', collegeStatus: 'present' },
      { date: '2026-08-02', biometricStatus: 'missed', collegeStatus: 'absent', notes: 'Absent in college, missed biometric' },
      { date: '2026-08-03', biometricStatus: 'present', collegeStatus: 'absent', notes: 'Hostel gate logged in at 10:30 AM during class hours!' }
    ]
  },
  {
    studentId: 'std-104',
    name: 'Shivam Tiwari',
    rollNo: '2024EC1045',
    block: 'Tagore',
    roomNumber: 'Tagore-102',
    phone: '+91 98111 22334',
    month: 'August 2026',
    totalDays: 31,
    presentCount: 25,
    missedCount: 5,
    leaveCount: 1,
    missedDates: ['2026-08-01', '2026-08-03'],
    collegeBunkFlagToday: true, // BUNKING TODAY!
    monthlyLogs: [
      { date: '2026-08-03', biometricStatus: 'present', collegeStatus: 'absent', notes: 'Flagged in room during lecture' }
    ]
  },
  {
    studentId: 'std-105',
    name: 'Kunal Sharma',
    rollNo: '2023ME1005',
    block: 'Tagore',
    roomNumber: 'Tagore-201',
    phone: '+91 97654 32109',
    month: 'August 2026',
    totalDays: 31,
    presentCount: 24,
    missedCount: 6,
    leaveCount: 1,
    missedDates: ['2026-08-01', '2026-08-02', '2026-08-03'],
    collegeBunkFlagToday: false,
    monthlyLogs: [
      { date: '2026-08-03', biometricStatus: 'missed', collegeStatus: 'present' }
    ]
  },
  {
    studentId: 'std-202',
    name: 'Prashant Mishra',
    rollNo: '2024EE1077',
    block: 'Tilak',
    roomNumber: 'Tilak-101',
    phone: '+91 99223 34455',
    month: 'August 2026',
    totalDays: 31,
    presentCount: 27,
    missedCount: 3,
    leaveCount: 1,
    missedDates: ['2026-08-03'],
    collegeBunkFlagToday: false,
    monthlyLogs: [
      { date: '2026-08-03', biometricStatus: 'missed', collegeStatus: 'absent' }
    ]
  },
  {
    studentId: 'std-203',
    name: 'Vikas Kumar',
    rollNo: '2025CE1002',
    block: 'Tilak',
    roomNumber: 'Tilak-102',
    phone: '+91 98334 45566',
    month: 'August 2026',
    totalDays: 31,
    presentCount: 29,
    missedCount: 1,
    leaveCount: 1,
    missedDates: ['2026-08-02'],
    collegeBunkFlagToday: true, // BUNKING TODAY!
    monthlyLogs: [
      { date: '2026-08-03', biometricStatus: 'present', collegeStatus: 'absent', notes: 'Present in Tilak-102 room during 11 AM class' }
    ]
  },
  {
    studentId: 'std-204',
    name: 'Aman Deep',
    rollNo: '2024IT1055',
    block: 'Tilak',
    roomNumber: 'Tilak-301',
    phone: '+91 97445 56677',
    month: 'August 2026',
    totalDays: 31,
    presentCount: 23,
    missedCount: 7,
    leaveCount: 1,
    missedDates: ['2026-08-01', '2026-08-03'],
    collegeBunkFlagToday: false,
    monthlyLogs: [
      { date: '2026-08-03', biometricStatus: 'missed', collegeStatus: 'present' }
    ]
  },
  {
    studentId: 'std-302',
    name: 'Nikhil Saxena',
    rollNo: '2023CS1140',
    block: 'Subhash',
    roomNumber: 'Subhash-101',
    phone: '+91 94778 89900',
    month: 'August 2026',
    totalDays: 31,
    presentCount: 22,
    missedCount: 8,
    leaveCount: 1,
    missedDates: ['2026-08-03'],
    collegeBunkFlagToday: false,
    monthlyLogs: [
      { date: '2026-08-03', biometricStatus: 'missed', collegeStatus: 'absent' }
    ]
  },
  {
    studentId: 'std-303',
    name: 'Gaurav Pandey',
    rollNo: '2024ME1090',
    block: 'Subhash',
    roomNumber: 'Subhash-204',
    phone: '+91 93889 90011',
    month: 'August 2026',
    totalDays: 31,
    presentCount: 28,
    missedCount: 2,
    leaveCount: 1,
    missedDates: ['2026-08-02'],
    collegeBunkFlagToday: true, // BUNKING TODAY!
    monthlyLogs: [
      { date: '2026-08-03', biometricStatus: 'present', collegeStatus: 'absent' }
    ]
  }
];

export const INITIAL_ALERTS: AlertNotice[] = [
  {
    id: 'alt-1',
    title: '💧 Temporary Water Outage Notice',
    message: 'Water tank overhead maintenance scheduled today from 02:00 PM to 04:30 PM in Tilak and Tagore Blocks. Please store water in buckets.',
    category: 'Urgent',
    targetBlock: 'All',
    timestamp: '2026-08-03 10:00 AM',
    createdBy: 'Chief Warden Office',
    active: true
  },
  {
    id: 'alt-2',
    title: '🍲 Mess Dinner Timings Update',
    message: 'On Sunday night (09-Aug), Mess Dinner timing will be extended till 10:00 PM due to Independence Day preparations meeting.',
    category: 'Mess',
    targetBlock: 'All',
    timestamp: '2026-08-02 06:00 PM',
    createdBy: 'Mess Committee',
    active: true
  },
  {
    id: 'alt-3',
    title: '🚨 Mandatory Biometric Timing Notice',
    message: 'Night biometric attendance machine is active between 09:00 PM to 10:00 PM sharp at the Ground Floor Lobby. Missers will be reported to Warden.',
    category: 'Urgent',
    targetBlock: 'All',
    timestamp: '2026-08-01 09:00 AM',
    createdBy: 'Chief Warden',
    active: true
  }
];

export const INITIAL_LEAVE_PASSES: HomeLeavePass[] = [
  {
    id: 'pass-101',
    studentId: 'std-101',
    studentName: 'Aayush Singh',
    rollNo: '2024CS1042',
    block: 'Tagore',
    roomNumber: 'Tagore-101',
    studentPhone: '+91 98765 43210',
    parentPhone: '+91 98123 45678',
    destination: 'Home (Varanasi, UP)',
    departureDate: '2026-08-05 09:00 AM',
    expectedReturnDate: '2026-08-12 06:00 PM',
    reason: 'Raksha Bandhan & Long Weekend Vacation',
    status: 'Departed',
    parentSmsSent: true,
    parentSmsTimestamp: '2026-08-05 09:05 AM',
    parentSmsContent: 'ALERT: Dear Parent, your ward Aayush Singh (Roll: 2024CS1042, Tagore-101) has departed from Hostel for Varanasi on 05-Aug 09:00 AM. Expected return: 12-Aug. Hostel Office Contact: 0522-274001',
    wardenApprovedBy: 'Chief Warden Office',
    createdAt: '2026-08-03 18:30',
    passCategory: 'Outstation Vacation',
    year: 3,
    verificationToken: 'WDN-SEAL-8842-AUTHENTICATED',
    gateMovementCount: 1,
    gateScanLogs: [
      { timestamp: '2026-08-05 09:02 AM', action: 'EXITED', verifiedByGuard: 'Gate Guard Constable Sharma (Gate 1)' }
    ]
  },
  {
    id: 'pass-102',
    studentId: 'std-201',
    studentName: 'Harsh Gupta',
    rollNo: '2024EE1023',
    block: 'Tilak',
    roomNumber: 'Tilak-101',
    studentPhone: '+91 99112 23344',
    parentPhone: '+91 98990 11223',
    destination: 'Home (Lucknow, UP)',
    departureDate: '2026-08-06 10:00 AM',
    expectedReturnDate: '2026-08-10 08:00 PM',
    reason: 'Family Function',
    status: 'Approved',
    parentSmsSent: true,
    parentSmsTimestamp: '2026-08-03 21:00 PM',
    parentSmsContent: 'NOTICE: Dear Parent, Gate Pass for Harsh Gupta (Tilak-101) for Lucknow departure on 06-Aug 10:00 AM has been approved by Warden.',
    wardenApprovedBy: 'Chief Warden Office',
    createdAt: '2026-08-03 14:15',
    passCategory: 'Outstation Vacation',
    year: 2,
    verificationToken: 'WDN-SEAL-9910-AUTHENTICATED',
    gateMovementCount: 0
  },
  {
    id: 'pass-103',
    studentId: 'std-103',
    studentName: 'Aditya Srivastava',
    rollNo: '2024EC1012',
    block: 'Tagore',
    roomNumber: 'Tagore-102',
    studentPhone: '+91 99887 76655',
    parentPhone: '+91 99887 00112',
    destination: 'Gold Gym (Hazratganj)',
    departureDate: '2026-08-03 05:30 PM',
    expectedReturnDate: '2026-08-03 08:00 PM',
    reason: 'Daily Evening Fitness Workout',
    status: 'Approved',
    parentSmsSent: true,
    parentSmsTimestamp: '2026-08-03 17:00 PM',
    parentSmsContent: 'NOTICE: Dear Parent, Daily Gym Outing Pass for Aditya Srivastava approved till 08:30 PM.',
    wardenApprovedBy: 'Chief Warden Office',
    createdAt: '2026-08-03 16:45',
    passCategory: 'Gym Outing',
    year: 2,
    isGymPass: true,
    verificationToken: 'WDN-SEAL-GYM-2026-OK',
    gateMovementCount: 2,
    gateScanLogs: [
      { timestamp: '2026-08-03 05:32 PM', action: 'EXITED', verifiedByGuard: 'Gate Guard Constable Yadav' },
      { timestamp: '2026-08-03 07:15 PM', action: 'RE_ENTERED', verifiedByGuard: 'Gate Guard Constable Yadav' }
    ]
  }
];
