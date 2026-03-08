'use client'

import './globals.css';
import Header from '../components/layout/Header';
import Footer from '../components/layout/Footer';
import PrepVaultAI from '../components/PrepVaultAI';
import { useState } from 'react';
import { Sparkles } from 'lucide-react';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const [isAIOpen, setIsAIOpen] = useState(false);

  return (
    <html lang="en" className="dark">
      <head>
        {/* Google Fonts: Inter (UI) and Space Grotesk (display) */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;800&family=Space+Grotesk:wght@700&display=swap" rel="stylesheet" />
      </head>
      <body className="bg-primary text-primary-text antialiased min-h-screen">
        <div className="flex flex-col min-h-screen">
          {/* Header (presentational) */}
          <Header />

          <main className="flex-1 max-w-6xl mx-auto w-full px-6 py-10">
            {children}
          </main>

          {/* Footer (presentational) */}
          <Footer />
        </div>

        {/* PrepVault AI */}
        <PrepVaultAI isOpen={isAIOpen} onClose={() => setIsAIOpen(false)} />

        {/* Floating AI Button */}
        <button
          onClick={() => setIsAIOpen(true)}
          className="fixed bottom-6 right-6 w-14 h-14 bg-gradient-to-r from-cyan-500 to-purple-600 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center group z-40"
          aria-label="Open PrepVault AI Assistant"
        >
          <Sparkles className="w-6 h-6 text-white group-hover:scale-110 transition-transform" />
        </button>
      </body>
    </html>
  );
}
