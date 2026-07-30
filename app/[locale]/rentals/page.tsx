'use client';

import React, { useState, useEffect } from 'react';
import { useLocale } from 'next-intl';
import { Search, MapPin, Tag, Star, Calendar, Clock, DollarSign, ShieldAlert, CheckCircle, ChevronRight } from 'lucide-react';
import Link from 'next/link';

interface Farmer {
  name: string;
  phone: string;
  village: string;
  district: string;
}

interface RentalReview {
  rating: number;
}

interface RentalListing {
  id: string;
  title: string;
  description: string;
  category: string;
  priceHour: number | null;
  priceDay: number | null;
  priceWeek: number | null;
  location: string;
  district: string;
  state: string;
  imageUrl: string | null;
  availabilityCalendar: string;
  owner: Farmer;
  reviews: RentalReview[];
}

export default function RentalsExplorerPage() {
  const locale = useLocale();
  const [listings, setListings] = useState<RentalListing[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters state
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedDistrict, setSelectedDistrict] = useState('all');

  // User session
  const [renterId, setRenterId] = useState<string | null>(null);

  // Booking Modal State
  const [selectedItem, setSelectedItem] = useState<RentalListing | null>(null);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [pricingModel, setPricingModel] = useState<'hour' | 'day' | 'week'>('day');
  const [hoursCount, setHoursCount] = useState('1'); // used if pricingModel is 'hour'
  const [bookingSubmitting, setBookingSubmitting] = useState(false);
  const [bookingSuccess, setBookingSuccess] = useState(false);
  const [bookingError, setBookingError] = useState('');

  useEffect(() => {
    // Read session cookie
    const id = document.cookie
      .split('; ')
      .find(row => row.startsWith('krishi_farmer_id='))
      ?.split('=')[1];

    if (id) {
      setRenterId(id);
    }
    fetchListings();
  }, []);

  const fetchListings = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/rentals');
      if (res.ok) {
        const data = await res.json();
        setListings(data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const calculateQuote = () => {
    if (!selectedItem) return 0;
    if (pricingModel === 'hour') {
      return (selectedItem.priceHour || 0) * parseInt(hoursCount || '1');
    }

    if (!startDate || !endDate) return 0;
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1; // inclusive

    if (pricingModel === 'day') {
      return (selectedItem.priceDay || 0) * diffDays;
    } else if (pricingModel === 'week') {
      const weeks = Math.ceil(diffDays / 7);
      return (selectedItem.priceWeek || 0) * weeks;
    }
    return 0;
  };

  const handleBookingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!renterId) {
      setBookingError('You must register/login to book items.');
      return;
    }
    if (!selectedItem) return;

    if (pricingModel !== 'hour' && (!startDate || !endDate)) {
      setBookingError('Please select a date range.');
      return;
    }

    setBookingSubmitting(true);
    setBookingError('');
    setBookingSuccess(false);

    // Calculate dates
    let finalStart = startDate;
    let finalEnd = endDate;

    if (pricingModel === 'hour') {
      // For hourly, just use today's date
      const todayStr = new Date().toISOString().split('T')[0];
      finalStart = todayStr;
      finalEnd = todayStr;
    }

    const price = calculateQuote();

    try {
      const res = await fetch('/api/rentals/book', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          listingId: selectedItem.id,
          renterId,
          startDate: finalStart,
          endDate: finalEnd,
          pricingType: pricingModel,
          totalPrice: price
        })
      });

      if (res.ok) {
        setBookingSuccess(true);
        setTimeout(() => {
          setSelectedItem(null);
          setBookingSuccess(false);
        }, 1500);
      } else {
        const errData = await res.json();
        setBookingError(errData.error || 'Failed to submit booking request.');
      }
    } catch (e) {
      setBookingError('Network error');
    } finally {
      setBookingSubmitting(false);
    }
  };

  // Get unique districts for filtering
  const districts = ['all', ...new Set(listings.map(l => l.district).filter(Boolean))];

  const filteredListings = listings.filter((l) => {
    const matchesSearch =
      l.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      l.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      l.location.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCategory = selectedCategory === 'all' || l.category === selectedCategory;
    const matchesDistrict = selectedDistrict === 'all' || l.district === selectedDistrict;

    return matchesSearch && matchesCategory && matchesDistrict;
  });

  return (
    <div className="space-y-8">
      {/* Intro strip */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div className="space-y-1">
          <span className="inline-block px-3 py-1 bg-secondary/15 text-secondary text-xs font-bold rounded-full">
            SHARING ECONOMY
          </span>
          <h2 className="text-3xl font-black text-primary tracking-tight">Browse Rentals Catalog</h2>
          <p className="text-xs text-slate-500 max-w-xl">
            Rent tractors, drills, electronics, vehicles, and toolkits directly from members of your regional community.
          </p>
        </div>

        <Link
          href={`/${locale}/rentals/new`}
          className="bg-primary text-white hover:bg-emerald-950 font-bold text-xs px-6 py-3 rounded-full shadow-md transition active:scale-95 flex items-center gap-1.5"
        >
          <span>List Your Own Item</span>
          <ChevronRight size={14} />
        </Link>
      </div>

      {/* Filter Bar */}
      <div className="bg-surface-lowest border border-surface-highest p-4 rounded-3xl shadow-sm flex flex-col md:flex-row items-center gap-4">
        <div className="w-full md:flex-1 relative">
          <Search size={18} className="absolute left-4 top-3 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search items, features, models..."
            className="w-full bg-slate-50 text-xs font-semibold border-0 focus:ring-2 focus:ring-secondary rounded-2xl pl-12 pr-4 py-3 outline-none"
          />
        </div>

        <div className="w-full md:w-56 relative">
          <MapPin size={18} className="absolute left-4 top-3 text-slate-400" />
          <select
            value={selectedDistrict}
            onChange={(e) => setSelectedDistrict(e.target.value)}
            className="w-full bg-slate-50 text-xs font-semibold border-0 focus:ring-2 focus:ring-secondary rounded-2xl pl-12 pr-4 py-3 outline-none appearance-none font-bold"
          >
            <option value="all">All Locations</option>
            {districts.filter(d => d !== 'all').map((d) => (
              <option key={d} value={d}>
                {d} Region
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Category selector chips */}
      <div className="flex space-x-2 overflow-x-auto pb-2 scrollbar-thin">
        {[
          { code: 'all', label: 'All Items' },
          { code: 'farm', label: 'Farm Equipment' },
          { code: 'tools', label: 'Tools & Hardware' },
          { code: 'electronics', label: 'Electronics & Gear' },
          { code: 'vehicles', label: 'Vehicles & Vans' },
          { code: 'other', label: 'Other Rentables' }
        ].map((cat) => (
          <button
            key={cat.code}
            onClick={() => setSelectedCategory(cat.code)}
            className={`whitespace-nowrap text-xs font-bold px-5 py-2.5 rounded-full border transition active:scale-95 ${
              selectedCategory === cat.code
                ? 'bg-secondary border-secondary text-white shadow-sm'
                : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Listings Grid */}
      {loading ? (
        <p className="text-center py-10 text-slate-500 text-sm">Loading market listings...</p>
      ) : filteredListings.length === 0 ? (
        <div className="bg-white border border-slate-100 rounded-3xl p-12 text-center text-slate-500 max-w-md mx-auto space-y-3">
          <ShieldAlert size={48} className="text-slate-300 mx-auto" />
          <p className="text-xs font-light">No rentable listings matching your filter criteria.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredListings.map((item) => {
            // Calculate average rating
            const totalReviews = item.reviews.length;
            const avgRating = totalReviews > 0
              ? (item.reviews.reduce((acc, r) => acc + r.rating, 0) / totalReviews).toFixed(1)
              : 'New';

            return (
              <div
                key={item.id}
                className="bg-surface-lowest border border-surface-highest rounded-3xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-200 flex flex-col justify-between"
              >
                <div>
                  <div className="relative h-48 bg-slate-100 border-b border-surface-highest">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={item.imageUrl || 'https://images.unsplash.com/photo-1599819811279-d5ad9cccf838?auto=format&fit=crop&q=80&w=400'}
                      alt={item.title}
                      className="w-full h-full object-cover"
                    />
                    <span className="absolute top-3 left-3 bg-white/90 backdrop-blur-md px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase text-secondary tracking-wider border border-white/20">
                      {item.category}
                    </span>
                  </div>

                  <div className="p-5 space-y-4">
                    <div className="space-y-1">
                      <div className="flex justify-between items-start gap-2">
                        <h4 className="font-bold text-primary text-base leading-snug">{item.title}</h4>
                        <div className="flex items-center gap-1 text-xs text-amber-500 font-bold bg-amber-50 px-2 py-0.5 rounded-lg flex-shrink-0">
                          <Star size={12} fill="currentColor" />
                          <span>{avgRating}</span>
                        </div>
                      </div>
                      <p className="text-xs text-slate-500 font-light line-clamp-2 leading-relaxed">
                        {item.description}
                      </p>
                    </div>

                    {/* Location strip */}
                    <div className="flex items-center space-x-1 text-[10px] text-slate-500 font-semibold">
                      <MapPin size={12} className="text-slate-400" />
                      <span>{item.location}, {item.district}</span>
                    </div>

                    {/* Pricing grid */}
                    <div className="bg-surface-low rounded-2xl p-3 border border-surface-highest grid grid-cols-3 gap-2 text-center text-[10px]">
                      <div>
                        <span className="text-slate-400 block font-light">Hour</span>
                        <span className="font-bold text-slate-800">{item.priceHour ? `₹${item.priceHour}` : '-'}</span>
                      </div>
                      <div className="border-x border-surface-highest">
                        <span className="text-slate-400 block font-light">Day</span>
                        <span className="font-bold text-slate-800">{item.priceDay ? `₹${item.priceDay}` : '-'}</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block font-light">Week</span>
                        <span className="font-bold text-slate-800">{item.priceWeek ? `₹${item.priceWeek}` : '-'}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="p-5 pt-0">
                  <button
                    onClick={() => {
                      setSelectedItem(item);
                      setBookingError('');
                      setBookingSuccess(false);
                      // Set default pricing model based on what is available
                      if (item.priceDay) setPricingModel('day');
                      else if (item.priceHour) setPricingModel('hour');
                      else if (item.priceWeek) setPricingModel('week');
                    }}
                    className="w-full bg-primary hover:bg-emerald-950 text-white font-bold text-xs py-3 rounded-xl transition active:scale-95 flex items-center justify-center space-x-1.5"
                  >
                    <span>Rent This Item</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Booking Drawer Modal */}
      {selectedItem && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-surface-lowest rounded-3xl w-full max-w-md p-6 border border-surface-highest shadow-2xl relative space-y-6 animate-in fade-in zoom-in-95 duration-200">
            <button
              onClick={() => setSelectedItem(null)}
              className="absolute right-4 top-4 text-slate-400 hover:text-slate-600 font-bold"
            >
              ✕
            </button>

            <div className="space-y-1">
              <h3 className="text-lg font-black text-primary">Rent: {selectedItem.title}</h3>
              <p className="text-xs text-slate-500 font-light">Owner: {selectedItem.owner?.name}</p>
            </div>

            {bookingSuccess ? (
              <div className="text-center py-6 space-y-3">
                <div className="p-3 bg-green-100 text-secondary rounded-full inline-block">
                  <CheckCircle size={40} className="animate-bounce" />
                </div>
                <h4 className="font-bold text-slate-800 text-sm">Booking Request Sent!</h4>
                <p className="text-xs text-slate-500">The owner will review and confirm shortly.</p>
              </div>
            ) : (
              <form onSubmit={handleBookingSubmit} className="space-y-4">
                {bookingError && (
                  <div className="bg-red-50 text-red-800 text-xs font-semibold p-3 rounded-xl border border-red-100">
                    ⚠️ {bookingError}
                  </div>
                )}

                {/* Pricing Model Option */}
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                    Select Pricing Model
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { type: 'hour', label: 'Hourly', val: selectedItem.priceHour },
                      { type: 'day', label: 'Daily', val: selectedItem.priceDay },
                      { type: 'week', label: 'Weekly', val: selectedItem.priceWeek }
                    ].map((model) => (
                      <button
                        key={model.type}
                        type="button"
                        disabled={!model.val}
                        onClick={() => setPricingModel(model.type as any)}
                        className={`py-2 rounded-xl text-xs font-bold border transition ${
                          !model.val 
                            ? 'opacity-40 cursor-not-allowed bg-slate-100 border-transparent text-slate-400'
                            : pricingModel === model.type
                              ? 'bg-secondary border-secondary text-white'
                              : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                        }`}
                      >
                        {model.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Conditional Inputs */}
                {pricingModel === 'hour' ? (
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                      Number of Hours Needed
                    </label>
                    <input
                      type="number"
                      min="1"
                      value={hoursCount}
                      onChange={(e) => setHoursCount(e.target.value)}
                      className="w-full bg-slate-50 text-xs font-semibold border-0 focus:ring-2 focus:ring-secondary rounded-xl px-4 py-3 outline-none font-bold"
                    />
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                        Start Date
                      </label>
                      <input
                        type="date"
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                        className="w-full bg-slate-50 text-xs font-semibold border-0 focus:ring-2 focus:ring-secondary rounded-xl px-4 py-3 outline-none"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                        End Date
                      </label>
                      <input
                        type="date"
                        value={endDate}
                        onChange={(e) => setEndDate(e.target.value)}
                        className="w-full bg-slate-50 text-xs font-semibold border-0 focus:ring-2 focus:ring-secondary rounded-xl px-4 py-3 outline-none"
                        required
                      />
                    </div>
                  </div>
                )}

                {/* Estimate Quote */}
                <div className="bg-surface-low rounded-2xl p-4 border border-surface-highest flex items-center justify-between text-xs font-bold text-slate-800">
                  <span className="font-semibold text-slate-500">Quotation Price:</span>
                  <span className="text-secondary text-sm">₹{calculateQuote()}</span>
                </div>

                <button
                  type="submit"
                  disabled={bookingSubmitting}
                  className="w-full bg-primary hover:bg-emerald-950 text-white font-bold py-3.5 rounded-xl shadow-lg transition active:scale-95 text-xs"
                >
                  {bookingSubmitting ? 'Sending Request...' : 'Submit Booking Request'}
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
