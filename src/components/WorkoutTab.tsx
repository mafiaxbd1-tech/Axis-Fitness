import React, { useState } from 'react';
import { UserConfig, TodayState, WorkoutDay } from '../types';
import { CustomCheckbox } from './CustomCheckbox';
import { CheckCircle2, Flame, Award } from 'lucide-react';

interface WorkoutTabProps {
  config: UserConfig;
  todayState: TodayState;
  onToggleExercise: (dayId: string, exerciseId: string) => void;
  onUpdateRoundsCompleted: (dayId: string, roundsCompleted: number) => void;
  initialDayId?: 'MON' | 'TUE' | 'WED' | 'THU' | 'FRI' | 'SAT' | 'SUN';
}

export const WorkoutTab: React.FC<WorkoutTabProps> = ({
  config,
  todayState,
  onToggleExercise,
  onUpdateRoundsCompleted,
  initialDayId = 'MON',
}) => {
  const [selectedDay, setSelectedDay] = useState<'MON' | 'TUE' | 'WED' | 'THU' | 'FRI' | 'SAT' | 'SUN'>(initialDayId);

  const daysList: ('MON' | 'TUE' | 'WED' | 'THU' | 'FRI' | 'SAT' | 'SUN')[] = [
    'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'
  ];

  const currentWorkout: WorkoutDay = config.workouts[selectedDay] || {
    id: selectedDay,
    name: selectedDay,
    focus: 'Rest Day',
    rounds: 0,
    exercises: [],
  };

  const dayExercises = currentWorkout.exercises || [];
  const completedMap = todayState.workout?.[selectedDay] || {};

  const totalExercises = dayExercises.length;
  const completedExercises = dayExercises.filter(ex => completedMap[ex.id]).length;
  const isAllCompleted = totalExercises > 0 && completedExercises === totalExercises;

  // Compute completion percentage
  const progressPercent = totalExercises > 0 ? Math.round((completedExercises / totalExercises) * 100) : 0;

  return (
    <div className="w-full max-w-[480px] mx-auto pb-24 px-4 pt-4 flex flex-col gap-6">
      
      {/* Scrollable Day Selector */}
      <div className="w-full flex items-center gap-2 overflow-x-auto no-scrollbar py-1 border-b border-[#1E1E1E]/80">
        {daysList.map((d) => {
          const isSelected = selectedDay === d;
          const dayExs = config.workouts[d]?.exercises || [];
          const dayDoneMap = todayState.workout?.[d] || {};
          const isDone = dayExs.length > 0 && dayExs.every(ex => dayDoneMap[ex.id]);

          return (
            <button
              key={d}
              type="button"
              onClick={() => setSelectedDay(d)}
              className={`shrink-0 px-3 py-2.5 rounded-[8px] font-black text-xs tracking-wider uppercase transition-all duration-150 cursor-pointer flex flex-col items-center gap-1 ${
                isSelected
                  ? 'bg-[#CAFF00] text-[#0A0A0A] shadow-[0_4px_12px_rgba(202,255,0,0.3)] scale-105'
                  : isDone
                  ? 'bg-[#102A10] text-[#CAFF00] border border-[#CAFF00]/40'
                  : 'bg-[#111111] text-[#555555] border border-[#1E1E1E] hover:text-[#EEEEEE]'
              }`}
            >
              <span>{d}</span>
              {isDone && !isSelected && (
                <CheckCircle2 className="w-3 h-3 text-[#CAFF00] stroke-[3]" />
              )}
            </button>
          );
        })}
      </div>

      {/* Day Header Info */}
      <div className="bg-[#111111] border border-[#1E1E1E] rounded-[10px] p-5 shadow-lg relative overflow-hidden">
        {/* Subtle accent gradient behind */}
        <div className="absolute -right-12 -top-12 w-32 h-32 bg-[#CAFF00]/5 rounded-full blur-2xl pointer-events-none" />
        
        <div className="flex items-start justify-between gap-2 mb-3">
          <div>
            <h2 className="text-2xl font-black uppercase tracking-tight text-[#EEEEEE]">
              {currentWorkout.name}
            </h2>
            <div className="flex items-center gap-2 mt-1">
              <Flame className="w-4 h-4 text-[#FF6B35] stroke-[2.5]" />
              <span className="text-xs font-bold uppercase tracking-wider text-[#FF6B35]">
                Focus: {currentWorkout.focus}
              </span>
            </div>
          </div>

          {/* Rounds Count Badge & Rounds Completed Dropdown */}
          {currentWorkout.rounds > 0 && (
            <div className="flex flex-col items-end gap-1.5 shrink-0">
              <div className="bg-[#222222] border border-[#333333] px-2.5 py-1 rounded-[8px] flex items-center gap-1 shadow">
                <Award className="w-3.5 h-3.5 text-[#CAFF00]" />
                <span className="text-[10px] font-black uppercase tracking-wider text-[#CAFF00]">
                  {currentWorkout.rounds} {currentWorkout.rounds === 1 ? 'Round' : 'Rounds'}
                </span>
              </div>

              <div className="flex items-center gap-1 bg-[#111111] border border-[#1E1E1E] rounded-[8px] px-2 py-1 shadow hover:border-[#333333] focus-within:border-[#CAFF00] transition-colors">
                <span className="text-[9px] font-bold text-[#888888] uppercase">Done:</span>
                <select
                  value={completedMap.roundsCompleted ?? 0}
                  onChange={(e) => onUpdateRoundsCompleted(selectedDay, Number(e.target.value))}
                  onClick={(e) => e.stopPropagation()}
                  className="bg-transparent text-[#CAFF00] text-xs font-black uppercase outline-none cursor-pointer"
                >
                  {Array.from({ length: currentWorkout.rounds + 1 }, (_, i) => (
                    <option key={i} value={i} className="bg-[#111111] text-[#EEEEEE]">
                      {i} {i === 1 ? 'Round' : 'Rounds'}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          )}
        </div>

        {/* Live Progress Bar */}
        <div className="mt-4 pt-4 border-t border-[#1E1E1E]">
          <div className="flex justify-between items-center text-xs font-black uppercase mb-2">
            <span className="text-[#888888]">Workout Completion</span>
            <span className={isAllCompleted ? 'text-[#CAFF00]' : 'text-[#EEEEEE]'}>
              {completedExercises} / {totalExercises} Done ({progressPercent}%)
            </span>
          </div>
          <div className="w-full h-2.5 bg-[#1E1E1E] rounded-full overflow-hidden p-0.5 border border-[#2a2a2a]">
            <div 
              className="h-full bg-[#CAFF00] rounded-full transition-all duration-300 shadow-[0_0_10px_#CAFF00]"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>
      </div>

      {/* Exercise Checklist */}
      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between px-1">
          <h3 className="text-xs font-bold uppercase tracking-widest text-[#555555]">
            Exercises Checklist
          </h3>
          {isAllCompleted && (
            <span className="text-xs font-black uppercase text-[#CAFF00] flex items-center gap-1 animate-checkmark">
              <CheckCircle2 className="w-4 h-4 stroke-[2.5]" />
              All Completed!
            </span>
          )}
        </div>

        {dayExercises.length === 0 ? (
          <div className="bg-[#111111] border border-[#1E1E1E] rounded-[10px] p-8 text-center text-[#555555]">
            <p className="text-sm font-bold uppercase">No exercises scheduled for today.</p>
            <p className="text-xs mt-1">You can add custom exercises in the Manage tab.</p>
          </div>
        ) : (
          dayExercises.map((ex) => {
            const isDone = Boolean(completedMap[ex.id]);

            return (
              <div
                key={ex.id}
                onClick={() => onToggleExercise(selectedDay, ex.id)}
                className={`bg-[#111111] border rounded-[10px] p-4 flex items-center justify-between gap-4 transition-all duration-150 cursor-pointer active:scale-[0.99] shadow-sm ${
                  isDone 
                    ? 'border-[#1E1E1E] bg-[#111111]/40 opacity-55' 
                    : 'border-[#1E1E1E] hover:border-[#333333]'
                }`}
              >
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <CustomCheckbox 
                    checked={isDone} 
                    onChange={() => onToggleExercise(selectedDay, ex.id)}
                  />
                  
                  <div className="flex flex-col min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className={`text-sm font-bold uppercase tracking-wide truncate ${isDone ? 'line-through text-[#888888]' : 'text-[#EEEEEE]'}`}>
                        {ex.name}
                      </span>
                    </div>

                    {ex.note && (
                      <span className="text-xs text-[#666666] font-semibold mt-0.5 uppercase tracking-wider">
                        📝 {ex.note}
                      </span>
                    )}
                  </div>
                </div>

                {/* Reps Count */}
                <div className="shrink-0 text-right bg-[#1A1A1A] border border-[#2a2a2a] px-3 py-1.5 rounded-[6px]">
                  <span className={`text-xs font-black uppercase tracking-wider ${isDone ? 'text-[#888888]' : 'text-[#CAFF00]'}`}>
                    {ex.reps}
                  </span>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Info Cards (Progressive Overload & Non-Negotiables) */}
      <div className="flex flex-col gap-4 mt-4 pt-4 border-t border-[#1E1E1E]/80">
        
        {/* Accent-left-border Card */}
        <div className="bg-[#111111] border-l-4 border-l-[#CAFF00] border-y border-r border-[#1E1E1E] rounded-r-[10px] p-4 shadow-md">
          <h4 className="text-xs font-black uppercase tracking-widest text-[#CAFF00] mb-1 flex items-center gap-1.5">
            <Flame className="w-4 h-4" />
            Progressive Overload
          </h4>
          <p className="text-xs text-[#EEEEEE] font-medium leading-relaxed tracking-wide">
            Every 1–2 weeks, add 2–3 reps or increase backpack weight. No progression = no growth.
          </p>
        </div>

        {/* Dark-left-border Card */}
        <div className="bg-[#111111] border-l-4 border-l-[#555555] border-y border-r border-[#1E1E1E] rounded-r-[10px] p-4 shadow-md">
          <h4 className="text-xs font-black uppercase tracking-widest text-[#EEEEEE] mb-1 flex items-center gap-1.5">
            <Award className="w-4 h-4 text-[#555555]" />
            Non-Negotiables
          </h4>
          <p className="text-xs text-[#888888] font-medium leading-relaxed tracking-wide">
            Eat 2700 cal, don't skip meals. Sleep 8–9 hrs. Stand tall — posture makes you look bigger.
          </p>
        </div>

      </div>

    </div>
  );
};
