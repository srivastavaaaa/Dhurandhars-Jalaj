'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useTranslations, useLocale } from 'next-intl';
import { Sprout, BookOpen, ShieldCheck, Tractor, Warehouse, HelpCircle, ArrowRight, Languages, Search, Calendar, ExternalLink } from 'lucide-react';

interface Scheme {
  id: string;
  name: string;
  level: string;
  description: string;
  requiredDocuments: string;
  deadline: string | null;
  applyUrl: string;
  source: string;
}

export default function MarketingPage() {
  const locale = useLocale();
  const [schemes, setSchemes] = useState<Scheme[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('All');

  useEffect(() => {
    fetchSchemes();
  }, []);

  const fetchSchemes = async () => {
    try {
      const res = await fetch('/api/schemes');
      if (res.ok) {
        const data = await res.json();
        setSchemes(data);
      }
    } catch (e) {
      console.error('Failed to load schemes catalog:', e);
    } finally {
      setLoading(false);
    }
  };

  // Scroll to section helper
  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // Dispatch open chatbot event
  const triggerChatbot = () => {
    window.dispatchEvent(new CustomEvent('open-chatbot'));
  };

  // Filter schemes
  const filteredSchemes = schemes.filter((s) => {
    const matchesSearch =
      s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.source.toLowerCase().includes(searchQuery.toLowerCase());

    if (selectedFilter === 'All') return matchesSearch;
    if (selectedFilter === 'Insurance') {
      return matchesSearch && (s.name.toLowerCase().includes('insurance') || s.name.toLowerCase().includes('bima') || s.description.toLowerCase().includes('insurance'));
    }
    if (selectedFilter === 'Irrigation') {
      return matchesSearch && (s.name.toLowerCase().includes('irrigation') || s.name.toLowerCase().includes('sinchayee') || s.description.toLowerCase().includes('irrigation'));
    }
    if (selectedFilter === 'Financial Support') {
      return matchesSearch && (s.name.toLowerCase().includes('kisan') || s.name.toLowerCase().includes('nidhi') || s.name.toLowerCase().includes('bharosa') || s.name.toLowerCase().includes('loan') || s.name.toLowerCase().includes('karj'));
    }
    return matchesSearch;
  });

  return (
    <div className="flex-1 flex flex-col min-h-screen bg-background text-foreground">
      {/* Top Navigation Bar */}
      <header className="fixed top-0 left-0 w-full z-50 bg-white/90 backdrop-blur-md shadow-sm border-b border-slate-100">
        <nav className="max-w-7xl mx-auto flex justify-between items-center px-6 py-4">
          <div className="flex items-center space-x-2">
            <div className="p-2.5 bg-primary rounded-xl text-accent">
              <Sprout size={24} />
            </div>
            <div>
              <h1 className="text-xl font-black text-primary tracking-tight">KrishiMitra AI</h1>
              <p className="text-[10px] text-secondary font-semibold">कृषिमित्र • కృషిమిత్ర • கிருஷிமித்ரா</p>
            </div>
          </div>

          <div className="hidden md:flex items-center gap-8 font-semibold text-sm">
            <button
              onClick={() => scrollToSection('differentiators')}
              className="text-slate-500 hover:text-primary transition-colors cursor-pointer"
            >
              Services
            </button>
            <button
              onClick={() => scrollToSection('schemes-catalog')}
              className="text-slate-500 hover:text-primary transition-colors cursor-pointer"
            >
              Govt Schemes
            </button>
            <Link
              href={`/${locale}/rentals`}
              className="text-primary border-b-4 border-accent pb-1 cursor-pointer"
            >
              Universal Rentals
            </Link>
            <button
              onClick={triggerChatbot}
              className="text-slate-500 hover:text-primary transition-colors cursor-pointer"
            >
              AI Advisor
            </button>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href={`/${locale}/onboarding`}
              className="bg-primary text-white hover:bg-emerald-900 px-6 py-2.5 rounded-full font-bold text-sm flex items-center gap-2 hover:scale-105 active:scale-95 transition-all shadow-md"
            >
              SignUp <ArrowRight size={14} />
            </Link>
          </div>
        </nav>
      </header>

      {/* Main Hero Banner with Golden Sunset Indian Fields Background */}
      <main className="pt-16 flex-1">
        <section className="relative min-h-[80vh] flex items-center overflow-hidden">
          {/* Background Image */}
          <div className="absolute inset-0 z-0">
            <div
              className="w-full h-full bg-cover bg-center"
              style={{
                backgroundImage: `url('https://lh3.googleusercontent.com/aida-public/AB6AXuAHg2IU1P8_doTZPzyaCcz_rZsVY1QdSqeiIDCdJ5dIMaADUiA4C71wgheoEjLvqZssYQQEOo_Ft2vpMVCn5Kg4NYCgscfnxeDCp82NAfmlCyPsrpxAoB1t97CLXFF2oC-3ilXCZG2yjf02JW4k8AyChhOdVw3FWmpz2yg48kaEc3KAZhs9lrV7evL5fQmIHq0NdOv4lahD5LzcvtTlrdN0SAfLvIaOxJqoT50MaW_jDJ0xBt5sv-Iz2LgmTjS5jzJajiKgi-q6tqiQ3Wc')`
              }}
            />
            {/* Dark green overlay mask matching mockup */}
            <div className="absolute inset-0 bg-gradient-to-r from-primary/95 via-primary/70 to-transparent" />
          </div>

          <div className="relative z-10 max-w-7xl mx-auto px-6 py-16 md:py-24 grid md:grid-cols-2 gap-12 items-center">
            <div className="text-white space-y-8 animate-fade-in">
              <div className="inline-flex items-center gap-2 bg-accent/20 backdrop-blur-md px-4 py-1.5 rounded-full border border-accent/30">
                <span className="w-2 h-2 rounded-full bg-accent animate-pulse" />
                <span className="text-accent font-bold text-xs tracking-wider uppercase">FARMER EMPOWERMENT ENGINE</span>
              </div>
              
              <h2 className="text-3xl md:text-5xl lg:text-6xl font-black tracking-tight leading-none">
                Every farmer deserves the right advice, <span className="italic font-light text-accent">on time.</span>
              </h2>
              
              <p className="text-slate-200 text-sm md:text-lg font-light max-w-lg leading-relaxed">
                The intelligent site-wide companion for your farm. Unlock eligibility for central benefits, diagnose crop leaf pests, check cold-storage capacities, and schedule rental equipment.
              </p>

              {/* Language Selection Grid */}
              <div className="space-y-4">
                <p className="text-xs text-accent font-bold flex items-center space-x-1.5">
                  <Languages size={16} />
                  <span>SELECT LANGUAGE TO START / शुरू करने के लिए भाषा चुनें:</span>
                </p>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 max-w-md">
                  {[
                    { code: 'hi', label: 'हिन्दी', sub: 'Hindi' },
                    { code: 'mr', label: 'मराठी', sub: 'Marathi' },
                    { code: 'te', label: 'తెలుగు', sub: 'Telugu' },
                    { code: 'ta', label: 'தமிழ்', sub: 'Tamil' },
                    { code: 'kn', label: 'ಕನ್ನಡ', sub: 'Kannada' },
                    { code: 'or', label: 'ଓଡ଼ିଆ', sub: 'Odia' }
                  ].map((lang) => (
                    <Link
                      key={lang.code}
                      href={`/${lang.code}/onboarding`}
                      className="bg-white/10 hover:bg-white/20 border border-white/10 rounded-2xl p-3 transition text-center hover:scale-105 active:scale-95 duration-200 block"
                    >
                      <span className="block text-base font-bold text-white">{lang.label}</span>
                      <span className="text-[9px] text-slate-300 font-semibold">{lang.sub}</span>
                    </Link>
                  ))}
                  <Link
                    href="/en/onboarding"
                    className="bg-accent/90 hover:bg-accent text-primary rounded-2xl p-3 transition text-center col-span-2 sm:col-span-3 hover:scale-105 active:scale-95 duration-200 block font-bold text-sm"
                  >
                    Continue in English
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Trust Strip */}
        <section className="bg-white py-8 border-b border-slate-100 shadow-sm">
          <div className="max-w-7xl mx-auto px-6 text-center">
            <p className="text-primary text-xs font-black tracking-wider uppercase mb-3">TRUSTED RURAL EMPOWERMENT PARTNER</p>
            <div className="flex justify-center items-center gap-2 text-slate-500 text-xs italic font-medium">
              <ShieldCheck className="text-secondary" size={16} />
              <span>Registered Agriculture Extension Officers double-check crop diagnostic reviews.</span>
            </div>
          </div>
        </section>

        {/* Interactive Government Schemes Catalog Section */}
        <section id="schemes-catalog" className="bg-surface py-20 border-b border-slate-100 scroll-mt-16">
          <div className="max-w-7xl mx-auto px-6 space-y-12">
            <div className="text-center space-y-3">
              <span className="text-[10px] bg-secondary/10 border border-secondary/20 text-secondary px-3 py-1 rounded-full font-bold uppercase tracking-wider">
                Schemes Directory
              </span>
              <h3 className="text-2xl md:text-4xl font-extrabold text-primary tracking-tight">Government Schemes Catalog</h3>
              <p className="text-slate-500 max-w-lg mx-auto text-sm">
                Explore central and state schemes designed to support your crop cultivation, irrigation setups, and yield coverage.
              </p>
            </div>

            {/* Search and Filters */}
            <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-white p-5 rounded-3xl border border-slate-100 shadow-sm max-w-4xl mx-auto">
              <div className="relative w-full md:flex-1">
                <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search schemes by name or department..."
                  className="w-full pl-12 pr-4 py-3 bg-slate-50 border-0 focus:ring-2 focus:ring-secondary rounded-2xl text-xs font-semibold outline-none"
                />
              </div>

              <div className="flex flex-wrap gap-2 pt-2 md:pt-0">
                {['All', 'Financial Support', 'Irrigation', 'Insurance'].map((filter) => (
                  <button
                    key={filter}
                    onClick={() => setSelectedFilter(filter)}
                    className={`px-4 py-2 rounded-full border text-[11px] font-bold transition active:scale-95 ${
                      selectedFilter === filter
                        ? 'bg-secondary border-secondary text-white shadow-sm'
                        : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    {filter}
                  </button>
                ))}
              </div>
            </div>

            {/* Schemes Cards Grid */}
            {loading ? (
              <p className="text-center text-slate-500 text-sm py-10">Loading agricultural schemes...</p>
            ) : filteredSchemes.length === 0 ? (
              <div className="text-center py-10 bg-white border border-slate-100 rounded-3xl p-8 max-w-md mx-auto space-y-2">
                <HelpCircle size={40} className="text-slate-300 mx-auto animate-pulse" />
                <p className="text-xs text-slate-500 font-light">No matching schemes found. Adjust your search criteria.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
                {filteredSchemes.map((scheme) => {
                  const docList: string[] = JSON.parse(scheme.requiredDocuments);
                  return (
                    <div
                      key={scheme.id}
                      className="bg-surface-lowest border border-surface-highest rounded-3xl p-6 shadow-sm hover:shadow-md transition-all duration-200 flex flex-col justify-between"
                    >
                      <div className="space-y-4">
                        <div className="flex justify-between items-center">
                          <span className="bg-slate-100 text-slate-700 text-[10px] px-2.5 py-0.5 rounded-full font-bold">
                            {scheme.level} Scheme
                          </span>
                          <span className="text-[10px] text-slate-400 font-semibold">{scheme.source}</span>
                        </div>

                        <div className="space-y-1">
                          <h4 className="font-bold text-primary text-base leading-snug">{scheme.name}</h4>
                          <p className="text-xs text-slate-500 font-light leading-relaxed">{scheme.description}</p>
                        </div>

                        {/* Documents checklist */}
                        <div className="bg-surface-low rounded-2xl p-4 border border-surface-highest space-y-2">
                          <span className="text-[10px] font-bold text-slate-600 block uppercase tracking-wider">Required Documents:</span>
                          <div className="space-y-1">
                            {docList.map((doc, idx) => (
                              <div key={idx} className="flex items-center space-x-1.5 text-[10px] text-slate-700 font-medium">
                                <span className="text-secondary font-bold">✓</span>
                                <span>{doc}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>

                      <div className="border-t border-slate-50 pt-4 mt-6 flex items-center justify-between gap-4">
                        <div className="flex items-center space-x-1.5 text-[10px] text-slate-500 font-semibold">
                          <Calendar size={12} />
                          <span>
                            {scheme.deadline
                              ? `Deadline: ${new Date(scheme.deadline).toLocaleDateString()}`
                              : 'No deadline'}
                          </span>
                        </div>

                        <a
                          href={scheme.applyUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="bg-primary hover:bg-emerald-950 text-white font-bold text-[10px] px-4 py-2.5 rounded-xl transition flex items-center space-x-1"
                        >
                          <span>Apply Now</span>
                          <ExternalLink size={10} />
                        </a>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </section>

        {/* Core Differentiators Section */}
        <section id="differentiators" className="max-w-7xl mx-auto px-6 py-20 space-y-12">
          <div className="text-center space-y-3">
            <h3 className="text-2xl md:text-4xl font-extrabold text-primary tracking-tight">Services Integrated In-App</h3>
            <p className="text-slate-500 max-w-lg mx-auto text-sm">Empowering marginal farmers with high-stakes local tools, minimizing data and bandwidth overheads.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* AI Assistant Card */}
            <div
              onClick={triggerChatbot}
              className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm hover:shadow-md transition-all duration-200 hover:-translate-y-1 space-y-4 cursor-pointer"
            >
              <div className="w-12 h-12 bg-emerald-50 rounded-2xl flex items-center justify-center text-primary">
                <HelpCircle size={24} />
              </div>
              <h4 className="text-lg font-bold text-primary">Multilingual AI Chatbot</h4>
              <p className="text-xs text-slate-500 leading-relaxed">
                Persistent helper available site-wide. Click to ask questions, simulate speech transcription or send leaf disease uploads.
              </p>
            </div>

            {/* Scheme Intelligence Card */}
            <div
              onClick={() => scrollToSection('schemes-catalog')}
              className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm hover:shadow-md transition-all duration-200 hover:-translate-y-1 space-y-4 cursor-pointer"
            >
              <div className="w-12 h-12 bg-lime-50 rounded-2xl flex items-center justify-center text-secondary">
                <BookOpen size={24} />
              </div>
              <h4 className="text-lg font-bold text-primary">Eligibility Engine</h4>
              <p className="text-xs text-slate-500 leading-relaxed">
                Deterministic matching engine comparing land ownership and socio-category factors against Central and State schemes.
              </p>
            </div>

            {/* Post-Harvest Storage Card */}
            <Link
              href="/en/onboarding"
              className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm hover:shadow-md transition-all duration-200 hover:-translate-y-1 space-y-4 block"
            >
              <div className="w-12 h-12 bg-amber-50 rounded-2xl flex items-center justify-center text-amber-800">
                <Warehouse size={24} />
              </div>
              <h4 className="text-lg font-bold text-primary">Loss Risk Predictor</h4>
              <p className="text-xs text-slate-500 leading-relaxed">
                Predicts crop spoilage using local humidity/temperature and matches Mandi trends to recommend cold storage vs. sales.
              </p>
            </Link>

            {/* Equipment Marketplace Card */}
            <Link
              href="/en/onboarding"
              className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm hover:shadow-md transition-all duration-200 hover:-translate-y-1 space-y-4 block"
            >
              <div className="w-12 h-12 bg-purple-50 rounded-2xl flex items-center justify-center text-purple-800">
                <Tractor size={24} />
              </div>
              <h4 className="text-lg font-bold text-primary">Rentals Marketplace</h4>
              <p className="text-xs text-slate-500 leading-relaxed">
                Browse thresher and tractor inventories in seeded Custom Hiring Centers (CHCs) with availability booking calendars.
              </p>
            </Link>
          </div>
        </section>

        {/* Human-in-the-loop Trust banner */}
        <section className="bg-slate-100 py-16 border-y border-slate-200/50">
          <div className="max-w-4xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-6 text-center md:text-left">
            <div className="space-y-1">
              <h4 className="text-lg font-bold text-primary flex items-center justify-center md:justify-start space-x-2">
                <ShieldCheck className="text-secondary" size={20} />
                <span>Expert Verified Crop Health Advisory</span>
              </h4>
              <p className="text-xs text-slate-500 max-w-md">
                Pest/disease diagnoses with low AI scores are routed to regional agriculture workers for verification to prevent mistakes.
              </p>
            </div>
            <Link
              href="/onboarding"
              className="bg-primary hover:bg-emerald-950 text-white font-semibold text-xs px-6 py-3 rounded-full transition active:scale-95 shadow-sm"
            >
              Sign Up as Extension Agent
            </Link>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-400 text-xs py-8 text-center border-t border-slate-800">
        <p>© 2026 KrishiMitra AI Platform. Designed for Rural Digital Inclusion.</p>
      </footer>
    </div>
  );
}
