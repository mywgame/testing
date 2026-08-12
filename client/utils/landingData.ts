/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface CompanyInfo {
  name: string;
  tagline: string;
  description: string;
  mission: string;
  vision: string;
  transparencyPolicy: string;
  globalExpansionPlan: string;
  innovationFocus: string;
}

export interface TrustIndicator {
  id: string;
  title: string;
  description: string;
  iconName: string;
}

export interface FeatureCard {
  id: string;
  title: string;
  description: string;
  iconName: string;
}

export interface TimelineStep {
  step: number;
  title: string;
  description: string;
}

export interface VipTier {
  id: string;
  name: string;
  minInvestment: string;
  rewardRate: string;
  features: string[];
  popular?: boolean;
}

export interface StatItem {
  id: string;
  label: string;
  value: string;
  numericValue: number;
  suffix: string;
}

export interface SecurityHighlight {
  id: string;
  title: string;
  description: string;
  iconName: string;
}

export interface FaqItem {
  id: string;
  question: string;
  answer: string;
}

export interface ContactInfo {
  supportEmail: string;
  businessEmail: string;
  workingHours: string;
  officeLocationPlaceholder: string;
  phonePlaceholder: string;
}

// Configurable Company Profile
export const companyInfo: CompanyInfo = {
  name: 'MetaFirm',
  tagline: 'Institutional-Grade MetaFirm Investment Platform',
  description: 'A global centralized finance leader providing secure, high-yield digital asset investments, backed by robust encryption, licensed partners, and transparent auditing.',
  mission: 'To democratize access to high-yield interest generation and secure wealth growth by bridging the gap between traditional finance trust and modern block ledger yields.',
  vision: 'To build the world\'s most trusted, accessible, and compliant digital wealth ecosystem for retail and institutional investors globally.',
  transparencyPolicy: '100% full-reserve backing with real-time audit logs, public cold wallet declarations, and zero-leverage lending models designed for stability.',
  globalExpansionPlan: 'Actively establishing licensed subsidiaries across Europe, Asia-Pacific, and the Americas to offer fully compliant regional digital banking integrations.',
  innovationFocus: 'Leveraging automated quantitative liquidity provision, market-neutral arbitrage, and institutional custody partnerships.',
};

// Trust Indicators (Trust Section)
export const trustIndicators: TrustIndicator[] = [
  {
    id: 'sec',
    title: 'Enterprise Security',
    description: 'Hardware security modules, multi-signature transaction processing, and bank-grade cold storage custody.',
    iconName: 'Shield',
  },
  {
    id: 'infra',
    title: 'Global Infrastructure',
    description: 'Deploys across multiple secure regional nodes with 99.99% system uptime SLA.',
    iconName: 'Globe',
  },
  {
    id: 'verify',
    title: 'Verified Platform',
    description: 'Third-party audited smart ledgers, real-time proof of reserves, and active license adherence.',
    iconName: 'CheckCircle',
  },
  {
    id: 'support',
    title: '24/7 Priority Support',
    description: 'Instant resolution and dedicated account managers for institutional accounts.',
    iconName: 'Headphones',
  },
  {
    id: 'trans',
    title: 'Transparent Operations',
    description: 'Clear reporting, instant performance tracking, and no hidden or predatory withdrawal fees.',
    iconName: 'Eye',
  },
  {
    id: 'tech',
    title: 'Premium Technology',
    description: 'Ultra-low latency trade matching engines and direct API endpoints for automated yield routing.',
    iconName: 'Cpu',
  },
];

