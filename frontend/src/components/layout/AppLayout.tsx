/* eslint-disable */
'use client';
import React, { useState } from 'react';
import TopBar from './TopBar';
import BottomNav from './BottomNav';

export default function AppLayout({ children, title = 'AMMS' }: { children: React.ReactNode; title?: string }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#FAF6ED] md:flex font-sans">
      <BottomNav mobileOpen={mobileMenuOpen} setMobileOpen={setMobileMenuOpen} />
      <div className="flex-1 md:ml-64 flex flex-col min-h-screen transition-all duration-300">
        <TopBar 
          title={title} 
          onToggleMobileMenu={() => setMobileMenuOpen(!mobileMenuOpen)} 
          isMobileMenuOpen={mobileMenuOpen} 
        />
        <main className="p-4 md:p-8 w-full max-w-7xl mx-auto flex-1 pb-8">
          {children}
        </main>
      </div>
    </div>
  );
}
