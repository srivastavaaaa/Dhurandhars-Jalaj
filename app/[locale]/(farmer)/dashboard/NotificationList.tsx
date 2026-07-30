'use client';

import React, { useState } from 'react';
import { Bell, CheckCircle2, AlertTriangle, Info } from 'lucide-react';

interface Notification {
  id: string;
  type: string;
  channel: string;
  content: string;
  sentAt: string | Date;
  readAt: string | Date | null;
}

export default function NotificationList({
  initialNotifications
}: {
  initialNotifications: Notification[];
}) {
  const [notifications, setNotifications] = useState<Notification[]>(initialNotifications);

  const markAsRead = async (id: string) => {
    try {
      const res = await fetch(`/api/notifications/${id}/read`, {
        method: 'PATCH'
      });
      if (res.ok) {
        setNotifications(prev =>
          prev.map(n => (n.id === id ? { ...n, readAt: new Date() } : n))
        );
      }
    } catch (e) {
      console.error(e);
      // Fallback local update
      setNotifications(prev =>
        prev.map(n => (n.id === id ? { ...n, readAt: new Date() } : n))
      );
    }
  };

  if (notifications.length === 0) {
    return (
      <div className="py-6 text-center text-xs text-slate-400 font-light">
        No active notifications. You are all set!
      </div>
    );
  }

  return (
    <div className="divide-y divide-slate-100 max-h-96 overflow-y-auto pr-1">
      {notifications.map((n) => {
        const isUnread = !n.readAt;
        const iconColor = n.type === 'harvest-risk' 
          ? 'text-red-500 bg-red-50 border-red-100' 
          : n.type === 'booking' 
            ? 'text-purple-500 bg-purple-50 border-purple-100' 
            : 'text-blue-500 bg-blue-50 border-blue-100';

        return (
          <div
            key={n.id}
            onClick={() => isUnread && markAsRead(n.id)}
            className={`py-4 flex items-start gap-4 transition select-none first:pt-0 last:pb-0 ${
              isUnread ? 'bg-emerald-50/30 -mx-4 px-4 cursor-pointer hover:bg-emerald-50/50' : 'opacity-70'
            }`}
          >
            <div className={`p-2 rounded-xl border flex-shrink-0 ${iconColor}`}>
              {n.type === 'harvest-risk' ? (
                <AlertTriangle size={16} />
              ) : n.type === 'booking' ? (
                <CheckCircle2 size={16} />
              ) : (
                <Info size={16} />
              )}
            </div>

            <div className="flex-1 space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-[10px] text-slate-400">
                  {new Date(n.sentAt).toLocaleDateString()} at{' '}
                  {new Date(n.sentAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
                {isUnread && (
                  <span className="text-[9px] text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full font-bold">
                    New Alert
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-700 font-light leading-relaxed">
                {n.content}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
