import React, { useState } from 'react';
import { Copy, Check, X, Database } from 'lucide-react';

interface SqlMigrationModalProps {
  onClose: () => void;
}

const SQL_SCRIPT = `-- ====================================================================
-- AXIS FITNESS — Supabase Schema & RLS Migration
-- Run this in your Supabase SQL Editor
-- ====================================================================

-- 1. Create user_config Table (Stores soft-coded customizations)
CREATE TABLE IF NOT EXISTS public.user_config (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL DEFAULT auth.uid(),
    workouts JSONB NOT NULL,
    meals JSONB NOT NULL,
    protein_sources JSONB NOT NULL,
    macro_targets JSONB NOT NULL,
    user_stats JSONB NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE INDEX IF NOT EXISTS user_config_user_id_idx ON public.user_config(user_id);
ALTER TABLE public.user_config ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own config" 
    ON public.user_config FOR SELECT 
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own config" 
    ON public.user_config FOR INSERT 
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own config" 
    ON public.user_config FOR UPDATE 
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own config" 
    ON public.user_config FOR DELETE 
    USING (auth.uid() = user_id);


-- 2. Create today_state Table (Stores live checkbox completion for BST today)
CREATE TABLE IF NOT EXISTS public.today_state (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL DEFAULT auth.uid(),
    date TEXT NOT NULL,
    workout JSONB NOT NULL,
    diet JSONB NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE INDEX IF NOT EXISTS today_state_user_id_idx ON public.today_state(user_id);
ALTER TABLE public.today_state ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own today_state" 
    ON public.today_state FOR SELECT 
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own today_state" 
    ON public.today_state FOR INSERT 
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own today_state" 
    ON public.today_state FOR UPDATE 
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own today_state" 
    ON public.today_state FOR DELETE 
    USING (auth.uid() = user_id);


-- 3. Create history Table (Stores reverse-chronological logged past days)
CREATE TABLE IF NOT EXISTS public.history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL DEFAULT auth.uid(),
    date TEXT NOT NULL,
    day_id TEXT NOT NULL,
    workout_snapshot JSONB NOT NULL,
    diet_snapshot JSONB NOT NULL,
    status TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE INDEX IF NOT EXISTS history_user_id_idx ON public.history(user_id);
ALTER TABLE public.history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own history" 
    ON public.history FOR SELECT 
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own history" 
    ON public.history FOR INSERT 
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own history" 
    ON public.history FOR UPDATE 
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own history" 
    ON public.history FOR DELETE 
    USING (auth.uid() = user_id);
`;

export const SqlMigrationModal: React.FC<SqlMigrationModalProps> = ({ onClose }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(SQL_SCRIPT);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#0A0A0A]/90 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-[#111111] border border-[#333333] rounded-[10px] max-w-[480px] w-full max-h-[85vh] flex flex-col shadow-2xl overflow-hidden animate-checkmark">
        
        {/* Modal Header */}
        <div className="bg-[#161616] p-4 border-b border-[#1E1E1E] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Database className="w-5 h-5 text-[#CAFF00]" />
            <h3 className="text-sm font-black uppercase text-[#EEEEEE]">Supabase SQL Migration</h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-[#888888] hover:text-[#EEEEEE] p-1 rounded transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Content / Script */}
        <div className="p-4 overflow-y-auto flex-1 font-mono text-xs text-[#CCCCCC] bg-[#0A0A0A] select-all">
          <pre className="whitespace-pre-wrap break-all">{SQL_SCRIPT}</pre>
        </div>

        {/* Modal Footer */}
        <div className="bg-[#161616] p-4 border-t border-[#1E1E1E] flex items-center justify-between gap-3">
          <span className="text-[10px] font-bold text-[#888888] uppercase">
            Includes tables, indexes & RLS policies
          </span>

          <button
            type="button"
            onClick={handleCopy}
            className="bg-[#CAFF00] hover:bg-[#b8e600] active:scale-95 text-[#0A0A0A] font-black uppercase text-xs px-4 py-2.5 rounded-[8px] flex items-center gap-2 shadow-lg transition-all cursor-pointer"
          >
            {copied ? (
              <>
                <Check className="w-4 h-4 stroke-[3]" />
                <span>Copied to Clipboard!</span>
              </>
            ) : (
              <>
                <Copy className="w-4 h-4 stroke-[2.5]" />
                <span>Copy SQL Script</span>
              </>
            )}
          </button>
        </div>

      </div>
    </div>
  );
};
