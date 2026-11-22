import React, { useState } from 'react';
import { UserConfig, TodayState, MealItem, ProteinSource } from '../types';
import { CustomCheckbox } from './CustomCheckbox';
import { ChevronDown, ChevronUp, CheckCircle2 } from 'lucide-react';

interface DietTabProps {
  config: UserConfig;
  todayState: TodayState;
  onToggleMeal: (mealId: string) => void;
  onToggleMacro: (macroKey: 'calories' | 'protein' | 'carbs' | 'fat') => void;
}

export const DietTab: React.FC<DietTabProps> = ({
  config,
  todayState,
  onToggleMeal,
  onToggleMacro,
}) => {
  const safeMeals = config.meals || [];
  const safeProteinSources = config.proteinSources || [];
  const userStats = config.userStats || { weight: '50 kg', activityLevel: 'Very Active', goal: 'Lean Bulk' };
  const macroTargets = config.macroTargets || { calories: 2700, caloriesUnit: 'kcal', protein: 110, proteinUnit: 'g', carbs: 370, carbsUnit: 'g', fat: 80, fatUnit: 'g' };
  const { diet } = todayState;
  const completedMeals = diet?.meals || {};
  const completedMacros = diet?.macros || { calories: false, protein: false, carbs: false, fat: false };

  // Group collapsible state for Section B (Meals) and Section C (Protein sources)
  const [collapsedMealGroups, setCollapsedMealGroups] = useState<Record<string, boolean>>({});
  const [collapsedProteinGroups, setCollapsedProteinGroups] = useState<Record<string, boolean>>({});

  const toggleMealGroup = (groupName: string) => {
    setCollapsedMealGroups(prev => ({ ...prev, [groupName]: !prev[groupName] }));
  };

  const toggleProteinGroup = (groupName: string) => {
    setCollapsedProteinGroups(prev => ({ ...prev, [groupName]: !prev[groupName] }));
  };

  // Organize Meals by Group
  const mealGroupsMap: Record<string, MealItem[]> = {};
  const standaloneMeals: MealItem[] = [];

  safeMeals.forEach((m) => {
    if (m.group && m.group.trim() !== '') {
      const g = m.group.trim();
      if (!mealGroupsMap[g]) mealGroupsMap[g] = [];
      mealGroupsMap[g].push(m);
    } else {
      standaloneMeals.push(m);
    }
  });

  // Organize Protein Sources by Group
  const proteinGroupsMap: Record<string, ProteinSource[]> = {};
  const standaloneProtein: ProteinSource[] = [];

  safeProteinSources.forEach((p) => {
    if (p.group && p.group.trim() !== '') {
      const g = p.group.trim();
      if (!proteinGroupsMap[g]) proteinGroupsMap[g] = [];
      proteinGroupsMap[g].push(p);
    } else {
      standaloneProtein.push(p);
    }
  });

  // Calculate meal progress
  const totalMealsCount = safeMeals.length;
  const hitMealsCount = safeMeals.filter(m => completedMeals[m.id]).length;
  const mealProgressPercent = totalMealsCount > 0 ? Math.round((hitMealsCount / totalMealsCount) * 100) : 0;

  return (
    <div className="w-full max-w-[480px] mx-auto pb-24 px-4 pt-4 flex flex-col gap-6">
      
      {/* Top Stats Line */}
      <div className="bg-[#111111] border border-[#1E1E1E] py-3 px-4 rounded-[10px] flex items-center justify-center text-center shadow">
        <p className="text-xs font-black uppercase tracking-widest text-[#CAFF00]">
          {userStats.weight} · {userStats.activityLevel} · {userStats.goal}
        </p>
      </div>

      {/* SECTION A — Macro Targets (2x2 Grid) */}
      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between px-1">
          <h3 className="text-xs font-bold uppercase tracking-widest text-[#555555]">
            Section A · Macro Targets
          </h3>
          <span className="text-[10px] font-bold uppercase text-[#888888]">
            Tap cards to mark hit
          </span>
        </div>

        <div className="grid grid-cols-2 gap-3">
          
          {/* Calories Card (#CAFF00) */}
          <div
            onClick={() => onToggleMacro('calories')}
            className={`bg-[#111111] border rounded-[10px] p-4 relative flex flex-col justify-between transition-all duration-150 cursor-pointer active:scale-95 ${
              completedMacros.calories 
                ? 'border-[#CAFF00] shadow-[0_0_15px_rgba(202,255,0,0.25)] bg-[#1B2A10]' 
                : 'border-[#1E1E1E] hover:border-[#333333]'
            }`}
          >
            <div className="flex items-start justify-between">
              <div>
                <span className="text-3xl font-black uppercase tracking-tight text-[#CAFF00] block leading-none">
                  {macroTargets.calories}
                </span>
                <span className="text-xs font-black uppercase tracking-wider text-[#CAFF00]/80 block mt-1">
                  {macroTargets.caloriesUnit}
                </span>
              </div>
              <CustomCheckbox 
                checked={completedMacros.calories} 
                onChange={() => onToggleMacro('calories')} 
                fillColor="#CAFF00"
              />
            </div>
            <span className="text-xs font-black uppercase tracking-wider text-[#EEEEEE] mt-3 block">
              Calories
            </span>
          </div>

          {/* Protein Card (#FF6B35) */}
          <div
            onClick={() => onToggleMacro('protein')}
            className={`bg-[#111111] border rounded-[10px] p-4 relative flex flex-col justify-between transition-all duration-150 cursor-pointer active:scale-95 ${
              completedMacros.protein 
                ? 'border-[#FF6B35] shadow-[0_0_15px_rgba(255,107,53,0.25)] bg-[#331810]' 
                : 'border-[#1E1E1E] hover:border-[#333333]'
            }`}
          >
            <div className="flex items-start justify-between">
              <div>
                <span className="text-3xl font-black uppercase tracking-tight text-[#FF6B35] block leading-none">
                  {macroTargets.protein}
                </span>
                <span className="text-xs font-black uppercase tracking-wider text-[#FF6B35]/80 block mt-1">
                  {macroTargets.proteinUnit}
                </span>
              </div>
              <CustomCheckbox 
                checked={completedMacros.protein} 
                onChange={() => onToggleMacro('protein')} 
                fillColor="#FF6B35"
              />
            </div>
            <span className="text-xs font-black uppercase tracking-wider text-[#EEEEEE] mt-3 block">
              Protein
            </span>
          </div>

          {/* Carbs Card (#60A5FA) */}
          <div
            onClick={() => onToggleMacro('carbs')}
            className={`bg-[#111111] border rounded-[10px] p-4 relative flex flex-col justify-between transition-all duration-150 cursor-pointer active:scale-95 ${
              completedMacros.carbs 
                ? 'border-[#60A5FA] shadow-[0_0_15px_rgba(96,165,250,0.25)] bg-[#102038]' 
                : 'border-[#1E1E1E] hover:border-[#333333]'
            }`}
          >
            <div className="flex items-start justify-between">
              <div>
                <span className="text-3xl font-black uppercase tracking-tight text-[#60A5FA] block leading-none">
                  {macroTargets.carbs}
                </span>
                <span className="text-xs font-black uppercase tracking-wider text-[#60A5FA]/80 block mt-1">
                  {macroTargets.carbsUnit}
                </span>
              </div>
              <CustomCheckbox 
                checked={completedMacros.carbs} 
                onChange={() => onToggleMacro('carbs')} 
                fillColor="#60A5FA"
              />
            </div>
            <span className="text-xs font-black uppercase tracking-wider text-[#EEEEEE] mt-3 block">
              Carbs
            </span>
          </div>

          {/* Fat Card (#A78BFA) */}
          <div
            onClick={() => onToggleMacro('fat')}
            className={`bg-[#111111] border rounded-[10px] p-4 relative flex flex-col justify-between transition-all duration-150 cursor-pointer active:scale-95 ${
              completedMacros.fat 
                ? 'border-[#A78BFA] shadow-[0_0_15px_rgba(167,139,250,0.25)] bg-[#26183A]' 
                : 'border-[#1E1E1E] hover:border-[#333333]'
            }`}
          >
            <div className="flex items-start justify-between">
              <div>
                <span className="text-3xl font-black uppercase tracking-tight text-[#A78BFA] block leading-none">
                  {macroTargets.fat}
                </span>
                <span className="text-xs font-black uppercase tracking-wider text-[#A78BFA]/80 block mt-1">
                  {macroTargets.fatUnit}
                </span>
              </div>
              <CustomCheckbox 
                checked={completedMacros.fat} 
                onChange={() => onToggleMacro('fat')} 
                fillColor="#A78BFA"
              />
            </div>
            <span className="text-xs font-black uppercase tracking-wider text-[#EEEEEE] mt-3 block">
              Fat
            </span>
          </div>

        </div>
      </div>

      {/* SECTION B — Daily Meal Checklist */}
      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between px-1">
          <div>
            <h3 className="text-xs font-bold uppercase tracking-widest text-[#555555]">
              Section B · Daily Meal Checklist
            </h3>
            <span className="text-[10px] font-bold uppercase text-[#CAFF00]">
              {hitMealsCount} / {totalMealsCount} Meals Eaten ({mealProgressPercent}%)
            </span>
          </div>
          {hitMealsCount === totalMealsCount && totalMealsCount > 0 && (
            <CheckCircle2 className="w-5 h-5 text-[#CAFF00] stroke-[2.5] animate-checkmark" />
          )}
        </div>

        {/* Standalone Meals */}
        {standaloneMeals.map((m) => {
          const isDone = Boolean(completedMeals[m.id]);
          return (
            <div
              key={m.id}
              onClick={() => onToggleMeal(m.id)}
              className={`bg-[#111111] border rounded-[10px] p-4 flex items-center justify-between gap-4 transition-all duration-150 cursor-pointer active:scale-[0.99] shadow-sm ${
                isDone 
                  ? 'border-[#1E1E1E] bg-[#111111]/40 opacity-55' 
                  : 'border-[#1E1E1E] hover:border-[#333333]'
              }`}
            >
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <CustomCheckbox checked={isDone} onChange={() => onToggleMeal(m.id)} />
                
                <div className="flex flex-col min-w-0 flex-1">
                  <span className={`text-sm font-bold uppercase tracking-wide truncate ${isDone ? 'line-through text-[#888888]' : 'text-[#EEEEEE]'}`}>
                    {m.name}
                  </span>
                  <span className="text-xs text-[#666666] font-semibold mt-0.5 uppercase tracking-wider">
                    {m.description}
                  </span>
                </div>
              </div>

              {m.time && (
                <div className="shrink-0 bg-[#1A1A1A] border border-[#2a2a2a] px-2.5 py-1 rounded-[6px]">
                  <span className="text-[10px] font-black uppercase text-[#CAFF00]">
                    {m.time}
                  </span>
                </div>
              )}
            </div>
          );
        })}

        {/* Collapsible Named Meal Groups */}
        {Object.entries(mealGroupsMap).map(([groupName, groupItems]) => {
          const isCollapsed = Boolean(collapsedMealGroups[groupName]);
          const groupHitCount = groupItems.filter(item => completedMeals[item.id]).length;
          const groupTotal = groupItems.length;

          return (
            <div key={groupName} className="bg-[#111111] border border-[#1E1E1E] rounded-[10px] overflow-hidden shadow-sm">
              
              {/* Group Collapsible Header */}
              <div
                onClick={() => toggleMealGroup(groupName)}
                className="bg-[#161616] p-3.5 px-4 flex items-center justify-between cursor-pointer hover:bg-[#1c1c1c] transition-colors border-b border-[#1E1E1E]/80"
              >
                <div className="flex items-center gap-2">
                  <span className="text-xs font-black uppercase tracking-wider text-[#CAFF00]">
                    {groupName}
                  </span>
                  <span className="bg-[#0A0A0A] text-[#888888] text-[10px] font-bold px-2 py-0.5 rounded-full">
                    {groupHitCount}/{groupTotal}
                  </span>
                </div>
                {isCollapsed ? (
                  <ChevronDown className="w-4 h-4 text-[#888888]" />
                ) : (
                  <ChevronUp className="w-4 h-4 text-[#EEEEEE]" />
                )}
              </div>

              {/* Group Items List */}
              {!isCollapsed && (
                <div className="p-3 flex flex-col gap-2.5 bg-[#0D0D0D]">
                  {groupItems.map((m) => {
                    const isDone = Boolean(completedMeals[m.id]);
                    return (
                      <div
                        key={m.id}
                        onClick={() => onToggleMeal(m.id)}
                        className={`bg-[#111111] border rounded-[8px] p-3.5 flex items-center justify-between gap-3 transition-all duration-150 cursor-pointer active:scale-[0.99] ${
                          isDone 
                            ? 'border-[#1E1E1E] bg-[#111111]/30 opacity-55' 
                            : 'border-[#1E1E1E] hover:border-[#333333]'
                        }`}
                      >
                        <div className="flex items-center gap-3 flex-1 min-w-0">
                          <CustomCheckbox checked={isDone} onChange={() => onToggleMeal(m.id)} />
                          
                          <div className="flex flex-col min-w-0 flex-1">
                            <span className={`text-sm font-bold uppercase tracking-wide truncate ${isDone ? 'line-through text-[#888888]' : 'text-[#EEEEEE]'}`}>
                              {m.name}
                            </span>
                            <span className="text-xs text-[#666666] font-semibold mt-0.5 uppercase tracking-wider">
                              {m.description}
                            </span>
                          </div>
                        </div>

                        {m.time && (
                          <div className="shrink-0 bg-[#1A1A1A] border border-[#2a2a2a] px-2.5 py-1 rounded-[6px]">
                            <span className="text-[10px] font-black uppercase text-[#CAFF00]">
                              {m.time}
                            </span>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* SECTION C — Protein Sources */}
      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between px-1">
          <h3 className="text-xs font-bold uppercase tracking-widest text-[#555555]">
            Section C · Reference Protein Sources
          </h3>
        </div>

        {/* Standalone Protein */}
        {standaloneProtein.map((p) => (
          <div
            key={p.id}
            className="bg-[#111111] border border-[#1E1E1E] rounded-[10px] p-4 flex items-center justify-between gap-3 shadow-sm hover:border-[#333333] transition-colors"
          >
            <div className="flex items-center gap-3 flex-1 min-w-0">
              <span className="text-2xl shrink-0">{p.emoji}</span>
              <div className="flex flex-col min-w-0 flex-1">
                <span className="text-sm font-bold uppercase tracking-wide text-[#EEEEEE] truncate">
                  {p.name}
                </span>
                <span className="text-xs text-[#666666] font-semibold mt-0.5 uppercase tracking-wider">
                  💡 {p.note}
                </span>
              </div>
            </div>

            <div className="shrink-0 bg-[#FF6B35]/10 border border-[#FF6B35]/30 px-3 py-1.5 rounded-[6px]">
              <span className="text-xs font-black uppercase tracking-wider text-[#FF6B35]">
                {p.proteinAmount}
              </span>
            </div>
          </div>
        ))}

        {/* Collapsible Protein Groups */}
        {Object.entries(proteinGroupsMap).map(([groupName, groupItems]) => {
          const isCollapsed = Boolean(collapsedProteinGroups[groupName]);

          return (
            <div key={groupName} className="bg-[#111111] border border-[#1E1E1E] rounded-[10px] overflow-hidden shadow-sm">
              <div
                onClick={() => toggleProteinGroup(groupName)}
                className="bg-[#161616] p-3.5 px-4 flex items-center justify-between cursor-pointer hover:bg-[#1c1c1c] transition-colors border-b border-[#1E1E1E]/80"
              >
                <span className="text-xs font-black uppercase tracking-wider text-[#FF6B35]">
                  {groupName} ({groupItems.length})
                </span>
                {isCollapsed ? (
                  <ChevronDown className="w-4 h-4 text-[#888888]" />
                ) : (
                  <ChevronUp className="w-4 h-4 text-[#EEEEEE]" />
                )}
              </div>

              {!isCollapsed && (
                <div className="p-3 flex flex-col gap-2.5 bg-[#0D0D0D]">
                  {groupItems.map((p) => (
                    <div
                      key={p.id}
                      className="bg-[#111111] border border-[#1E1E1E] rounded-[8px] p-3.5 flex items-center justify-between gap-3"
                    >
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <span className="text-2xl shrink-0">{p.emoji}</span>
                        <div className="flex flex-col min-w-0 flex-1">
                          <span className="text-sm font-bold uppercase tracking-wide text-[#EEEEEE] truncate">
                            {p.name}
                          </span>
                          <span className="text-xs text-[#666666] font-semibold mt-0.5 uppercase tracking-wider">
                            💡 {p.note}
                          </span>
                        </div>
                      </div>

                      <div className="shrink-0 bg-[#FF6B35]/10 border border-[#FF6B35]/30 px-2.5 py-1 rounded-[6px]">
                        <span className="text-xs font-black uppercase tracking-wider text-[#FF6B35]">
                          {p.proteinAmount}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* SECTION D — Static Info Card */}
      <div className="bg-[#111111] border border-[#1E1E1E] rounded-[10px] p-5 shadow-md flex flex-col gap-3.5 mt-2">
        <h4 className="text-xs font-black uppercase tracking-widest text-[#EEEEEE] pb-2 border-b border-[#1E1E1E]">
          Daily Health Checklist
        </h4>

        <div className="flex items-center gap-3 text-xs font-bold uppercase text-[#CCCCCC]">
          <span className="text-lg shrink-0">💧</span>
          <span>3–4 litres water daily, more on football days</span>
        </div>

        <div className="flex items-center gap-3 text-xs font-bold uppercase text-[#CCCCCC]">
          <span className="text-lg shrink-0">💤</span>
          <span>8–9 hours sleep</span>
        </div>

        <div className="flex items-center gap-3 text-xs font-bold uppercase text-[#CCCCCC]">
          <span className="text-lg shrink-0">🌅</span>
          <span>Morning sunlight</span>
        </div>

        <div className="flex items-center gap-3 text-xs font-bold uppercase text-[#CCCCCC]">
          <span className="text-lg shrink-0">🍋</span>
          <span>Lemon water with turmeric + honey every morning</span>
        </div>
      </div>

      {/* Football Day Note (Blue-left-border card) */}
      <div className="bg-[#111111] border-l-4 border-l-[#60A5FA] border-y border-r border-[#1E1E1E] rounded-r-[10px] p-4 shadow-md mt-2">
        <h4 className="text-xs font-black uppercase tracking-widest text-[#60A5FA] mb-1 flex items-center gap-1.5">
          ⚽ Football Match Days
        </h4>
        <p className="text-xs text-[#EEEEEE] font-semibold leading-relaxed tracking-wide">
          On match days add 400–500 extra calories from carbs — rice, bread, banana.
        </p>
      </div>

    </div>
  );
};
