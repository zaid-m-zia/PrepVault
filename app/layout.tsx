import './globals.css';
import Header from '../components/layout/Header';
import Footer from '../components/layout/Footer';

export const metadata = {
  title: 'PrepVault',
  description: 'Curated academic resources for students',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
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
      </body>
    </html>
  );
}