// Why Choose Us Feature Cards
export const featureCards: FeatureCard[] = [
  {
    id: 'ent_sec',
    title: 'Enterprise-Grade Security',
    description: 'Every interaction is protected by state-of-the-art secure cookies, CSRF protection, and standard JWT credentials.',
    iconName: 'Lock',
  },
  {
    id: 'daily_yield',
    title: 'Daily Compound Yield',
    description: 'Earn steady passive rewards on your asset balance, credited and fully liquid on a daily basis.',
    iconName: 'Coins',
  },
  {
    id: 'fast_withdraw',
    title: 'Accelerated Withdrawals',
    description: 'Withdraw funds securely with minimal processing delays. Capital safety is our paramount priority.',
    iconName: 'ArrowUpRight',
  },
  {
    id: 'ref_prog',
    title: 'Referral Partnership Program',
    description: 'Invite friends, track structures, and earn dynamic bonuses on successful referred account generation.',
    iconName: 'Users',
  },
  {
    id: 'glob_access',
    title: 'Global High Accessibility',
    description: 'Designed to cater to global market-makers and individual wealth generation alike, without borders.',
    iconName: 'Map',
  },
  {
    id: 'prof_dash',
    title: 'Professional Dashboard',
    description: 'Sleek, intuitive interface that enables rapid tracking of portfolios, yields, and referrals.',
    iconName: 'Layout',
  },
  {
    id: 'realtime_anal',
    title: 'Real-time Analytics',
    description: 'In-depth performance metrics, interactive visual timelines, and active transaction audit logs.',
    iconName: 'TrendingUp',
  },
  {
    id: 'rel_infra',
    title: 'Reliable Cloud Core',
    description: 'Powered by highly available Postgres systems and standard full-stack Node.js environments.',
    iconName: 'Server',
  },
];

// How It Works Timeline Steps
export const timelineSteps: TimelineStep[] = [
  {
    step: 1,
    title: 'Create Verified Account',
    description: 'Generate your personal platform account under our secure, encrypted registry.',
  },
  {
    step: 2,
    title: 'Secure Account Login',
    description: 'Log in with multi-device protection and establish an active verified user session.',
  },
  {
    step: 3,
    title: 'Allocate Funding Balance',
    description: 'Wire or transfer digital assets directly to our premium secure custodian storage accounts.',
  },
  {
    step: 4,
    title: 'Receive Daily Yield',
    description: 'Watch your wealth compound. Passive payouts are calculated and credited every 24 hours.',
  },
  {
    step: 5,
    title: 'Build Strategic Team',
    description: 'Share your referral link with investors to construct a high-performing partnership circle.',
  },
  {
    step: 6,
    title: 'Claim Compound Rewards',
    description: 'Redeem accrued referral bonuses and yield payouts at any time directly into your external wallets.',
  },
];

// VIP Preview Tiers
export const vipTiers: VipTier[] = [
  {
    id: 'vip1',
    name: 'VIP Standard Tier 1',
    minInvestment: '$500',
    rewardRate: '0.85% Daily',
    features: ['Standard Ledger Rewards', 'Regular Withdrawal Times', 'Basic Account Auditing'],
  },
  {
    id: 'vip2',
    name: 'VIP Bronze Tier 2',
    minInvestment: '$2,500',
    rewardRate: '1.20% Daily',
    features: ['Enhanced Daily Yield', 'Priority Processing (12h)', 'Basic Partnership Bonuses'],
  },
  {
    id: 'vip3',
    name: 'VIP Silver Tier 3',
    minInvestment: '10,000',
    rewardRate: '1.65% Daily',
    features: ['Premium Daily Yield', 'Fast Processing (4h)', 'Double Referral Commission', 'Weekly Audit Reports'],
    popular: true,
  },
  {
    id: 'vip4',
    name: 'VIP Gold Tier 4',
    minInvestment: '$50,000',
    rewardRate: '2.10% Daily',
    features: ['Institutional Daily Payouts', 'Instant Automated Processing', 'Dedicated Support Manager', 'Full API Access Enabled'],
  },
  {
    id: 'vip5',
    name: 'VIP Executive Platinum 5',
    minInvestment: '$250,000',
    rewardRate: '2.75% Daily',
    features: ['Maximum Yield Multiplier', 'Instant Dedicated OTC Liquidity', 'Custom Account Strategies', 'Annual Corporate Retreat Invites'],
  },
];

