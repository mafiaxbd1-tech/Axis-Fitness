import { supabase } from './supabaseClient';
import { UserConfig, TodayState, HistoryEntry } from '../types';
import { DEFAULT_CONFIG, getInitialTodayState } from './defaultData';
import { formatNiceDate } from '../utils/dateUtils';

// Helper for local storage key names
const getLocalKey = (userId: string, key: string) => `axis_fitness_${userId}_${key}`;

// Check if user is a local / demo user who shouldn't touch Supabase
export const isLocalUser = (userId: string): boolean => {
  return !userId || userId.startsWith('local_') || userId === 'local_demo_user_id_999';
};

// Safe timeout wrapper for Supabase promises so the UI never hangs if Supabase is paused or down
const withTimeout = <T>(promise: PromiseLike<T>, ms: number = 2500): Promise<T> => {
  return Promise.race([
    Promise.resolve(promise),
    new Promise<T>((_, reject) =>
      setTimeout(() => reject(new Error('Supabase request timed out (server may be paused)')), ms)
    ),
  ]);
};

// 1. Load User Config
export const loadUserConfig = async (userId: string): Promise<UserConfig> => {
  if (!isLocalUser(userId) && supabase) {
    try {
      const { data, error } = await withTimeout(
        supabase
          .from('user_config')
          .select('*')
          .eq('user_id', userId)
          .maybeSingle()
      );

      if (!error && data) {
        const remoteConfig: UserConfig = {
          workouts: data.workouts || DEFAULT_CONFIG.workouts,
          meals: data.meals || DEFAULT_CONFIG.meals,
          proteinSources: data.protein_sources || DEFAULT_CONFIG.proteinSources,
          macroTargets: data.macro_targets || DEFAULT_CONFIG.macroTargets,
          userStats: data.user_stats || DEFAULT_CONFIG.userStats,
        };
        // Cache to localStorage
        localStorage.setItem(getLocalKey(userId, 'config'), JSON.stringify(remoteConfig));
        return remoteConfig;
      }

      // If user row doesn't exist yet (fresh user, no error)
      if (!error && !data) {
        await withTimeout(
          supabase.from('user_config').insert({
            user_id: userId,
            workouts: DEFAULT_CONFIG.workouts,
            meals: DEFAULT_CONFIG.meals,
            protein_sources: DEFAULT_CONFIG.proteinSources,
            macro_targets: DEFAULT_CONFIG.macroTargets,
            user_stats: DEFAULT_CONFIG.userStats,
          })
        );
        localStorage.setItem(getLocalKey(userId, 'config'), JSON.stringify(DEFAULT_CONFIG));
        return DEFAULT_CONFIG;
      }
    } catch (e) {
      console.warn('Supabase user_config load failed/timed out, using localStorage fallback:', e);
    }
  }

  // Local Storage fallback
  const localData = localStorage.getItem(getLocalKey(userId, 'config'));
  if (localData) {
    try {
      const parsed = JSON.parse(localData);
      if (parsed && typeof parsed === 'object') {
        return {
          ...DEFAULT_CONFIG,
          ...parsed,
          workouts: parsed.workouts || DEFAULT_CONFIG.workouts,
          meals: parsed.meals || DEFAULT_CONFIG.meals,
          proteinSources: parsed.proteinSources || DEFAULT_CONFIG.proteinSources,
          macroTargets: parsed.macroTargets || DEFAULT_CONFIG.macroTargets,
          userStats: parsed.userStats || DEFAULT_CONFIG.userStats,
        };
      }
    } catch (e) {
      console.error('Failed to parse local config', e);
    }
  }

  // Save default to local
  localStorage.setItem(getLocalKey(userId, 'config'), JSON.stringify(DEFAULT_CONFIG));
  return DEFAULT_CONFIG;
};

