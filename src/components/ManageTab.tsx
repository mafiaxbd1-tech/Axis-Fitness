import React, { useState } from 'react';
import { UserConfig, Exercise, MealItem, ProteinSource, MacroTargets, UserStats } from '../types';
import { Dumbbell, Utensils, Award, Flame, Plus, Trash2, ArrowUp, ArrowDown, Database, Save, Edit2 } from 'lucide-react';

interface ManageTabProps {
  config: UserConfig;
  onUpdateConfig: (newConfig: UserConfig) => void;
  onOpenSqlModal: () => void;
}

export const ManageTab: React.FC<ManageTabProps> = ({
  config,
  onUpdateConfig,
  onOpenSqlModal,
}) => {
  // Sub-section navigation inside Manage Tab
  const [activeSubTab, setActiveSubTab] = useState<'workouts' | 'meals' | 'protein' | 'macros' | 'stats' | 'database'>('workouts');

  // Sub-day selector for Manage Workouts
  const [manageDay, setManageDay] = useState<'MON' | 'TUE' | 'WED' | 'THU' | 'FRI' | 'SAT' | 'SUN'>('MON');
  const daysList: ('MON' | 'TUE' | 'WED' | 'THU' | 'FRI' | 'SAT' | 'SUN')[] = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'];

  // State for Workouts Edits
  const currentWorkout = config.workouts[manageDay] || { id: manageDay, name: manageDay, focus: '', rounds: 3, exercises: [] };
  const [dayName, setDayName] = useState(currentWorkout.name);
  const [dayFocus, setDayFocus] = useState(currentWorkout.focus);
  const [dayRounds, setDayRounds] = useState<number>(currentWorkout.rounds);

  // Sync state when manageDay switches
  const handleSelectManageDay = (d: 'MON' | 'TUE' | 'WED' | 'THU' | 'FRI' | 'SAT' | 'SUN') => {
    setManageDay(d);
    const w = config.workouts[d] || { id: d, name: d, focus: '', rounds: 3, exercises: [] };
    setDayName(w.name);
    setDayFocus(w.focus);
    setDayRounds(w.rounds);
  };

  const handleSaveDayMeta = () => {
    const updatedWorkouts = {
      ...config.workouts,
      [manageDay]: {
        ...currentWorkout,
        name: dayName.trim() || manageDay,
        focus: dayFocus.trim(),
        rounds: Number(dayRounds) || 0,
      },
    };
    onUpdateConfig({ ...config, workouts: updatedWorkouts });
  };

  // Add Exercise Form state
  const [newExName, setNewExName] = useState('');
  const [newExReps, setNewExReps] = useState('15');
  const [newExNote, setNewExNote] = useState('');

  const handleAddExercise = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newExName.trim()) return;

    const newEx: Exercise = {
      id: `ex_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      name: newExName.trim(),
      reps: newExReps.trim() || '12',
      note: newExNote.trim() || undefined,
    };

    const updatedExercises = [...(currentWorkout.exercises || []), newEx];
    const updatedWorkouts = {
      ...config.workouts,
      [manageDay]: {
        ...currentWorkout,
        exercises: updatedExercises,
      },
    };

    onUpdateConfig({ ...config, workouts: updatedWorkouts });
    setNewExName('');
    setNewExReps('15');
    setNewExNote('');
  };

  const handleDeleteExercise = (exId: string) => {
    const updatedExercises = (currentWorkout.exercises || []).filter(ex => ex.id !== exId);
    const updatedWorkouts = {
      ...config.workouts,
      [manageDay]: {
        ...currentWorkout,
        exercises: updatedExercises,
      },
    };
    onUpdateConfig({ ...config, workouts: updatedWorkouts });
  };

  const handleReorderExercise = (index: number, direction: 'up' | 'down') => {
    const exs = [...(currentWorkout.exercises || [])];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= exs.length) return;

    const temp = exs[index];
    exs[index] = exs[targetIndex];
    exs[targetIndex] = temp;

    const updatedWorkouts = {
      ...config.workouts,
      [manageDay]: {
        ...currentWorkout,
        exercises: exs,
      },
    };
    onUpdateConfig({ ...config, workouts: updatedWorkouts });
  };

  // Manage Diet — Meals
  const [newMealName, setNewMealName] = useState('');
  const [newMealDesc, setNewMealDesc] = useState('');
  const [newMealTime, setNewMealTime] = useState('12:00');
  const [newMealGroup, setNewMealGroup] = useState('Afternoon & Night');

  const handleAddMeal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMealName.trim()) return;

    const newMeal: MealItem = {
      id: `meal_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      name: newMealName.trim(),
      description: newMealDesc.trim(),
      time: newMealTime.trim(),
      group: newMealGroup.trim() || undefined,
    };

    onUpdateConfig({
      ...config,
      meals: [...config.meals, newMeal],
    });

    setNewMealName('');
    setNewMealDesc('');
    setNewMealTime('12:00');
  };

  const handleDeleteMeal = (mealId: string) => {
    onUpdateConfig({
      ...config,
      meals: config.meals.filter(m => m.id !== mealId),
    });
  };

  const handleReorderMeal = (index: number, direction: 'up' | 'down') => {
    const mls = [...config.meals];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= mls.length) return;

    const temp = mls[index];
    mls[index] = mls[targetIndex];
    mls[targetIndex] = temp;

    onUpdateConfig({ ...config, meals: mls });
  };

  // Manage Diet — Protein Sources
  const [newProtEmoji, setNewProtEmoji] = useState('🥩');
  const [newProtName, setNewProtName] = useState('');
  const [newProtNote, setNewProtNote] = useState('');
  const [newProtAmount, setNewProtAmount] = useState('25g/100g');
  const [newProtGroup, setNewProtGroup] = useState('Daily Staples');

  const handleAddProtein = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProtName.trim()) return;

    const newProt: ProteinSource = {
      id: `prot_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      emoji: newProtEmoji.trim() || '🥩',
      name: newProtName.trim(),
      note: newProtNote.trim(),
      proteinAmount: newProtAmount.trim(),
      group: newProtGroup.trim() || undefined,
    };

    onUpdateConfig({
      ...config,
      proteinSources: [...config.proteinSources, newProt],
    });

    setNewProtName('');
    setNewProtNote('');
    setNewProtAmount('25g/100g');
  };

  const handleDeleteProtein = (protId: string) => {
    onUpdateConfig({
      ...config,
      proteinSources: config.proteinSources.filter(p => p.id !== protId),
    });
  };

  const handleReorderProtein = (index: number, direction: 'up' | 'down') => {
    const pss = [...config.proteinSources];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= pss.length) return;

    const temp = pss[index];
    pss[index] = pss[targetIndex];
    pss[targetIndex] = temp;

    onUpdateConfig({ ...config, proteinSources: pss });
  };

  // Manage Diet — Macro Targets
  const [macroForm, setMacroForm] = useState<MacroTargets>(config.macroTargets);
  const handleSaveMacros = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateConfig({ ...config, macroTargets: macroForm });
  };

  // Manage Diet — User Stats
  const [statsForm, setStatsForm] = useState<UserStats>(config.userStats);
  const handleSaveStats = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateConfig({ ...config, userStats: statsForm });
  };

  return (
    <div className="w-full max-w-[480px] mx-auto pb-24 px-4 pt-4 flex flex-col gap-6">
      
      {/* Tab Header */}
      <h2 className="text-xl font-black uppercase tracking-tight text-[#EEEEEE]">
        Manage & Customization
      </h2>

      {/* Sub-Tab Navigation */}
      <div className="grid grid-cols-3 gap-1.5 bg-[#111111] p-1.5 border border-[#1E1E1E] rounded-[10px]">
        {[
          { id: 'workouts', label: 'Workouts', icon: Dumbbell },
          { id: 'meals', label: 'Meals', icon: Utensils },
          { id: 'protein', label: 'Protein', icon: Flame },
          { id: 'macros', label: 'Macros', icon: Award },
          { id: 'stats', label: 'Stats', icon: Edit2 },
          { id: 'database', label: 'SQL DB', icon: Database },
        ].map((sub) => {
          const isActive = activeSubTab === sub.id;
          const Icon = sub.icon;
          return (
            <button
              key={sub.id}
              type="button"
              onClick={() => setActiveSubTab(sub.id as any)}
              className={`py-2 px-1 rounded-[6px] font-black text-[10px] uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                isActive ? 'bg-[#CAFF00] text-[#0A0A0A] shadow-md' : 'text-[#777777] hover:text-[#EEEEEE]'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{sub.label}</span>
            </button>
          );
        })}
      </div>

      {/* SUB-SECTION 1: MANAGE WORKOUTS */}
      {activeSubTab === 'workouts' && (
        <div className="flex flex-col gap-6">
          {/* Day Selector */}
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1">
            {daysList.map((d) => (
              <button
                key={d}
                type="button"
                onClick={() => handleSelectManageDay(d)}
                className={`shrink-0 px-3 py-2 rounded-[6px] font-black text-xs uppercase cursor-pointer transition-all ${
                  manageDay === d
                    ? 'bg-[#CAFF00] text-[#0A0A0A] shadow'
                    : 'bg-[#111111] text-[#555555] border border-[#1E1E1E]'
                }`}
              >
                {d}
              </button>
            ))}
          </div>

          {/* Edit Day Title & Focus */}
          <div className="bg-[#111111] border border-[#1E1E1E] p-4 rounded-[10px] flex flex-col gap-3 shadow">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#CAFF00]">
              Edit Day Settings ({manageDay})
            </h3>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[10px] text-[#888888] font-bold uppercase mb-1">Day Name</label>
                <input
                  type="text"
                  value={dayName}
                  onChange={(e) => setDayName(e.target.value)}
                  className="w-full bg-[#0A0A0A] border border-[#1E1E1E] rounded-[6px] px-3 py-2 text-xs text-[#EEEEEE] outline-none focus:border-[#CAFF00]"
                />
              </div>
              <div>
                <label className="block text-[10px] text-[#888888] font-bold uppercase mb-1">Focus Label</label>
                <input
                  type="text"
                  value={dayFocus}
                  onChange={(e) => setDayFocus(e.target.value)}
                  placeholder="e.g. Push + Abs"
                  className="w-full bg-[#0A0A0A] border border-[#1E1E1E] rounded-[6px] px-3 py-2 text-xs text-[#EEEEEE] outline-none focus:border-[#CAFF00]"
                />
              </div>
            </div>
            <div>
              <label className="block text-[10px] text-[#888888] font-bold uppercase mb-1">Rounds Count</label>
              <input
                type="number"
                min="0"
                max="10"
                value={dayRounds}
                onChange={(e) => setDayRounds(Number(e.target.value))}
                className="w-full bg-[#0A0A0A] border border-[#1E1E1E] rounded-[6px] px-3 py-2 text-xs text-[#EEEEEE] outline-none focus:border-[#CAFF00]"
              />
            </div>
            <button
              type="button"
              onClick={handleSaveDayMeta}
              className="bg-[#1E1E1E] hover:bg-[#282828] text-[#CAFF00] font-black uppercase text-xs py-2 rounded-[6px] transition-colors mt-1 cursor-pointer flex items-center justify-center gap-1.5"
            >
              <Save className="w-3.5 h-3.5" />
              <span>Update Day Info</span>
            </button>
          </div>

          {/* Exercise List for this day */}
          <div className="flex flex-col gap-3">
            <h3 className="text-xs font-bold uppercase tracking-widest text-[#555555]">
              Exercises ({currentWorkout.exercises?.length || 0})
            </h3>

            {(currentWorkout.exercises || []).map((ex, index) => (
              <div
                key={ex.id}
                className="bg-[#111111] border border-[#1E1E1E] p-3.5 rounded-[10px] flex items-center justify-between gap-3 shadow-sm"
              >
                <div className="flex flex-col min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs font-black uppercase text-[#EEEEEE]">{ex.name}</span>
                  </div>
                  {ex.note && <span className="text-[10px] text-[#666666] uppercase mt-0.5">📝 {ex.note}</span>}
                </div>

                <span className="text-xs font-black text-[#CAFF00] bg-[#1A1A1A] px-2.5 py-1 rounded">
                  {ex.reps}
                </span>

                {/* Actions (Reorder & Delete) */}
                <div className="flex items-center gap-1 shrink-0 ml-1">
                  <button
                    type="button"
                    disabled={index === 0}
                    onClick={() => handleReorderExercise(index, 'up')}
                    className="p-1.5 bg-[#1E1E1E] disabled:opacity-30 rounded hover:text-[#CAFF00] transition-colors cursor-pointer"
                  >
                    <ArrowUp className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    disabled={index === (currentWorkout.exercises?.length || 0) - 1}
                    onClick={() => handleReorderExercise(index, 'down')}
                    className="p-1.5 bg-[#1E1E1E] disabled:opacity-30 rounded hover:text-[#CAFF00] transition-colors cursor-pointer"
                  >
                    <ArrowDown className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDeleteExercise(ex.id)}
                    className="p-1.5 bg-red-950/40 text-red-400 rounded hover:bg-red-950/80 transition-colors ml-1 cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Add Exercise Form */}
          <form onSubmit={handleAddExercise} className="bg-[#111111] border border-[#1E1E1E] p-4 rounded-[10px] flex flex-col gap-3 shadow">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#CAFF00] flex items-center gap-1.5">
              <Plus className="w-4 h-4" />
              Add New Exercise
            </h3>

            <div>
              <label className="block text-[10px] text-[#888888] font-bold uppercase mb-1">Exercise Name</label>
              <input
                type="text"
                required
                value={newExName}
                onChange={(e) => setNewExName(e.target.value)}
                placeholder="e.g. Pike Push-ups"
                className="w-full bg-[#0A0A0A] border border-[#1E1E1E] rounded-[6px] px-3 py-2 text-xs text-[#EEEEEE] outline-none focus:border-[#CAFF00]"
              />
            </div>

            <div>
              <label className="block text-[10px] text-[#888888] font-bold uppercase mb-1">Reps / Time</label>
              <input
                type="text"
                value={newExReps}
                onChange={(e) => setNewExReps(e.target.value)}
                placeholder="e.g. 20 or 30 sec"
                className="w-full bg-[#0A0A0A] border border-[#1E1E1E] rounded-[6px] px-3 py-2 text-xs text-[#EEEEEE] outline-none focus:border-[#CAFF00]"
              />
            </div>

            <div>
              <label className="block text-[10px] text-[#888888] font-bold uppercase mb-1">Note (Optional)</label>
              <input
                type="text"
                value={newExNote}
                onChange={(e) => setNewExNote(e.target.value)}
                placeholder="e.g. use backpack or slow descent"
                className="w-full bg-[#0A0A0A] border border-[#1E1E1E] rounded-[6px] px-3 py-2 text-xs text-[#EEEEEE] outline-none focus:border-[#CAFF00]"
              />
            </div>

            <button
              type="submit"
              className="bg-[#CAFF00] hover:bg-[#b8e600] active:scale-98 text-[#0A0A0A] font-black uppercase text-xs py-3 rounded-[6px] shadow mt-1 cursor-pointer"
            >
              Append to {manageDay} Workout
            </button>
          </form>
        </div>
      )}

      {/* SUB-SECTION 2: MANAGE MEALS */}
      {activeSubTab === 'meals' && (
        <div className="flex flex-col gap-6">
          <form onSubmit={handleAddMeal} className="bg-[#111111] border border-[#1E1E1E] p-4 rounded-[10px] flex flex-col gap-3 shadow">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#CAFF00] flex items-center gap-1.5">
              <Plus className="w-4 h-4" />
              Add Meal Checklist Item
            </h3>

            <div>
              <label className="block text-[10px] text-[#888888] font-bold uppercase mb-1">Meal Title</label>
              <input
                type="text"
                required
                value={newMealName}
                onChange={(e) => setNewMealName(e.target.value)}
                placeholder="e.g. Pre-Workout Snack"
                className="w-full bg-[#0A0A0A] border border-[#1E1E1E] rounded-[6px] px-3 py-2 text-xs text-[#EEEEEE] outline-none focus:border-[#CAFF00]"
              />
            </div>

            <div>
              <label className="block text-[10px] text-[#888888] font-bold uppercase mb-1">Description / Ingredients</label>
              <input
                type="text"
                value={newMealDesc}
                onChange={(e) => setNewMealDesc(e.target.value)}
                placeholder="e.g. oats + banana + whole milk"
                className="w-full bg-[#0A0A0A] border border-[#1E1E1E] rounded-[6px] px-3 py-2 text-xs text-[#EEEEEE] outline-none focus:border-[#CAFF00]"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[10px] text-[#888888] font-bold uppercase mb-1">Target Time</label>
                <input
                  type="text"
                  value={newMealTime}
                  onChange={(e) => setNewMealTime(e.target.value)}
                  placeholder="e.g. 16:00"
                  className="w-full bg-[#0A0A0A] border border-[#1E1E1E] rounded-[6px] px-3 py-2 text-xs text-[#EEEEEE] outline-none focus:border-[#CAFF00]"
                />
              </div>

              <div>
                <label className="block text-[10px] text-[#888888] font-bold uppercase mb-1">Collapsible Group</label>
                <input
                  type="text"
                  value={newMealGroup}
                  onChange={(e) => setNewMealGroup(e.target.value)}
                  placeholder="e.g. Morning or Workout Window"
                  className="w-full bg-[#0A0A0A] border border-[#1E1E1E] rounded-[6px] px-3 py-2 text-xs text-[#EEEEEE] outline-none focus:border-[#CAFF00]"
                />
              </div>
            </div>

            <button
              type="submit"
              className="bg-[#CAFF00] hover:bg-[#b8e600] active:scale-98 text-[#0A0A0A] font-black uppercase text-xs py-3 rounded-[6px] shadow mt-1 cursor-pointer"
            >
              Add to Diet Checklist
            </button>
          </form>

          {/* List existing meals */}
          <div className="flex flex-col gap-3">
            <h3 className="text-xs font-bold uppercase tracking-widest text-[#555555]">
              Existing Meals ({config.meals.length})
            </h3>

            {config.meals.map((m, index) => (
              <div
                key={m.id}
                className="bg-[#111111] border border-[#1E1E1E] p-3.5 rounded-[10px] flex items-center justify-between gap-3 shadow-sm"
              >
                <div className="flex flex-col min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-black uppercase text-[#EEEEEE]">{m.name}</span>
                    {m.group && <span className="bg-[#222222] text-[#888888] text-[9px] px-1.5 py-0.5 rounded">{m.group}</span>}
                  </div>
                  <span className="text-[10px] text-[#666666] uppercase mt-0.5">{m.description}</span>
                </div>

                {m.time && (
                  <span className="text-[10px] font-black text-[#CAFF00] bg-[#1A1A1A] px-2 py-1 rounded">
                    {m.time}
                  </span>
                )}

                <div className="flex items-center gap-1 shrink-0 ml-1">
                  <button
                    type="button"
                    disabled={index === 0}
                    onClick={() => handleReorderMeal(index, 'up')}
                    className="p-1.5 bg-[#1E1E1E] disabled:opacity-30 rounded hover:text-[#CAFF00] transition-colors cursor-pointer"
                  >
                    <ArrowUp className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    disabled={index === config.meals.length - 1}
                    onClick={() => handleReorderMeal(index, 'down')}
                    className="p-1.5 bg-[#1E1E1E] disabled:opacity-30 rounded hover:text-[#CAFF00] transition-colors cursor-pointer"
                  >
                    <ArrowDown className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDeleteMeal(m.id)}
                    className="p-1.5 bg-red-950/40 text-red-400 rounded hover:bg-red-950/80 transition-colors ml-1 cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SUB-SECTION 3: MANAGE PROTEIN SOURCES */}
      {activeSubTab === 'protein' && (
        <div className="flex flex-col gap-6">
          <form onSubmit={handleAddProtein} className="bg-[#111111] border border-[#1E1E1E] p-4 rounded-[10px] flex flex-col gap-3 shadow">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#FF6B35] flex items-center gap-1.5">
              <Plus className="w-4 h-4" />
              Add Reference Protein Source
            </h3>

            <div className="grid grid-cols-4 gap-3">
              <div className="col-span-1">
                <label className="block text-[10px] text-[#888888] font-bold uppercase mb-1">Emoji</label>
                <input
                  type="text"
                  value={newProtEmoji}
                  onChange={(e) => setNewProtEmoji(e.target.value)}
                  className="w-full bg-[#0A0A0A] border border-[#1E1E1E] rounded-[6px] px-3 py-2 text-base text-center outline-none focus:border-[#FF6B35]"
                />
              </div>
              <div className="col-span-3">
                <label className="block text-[10px] text-[#888888] font-bold uppercase mb-1">Food Name</label>
                <input
                  type="text"
                  required
                  value={newProtName}
                  onChange={(e) => setNewProtName(e.target.value)}
                  placeholder="e.g. Canned Tuna"
                  className="w-full bg-[#0A0A0A] border border-[#1E1E1E] rounded-[6px] px-3 py-2 text-xs text-[#EEEEEE] outline-none focus:border-[#FF6B35]"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[10px] text-[#888888] font-bold uppercase mb-1">Protein Specs</label>
                <input
                  type="text"
                  value={newProtAmount}
                  onChange={(e) => setNewProtAmount(e.target.value)}
                  placeholder="e.g. 25g/100g"
                  className="w-full bg-[#0A0A0A] border border-[#1E1E1E] rounded-[6px] px-3 py-2 text-xs text-[#EEEEEE] outline-none focus:border-[#FF6B35]"
                />
              </div>

              <div>
                <label className="block text-[10px] text-[#888888] font-bold uppercase mb-1">Group Label</label>
                <input
                  type="text"
                  value={newProtGroup}
                  onChange={(e) => setNewProtGroup(e.target.value)}
                  placeholder="e.g. Daily Staples"
                  className="w-full bg-[#0A0A0A] border border-[#1E1E1E] rounded-[6px] px-3 py-2 text-xs text-[#EEEEEE] outline-none focus:border-[#FF6B35]"
                />
              </div>
            </div>

            <div>
              <label className="block text-[10px] text-[#888888] font-bold uppercase mb-1">Tip / Note</label>
              <input
                type="text"
                value={newProtNote}
                onChange={(e) => setNewProtNote(e.target.value)}
                placeholder="e.g. Eat daily or good for bulking"
                className="w-full bg-[#0A0A0A] border border-[#1E1E1E] rounded-[6px] px-3 py-2 text-xs text-[#EEEEEE] outline-none focus:border-[#FF6B35]"
              />
            </div>

            <button
              type="submit"
              className="bg-[#FF6B35] hover:bg-[#ff8555] active:scale-98 text-[#0A0A0A] font-black uppercase text-xs py-3 rounded-[6px] shadow mt-1 cursor-pointer"
            >
              Add to Protein Reference
            </button>
          </form>

          {/* List existing protein */}
          <div className="flex flex-col gap-3">
            <h3 className="text-xs font-bold uppercase tracking-widest text-[#555555]">
              Existing Protein Sources ({config.proteinSources.length})
            </h3>

            {config.proteinSources.map((p, index) => (
              <div
                key={p.id}
                className="bg-[#111111] border border-[#1E1E1E] p-3.5 rounded-[10px] flex items-center justify-between gap-3 shadow-sm"
              >
                <span className="text-xl shrink-0">{p.emoji}</span>
                <div className="flex flex-col min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-black uppercase text-[#EEEEEE]">{p.name}</span>
                    {p.group && <span className="bg-[#222222] text-[#888888] text-[9px] px-1.5 py-0.5 rounded">{p.group}</span>}
                  </div>
                  <span className="text-[10px] text-[#666666] uppercase mt-0.5">{p.note}</span>
                </div>

                <span className="text-[10px] font-black text-[#FF6B35] bg-[#FF6B35]/10 border border-[#FF6B35]/30 px-2 py-1 rounded">
                  {p.proteinAmount}
                </span>

                <div className="flex items-center gap-1 shrink-0 ml-1">
                  <button
                    type="button"
                    disabled={index === 0}
                    onClick={() => handleReorderProtein(index, 'up')}
                    className="p-1.5 bg-[#1E1E1E] disabled:opacity-30 rounded hover:text-[#CAFF00] transition-colors cursor-pointer"
                  >
                    <ArrowUp className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    disabled={index === config.proteinSources.length - 1}
                    onClick={() => handleReorderProtein(index, 'down')}
                    className="p-1.5 bg-[#1E1E1E] disabled:opacity-30 rounded hover:text-[#CAFF00] transition-colors cursor-pointer"
                  >
                    <ArrowDown className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDeleteProtein(p.id)}
                    className="p-1.5 bg-red-950/40 text-red-400 rounded hover:bg-red-950/80 transition-colors ml-1 cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SUB-SECTION 4: MANAGE MACRO TARGETS */}
      {activeSubTab === 'macros' && (
        <form onSubmit={handleSaveMacros} className="bg-[#111111] border border-[#1E1E1E] p-5 rounded-[10px] flex flex-col gap-4 shadow">
          <h3 className="text-xs font-black uppercase tracking-wider text-[#EEEEEE] pb-2 border-b border-[#1E1E1E]">
            Daily Macro Target Numbers
          </h3>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] text-[#CAFF00] font-black uppercase mb-1">Calories</label>
              <div className="flex gap-2">
                <input
                  type="number"
                  value={macroForm.calories}
                  onChange={(e) => setMacroForm({ ...macroForm, calories: Number(e.target.value) })}
                  className="w-full bg-[#0A0A0A] border border-[#1E1E1E] focus:border-[#CAFF00] rounded-[6px] px-3 py-2 text-xs text-[#EEEEEE] font-black outline-none"
                />
                <input
                  type="text"
                  value={macroForm.caloriesUnit}
                  onChange={(e) => setMacroForm({ ...macroForm, caloriesUnit: e.target.value })}
                  className="w-16 bg-[#1A1A1A] border border-[#222222] text-center rounded-[6px] px-2 py-2 text-xs text-[#888888] outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-[10px] text-[#FF6B35] font-black uppercase mb-1">Protein</label>
              <div className="flex gap-2">
                <input
                  type="number"
                  value={macroForm.protein}
                  onChange={(e) => setMacroForm({ ...macroForm, protein: Number(e.target.value) })}
                  className="w-full bg-[#0A0A0A] border border-[#1E1E1E] focus:border-[#FF6B35] rounded-[6px] px-3 py-2 text-xs text-[#EEEEEE] font-black outline-none"
                />
                <input
                  type="text"
                  value={macroForm.proteinUnit}
                  onChange={(e) => setMacroForm({ ...macroForm, proteinUnit: e.target.value })}
                  className="w-16 bg-[#1A1A1A] border border-[#222222] text-center rounded-[6px] px-2 py-2 text-xs text-[#888888] outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-[10px] text-[#60A5FA] font-black uppercase mb-1">Carbs</label>
              <div className="flex gap-2">
                <input
                  type="number"
                  value={macroForm.carbs}
                  onChange={(e) => setMacroForm({ ...macroForm, carbs: Number(e.target.value) })}
                  className="w-full bg-[#0A0A0A] border border-[#1E1E1E] focus:border-[#60A5FA] rounded-[6px] px-3 py-2 text-xs text-[#EEEEEE] font-black outline-none"
                />
                <input
                  type="text"
                  value={macroForm.carbsUnit}
                  onChange={(e) => setMacroForm({ ...macroForm, carbsUnit: e.target.value })}
                  className="w-16 bg-[#1A1A1A] border border-[#222222] text-center rounded-[6px] px-2 py-2 text-xs text-[#888888] outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-[10px] text-[#A78BFA] font-black uppercase mb-1">Fat</label>
              <div className="flex gap-2">
                <input
                  type="number"
                  value={macroForm.fat}
                  onChange={(e) => setMacroForm({ ...macroForm, fat: Number(e.target.value) })}
                  className="w-full bg-[#0A0A0A] border border-[#1E1E1E] focus:border-[#A78BFA] rounded-[6px] px-3 py-2 text-xs text-[#EEEEEE] font-black outline-none"
                />
                <input
                  type="text"
                  value={macroForm.fatUnit}
                  onChange={(e) => setMacroForm({ ...macroForm, fatUnit: e.target.value })}
                  className="w-16 bg-[#1A1A1A] border border-[#222222] text-center rounded-[6px] px-2 py-2 text-xs text-[#888888] outline-none"
                />
              </div>
            </div>
          </div>

          <button
            type="submit"
            className="w-full mt-4 bg-[#CAFF00] hover:bg-[#b8e600] active:scale-98 text-[#0A0A0A] font-black uppercase text-xs py-3.5 px-4 rounded-[8px] flex items-center justify-center gap-2 shadow transition-all cursor-pointer"
          >
            <Save className="w-4 h-4 stroke-[2.5]" />
            <span>Save Macro Targets</span>
          </button>
        </form>
      )}

      {/* SUB-SECTION 5: MANAGE USER STATS */}
      {activeSubTab === 'stats' && (
        <form onSubmit={handleSaveStats} className="bg-[#111111] border border-[#1E1E1E] p-5 rounded-[10px] flex flex-col gap-4 shadow">
          <h3 className="text-xs font-black uppercase tracking-wider text-[#EEEEEE] pb-2 border-b border-[#1E1E1E]">
            Athlete Body Stats & Goal
          </h3>

          <div>
            <label className="block text-[10px] text-[#888888] font-bold uppercase mb-1">Body Weight</label>
            <input
              type="text"
              value={statsForm.weight}
              onChange={(e) => setStatsForm({ ...statsForm, weight: e.target.value })}
              placeholder="e.g. 50 kg"
              className="w-full bg-[#0A0A0A] border border-[#1E1E1E] focus:border-[#CAFF00] rounded-[6px] px-3 py-2.5 text-xs text-[#EEEEEE] font-bold outline-none"
            />
          </div>

          <div>
            <label className="block text-[10px] text-[#888888] font-bold uppercase mb-1">Activity Level</label>
            <input
              type="text"
              value={statsForm.activityLevel}
              onChange={(e) => setStatsForm({ ...statsForm, activityLevel: e.target.value })}
              placeholder="e.g. Very Active"
              className="w-full bg-[#0A0A0A] border border-[#1E1E1E] focus:border-[#CAFF00] rounded-[6px] px-3 py-2.5 text-xs text-[#EEEEEE] font-bold outline-none"
            />
          </div>

          <div>
            <label className="block text-[10px] text-[#888888] font-bold uppercase mb-1">Primary Goal Label</label>
            <input
              type="text"
              value={statsForm.goal}
              onChange={(e) => setStatsForm({ ...statsForm, goal: e.target.value })}
              placeholder="e.g. Lean Bulk"
              className="w-full bg-[#0A0A0A] border border-[#1E1E1E] focus:border-[#CAFF00] rounded-[6px] px-3 py-2.5 text-xs text-[#EEEEEE] font-bold outline-none"
            />
          </div>

          <button
            type="submit"
            className="w-full mt-2 bg-[#CAFF00] hover:bg-[#b8e600] active:scale-98 text-[#0A0A0A] font-black uppercase text-xs py-3.5 px-4 rounded-[8px] flex items-center justify-center gap-2 shadow transition-all cursor-pointer"
          >
            <Save className="w-4 h-4 stroke-[2.5]" />
            <span>Update Athlete Stats</span>
          </button>
        </form>
      )}

      {/* SUB-SECTION 6: DATABASE & SQL INSPECTOR */}
      {activeSubTab === 'database' && (
        <div className="bg-[#111111] border border-[#1E1E1E] p-5 rounded-[10px] flex flex-col gap-4 shadow">
          <h3 className="text-xs font-black uppercase tracking-wider text-[#CAFF00] pb-2 border-b border-[#1E1E1E] flex items-center gap-2">
            <Database className="w-4 h-4" />
            <span>Supabase SQL & Persistence</span>
          </h3>

          <p className="text-xs text-[#CCCCCC] font-medium leading-relaxed">
            Axis Fitness generates complete PostgreSQL schemas and Row Level Security (RLS) policies so you can connect your Supabase project with 1-click.
          </p>

          <button
            type="button"
            onClick={onOpenSqlModal}
            className="w-full bg-[#1E1E1E] hover:bg-[#282828] active:scale-98 text-[#CAFF00] font-black uppercase text-xs py-3.5 px-4 rounded-[8px] flex items-center justify-center gap-2 border border-[#333333] shadow transition-all cursor-pointer"
          >
            <Database className="w-4 h-4 stroke-[2.5]" />
            <span>View SQL Migration Script</span>
          </button>

          <div className="bg-[#0A0A0A] border border-[#1E1E1E] rounded-[8px] p-3 mt-2 flex flex-col gap-1 text-[10px] text-[#888888]">
            <span className="font-bold uppercase text-[#EEEEEE]">Persistence Status</span>
            <span>All updates to Workouts, Diet, and Macros are committed instantly to Supabase / persistent localStorage. Flawless optimistic UI enabled.</span>
          </div>
        </div>
      )}

    </div>
  );
};
