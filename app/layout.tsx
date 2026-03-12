'use client'

import './globals.css';
import Header from '../components/layout/Header';
import Footer from '../components/Footer';
import PrepVaultAI from '../components/PrepVaultAI';
import { useState } from 'react';
import { Sparkles } from 'lucide-react';
import { Analytics } from '@vercel/analytics/react';
import ThemeProvider from '../components/providers/ThemeProvider';
import AnimatedBackground from '../components/AnimatedBackground/AnimatedBackground';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const [isAIOpen, setIsAIOpen] = useState(false);

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Google Fonts: Inter */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet" />
      </head>
      <body className="bg-primary text-primary-text antialiased min-h-screen relative">
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <AnimatedBackground />

          <div className="relative z-10 flex flex-col min-h-screen">
            <Header />

            <main className="flex w-full flex-1 flex-col section-shell">
              {children}
            </main>

            <Footer />
          </div>

          <PrepVaultAI isOpen={isAIOpen} onClose={() => setIsAIOpen(false)} />

          <button
            onClick={() => setIsAIOpen(true)}
            className="fixed bottom-6 right-6 h-12 w-12 rounded-full bg-indigo-600 text-white shadow-lg hover:bg-indigo-500 transition-colors flex items-center justify-center z-40"
            aria-label="Open PrepVault AI Assistant"
          >
            <Sparkles className="h-5 w-5" />
          </button>

          <Analytics />
        </ThemeProvider>
      </body>
    </html>
  );
}
