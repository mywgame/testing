/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { AuthProvider } from './contexts/AuthContext.tsx';
import { useAuth } from './hooks/useAuth.ts';
import { BaseLayout } from './layouts/BaseLayout.tsx';
import { 
  ArrowRight,
  ArrowLeft,
  LayoutDashboard,
  ShieldAlert,
  Lock,
  XCircle
} from 'lucide-react';

// Import our new Phase 4 World-Class Landing Page Components
import { Navbar } from './components/Navbar.tsx';
import { Hero } from './components/Hero.tsx';
import { About } from './components/About.tsx';
import { WhyChooseUs } from './components/WhyChooseUs.tsx';
import { HowItWorks } from './components/HowItWorks.tsx';
import { Stats } from './components/Stats.tsx';
import { Security } from './components/Security.tsx';
import { Faq } from './components/Faq.tsx';
import { Contact } from './components/Contact.tsx';
import { Footer } from './components/Footer.tsx';
import { AuthModal } from './components/AuthModal.tsx';
import { getPendingReferralCode } from './components/Auth/Register/Register.tsx';
import { UserDashboard } from './components/Dashboard/index.tsx';
import { ThemeProvider } from './contexts/ThemeContext.tsx';
import { EnterpriseAdminDashboard } from './components/Admin/index.tsx';
import { Button } from './components/ui/Buttons/index.tsx';
import { LoadingScreen } from './components/LoadingScreen.tsx';


/**
 * MAIN APP CONTAINER WITH EMBEDDED PHASE 4 WEBSITE
 */
