/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export const GPU_IMG = 'https://pub-9c62303890854a49a9eda8efb728c7ff.r2.dev/venture/images/datacenter.jpeg';
export const SOLAR_IMG = 'https://pub-9c62303890854a49a9eda8efb728c7ff.r2.dev/venture/images/solar-farm.jpeg';
export const NETWORK_IMG = 'https://pub-9c62303890854a49a9eda8efb728c7ff.r2.dev/venture/images/hero-network.jpeg';
export const TRADING_IMG = 'https://pub-9c62303890854a49a9eda8efb728c7ff.r2.dev/venture/images/funded-trading.jpeg';

export interface HeroSlide {
  img: string;
  label: string;
  title: string;
  overlay: string;
}

export const HERO_SLIDES: HeroSlide[] = [
  {
    img: NETWORK_IMG,
    label: 'Promotional',
    title: 'MetaFirm Ventures — 2025 Vision',
    overlay: 'linear-gradient(135deg, rgba(4,9,26,0.35) 0%, rgba(60,30,120,0.15) 50%, rgba(4,9,26,0.3) 100%)',
  },
  {
    img: GPU_IMG,
    label: 'GPU Computing Farms',
    title: 'Scalable Infrastructure for the AI Economy',
    overlay: 'linear-gradient(135deg, rgba(4,9,26,0.35) 0%, rgba(6,50,80,0.2) 50%, rgba(4,9,26,0.3) 100%)',
  },
  {
    img: SOLAR_IMG,
    label: 'Solar Energy Farms',
    title: 'Renewable Power for the Digital Age',
    overlay: 'linear-gradient(135deg, rgba(4,9,26,0.35) 0%, rgba(10,50,30,0.2) 50%, rgba(4,9,26,0.3) 100%)',
  },
];
