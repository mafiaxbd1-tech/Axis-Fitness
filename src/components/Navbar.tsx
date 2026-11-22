import React from 'react';
import { Dumbbell, Utensils, Calendar, Settings, LogOut } from 'lucide-react';

export type TabType = 'workout' | 'diet' | 'history' | 'manage';

interface NavbarProps {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
  onLogout: () => void;
  userEmail: string;
}

export const Navbar: React.FC<NavbarProps> = ({ activeTab, onTabChange, onLogout, userEmail }) => {
  const tabs = [
    { id: 'workout' as TabType, label: 'Workout', icon: Dumbbell, emoji: '💪' },
    { id: 'diet' as TabType, label: 'Diet', icon: Utensils, emoji: '🥩' },
    { id: 'history' as TabType, label: 'History', icon: Calendar, emoji: '📅' },
    { id: 'manage' as TabType, label: 'Manage', icon: Settings, emoji: '⚙️' },
  ];

  return (
    <>
      {/* Top Header info */}
      <header className="w-full max-w-[480px] mx-auto bg-[#111111] border-b border-[#1E1E1E] sticky top-0 z-40 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-full bg-[#CAFF00] flex items-center justify-center text-[#0A0A0A] font-black shadow-[0_0_10px_rgba(202,255,0,0.3)]">
            <Dumbbell className="w-4 h-4 transform -rotate-45 stroke-[3]" />
          </div>
          <span className="font-black text-base uppercase tracking-wider text-[#EEEEEE]">
            Axis <span className="text-[#CAFF00]">Fit</span>
          </span>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-[10px] text-[#555555] font-bold uppercase tracking-wider max-w-[150px] truncate">
            {userEmail}
          </span>
          <button
            type="button"
            onClick={onLogout}
            title="Sign Out"
            className="p-1.5 rounded-[6px] text-[#555555] hover:text-red-400 hover:bg-[#1E1E1E] transition-colors cursor-pointer"
          >
            <LogOut className="w-4 h-4 stroke-[2.5]" />
          </button>
        </div>
      </header>

      {/* Bottom Pinned Navbar for Mobile & Desktop */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 bg-[#111111]/95 backdrop-blur-md border-t border-[#1E1E1E] py-1.5 px-3 max-w-[480px] mx-auto shadow-[0_-10px_30px_rgba(0,0,0,0.8)]">
        <div className="flex items-center justify-around">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => onTabChange(tab.id)}
                className={`flex-1 flex flex-col items-center py-2 px-1 rounded-[8px] transition-all cursor-pointer ${
                  isActive 
                    ? 'text-[#CAFF00] scale-105' 
                    : 'text-[#555555] hover:text-[#EEEEEE]'
                }`}
              >
                <div className="flex items-center justify-center text-lg mb-0.5 relative">
                  <span>{tab.emoji}</span>
                  {isActive && (
                    <span className="absolute -bottom-1 w-1 h-1 rounded-full bg-[#CAFF00] shadow-[0_0_8px_#CAFF00]" />
                  )}
                </div>
                <span className={`text-[10px] font-black uppercase tracking-wider mt-0.5 ${isActive ? 'text-[#EEEEEE]' : ''}`}>
                  {tab.label}
                </span>
              </button>
            );
          })}
        </div>
      </nav>
    </>
  );
};
