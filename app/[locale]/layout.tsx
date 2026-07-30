import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "../globals.css";
import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import ChatWidget from '@/components/chatbot/ChatWidget';

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "KrishiMitra AI - Indian Farmer Platform",
  description: "Government Schemes, Crop Health Diagnosis, Storage Advisory, and Equipment Rental Marketplace",
};

export default async function LocaleLayout({
  children,
  params
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const resolvedParams = await params;
  const locale = resolvedParams.locale;

  // Load translations for this locale
  const messages = await getMessages({ locale });

  return (
    <html lang={locale} className={`${inter.className} h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-slate-50 text-slate-900">
        <NextIntlClientProvider messages={messages} locale={locale}>
          <div className="flex-1 flex flex-col">
            {children}
          </div>
          {/* Site-wide chatbot widget */}
          <ChatWidget />
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
