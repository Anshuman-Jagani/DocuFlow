import React, { type ReactNode } from 'react';
import Sidebar from './Sidebar';
import Header from './Header';

// ── Floating document/finance SVG vectors ────────────────────────────────────
// Each icon is a white SVG path, absolutely positioned, ultra-low opacity,
// with a slow floating animation. They fill empty black content areas.
const FloatingIcons = () => (
  <div className="fixed inset-0 pointer-events-none overflow-hidden z-0" aria-hidden="true">
    {/* Invoice / document icon — top right */}
    <svg
      className="float-icon animate-float-slow"
      style={{ top: '8%', right: '6%', width: 64, height: 64, animationDelay: '0s' }}
      viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2"
    >
      <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
      <polyline points="14 2 14 8 20 8" />
      <line x1="16" y1="13" x2="8" y2="13" />
      <line x1="16" y1="17" x2="8" y2="17" />
      <polyline points="10 9 9 9 8 9" />
    </svg>

    {/* Dollar sign — far right mid */}
    <svg
      className="float-icon animate-float-medium"
      style={{ top: '38%', right: '3%', width: 80, height: 80, animationDelay: '1.5s' }}
      viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1"
    >
      <line x1="12" y1="1" x2="12" y2="23" />
      <path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6" />
    </svg>

    {/* Receipt icon — bottom right */}
    <svg
      className="float-icon animate-float-fast"
      style={{ bottom: '10%', right: '8%', width: 56, height: 56, animationDelay: '0.8s' }}
      viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2"
    >
      <polyline points="3 6 5 6 21 6" />
      <path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2" />
      <line x1="10" y1="11" x2="10" y2="17" />
      <line x1="14" y1="11" x2="14" y2="17" />
    </svg>

    {/* Hash / number sign — bottom left of content */}
    <svg
      className="float-icon animate-float-slow"
      style={{ bottom: '22%', right: '14%', width: 72, height: 72, animationDelay: '2.2s' }}
      viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1"
    >
      <line x1="4" y1="9" x2="20" y2="9" />
      <line x1="4" y1="15" x2="20" y2="15" />
      <line x1="10" y1="3" x2="8" y2="21" />
      <line x1="16" y1="3" x2="14" y2="21" />
    </svg>

    {/* Briefcase — top center-right */}
    <svg
      className="float-icon animate-float-medium"
      style={{ top: '20%', right: '22%', width: 52, height: 52, animationDelay: '3s' }}
      viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2"
    >
      <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
      <path d="M16 21V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v16" />
    </svg>

    {/* Percentage sign */}
    <svg
      className="float-icon animate-float-fast"
      style={{ top: '60%', right: '18%', width: 60, height: 60, animationDelay: '1s' }}
      viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.1"
    >
      <line x1="19" y1="5" x2="5" y2="19" />
      <circle cx="6.5" cy="6.5" r="2.5" />
      <circle cx="17.5" cy="17.5" r="2.5" />
    </svg>

    {/* Bar chart */}
    <svg
      className="float-icon animate-float-slow"
      style={{ top: '72%', right: '28%', width: 48, height: 48, animationDelay: '0.4s' }}
      viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2"
    >
      <line x1="18" y1="20" x2="18" y2="10" />
      <line x1="12" y1="20" x2="12" y2="4" />
      <line x1="6"  y1="20" x2="6"  y2="14" />
    </svg>

    {/* Credit card */}
    <svg
      className="float-icon animate-float-medium"
      style={{ top: '48%', right: '5%', width: 66, height: 66, animationDelay: '2.6s' }}
      viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.1"
    >
      <rect x="1" y="4" width="22" height="16" rx="2" ry="2" />
      <line x1="1" y1="10" x2="23" y2="10" />
    </svg>

    {/* Clipboard list */}
    <svg
      className="float-icon animate-float-slow"
      style={{ bottom: '40%', right: '2%', width: 50, height: 50, animationDelay: '1.8s' }}
      viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2"
    >
      <path d="M16 4h2a2 2 0 012 2v14a2 2 0 01-2 2H6a2 2 0 01-2-2V6a2 2 0 012-2h2"/>
      <rect x="8" y="2" width="8" height="4" rx="1" ry="1"/>
      <line x1="9" y1="12" x2="15" y2="12"/>
      <line x1="9" y1="16" x2="13" y2="16"/>
    </svg>
  </div>
);

interface DashboardLayoutProps {
  children: ReactNode;
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen bg-black relative">
      {/* Floating background vectors */}
      <FloatingIcons />

      {/* Sidebar */}
      <Sidebar />

      {/* Main content area */}
      <div className="lg:pl-64 relative z-10">
        {/* Header */}
        <Header />

        {/* Page content */}
        <main className="p-6 animate-fade-in">
          {children}
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
