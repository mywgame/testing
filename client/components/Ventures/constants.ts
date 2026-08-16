/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export const GPU_IMG = 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=1400&h=800&fit=crop&auto=format';
export const SOLAR_IMG = 'https://images.unsplash.com/photo-1670519808728-335b1eb2ef52?w=1200&h=700&fit=crop&auto=format';
export const NETWORK_IMG = 'https://images.unsplash.com/photo-1758073519996-6d3c63b4922c?w=1400&h=800&fit=crop&auto=format';
export const TRADING_IMG = 'https://images.unsplash.com/photo-1745509267699-1b1db256601e?w=1200&h=700&fit=crop&auto=format';

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
