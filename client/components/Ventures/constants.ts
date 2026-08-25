/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export const GPU_IMG = 'https://pub-9c62303890854a49a9eda8efb728c7ff.r2.dev/venture/images/datacenter.jpeg';
export const SOLAR_IMG = 'https://pub-9c62303890854a49a9eda8efb728c7ff.r2.dev/venture/images/solar-farm.jpeg';
export const NETWORK_IMG = 'https://pub-9c62303890854a49a9eda8efb728c7ff.r2.dev/venture/images/hero-network.jpeg';
export const TRADING_IMG = 'https://pub-9c62303890854a49a9eda8efb728c7ff.r2.dev/venture/images/funded-trading.jpeg';
export const REFER_BANNER_IMG = 'https://pub-9c62303890854a49a9eda8efb728c7ff.r2.dev/assets/images/branding/reffer.webp';
export const MILESTONE_BANNER_IMG = 'https://pub-9c62303890854a49a9eda8efb728c7ff.r2.dev/assets/images/branding/milestone.webp';

export interface HeroSlide {
  img: string;
  label: string;
  title: string;
  subtitle?: string;
  overlay: string;
  actionText?: string;
  actionTab?: 'team' | 'deposit' | 'task' | 'dashboard';
  badgeColor?: string;
  dotColor?: string;
}

export const HERO_SLIDES: HeroSlide[] = [
  {
    img: REFER_BANNER_IMG,
    label: 'Referral Bonus',
    title: 'Refer and Earn $0.10 USDT per Registration',
    subtitle: 'Invite your friends to register and earn instant referral bonus rewards credited to your balance.',
    overlay: 'linear-gradient(135deg, rgba(4,9,26,0.2) 0%, rgba(88,28,135,0.15) 50%, rgba(4,9,26,0.3) 100%)',
    actionText: 'Refer Friends Now',
    actionTab: 'team',
    badgeColor: 'bg-purple-500/25 text-purple-200 border-purple-400/50 shadow-xs',
    dotColor: 'bg-purple-400',
  },
  {
    img: MILESTONE_BANNER_IMG,
    label: 'Milestone Rewards',
    title: 'Deposit Milestones — Extra USDT Bonuses',
    subtitle: 'Reach cumulative deposit tiers ($100, $500, $1,000) and unlock instant bonus rewards in your wallet.',
    overlay: 'linear-gradient(135deg, rgba(4,9,26,0.2) 0%, rgba(30,58,138,0.15) 50%, rgba(4,9,26,0.3) 100%)',
    actionText: 'Make a Deposit',
    actionTab: 'deposit',
    badgeColor: 'bg-cyan-500/25 text-cyan-200 border-cyan-400/50 shadow-xs',
    dotColor: 'bg-cyan-400',
  },
  {
    img: NETWORK_IMG,
    label: 'MetaFirm Ecosystem',
    title: 'MetaFirm Ventures — 2025 Vision',
    subtitle: 'Exploring next-generation decentralized ventures across compute, energy, and digital economies.',
    overlay: 'linear-gradient(135deg, rgba(4,9,26,0.35) 0%, rgba(60,30,120,0.15) 50%, rgba(4,9,26,0.3) 100%)',
    actionText: 'Explore Ecosystem',
    actionTab: 'dashboard',
    badgeColor: 'bg-indigo-500/25 text-indigo-200 border-indigo-400/50 shadow-xs',
    dotColor: 'bg-indigo-400',
  },
  {
    img: GPU_IMG,
    label: 'GPU Computing Farms',
    title: 'Scalable Infrastructure for the AI Economy',
    subtitle: 'Decentralized high-throughput GPU clusters delivering cost-efficient training and inference bandwidth.',
    overlay: 'linear-gradient(135deg, rgba(4,9,26,0.35) 0%, rgba(6,50,80,0.2) 50%, rgba(4,9,26,0.3) 100%)',
  },
  {
    img: SOLAR_IMG,
    label: 'Solar Energy Farms',
    title: 'Renewable Power for the Digital Age',
    subtitle: 'Clean zero-carbon energy grids feeding high-density compute clusters worldwide.',
    overlay: 'linear-gradient(135deg, rgba(4,9,26,0.35) 0%, rgba(10,50,30,0.2) 50%, rgba(4,9,26,0.3) 100%)',
  },
];

