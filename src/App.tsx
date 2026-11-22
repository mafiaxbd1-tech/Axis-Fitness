import { useState, useEffect } from 'react';
import { AuthScreen } from './components/AuthScreen';
import { Navbar, TabType } from './components/Navbar';
import { WorkoutTab } from './components/WorkoutTab';
import { DietTab } from './components/DietTab';
import { HistoryTab } from './components/HistoryTab';
import { ManageTab } from './components/ManageTab';
import { SqlMigrationModal } from './components/SqlMigrationModal';

import { getCurrentSession, signOut, UserSession } from './lib/authService';
import { loadUserConfig, saveUserConfig, loadTodayState, saveTodayState, loadHistory, addHistoryEntry, updateHistoryEntry, deleteHistoryEntry } from './lib/dbService';
import { UserConfig, TodayState, HistoryEntry } from './types';
import { DEFAULT_CONFIG, getInitialTodayState } from './lib/defaultData';
import { getBSTDateString, getBSTDayOfWeek } from './utils/dateUtils';
import { Dumbbell, Loader2, Sparkles, AlertTriangle } from 'lucide-react';

export default function App() {
  const [session, setSession] = useState<UserSession | null>(null);
  const [activeTab, setActiveTab] = useState<TabType>('workout');
  
  // Application Data states
  const [config, setConfig] = useState<UserConfig>(DEFAULT_CONFIG);
  const [todayState, setTodayState] = useState<TodayState | null>(null);
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  
  const [loadingApp, setLoadingApp] = useState(true);
  const [sqlModalOpen, setSqlModalOpen] = useState(false);
  const [resetNotice, setResetNotice] = useState<string | null>(null);

  // 1. Authenticate on initial mount
  useEffect(() => {
    const initAuth = async () => {
      try {
        const user = await getCurrentSession();
        if (user) {
          setSession(user);
        }
      } catch (e) {
        console.error('Failed initAuth', e);
      } finally {
        setLoadingApp(false);
      }
    };
    initAuth();
  }, []);

  // 2. Load DB Data when Session changes & Execute Daily Reset Logic
  useEffect(() => {
    if (!session) return;

    const loadAppData = async () => {
      setLoadingApp(true);
      try {
        const userId = session.id;
        const loadedConfig = await loadUserConfig(userId);
        setConfig(loadedConfig);

        const loadedHistory = await loadHistory(userId);
        setHistory(loadedHistory);

        // Daily Reset Logic (Bangladesh Standard Time, UTC+6)
        const currentBSTDate = getBSTDateString();
        let loadedToday = await loadTodayState(userId, currentBSTDate);

        if (!loadedToday || !loadedToday.date) {
          loadedToday = getInitialTodayState(currentBSTDate);
        }

        // Compare stored date vs current date in BST
        if (loadedToday.date && loadedToday.date !== currentBSTDate) {
          console.log(`BST Date change detected! Stored: ${loadedToday.date} vs Current: ${currentBSTDate}`);
          setResetNotice(`A new day has arrived in Bangladesh Standard Time (${currentBSTDate}). Your previous progress has been committed to History!`);
          setTimeout(() => setResetNotice(null), 6000);

          // Construct snapshot for the outgoing date
          const oldDate = loadedToday.date;
          // compute day code of oldDate, or default
          const [yr, mo, da] = oldDate.split('-').map(Number);
          const oldDayCode = yr && mo && da 
            ? (['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'] as const)[new Date(yr, mo - 1, da).getDay()] 
            : 'MON';

          const wDay = loadedConfig?.workouts?.[oldDayCode] || loadedConfig?.workouts?.MON || DEFAULT_CONFIG.workouts.MON;
          const oldWorkoutDoneMap = loadedToday.workout?.[oldDayCode] || {};
          const workoutExs = wDay?.exercises || [];
          const workoutCompletedCount = workoutExs.filter(ex => oldWorkoutDoneMap[ex.id]).length;

          const oldMealsDoneMap = loadedToday.diet?.meals || {};
          const mealsList = loadedConfig?.meals || [];
          const mealsCompletedCount = mealsList.filter(m => oldMealsDoneMap[m.id]).length;

          const oldMacros = loadedToday.diet?.macros || { calories: false, protein: false, carbs: false, fat: false };
          const macrosCompletedCount = Object.values(oldMacros).filter(Boolean).length;

          // Compute status
          let entryStatus: 'Full' | 'Partial' | 'Skipped' = 'Partial';
          const isWFull = workoutExs.length > 0 && workoutCompletedCount === workoutExs.length;
          const isMFull = mealsList.length > 0 && mealsCompletedCount === mealsList.length;
          if (isWFull && isMFull && macrosCompletedCount === 4) entryStatus = 'Full';
          else if (workoutCompletedCount === 0 && mealsCompletedCount === 0 && macrosCompletedCount === 0) entryStatus = 'Skipped';

          const snapshotEntry = {
            rawDate: oldDate,
            dayId: oldDayCode,
            dayName: wDay?.name || oldDayCode,
            focus: wDay?.focus || '',
            workoutSnapshot: {
              total: workoutExs.length,
              completed: workoutCompletedCount,
              roundsCompleted: oldWorkoutDoneMap.roundsCompleted ?? 0,
              roundsTotal: wDay?.rounds ?? 3,
              exercises: workoutExs.map(ex => ({ ...ex, completed: Boolean(oldWorkoutDoneMap[ex.id]) })),
            },
            dietSnapshot: {
              mealsTotal: mealsList.length,
              mealsCompleted: mealsCompletedCount,
              macrosTotal: 4,
              macrosCompleted: macrosCompletedCount,
              meals: mealsList.map(m => ({ ...m, completed: Boolean(oldMealsDoneMap[m.id]) })),
              macros: oldMacros,
            },
            status: entryStatus,
          };

          // Save history entry
          const addedHist = await addHistoryEntry(userId, snapshotEntry);
          if (addedHist) {
            setHistory(prev => [addedHist, ...prev]);
          }

          // Reset checkboxes in today_state and update stored date
          const resetState = getInitialTodayState(currentBSTDate);
          await saveTodayState(userId, resetState);
          loadedToday = resetState;
        }

        setTodayState(loadedToday);
      } catch (e) {
        console.error('Failed loadAppData', e);
        const fallbackDate = getBSTDateString();
        setTodayState(prev => prev || getInitialTodayState(fallbackDate));
      } finally {
        setLoadingApp(false);
      }
    };

    loadAppData();
  }, [session]);

  // Handle Authentication Success
  const handleAuthSuccess = (user: UserSession) => {
    setSession(user);
    setActiveTab('workout');
  };

  // Handle Sign Out
  const handleLogout = async () => {
    await signOut();
    setSession(null);
    setTodayState(null);
  };

  // Checkboxes Optimistic Handlers
  const handleToggleExercise = async (dayId: string, exerciseId: string) => {
    if (!session || !todayState) return;

    const currentDayMap = todayState.workout?.[dayId] || {};
    const isCurrentlyDone = Boolean(currentDayMap[exerciseId]);

    const updatedWorkout = {
      ...todayState.workout,
      [dayId]: {
        ...currentDayMap,
        [exerciseId]: !isCurrentlyDone,
      },
    };

    const newState: TodayState = {
      ...todayState,
      workout: updatedWorkout,
    };

    setTodayState(newState);
    await saveTodayState(session.id, newState);
  };

  const handleUpdateRoundsCompleted = async (dayId: string, roundsCompleted: number) => {
    if (!session || !todayState) return;

    const currentDayMap = todayState.workout?.[dayId] || {};

    const updatedWorkout = {
      ...todayState.workout,
      [dayId]: {
        ...currentDayMap,
        roundsCompleted,
      },
    };

    const newState: TodayState = {
      ...todayState,
      workout: updatedWorkout,
    };

    setTodayState(newState);
    await saveTodayState(session.id, newState);
  };

  const handleToggleMeal = async (mealId: string) => {
    if (!session || !todayState) return;

    const currentMealsMap = todayState.diet?.meals || {};
    const isCurrentlyDone = Boolean(currentMealsMap[mealId]);

    const updatedDiet = {
      ...todayState.diet,
      meals: {
        ...currentMealsMap,
        [mealId]: !isCurrentlyDone,
      },
    };

    const newState: TodayState = {
      ...todayState,
      diet: updatedDiet,
    };

    setTodayState(newState);
    await saveTodayState(session.id, newState);
  };

  const handleToggleMacro = async (macroKey: 'calories' | 'protein' | 'carbs' | 'fat') => {
    if (!session || !todayState) return;

    const currentMacros = todayState.diet?.macros || { calories: false, protein: false, carbs: false, fat: false };
    const isCurrentlyDone = Boolean(currentMacros[macroKey]);

    const updatedDiet = {
      ...todayState.diet,
      macros: {
        ...currentMacros,
        [macroKey]: !isCurrentlyDone,
      },
    };

    const newState: TodayState = {
      ...todayState,
      diet: updatedDiet,
    };

    setTodayState(newState);
    await saveTodayState(session.id, newState);
  };

  // Manage tab config update handler
  const handleUpdateConfig = async (newConfig: UserConfig) => {
    if (!session) return;
    setConfig(newConfig);
    await saveUserConfig(session.id, newConfig);
  };

  // History entry update handler
  const handleUpdateHistoryEntry = async (updatedEntry: HistoryEntry) => {
    if (!session) return;
    setHistory(prev => prev.map(e => e.id === updatedEntry.id ? updatedEntry : e));
    await updateHistoryEntry(session.id, updatedEntry);
  };

  // History entry delete handler
  const handleDeleteHistoryEntry = async (entryId: string) => {
    if (!session) return;
    setHistory(prev => prev.filter(e => e.id !== entryId));
    await deleteHistoryEntry(session.id, entryId);
  };

  // Full loading screen when checking initial authentication
  if (loadingApp && !session) {
    return (
      <div className="min-h-screen w-full bg-[#0A0A0A] text-[#EEEEEE] flex flex-col justify-center items-center gap-4">
        <div className="w-16 h-16 rounded-full bg-[#CAFF00] flex items-center justify-center text-[#0A0A0A] font-black shadow-[0_0_30px_rgba(202,255,0,0.4)] animate-pulse">
          <Dumbbell className="w-9 h-9 transform -rotate-45" />
        </div>
        <h1 className="text-3xl font-black uppercase tracking-wider">Axis <span className="text-[#CAFF00]">Fitness</span></h1>
        <div className="flex items-center gap-2 text-xs font-bold text-[#555555] uppercase mt-2">
          <Loader2 className="w-4 h-4 animate-spin text-[#CAFF00]" />
          <span>Starting Athlete Session...</span>
        </div>
      </div>
    );
  }

  // Not logged in -> Auth Screen
  if (!session) {
    return <AuthScreen onAuthSuccess={handleAuthSuccess} />;
  }

  const currentBSTDayCode = getBSTDayOfWeek();

  return (
    <div className="min-h-screen w-full bg-[#0A0A0A] text-[#EEEEEE] flex flex-col relative font-sans">
      
      {/* Daily Reset Animated Toast Notice */}
      {resetNotice && (
        <div className="fixed top-16 left-4 right-4 z-50 max-w-[440px] mx-auto bg-[#CAFF00] text-[#0A0A0A] p-4 rounded-[10px] shadow-[0_10px_30px_rgba(202,255,0,0.4)] font-black text-xs uppercase flex items-center gap-3 animate-checkmark">
          <Sparkles className="w-6 h-6 shrink-0" />
          <span>{resetNotice}</span>
        </div>
      )}

      {/* Demo Warning overlay */}
      {session.isDemo && (
        <div className="w-full bg-[#FF6B35] text-[#0A0A0A] py-1 px-3 text-[10px] font-black uppercase text-center flex items-center justify-center gap-1.5 shadow">
          <AlertTriangle className="w-3.5 h-3.5 stroke-[2.5]" />
          <span>Local Demo Mode Active · No Supabase Required</span>
        </div>
      )}

      {/* Pinned Header & Bottom Navbar */}
      <Navbar 
        activeTab={activeTab}
        onTabChange={setActiveTab}
        onLogout={handleLogout}
        userEmail={session.email}
      />

      {/* Main Tab View Area */}
      <main className="flex-1 w-full pb-16">
        {(!todayState || loadingApp) ? (
          <div className="flex flex-col items-center justify-center py-28 gap-3 text-[#555555]">
            <Loader2 className="w-8 h-8 animate-spin text-[#CAFF00]" />
            <span className="text-xs font-bold uppercase tracking-wider">Loading Routine...</span>
          </div>
        ) : (
          <>
            {activeTab === 'workout' && (
              <WorkoutTab 
                config={config}
                todayState={todayState}
                onToggleExercise={handleToggleExercise}
                onUpdateRoundsCompleted={handleUpdateRoundsCompleted}
                initialDayId={currentBSTDayCode}
              />
            )}

            {activeTab === 'diet' && (
              <DietTab 
                config={config}
                todayState={todayState}
                onToggleMeal={handleToggleMeal}
                onToggleMacro={handleToggleMacro}
              />
            )}

            {activeTab === 'history' && (
              <HistoryTab 
                history={history}
                onUpdateEntry={handleUpdateHistoryEntry}
                onDeleteEntry={handleDeleteHistoryEntry}
              />
            )}

            {activeTab === 'manage' && (
              <ManageTab 
                config={config}
                onUpdateConfig={handleUpdateConfig}
                onOpenSqlModal={() => setSqlModalOpen(true)}
              />
            )}
          </>
        )}
      </main>

      {/* SQL Migration Copy Modal */}
      {sqlModalOpen && (
        <SqlMigrationModal onClose={() => setSqlModalOpen(false)} />
      )}

    </div>
  );
}