// Save User Config
export const saveUserConfig = async (userId: string, config: UserConfig): Promise<boolean> => {
  // Always update local storage for instantaneous optimistic availability
  localStorage.setItem(getLocalKey(userId, 'config'), JSON.stringify(config));

  if (!isLocalUser(userId) && supabase) {
    try {
      const { data: existing, error: selectErr } = await withTimeout(
        supabase
          .from('user_config')
          .select('id')
          .eq('user_id', userId)
          .maybeSingle()
      );

      if (selectErr) {
        console.warn('Supabase check failed during saveUserConfig:', selectErr);
        return false;
      }

      if (existing) {
        await withTimeout(
          supabase
            .from('user_config')
            .update({
              workouts: config.workouts,
              meals: config.meals,
              protein_sources: config.proteinSources,
              macro_targets: config.macroTargets,
              user_stats: config.userStats,
              updated_at: new Date().toISOString(),
            })
            .eq('user_id', userId)
        );
      } else {
        await withTimeout(
          supabase.from('user_config').insert({
            user_id: userId,
            workouts: config.workouts,
            meals: config.meals,
            protein_sources: config.proteinSources,
            macro_targets: config.macroTargets,
            user_stats: config.userStats,
          })
        );
      }
    } catch (e) {
      console.warn('Supabase user_config save failed:', e);
    }
  }
  return true;
};

// 2. Load Today State
export const loadTodayState = async (userId: string, currentDate: string): Promise<TodayState> => {
  if (!isLocalUser(userId) && supabase) {
    try {
      const { data, error } = await withTimeout(
        supabase
          .from('today_state')
          .select('*')
          .eq('user_id', userId)
          .maybeSingle()
      );

      if (!error && data) {
        const state: TodayState = {
          date: data.date,
          workout: data.workout,
          diet: data.diet,
        };
        localStorage.setItem(getLocalKey(userId, 'today_state'), JSON.stringify(state));
        return state;
      }

      // Initial create if no row exists and no error occurred
      if (!error && !data) {
        const initState = getInitialTodayState(currentDate);
        await withTimeout(
          supabase.from('today_state').insert({
            user_id: userId,
            date: currentDate,
            workout: initState.workout,
            diet: initState.diet,
          })
        );
        localStorage.setItem(getLocalKey(userId, 'today_state'), JSON.stringify(initState));
        return initState;
      }
    } catch (e) {
      console.warn('Supabase today_state load failed/timed out, using localStorage fallback:', e);
    }
  }

  // Local Storage fallback
  const localData = localStorage.getItem(getLocalKey(userId, 'today_state'));
  if (localData) {
    try {
      const parsed = JSON.parse(localData);
      if (parsed && typeof parsed === 'object' && parsed.date) {
        return parsed;
      }
    } catch (e) {
      console.error('Failed to parse local today_state', e);
    }
  }

  const initState = getInitialTodayState(currentDate);
  localStorage.setItem(getLocalKey(userId, 'today_state'), JSON.stringify(initState));
  return initState;
};

// Save Today State
export const saveTodayState = async (userId: string, state: TodayState): Promise<boolean> => {
  localStorage.setItem(getLocalKey(userId, 'today_state'), JSON.stringify(state));

  if (!isLocalUser(userId) && supabase) {
    try {
      const { data: existing, error: selectErr } = await withTimeout(
        supabase
          .from('today_state')
          .select('id')
          .eq('user_id', userId)
          .maybeSingle()
      );

      if (selectErr) {
        console.warn('Supabase check failed during saveTodayState:', selectErr);
        return false;
      }

      if (existing) {
        await withTimeout(
          supabase
            .from('today_state')
            .update({
              date: state.date,
              workout: state.workout,
              diet: state.diet,
              updated_at: new Date().toISOString(),
            })
            .eq('user_id', userId)
        );
      } else {
        await withTimeout(
          supabase.from('today_state').insert({
            user_id: userId,
            date: state.date,
            workout: state.workout,
            diet: state.diet,
          })
        );
      }
    } catch (e) {
      console.warn('Supabase today_state save failed:', e);
    }
  }
  return true;
};

