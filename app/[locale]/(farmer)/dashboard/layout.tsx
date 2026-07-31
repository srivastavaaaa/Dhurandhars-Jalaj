'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Sprout, BookOpen, Warehouse, Tractor, User, LayoutDashboard, BarChart3, ShieldCheck } from 'lucide-react';
import { useLocale } from 'next-intl';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const locale = useLocale();

  const navItems = [
    {
      label: 'Home',
      labelHi: 'होम',
      href: `/${locale}/dashboard`,
      icon: LayoutDashboard
    },
    {
      label: 'Schemes',
      labelHi: 'योजनाएं',
      href: `/${locale}/dashboard/schemes`,
      icon: BookOpen
    },
    {
      label: 'Advisor',
      labelHi: 'सलाहकार',
      href: `/${locale}/dashboard/harvest-advisor`,
      icon: Warehouse
    },
    {
      label: 'Rentals',
      labelHi: 'किराया',
      href: `/${locale}/rentals`,
      icon: Tractor
    },
    {
      label: 'Profile',
      labelHi: 'प्रोफ़ाइल',
      href: `/${locale}/dashboard/profile`,
      icon: User
    }
  ];

  return (
    <div className="flex-1 flex flex-col min-h-screen bg-background pb-20 md:pb-0">
      {/* Top Navbar for Desktop */}
      <header className="bg-surface border-b border-surface-highest px-6 py-4 flex items-center justify-between sticky top-0 z-30 shadow-sm">
        <div className="flex items-center space-x-2">
          <div className="p-2 bg-primary rounded-xl text-accent">
            <Sprout size={20} />
          </div>
          <div>
            <h1 className="text-base font-black text-primary tracking-tight">KrishiMitra</h1>
            <span className="text-[9px] text-secondary font-bold block">Community Hub</span>
          </div>
        </div>

        {/* Desktop Nav links */}
        <nav className="hidden md:flex items-center space-x-1.5">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center space-x-1.5 px-4 py-2 rounded-xl text-xs font-semibold transition active:scale-95 ${isActive
                  ? 'bg-primary text-white shadow-md'
                  : 'text-slate-600 hover:bg-surface-container'
                  }`}
              >
                <Icon size={14} />
                <span>{locale === 'hi' ? item.labelHi : item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Quick links to Admin / Agent dashboards */}
        <div className="flex items-center space-x-2">
          <Link
            href={`/${locale}/dashboard/review-queue`}
            className="text-[10px] font-bold text-slate-500 hover:text-slate-700 bg-surface-container px-3 py-1.5 rounded-lg flex items-center space-x-1"
          >
            <ShieldCheck size={12} />
            <span>Agent Desk</span>
          </Link>
          <Link
            href={`/${locale}/admin/analytics`}
            className="text-[10px] font-bold text-secondary hover:text-primary bg-accent/20 px-3 py-1.5 rounded-lg flex items-center space-x-1"
          >
            <BarChart3 size={12} />
            <span>Admin</span>
          </Link>
        </div>
      </header>

      {/* Main page content area */}
      <main className="flex-1 max-w-full">
        {children}
      </main>

      {/* Bottom Navigation for Mobile Devices */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-surface border-t border-surface-highest flex justify-around py-2.5 z-40 shadow-2xl">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center space-y-1 text-center transition active:scale-95 ${isActive ? 'text-primary' : 'text-slate-400'
                }`}
            >
              <Icon size={18} className={isActive ? 'scale-110 text-primary transition' : ''} />
              <span className="text-[9px] font-bold">
                {locale === 'hi' ? item.labelHi : item.label}
              </span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
