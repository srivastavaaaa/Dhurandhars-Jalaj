'use client';

import React, { useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useTranslations, useLocale } from 'next-intl';
import { Sprout, Phone, ShieldCheck, CheckCircle2, User, Landmark, Crop, MapPin } from 'lucide-react';

export default function OnboardingPage() {
  const t = useTranslations('onboarding');
  const tc = useTranslations('common');
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();

  // Wizard steps: 'auth' -> 'language' -> 'details' -> 'farm' -> 'consent' -> 'complete'
  const [step, setStep] = useState<'auth' | 'language' | 'details' | 'farm' | 'consent' | 'complete'>('auth');

  // Auth state
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);

  // Profile data state
  const [name, setName] = useState('');
  const [village, setVillage] = useState('');
  const [state, setState] = useState('Maharashtra'); // Default
  const [district, setDistrict] = useState('Wardha');   // Default matching our seeded pilot data
  const [landSize, setLandSize] = useState('2.5'); // Acres
  const [category, setCategory] = useState('General');

  // Farm & Crop details
  const [primaryCrop, setPrimaryCrop] = useState('Cotton');
  const [soilType, setSoilType] = useState('Black');
  const [irrigationType, setIrrigationType] = useState('Drip');

  // Consent
  const [consentGiven, setConsentGiven] = useState(false);
  const [submitError, setSubmitError] = useState('');

  // Handle changing language inside wizard
  const changeLanguage = (newLocale: string) => {
    // pathname format is /[locale]/onboarding
    const newPath = pathname.replace(`/${locale}`, `/${newLocale}`);
    router.replace(newPath);
  };

  const handleSendOtp = () => {
    if (phone.length < 10) {
      alert('Please enter a valid 10-digit mobile number');
      return;
    }
    setOtpSent(true);
  };

  const handleVerifyOtp = () => {
    if (otp.length < 6) {
      alert('Please enter a valid 6-digit OTP');
      return;
    }
    setIsVerifying(true);
    // Simulate API delay
    setTimeout(() => {
      setIsVerifying(false);
      setStep('language');
    }, 1000);
  };

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

  const handleSubmitProfile = async () => {
    if (!consentGiven) {
      setSubmitError('Consent is required to register your profile.');
      return;
    }

    try {
      const response = await fetch('/api/farmers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phone,
          name,
          preferredLanguage: locale,
          village,
          district,
          state,
          landSizeAcres: landSize,
          category,
          consentGiven,
          soilType,
          irrigationType,
          primaryCrop
        })
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Registration failed');
      }

      setStep('complete');
    } catch (err: any) {
      console.error(err);
      setSubmitError(err.message || 'Error occurred while saving profile');
    }
  };

  return (
    <div className="flex-1 flex flex-col justify-center items-center min-h-[80vh] px-4 py-8 bg-slate-50">
      <div className="w-full max-w-xl bg-white rounded-3xl border border-slate-100 shadow-xl overflow-hidden p-6 md:p-8 space-y-8 animate-in fade-in zoom-in-95 duration-200">

        {/* Logo and Progress Header */}
        <div className="flex flex-col items-center space-y-2 text-center">
          <div className="p-3 bg-emerald-600 rounded-2xl text-white inline-block">
            <Sprout size={32} />
          </div>
          <h2 className="text-2xl font-black text-slate-800 tracking-tight">{tc('title')}</h2>
          <p className="text-xs text-slate-500 max-w-sm">{t('subheading')}</p>
        </div>

        {/* Wizard Step Renderings */}
        {step === 'auth' && (
          <div className="space-y-6">
            <div className="flex items-center space-x-2 text-emerald-700 font-bold border-b border-slate-100 pb-2">
              <Phone size={20} />
              <span>{t('enterPhone')}</span>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1.5 uppercase tracking-wider">{tc('phone')}</label>
                <div className="relative">
                  <span className="absolute left-3.5 top-3.5 text-slate-400 text-sm font-semibold">+91</span>
                  <input
                    type="tel"
                    maxLength={10}
                    value={phone}
                    onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
                    placeholder="98765 43210"
                    disabled={otpSent}
                    className="w-full bg-slate-50 text-base font-semibold border-0 focus:ring-2 focus:ring-emerald-500 rounded-2xl pl-14 pr-4 py-3.5 outline-none"
                  />
                </div>
              </div>

              {otpSent && (
                <div className="space-y-2 animate-in slide-in-from-top-3">
                  <label className="block text-xs font-semibold text-slate-500 mb-1.5 uppercase tracking-wider">{t('verifyOtp')}</label>
                  <input
                    type="text"
                    maxLength={6}
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                    placeholder="123456"
                    className="w-full bg-slate-50 text-center text-lg font-bold letter-spacing-lg border-0 focus:ring-2 focus:ring-emerald-500 rounded-2xl py-3.5 outline-none tracking-widest"
                  />
                  <p className="text-[10px] text-emerald-600 font-medium">{t('otpSent')}</p>
                </div>
              )}
            </div>

            <button
              onClick={otpSent ? handleVerifyOtp : handleSendOtp}
              disabled={isVerifying}
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-4 rounded-2xl shadow-lg transition active:scale-95 disabled:opacity-50"
            >
              {isVerifying ? tc('loading') : (otpSent ? t('verifyOtp') : t('sendOtp'))}
            </button>
          </div>
        )}

        {step === 'language' && (
          <div className="space-y-6">
            <div className="flex items-center space-x-2 text-emerald-700 font-bold border-b border-slate-100 pb-2">
              <Sprout size={20} />
              <span>{t('preferredLanguage')}</span>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {[
                { code: 'hi', label: 'हिन्दी (Hindi)' },
                { code: 'mr', label: 'मराठी (Marathi)' },
                { code: 'te', label: 'తెలుగు (Telugu)' },
                { code: 'ta', label: 'தமிழ் (Tamil)' },
                { code: 'kn', label: 'ಕನ್ನಡ (Kannada)' },
                { code: 'or', label: 'ଓଡ଼ିଆ (Odia)' },
                { code: 'en', label: 'English' }
              ].map((lang) => (
                <button
                  key={lang.code}
                  onClick={() => changeLanguage(lang.code)}
                  className={`p-4 rounded-2xl border text-center transition font-semibold text-sm active:scale-95 ${locale === lang.code
                      ? 'bg-emerald-50 border-emerald-500 text-emerald-700 shadow-sm'
                      : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                >
                  {lang.label}
                </button>
              ))}
            </div>

            <button
              onClick={() => setStep('details')}
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-4 rounded-2xl shadow-lg transition active:scale-95"
            >
              Next / अगला
            </button>
          </div>
        )}

        {step === 'details' && (
          <div className="space-y-6">
            <div className="flex items-center space-x-2 text-emerald-700 font-bold border-b border-slate-100 pb-2">
              <User size={20} />
              <span>{tc('profile')}</span>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1.5 uppercase tracking-wider">{tc('name')}</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Ramrao Patil"
                  className="w-full bg-slate-50 text-sm font-semibold border-0 focus:ring-2 focus:ring-emerald-500 rounded-2xl px-4 py-3.5 outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1.5 uppercase tracking-wider">{tc('state')}</label>
                  <select
                    value={state}
                    onChange={(e) => handleStateChange(e.target.value)}
                    className="w-full bg-slate-50 text-sm font-semibold border-0 focus:ring-2 focus:ring-emerald-500 rounded-2xl px-4 py-3.5 outline-none"
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
                    className="w-full bg-slate-50 text-sm font-semibold border-0 focus:ring-2 focus:ring-emerald-500 rounded-2xl px-4 py-3.5 outline-none"
                  >
                    <option value={stateDistricts[state]}>{stateDistricts[state]}</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1.5 uppercase tracking-wider">{tc('village')}</label>
                <input
                  type="text"
                  value={village}
                  onChange={(e) => setVillage(e.target.value)}
                  placeholder="e.g. Sevagram"
                  className="w-full bg-slate-50 text-sm font-semibold border-0 focus:ring-2 focus:ring-emerald-500 rounded-2xl px-4 py-3.5 outline-none"
                />
              </div>
            </div>

            <div className="flex space-x-3">
              <button
                onClick={() => setStep('language')}
                className="w-1/3 bg-slate-100 hover:bg-slate-200 text-slate-600 font-semibold py-4 rounded-2xl transition"
              >
                Back
              </button>
              <button
                onClick={() => setStep('farm')}
                disabled={!name || !village}
                className="w-2/3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-4 rounded-2xl shadow-lg transition active:scale-95 disabled:opacity-50"
              >
                Next
              </button>
            </div>
          </div>
        )}

        {step === 'farm' && (
          <div className="space-y-6">
            <div className="flex items-center space-x-2 text-emerald-700 font-bold border-b border-slate-100 pb-2">
              <Landmark size={20} />
              <span>Farm & Land Details</span>
            </div>

            <div className="space-y-4">
              {/* Land Size Cards */}
              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-2 uppercase tracking-wider">{tc('landSize')}</label>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { val: '1.5', label: 'Small (< 2 ac)' },
                    { val: '3.5', label: 'Medium (2-5 ac)' },
                    { val: '7.5', label: 'Large (> 5 ac)' }
                  ].map((item) => (
                    <button
                      key={item.val}
                      onClick={() => setLandSize(item.val)}
                      type="button"
                      className={`p-3.5 rounded-2xl border text-center transition font-semibold text-xs active:scale-95 ${landSize === item.val
                          ? 'bg-emerald-50 border-emerald-500 text-emerald-700'
                          : 'bg-white border-slate-200 text-slate-500'
                        }`}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Farmer Category */}
              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-2 uppercase tracking-wider">{tc('category')}</label>
                <div className="grid grid-cols-4 gap-2">
                  {['General', 'OBC', 'SC', 'ST'].map((cat) => (
                    <button
                      key={cat}
                      onClick={() => setCategory(cat)}
                      type="button"
                      className={`p-2.5 rounded-2xl border text-center transition font-semibold text-xs active:scale-95 ${category === cat
                          ? 'bg-emerald-50 border-emerald-500 text-emerald-700'
                          : 'bg-white border-slate-200 text-slate-500'
                        }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

              {/* Crops Selection */}
              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-2 uppercase tracking-wider">{t('primaryCrops')}</label>
                <div className="grid grid-cols-3 gap-2">
                  {['Cotton', 'Chili', 'Rice', 'Wheat', 'Sugarcane', 'Turmeric'].map((crop) => (
                    <button
                      key={crop}
                      onClick={() => setPrimaryCrop(crop)}
                      type="button"
                      className={`p-2.5 rounded-2xl border text-center transition font-semibold text-xs active:scale-95 ${primaryCrop === crop
                          ? 'bg-emerald-50 border-emerald-500 text-emerald-700'
                          : 'bg-white border-slate-200 text-slate-500'
                        }`}
                    >
                      {crop}
                    </button>
                  ))}
                </div>
              </div>

              {/* Soil and Irrigation details */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1.5 uppercase tracking-wider">{t('soilType')}</label>
                  <select
                    value={soilType}
                    onChange={(e) => setSoilType(e.target.value)}
                    className="w-full bg-slate-50 text-xs font-semibold border-0 focus:ring-2 focus:ring-emerald-500 rounded-2xl px-3 py-3 outline-none"
                  >
                    <option value="Black">Black Soil</option>
                    <option value="Red">Red Soil</option>
                    <option value="Loam">Loam Soil</option>
                    <option value="Clay">Clay Soil</option>
                    <option value="Sandy">Sandy Soil</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1.5 uppercase tracking-wider">{t('irrigationType')}</label>
                  <select
                    value={irrigationType}
                    onChange={(e) => setIrrigationType(e.target.value)}
                    className="w-full bg-slate-50 text-xs font-semibold border-0 focus:ring-2 focus:ring-emerald-500 rounded-2xl px-3 py-3 outline-none"
                  >
                    <option value="Drip">Drip Irrigation</option>
                    <option value="Sprinkler">Sprinkler</option>
                    <option value="Rainfed">Rainfed (Rain only)</option>
                    <option value="Canal">Canal</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="flex space-x-3">
              <button
                onClick={() => setStep('details')}
                className="w-1/3 bg-slate-100 hover:bg-slate-200 text-slate-600 font-semibold py-4 rounded-2xl transition"
              >
                Back
              </button>
              <button
                onClick={() => setStep('consent')}
                className="w-2/3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-4 rounded-2xl shadow-lg transition active:scale-95"
              >
                Next
              </button>
            </div>
          </div>
        )}

        {step === 'consent' && (
          <div className="space-y-6">
            <div className="flex items-center space-x-2 text-emerald-700 font-bold border-b border-slate-100 pb-2">
              <ShieldCheck size={20} />
              <span>Security & Consent</span>
            </div>

            <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-100 space-y-3">
              <p className="text-xs text-emerald-800 leading-relaxed font-medium">
                {tc('consentDisclaimer')}
              </p>
              <p className="text-[10px] text-slate-500 leading-tight">
                Consent timestamped. You can edit your data or revoke access anytime from your profile settings.
              </p>
            </div>

            <div className="flex items-start space-x-3 pt-2">
              <input
                type="checkbox"
                id="consent-checkbox"
                checked={consentGiven}
                onChange={(e) => setConsentGiven(e.target.checked)}
                className="w-5 h-5 rounded text-emerald-600 border-slate-300 focus:ring-emerald-500 mt-0.5"
              />
              <label htmlFor="consent-checkbox" className="text-xs text-slate-600 font-medium leading-normal cursor-pointer select-none">
                {tc('consent')}
              </label>
            </div>

            {submitError && (
              <p className="text-xs text-red-600 font-medium bg-red-50 p-3 rounded-xl border border-red-100">
                ⚠️ {submitError}
              </p>
            )}

            <div className="flex space-x-3">
              <button
                onClick={() => setStep('farm')}
                className="w-1/3 bg-slate-100 hover:bg-slate-200 text-slate-600 font-semibold py-4 rounded-2xl transition"
              >
                Back
              </button>
              <button
                onClick={handleSubmitProfile}
                disabled={!consentGiven}
                className="w-2/3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-4 rounded-2xl shadow-lg transition active:scale-95 disabled:opacity-50"
              >
                Submit Profile
              </button>
            </div>
          </div>
        )}

        {step === 'complete' && (
          <div className="flex flex-col items-center space-y-6 text-center py-6">
            <div className="p-4 bg-emerald-100 rounded-full text-emerald-600">
              <CheckCircle2 size={48} className="animate-bounce" />
            </div>

            <div className="space-y-2">
              <h3 className="text-xl font-bold text-slate-800">{t('completed')}</h3>
              <p className="text-xs text-slate-500 max-w-sm">
                Your profile is now set up. Redirecting to your personal farming dashboard...
              </p>
            </div>

            <button
              onClick={() => router.push('/dashboard')}
              className="w-full max-w-xs bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-4 rounded-2xl shadow-lg transition active:scale-95"
            >
              Go to Dashboard
            </button>
          </div>
        )}

      </div>
    </div>
  );
}
