import type { ReactNode } from 'react';

const paths: Record<string, ReactNode> = {
  users: <><circle cx="9" cy="8" r="3.5" /><path d="M2.5 20c.6-3.6 3.2-5.5 6.5-5.5s5.9 1.9 6.5 5.5" /><circle cx="17.5" cy="9" r="2.5" /><path d="M17.5 14.2c2.3.2 3.7 1.7 4 4.3" /></>,
  smile: <><circle cx="12" cy="12" r="9.5" /><path d="M8 14.2c1 1.5 2.4 2.3 4 2.3s3-.8 4-2.3M9 9.5h.01M15 9.5h.01" /></>,
  cert: <><circle cx="12" cy="9.5" r="6" /><path d="m9 9.6 2 2 4-4M8.5 14.5l-1.7 6.5L12 18.5l5.2 2.5-1.7-6.5" /></>,
  hands: <><rect x="3" y="4" width="18" height="12" rx="2" /><path d="M8 20h8M12 16v4M7.5 12l3-3 2.5 2 3.5-4" /></>,
  expert: <><path d="M12 3 3 8l9 5 9-5-9-5Z" /><path d="M7 10.5V16c0 1.4 2.2 3 5 3s5-1.6 5-3v-5.5M21 8v6" /></>,
  badge: <><circle cx="12" cy="12" r="9" /><path d="m8.5 12 2.5 2.5 4.5-5" /></>,
  seat: <><path d="M5 20v-3a3 3 0 0 1 3-3h8a3 3 0 0 1 3 3v3" /><circle cx="12" cy="8" r="4" /></>,
  chart: <><path d="M4 20V10M10 20V4M16 20v-8M22 20H2" /></>,
  calendar: <><rect x="3" y="5" width="18" height="16" rx="3" /><path d="M3 10h18M8 3v4M16 3v4" /></>,
  check: <path d="m5 12.5 4.5 4.5L19 7.5" />,
  arrow: <path d="M5 12h14M13 6l6 6-6 6" />,
  pin: <><path d="M12 21s7-6.2 7-11.5A7 7 0 0 0 5 9.5C5 14.8 12 21 12 21Z" /><circle cx="12" cy="9.5" r="2.5" /></>,
  phone: <path d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2Z" />,
  mail: <><rect x="3" y="5" width="18" height="14" rx="3" /><path d="m4 7 8 6 8-6" /></>,
  clock: <><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></>,
  menu: <path d="M4 8h16M4 16h16" />,
  close: <path d="M6 6l12 12M18 6 6 18" />,
  grid: <><rect x="3" y="3" width="8" height="8" rx="2" /><rect x="13" y="3" width="8" height="8" rx="2" /><rect x="3" y="13" width="8" height="8" rx="2" /><rect x="13" y="13" width="8" height="8" rx="2" /></>,
  list: <><path d="M8 6h12M8 12h12M8 18h12" /><circle cx="4" cy="6" r="1" /><circle cx="4" cy="12" r="1" /><circle cx="4" cy="18" r="1" /></>,
  book: <><path d="M4 19.5V5a2 2 0 0 1 2-2h5.5v18H6a2 2 0 0 1-2-1.5Z" /><path d="M20 19.5V5a2 2 0 0 0-2-2h-5.5v18H18a2 2 0 0 0 2-1.5Z" /></>,
  card: <><rect x="2.5" y="5" width="19" height="14" rx="3" /><path d="M2.5 10h19M6 15h4" /></>,
  doc: <><path d="M7 3h7l4 4v14a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1Z" /><path d="M14 3v4h4M9 13h6M9 17h6" /></>,
  star: <path d="m12 3 2.6 5.9 6.4.6-4.8 4.3 1.4 6.3L12 16.9 6.4 20.1l1.4-6.3-4.8-4.3 6.4-.6L12 3Z" />,
  link: <><path d="M9 12a4 4 0 0 1 1.2-2.8l3-3a4 4 0 1 1 5.6 5.6l-1.5 1.5" /><path d="M15 12a4 4 0 0 1-1.2 2.8l-3 3a4 4 0 1 1-5.6-5.6l1.5-1.5" /></>,
  logout: <><path d="M9 21H6a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h3" /><path d="M16 17l5-5-5-5M21 12H9" /></>,
  search: <><circle cx="11" cy="11" r="7" /><path d="m21 21-4.3-4.3" /></>,
  bell: <><path d="M6 10a6 6 0 0 1 12 0c0 4 1.5 5.5 1.5 5.5H4.5S6 14 6 10Z" /><path d="M10 19a2 2 0 0 0 4 0" /></>,
  chevronDown: <path d="m6 9 6 6 6-6" />,
  quote: <><path d="M9 7H5.5A1.5 1.5 0 0 0 4 8.5V12h5v5H4" /><path d="M20 7h-3.5A1.5 1.5 0 0 0 15 8.5V12h5v5h-5" /></>,
};

export function Icon({ name, className = 'h-6 w-6', strokeWidth = 1.6 }: { name: string; className?: string; strokeWidth?: number }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
      {paths[name] ?? paths.users}
    </svg>
  );
}
