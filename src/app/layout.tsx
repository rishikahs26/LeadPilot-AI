import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ 
  subsets: ["latin"],
  variable: "--font-inter",
  display: 'swap',
});

export const metadata: Metadata = {
  title: "LeadPilot | AI-Powered Real Estate Lead Management",
  description: "Professional lead management system with AI analysis and CallSense conversation intelligence for real estate teams.",
  keywords: ["real estate", "lead management", "AI", "CRM", "sales automation"],
  authors: [{ name: "LeadPilot Team" }],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={inter.variable}>
      <body className={`${inter.className} antialiased`}>
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/20 to-indigo-50/30">
          {/* Professional Header */}
          <header className="glass-effect border-b-2 border-purple-200/60 sticky top-0 z-50 shadow-lg shadow-purple-500/10">
            <div className="max-w-7xl mx-auto px-4 py-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="brand-gradient w-12 h-12 rounded-2xl flex items-center justify-center shadow-2xl shadow-purple-500/40 animate-pulse">
                    <span className="text-white font-bold text-2xl">🏠</span>
                  </div>
                  <div>
                    <h1 className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 tracking-tight">
                      LeadPilot
                    </h1>
                    <p className="text-xs font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-600">
                      Real Estate Lead Intelligence
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center gap-6">
                  <div className="hidden sm:flex items-center gap-2 bg-gradient-to-r from-emerald-50 to-teal-50 px-4 py-2 rounded-full border-2 border-emerald-200">
                    <div className="w-2 h-2 bg-gradient-to-r from-emerald-400 to-teal-500 rounded-full animate-pulse shadow-lg shadow-emerald-500/50"></div>
                    <span className="text-xs font-bold text-emerald-700">AI-Powered</span>
                  </div>
                  <div className="hidden md:flex items-center gap-2 bg-gradient-to-r from-purple-50 to-pink-50 px-3 py-1.5 rounded-full border border-purple-200">
                    <span className="text-xs font-mono font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-600">
                      v1.0.0
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </header>

          {/* Main Content */}
          <main className="relative">
            {children}
          </main>

          {/* Footer */}
          <footer className="mt-16 border-t-2 border-gradient-to-r from-blue-200 via-purple-200 to-pink-200 bg-gradient-to-r from-white via-purple-50/30 to-pink-50/30 backdrop-blur-sm">
            <div className="max-w-7xl mx-auto px-4 py-8">
              <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-3 text-sm">
                  <span className="font-semibold text-slate-700">Powered by</span>
                  <span className="font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600 px-3 py-1 bg-blue-50 rounded-lg border-2 border-blue-200">
                    Gemini AI
                  </span>
                  <span className="text-slate-400 font-bold">•</span>
                  <span className="font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-600 px-3 py-1 bg-purple-50 rounded-lg border-2 border-purple-200">
                    CallSense™
                  </span>
                </div>
                <div className="text-xs font-semibold text-slate-600 bg-slate-50 px-4 py-2 rounded-lg border border-slate-200">
                  Built for real estate professionals • Masal AI Internship Project
                </div>
              </div>
            </div>
          </footer>
        </div>
      </body>
    </html>
  );
}
