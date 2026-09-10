import type { Metadata } from 'next';
import './globals.css';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

export const metadata: Metadata = {
  title: 'BeautyNest | Ladies Doorstep Salon – More Than Beauty, It\'s Care',
  description:
    'Lucknow\'s premier doorstep salon service for ladies. Certified beauticians for Korean facials, waxing, bridal makeup, hair spa, and massage at home.',
  keywords: [
    'beauty service at home',
    'doorstep salon lucknow',
    'ladies salon at home',
    'korean facial lucknow',
    'yes madam style salon',
    'home bridal makeup',
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen flex flex-col bg-brand-bg text-brand-charcoal antialiased">
        <Navbar />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
