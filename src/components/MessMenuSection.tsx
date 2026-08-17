import React, { useState } from 'react';
import {
  Utensils,
  Clock,
  Sparkles,
  Flame,
  Star,
  MessageSquare,
  Edit2,
  CheckCircle2,
  Bell,
  Sun,
  Coffee,
  Sunset,
  Moon
} from 'lucide-react';
import { DayMessMenu, MealDetail, Role } from '../types';

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

export const MessMenuSection: React.FC<MessMenuSectionProps> = ({
  menuList,
  onUpdateMenu,
  role
}) => {
  // Determine current day of week
  const todayName = new Date().toLocaleDateString('en-US', { weekday: 'long' }) as any;
  const initialDay = DAYS_ORDER.includes(todayName) ? todayName : 'Monday';

  const [selectedDay, setSelectedDay] = useState<'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday' | 'Sunday'>(initialDay);
  const [editingMeal, setEditingMeal] = useState<{ mealType: 'breakfast' | 'lunch' | 'snacks' | 'dinner'; day: string } | null>(null);

  // Ratings state for interactive feedback
  const [mealRatings, setMealRatings] = useState<Record<string, number>>({
    'Monday-lunch': 4,
    'Monday-dinner': 5
  });
  const [feedbackSuccess, setFeedbackSuccess] = useState<string | null>(null);

  // Edit form state
  const [editTime, setEditTime] = useState('');
  const [editItemsText, setEditItemsText] = useState('');
  const [editSpecial, setEditSpecial] = useState('');

  const currentDayMenu = menuList.find((m) => m.day === selectedDay) || menuList[0];

  const handleRating = (key: string, rating: number) => {
    setMealRatings((prev) => ({ ...prev, [key]: rating }));
    setFeedbackSuccess(`Thank you! Rated ${rating} stars for ${key.replace('-', ' ')}`);
    setTimeout(() => setFeedbackSuccess(null), 3000);
  };

  const openEditModal = (mealType: 'breakfast' | 'lunch' | 'snacks' | 'dinner') => {
    const meal = currentDayMenu[mealType];
    setEditTime(meal.time);
    setEditItemsText(meal.items.join(', '));
    setEditSpecial(meal.special || '');
    setEditingMeal({ mealType, day: selectedDay });
  };

  const saveMealEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingMeal) return;

    const itemsArray = editItemsText
      .split(',')
      .map((i) => i.trim())
      .filter((i) => i.length > 0);

    const updated = menuList.map((m) => {
      if (m.day === editingMeal.day) {
        return {
          ...m,
          [editingMeal.mealType]: {
            ...m[editingMeal.mealType],
            time: editTime,
            items: itemsArray,
            special: editSpecial
          }
        };
      }
      return m;
    });

    onUpdateMenu(updated);
    setEditingMeal(null);
  };

  const mealCards = [
    {
      key: 'breakfast' as const,
      label: 'Breakfast',
      icon: Coffee,
      detail: currentDayMenu.breakfast,
      bg: 'from-amber-900/30 to-amber-950/20 border-amber-800/40 text-amber-300'
    },
    {
      key: 'lunch' as const,
      label: 'Lunch',
      icon: Sun,
      detail: currentDayMenu.lunch,
      bg: 'from-orange-900/30 to-orange-950/20 border-orange-800/40 text-orange-300'
    },
    {
      key: 'snacks' as const,
      label: 'Evening Snacks',
      icon: Sunset,
      detail: currentDayMenu.snacks,
      bg: 'from-emerald-900/30 to-emerald-950/20 border-emerald-800/40 text-emerald-300'
    },
    {
      key: 'dinner' as const,
      label: 'Dinner',
      icon: Moon,
      detail: currentDayMenu.dinner,
      bg: 'from-indigo-900/30 to-indigo-950/20 border-indigo-800/40 text-indigo-300'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header & Mess Announcements */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 sm:p-6 shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-2 rounded-xl bg-orange-500/20 text-orange-400 border border-orange-500/30">
                <Utensils className="w-5 h-5" />
              </span>
              <h2 className="text-xl font-bold text-white">Hostel Mess Menu Schedule</h2>
            </div>
            <p className="text-xs sm:text-sm text-slate-400 mt-1">
              Check daily meals for Tagore, Tilak & Subhash blocks mess hall.
            </p>
          </div>

          <div className="flex items-center gap-3 bg-slate-950 px-4 py-2.5 rounded-xl border border-slate-800">
            <Bell className="w-4 h-4 text-amber-400 animate-bounce" />
            <div className="text-xs">
              <span className="font-semibold text-amber-300">Mess Notice: </span>
              <span className="text-slate-300">Sunday Special Feast & Ice Cream served at 8:00 PM!</span>
            </div>
          </div>
        </div>

        {/* Dual-Slot Year-wise Mess Schedule Banner */}
        <div className="mt-4 p-4 bg-slate-950 border border-indigo-500/30 rounded-xl grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
          <div className="p-3 bg-indigo-950/40 rounded-lg border border-indigo-500/20">
            <span className="font-bold text-indigo-300 block mb-1">
              🎓 1st Year Freshers Mess Timings:
            </span>
            <p className="text-slate-300">
              • Dinner: <strong>07:00 PM – 08:15 PM</strong><br />
              • Biometric Cutoff: <strong>08:30 PM</strong>
            </p>
          </div>

          <div className="p-3 bg-slate-900 rounded-lg border border-slate-800">
            <span className="font-bold text-amber-300 block mb-1">
              🎓 2nd, 3rd & 4th Year Senior Mess Timings:
            </span>
            <p className="text-slate-300">
              • Dinner: <strong>08:15 PM – 09:30 PM</strong><br />
              • Biometric Cutoff: <strong>09:30 PM</strong>
            </p>
          </div>
        </div>

        {/* Day Selector Tabs */}
        <div className="mt-6 flex gap-2 overflow-x-auto pb-2 no-scrollbar border-b border-slate-800">
          {DAYS_ORDER.map((day) => {
            const isToday = day === todayName;
            const isSelected = day === selectedDay;
            return (
              <button
                key={day}
                onClick={() => setSelectedDay(day)}
                className={`relative px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all whitespace-nowrap flex items-center gap-1.5 ${
                  isSelected
                    ? 'bg-orange-600 text-white shadow-lg shadow-orange-600/30 ring-2 ring-orange-500/50'
                    : 'bg-slate-800/80 text-slate-300 hover:bg-slate-800 hover:text-white'
                }`}
              >
                <span>{day}</span>
                {isToday && (
                  <span className="px-1.5 py-0.5 text-[10px] uppercase font-bold bg-amber-400 text-slate-950 rounded-md">
                    Today
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {feedbackSuccess && (
        <div className="bg-emerald-950/80 border border-emerald-500/40 text-emerald-300 px-4 py-3 rounded-xl flex items-center gap-2 text-sm animate-pulse">
          <CheckCircle2 className="w-5 h-5 text-emerald-400" />
          {feedbackSuccess}
        </div>
      )}

      {/* Grid of 4 Meals */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {mealCards.map(({ key, label, icon: Icon, detail, bg }) => {
          const ratingKey = `${selectedDay}-${key}`;
          const currentRating = mealRatings[ratingKey] || 0;

          return (
            <div
              key={key}
              className={`relative bg-gradient-to-b ${bg} border rounded-2xl p-5 shadow-lg flex flex-col justify-between`}
            >
              <div>
                {/* Header */}
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800">
                      <Icon className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-bold text-base text-white">{label}</h3>
                      <p className="text-xs text-slate-400 flex items-center gap-1 mt-0.5">
                        <Clock className="w-3.5 h-3.5 text-slate-400" />
                        {detail.time}
                      </p>
                    </div>
                  </div>

                  {role === 'warden' && (
                    <button
                      onClick={() => openEditModal(key)}
                      className="p-1.5 bg-slate-900/80 text-slate-300 hover:text-white rounded-lg border border-slate-700 text-xs flex items-center gap-1 transition-colors"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                      Edit
                    </button>
                  )}
                </div>

                {/* Special Highlight */}
                {detail.special && (
                  <div className="mt-4 bg-slate-900/90 border border-amber-500/30 rounded-xl p-3 flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
                    <span className="text-xs font-semibold text-amber-200">
                      Special Dish: <span className="text-white font-bold">{detail.special}</span>
                    </span>
                  </div>
                )}

                {/* Items List */}
                <div className="mt-4 space-y-2">
                  <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                    Menu Items:
                  </p>
                  <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {detail.items.map((item, idx) => (
                      <li
                        key={idx}
                        className="bg-slate-900/70 border border-slate-800/80 px-3 py-2 rounded-lg text-xs font-medium text-slate-200 flex items-center gap-2"
                      >
                        <span className="w-1.5 h-1.5 rounded-full bg-orange-400" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Footer: Calories & Rating */}
              <div className="mt-6 pt-4 border-t border-slate-800/60 flex items-center justify-between">
                {detail.calories && (
                  <div className="flex items-center gap-1 text-xs text-slate-400 font-medium">
                    <Flame className="w-4 h-4 text-orange-400" />
                    ~{detail.calories} Cal
                  </div>
                )}

                {/* Student Rating */}
                <div className="flex items-center space-x-1">
                  <span className="text-[11px] text-slate-400 font-medium mr-1">Rate Meal:</span>
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      onClick={() => handleRating(ratingKey, star)}
                      className="p-1 hover:scale-110 transition-transform"
                    >
                      <Star
                        className={`w-4 h-4 ${
                          star <= currentRating
                            ? 'text-amber-400 fill-amber-400'
                            : 'text-slate-600 hover:text-amber-300'
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-xs">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-lg w-full p-6 shadow-2xl">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Edit2 className="w-5 h-5 text-orange-400" />
              Edit {editingMeal.day} {editingMeal.mealType.toUpperCase()} Menu
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              As Warden, update meal timings and dishes served in the mess hall.
            </p>

            <form onSubmit={saveMealEdit} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Meal Timings:
                </label>
                <input
                  type="text"
                  value={editTime}
                  onChange={(e) => setEditTime(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-hidden focus:border-orange-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Dishes (comma separated):
                </label>
                <textarea
                  value={editItemsText}
                  onChange={(e) => setEditItemsText(e.target.value)}
                  rows={3}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-hidden focus:border-orange-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Special Attraction (optional):
                </label>
                <input
                  type="text"
                  value={editSpecial}
                  onChange={(e) => setEditSpecial(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-hidden focus:border-orange-500"
                  placeholder="e.g. Shahi Paneer & Gulab Jamun"
                />
              </div>

              <div className="flex items-center justify-end space-x-3 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setEditingMeal(null)}
                  className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-semibold bg-orange-600 hover:bg-orange-500 text-white rounded-xl shadow-lg"
                >
                  Save Menu Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
