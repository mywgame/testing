/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
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
import { useAuth } from '../../hooks/useAuth.ts';

interface VenturesPageProps {
  onNavigateToDashboard: (tab?: DashboardTab) => void;
  onLogout: () => void;
}

export const VenturesPage: React.FC<VenturesPageProps> = ({
  onNavigateToDashboard,
  onLogout,
}) => {
  const { user } = useAuth();

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
        <HeroSection onNavigateToDashboard={() => onNavigateToDashboard('dashboard')} />
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
    </div>
  );
};

export default VenturesPage;
