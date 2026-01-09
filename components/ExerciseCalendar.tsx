
import React, { useMemo } from 'react';
import { WorkoutData } from '../types';

interface ExerciseCalendarProps {
  workoutData: WorkoutData;
  onToggleDate: (date: string) => void;
}

const ExerciseCalendar: React.FC<ExerciseCalendarProps> = ({ workoutData, onToggleDate }) => {
  const currentMonth = new Date();
  const year = currentMonth.getFullYear();
  const month = currentMonth.getMonth();

  const daysInMonth = useMemo(() => {
    const lastDay = new Date(year, month + 1, 0).getDate();
    const days = [];
    for (let i = 1; i <= lastDay; i++) {
      days.push(new Date(year, month, i).toISOString().split('T')[0]);
    }
    return days;
  }, [year, month]);

  const monthName = currentMonth.toLocaleString('default', { month: 'long' });

  return (
    <div className="bg-slate-800/50 backdrop-blur-md rounded-2xl p-6 shadow-xl border border-slate-700">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-slate-100">{monthName} {year}</h2>
        <div className="flex gap-2">
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 bg-emerald-500 rounded-sm"></div>
            <span className="text-xs text-slate-400">Worked Out</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 bg-slate-700 rounded-sm"></div>
            <span className="text-xs text-slate-400">Rest</span>
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-7 gap-3">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
          <div key={day} className="text-center text-xs font-semibold text-slate-500 uppercase tracking-wider">
            {day}
          </div>
        ))}
        
        {/* Padding for start of month */}
        {Array.from({ length: new Date(year, month, 1).getDay() }).map((_, i) => (
          <div key={`pad-${i}`} className="aspect-square"></div>
        ))}

        {daysInMonth.map(dateStr => {
          const isWorkedOut = !!workoutData[dateStr];
          const isToday = dateStr === new Date().toISOString().split('T')[0];
          const dayNum = parseInt(dateStr.split('-')[2], 10);

          return (
            <button
              key={dateStr}
              onClick={() => onToggleDate(dateStr)}
              className={`
                aspect-square rounded-lg flex items-center justify-center text-sm font-medium transition-all
                ${isWorkedOut 
                  ? 'bg-emerald-500 text-emerald-950 shadow-[0_0_15px_-3px_rgba(16,185,129,0.5)] scale-105 z-10' 
                  : 'bg-slate-700/50 text-slate-400 hover:bg-slate-700'
                }
                ${isToday ? 'ring-2 ring-amber-400 ring-offset-2 ring-offset-slate-900' : ''}
              `}
            >
              {dayNum}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default ExerciseCalendar;
