import React, { useState } from 'react';
import { HistoryEntry } from '../types';
import { CustomCheckbox } from './CustomCheckbox';
import { ChevronDown, ChevronUp, Download, Trash2, Dumbbell, Utensils, Award, AlertCircle } from 'lucide-react';

interface HistoryTabProps {
  history: HistoryEntry[];
  onUpdateEntry: (updated: HistoryEntry) => void;
  onDeleteEntry: (entryId: string) => void;
}

export const HistoryTab: React.FC<HistoryTabProps> = ({
  history,
  onUpdateEntry,
  onDeleteEntry,
}) => {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const toggleExpand = (id: string) => {
    setExpandedId(prev => (prev === id ? null : id));
  };

  // Compute status dynamically based on current snapshots
  const computeStatus = (workoutSnap: HistoryEntry['workoutSnapshot'], dietSnap: HistoryEntry['dietSnapshot']): 'Full' | 'Partial' | 'Skipped' => {
    const isWorkoutFull = workoutSnap.total > 0 && workoutSnap.completed === workoutSnap.total && (workoutSnap.roundsCompleted === (workoutSnap.roundsTotal ?? 3));
    const isMealsFull = dietSnap.mealsTotal > 0 && dietSnap.mealsCompleted === dietSnap.mealsTotal;
    const isMacrosFull = dietSnap.macrosCompleted === 4;

    if (isWorkoutFull && isMealsFull && isMacrosFull) return 'Full';
    if (workoutSnap.completed === 0 && dietSnap.mealsCompleted === 0 && dietSnap.macrosCompleted === 0 && (!workoutSnap.roundsCompleted || workoutSnap.roundsCompleted === 0)) return 'Skipped';
    return 'Partial';
  };

  // Handlers for modifying History Snapshots
  const handleToggleExercise = (entry: HistoryEntry, exId: string) => {
    const updatedExercises = entry.workoutSnapshot.exercises.map(ex => {
      if (ex.id === exId) {
        return { ...ex, completed: !ex.completed };
      }
      return ex;
    });

    const completedCount = updatedExercises.filter(ex => ex.completed).length;
    const updatedWorkoutSnap = {
      ...entry.workoutSnapshot,
      completed: completedCount,
      exercises: updatedExercises,
    };

    const newStatus = computeStatus(updatedWorkoutSnap, entry.dietSnapshot);

    onUpdateEntry({
      ...entry,
      workoutSnapshot: updatedWorkoutSnap,
      status: newStatus,
    });
  };

  const handleToggleMeal = (entry: HistoryEntry, mealId: string) => {
    const updatedMeals = entry.dietSnapshot.meals.map(m => {
      if (m.id === mealId) {
        return { ...m, completed: !m.completed };
      }
      return m;
    });

    const completedCount = updatedMeals.filter(m => m.completed).length;
    const updatedDietSnap = {
      ...entry.dietSnapshot,
      mealsCompleted: completedCount,
      meals: updatedMeals,
    };

    const newStatus = computeStatus(entry.workoutSnapshot, updatedDietSnap);

    onUpdateEntry({
      ...entry,
      dietSnapshot: updatedDietSnap,
      status: newStatus,
    });
  };

  const handleToggleMacro = (entry: HistoryEntry, macroKey: 'calories' | 'protein' | 'carbs' | 'fat') => {
    const updatedMacros = {
      ...entry.dietSnapshot.macros,
      [macroKey]: !entry.dietSnapshot.macros[macroKey],
    };

    const completedCount = Object.values(updatedMacros).filter(Boolean).length;
    const updatedDietSnap = {
      ...entry.dietSnapshot,
      macrosCompleted: completedCount,
      macros: updatedMacros,
    };

    const newStatus = computeStatus(entry.workoutSnapshot, updatedDietSnap);

    onUpdateEntry({
      ...entry,
      dietSnapshot: updatedDietSnap,
      status: newStatus,
    });
  };

  const handleMarkAllWorkout = (entry: HistoryEntry) => {
    const updatedExercises = entry.workoutSnapshot.exercises.map(ex => ({ ...ex, completed: true }));
    const updatedWorkoutSnap = {
      ...entry.workoutSnapshot,
      completed: updatedExercises.length,
      roundsCompleted: entry.workoutSnapshot.roundsTotal ?? 3,
      exercises: updatedExercises,
    };

    const newStatus = computeStatus(updatedWorkoutSnap, entry.dietSnapshot);

    onUpdateEntry({
      ...entry,
      workoutSnapshot: updatedWorkoutSnap,
      status: newStatus,
    });
  };

  const handleUpdateHistoryRounds = (entry: HistoryEntry, roundsCompleted: number) => {
    const updatedWorkoutSnap = {
      ...entry.workoutSnapshot,
      roundsCompleted,
    };
    const newStatus = computeStatus(updatedWorkoutSnap, entry.dietSnapshot);
    onUpdateEntry({
      ...entry,
      workoutSnapshot: updatedWorkoutSnap,
      status: newStatus,
    });
  };

  const handleMarkAllDiet = (entry: HistoryEntry) => {
    const updatedMeals = entry.dietSnapshot.meals.map(m => ({ ...m, completed: true }));
    const updatedMacros = { calories: true, protein: true, carbs: true, fat: true };

    const updatedDietSnap = {
      ...entry.dietSnapshot,
      mealsCompleted: updatedMeals.length,
      macrosCompleted: 4,
      meals: updatedMeals,
      macros: updatedMacros,
    };

    const newStatus = computeStatus(entry.workoutSnapshot, updatedDietSnap);

    onUpdateEntry({
      ...entry,
      dietSnapshot: updatedDietSnap,
      status: newStatus,
    });
  };

  // Export JSON file
  const handleExportJson = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(history, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `axis_fitness_history_${new Date().toISOString().split('T')[0]}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const getStatusBadge = (status: HistoryEntry['status']) => {
    switch (status) {
      case 'Full':
        return <span className="bg-[#CAFF00] text-[#0A0A0A] px-2.5 py-0.5 rounded-[4px] font-black text-[10px] uppercase shadow">Full Hit</span>;
      case 'Partial':
        return <span className="bg-[#60A5FA] text-[#0A0A0A] px-2.5 py-0.5 rounded-[4px] font-black text-[10px] uppercase shadow">Partial</span>;
      case 'Skipped':
        return <span className="bg-[#FF6B35] text-[#0A0A0A] px-2.5 py-0.5 rounded-[4px] font-black text-[10px] uppercase shadow">Skipped</span>;
    }
  };

  return (
    <div className="w-full max-w-[480px] mx-auto pb-24 px-4 pt-4 flex flex-col gap-6">
      
      {/* Export Button Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-black uppercase tracking-tight text-[#EEEEEE]">
          Training & Diet History
        </h2>

        {history.length > 0 && (
          <button
            type="button"
            onClick={handleExportJson}
            className="bg-[#1E1E1E] hover:bg-[#282828] active:scale-95 text-[#CAFF00] border border-[#333333] font-black uppercase text-xs px-3.5 py-2 rounded-[8px] flex items-center gap-1.5 transition-all cursor-pointer shadow"
          >
            <Download className="w-4 h-4 stroke-[2.5]" />
            <span>Export JSON</span>
          </button>
        )}
      </div>

      {/* Confirmation Modal for Delete */}
      {deletingId && (
        <div className="fixed inset-0 z-50 bg-[#0A0A0A]/90 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#111111] border border-[#333333] rounded-[10px] p-6 max-w-[340px] w-full flex flex-col items-center text-center shadow-2xl animate-checkmark">
            <AlertCircle className="w-12 h-12 text-[#FF6B35] mb-3 stroke-[2]" />
            <h3 className="text-base font-black uppercase text-[#EEEEEE]">Delete History Entry?</h3>
            <p className="text-xs text-[#888888] font-medium mt-1 mb-6">
              This action cannot be undone. Are you sure you want to remove this logged day?
            </p>
            <div className="flex w-full gap-3">
              <button
                type="button"
                onClick={() => setDeletingId(null)}
                className="flex-1 bg-[#1E1E1E] hover:bg-[#282828] font-bold text-xs uppercase py-3 rounded-[8px] transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  onDeleteEntry(deletingId);
                  setDeletingId(null);
                }}
                className="flex-1 bg-[#FF6B35] hover:bg-[#ff8555] text-[#0A0A0A] font-black text-xs uppercase py-3 rounded-[8px] shadow-lg transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* History List */}
      {history.length === 0 ? (
        <div className="bg-[#111111] border border-[#1E1E1E] rounded-[10px] p-10 flex flex-col items-center text-center text-[#555555] mt-6">
          <Award className="w-12 h-12 stroke-[1.5] mb-3 text-[#333333]" />
          <p className="text-sm font-black uppercase tracking-wider text-[#888888]">No Past History Found</p>
          <p className="text-xs font-medium mt-1 max-w-[280px]">
            Logged records will appear here whenever a daily reset occurs (on app reload for a new BST date) or when you explicitly commit a day.
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {history.map((entry) => {
            const isExpanded = expandedId === entry.id;

            return (
              <div
                key={entry.id}
                className="bg-[#111111] border border-[#1E1E1E] rounded-[10px] overflow-hidden shadow-sm transition-all"
              >
                {/* Collapsed/Summary Row */}
                <div
                  onClick={() => toggleExpand(entry.id)}
                  className="p-4 flex items-center justify-between gap-3 cursor-pointer hover:bg-[#161616] transition-colors"
                >
                  <div className="flex flex-col min-w-0 flex-1">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <span className="text-xs font-black uppercase text-[#CAFF00]">
                        {entry.date}
                      </span>
                      {getStatusBadge(entry.status)}
                    </div>

                    <span className="text-sm font-black uppercase text-[#EEEEEE] truncate block">
                      {entry.dayName} <span className="text-[#888888] font-bold text-xs">· {entry.focus}</span>
                    </span>

                    {/* Stats stats */}
                    <div className="flex flex-col sm:flex-row sm:items-center gap-1.5 sm:gap-4 mt-2 text-[10px] font-bold uppercase tracking-wider text-[#777777]">
                      <span className="flex items-center gap-1">
                        <Dumbbell className="w-3 h-3 shrink-0 text-[#CAFF00]" />
                        <span>Work: {entry.workoutSnapshot.completed}/{entry.workoutSnapshot.total} · Rounds completed: {entry.workoutSnapshot.roundsCompleted ?? 0}/{entry.workoutSnapshot.roundsTotal ?? 3}</span>
                      </span>
                      <span className="flex items-center gap-1">
                        <Utensils className="w-3 h-3 shrink-0 text-[#FF6B35]" />
                        <span>Diet: {entry.dietSnapshot.mealsCompleted}/{entry.dietSnapshot.mealsTotal} m · {entry.dietSnapshot.macrosCompleted}/4 mac</span>
                      </span>
                    </div>
                  </div>

                  <div className="shrink-0 p-1">
                    {isExpanded ? (
                      <ChevronUp className="w-5 h-5 text-[#CAFF00]" />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-[#555555]" />
                    )}
                  </div>
                </div>

                {/* Expanded Full Inspector & Editor */}
                {isExpanded && (
                  <div className="p-4 pt-1 border-t border-[#1E1E1E]/80 bg-[#0D0D0D] flex flex-col gap-6 animate-checkmark">
                    
                    {/* Expandable Notice */}
                    <div className="bg-[#1A1A1A] px-3 py-2 rounded-[6px] text-[10px] font-bold uppercase text-[#888888] flex items-center justify-between">
                      <span>🛠️ Editable Snapshot Mode</span>
                      <span>Fix missed checks</span>
                    </div>

                    {/* Exercise List Inspector */}
                    <div className="flex flex-col gap-2.5">
                      <div className="flex items-center justify-between">
                        <h4 className="text-xs font-black uppercase text-[#EEEEEE] flex items-center gap-1.5">
                          <Dumbbell className="w-3.5 h-3.5 text-[#CAFF00]" />
                          Logged Exercises
                        </h4>
                        <button
                          type="button"
                          onClick={() => handleMarkAllWorkout(entry)}
                          className="text-[10px] font-black uppercase text-[#CAFF00] hover:underline cursor-pointer"
                        >
                          Mark All Work Done
                        </button>
                      </div>

                      <div className="flex flex-col gap-2">
                        {entry.workoutSnapshot.exercises.map((ex) => (
                          <div
                            key={ex.id}
                            onClick={() => handleToggleExercise(entry, ex.id)}
                            className={`p-3 rounded-[8px] border flex items-center justify-between gap-3 cursor-pointer transition-all ${
                              ex.completed 
                                ? 'bg-[#111111]/40 border-[#1E1E1E] opacity-60' 
                                : 'bg-[#111111] border-[#333333] hover:border-[#555555]'
                            }`}
                          >
                            <div className="flex items-center gap-2.5 flex-1 min-w-0">
                              <CustomCheckbox checked={Boolean(ex.completed)} onChange={() => handleToggleExercise(entry, ex.id)} />
                              <span className={`text-xs font-bold uppercase truncate ${ex.completed ? 'line-through text-[#888888]' : 'text-[#EEEEEE]'}`}>
                                {ex.name}
                              </span>
                            </div>
                            <span className="text-[10px] font-black uppercase text-[#CAFF00] bg-[#1A1A1A] px-2 py-0.5 rounded">
                              {ex.reps}
                            </span>
                          </div>
                        ))}
                      </div>

                      {/* Logged Rounds Editor */}
                      {(entry.workoutSnapshot.roundsTotal ?? 3) > 0 && (
                        <div className="flex items-center justify-between bg-[#111111] border border-[#222222] p-3 rounded-[8px]">
                          <span className="text-xs font-black uppercase text-[#EEEEEE]">
                            Rounds completed: {entry.workoutSnapshot.roundsCompleted ?? 0}/{entry.workoutSnapshot.roundsTotal ?? 3}
                          </span>
                          <div className="flex items-center gap-1">
                            <span className="text-[10px] font-bold text-[#888888] uppercase">Adjust:</span>
                            <select
                              value={entry.workoutSnapshot.roundsCompleted ?? 0}
                              onChange={(e) => handleUpdateHistoryRounds(entry, Number(e.target.value))}
                              className="bg-[#161616] border border-[#333333] text-[#CAFF00] text-xs font-black uppercase rounded-[6px] px-2 py-1 outline-none cursor-pointer focus:border-[#CAFF00]"
                            >
                              {Array.from({ length: (entry.workoutSnapshot.roundsTotal ?? 3) + 1 }, (_, i) => (
                                <option key={i} value={i} className="bg-[#111111] text-[#EEEEEE]">
                                  {i} {i === 1 ? 'Round' : 'Rounds'}
                                </option>
                              ))}
                            </select>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Meal List Inspector */}
                    <div className="flex flex-col gap-2.5">
                      <div className="flex items-center justify-between">
                        <h4 className="text-xs font-black uppercase text-[#EEEEEE] flex items-center gap-1.5">
                          <Utensils className="w-3.5 h-3.5 text-[#FF6B35]" />
                          Logged Meals
                        </h4>
                        <button
                          type="button"
                          onClick={() => handleMarkAllDiet(entry)}
                          className="text-[10px] font-black uppercase text-[#CAFF00] hover:underline cursor-pointer"
                        >
                          Mark All Diet Done
                        </button>
                      </div>

                      <div className="flex flex-col gap-2">
                        {entry.dietSnapshot.meals.map((m) => (
                          <div
                            key={m.id}
                            onClick={() => handleToggleMeal(entry, m.id)}
                            className={`p-3 rounded-[8px] border flex items-center justify-between gap-3 cursor-pointer transition-all ${
                              m.completed 
                                ? 'bg-[#111111]/40 border-[#1E1E1E] opacity-60' 
                                : 'bg-[#111111] border-[#333333] hover:border-[#555555]'
                            }`}
                          >
                            <div className="flex items-center gap-2.5 flex-1 min-w-0">
                              <CustomCheckbox checked={Boolean(m.completed)} onChange={() => handleToggleMeal(entry, m.id)} />
                              <div className="flex flex-col min-w-0 flex-1">
                                <span className={`text-xs font-bold uppercase truncate ${m.completed ? 'line-through text-[#888888]' : 'text-[#EEEEEE]'}`}>
                                  {m.name}
                                </span>
                                <span className="text-[10px] text-[#666666] font-medium truncate">{m.description}</span>
                              </div>
                            </div>
                            {m.time && (
                              <span className="text-[10px] font-black uppercase text-[#CAFF00] bg-[#1A1A1A] px-2 py-0.5 rounded shrink-0">
                                {m.time}
                              </span>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Logged Macro Cards Inspector */}
                    <div className="flex flex-col gap-2">
                      <h4 className="text-xs font-black uppercase text-[#EEEEEE]">
                        Logged Macros
                      </h4>
                      <div className="grid grid-cols-2 gap-2">
                        {(['calories', 'protein', 'carbs', 'fat'] as const).map((mKey) => {
                          const isHit = Boolean(entry.dietSnapshot.macros[mKey]);
                          const fillColors = {
                            calories: '#CAFF00',
                            protein: '#FF6B35',
                            carbs: '#60A5FA',
                            fat: '#A78BFA',
                          };
                          return (
                            <div
                              key={mKey}
                              onClick={() => handleToggleMacro(entry, mKey)}
                              className={`p-3 rounded-[8px] border flex items-center justify-between cursor-pointer ${
                                isHit ? 'bg-[#1A1A1A] border-[#444444]' : 'bg-[#111111] border-[#222222]'
                              }`}
                            >
                              <span className="text-xs font-black uppercase text-[#EEEEEE]">
                                {mKey}
                              </span>
                              <CustomCheckbox 
                                checked={isHit} 
                                onChange={() => handleToggleMacro(entry, mKey)} 
                                fillColor={fillColors[mKey]}
                              />
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Delete Entry Button */}
                    <div className="pt-4 border-t border-[#1E1E1E] flex justify-end">
                      <button
                        type="button"
                        onClick={() => setDeletingId(entry.id)}
                        className="bg-red-950/40 hover:bg-red-950/80 text-red-400 border border-red-500/30 px-4 py-2.5 rounded-[8px] font-black text-xs uppercase flex items-center gap-2 transition-colors cursor-pointer"
                      >
                        <Trash2 className="w-4 h-4" />
                        <span>Delete This Entry</span>
                      </button>
                    </div>

                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

    </div>
  );
};
