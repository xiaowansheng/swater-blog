import React from 'react';

interface UAIconProps {
  name?: string;
  className?: string;
}

const icons: Record<string, (className: string) => React.ReactNode> = {
  // Browsers
  chrome: (className) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <circle cx="12" cy="12" r="4" />
      <line x1="21.17" y1="8" x2="12" y2="8" />
      <line x1="3.95" y1="6.06" x2="8.54" y2="14" />
      <line x1="10.88" y1="21.94" x2="15.46" y2="14" />
    </svg>
  ),
  firefox: (className) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      <path d="M12 22c4.5-2 8-7 8-12V5l-8-3-8 3v7c0 5 3.5 10 8 12z" />
      <path d="M12 17a5 5 0 1 0 0-10 5 5 0 0 0 0 10z" />
      <path d="M12 14a2 2 0 1 0 0-4 2 2 0 0 0 0 4z" />
    </svg>
  ),
  safari: (className) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76" />
    </svg>
  ),
  edge: (className) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  ),
  opera: (className) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <ellipse cx="12" cy="12" rx="10" ry="10" />
      <ellipse cx="12" cy="12" rx="4" ry="7" />
    </svg>
  ),
  // OS / Devices
  windows: (className) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
      <line x1="12" y1="3" x2="12" y2="21" />
      <line x1="3" y1="12" x2="21" y2="12" />
    </svg>
  ),
  mac: (className) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 19c-2.3 0-6.4-.8-8.1-3.2-.7-1-1.1-2.4-1.1-4 0-3.7 2.7-6.5 6-6.5 1.4 0 2.5.5 3.2 1 .7-.5 1.8-1 3.2-1 3.3 0 6 2.8 6 6.5 0 1.6-.4 3-1.1 4-1.7 2.4-5.8 3.2-8.1 3.2z" />
      <path d="M12 5.3V2" />
    </svg>
  ),
  android: (className) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 18c-3.3 0-6-2.7-6-6s2.7-6 6-6 6 2.7 6 6-2.7 6-6 6z" />
      <path d="M12 6V2" />
      <path d="M8 4L10 6" />
      <path d="M16 4L14 6" />
    </svg>
  ),
  linux: (className) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 2c-3.3 0-6 2.7-6 6s2.7 6 6 6 6-2.7 6-6-2.7-6-6-6z" />
      <path d="M8 14v4a2 2 0 0 0 2 2h4a2 2 0 0 0 2-2v-4" />
      <path d="M6 10l-2 2" />
      <path d="M18 10l2 2" />
    </svg>
  ),
  ios: (className) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="5" y="2" width="14" height="20" rx="2" ry="2" />
      <line x1="12" y1="18" x2="12.01" y2="18" />
    </svg>
  ),
  iphone: (className) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="5" y="2" width="14" height="20" rx="2" ry="2" />
      <line x1="12" y1="18" x2="12.01" y2="18" />
    </svg>
  ),
  generic_browser: (className) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <line x1="2" y1="12" x2="22" y2="12" />
      <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
    </svg>
  ),
  generic_device: (className) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="4" y="4" width="16" height="16" rx="2" ry="2" />
      <rect x="9" y="9" width="6" height="6" />
      <line x1="9" y1="1" x2="9" y2="4" />
      <line x1="15" y1="1" x2="15" y2="4" />
      <line x1="9" y1="20" x2="9" y2="23" />
      <line x1="15" y1="20" x2="15" y2="23" />
      <line x1="20" y1="9" x2="23" y2="9" />
      <line x1="20" y1="15" x2="23" y2="15" />
      <line x1="1" y1="9" x2="4" y2="9" />
      <line x1="1" y1="15" x2="4" y2="15" />
    </svg>
  ),
  ip: (className) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="5" width="20" height="14" rx="2" ry="2" />
      <line x1="2" y1="10" x2="22" y2="10" />
      <circle cx="7" cy="15" r="0.5" fill="currentColor" />
      <circle cx="12" cy="15" r="0.5" fill="currentColor" />
      <circle cx="17" cy="15" r="0.5" fill="currentColor" />
    </svg>
  ),
};

const getIconKey = (name: string): string => {
  const lower = name.toLowerCase();
  if (lower === 'ip' || lower.includes('ip')) return 'ip';
  if (lower.includes('chrome')) return 'chrome';
  if (lower.includes('firefox')) return 'firefox';
  if (lower.includes('safari')) return 'safari';
  if (lower.includes('edge')) return 'edge';
  if (lower.includes('opera')) return 'opera';
  if (lower.includes('windows')) return 'windows';
  if (lower.includes('mac') || lower.includes('os x')) return 'mac';
  if (lower.includes('android')) return 'android';
  if (lower.includes('linux')) return 'linux';
  if (lower.includes('iphone') || lower.includes('ios')) return 'iphone';
  if (lower.includes('ipad')) return 'ios';
  return '';
};

export const UAIcon: React.FC<UAIconProps> = ({ name, className = "w-3.5 h-3.5" }) => {
  if (!name) return null;
  const key = getIconKey(name);
  const iconFn = icons[key] || (name.toLowerCase().includes('browser') ? icons.generic_browser : icons.generic_device);
  return <>{iconFn(className)}</>;
};

export const UAList: React.FC<{ device?: string; browser?: string; className?: string }> = ({ device, browser, className = "" }) => {
  return (
    <div className={`flex flex-wrap items-center gap-x-3 gap-y-1 min-w-0 ${className}`}>
      {device && (
        <span className="flex items-center gap-1 min-w-0">
          <UAIcon name={device} className="w-3.5 h-3.5 text-accent/60" />
          <span className="truncate max-w-[10rem] sm:max-w-none">{device}</span>
        </span>
      )}
      {browser && (
        <span className="flex items-center gap-1 min-w-0">
          <UAIcon name={browser} className="w-3.5 h-3.5 text-primary/60" />
          <span className="truncate max-w-[10rem] sm:max-w-none">{browser}</span>
        </span>
      )}
    </div>
  );
};
