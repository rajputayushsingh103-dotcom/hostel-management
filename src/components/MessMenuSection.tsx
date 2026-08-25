import React, { useState } from 'react';
import {
  Utensils,
  Clock,
  Star,
  Edit2,
  CheckCircle2,
  Bell,
  Sun,
  Coffee,
  Sunset,
  Moon,
  RotateCcw,
  Printer
} from 'lucide-react';
import { DayMessMenu, Role } from '../types';

interface MessMenuSectionProps {
  menuList: DayMessMenu[];
  onUpdateMenu: (updatedMenu: DayMessMenu[]) => void;
  role: Role;
}

const DAYS_ORDER: ('Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday' | 'Sunday')[] = [
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
  'Sunday'
];

const HINDI_DAYS: Record<string, string> = {
  Monday: 'सोमवार',
  Tuesday: 'मंगलवार',
  Wednesday: 'बुद्धवार',
  Thursday: 'बृहस्पतिवार',
  Friday: 'शुक्रवार',
  Saturday: 'शनिवार',
  Sunday: 'रविवार'
};

// 📋 EXACT PHOTO MESS MENU (APRIL-2026)
const EXACT_PHOTO_MESS_MENU: DayMessMenu[] = [
  {
    day: 'Monday',
    breakfast: {
      time: '07:45 AM - 08:40 AM',
      items: ['Kachori (कचौड़ी)', 'Aloo Matar Sabzi (सब्जी आलू मटर)', 'Tea (चाय)'],
      special: '',
      calories: 0
    },
    lunch: {
      time: '12:00 PM - 01:45 PM',
      items: ['Chana Dal (चना दाल)', 'Kathal Sabzi (कटहल की सब्जी)', 'Roti (रोटी)', 'Jeera Rice (जीरा चावल)', 'Salad (सलाद)', 'Pickle (अचार)'],
      special: '',
      calories: 0
    },
    snacks: {
      time: '04:30 PM - 05:45 PM',
      items: ['Bun Makkhan (बंद मक्खन)', 'Tea (चाय)'],
      special: '',
      calories: 0
    },
    dinner: {
      time: '08:00 PM - 09:30 PM',
      items: ['Mix Dal (मिक्स दाल)', 'Aloo Soyabean Sabzi (आलू सोयाबीन सब्जी)', 'Rice (चावल)', 'Roti (रोटी)', 'Salad (सलाद)', 'Custard (कस्टर्ड)'],
      special: '',
      calories: 0
    }
  },
  {
    day: 'Tuesday',
    breakfast: {
      time: '07:45 AM - 08:40 AM',
      items: ['Fruit Chaat (फ्रूट चाट)', 'Namkeen Sewai (नमकीन सेवई)', 'Milk / Tea (दूध / चाय)'],
      special: '',
      calories: 0
    },
    lunch: {
      time: '12:00 PM - 01:45 PM',
      items: ['Aloo Parwal Sabzi (आलू परवल सब्जी)', 'Arhar Dal (अरहर दाल)', 'Roti (रोटी)', 'Rice (चावल)', 'Salad (सलाद)', 'Boondi Raita (बुंदी रायता)', 'Pickle (अचार)'],
      special: '',
      calories: 0
    },
    snacks: {
      time: '04:30 PM - 05:45 PM',
      items: ['5 Pcs Rusk (5 पीस रस)', 'Tea (चाय)'],
      special: '',
      calories: 0
    },
    dinner: {
      time: '08:00 PM - 09:30 PM',
      items: ['Arhar Dal (अरहर दाल)', 'Aloo Chana Sabzi (आलू चना की सब्जी)', 'Rice (चावल)', 'Roti (रोटी)', 'Salad (सलाद)', 'Pickle (अचार)'],
      special: '',
      calories: 0
    }
  },
  {
    day: 'Wednesday',
    breakfast: {
      time: '07:45 AM - 08:40 AM',
      items: ['Daliya (दलीया)', 'Sandwich (सैन्डविच)', 'Tea (चाय)'],
      special: '',
      calories: 0
    },
    lunch: {
      time: '12:00 PM - 01:45 PM',
      items: ['Matar Paneer (मटर पनीर)', 'Naan (नान)', 'Puri (पूड़ी)', 'Pulao (पुलाव)', 'Mix Veg Sabzi (सब्जी मिक्स वेज)', 'Salad (सलाद)'],
      special: '',
      calories: 0
    },
    snacks: {
      time: '04:30 PM - 05:45 PM',
      items: ['Namkeen / Biscuit (नमकीन / बिस्किट)', 'Tea (चाय)'],
      special: '',
      calories: 0
    },
    dinner: {
      time: '08:00 PM - 09:30 PM',
      items: ['Khichdi / Tehri (खिचड़ी / तहरी)', 'Papad (पापड़)', 'Boondi Raita (बुंदी रायता)', 'Gulab Jamun (गुलाब जामुन)'],
      special: '',
      calories: 0
    }
  },
  {
    day: 'Thursday',
    breakfast: {
      time: '07:45 AM - 08:40 AM',
      items: ['Kachori (कचौड़ी)', 'Aloo Matar Tamatar Sabzi (आलू मटर टमाटर की सब्जी)', 'Tea (चाय)'],
      special: '',
      calories: 0
    },
    lunch: {
      time: '12:00 PM - 01:45 PM',
      items: ['Rajma (राजमा)', 'Rice (चावल)', 'Roti (रोटी)', 'Aloo Parwal Dry Sabzi (आलू परवल सूखा सब्जी)', 'Salad (सलाद)', 'Lauki Raita (रायता लौकी)'],
      special: '',
      calories: 0
    },
    snacks: {
      time: '04:30 PM - 05:45 PM',
      items: ['Poha (पोहा)', 'Tea (चाय)'],
      special: '',
      calories: 0
    },
    dinner: {
      time: '08:00 PM - 09:30 PM',
      items: ['Arhar Dal (अरहर दाल)', 'Dum Aloo Sabzi (दम आलू सब्जी)', 'Rice (चावल)', 'Roti (रोटी)', 'Salad (सलाद)', 'Pickle (अचार)'],
      special: '',
      calories: 0
    }
  },
  {
    day: 'Friday',
    breakfast: {
      time: '07:45 AM - 08:40 AM',
      items: ['Curd (दही)', 'Jalebi (जलेबी)', 'Poha (पोहा)', 'Tea (चाय)'],
      special: '',
      calories: 0
    },
    lunch: {
      time: '12:00 PM - 01:45 PM',
      items: ['Kadhi (कढ़ी)', 'Rice (चावल)', 'Aloo Shimla/Sem Dry Sabzi (सब्जी आलू शिमला/सेम सूखा)', 'Roti (रोटी)', 'Kachumber Salad (कचुम्मर सलाद)', 'Pickle (अचार)'],
      special: '',
      calories: 0
    },
    snacks: {
      time: '04:30 PM - 05:45 PM',
      items: ['Patties (पेटीज)', 'Tea (चाय)'],
      special: '',
      calories: 0
    },
    dinner: {
      time: '08:00 PM - 09:30 PM',
      items: ['Chole (छोला)', 'Aloo Kaddu Sabzi (सब्जी आलू कद्दू)', 'Rice (चावल)', 'Puri (पूड़ी)', 'Kheer (खीर)'],
      special: '',
      calories: 0
    }
  },
  {
    day: 'Saturday',
    breakfast: {
      time: '07:45 AM - 08:40 AM',
      items: ['Aloo Paratha (आलू पराठा)', 'Pickle (अचार)', 'Chutney (चटनी)', 'Lassi (लस्सी)'],
      special: '',
      calories: 0
    },
    lunch: {
      time: '12:00 PM - 01:45 PM',
      items: ['Kala Masoor Dal (काला मसूर की दाल)', 'Aloo Chana Sabzi (आलू चना सब्जी)', 'Rice (चावल)', 'Roti (रोटी)', 'Salad (सलाद)', 'Pickle (अचार)', 'Boondi Raita (बुंदी रायता)'],
      special: '',
      calories: 0
    },
    snacks: {
      time: '04:30 PM - 05:45 PM',
      items: ['Fried Rice (फ्राइड राइस)', 'Tea (चाय)'],
      special: '',
      calories: 0
    },
    dinner: {
      time: '08:00 PM - 09:30 PM',
      items: ['Chana Dal (चना दाल)', 'Lauki Latpata Sabzi (लौकी लटपटा सब्जी)', 'Rice (चावल)', 'Roti (रोटी)', 'Salad (सलाद)'],
      special: '',
      calories: 0
    }
  },
  {
    day: 'Sunday',
    breakfast: {
      time: '08:30 AM - 10:30 AM',
      items: ['Chole Bhature (छोला भटूरा)', 'Puri (पूड़ी)', 'Milk 200ML (दूध 200ML)', 'Tea (चाय)'],
      special: '',
      calories: 0
    },
    lunch: {
      time: 'Closed',
      items: ['NA - Not Served (लंच बंद)'],
      special: '',
      calories: 0
    },
    snacks: {
      time: '04:30 PM - 06:00 PM',
      items: ['Samosa 2 Pcs (समोसा 2 पीस)', 'Tea (चाय)'],
      special: '',
      calories: 0
    },
    dinner: {
      time: '08:00 PM - 09:30 PM',
      items: ['Matar Paneer (मटर पनीर)', 'Mix Veg Sabzi (मिक्स वेज सब्जी)', 'Rice (चावल)', 'Roti (रोटी)', 'Salad (सलाद)', 'Ice Cream / Cold Drink (आइसक्रीम / कोल्ड ड्रिंक)'],
      special: '',
      calories: 0
    }
  }
];