// 3. Load History
export const loadHistory = async (userId: string): Promise<HistoryEntry[]> => {
  if (!isLocalUser(userId) && supabase) {
    try {
      const { data, error } = await withTimeout(
        supabase
          .from('history')
          .select('*')
          .eq('user_id', userId)
          .order('date', { ascending: false })
      );

      if (!error && data) {
        const entries: HistoryEntry[] = data.map((item: any) => ({
          id: item.id,
          date: formatNiceDate(item.date),
          rawDate: item.date,
          dayId: item.day_id,
          dayName: item.workout_snapshot?.dayName || item.day_id,
          focus: item.workout_snapshot?.focus || '',
          workoutSnapshot: item.workout_snapshot,
          dietSnapshot: item.diet_snapshot,
          status: item.status as any,
        }));
        localStorage.setItem(getLocalKey(userId, 'history'), JSON.stringify(entries));
        return entries;
      }
    } catch (e) {
      console.warn('Supabase history load failed/timed out, using localStorage fallback:', e);
    }
  }

  // Local Storage fallback
  const localData = localStorage.getItem(getLocalKey(userId, 'history'));
  if (localData) {
    try {
      const parsed = JSON.parse(localData);
      if (Array.isArray(parsed)) {
        return parsed;
      }
    } catch (e) {
      console.error('Failed to parse local history', e);
    }
  }
  return [];
};

// Add History Entry (During Reset or manual commit)
export const addHistoryEntry = async (
  userId: string,
  entry: Omit<HistoryEntry, 'id' | 'date'>
): Promise<HistoryEntry | null> => {
  const newId = `hist_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  const fullEntry: HistoryEntry = {
    ...entry,
    id: newId,
    date: formatNiceDate(entry.rawDate),
  };

  // Local Storage
  const existing = await loadHistory(userId);
  const updated = [fullEntry, ...existing.filter(e => e.rawDate !== entry.rawDate)];
  localStorage.setItem(getLocalKey(userId, 'history'), JSON.stringify(updated));

  if (!isLocalUser(userId) && supabase) {
    try {
      const { data, error } = await withTimeout(
        supabase
          .from('history')
          .insert({
            user_id: userId,
            date: entry.rawDate,
            day_id: entry.dayId,
            workout_snapshot: entry.workoutSnapshot,
            diet_snapshot: entry.dietSnapshot,
            status: entry.status,
          })
          .select('id')
          .maybeSingle()
      );

      if (!error && data) {
        fullEntry.id = data.id;
        const reUpdated = updated.map(e => (e.id === newId ? fullEntry : e));
        localStorage.setItem(getLocalKey(userId, 'history'), JSON.stringify(reUpdated));
      }
    } catch (e) {
      console.warn('Supabase history insert failed:', e);
    }
  }

  return fullEntry;
};

// Update existing History Entry
export const updateHistoryEntry = async (
  userId: string,
  updatedEntry: HistoryEntry
): Promise<boolean> => {
  const existing = await loadHistory(userId);
  const updated = existing.map(e => (e.id === updatedEntry.id ? updatedEntry : e));
  localStorage.setItem(getLocalKey(userId, 'history'), JSON.stringify(updated));

  if (!isLocalUser(userId) && supabase) {
    try {
      await withTimeout(
        supabase
          .from('history')
          .update({
            workout_snapshot: updatedEntry.workoutSnapshot,
            diet_snapshot: updatedEntry.dietSnapshot,
            status: updatedEntry.status,
          })
          .eq('id', updatedEntry.id)
          .eq('user_id', userId)
      );
    } catch (e) {
      console.warn('Supabase history update failed:', e);
    }
  }

  return true;
};

// Delete History Entry
export const deleteHistoryEntry = async (userId: string, entryId: string): Promise<boolean> => {
  const existing = await loadHistory(userId);
  const updated = existing.filter(e => e.id !== entryId);
  localStorage.setItem(getLocalKey(userId, 'history'), JSON.stringify(updated));

  if (!isLocalUser(userId) && supabase) {
    try {
      await withTimeout(
        supabase
          .from('history')
          .delete()
          .eq('id', entryId)
          .eq('user_id', userId)
      );
    } catch (e) {
      console.warn('Supabase history delete failed:', e);
    }
  }
  return true;
};
