'use client';

import React, { useState, useEffect } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { BookOpen, CheckCircle, ShieldAlert, Award, FileText, Calendar, ExternalLink } from 'lucide-react';
import Link from 'next/link';

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

interface Match {
  id: string;
  scheme: Scheme;
  eligibilityScore: number;
  status: string;
  reasons: string[];
}

export default function SchemesPage() {
  const t = useTranslations('schemes');
  const tc = useTranslations('common');
  const locale = useLocale();

  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);
  const [farmerId, setFarmerId] = useState<string | null>(null);

  // Keep track of document checklist state (schemeId -> documentIndex -> checked)
  const [checklist, setChecklist] = useState<Record<string, Record<number, boolean>>>({});

  // Read farmerId from cookies on mount
  useEffect(() => {
    const id = document.cookie
      .split('; ')
      .find(row => row.startsWith('krishi_farmer_id='))
      ?.split('=')[1];
    
    if (id) {
      setFarmerId(id);
      fetchMatches(id);
    } else {
      setLoading(false);
    }
  }, []);

  const fetchMatches = async (id: string) => {
    try {
      const res = await fetch(`/api/schemes/match/${id}`);
      const data = await res.json();
      if (Array.isArray(data)) {
        setMatches(data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleApply = async (schemeId: string, applyUrl: string) => {
    try {
      const res = await fetch(`/api/schemes/${schemeId}/apply`, {
        method: 'POST'
      });

      if (res.ok) {
        // Open official application form in new window
        window.open(applyUrl, '_blank');
        
        // Refresh matches list
        if (farmerId) fetchMatches(farmerId);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const toggleDocument = (schemeId: string, docIndex: number) => {
    setChecklist(prev => {
      const schemeDocs = prev[schemeId] || {};
      return {
        ...prev,
        [schemeId]: {
          ...schemeDocs,
          [docIndex]: !schemeDocs[docIndex]
        }
      };
    });
  };

  return (
    <div className="max-w-4xl mx-auto px-6 py-10 space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-slate-200 pb-5 gap-4">
        <div className="space-y-1">
          <h2 className="text-2xl font-black text-primary flex items-center space-x-2">
            <BookOpen size={28} className="text-secondary" />
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
          ← {isLocaleEn(locale) ? 'Dashboard' : 'डैशबोर्ड'}
        </Link>
      </div>

      {/* Official Disclaimer Banner */}
      <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-start space-x-3">
        <ShieldAlert className="text-amber-600 flex-shrink-0 mt-0.5" size={20} />
        <div>
          <h4 className="text-xs font-bold text-amber-800">Official Disclaimer</h4>
          <p className="text-[10px] text-amber-700 leading-normal font-light">
            {t('disclaimer')}
          </p>
        </div>
      </div>

      {loading ? (
        <p className="text-center py-10 text-slate-500 text-sm">{tc('loading')}</p>
      ) : matches.length === 0 ? (
        <div className="bg-white border border-slate-100 rounded-3xl p-12 text-center text-slate-500 space-y-4">
          <ShieldAlert size={48} className="text-slate-300 mx-auto" />
          <p className="text-xs font-light">No eligible schemes matching your land/crop profile found.</p>
          <Link href="/dashboard/profile" className="text-xs font-semibold text-secondary underline">
            Edit profile to re-verify rules
          </Link>
        </div>
      ) : (
        <div className="space-y-6">
          {matches.map((match) => {
            const scheme = match.scheme;
            const docList: string[] = JSON.parse(scheme.requiredDocuments);
            const reasons = match.reasons || [];
            const schemeChecklist = checklist[scheme.id] || {};
            
            return (
              <div key={match.id} className="bg-surface-lowest border border-surface-highest rounded-3xl p-6 shadow-sm space-y-6 hover:shadow-md transition">
                {/* Upper block */}
                <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2 flex-wrap gap-y-1">
                      <span className="bg-slate-100 text-slate-700 text-[10px] px-2.5 py-0.5 rounded-full font-semibold">
                        {scheme.level} Scheme
                      </span>
                      <span className="bg-accent/20 text-secondary text-[10px] px-2.5 py-0.5 rounded-full font-semibold flex items-center space-x-1">
                        <Award size={10} />
                        <span>Match: {match.eligibilityScore}%</span>
                      </span>
                      {match.status === 'applied' && (
                        <span className="bg-blue-50 text-blue-700 text-[10px] px-2.5 py-0.5 rounded-full font-semibold">
                          ✓ Applied
                        </span>
                      )}
                    </div>
                    <h3 className="text-lg font-bold text-slate-800">{scheme.name}</h3>
                    <p className="text-xs text-slate-500 font-light leading-relaxed">{scheme.description}</p>
                    
                    {/* Matching criteria list */}
                    <div className="pt-2 text-[10px] text-slate-600 font-medium space-y-1">
                      {reasons.map((r, i) => (
                        <div key={i} className="flex items-center space-x-1.5">
                          <span className="text-secondary">✓</span>
                          <span>{r}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="flex-shrink-0 flex flex-col items-start md:items-end space-y-1 text-xs">
                    <span className="text-slate-400">Department</span>
                    <span className="font-semibold text-slate-800 text-right">{scheme.source}</span>
                  </div>
                </div>

                {/* Documents checklist (interactive) */}
                <div className="bg-surface-low rounded-2xl p-4 border border-surface-highest space-y-3">
                  <h4 className="text-xs font-bold text-slate-700 flex items-center space-x-1.5">
                    <FileText size={16} className="text-slate-400" />
                    <span>{t('requiredDocs')} Checklists</span>
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {docList.map((doc, idx) => (
                      <div
                        key={idx}
                        onClick={() => toggleDocument(scheme.id, idx)}
                        className="flex items-center space-x-2.5 p-2 bg-white rounded-xl border border-slate-100 hover:bg-slate-50 transition cursor-pointer select-none"
                      >
                        <input
                          type="checkbox"
                          checked={!!schemeChecklist[idx]}
                          readOnly
                          className="w-4 h-4 rounded text-secondary border-surface-highest focus:ring-secondary"
                        />
                        <span className={`text-[11px] font-medium ${schemeChecklist[idx] ? 'line-through text-slate-400' : 'text-slate-700'}`}>
                          {doc}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Footer action */}
                <div className="flex items-center justify-between flex-wrap gap-4 pt-2 border-t border-slate-50">
                  <div className="flex items-center space-x-2 text-[11px] text-slate-500 font-light">
                    <Calendar size={14} className="text-slate-400" />
                    <span>
                      {scheme.deadline 
                        ? `${t('deadline')}: ${new Date(scheme.deadline).toLocaleDateString()}` 
                        : 'No active deadline'}
                    </span>
                  </div>

                  <button
                    onClick={() => handleApply(scheme.id, scheme.applyUrl)}
                    className="flex items-center space-x-1.5 bg-primary hover:bg-emerald-950 text-white font-bold text-xs px-5 py-3 rounded-xl transition"
                  >
                    <span>{t('applyNow')}</span>
                    <ExternalLink size={14} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function isLocaleEn(locale: string) {
  return locale === 'en';
}