export const MessMenuSection: React.FC<MessMenuSectionProps> = ({
  menuList,
  onUpdateMenu,
  role
}) => {
  const todayName = new Date().toLocaleDateString('en-US', { weekday: 'long' }) as any;
  const initialDay = DAYS_ORDER.includes(todayName) ? todayName : 'Monday';

  const [selectedDay, setSelectedDay] = useState<'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday' | 'Sunday'>(initialDay);
  const [editingMeal, setEditingMeal] = useState<{ mealType: 'breakfast' | 'lunch' | 'snacks' | 'dinner'; day: string } | null>(null);

  const [mealRatings, setMealRatings] = useState<Record<string, number>>({
    'Monday-lunch': 5,
    'Monday-dinner': 5
  });
  const [feedbackSuccess, setFeedbackSuccess] = useState<string | null>(null);

  const [editTime, setEditTime] = useState('');
  const [editItemsText, setEditItemsText] = useState('');

  const activeList = EXACT_PHOTO_MESS_MENU;
  const currentDayMenu = activeList.find((m) => m.day === selectedDay) || activeList[0];

  const handleRating = (key: string, rating: number) => {
    setMealRatings((prev) => ({ ...prev, [key]: rating }));
    setFeedbackSuccess(`Thank you! Rated ${rating} stars for ${key.replace('-', ' ')}`);
    setTimeout(() => setFeedbackSuccess(null), 3000);
  };

  const openEditModal = (mealType: 'breakfast' | 'lunch' | 'snacks' | 'dinner') => {
    const meal = currentDayMenu[mealType];
    setEditTime(meal.time);
    setEditItemsText(meal.items.join(', '));
    setEditingMeal({ mealType, day: selectedDay });
  };

  const saveMealEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingMeal) return;

    const itemsArray = editItemsText
      .split(',')
      .map((i) => i.trim())
      .filter((i) => i.length > 0);

    const updated = activeList.map((m) => {
      if (m.day === editingMeal.day) {
        return {
          ...m,
          [editingMeal.mealType]: {
            ...m[editingMeal.mealType],
            time: editTime,
            items: itemsArray,
            special: '',
            calories: 0
          }
        };
      }
      return m;
    });

    onUpdateMenu(updated);
    try {
      localStorage.setItem('hostel_mess_menu', JSON.stringify(updated));
    } catch (err) {}

    setEditingMeal(null);
    setFeedbackSuccess(`Menu for ${editingMeal.day} ${editingMeal.mealType.toUpperCase()} updated successfully!`);
    setTimeout(() => setFeedbackSuccess(null), 3500);
  };

  const handleResetToDefault = () => {
    if (window.confirm("Reset menu to the official April-2026 timetable?")) {
      onUpdateMenu(EXACT_PHOTO_MESS_MENU);
      try {
        localStorage.setItem('hostel_mess_menu', JSON.stringify(EXACT_PHOTO_MESS_MENU));
      } catch (err) {}
      setFeedbackSuccess("Mess menu reset to official April-2026 timetable!");
      setTimeout(() => setFeedbackSuccess(null), 3500);
    }
  };

  const mealCards = [
    {
      key: 'breakfast' as const,
      label: 'Breakfast (सुबह का नाश्ता)',
      icon: Coffee,
      detail: currentDayMenu.breakfast
    },
    {
      key: 'lunch' as const,
      label: 'Lunch (दोपहर का लंच)',
      icon: Sun,
      detail: currentDayMenu.lunch
    },
    {
      key: 'snacks' as const,
      label: 'Evening Snacks (शाम का नाश्ता)',
      icon: Sunset,
      detail: currentDayMenu.snacks
    },
    {
      key: 'dinner' as const,
      label: 'Dinner (रात का डिनर)',
      icon: Moon,
      detail: currentDayMenu.dinner
    }
  ];

  return (
    <div className="space-y-6 max-w-7xl mx-auto font-sans">
      
      {/* Top Header Card */}
      <div className="bg-[#121B2B] text-white border border-slate-800 rounded-3xl p-6 sm:p-7 shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="p-3 rounded-2xl bg-orange-500/20 text-orange-400 border border-orange-500/30">
              <Utensils className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
                  Hostel Mess Menu Schedule
                </h1>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  April-2026
                </span>
              </div>
              <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
                Official daily meal timings and menu chart for all student blocks.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {role === 'warden' && (
              <button
                onClick={handleResetToDefault}
                className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-semibold border border-slate-700 flex items-center gap-1.5 transition-colors cursor-pointer"
                title="Reset to April-2026 Default"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset Menu</span>
              </button>
            )}

            <div className="flex items-center gap-2 bg-[#0E1524] px-4 py-2.5 rounded-2xl border border-slate-800">
              <Bell className="w-4 h-4 text-amber-400 animate-bounce shrink-0" />
              <div className="text-xs">
                <span className="font-bold text-amber-300">Sunday Note (रविवार): </span>
                <span className="text-slate-300">Breakfast 08:30 AM - 10:30 AM | Sports 04:30 PM - 06:00 PM</span>
              </div>
            </div>
          </div>
        </div>

        {/* Timings Grid */}
        <div className="mt-5 p-4 bg-[#0E1524] border border-slate-800/90 rounded-2xl grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
          <div className="p-3 bg-[#151F32] rounded-xl border border-amber-500/20">
            <span className="font-bold text-amber-300 flex items-center gap-1.5 mb-1">
              <Coffee className="w-3.5 h-3.5" />
              <span>Breakfast (सुबह का नाश्ता)</span>
            </span>
            <p className="text-slate-300 text-[11px] leading-relaxed">
              • 1st Year: <strong className="text-white">07:45 AM – 08:15 AM</strong><br />
              • Seniors & MBA: <strong className="text-white">08:15 AM – 08:40 AM</strong>
            </p>
          </div>

          <div className="p-3 bg-[#151F32] rounded-xl border border-orange-500/20">
            <span className="font-bold text-orange-300 flex items-center gap-1.5 mb-1">
              <Sun className="w-3.5 h-3.5" />
              <span>Lunch (दोपहर का लंच)</span>
            </span>
            <p className="text-slate-300 text-[11px] leading-relaxed">
              • 1st Year: <strong className="text-white">12:00 PM – 12:45 PM</strong><br />
              • Seniors & MBA: <strong className="text-white">01:00 PM – 01:45 PM</strong>
            </p>
          </div>

          <div className="p-3 bg-[#151F32] rounded-xl border border-emerald-500/20">
            <span className="font-bold text-emerald-300 flex items-center gap-1.5 mb-1">
              <Sunset className="w-3.5 h-3.5" />
              <span>Snacks (शाम का नाश्ता)</span>
            </span>
            <p className="text-slate-300 text-[11px] leading-relaxed">
              • 1st Year: <strong className="text-white">04:30 PM – 05:15 PM</strong><br />
              • Seniors & MBA: <strong className="text-white">05:00 PM – 05:45 PM</strong>
            </p>
          </div>

          <div className="p-3 bg-[#151F32] rounded-xl border border-indigo-500/20">
            <span className="font-bold text-indigo-300 flex items-center gap-1.5 mb-1">
              <Moon className="w-3.5 h-3.5" />
              <span>Dinner (रात का डिनर)</span>
            </span>
            <p className="text-slate-300 text-[11px] leading-relaxed">
              • 1st Year: <strong className="text-white">08:00 PM – 08:45 PM</strong><br />
              • Seniors & MBA: <strong className="text-white">08:45 PM – 09:30 PM</strong>
            </p>
          </div>
        </div>

        {/* Day Selector Tabs */}
        <div className="mt-5 flex gap-2 overflow-x-auto pb-2 no-scrollbar border-t border-slate-800/80 pt-4">
          {DAYS_ORDER.map((day) => {
            const isToday = day === todayName;
            const isSelected = day === selectedDay;
            const hindiName = HINDI_DAYS[day] || '';

            return (
              <button
                key={day}
                onClick={() => setSelectedDay(day)}
                className={`relative px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-semibold transition-all whitespace-nowrap flex items-center gap-1.5 active:scale-95 cursor-pointer ${
                  isSelected
                    ? 'bg-orange-600 text-white shadow-lg shadow-orange-600/30 ring-2 ring-orange-500/50 scale-[1.02]'
                    : 'bg-[#182338] text-slate-300 hover:bg-[#1f2d47] hover:text-white'
                }`}
              >
                <span>{day}</span>
                <span className={`text-[11px] ${isSelected ? 'text-orange-100 font-bold' : 'text-slate-400'}`}>({hindiName})</span>
                {isToday && (
                  <span className="px-1.5 py-0.5 text-[9px] uppercase font-bold bg-amber-400 text-slate-950 rounded-md">
                    Today
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {feedbackSuccess && (
        <div className="bg-emerald-50 border border-emerald-300 text-emerald-800 dark:bg-emerald-950/80 dark:border-emerald-500/40 dark:text-emerald-300 px-4 py-3 rounded-2xl flex items-center gap-2 text-sm shadow-sm">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
          <span>{feedbackSuccess}</span>
        </div>
      )}

      {/* 🌟 4 MEAL CARDS (CLEAN WHITE BACKGROUND & SOLID BLACK/DARK TEXT) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {mealCards.map(({ key, label, icon: Icon, detail }) => {
          const ratingKey = `${selectedDay}-${key}`;
          const currentRating = mealRatings[ratingKey] || 0;

          return (
            <div
              key={key}
              className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div>
                {/* Header */}
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-3.5">
                    <div className="p-3 rounded-2xl bg-slate-100 border border-slate-200 text-slate-900">
                      <Icon className="w-5 h-5 text-slate-900" />
                    </div>
                    <div>
                      <h3 className="font-extrabold text-base sm:text-lg text-slate-950">{label}</h3>
                      <p className="text-xs text-slate-600 flex items-center gap-1 mt-0.5 font-medium">
                        <Clock className="w-3.5 h-3.5 text-slate-500" />
                        <span>{detail.time}</span>
                      </p>
                    </div>
                  </div>

                  {role === 'warden' && (
                    <button
                      onClick={() => openEditModal(key)}
                      className="p-1.5 px-3 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl border border-slate-300 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <Edit2 className="w-3.5 h-3.5 text-orange-600" />
                      <span>Edit</span>
                    </button>
                  )}
                </div>

                {/* Items List (White Box, Black Text) */}
                <div className="mt-5 space-y-2.5">
                  <p className="text-[11px] font-bold uppercase tracking-wider text-slate-600">
                    MENU ITEMS (व्यंजनों की सूची):
                  </p>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {detail.items.map((item, idx) => (
                      <div
                        key={idx}
                        className="bg-slate-50 hover:bg-slate-100/90 border border-slate-200/90 px-3.5 py-3 rounded-2xl text-xs font-bold text-slate-900 flex items-center gap-2.5 shadow-2xs transition-colors"
                      >
                        <span className="w-2 h-2 rounded-full bg-orange-500 shrink-0" />
                        <span className="leading-snug">{item}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Footer: Rating */}
              <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between">
                <span className="text-xs text-slate-600 font-semibold">Rate Meal (रेटिंग):</span>
                <div className="flex items-center space-x-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      onClick={() => handleRating(ratingKey, star)}
                      className="p-1 hover:scale-125 active:scale-95 transition-transform cursor-pointer"
                    >
                      <Star
                        className={`w-4 h-4 ${
                          star <= currentRating
                            ? 'text-amber-400 fill-amber-400'
                            : 'text-slate-300 hover:text-amber-400'
                        }`}
                      />
                    </button>
                  ))}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Warden Menu Edit Modal */}
      {editingMeal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white border border-slate-200 rounded-3xl max-w-lg w-full p-6 sm:p-7 shadow-2xl">
            <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <Edit2 className="w-5 h-5 text-orange-600" />
              <span>Edit {editingMeal.day} ({HINDI_DAYS[editingMeal.day]}) {editingMeal.mealType.toUpperCase()} Menu</span>
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              Update meal timings and dishes served for this slot.
            </p>

            <form onSubmit={saveMealEdit} className="mt-5 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Meal Timings (भोजन का समय):
                </label>
                <input
                  type="text"
                  value={editTime}
                  onChange={(e) => setEditTime(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 focus:outline-none focus:border-orange-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Dishes (व्यंजनों के नाम - comma separated):
                </label>
                <textarea
                  value={editItemsText}
                  onChange={(e) => setEditItemsText(e.target.value)}
                  rows={3}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 focus:outline-none focus:border-orange-500"
                  required
                />
              </div>

              <div className="flex items-center justify-end space-x-3 pt-4 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setEditingMeal(null)}
                  className="px-4 py-2.5 text-xs font-semibold text-slate-600 hover:text-slate-900 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 text-xs font-bold bg-orange-600 hover:bg-orange-500 text-white rounded-xl shadow-md cursor-pointer"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};