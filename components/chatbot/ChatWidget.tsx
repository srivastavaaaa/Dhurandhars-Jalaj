'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { MessageSquare, X, Mic, Camera, Send, CheckCircle2, AlertTriangle, User, ShieldAlert } from 'lucide-react';

interface ChatMessage {
  id: string;
  sender: 'farmer' | 'bot' | 'agent';
  contentType: 'text' | 'voice' | 'image';
  content: string;
  intent?: string;
  confidenceScore?: number;
  createdAt: Date;
}

export default function ChatWidget() {
  const t = useTranslations('chatbot');
  const tc = useTranslations('common');
  const locale = useLocale();

  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Initialize with welcome message
  useEffect(() => {
    if (messages.length === 0) {
      setMessages([
        {
          id: 'welcome',
          sender: 'bot',
          contentType: 'text',
          content: 'Namaste! Welcome to KrishiMitra AI. How can I help you today? You can ask about government schemes, check crop health, or find storage facilities.',
          createdAt: new Date()
        }
      ]);
    }
  }, [messages]);

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async (textToSend?: string, imageToSend?: string, voiceContent?: boolean) => {
    const text = textToSend || input;
    if (!text && !imageToSend) return;

    const newMessage: ChatMessage = {
      id: Math.random().toString(),
      sender: 'farmer',
      contentType: imageToSend ? 'image' : (voiceContent ? 'voice' : 'text'),
      content: imageToSend || text,
      createdAt: new Date()
    };

    setMessages(prev => [...prev, newMessage]);
    setInput('');
    setPreviewImage(null);

    // Call API endpoint `/api/ai/ask`
    try {
      const response = await fetch('/api/ai/ask', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: text,
          imageUrl: imageToSend || null,
          contentType: imageToSend ? 'image' : (voiceContent ? 'voice' : 'text'),
          locale: locale
        })
      });

      const data = await response.json();

      if (data.reply) {
        setMessages(prev => [...prev, {
          id: Math.random().toString(),
          sender: data.reviewed ? 'agent' : 'bot',
          contentType: 'text',
          content: data.reply,
          intent: data.intent,
          confidenceScore: data.confidenceScore,
          createdAt: new Date()
        }]);
      }
    } catch (err) {
      console.error(err);
      // Fallback response for offline/mock presentation
      setTimeout(() => {
        setMessages(prev => [...prev, {
          id: Math.random().toString(),
          sender: 'bot',
          contentType: 'text',
          content: 'I am experiencing connection issues. Please check your internet. Here is a helper response.',
          createdAt: new Date()
        }]);
      }, 1000);
    }
  };

  const handleVoiceInput = () => {
    if (!('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) {
      alert('Speech Recognition not supported in this browser. Please type your message.');
      return;
    }

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.lang = locale === 'hi' ? 'hi-IN' : locale === 'mr' ? 'mr-IN' : locale === 'te' ? 'te-IN' : 'en-US';
    recognition.interimResults = false;

    if (!isRecording) {
      setIsRecording(true);
      recognition.start();
      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        handleSendMessage(transcript, undefined, true);
        setIsRecording(false);
      };
      recognition.onerror = () => {
        setIsRecording(false);
      };
      recognition.onend = () => {
        setIsRecording(false);
      };
    } else {
      setIsRecording(false);
    }
  };

  const triggerImageUpload = () => {
    fileInputRef.current?.click();
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingImage(true);
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result as string;
      setPreviewImage(base64String);
      setUploadingImage(false);
    };
    reader.readAsDataURL(file);
  };

  const submitImage = () => {
    if (previewImage) {
      handleSendMessage('Attached Crop Photo for Health Diagnosis', previewImage);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
      {/* Expanded Chat Box */}
      {isOpen && (
        <div className="mb-4 w-96 max-w-[calc(100vw-2rem)] h-[500px] max-h-[80vh] bg-white rounded-2xl shadow-2xl border border-slate-100 flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-5 duration-300">
          {/* Header */}
          <div className="bg-emerald-600 px-4 py-3 text-white flex items-center justify-between shadow-md">
            <div className="flex items-center space-x-2">
              <div className="w-2.5 h-2.5 bg-green-400 rounded-full animate-ping" />
              <div>
                <h3 className="font-semibold text-sm leading-tight">{t('floatingLabel')}</h3>
                <span className="text-[10px] text-emerald-100 font-light">Online • Realtime Assist</span>
              </div>
            </div>
            <button onClick={() => setIsOpen(false)} className="text-white/80 hover:text-white transition">
              <X size={18} />
            </button>
          </div>

          {/* Message List */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50">
            {messages.map((msg) => {
              const isFarmer = msg.sender === 'farmer';
              const isAgent = msg.sender === 'agent';
              return (
                <div key={msg.id} className={`flex ${isFarmer ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 text-sm shadow-sm ${
                    isFarmer
                      ? 'bg-emerald-600 text-white rounded-br-none'
                      : isAgent
                        ? 'bg-amber-50 text-slate-800 border border-amber-200 rounded-bl-none'
                        : 'bg-white text-slate-800 border border-slate-100 rounded-bl-none'
                  }`}>
                    {/* Header badge for agent reviews */}
                    {isAgent && (
                      <div className="flex items-center space-x-1 text-[10px] text-amber-700 font-medium mb-1 border-b border-amber-200/50 pb-1">
                        <ShieldAlert size={10} />
                        <span>Reviewed by Extension Officer</span>
                      </div>
                    )}

                    {/* Content rendering */}
                    {msg.contentType === 'image' ? (
                      <div className="space-y-2">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={msg.content} alt="Upload" className="rounded-lg max-h-40 object-cover" />
                        <span className="text-xs opacity-80 block">Crop Image Uploaded</span>
                      </div>
                    ) : (
                      <p className="whitespace-pre-wrap leading-relaxed">{msg.content}</p>
                    )}

                    {/* Footer / Meta info */}
                    <div className="mt-1 flex items-center justify-between text-[9px] opacity-60">
                      <span>
                        {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
            <div ref={messagesEndRef} />
          </div>

          {/* Image preview drawer */}
          {previewImage && (
            <div className="bg-slate-100 p-3 border-t border-slate-200 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={previewImage} alt="Preview" className="w-12 h-12 object-cover rounded border border-slate-300" />
                <span className="text-xs text-slate-600">Ready to diagnose crop health...</span>
              </div>
              <div className="flex space-x-1">
                <button onClick={() => setPreviewImage(null)} className="p-1 text-slate-400 hover:text-slate-600">
                  <X size={16} />
                </button>
                <button onClick={submitImage} className="px-3 py-1 bg-emerald-600 text-white rounded text-xs font-semibold">
                  Send
                </button>
              </div>
            </div>
          )}

          {/* Quick Replies / Large Tap Targets */}
          <div className="p-2 border-t border-slate-100 bg-white overflow-x-auto flex space-x-1.5 scrollbar-thin">
            <button
              onClick={() => handleSendMessage('Check eligible government schemes for my farm')}
              className="flex-shrink-0 text-[11px] bg-slate-50 hover:bg-emerald-50 hover:text-emerald-700 text-slate-600 px-3 py-1.5 rounded-full border border-slate-200 transition font-medium"
            >
              📋 {t('quickReplies.schemes')}
            </button>
            <button
              onClick={() => handleSendMessage('What is the spoilage risk of my harvest? When should I sell?')}
              className="flex-shrink-0 text-[11px] bg-slate-50 hover:bg-emerald-50 hover:text-emerald-700 text-slate-600 px-3 py-1.5 rounded-full border border-slate-200 transition font-medium"
            >
              🌾 {t('quickReplies.harvest')}
            </button>
            <button
              onClick={() => handleSendMessage('Search for farm equipment rental listings')}
              className="flex-shrink-0 text-[11px] bg-slate-50 hover:bg-emerald-50 hover:text-emerald-700 text-slate-600 px-3 py-1.5 rounded-full border border-slate-200 transition font-medium"
            >
              🚜 {t('quickReplies.equipment')}
            </button>
            <button
              onClick={triggerImageUpload}
              className="flex-shrink-0 text-[11px] bg-slate-50 hover:bg-emerald-50 hover:text-emerald-700 text-slate-600 px-3 py-1.5 rounded-full border border-slate-200 transition font-medium flex items-center space-x-1"
            >
              📸 <span>{t('quickReplies.diagnosis')}</span>
            </button>
          </div>

          {/* Input Box */}
          <div className="p-3 border-t border-slate-100 bg-white flex items-center space-x-2">
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleImageChange}
              accept="image/*"
              className="hidden"
            />
            <button
              onClick={triggerImageUpload}
              disabled={uploadingImage}
              className="p-2.5 bg-slate-100 text-slate-600 rounded-xl hover:bg-slate-200 active:scale-95 transition disabled:opacity-50"
              title="Upload crop photo"
            >
              <Camera size={18} />
            </button>

            <button
              onClick={handleVoiceInput}
              className={`p-2.5 rounded-xl active:scale-95 transition ${
                isRecording ? 'bg-red-500 text-white animate-pulse' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
              title="Speak in your language"
            >
              <Mic size={18} />
            </button>

            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
              placeholder={t('placeholder')}
              className="flex-1 bg-slate-50 text-sm border-0 focus:ring-2 focus:ring-emerald-500 rounded-xl px-3 py-2 text-slate-800 outline-none"
            />

            <button
              onClick={() => handleSendMessage()}
              className="p-2.5 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 active:scale-95 transition"
            >
              <Send size={18} />
            </button>
          </div>
        </div>
      )}

      {/* Floating Action Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-14 h-14 bg-emerald-600 text-white rounded-full flex items-center justify-center shadow-xl hover:bg-emerald-700 active:scale-95 hover:rotate-3 transition duration-300 border-2 border-white focus:outline-none"
      >
        {isOpen ? <X size={26} /> : <MessageSquare size={26} />}
      </button>
    </div>
  );
}
