'use client';

import React, { useState, useEffect } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { Warehouse, AlertTriangle, ShieldCheck, Flame, TrendingUp, Thermometer, Droplets, MapPin, Phone } from 'lucide-react';
import Link from 'next/link';

interface Facility {
  id: string;
  name: string;
  district: string;
  state: string;
  location: string;
  capacity: string;
  contactInfo: string;
  costPerUnit: number;
  latitude: number | null;
  longitude: number | null;
}

interface PricePoint {
  month: string;
  price: number;
}

interface RiskResult {
  spoilageRiskScore: number;
  recommendedStorageDays: number;
  recommendedAction: 'sell' | 'store';
  reasons: string[];
}

export default function HarvestAdvisorPage() {
  const t = useTranslations('harvest');
  const tc = useTranslations('common');
  const locale = useLocale();

  const [farmerId, setFarmerId] = useState<string | null>(null);
  const [district, setDistrict] = useState('Wardha');
  const [cropName, setCropName] = useState('Cotton');
  const [cropId, setCropId] = useState<string | null>(null);

  // States
  const [facilities, setFacilities] = useState<Facility[]>([]);
  const [priceTrend, setPriceTrend] = useState<PricePoint[]>([]);
  const [riskResult, setRiskResult] = useState<RiskResult | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Read user registration / profile context from cookies
    const id = document.cookie
      .split('; ')
      .find(row => row.startsWith('krishi_farmer_id='))
      ?.split('=')[1];
    
    if (id) {
      setFarmerId(id);
      fetchFarmerContext(id);
    } else {
      // Demo default values
      fetchData('Cotton', 'Wardha');
    }
  }, []);

  const fetchFarmerContext = async (id: string) => {
    try {
      const res = await fetch(`/api/farmers/${id}`);
      const data = await res.json();
      if (data && data.farms?.[0]) {
        const farm = data.farms[0];
        const crop = farm.crops?.[0];
        
        setDistrict(data.district);
        if (crop) {
          setCropName(crop.cropName);
          setCropId(crop.id);
          fetchData(crop.cropName, data.district, crop.id);
        } else {
          fetchData('Cotton', data.district);
        }
      } else {
        fetchData('Cotton', 'Wardha');
      }
    } catch (e) {
      console.error(e);
      fetchData('Cotton', 'Wardha');
    }
  };

  const fetchData = async (crop: string, dist: string, cid?: string) => {
    setLoading(true);
    try {
      // 1. Fetch facilities
      const facRes = await fetch(`/api/postharvest/storage-facilities?district=${dist}`);
      const facData = await facRes.json();
      if (Array.isArray(facData)) setFacilities(facData);

      // 2. Fetch price trends
      const priceRes = await fetch(`/api/postharvest/price-trend?crop=${crop}&district=${dist}`);
      const priceData = await priceRes.json();
      if (priceData && priceData.trendPoints) setPriceTrend(priceData.trendPoints);

      // 3. Fetch or run risk score
      if (cid) {
        const riskRes = await fetch(`/api/postharvest/risk/${cid}`);
        const riskData = await riskRes.json();
        if (riskData && riskData.riskResult) {
          setRiskResult(riskData.riskResult);
        }
      } else {
        // Fallback simulated risk
        setRiskResult({
          spoilageRiskScore: 35,
          recommendedStorageDays: 120,
          recommendedAction: 'store',
          reasons: [
            'Stored in well ventilated spaces.',
            'Moderate ambient humidity.',
            'Prices expected to rise in the next 60 days.'
          ]
        });
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  // SVG Chart Dimensions & Computations
  const chartHeight = 160;
  const chartWidth = 500;
  const padding = 30;

  const prices = priceTrend.map(p => p.price);
  const maxPrice = prices.length ? Math.max(...prices) * 1.05 : 10000;
  const minPrice = prices.length ? Math.min(...prices) * 0.95 : 1000;
  const priceRange = maxPrice - minPrice;

  const points = priceTrend.map((pt, index) => {
    const x = padding + (index * (chartWidth - padding * 2)) / (priceTrend.length - 1);
    const y = chartHeight - padding - ((pt.price - minPrice) * (chartHeight - padding * 2)) / priceRange;
    return `${x},${y}`;
  }).join(' ');

  // Spoilage gauge calculations
  const riskScore = riskResult?.spoilageRiskScore || 0;
  const gaugeColor = riskScore < 30 
    ? 'text-emerald-500 bg-emerald-50 border-emerald-200' 
    : riskScore < 60 
      ? 'text-amber-500 bg-amber-50 border-amber-200' 
      : 'text-red-500 bg-red-50 border-red-200';

  return (
    <div className="max-w-4xl mx-auto px-6 py-10 space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-slate-200 pb-5 gap-4">
        <div className="space-y-1">
          <h2 className="text-2xl font-black text-primary flex items-center space-x-2">
            <Warehouse size={28} className="text-secondary" />
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

      {loading ? (
        <p className="text-center py-10 text-slate-500 text-sm">{tc('loading')}</p>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Spoilage Risk & Advisory Column */}
          <div className="lg:col-span-1 space-y-6">
            <div className={`border rounded-3xl p-6 shadow-sm space-y-6 ${gaugeColor}`}>
              <div className="text-center space-y-2">
                <span className="text-[10px] font-bold uppercase tracking-wider block opacity-70">
                  {t('spoilageRisk')}
                </span>
                
                {/* Spoilage Gauge Ring */}
                <div className="relative w-36 h-36 mx-auto flex items-center justify-center">
                  {/* Background Circle */}
                  <svg className="w-full h-full transform -rotate-90">
                    <circle
                      cx="72"
                      cy="72"
                      r="58"
                      className="stroke-current opacity-10"
                      strokeWidth="12"
                      fill="transparent"
                    />
                    <circle
                      cx="72"
                      cy="72"
                      r="58"
                      className="stroke-current"
                      strokeWidth="12"
                      fill="transparent"
                      strokeDasharray={364}
                      strokeDashoffset={364 - (364 * riskScore) / 100}
                    />
                  </svg>
                  <div className="absolute text-center">
                    <span className="text-3xl font-black tracking-tight">{riskScore}%</span>
                    <span className="text-[9px] block opacity-75 font-semibold">
                      {riskScore < 30 ? 'Low Risk' : riskScore < 60 ? 'Moderate' : 'High Risk'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Advisory Card */}
              <div className="bg-white/80 backdrop-blur border border-inherit rounded-2xl p-4 text-slate-800 space-y-3">
                <div className="flex items-center space-x-2 text-xs font-bold border-b pb-2">
                  <TrendingUp size={16} className="text-slate-500" />
                  <span>{t('recommendedAction')}</span>
                </div>
                
                <div className="space-y-1">
                  <p className="text-base font-black text-slate-800">
                    {riskResult?.recommendedAction === 'store' ? t('storeAction') : t('sellAction')}
                  </p>
                  <p className="text-[10px] text-slate-500 font-light leading-snug">
                    {t('recommendedStorage')}: <strong>{riskResult?.recommendedStorageDays} Days</strong> remaining shelf-life.
                  </p>
                </div>

                {/* Factors checklist */}
                <div className="pt-2 text-[10px] text-slate-600 font-medium space-y-1.5 border-t">
                  {riskResult?.reasons.map((r, i) => (
                    <div key={i} className="flex items-start space-x-1.5">
                      <span className="text-secondary mt-0.5">✓</span>
                      <span className="leading-tight">{r}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Quick Metrics */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white border border-slate-100 rounded-2xl p-4 flex items-center space-x-3 shadow-sm">
                <div className="p-2.5 bg-amber-50 text-amber-600 rounded-xl">
                  <Thermometer size={18} />
                </div>
                <div>
                  <span className="text-[9px] text-slate-400 font-light block">Temperature</span>
                  <span className="text-xs font-bold text-slate-700">33°C (High)</span>
                </div>
              </div>
              <div className="bg-surface-lowest border border-surface-highest rounded-2xl p-4 flex items-center space-x-3 shadow-sm">
                <div className="p-2.5 bg-blue-50 text-blue-600 rounded-xl">
                  <Droplets size={18} />
                </div>
                <div>
                  <span className="text-[9px] text-slate-400 font-light block">Humidity</span>
                  <span className="text-xs font-bold text-slate-700">78% (Humid)</span>
                </div>
              </div>
            </div>
          </div>

          {/* Pricing Trends Chart Column */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Price Trend Chart Container */}
            <div className="bg-surface-lowest border border-surface-highest rounded-3xl p-6 shadow-sm space-y-4">
              <div className="flex items-center justify-between border-b pb-4">
                <div>
                  <h3 className="font-bold text-slate-800 text-sm">{t('priceTrend')}</h3>
                  <span className="text-[10px] text-slate-400 font-light">{cropName} Mandi Trends</span>
                </div>
                <span className="bg-accent/20 text-secondary text-xs px-2.5 py-1 rounded-full font-semibold">
                  Avg: ₹{Math.round(priceTrend.reduce((acc, p) => acc + p.price, 0) / (priceTrend.length || 1))}
                </span>
              </div>

              {/* Premium Responsive SVG Chart */}
              {priceTrend.length > 0 ? (
                <div className="w-full overflow-hidden">
                  <svg viewBox={`0 0 ${chartWidth} ${chartHeight}`} className="w-full h-auto">
                    {/* Gridlines */}
                    <line x1={padding} y1={padding} x2={chartWidth - padding} y2={padding} stroke="#f1f5f9" strokeWidth="1" />
                    <line x1={padding} y1={chartHeight / 2} x2={chartWidth - padding} y2={chartHeight / 2} stroke="#f1f5f9" strokeWidth="1" />
                    <line x1={padding} y1={chartHeight - padding} x2={chartWidth - padding} y2={chartHeight - padding} stroke="#e2e8f0" strokeWidth="1.5" />

                    {/* Polyline connecting points */}
                    <polyline
                      fill="none"
                      stroke="var(--secondary)"
                      strokeWidth="3.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      points={points}
                    />

                    {/* Gradient under line */}
                    <path
                      d={`M ${padding} ${chartHeight - padding} L ${points} L ${chartWidth - padding} ${chartHeight - padding} Z`}
                      fill="url(#chartGrad)"
                      opacity="0.15"
                    />

                    {/* Definitions for gradient */}
                    <defs>
                      <linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="var(--accent)" />
                        <stop offset="100%" stopColor="#ffffff" />
                      </linearGradient>
                    </defs>

                    {/* Interactive Circles & Labels */}
                    {priceTrend.map((pt, index) => {
                      const x = padding + (index * (chartWidth - padding * 2)) / (priceTrend.length - 1);
                      const y = chartHeight - padding - ((pt.price - minPrice) * (chartHeight - padding * 2)) / priceRange;
                      return (
                        <g key={index}>
                          <circle cx={x} cy={y} r="5" fill="#ffffff" stroke="var(--secondary)" strokeWidth="3" />
                          {/* Price Label above point */}
                          <text x={x} y={y - 10} textAnchor="middle" className="fill-slate-700 font-bold text-[9px]">
                            ₹{pt.price}
                          </text>
                          {/* Month Label below axis */}
                          <text x={x} y={chartHeight - 10} textAnchor="middle" className="fill-slate-400 font-medium text-[9px]">
                            {pt.month}
                          </text>
                        </g>
                      );
                    })}
                  </svg>
                </div>
              ) : (
                <p className="text-center py-6 text-xs text-slate-400">Trend data loading...</p>
              )}
            </div>

            {/* Storage Facilities Nearby */}
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-slate-600 uppercase tracking-wider">{t('facilitiesNearby')}</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {facilities.map((fac) => (
                  <div key={fac.id} className="bg-surface-lowest border border-surface-highest rounded-3xl p-5 shadow-sm space-y-4 hover:shadow-md transition">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-bold text-slate-800 text-sm">{fac.name}</h4>
                        <span className="text-[10px] text-slate-400 font-light">{fac.location}</span>
                      </div>
                      <span className="bg-accent/20 text-secondary text-[10px] px-2.5 py-0.5 rounded-full font-semibold flex-shrink-0">
                        {t('ratePerMonth', { cost: fac.costPerUnit })}
                      </span>
                    </div>

                    <div className="border-t pt-3 flex items-center justify-between text-[10px] text-slate-600">
                      <div className="flex items-center space-x-1">
                        <MapPin size={12} className="text-slate-400" />
                        <span>Capacity: {fac.capacity}</span>
                      </div>
                      
                      <a
                        href={`tel:${fac.contactInfo}`}
                        className="flex items-center space-x-1 text-secondary hover:text-primary font-semibold"
                      >
                        <Phone size={12} />
                        <span>{fac.contactInfo}</span>
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>

        </div>
      )}
    </div>
  );
}
