/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { VenturesNavbar } from './VenturesNavbar.tsx';
import { HeroSection } from './HeroSection.tsx';
import { FeaturedProject } from './FeaturedProject.tsx';
import { EcosystemSection } from './EcosystemSection.tsx';
import { PromoVideoSection } from './PromoVideoSection.tsx';
import { WhyMetaFirm } from './WhyMetaFirm.tsx';
import { FutureVentures } from './FutureVentures.tsx';
import { FinalCTA } from './FinalCTA.tsx';
import { VenturesFooter } from './VenturesFooter.tsx';
import { BottomNav } from '../Dashboard/BottomNav.tsx';
import { DashboardTab } from '../Dashboard/Sidebar.tsx';
import { OfferPromoModal } from '../Dashboard/Promo/OfferPromoModal.tsx';
import { useAuth } from '../../hooks/useAuth.ts';
import { prefetchDashboardData } from '../../services/dashboardCache.ts';

interface VenturesPageProps {
  onNavigateToDashboard: (tab?: DashboardTab) => void;
  onLogout: () => void;
}

export const VenturesPage: React.FC<VenturesPageProps> = ({
  onNavigateToDashboard,
  onLogout,
}) => {
  const { user } = useAuth();
  const [isPromoModalOpen, setIsPromoModalOpen] = useState(false);
  const hasCheckedPromoPopup = useRef(false);

  // Background prefetch dashboard data so switching to Dashboard is instant
  useEffect(() => {
    if (user) {
      prefetchDashboardData();
    }
  }, [user]);

  useEffect(() => {
    if (hasCheckedPromoPopup.current || !user) return;
    hasCheckedPromoPopup.current = true;

    try {
      const dismissedUntil = localStorage.getItem('metafirm_promo_popup_dismissed_until');
      if (dismissedUntil && parseInt(dismissedUntil, 10) > Date.now()) {
        return;
      }
      const lastSeen = localStorage.getItem('metafirm_promo_popup_last_seen');
      if (!lastSeen || (Date.now() - parseInt(lastSeen, 10) > 12 * 60 * 60 * 1000)) {
        const timer = setTimeout(() => {
          setIsPromoModalOpen(true);
        }, 1200);
        return () => clearTimeout(timer);
      }
    } catch {
      // ignore
    }
  }, [user]);

  const handleBottomNavClick = (tab: DashboardTab) => {
    onNavigateToDashboard(tab);
  };

  return (
    <div
      className="min-h-screen text-slate-200 font-sans relative selection:bg-purple-600 selection:text-white pb-20 md:pb-0"
      style={{ background: '#04091a' }}
    >
      {/* Top Navbar */}
      <VenturesNavbar
        onNavigateToDashboard={() => onNavigateToDashboard('dashboard')}
        onLogout={onLogout}
      />

      {/* Main Sections */}
      <main className="w-full">
        <HeroSection onNavigateToDashboard={onNavigateToDashboard} />
        <FeaturedProject />
        <EcosystemSection onNavigateToDashboard={() => onNavigateToDashboard('dashboard')} />
        <PromoVideoSection />
        <WhyMetaFirm />
        <FutureVentures />
        <FinalCTA onNavigateToDashboard={() => onNavigateToDashboard('dashboard')} />
      </main>

      {/* Footer */}
      <VenturesFooter />

      {/* Reused Authenticated User Bottom Navigation */}
      {user && (
        <BottomNav
          activeTab={'dashboard'}
          setActiveTab={handleBottomNavClick}
          variant="dark"
        />
      )}

      {/* Exclusive Promotions Modal */}
      <OfferPromoModal
        isOpen={isPromoModalOpen}
        onClose={() => setIsPromoModalOpen(false)}
        onNavigate={(tab) => {
          setIsPromoModalOpen(false);
          onNavigateToDashboard(tab);
        }}
      />
    </div>
  );
};

export default VenturesPage;
