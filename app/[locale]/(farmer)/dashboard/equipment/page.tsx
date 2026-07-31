'use client';

import React, { useState, useEffect } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { Tractor, Search, Calendar, Landmark, MapPin, Tag, ShieldCheck, CheckCircle2, ChevronRight, X } from 'lucide-react';
import Link from 'next/link';

interface Listing {
  id: string;
  equipmentType: string;
  location: string;
  district: string;
  state: string;
  pricePerDay: number;
  availabilityCalendar: string;
  source: string;
  imageUrl: string | null;
}

export default function EquipmentPage() {
  const t = useTranslations('rental');
  const tc = useTranslations('common');
  const locale = useLocale();

  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [selectedType, setSelectedType] = useState('all');
  const [district, setDistrict] = useState('Wardha'); // Default pilot
  const [filterDate, setFilterDate] = useState('');

  // Booking Modal
  const [selectedListing, setSelectedListing] = useState<Listing | null>(null);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [bookingProgress, setBookingProgress] = useState(false);
  const [bookingSuccess, setBookingSuccess] = useState(false);
  const [bookingError, setBookingError] = useState('');

  useEffect(() => {
    // Read user profile cookie
    const id = document.cookie
      .split('; ')
      .find(row => row.startsWith('krishi_farmer_id='))
      ?.split('=')[1];

    if (id) {
      fetchFarmerDistrict(id);
    } else {
      fetchListings('Wardha', 'all', '');
    }
  }, []);

  const fetchFarmerDistrict = async (id: string) => {
    try {
      const res = await fetch(`/api/farmers/${id}`);
      const data = await res.json();
      if (data && data.district) {
        setDistrict(data.district);
        fetchListings(data.district, selectedType, filterDate);
      } else {
        fetchListings('Wardha', selectedType, filterDate);
      }
    } catch (e) {
      fetchListings('Wardha', selectedType, filterDate);
    }
  };

  const fetchListings = async (dist: string, type: string, date: string) => {
    setLoading(true);
    try {
      let url = `/api/equipment?district=${dist}`;
      if (type !== 'all') url += `&type=${type}`;
      if (date) url += `&date=${date}`;

      const res = await fetch(url);
      const data = await res.json();
      if (Array.isArray(data)) {
        setListings(data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchListings(district, selectedType, filterDate);
  };

  const handleCategoryClick = (type: string) => {
    setSelectedType(type);
    fetchListings(district, type, filterDate);
  };

  const calculateTotalPrice = () => {
    if (!startDate || !endDate || !selectedListing) return 0;
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
    return diffDays * selectedListing.pricePerDay;
  };

  const submitBooking = async () => {
    if (!selectedListing || !startDate || !endDate) return;
    setBookingProgress(true);
    setBookingError('');

    try {
      const res = await fetch(`/api/equipment/${selectedListing.id}/book`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ startDate, endDate })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to submit booking');
      }

      setBookingSuccess(true);
      setTimeout(() => {
        setBookingSuccess(false);
        setSelectedListing(null);
        setStartDate('');
        setEndDate('');
        fetchListings(district, selectedType, filterDate);
      }, 2000);
    } catch (err: any) {
      setBookingError(err.message || 'Booking failed');
    } finally {
      setBookingProgress(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-6 py-10 space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-slate-200 pb-5 gap-4">
        <div className="space-y-1">
          <h2 className="text-2xl font-black text-primary flex items-center space-x-2">
            <Tractor size={28} className="text-secondary" />
            <span>{t('heading')}</span>
          </h2>
          <p className="text-xs text-slate-500 max-w-xl">
            {t('subheading')}
          </p>
        </div>
        <Link
          href="/dashboard"
          className="text-xs font-semibold text-secondary hover:text-primary bg-accent/20 px-4 py-2 rounded-xl text-center"
        >
          ← Go to Dashboard
        </Link>
      </div>

      {/* Filter Form */}
      <form onSubmit={handleSearch} className="bg-surface-lowest border border-surface-highest p-4 rounded-3xl shadow-sm flex flex-col md:flex-row items-center gap-4">
        <div className="w-full md:flex-1 relative">
          <MapPin size={18} className="absolute left-4 top-3.5 text-slate-400" />
          <select
            value={district}
            onChange={(e) => setDistrict(e.target.value)}
            className="w-full bg-slate-50 text-xs font-semibold border-0 focus:ring-2 focus:ring-secondary rounded-2xl pl-12 pr-4 py-3.5 outline-none appearance-none"
          >
            <option value="Wardha">Wardha District (Maharashtra)</option>
            <option value="Guntur">Guntur District (Andhra Pradesh)</option>
          </select>
        </div>

        <div className="w-full md:flex-1 relative">
          <Calendar size={18} className="absolute left-4 top-3.5 text-slate-400" />
          <input
            type="date"
            value={filterDate}
            onChange={(e) => setFilterDate(e.target.value)}
            className="w-full bg-slate-50 text-xs font-semibold border-0 focus:ring-2 focus:ring-secondary rounded-2xl pl-12 pr-4 py-3.5 outline-none"
          />
        </div>

        <button
          type="submit"
          className="w-full md:w-auto bg-primary hover:bg-emerald-950 text-white font-bold text-xs px-6 py-4 rounded-2xl shadow-md transition flex items-center justify-center space-x-1.5 active:scale-95"
        >
          <Search size={16} />
          <span>Search</span>
        </button>
      </form>

      {/* Category Chips */}
      <div className="flex space-x-2 overflow-x-auto pb-2 scrollbar-thin">
        {['all', 'Tractor', 'Harvester', 'Tiller', 'Rotavator'].map((type) => (
          <button
            key={type}
            onClick={() => handleCategoryClick(type)}
            className={`flex-shrink-0 text-xs font-semibold px-4 py-2 rounded-full border transition active:scale-95 ${selectedType === type
                ? 'bg-secondary border-secondary text-white shadow-sm'
                : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
          >
            {type === 'all' ? 'All Machinery' : type}
          </button>
        ))}
      </div>

      {/* Grid List */}
      {loading ? (
        <p className="text-center py-10 text-slate-500 text-sm">{tc('loading')}</p>
      ) : listings.length === 0 ? (
        <div className="bg-surface-lowest border border-surface-highest rounded-3xl p-12 text-center text-slate-500 space-y-2">
          <Tractor size={48} className="text-slate-300 mx-auto" />
          <p className="text-xs font-light">No rentals matching your criteria in this district.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {listings.map((item) => (
            <div key={item.id} className="bg-surface-lowest border border-surface-highest rounded-3xl overflow-hidden shadow-sm hover:shadow-md transition flex flex-col">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={item.imageUrl || 'https://images.unsplash.com/photo-1599819811279-d5ad9cccf838?auto=format&fit=crop&q=80&w=400'}
                alt={item.equipmentType}
                className="w-full h-48 object-cover border-b"
              />

              <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] bg-slate-100 text-slate-700 font-bold px-2.5 py-0.5 rounded-full">
                      {item.source.toUpperCase()} listing
                    </span>
                    <span className="text-secondary text-sm font-black">
                      ₹{item.pricePerDay} / day
                    </span>
                  </div>
                  <h3 className="text-base font-bold text-slate-800">{item.equipmentType}</h3>
                  <p className="text-xs text-slate-500 font-light flex items-center space-x-1">
                    <MapPin size={12} className="text-slate-400" />
                    <span>{item.location}</span>
                  </p>
                </div>

                <button
                  onClick={() => setSelectedListing(item)}
                  className="w-full bg-primary hover:bg-emerald-950 text-white font-bold text-xs py-3 rounded-xl transition flex items-center justify-center space-x-1.5 active:scale-95"
                >
                  <span>{t('bookNow')}</span>
                  <ChevronRight size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Booking Dialog Modal */}
      {selectedListing && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-surface-lowest rounded-3xl w-full max-w-md p-6 border border-surface-highest shadow-2xl relative space-y-6 animate-in fade-in zoom-in-95 duration-200">
            <button
              onClick={() => setSelectedListing(null)}
              className="absolute right-4 top-4 text-slate-400 hover:text-slate-600"
            >
              <X size={20} />
            </button>

            <div className="space-y-1">
              <h3 className="text-lg font-black text-slate-800">Rent {selectedListing.equipmentType}</h3>
              <p className="text-xs text-slate-500 font-light">Custom Hiring Center, {selectedListing.district}</p>
            </div>

            {bookingSuccess ? (
              <div className="text-center py-6 space-y-4">
                <div className="p-3 bg-emerald-100 text-emerald-600 rounded-full inline-block">
                  <CheckCircle2 size={40} className="animate-bounce" />
                </div>
                <h4 className="font-bold text-emerald-800 text-sm">{t('confirmed')}</h4>
                <p className="text-xs text-slate-500">Redirecting to booking tracker...</p>
              </div>
            ) : (
              <div className="space-y-4">
                {bookingError && (
                  <div className="bg-red-50 text-red-800 text-xs font-semibold p-3 rounded-xl border border-red-100">
                    ⚠️ {bookingError}
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Start Date</label>
                    <input
                      type="date"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      className="w-full bg-slate-50 text-xs font-semibold border-0 focus:ring-2 focus:ring-secondary rounded-xl px-3 py-3 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">End Date</label>
                    <input
                      type="date"
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      className="w-full bg-slate-50 text-xs font-semibold border-0 focus:ring-2 focus:ring-secondary rounded-xl px-3 py-3 outline-none"
                    />
                  </div>
                </div>

                {startDate && endDate && (
                  <div className="bg-surface-low rounded-2xl p-4 border border-surface-highest flex items-center justify-between text-xs font-bold text-slate-800">
                    <span className="font-semibold text-slate-500">Calculated Quote:</span>
                    <span className="text-secondary text-sm">₹{calculateTotalPrice()}</span>
                  </div>
                )}

                <button
                  onClick={submitBooking}
                  disabled={bookingProgress || !startDate || !endDate}
                  className="w-full bg-primary hover:bg-emerald-950 text-white font-bold py-4 rounded-xl shadow-lg transition active:scale-95 disabled:opacity-50 text-xs"
                >
                  {bookingProgress ? tc('loading') : 'Confirm Rental Booking'}
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
