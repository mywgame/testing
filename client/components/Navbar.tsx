import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth.ts';
import { Menu, X, ArrowUpRight, LogOut, LayoutDashboard, Shield } from 'lucide-react';
import logoImg from '../../assets/images/branding/logo.png';

interface NavbarProps {
  onOpenAuth: (mode: 'login' | 'register') => void;
  onNavigateToSection: (sectionId: string) => void;
  activeSection: string;
}

export const Navbar: React.FC<NavbarProps> = ({ onOpenAuth, onNavigateToSection, activeSection }) => {
  const { user, logout } = useAuth();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 15);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { label: 'Home', id: 'hero' },
    { label: 'Thesis', id: 'about' },
    { label: 'Pipeline', id: 'benefits' },
    { label: 'Metrics', id: 'how-it-works' },
    { label: 'Security', id: 'security' },
    { label: 'FAQ', id: 'faq' },
    { label: 'Support', id: 'contact' },
  ];

  const handleLinkClick = (id: string) => {
    onNavigateToSection(id);
    setIsMobileMenuOpen(false);
  };

  return (
    <nav
      id="main-navbar"
      className={`fixed top-0 left-0 right-0 z-40 transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] ${
        isScrolled
          ? 'bg-navy-950/90 backdrop-blur-lg shadow-2xl border-b border-white/10 py-3'
          : 'bg-transparent py-5 border-b border-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          
          {/* Logo Brand Identity */}
          <button
            onClick={() => handleLinkClick('hero')}
            className="flex items-center text-left focus:outline-none group cursor-pointer"
            id="navbar-brand-logo"
          >
            <img
              src={logoImg}
              alt="MetaFirm Logo"
              referrerPolicy="no-referrer"
              className="h-10 object-contain"
            />
          </button>

          {/* Desktop Navigation list */}
          <div className="hidden lg:flex items-center space-x-1" id="navbar-desktop-menu">
            {navLinks.map((link) => (
              <button
                key={link.id}
                onClick={() => handleLinkClick(link.id)}
                aria-current={activeSection === link.id ? 'page' : undefined}
                className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] hover:scale-[1.05] active:scale-[0.95] cursor-pointer focus-visible:outline-none ${
                  activeSection === link.id
                    ? 'text-brand-cyan bg-brand-blue/10 border border-brand-cyan/25'
                    : 'text-ink-300 hover:text-white hover:bg-white/5 border border-transparent'
                }`}
              >
                {link.label}
              </button>
            ))}
          </div>

          {/* Authentication Action Buttons */}
          <div className="hidden lg:flex items-center space-x-3" id="navbar-auth-actions">
            {user ? (
              <button
                onClick={() => handleLinkClick('dashboard-dev')}
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-brand-gradient text-white rounded-xl text-xs font-bold uppercase tracking-wider shadow-md hover:shadow-[0_4px_16px_rgba(233,30,140,0.45)] transition-all cursor-pointer"
              >
                <LayoutDashboard className="w-3.5 h-3.5" />
                <span>Dashboard</span>
              </button>
            ) : (
              <div className="flex items-center space-x-3">
                <button
                  onClick={() => onOpenAuth('login')}
                  className="px-4 py-2 text-xs font-bold uppercase tracking-wider text-ink-300 hover:text-white transition-all duration-300 hover:scale-[1.05] active:scale-[0.95] cursor-pointer"
                  id="navbar-login-btn"
                >
                  Sign In
                </button>
                
                <button
                  onClick={() => onOpenAuth('register')}
                  className="inline-flex items-center justify-center rounded-xl bg-brand-gradient px-4 py-2 text-xs font-bold uppercase tracking-wider text-white shadow-md transition-all duration-300 hover:shadow-[0_4px_16px_rgba(233,30,140,0.45)] hover:scale-[1.03] active:scale-[0.97] hover:-translate-y-0.5 cursor-pointer"
                  id="navbar-register-btn"
                >
                  <span>Get Started</span>
                  <ArrowUpRight className="w-3.5 h-3.5 ml-1" />
                </button>
              </div>
            )}
          </div>

          {/* Mobile menu toggle */}
          <div className="flex lg:hidden items-center">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 text-ink-300 hover:text-white hover:bg-white/5 rounded-xl transition-colors cursor-pointer"
              id="navbar-mobile-toggle-btn"
            >
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

        </div>
      </div>

      {/* Mobile Menu Slide */}
      {isMobileMenuOpen && (
        <div
          className="lg:hidden bg-navy-950/95 backdrop-blur-lg border-b border-white/10 px-4 pt-2 pb-6 space-y-2 absolute top-full left-0 right-0 shadow-2xl"
          id="navbar-mobile-menu"
        >
          {navLinks.map((link) => (
            <button
              key={link.id}
              onClick={() => handleLinkClick(link.id)}
              className={`w-full text-left px-4 py-3 rounded-xl text-xs font-bold uppercase tracking-wider transition-all ${
                activeSection === link.id
                  ? 'text-brand-cyan bg-brand-blue/15 border border-brand-cyan/20'
                  : 'text-ink-300 hover:text-white hover:bg-white/5 border border-transparent'
              }`}
            >
              {link.label}
            </button>
          ))}

          {/* Mobile auth buttons */}
          <div className="pt-4 border-t border-white/5 flex flex-col space-y-2.5">
            {user ? (
              <button
                onClick={() => handleLinkClick('dashboard-dev')}
                className="w-full py-2.5 bg-brand-gradient text-white rounded-xl text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 shadow-md cursor-pointer"
              >
                <LayoutDashboard className="w-4 h-4" />
                <span>Dashboard</span>
              </button>
            ) : (
              <div className="grid grid-cols-2 gap-3 px-2">
                <button
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    onOpenAuth('login');
                  }}
                  className="py-2.5 bg-white/5 border border-white/10 hover:bg-white/10 text-white rounded-xl text-xs font-bold uppercase tracking-wider cursor-pointer"
                >
                  Sign In
                </button>

                <button
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    onOpenAuth('register');
                  }}
                  className="py-2.5 bg-brand-gradient text-white rounded-xl text-xs font-bold uppercase tracking-wider cursor-pointer shadow-md"
                >
                  Get Started
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
