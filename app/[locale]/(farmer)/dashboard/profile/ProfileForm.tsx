'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';

interface Farmer {
  id: string;
  name: string;
  phone: string;
  preferredLanguage: string;
  village: string;
  district: string;
  state: string;
  landSizeAcres: number;
  category: string;
}

export default function ProfileForm({ farmer }: { farmer: Farmer }) {
  const tc = useTranslations('common');
  const router = useRouter();

  const [name, setName] = useState(farmer.name);
  const [preferredLanguage, setPreferredLanguage] = useState(farmer.preferredLanguage);
  const [village, setVillage] = useState(farmer.village);
  const [state, setState] = useState(farmer.state);
  const [district, setDistrict] = useState(farmer.district);
  const [landSizeAcres, setLandSizeAcres] = useState(farmer.landSizeAcres.toString());
  const [category, setCategory] = useState(farmer.category);

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const stateDistricts: Record<string, string> = {
    'Maharashtra': 'Wardha',
    'Andhra Pradesh': 'Guntur',
    'Telangana': 'Warangal',
    'Tamil Nadu': 'Coimbatore',
    'Karnataka': 'Tumkur',
    'Odisha': 'Cuttack',
    'Uttar Pradesh': 'Bareilly'
  };

  const handleStateChange = (selectedState: string) => {
    setState(selectedState);
    setDistrict(stateDistricts[selectedState] || '');
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setSuccess(false);
    setError('');

    try {
      const response = await fetch(`/api/farmers/${farmer.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          preferredLanguage,
          village,
          district,
          state,
          landSizeAcres,
          category
        })
      });

      if (!response.ok) {
        throw new Error('Failed to update profile');
      }

      setSuccess(true);
      router.refresh();
    } catch (err: any) {
      setError(err.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSave} className="space-y-6">
      <h3 className="text-base font-bold text-slate-800 border-b border-slate-100 pb-3">Edit Details</h3>

      {success && (
        <div className="bg-emerald-50 text-emerald-800 text-xs font-semibold p-4 rounded-xl border border-emerald-100">
          ✓ Profile updated successfully!
        </div>
      )}

      {error && (
        <div className="bg-red-50 text-red-800 text-xs font-semibold p-4 rounded-xl border border-red-100">
          ⚠️ {error}
        </div>
      )}

      <div className="space-y-4">
        <div>
          <label className="block text-xs font-semibold text-slate-500 mb-1.5 uppercase tracking-wider">{tc('name')}</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            className="w-full bg-slate-50 text-sm font-semibold border-0 focus:ring-2 focus:ring-emerald-500 rounded-2xl px-4 py-3 outline-none"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-500 mb-1.5 uppercase tracking-wider">{tc('state')}</label>
            <select
              value={state}
              onChange={(e) => handleStateChange(e.target.value)}
              className="w-full bg-slate-50 text-sm font-semibold border-0 focus:ring-2 focus:ring-emerald-500 rounded-2xl px-4 py-3 outline-none"
            >
              {Object.keys(stateDistricts).map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-500 mb-1.5 uppercase tracking-wider">{tc('district')}</label>
            <select
              value={district}
              onChange={(e) => setDistrict(e.target.value)}
              className="w-full bg-slate-50 text-sm font-semibold border-0 focus:ring-2 focus:ring-emerald-500 rounded-2xl px-4 py-3 outline-none"
            >
              <option value={stateDistricts[state]}>{stateDistricts[state]}</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-500 mb-1.5 uppercase tracking-wider">{tc('village')}</label>
            <input
              type="text"
              value={village}
              onChange={(e) => setVillage(e.target.value)}
              required
              className="w-full bg-slate-50 text-sm font-semibold border-0 focus:ring-2 focus:ring-emerald-500 rounded-2xl px-4 py-3 outline-none"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-500 mb-1.5 uppercase tracking-wider">{tc('landSize')}</label>
            <input
              type="number"
              step="0.1"
              value={landSizeAcres}
              onChange={(e) => setLandSizeAcres(e.target.value)}
              required
              className="w-full bg-slate-50 text-sm font-semibold border-0 focus:ring-2 focus:ring-emerald-500 rounded-2xl px-4 py-3 outline-none"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-500 mb-1.5 uppercase tracking-wider">{tc('category')}</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full bg-slate-50 text-sm font-semibold border-0 focus:ring-2 focus:ring-emerald-500 rounded-2xl px-4 py-3 outline-none"
            >
              <option value="General">General</option>
              <option value="OBC">OBC</option>
              <option value="SC">SC</option>
              <option value="ST">ST</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-500 mb-1.5 uppercase tracking-wider">{tc('language')}</label>
            <select
              value={preferredLanguage}
              onChange={(e) => setPreferredLanguage(e.target.value)}
              className="w-full bg-slate-50 text-sm font-semibold border-0 focus:ring-2 focus:ring-emerald-500 rounded-2xl px-4 py-3 outline-none"
            >
              <option value="en">English</option>
              <option value="hi">हिन्दी (Hindi)</option>
              <option value="mr">मराठी (Marathi)</option>
              <option value="te">తెలుగు (Telugu)</option>
              <option value="ta">தமிழ் (Tamil)</option>
              <option value="kn">ಕನ್ನಡ (Kannada)</option>
              <option value="or">ଓଡ଼ିଆ (Odia)</option>
            </select>
          </div>
        </div>
      </div>

      <div className="flex justify-end pt-4">
        <button
          type="submit"
          disabled={loading}
          className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-6 py-3 rounded-xl shadow-md shadow-emerald-600/10 active:scale-95 disabled:opacity-50 transition"
        >
          {loading ? tc('loading') : tc('save')}
        </button>
      </div>
    </form>
  );
}
