'use client';

import React, { useState, useEffect } from 'react';
import { useLocale } from 'next-intl';
import { Plus, ArrowLeft, Upload, Info, ShieldAlert } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function NewRentalListingPage() {
  const locale = useLocale();
  const router = useRouter();

  // Session
  const [ownerId, setOwnerId] = useState<string | null>(null);
  const [district, setDistrict] = useState('Wardha');
  const [state, setState] = useState('Maharashtra');

  // Form State
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('farm');
  const [priceHour, setPriceHour] = useState('');
  const [priceDay, setPriceDay] = useState('');
  const [priceWeek, setPriceWeek] = useState('');
  const [location, setLocation] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    // Read session
    const id = document.cookie
      .split('; ')
      .find(row => row.startsWith('krishi_farmer_id='))
      ?.split('=')[1];

    if (id) {
      setOwnerId(id);
      fetchFarmerDetails(id);
    }
  }, []);

  const fetchFarmerDetails = async (fid: string) => {
    try {
      const res = await fetch(`/api/farmers/${fid}`);
      if (res.ok) {
        const data = await res.json();
        setDistrict(data.district || 'Wardha');
        setState(data.state || 'Maharashtra');
        setLocation(data.village || '');
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!ownerId) {
      setError('You must be logged in to list items for rent.');
      return;
    }

    if (!title || !description || !category || !location) {
      setError('Please fill in all required fields.');
      return;
    }

    if (!priceHour && !priceDay && !priceWeek) {
      setError('Please specify at least one pricing rate (hourly, daily, or weekly).');
      return;
    }

    setSubmitting(true);
    setError('');
    setSuccess(false);

    try {
      const res = await fetch('/api/rentals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ownerId,
          title,
          description,
          category,
          priceHour: priceHour || null,
          priceDay: priceDay || null,
          priceWeek: priceWeek || null,
          location,
          district,
          state,
          imageUrl: imageUrl || null
        })
      });

      if (res.ok) {
        setSuccess(true);
        setTimeout(() => {
          router.push(`/${locale}/rentals`);
        }, 1500);
      } else {
        const errData = await res.json();
        setError(errData.error || 'Failed to list item.');
      }
    } catch (e) {
      setError('Network communication failed');
    } finally {
      setSubmitting(false);
    }
  };

  if (!ownerId) {
    return (
      <div className="max-w-md mx-auto py-16 text-center space-y-6">
        <ShieldAlert size={56} className="text-red-500 mx-auto" />
        <h3 className="text-xl font-black text-slate-800">Authentication Required</h3>
        <p className="text-xs text-slate-500 font-light">
          You need to register a user profile before you can list items in the universal marketplace.
        </p>
        <Link
          href={`/${locale}/onboarding`}
          className="block w-full bg-primary hover:bg-emerald-950 text-white font-bold py-3.5 rounded-2xl transition"
        >
          Register / Login Profile
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-xl mx-auto space-y-6">
      {/* Back link */}
      <Link
        href={`/${locale}/rentals`}
        className="inline-flex items-center space-x-1.5 text-xs text-secondary hover:text-primary font-bold"
      >
        <ArrowLeft size={14} />
        <span>Back to Market Catalog</span>
      </Link>

      <div className="bg-surface-lowest border border-surface-highest rounded-3xl p-6 shadow-sm space-y-6">
        <div className="space-y-1">
          <h3 className="text-xl font-black text-primary">List Item for Rent</h3>
          <p className="text-xs text-slate-500 font-light">
            Shed space, power equipment, utility vehicles, or electronic tools. Provide accurate pricing models.
          </p>
        </div>

        {error && (
          <div className="bg-red-50 text-red-800 text-xs font-semibold p-3 rounded-xl border border-red-100">
            ⚠️ {error}
          </div>
        )}

        {success && (
          <div className="bg-green-50 text-green-800 text-xs font-semibold p-3 rounded-xl border border-green-100">
            ✓ Item listed successfully! Redirecting to marketplace...
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
              Listing Title *
            </label>
            <input
              type="text"
              placeholder="e.g. Electric Rotary Tiller 1500W"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full bg-slate-50 text-xs font-semibold border-0 focus:ring-2 focus:ring-secondary rounded-xl px-4 py-3 outline-none"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                Category *
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full bg-slate-50 text-xs font-bold border-0 focus:ring-2 focus:ring-secondary rounded-xl px-3 py-3 outline-none"
              >
                <option value="farm">Farm Equipment</option>
                <option value="tools">Tools & Hardware</option>
                <option value="electronics">Electronics & Gear</option>
                <option value="vehicles">Vehicles & Vans</option>
                <option value="other">Other Rentables</option>
              </select>
            </div>

            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                Product Image URL
              </label>
              <input
                type="url"
                placeholder="e.g. https://domain.com/photo.jpg"
                value={imageUrl}
                onChange={(setImage) => setImageUrl(setImage.target.value)}
                className="w-full bg-slate-50 text-xs font-semibold border-0 focus:ring-2 focus:ring-secondary rounded-xl px-4 py-3 outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
              Item Description *
            </label>
            <textarea
              placeholder="Provide complete item specs, user guidelines, and pickup requirements..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="w-full bg-slate-50 text-xs font-semibold border-0 focus:ring-2 focus:ring-secondary rounded-xl px-4 py-3 outline-none"
              required
            />
          </div>

          {/* Pricing Tier Grid */}
          <div className="space-y-2">
            <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
              Pricing Options (Specify at least one)
            </label>
            
            <div className="grid grid-cols-3 gap-3">
              <div>
                <span className="text-[9px] text-slate-400 font-light block mb-1">INR / Hour</span>
                <input
                  type="number"
                  placeholder="e.g. 150"
                  value={priceHour}
                  onChange={(e) => setPriceHour(e.target.value)}
                  className="w-full bg-slate-50 text-xs font-semibold border-0 focus:ring-2 focus:ring-secondary rounded-xl px-3 py-3 outline-none font-bold"
                />
              </div>

              <div>
                <span className="text-[9px] text-slate-400 font-light block mb-1">INR / Day</span>
                <input
                  type="number"
                  placeholder="e.g. 900"
                  value={priceDay}
                  onChange={(e) => setPriceDay(e.target.value)}
                  className="w-full bg-slate-50 text-xs font-semibold border-0 focus:ring-2 focus:ring-secondary rounded-xl px-3 py-3 outline-none font-bold"
                />
              </div>

              <div>
                <span className="text-[9px] text-slate-400 font-light block mb-1">INR / Week</span>
                <input
                  type="number"
                  placeholder="e.g. 5000"
                  value={priceWeek}
                  onChange={(e) => setPriceWeek(e.target.value)}
                  className="w-full bg-slate-50 text-xs font-semibold border-0 focus:ring-2 focus:ring-secondary rounded-xl px-3 py-3 outline-none font-bold"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
              Pickup Address / Village Location *
            </label>
            <input
              type="text"
              placeholder="e.g. Wardha Sector 5 CHC hub"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="w-full bg-slate-50 text-xs font-semibold border-0 focus:ring-2 focus:ring-secondary rounded-xl px-4 py-3 outline-none"
              required
            />
          </div>

          <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100 flex items-start space-x-2 text-[10px] text-slate-500">
            <Info size={16} className="text-secondary mt-0.5 flex-shrink-0" />
            <p className="leading-normal">
              Your item will be listed in <strong>{district} District ({state} State)</strong> matching your profile context. You will review and approve each booking manually.
            </p>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full bg-primary hover:bg-emerald-950 text-white font-bold py-3.5 rounded-xl shadow-md transition active:scale-95 text-xs flex items-center justify-center space-x-1"
          >
            <Plus size={16} />
            <span>{submitting ? 'Creating Listing...' : 'Publish Listing'}</span>
          </button>
        </form>
      </div>
    </div>
  );
}