// Platform Statistics
export const platformStats: StatItem[] = [
  {
    id: 'members',
    label: 'Registered Platform Members',
    value: '45,820+',
    numericValue: 45820,
    suffix: '+',
  },
  {
    id: 'countries',
    label: 'Global Active Countries',
    value: '142',
    numericValue: 142,
    suffix: '',
  },
  {
    id: 'assets',
    label: 'Total Digital Assets Managed',
    value: '$1.48B',
    numericValue: 1.48,
    suffix: 'B+',
  },
  {
    id: 'transactions',
    label: 'Processed Core Transactions',
    value: '8.2M+',
    numericValue: 8.2,
    suffix: 'M+',
  },
  {
    id: 'liquidity',
    label: 'Immediate Capital Liquidity Ratio',
    value: '135%',
    numericValue: 135,
    suffix: '%',
  },
];

// Security Highlight Section
export const securityHighlights: SecurityHighlight[] = [
  {
    id: 'sec_auth',
    title: 'Enterprise Authentication',
    description: 'We protect against session hijacking using strict secure cookie storage. JWT authentication prevents unauthorized API interactions.',
    iconName: 'Fingerprint',
  },
  {
    id: 'sec_infra',
    title: 'Encrypted Infrastructure',
    description: 'Our Postgres core relies on hardened schemas, secure database connection pools, and strict SQL input sanitation.',
    iconName: 'ServerCrash',
  },
  {
    id: 'sec_session',
    title: 'Secure Sessions & Logging',
    description: 'Every auth lifecycle event is audited and written to security ledgers with failed login account lockout limits.',
    iconName: 'Activity',
  },
  {
    id: 'sec_risk',
    title: 'Proactive Risk Monitoring',
    description: 'Advanced heuristic analysis models inspect transaction streams constantly to detect anomaly activity instantly.',
    iconName: 'Eye',
  },
  {
    id: 'sec_protect',
    title: 'Advanced Ledger Protection',
    description: 'Cryptographically hashed passwords and multiple rate limit constraints ensure brute-force resiliency.',
    iconName: 'ShieldAlert',
  },
];

// FAQs
export const faqItems: FaqItem[] = [
  {
    id: 'faq1',
    question: 'How does the MetaFirm investment architecture secure my digital capital?',
    answer: 'We utilize multi-signature cold custody vaults partnered with fully licensed and insured global financial custodians. Your asset balance is managed with conservative, market-neutral arbitrage models, completely eliminating direction-based asset risk.',
  },
  {
    id: 'faq2',
    question: 'What is the minimum deposit required to start earning daily interest yield?',
    answer: 'Our standard platform participation begins at $500 (VIP Tier 1), allowing you to experience fully automated interest compounding with complete liquidity visibility.',
  },
  {
    id: 'faq3',
    question: 'How are my daily passive income payouts calculated and distributed?',
    answer: 'Daily interest is calculated automatically on your aggregate account balance at 00:00 UTC and instantly credited to your active wallet, becoming immediately available for compounding or withdrawal.',
  },
  {
    id: 'faq4',
    question: 'How does the referral network program work, and what are the rewards?',
    answer: 'By sharing your custom referral link, you can introduce other investors. When their verified account generates daily interest yields, you receive a dynamic partnership bonus credited automatically to your account ledger.',
  },
  {
    id: 'faq5',
    question: 'Are there any hidden fees or locking periods for platform deposits?',
    answer: 'No. Transparent operations is a core pillar of our platform. Deposits have clear performance statistics, and you can withdraw your principal and yield within standard tiered processing times without any administrative penalties.',
  },
];

// Contact Details
export const contactDetails: ContactInfo = {
  supportEmail: 'support@metafirm.io',
  businessEmail: 'institutional@metafirm.io',
  workingHours: '24/7/365 Global Coverage (Priority SLA: Under 15 Minutes)',
  officeLocationPlaceholder: 'Financial District, London, UK / Marina Bay Sands, Singapore',
  phonePlaceholder: '+44 (0) 20 7946 0192',
};
