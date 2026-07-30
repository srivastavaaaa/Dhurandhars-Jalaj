'use client';

import React, { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { ShieldCheck, AlertTriangle, CheckCircle2, User, Landmark, Crop, ExternalLink } from 'lucide-react';
import Link from 'next/link';

interface ReviewItem {
  id: string;
  type: string;
  referenceId: string;
  priority: string;
  status: string;
  assignedAgentId?: string | null;
  createdAt: string;
  details?: {
    id: string;
    imageUrl: string;
    diagnosisResult: string;
    confidenceScore: number;
    crop: {
      cropName: string;
      currentStage: string;
      farm: {
        soilType: string;
        farmer: {
          id: string;
          name: string;
          phone: string;
          district: string;
        }
      }
    }
  };
}

export default function ReviewQueuePage() {
  const tc = useTranslations('common');
  const [items, setItems] = useState<ReviewItem[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Resolve modal state
  const [selectedItem, setSelectedItem] = useState<ReviewItem | null>(null);
  const [finalResult, setFinalResult] = useState('');
  const [resolving, setResolving] = useState(false);

  const fetchQueue = async () => {
    try {
      const res = await fetch('/api/review-queue');
      const data = await res.json();
      setItems(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQueue();
  }, []);

  const handleResolve = async () => {
    if (!selectedItem || !finalResult) return;
    setResolving(true);

    try {
      const res = await fetch(`/api/review-queue/${selectedItem.id}/resolve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: 'resolved',
          finalResult,
          agentName: 'Suresh Rao'
        })
      });

      if (res.ok) {
        setSelectedItem(null);
        setFinalResult('');
        fetchQueue();
      }
    } catch (e) {
      console.error(e);
    } finally {
      setResolving(false);
    }
  };

  const pendingItems = items.filter(item => item.status === 'pending');
  const resolvedItems = items.filter(item => item.status !== 'pending');

  return (
    <div className="max-w-6xl mx-auto px-6 py-10 space-y-8">
      <div className="flex items-center justify-between border-b border-slate-200 pb-5">
        <div className="space-y-1">
          <h2 className="text-2xl font-black text-slate-800 flex items-center space-x-2">
            <ShieldCheck size={28} className="text-amber-500" />
            <span>Agent Review Queue</span>
          </h2>
          <p className="text-xs text-slate-500">
            Audit and approve low-confidence AI crop health diagnoses before they are sent to the farmer.
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <span className="bg-slate-100 text-slate-700 text-xs px-3 py-1.5 rounded-full font-semibold">
            {pendingItems.length} Pending
          </span>
          <span className="bg-emerald-50 text-emerald-700 text-xs px-3 py-1.5 rounded-full font-semibold">
            {resolvedItems.length} Resolved
          </span>
        </div>
      </div>

      {loading ? (
        <p className="text-center py-10 text-slate-500 text-sm">Loading queue...</p>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main List */}
          <div className="lg:col-span-2 space-y-6">
            <h3 className="text-sm font-bold text-slate-600 uppercase tracking-wider">Pending Diagnoses</h3>
            
            {pendingItems.length === 0 ? (
              <div className="bg-slate-50 rounded-3xl border-2 border-dashed border-slate-200 p-12 text-center text-slate-500 text-xs">
                🎉 All crop diagnoses are clean. No pending human reviews!
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {pendingItems.map((item) => {
                  const details = item.details;
                  if (!details) return null;
                  return (
                    <div
                      key={item.id}
                      className="bg-white border border-slate-100 rounded-3xl p-5 shadow-sm space-y-4 hover:shadow-md transition cursor-pointer"
                      onClick={() => {
                        setSelectedItem(item);
                        setFinalResult(details.diagnosisResult);
                      }}
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={details.imageUrl}
                        alt="Crop"
                        className="w-full h-40 object-cover rounded-2xl border border-slate-100"
                      />
                      
                      <div className="space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] bg-amber-50 text-amber-700 font-semibold px-2 py-0.5 rounded-full">
                            Confidence: {(details.confidenceScore * 100).toFixed(0)}%
                          </span>
                          <span className="text-[10px] text-slate-400 font-light">
                            {new Date(item.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                        <h4 className="font-bold text-slate-800 text-sm">
                          {details.crop.cropName} Diagnosis
                        </h4>
                        <p className="text-xs text-slate-500 font-light line-clamp-2">
                          {details.diagnosisResult}
                        </p>
                      </div>

                      <div className="border-t border-slate-50 pt-3 flex items-center space-x-2 text-[10px] text-slate-600">
                        <User size={12} className="text-slate-400" />
                        <span>Farmer: <strong>{details.crop.farm.farmer.name}</strong> ({details.crop.farm.farmer.district})</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            <h3 className="text-sm font-bold text-slate-600 uppercase tracking-wider pt-6">Resolved Audit Log</h3>
            <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm divide-y divide-slate-100">
              {resolvedItems.length === 0 ? (
                <p className="text-xs text-slate-400 font-light py-2">No items resolved yet.</p>
              ) : (
                resolvedItems.map((item) => (
                  <div key={item.id} className="py-4 first:pt-0 last:pb-0 flex items-center justify-between text-xs">
                    <div>
                      <h4 className="font-bold text-slate-800">
                        Resolved: {item.details?.crop.cropName || 'Crop'}
                      </h4>
                      <p className="text-slate-500 font-light text-[10px]">
                        Reviewed by: {item.assignedAgentId} on {new Date(item.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <span className="inline-flex items-center space-x-1 px-2.5 py-1 bg-emerald-50 text-emerald-700 rounded-full text-[10px] font-semibold">
                      <CheckCircle2 size={12} />
                      <span>Approved</span>
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Action Sidebar / Details Panel */}
          <div className="lg:col-span-1">
            {selectedItem ? (
              <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-md space-y-6 sticky top-24 animate-in fade-in slide-in-from-bottom-5 duration-200">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <h3 className="font-bold text-slate-800 text-sm">Resolution Workspace</h3>
                  <button
                    onClick={() => setSelectedItem(null)}
                    className="text-slate-400 hover:text-slate-600 text-xs"
                  >
                    Close
                  </button>
                </div>

                <div className="space-y-4">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={selectedItem.details?.imageUrl}
                    alt="Target Crop"
                    className="w-full h-48 object-cover rounded-2xl border border-slate-100"
                  />

                  <div className="text-xs space-y-2">
                    <p className="text-slate-500 font-light">
                      <strong>Crop:</strong> {selectedItem.details?.crop.cropName} ({selectedItem.details?.crop.currentStage} stage)
                    </p>
                    <p className="text-slate-500 font-light">
                      <strong>Farmer:</strong> {selectedItem.details?.crop.farm.farmer.name}
                    </p>
                    <p className="text-slate-500 font-light">
                      <strong>Phone:</strong> {selectedItem.details?.crop.farm.farmer.phone}
                    </p>
                    <p className="text-slate-500 font-light">
                      <strong>Soil Type:</strong> {selectedItem.details?.crop.farm.soilType}
                    </p>
                  </div>

                  <div className="border-t border-slate-100 pt-4 space-y-3">
                    <label className="block text-xs font-bold text-slate-700">Verify/Edit Diagnosis Advice</label>
                    <textarea
                      value={finalResult}
                      onChange={(e) => setFinalResult(e.target.value)}
                      className="w-full bg-slate-50 text-xs border-0 focus:ring-2 focus:ring-emerald-500 rounded-2xl p-4 h-32 outline-none"
                      placeholder="Type final advice here..."
                    />
                  </div>

                  <button
                    onClick={handleResolve}
                    disabled={resolving}
                    className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3.5 rounded-2xl shadow-lg transition active:scale-95 disabled:opacity-50 text-xs"
                  >
                    {resolving ? 'Releasing...' : 'Approve & Release to Farmer'}
                  </button>
                </div>
              </div>
            ) : (
              <div className="bg-slate-50 rounded-3xl border border-slate-200 p-6 text-center text-xs text-slate-400 font-light py-12">
                Click a pending crop card to resolve and update the farmer.
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
