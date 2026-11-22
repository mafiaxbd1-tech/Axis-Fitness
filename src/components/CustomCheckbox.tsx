import React from 'react';

interface CustomCheckboxProps {
  checked: boolean;
  onChange: () => void;
  fillColor?: string; // Defaults to #CAFF00
  disabled?: boolean;
}

export const CustomCheckbox: React.FC<CustomCheckboxProps> = ({
  checked,
  onChange,
  fillColor = '#CAFF00',
  disabled = false,
}) => {
  return (
    <button
      type="button"
      role="checkbox"
      aria-checked={checked}
      disabled={disabled}
      onClick={(e) => {
        e.stopPropagation();
        onChange();
      }}
      className={`w-6 h-6 shrink-0 rounded-[6px] border flex items-center justify-center transition-all duration-150 cursor-pointer active:scale-95 ${
        checked
          ? 'border-transparent shadow-[0_0_12px_rgba(202,255,0,0.3)]'
          : 'border-[#555555] bg-[#111111] hover:border-[#EEEEEE]'
      } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
      style={{
        backgroundColor: checked ? fillColor : undefined,
      }}
    >
      {checked && (
        <svg
          className="w-4 h-4 text-[#0A0A0A] stroke-[3.5] pointer-events-none select-none animate-checkmark"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M5 13l4 4L19 7"
          />
        </svg>
      )}
    </button>
  );
};