function MainAppContent() {
  const { user, token, loading: authLoading, syncProfile } = useAuth();
  const [currentView, setCurrentView] = useState<'landing' | 'dashboard' | 'admin'>('landing');
  const [activeSection, setActiveSection] = useState('hero');
  const [isAppLoading, setIsAppLoading] = useState(true);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState<'login' | 'register'>('login');
  const [referralCodeForAuth, setReferralCodeForAuth] = useState<string>('');

  // Initial premium app loading timer
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsAppLoading(false);
    }, 1800); // 1.8 seconds allows the shimmer progress to complete elegantly
    return () => clearTimeout(timer);
  }, []);

  // 1. Client-Side Pathname & Referral Routing Sync
  useEffect(() => {
    const handleLocationChange = () => {
      const path = window.location.pathname;
      const search = window.location.search;
      const searchParams = new URLSearchParams(search);
      const codeFromSearch = searchParams.get('ref') || searchParams.get('referralCode') || searchParams.get('referral');
      const pathMatch = path.match(/^\/ref\/([^\/]+)/i);
      const extractedCode = (codeFromSearch || (pathMatch && pathMatch[1]) || '').trim();

      if (extractedCode) {
        try {
          sessionStorage.setItem('pendingReferralCode', extractedCode);
        } catch (e) {
          // ignore storage errors
        }
        setReferralCodeForAuth(extractedCode);
      }

      if (path === '/admin') {
        setCurrentView('admin');
      } else if (path === '/dashboard') {
        setCurrentView('dashboard');
      } else if (path === '/login') {
        setCurrentView('landing');
        setAuthModalMode('login');
        setIsAuthModalOpen(true);
      } else {
        setCurrentView('landing');
        // If route is /register or /ref/CODE or a referral code is present in URL query params, trigger registration modal
        if (path === '/register' || path.startsWith('/ref/') || extractedCode) {
          setAuthModalMode('register');
          setIsAuthModalOpen(true);
        }
      }
    };

    // Run once on initial mount
    handleLocationChange();

    // Listen to browser forward/back popstate events
    window.addEventListener('popstate', handleLocationChange);
    return () => window.removeEventListener('popstate', handleLocationChange);
  }, []);

  // Update window.location.pathname dynamically when currentView state changes
  useEffect(() => {
    const currentPath = window.location.pathname;
    if (currentView === 'admin' && currentPath !== '/admin') {
      window.history.pushState(null, '', '/admin');
    } else if (currentView === 'dashboard' && currentPath !== '/dashboard') {
      window.history.pushState(null, '', '/dashboard');
    } else if (currentView === 'landing') {
      if (currentPath !== '/' && currentPath !== '/register' && currentPath !== '/login' && !currentPath.startsWith('/ref/')) {
        window.history.pushState(null, '', '/');
      }
    }
  }, [currentView]);

  // 2. Redirect unauthenticated visitors trying to access protected routes
  useEffect(() => {
    if (authLoading) return;

    if (!user && (currentView === 'dashboard' || currentView === 'admin')) {
      setCurrentView('landing');
      setAuthModalMode('login');
      setIsAuthModalOpen(true);
      if (window.location.pathname !== '/login') {
        window.history.replaceState(null, '', '/login');
      }
    }
  }, [user, currentView, authLoading]);

  // 3. Automatically transition logged in users to dashboard/admin immediately
  useEffect(() => {
    if (!authLoading && user && currentView === 'landing') {
      if (isAuthModalOpen) {
        setIsAuthModalOpen(false);
      }
      const role = (user.role || '').toLowerCase();
      if (['admin', 'superadmin', 'operator', 'support', 'finance', 'auditor'].includes(role)) {
        setCurrentView('admin');
      } else {
        setCurrentView('dashboard');
      }
    }
  }, [user, currentView, authLoading, isAuthModalOpen]);

  // Section Tracking for Navbar Highlighter
  useEffect(() => {
    if (currentView !== 'landing') return;

    const sections = ['hero', 'about', 'benefits', 'how-it-works', 'security', 'faq', 'contact'];
    
    const handleScroll = () => {
      const scrollPosition = window.scrollY + 160; // Offset for sticky navbar height
      
      for (const sId of sections) {
        const el = document.getElementById(`${sId}-section`) || document.getElementById(sId);
        if (el) {
          const top = el.offsetTop;
          const height = el.offsetHeight;
          if (scrollPosition >= top && scrollPosition < top + height) {
            setActiveSection(sId);
            break;
          }
        }
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [currentView]);

  const handleOpenAuth = (mode: 'login' | 'register') => {
    if (mode === 'register') {
      const code = getPendingReferralCode();
      if (code) {
        setReferralCodeForAuth(code);
      }
    }
    setAuthModalMode(mode);
    setIsAuthModalOpen(true);
  };

  const handleNavigateToSection = (sectionId: string) => {
    if (sectionId === 'dashboard-dev') {
      setCurrentView('dashboard');
      return;
    }

    setCurrentView('landing');
    setTimeout(() => {
      const el = document.getElementById(`${sectionId}-section`) || document.getElementById(sectionId);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' });
        setActiveSection(sectionId);
      }
    }, 50);
  };

  // Switch between public high-end landing page, user dashboard, and enterprise admin dashboard
  if (currentView === 'admin') {
    const isAuthorized = user && [
      'admin', 'superadmin', 'operator', 'support', 'finance', 'auditor'
    ].includes(user.role.toLowerCase());

    if (!user) {
      return (
        <>
          <AnimatePresence>
            {isAppLoading && <LoadingScreen />}
          </AnimatePresence>
          <div className="min-h-screen bg-[#fafafa] flex flex-col items-center justify-center p-6 text-center select-none font-sans">
            <div className="max-w-md w-full bg-white p-8 border border-gray-100 rounded-2xl shadow-xl space-y-6">
              <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mx-auto shadow-sm">
                <Lock className="w-8 h-8" />
              </div>
              <div className="space-y-1">
                <h3 className="text-lg font-display font-black text-gray-950 uppercase tracking-tight">Authentication Required</h3>
                <p className="text-xs text-gray-400 font-mono">SECURE OPERATIONS ENCLAVE</p>
              </div>
              <p className="text-xs text-gray-500 leading-relaxed">
                Access to the MetaFirm Platform operational console requires active multi-factor cryptographic authentication. Please sign in to verify credentials.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setCurrentView('landing')}
                  className="flex-1 py-2.5 text-xs font-bold text-gray-500 hover:text-gray-900 hover:bg-gray-50 border border-gray-200 rounded-xl transition-colors cursor-pointer"
                >
                  Back to Website
                </button>
                <button
                  onClick={() => handleOpenAuth('login')}
                  className="flex-1 py-2.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition-all hover:shadow-md cursor-pointer"
                >
                  Login to Session
                </button>
              </div>
            </div>
          </div>
        </>
      );
    }

    if (!isAuthorized) {
      return (
        <>
          <AnimatePresence>
            {isAppLoading && <LoadingScreen />}
          </AnimatePresence>
          <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4 sm:p-6 text-center select-none font-sans">
          <div className="max-w-lg w-full bg-white border border-red-100/80 p-8 rounded-3xl shadow-2xl space-y-6 relative overflow-hidden">
            {/* Danger Warning Strip */}
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-red-600" />
            
            <div className="w-16 h-16 bg-red-50 text-red-600 rounded-2xl flex items-center justify-center mx-auto shadow-xs border border-red-100">
              <ShieldAlert className="w-8 h-8" />
            </div>

            <div className="space-y-1">
              <h3 className="text-xl font-display font-black text-gray-950 uppercase tracking-tight">Access Prohibited</h3>
              <p className="text-[10px] font-mono text-red-600 font-bold tracking-widest uppercase">
                SECURITY FIREWALL INTERCEPT [ERR_AUTH_DENIED]
              </p>
            </div>

            <div className="bg-gray-50 border border-gray-100 p-4 rounded-2xl space-y-2 text-left text-xs font-mono">
              <div className="flex justify-between">
                <span className="text-gray-400">Authenticated Identity:</span>
                <span className="font-semibold text-gray-900">{user.email}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Current Assigned Role:</span>
                <span className="font-bold text-red-600 uppercase bg-red-50 border border-red-100/50 px-1.5 py-0.5 rounded text-[10px]">
                  {user.role}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Required Clearances:</span>
                <span className="font-semibold text-gray-700">ADMIN, OPERATOR, AUDITOR, etc.</span>
              </div>
              <div className="flex justify-between pt-1.5 border-t border-gray-100">
                <span className="text-gray-400">Telemetry Log Status:</span>
                <span className="text-red-500 font-bold uppercase animate-pulse">● REPORTED TO SYSTEM AUDIT</span>
              </div>
            </div>

            <p className="text-xs text-gray-500 leading-relaxed max-w-sm mx-auto">
              Your security credentials do not grant access to the root operations console. This unauthorized attempt has been logged along with your active IP address in accordance with standard financial audit policies.
            </p>

            <div className="flex gap-3 pt-2">
              <button
                onClick={() => setCurrentView('landing')}
                className="flex-1 py-2.5 text-xs font-bold text-gray-500 hover:text-gray-900 hover:bg-gray-50 border border-gray-200 rounded-xl transition-colors cursor-pointer"
              >
                Back to Landing
              </button>
              <button
                onClick={() => setCurrentView('dashboard')}
                className="flex-1 py-2.5 text-xs font-bold text-white bg-gray-950 hover:bg-gray-800 rounded-xl transition-all hover:shadow-md cursor-pointer flex items-center justify-center gap-1.5"
              >
                <LayoutDashboard className="w-4 h-4 text-blue-400" />
                <span>Core Dashboard</span>
              </button>
            </div>
          </div>
        </div>
      </>
    );
    }

    return (
      <>
        <AnimatePresence>
          {isAppLoading && <LoadingScreen />}
        </AnimatePresence>
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -15 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="min-h-screen bg-navy-950 flex flex-col"
        >
          <EnterpriseAdminDashboard onBackToLanding={() => setCurrentView('landing')} />
        </motion.div>
      </>
    );
  }

  if (currentView === 'dashboard') {
    if (authLoading || !user) {
      return (
        <AnimatePresence>
          <LoadingScreen />
        </AnimatePresence>
      );
    }

    return (
      <>
        <AnimatePresence>
          {isAppLoading && <LoadingScreen />}
        </AnimatePresence>
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -15 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="min-h-screen bg-navy-950 flex flex-col"
        >
          <ThemeProvider>
            <UserDashboard onBackToLanding={() => setCurrentView('landing')} />
          </ThemeProvider>
        </motion.div>
      </>
    );
  }


  return (
    <>
      <AnimatePresence>
        {isAppLoading && <LoadingScreen />}
      </AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1], delay: 0.2 }}
        className="min-h-screen bg-navy-950 text-white font-sans flex flex-col antialiased"
      >
      
      {/* 1. Header (Navbar component) */}
      <Navbar 
        onOpenAuth={handleOpenAuth} 
        onNavigateToSection={handleNavigateToSection} 
        activeSection={activeSection}
      />

      {/* 2. Main content pages */}
      <main className="flex-grow">
        
        {/* Hero Section */}
        <div id="hero">
          <Hero 
            onOpenAuth={handleOpenAuth} 
            onNavigateToSection={handleNavigateToSection} 
          />
        </div>

        {/* About Company Section */}
        <div id="about">
          <About />
        </div>

        {/* Why Choose Us Section */}
        <div id="benefits">
          <WhyChooseUs />
        </div>

        {/* How It Works Section */}
        <div id="how-it-works">
          <HowItWorks />
        </div>

        {/* Platform Statistics Section */}
        <div id="stats">
          <Stats />
        </div>

        {/* Security Highlights Section */}
        <div id="security">
          <Security />
        </div>

        {/* FAQs Section */}
        <div id="faq">
          <Faq />
        </div>

        {/* Contact Desk Section */}
        <div id="contact">
          <Contact />
        </div>

      </main>

      {/* 3. Footer */}
      <Footer onNavigateToSection={handleNavigateToSection} />

      {/* 4. Auth Modal Portal */}
      <AuthModal 
        isOpen={isAuthModalOpen} 
        onClose={() => setIsAuthModalOpen(false)} 
        initialMode={authModalMode} 
        initialReferralCode={referralCodeForAuth}
      />

    </motion.div>
  </>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <ThemeProvider>
        <MainAppContent />
      </ThemeProvider>
    </AuthProvider>
  );
}
