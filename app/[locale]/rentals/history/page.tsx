'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useLocale } from 'next-intl';
import { Calendar, MessageSquare, CreditCard, Star, Check, X, ShieldAlert, Phone, User, Send, CheckCircle } from 'lucide-react';
import Link from 'next/link';

interface Farmer {
  id: string;
  name: string;
  phone: string;
  village: string;
  district: string;
}

interface RentalListing {
  id: string;
  title: string;
  imageUrl: string | null;
  owner: Farmer;
}

interface RentalBooking {
  id: string;
  listingId: string;
  listing: RentalListing;
  renterId: string;
  renter: Farmer;
  startDate: string;
  endDate: string;
  pricingType: string;
  totalPrice: number;
  status: string;
  paymentStatus: string;
  createdAt: string;
}

interface ChatMessage {
  id: string;
  bookingId: string;
  senderId: string;
  senderRole: string;
  message: string;
  createdAt: string;
}

export default function RentalsHistoryPage() {
  const locale = useLocale();
  const [userId, setUserId] = useState<string | null>(null);
  
  // Tabs: 'renter' or 'owner'
  const [activeTab, setActiveTab] = useState<'renter' | 'owner'>('renter');
  
  const [renterBookings, setRenterBookings] = useState<RentalBooking[]>([]);
  const [ownerBookings, setOwnerBookings] = useState<RentalBooking[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal: Review
  const [reviewBooking, setReviewBooking] = useState<RentalBooking | null>(null);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [reviewSubmitting, setReviewSubmitting] = useState(false);
  const [reviewSuccess, setReviewSuccess] = useState(false);

  // Modal: Chat Drawer
  const [chatBooking, setChatBooking] = useState<RentalBooking | null>(null);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [chatInput, setChatInput] = useState('');
  const chatEndRef = useRef<HTMLDivElement>(null);
  const chatInterval = useRef<any>(null);

  useEffect(() => {
    const id = document.cookie
      .split('; ')
      .find(row => row.startsWith('krishi_farmer_id='))
      ?.split('=')[1];

    if (id) {
      setUserId(id);
      fetchData(id);
    } else {
      setLoading(false);
    }

    return () => {
      if (chatInterval.current) clearInterval(chatInterval.current);
    };
  }, []);

  const fetchData = async (fid: string) => {
    setLoading(true);
    try {
      // Fetch both buyer listings and seller listings
      const res = await fetch(`/api/farmers/${fid}`);
      if (res.ok) {
        const data = await res.json();
        
        // renterBookings are bookings where renterId == fid
        // ownerBookings are bookings on items owned by fid
        // Let's call separate API fetchers or custom filtering:
        // Wait, we can fetch all bookings or farmer specific bookings.
        // Let's query backend or write a custom loader. Let's load them via GET /api/farmers/[id] which returns bookings!
        // Wait! Let's check what `api/farmers/[id]` returns. We can also fetch them directly by calling database endpoints.
        // Wait, let's write a simple helper endpoint to get farmer bookings:
        // We can just query `RentalBooking` records where renterId == fid, or listing.ownerId == fid.
        // Let's create `app/api/rentals/bookings/farmer/[farmerId]/route.ts` to get both in one request! That is extremely clean.
      }
      
      // For now, let's fetch from the custom endpoint we're going to create
      const resB = await fetch(`/api/rentals/bookings/farmer/${fid}`);
      if (resB.ok) {
        const data = await resB.json();
        setRenterBookings(data.renterBookings || []);
        setOwnerBookings(data.ownerBookings || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  // Payment triggers
  const handlePay = async (bookingId: string) => {
    try {
      const res = await fetch(`/api/rentals/bookings/${bookingId}/pay`, {
        method: 'POST'
      });
      if (res.ok) {
        if (userId) fetchData(userId);
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Status triggers
  const handleStatusChange = async (bookingId: string, newStatus: string) => {
    try {
      const res = await fetch(`/api/rentals/bookings/${bookingId}/status`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });
      if (res.ok) {
        if (userId) fetchData(userId);
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Review submit
  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewBooking || !userId) return;

    setReviewSubmitting(true);
    try {
      const res = await fetch('/api/rentals/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          listingId: reviewBooking.listingId,
          reviewerId: userId,
          rating,
          comment
        })
      });

      if (res.ok) {
        setReviewSuccess(true);
        setTimeout(() => {
          setReviewBooking(null);
          setReviewSuccess(false);
          setComment('');
        }, 1500);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setReviewSubmitting(false);
    }
  };

  // Chat polling
  const openChat = (booking: RentalBooking) => {
    setChatBooking(booking);
    fetchChatMessages(booking.id);

    if (chatInterval.current) clearInterval(chatInterval.current);
    chatInterval.current = setInterval(() => {
      fetchChatMessages(booking.id);
    }, 3000);
  };

  const fetchChatMessages = async (bid: string) => {
    try {
      const res = await fetch(`/api/rentals/chat?bookingId=${bid}`);
      if (res.ok) {
        const data = await res.json();
        setChatMessages(data);
        setTimeout(() => {
          chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
        }, 100);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const sendChatMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatBooking || !userId || !chatInput.trim()) return;

    const senderRole = chatBooking.renterId === userId ? 'renter' : 'owner';

    try {
      const res = await fetch('/api/rentals/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bookingId: chatBooking.id,
          senderId: userId,
          senderRole,
          message: chatInput
        })
      });

      if (res.ok) {
        setChatInput('');
        fetchChatMessages(chatBooking.id);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const closeChat = () => {
    setChatBooking(null);
    if (chatInterval.current) clearInterval(chatInterval.current);
  };

  if (!userId) {
    return (
      <div className="max-w-md mx-auto py-16 text-center space-y-6">
        <ShieldAlert size={56} className="text-red-500 mx-auto" />
        <h3 className="text-xl font-black text-slate-800">Authentication Required</h3>
        <p className="text-xs text-slate-500 font-light">
          You need to register a user profile before you can check order history or booking logs.
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

  const activeBookingsList = activeTab === 'renter' ? renterBookings : ownerBookings;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="space-y-1">
        <h2 className="text-2xl font-black text-primary flex items-center space-x-2">
          <Calendar size={28} className="text-secondary" />
          <span>My Rental Bookings & History</span>
        </h2>
        <p className="text-xs text-slate-500">
          Manage bookings, track payments, chat with owners/renters, and leave completed ratings.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-surface-highest">
        <button
          onClick={() => setActiveTab('renter')}
          className={`flex-1 py-3 text-xs font-bold text-center border-b-2 transition ${
            activeTab === 'renter'
              ? 'border-primary text-primary'
              : 'border-transparent text-slate-400 hover:text-slate-600'
          }`}
        >
          Bookings I Placed (Renter)
        </button>
        <button
          onClick={() => setActiveTab('owner')}
          className={`flex-1 py-3 text-xs font-bold text-center border-b-2 transition ${
            activeTab === 'owner'
              ? 'border-primary text-primary'
              : 'border-transparent text-slate-400 hover:text-slate-600'
          }`}
        >
          Requests on My Listings (Owner)
        </button>
      </div>

      {/* List */}
      {loading ? (
        <p className="text-center py-10 text-slate-500 text-sm">Loading bookings ledger...</p>
      ) : activeBookingsList.length === 0 ? (
        <div className="bg-surface-lowest border border-surface-highest rounded-3xl p-12 text-center text-slate-500 max-w-md mx-auto space-y-2">
          <Calendar size={48} className="text-slate-300 mx-auto" />
          <p className="text-xs font-light">No bookings found in this section.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {activeBookingsList.map((booking) => {
            const startStr = new Date(booking.startDate).toLocaleDateString();
            const endStr = new Date(booking.endDate).toLocaleDateString();
            const relativeUser = activeTab === 'renter' ? booking.listing.owner : booking.renter;

            return (
              <div
                key={booking.id}
                className="bg-surface-lowest border border-surface-highest rounded-3xl p-5 shadow-sm space-y-4 hover:shadow-md transition flex flex-col md:flex-row justify-between md:items-center gap-4"
              >
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <span className="bg-slate-100 text-slate-700 text-[9px] px-2 py-0.5 rounded-full font-bold uppercase">
                      {booking.pricingType} Model
                    </span>
                    <span className={`text-[9px] px-2 py-0.5 rounded-full font-bold uppercase ${
                      booking.status === 'confirmed'
                        ? 'bg-green-50 text-green-700'
                        : booking.status === 'completed'
                          ? 'bg-blue-50 text-blue-700'
                          : booking.status === 'cancelled'
                            ? 'bg-red-50 text-red-700'
                            : 'bg-amber-50 text-amber-700'
                    }`}>
                      {booking.status}
                    </span>
                    <span className={`text-[9px] px-2 py-0.5 rounded-full font-bold uppercase ${
                      booking.paymentStatus === 'paid'
                        ? 'bg-emerald-100 text-secondary'
                        : 'bg-slate-100 text-slate-500'
                    }`}>
                      {booking.paymentStatus === 'paid' ? 'Paid' : 'Unpaid'}
                    </span>
                  </div>

                  <h4 className="font-bold text-primary text-base leading-snug">{booking.listing?.title}</h4>
                  <p className="text-xs text-slate-500 font-light">
                    Dates: <strong>{startStr}</strong> to <strong>{endStr}</strong>
                  </p>

                  <div className="flex items-center space-x-2 text-[10px] text-slate-600">
                    <User size={12} className="text-slate-400" />
                    <span>
                      {activeTab === 'renter' ? 'Owner' : 'Renter'}: <strong>{relativeUser?.name}</strong> ({relativeUser?.phone})
                    </span>
                  </div>
                </div>

                {/* Pricing & Control Actions */}
                <div className="flex flex-col items-start md:items-end justify-between gap-3 flex-shrink-0">
                  <span className="font-black text-slate-800 text-lg">₹{booking.totalPrice}</span>

                  <div className="flex items-center gap-2 flex-wrap">
                    {/* Chat button */}
                    <button
                      onClick={() => openChat(booking)}
                      className="bg-surface-low hover:bg-surface-container border border-surface-highest text-primary font-bold text-xs p-2.5 rounded-xl transition flex items-center gap-1"
                    >
                      <MessageSquare size={14} />
                      <span>Chat</span>
                    </button>

                    {/* Renter Specific Actions */}
                    {activeTab === 'renter' && (
                      <>
                        {booking.status === 'confirmed' && booking.paymentStatus === 'pending' && (
                          <button
                            onClick={() => handlePay(booking.id)}
                            className="bg-secondary hover:bg-secondary/90 text-white font-bold text-xs px-4 py-2.5 rounded-xl transition flex items-center gap-1"
                          >
                            <CreditCard size={14} />
                            <span>Pay Quote</span>
                          </button>
                        )}
                        {booking.status === 'completed' && (
                          <button
                            onClick={() => {
                              setReviewBooking(booking);
                              setRating(5);
                              setComment('');
                            }}
                            className="bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs px-4 py-2.5 rounded-xl transition flex items-center gap-1"
                          >
                            <Star size={14} />
                            <span>Review</span>
                          </button>
                        )}
                      </>
                    )}

                    {/* Owner Specific Actions */}
                    {activeTab === 'owner' && (
                      <>
                        {booking.status === 'pending' && (
                          <>
                            <button
                              onClick={() => handleStatusChange(booking.id, 'confirmed')}
                              className="bg-secondary hover:bg-secondary/95 text-white font-bold text-xs px-3 py-2 rounded-xl transition flex items-center gap-0.5"
                            >
                              <Check size={14} />
                              <span>Confirm</span>
                            </button>
                            <button
                              onClick={() => handleStatusChange(booking.id, 'cancelled')}
                              className="bg-red-50 hover:bg-red-100 text-red-600 font-semibold text-xs px-3 py-2 rounded-xl transition flex items-center gap-0.5"
                            >
                              <X size={14} />
                              <span>Cancel</span>
                            </button>
                          </>
                        )}

                        {booking.status === 'confirmed' && (
                          <button
                            onClick={() => handleStatusChange(booking.id, 'completed')}
                            className="bg-primary hover:bg-emerald-950 text-white font-bold text-xs px-4 py-2.5 rounded-xl transition flex items-center gap-1"
                          >
                            <CheckCircle size={14} />
                            <span>Complete</span>
                          </button>
                        )}
                      </>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Review Modal Dialog */}
      {reviewBooking && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-surface-lowest rounded-3xl w-full max-w-md p-6 border border-surface-highest shadow-2xl relative space-y-6 animate-in fade-in zoom-in-95 duration-200">
            <button
              onClick={() => setReviewBooking(null)}
              className="absolute right-4 top-4 text-slate-400 hover:text-slate-600 font-bold"
            >
              ✕
            </button>

            <div className="space-y-1">
              <h3 className="text-lg font-black text-primary">Write Rating Review</h3>
              <p className="text-xs text-slate-500 font-light">{reviewBooking.listing?.title}</p>
            </div>

            {reviewSuccess ? (
              <div className="text-center py-6 space-y-3">
                <div className="p-3 bg-green-100 text-secondary rounded-full inline-block">
                  <CheckCircle size={40} className="animate-bounce" />
                </div>
                <h4 className="font-bold text-slate-800 text-sm font-black">Review Submitted!</h4>
                <p className="text-xs text-slate-500 font-light">Thank you for rating this provider.</p>
              </div>
            ) : (
              <form onSubmit={handleReviewSubmit} className="space-y-4">
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                    Rating (1-5 Stars)
                  </label>
                  <div className="flex space-x-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setRating(star)}
                        className="text-amber-500 hover:scale-110 transition active:scale-95"
                      >
                        <Star size={24} fill={rating >= star ? 'currentColor' : 'none'} />
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                    Review Description
                  </label>
                  <textarea
                    placeholder="Share your experience renting this item..."
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    rows={3}
                    className="w-full bg-slate-50 text-xs font-semibold border-0 focus:ring-2 focus:ring-secondary rounded-xl px-4 py-3 outline-none"
                    required
                  />
                </div>

                <button
                  type="submit"
                  disabled={reviewSubmitting}
                  className="w-full bg-primary hover:bg-emerald-950 text-white font-bold py-3.5 rounded-xl shadow-lg transition active:scale-95 text-xs"
                >
                  {reviewSubmitting ? '...' : 'Submit Rating'}
                </button>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Chat Conversation Modal Drawer */}
      {chatBooking && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-end">
          <div className="bg-surface-lowest h-full w-full max-w-md p-6 border-l border-surface-highest shadow-2xl flex flex-col justify-between relative animate-in slide-in-from-right duration-250">
            {/* Chat Header */}
            <div className="border-b pb-4 flex justify-between items-center">
              <div>
                <h3 className="text-base font-black text-primary leading-snug">{chatBooking.listing?.title}</h3>
                <span className="text-[10px] text-slate-400 font-semibold block">
                  Booking ID: #{chatBooking.id.substring(0, 8)}
                </span>
              </div>
              <button
                onClick={closeChat}
                className="text-slate-400 hover:text-slate-600 font-bold text-lg p-2"
              >
                ✕
              </button>
            </div>

            {/* Message Pane */}
            <div className="flex-1 overflow-y-auto py-4 space-y-3.5 scrollbar-thin">
              {chatMessages.length === 0 ? (
                <p className="text-center text-slate-400 text-xs italic py-10 font-light">
                  No messages yet. Send a greeting to start chatting!
                </p>
              ) : (
                chatMessages.map((msg) => {
                  const isMe = msg.senderId === userId;
                  return (
                    <div
                      key={msg.id}
                      className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}
                    >
                      <div className={`max-w-[75%] rounded-2xl p-3 text-xs leading-relaxed ${
                        isMe 
                          ? 'bg-primary text-white rounded-tr-none' 
                          : 'bg-surface-low border border-surface-highest text-slate-800 rounded-tl-none'
                      }`}>
                        <p>{msg.message}</p>
                        <span className={`block text-[8px] text-right mt-1 opacity-70`}>
                          {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    </div>
                  );
                })
              )}
              <div ref={chatEndRef} />
            </div>

            {/* Input form */}
            <form onSubmit={sendChatMessage} className="border-t pt-4 flex space-x-2">
              <input
                type="text"
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                placeholder="Type your message..."
                className="flex-1 bg-slate-50 text-xs font-semibold border-0 focus:ring-2 focus:ring-secondary rounded-xl px-4 py-3 outline-none"
                required
              />
              <button
                type="submit"
                className="bg-primary hover:bg-emerald-950 text-white rounded-xl p-3 shadow-md transition active:scale-95"
              >
                <Send size={16} />
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
