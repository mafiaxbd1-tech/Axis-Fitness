import { supabase, hasSupabaseConfig } from './supabaseClient';

export interface UserSession {
  id: string;
  email: string;
  isDemo?: boolean;
}

const DEMO_USER: UserSession = {
  id: 'local_demo_user_id_999',
  email: 'athlete@axisfitness.com',
  isDemo: true,
};

// Check current session
export const getCurrentSession = async (): Promise<UserSession | null> => {
  // 1. First check if there's a stored local demo session or local auth
  const localAuth = localStorage.getItem('axis_fitness_active_user');
  if (localAuth) {
    try {
      return JSON.parse(localAuth);
    } catch (e) {
      console.error(e);
    }
  }

  // 2. Check Supabase
  if (supabase && hasSupabaseConfig) {
    try {
      const { data: { session }, error } = await supabase.auth.getSession();
      if (!error && session?.user) {
        return {
          id: session.user.id,
          email: session.user.email || 'user@axisfitness.com',
        };
      }
    } catch (e) {
      console.warn('Supabase getSession failed:', e);
    }
  }

  return null;
};

// Sign Up
export const signUp = async (email: string, password: string): Promise<{ user: UserSession | null; error: string | null }> => {
  if (supabase && hasSupabaseConfig) {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      });

      if (error) {
        return { user: null, error: error.message };
      }

      if (data?.user) {
        const user: UserSession = {
          id: data.user.id,
          email: data.user.email || email,
        };
        return { user, error: null };
      }
    } catch (e: any) {
      return { user: null, error: e?.message || 'Network error — try again' };
    }
  }

  // Local Storage Mock logic if no Supabase or Supabase disabled
  try {
    const mockUsersKey = 'axis_fitness_local_users';
    const existingUsers: Record<string, string> = JSON.parse(localStorage.getItem(mockUsersKey) || '{}');
    
    if (existingUsers[email]) {
      return { user: null, error: 'Email already registered' };
    }
    
    existingUsers[email] = password;
    localStorage.setItem(mockUsersKey, JSON.stringify(existingUsers));
    
    const user: UserSession = {
      id: `local_user_${Math.random().toString(36).substring(2, 9)}`,
      email,
      isDemo: true,
    };
    localStorage.setItem('axis_fitness_active_user', JSON.stringify(user));
    return { user, error: null };
  } catch (e: any) {
    return { user: null, error: 'Error processing request. Try local demo.' };
  }
};

// Log In
export const logIn = async (email: string, password: string): Promise<{ user: UserSession | null; error: string | null }> => {
  if (supabase && hasSupabaseConfig) {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        return { user: null, error: error.message };
      }

      if (data?.user) {
        const user: UserSession = {
          id: data.user.id,
          email: data.user.email || email,
        };
        return { user, error: null };
      }
    } catch (e: any) {
      return { user: null, error: e?.message || 'Network error — try again' };
    }
  }

  // Local Storage Mock logic
  try {
    const mockUsersKey = 'axis_fitness_local_users';
    const existingUsers: Record<string, string> = JSON.parse(localStorage.getItem(mockUsersKey) || '{}');
    
    if (existingUsers[email] === password) {
      const user: UserSession = {
        id: `local_user_${Math.random().toString(36).substring(2, 9)}`,
        email,
        isDemo: true,
      };
      localStorage.setItem('axis_fitness_active_user', JSON.stringify(user));
      return { user, error: null };
    }
    
    return { user: null, error: 'Invalid email or password' };
  } catch (e: any) {
    return { user: null, error: 'Network error — try again' };
  }
};

// Start Quick Demo
export const startDemoLogin = (): UserSession => {
  localStorage.setItem('axis_fitness_active_user', JSON.stringify(DEMO_USER));
  return DEMO_USER;
};

// Sign Out
export const signOut = async (): Promise<boolean> => {
  localStorage.removeItem('axis_fitness_active_user');
  
  if (supabase && hasSupabaseConfig) {
    try {
      await supabase.auth.signOut();
    } catch (e) {
      console.warn('Supabase signOut failed:', e);
    }
  }
  return true;
};
