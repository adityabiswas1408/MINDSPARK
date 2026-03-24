import type { Metadata } from 'next';
import { DM_Sans, DM_Mono } from 'next/font/google';
import './globals.css';
import { cn } from "@/lib/utils";

const dmSans = DM_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-sans',
  display: 'swap',
});

const dmMono = DM_Mono({
  subsets: ['latin'],
  weight: ['400', '500'],
  variable: '--font-mono',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'MINDSPARK',
  description: 'WCAG 2.2 AAA Accessible Assessment Platform',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={cn("font-sans", dmSans.variable)}>
      <body 
        className={`${dmSans.variable} ${dmMono.variable} font-sans antialiased bg-page text-secondary min-h-screen`}
      >
        <a 
          href="#main-content" 
          className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 z-[9999] bg-white text-[#1A3829] p-4 shadow-lg rounded-md border-2 border-[#1A3829] outline-none"
        >
          Skip to main content
        </a>
        
        <main id="main-content" tabIndex={-1} className="outline-none h-full min-h-screen">
          {children}
        </main>
      </body>
    </html>
  );
}
