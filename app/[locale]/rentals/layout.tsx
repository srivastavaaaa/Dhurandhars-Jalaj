'use client';

import React from 'react';
import Link from 'next/link';
import { useLocale } from 'next-intl';
import { Store, Calendar, Plus, Home, ArrowLeft } from 'lucide-react';

export default function RentalsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const locale = useLocale();

  return (
    <div className="min-h-screen bg-background text-foreground pb-20">
      {/* Top Navbar */}
      <header className="bg-surface border-b border-surface-highest px-6 py-4 flex items-center justify-between sticky top-0 z-30 shadow-sm">
        <div className="flex items-center space-x-2">
          <div className="p-2.5 bg-primary rounded-xl text-accent">
            <Store size={20} />
          </div>
          <div>
            <h1 className="text-base font-black text-primary tracking-tight">Universal Rental Market</h1>
            <span className="text-[9px] text-secondary font-bold block">P2P Sharing Platform</span>
          </div>
        </div>

        {/* Desktop Links */}
        <div className="hidden md:flex items-center space-x-6 text-xs font-bold text-slate-600">
          <Link href={`/${locale}/rentals`} className="hover:text-primary transition">
            Browse Market
          </Link>
          <Link href={`/${locale}/rentals/new`} className="hover:text-primary transition flex items-center gap-1">
            <Plus size={14} />
            <span>List Item</span>
          </Link>
          <Link href={`/${locale}/rentals/history`} className="hover:text-primary transition flex items-center gap-1">
            <Calendar size={14} />
            <span>My Bookings & Listings</span>
          </Link>
        </div>

        <Link
          href="/"
          className="text-xs font-semibold text-secondary hover:text-primary bg-accent/20 px-4 py-2 rounded-xl text-center flex items-center gap-1.5"
        >
          <ArrowLeft size={14} />
          <span>Home</span>
        </Link>
      </header>

      {/* Main content */}
      <main className="max-w-6xl mx-auto px-6 py-8">
        {children}
      </main>

      {/* Mobile Sticky Footer Navigation */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-surface border-t border-surface-highest flex justify-around py-3 z-40 shadow-2xl">
        <Link href={`/${locale}/rentals`} className="flex flex-col items-center space-y-1 text-slate-500 hover:text-primary">
          <Home size={18} />
          <span className="text-[9px] font-bold">Browse</span>
        </Link>
        <Link href={`/${locale}/rentals/new`} className="flex flex-col items-center space-y-1 text-slate-500 hover:text-primary">
          <Plus size={18} />
          <span className="text-[9px] font-bold">List Item</span>
        </Link>
        <Link href={`/${locale}/rentals/history`} className="flex flex-col items-center space-y-1 text-slate-500 hover:text-primary">
          <Calendar size={18} />
          <span className="text-[9px] font-bold">Bookings</span>
        </Link>
      </nav>
    </div>
  );
}
