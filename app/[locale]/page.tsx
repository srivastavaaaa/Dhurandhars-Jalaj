import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { Sprout, BookOpen, ShieldCheck, Tractor, Warehouse, HelpCircle, ArrowRight, Languages } from 'lucide-react';

export default function MarketingPage() {
  // Translate common and common fields
  // In our messages, we have "common.title", "common.tagline", etc.
  return (
    <div className="flex-1 flex flex-col min-h-screen bg-slate-50">
      {/* Navbar */}
      <header className="bg-white/80 backdrop-blur-md sticky top-0 z-40 border-b border-slate-100 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <div className="p-2 bg-emerald-600 rounded-xl text-white">
            <Sprout size={24} />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-800 tracking-tight">KrishiMitra AI</h1>
            <p className="text-[10px] text-emerald-600 font-medium">कृषिमित्र • కృషిమిత్ర • கிருஷிமித்ரா</p>
          </div>
        </div>

        <div className="flex items-center space-x-4">
          <Link
            href="/onboarding"
            className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-sm px-5 py-2.5 rounded-xl transition shadow-md shadow-emerald-600/10 active:scale-95"
          >
            Get Started / शुरू करें
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1">
        <section className="relative px-6 py-20 md:py-32 overflow-hidden bg-gradient-to-br from-emerald-950 via-emerald-900 to-slate-900 text-white text-center">
          {/* Decorative mesh */}
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-emerald-500/20 via-transparent to-transparent opacity-50 pointer-events-none" />

          <div className="max-w-3xl mx-auto space-y-6 relative z-10">
            <span className="inline-flex items-center space-x-1.5 px-3 py-1 bg-emerald-500/20 border border-emerald-500/30 rounded-full text-xs font-semibold tracking-wider text-emerald-400 uppercase">
              🇮🇳 Dedicated to Indian Smallholder Farmers
            </span>
            
            <h2 className="text-4xl md:text-6xl font-black tracking-tight leading-none">
              Grow Smarter with <span className="text-emerald-400">KrishiMitra AI</span>
            </h2>
            
            <p className="text-base md:text-xl text-slate-300 font-light max-w-xl mx-auto">
              Personalized government schemes, crop health diagnostics, post-harvest advice, and equipment rental in your own language.
            </p>

            {/* Language Selector / Touch Targets */}
            <div className="pt-8">
              <p className="text-xs text-emerald-400 font-semibold mb-4 flex items-center justify-center space-x-1">
                <Languages size={14} />
                <span>SELECT YOUR LANGUAGE / अपनी भाषा चुनें</span>
              </p>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 max-w-2xl mx-auto">
                <Link href="/hi/onboarding" className="bg-white/10 hover:bg-white/20 border border-white/10 rounded-2xl p-4 transition text-center hover:scale-105 active:scale-95">
                  <span className="block text-lg font-bold">हिन्दी</span>
                  <span className="text-[10px] text-slate-400">Hindi</span>
                </Link>
                <Link href="/mr/onboarding" className="bg-white/10 hover:bg-white/20 border border-white/10 rounded-2xl p-4 transition text-center hover:scale-105 active:scale-95">
                  <span className="block text-lg font-bold">मराठी</span>
                  <span className="text-[10px] text-slate-400">Marathi</span>
                </Link>
                <Link href="/te/onboarding" className="bg-white/10 hover:bg-white/20 border border-white/10 rounded-2xl p-4 transition text-center hover:scale-105 active:scale-95">
                  <span className="block text-lg font-bold">తెలుగు</span>
                  <span className="text-[10px] text-slate-400">Telugu</span>
                </Link>
                <Link href="/ta/onboarding" className="bg-white/10 hover:bg-white/20 border border-white/10 rounded-2xl p-4 transition text-center hover:scale-105 active:scale-95">
                  <span className="block text-lg font-bold">தமிழ்</span>
                  <span className="text-[10px] text-slate-400">Tamil</span>
                </Link>
                <Link href="/kn/onboarding" className="bg-white/10 hover:bg-white/20 border border-white/10 rounded-2xl p-4 transition text-center hover:scale-105 active:scale-95">
                  <span className="block text-lg font-bold">ಕನ್ನಡ</span>
                  <span className="text-[10px] text-slate-400">Kannada</span>
                </Link>
                <Link href="/or/onboarding" className="bg-white/10 hover:bg-white/20 border border-white/10 rounded-2xl p-4 transition text-center hover:scale-105 active:scale-95">
                  <span className="block text-lg font-bold">ଓଡ଼ିଆ</span>
                  <span className="text-[10px] text-slate-400">Odia</span>
                </Link>
                <Link href="/en/onboarding" className="bg-white/10 hover:bg-white/20 border border-white/10 rounded-2xl p-4 transition text-center col-span-2 md:col-span-2 hover:scale-105 active:scale-95">
                  <span className="block text-lg font-bold">English</span>
                  <span className="text-[10px] text-slate-400">Default fallback</span>
                </Link>
              </div>
            </div>

            <div className="pt-6">
              <Link
                href="/en/onboarding"
                className="inline-flex items-center space-x-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold px-8 py-4 rounded-2xl transition shadow-lg shadow-emerald-500/20 active:scale-95"
              >
                <span>Register Farm Profile</span>
                <ArrowRight size={18} />
              </Link>
            </div>
          </div>
        </section>

        {/* Feature Cards Grid */}
        <section className="max-w-6xl mx-auto px-6 py-20 space-y-12">
          <div className="text-center space-y-3">
            <h3 className="text-2xl md:text-4xl font-extrabold text-slate-800 tracking-tight">Core Differentiators</h3>
            <p className="text-slate-500 max-w-lg mx-auto text-sm">Everything built directly inside the website for low digital literacy and low bandwidth.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* AI Assistant */}
            <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm hover:shadow-md transition space-y-4">
              <div className="w-12 h-12 bg-emerald-100 rounded-2xl flex items-center justify-center text-emerald-700">
                <HelpCircle size={24} />
              </div>
              <h4 className="text-lg font-bold text-slate-800">Site-wide AI Assistant</h4>
              <p className="text-xs text-slate-500 leading-relaxed">
                Persistent in-app chat helper. Simulates voice input and crop disease diagnosis via photo upload.
              </p>
            </div>

            {/* Scheme Intelligence */}
            <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm hover:shadow-md transition space-y-4">
              <div className="w-12 h-12 bg-blue-100 rounded-2xl flex items-center justify-center text-blue-700">
                <BookOpen size={24} />
              </div>
              <h4 className="text-lg font-bold text-slate-800">Scheme Matching</h4>
              <p className="text-xs text-slate-500 leading-relaxed">
                Deterministic rules-engine matching your farm profile to Central & State schemes with document checklists.
              </p>
            </div>

            {/* Post-Harvest Advisor */}
            <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm hover:shadow-md transition space-y-4">
              <div className="w-12 h-12 bg-amber-100 rounded-2xl flex items-center justify-center text-amber-700">
                <Warehouse size={24} />
              </div>
              <h4 className="text-lg font-bold text-slate-800">Storage Advisor</h4>
              <p className="text-xs text-slate-500 leading-relaxed">
                Predicts crop spoilage risks and matches local mandi price trends to advise when to store vs. sell.
              </p>
            </div>

            {/* Equipment Marketplace */}
            <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm hover:shadow-md transition space-y-4">
              <div className="w-12 h-12 bg-purple-100 rounded-2xl flex items-center justify-center text-purple-700">
                <Tractor size={24} />
              </div>
              <h4 className="text-lg font-bold text-slate-800">Equipment Rental</h4>
              <p className="text-xs text-slate-500 leading-relaxed">
                Solves cold start via seeded Custom Hiring Center (CHC) equipment. Easy booking calendar.
              </p>
            </div>
          </div>
        </section>

        {/* Human-in-the-loop Trust banner */}
        <section className="bg-slate-100 py-12 border-y border-slate-200/50">
          <div className="max-w-4xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-6 text-center md:text-left">
            <div className="space-y-1">
              <h4 className="text-lg font-bold text-slate-800 flex items-center justify-center md:justify-start space-x-2">
                <ShieldCheck className="text-emerald-600" size={20} />
                <span>Expert Verified Advisory</span>
              </h4>
              <p className="text-xs text-slate-500 max-w-md">
                Any AI crop diagnosis below 70% confidence is automatically routed to human extension agents for review before displaying.
              </p>
            </div>
            <Link
              href="/onboarding"
              className="bg-slate-800 hover:bg-slate-900 text-white font-semibold text-xs px-5 py-3 rounded-xl transition"
            >
              Sign Up as Agent / Officer
            </Link>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-400 text-xs py-8 text-center border-t border-slate-800">
        <p>© 2026 KrishiMitra AI Platform. Designed for Rural Empowerment.</p>
      </footer>
    </div>
  );
}
