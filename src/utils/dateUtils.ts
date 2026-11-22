// Get current date in Bangladesh Standard Time (UTC+6)
export const getBSTDateString = (): string => {
  const now = new Date();
  // We can convert to UTC, then add 6 hours
  const utc = now.getTime() + now.getTimezoneOffset() * 60000;
  const bstTime = new Date(utc + 3600000 * 6);
  
  const year = bstTime.getFullYear();
  const month = String(bstTime.getMonth() + 1).padStart(2, '0');
  const day = String(bstTime.getDate()).padStart(2, '0');
  
  return `${year}-${month}-${day}`;
};

// Get Day of week code (MON, TUE, etc.) in BST
export const getBSTDayOfWeek = (): 'MON' | 'TUE' | 'WED' | 'THU' | 'FRI' | 'SAT' | 'SUN' => {
  const now = new Date();
  const utc = now.getTime() + now.getTimezoneOffset() * 60000;
  const bstTime = new Date(utc + 3600000 * 6);
  
  const days: ('SUN' | 'MON' | 'TUE' | 'WED' | 'THU' | 'FRI' | 'SAT')[] = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
  return days[bstTime.getDay()];
};

// Format nice date string for History entries e.g. "Mon, 9 Jun 2026"
export const formatNiceDate = (dateStr: string): string => {
  const [year, month, day] = dateStr.split('-').map(Number);
  if (!year || !month || !day) return dateStr;
  
  const d = new Date(year, month - 1, day);
  const dayName = d.toLocaleDateString('en-US', { weekday: 'short' });
  const monthName = d.toLocaleDateString('en-US', { month: 'short' });
  
  return `${dayName}, ${day} ${monthName} ${year}`;
};
