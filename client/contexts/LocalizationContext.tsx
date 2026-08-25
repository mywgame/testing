/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

export type SupportedLanguage = 'en' | 'hi' | 'es' | 'ar' | 'vi' | 'de' | 'ja' | 'zh' | 'id';
export type SupportedCurrency = 'USD' | 'INR' | 'EUR' | 'GBP' | 'AED' | 'CAD' | 'AUD' | 'JPY' | 'BRL' | 'PKR' | 'VND' | 'CNY' | 'IDR';
export type SupportedTimeFormat = '12h' | '24h';

export interface CurrencyMeta {
  code: SupportedCurrency;
  name: string;
  symbol: string;
  rate: number; // Conversion rate relative to 1 USDT/USD
  label: string;
}

export const BASE_CURRENCIES: Record<SupportedCurrency, CurrencyMeta> = {
  USD: { code: 'USD', name: 'US Dollar', symbol: '$', rate: 1.0, label: 'USD ($)' },
  INR: { code: 'INR', name: 'Indian Rupee', symbol: '₹', rate: 95.75, label: 'INR (₹)' },
  EUR: { code: 'EUR', name: 'Euro', symbol: '€', rate: 0.856, label: 'EUR (€)' },
  GBP: { code: 'GBP', name: 'British Pound', symbol: '£', rate: 0.733, label: 'GBP (£)' },
  AED: { code: 'AED', name: 'UAE Dirham', symbol: 'د.إ', rate: 3.6725, label: 'AED (د.إ)' },
  CNY: { code: 'CNY', name: 'Chinese Yuan', symbol: '¥', rate: 7.24, label: 'CNY (¥)' },
  IDR: { code: 'IDR', name: 'Indonesian Rupiah', symbol: 'Rp', rate: 16250, label: 'IDR (Rp)' },
  CAD: { code: 'CAD', name: 'Canadian Dollar', symbol: 'CA$', rate: 1.362, label: 'CAD (CA$)' },
  AUD: { code: 'AUD', name: 'Australian Dollar', symbol: 'AU$', rate: 1.524, label: 'AUD (AU$)' },
  JPY: { code: 'JPY', name: 'Japanese Yen', symbol: '¥', rate: 154.5, label: 'JPY (¥)' },
  BRL: { code: 'BRL', name: 'Brazilian Real', symbol: 'R$', rate: 5.65, label: 'BRL (R$)' },
  PKR: { code: 'PKR', name: 'Pakistani Rupee', symbol: '₨', rate: 278.5, label: 'PKR (₨)' },
  VND: { code: 'VND', name: 'Vietnamese Dong', symbol: '₫', rate: 25450, label: 'VND (₫)' },
};

export const CURRENCIES = BASE_CURRENCIES;

export const DICTIONARY: Record<SupportedLanguage, Record<string, string>> = {
  en: {
    // Nav & Tabs
    dashboard: 'Dashboard',
    vip: 'VIP Club',
    profile: 'Profile',
    team: 'My Team',
    transactions: 'Transactions',
    security: 'Security',
    twoFactor: 'Two-Factor Authentication',
    withdrawalAddresses: 'Withdrawal Addresses',
    settings: 'Settings',
    support: 'Support',
    deposit: 'Deposit',
    withdraw: 'Withdraw',
    staking: 'Staking',
    task: 'Task',
    logout: 'Logout',
    home: 'Home',
    history: 'History',

    // Hero & Stats
    totalBalance: 'Total Balance',
    totalEarned: 'Total Earned',
    totalWithdrawn: 'Total Withdrawn',
    dailyYield: 'Daily Yield',
    referralIncome: 'Referral Income',
    teamIncome: 'Team Income',
    incentiveIncome: 'Incentive Income',
    today: 'Today',
    total: 'Total',
    activeStreak: 'Active Streak',
    metafirmWallet: 'MetaFirm Wallet',

    // Actions & Cards
    triggerClaim: 'Trigger Claim',
    claimDailyReward: 'Claim Daily Reward',
    claimed: 'Claimed',
    cooldown: 'Cooldown',
    monthlyEarnings: 'Monthly Earnings',
    recentTransactions: 'Recent Activity',
    viewAll: 'View All',
    days: 'Days',
    hours: 'Hours',
    minutes: 'Minutes',
    seconds: 'Seconds',

    // Settings
    accountSettings: 'Account & App Settings',
    settingsSubtitle: 'Customize your regional display, notifications, balance privacy, and interface preferences.',
    saveChanges: 'Save Changes',
    saved: 'Saved!',
    regionalLocalization: 'Regional & Localization',
    platformLanguage: 'Platform Display Language',
    referenceCurrency: 'Reference Currency (USDT base)',
    timestampDisplay: 'Timestamp & Date Display',
    displayPrivacy: 'Display & Privacy Preferences',
    themeAppearance: 'Theme Appearance',
    maskBalances: 'Mask Balances by Default',
    audioEffects: 'Audio Chimes & Sound Effects',
    notificationPreferences: 'Notification & Alert Preferences',
    depositAlerts: 'Deposit & Withdrawal Payout Alerts',
    yieldAlerts: 'Daily Staking Yield Summary',
    securityAlerts: 'Security & Unrecognized Login Alerts',
    taskAlerts: 'Task & Promotional Announcements',
    alwaysOn: 'Always On',
    resetDiagnostics: 'Reset & Diagnostics',
    clearCache: 'Clear Local Cache',
    securityShortcuts: 'Security Center Shortcuts',
    accountOverview: 'Account Profile Overview',
  },
  hi: {
    // Nav & Tabs
    dashboard: 'डैशबोर्ड',
    vip: 'वीआईपी क्लब',
    profile: 'प्रोफ़ाइल',
    team: 'मेरी टीम',
    transactions: 'लेन-देन',
    security: 'सुरक्षा',
    twoFactor: 'टू-फैक्टर प्रमाणीकरण',
    withdrawalAddresses: 'निकासी पते',
    settings: 'सेटिंग्स',
    support: 'सहायता केंद्र',
    deposit: 'जमा करें',
    withdraw: 'निकासी',
    staking: 'स्टेकिंग',
    task: 'टास्क / कार्य',
    logout: 'लॉगआउट',
    home: 'होम',
    history: 'इतिहास',

    // Hero & Stats
    totalBalance: 'कुल बैलेंस',
    totalEarned: 'कुल कमाई',
    totalWithdrawn: 'कुल निकासी',
    dailyYield: 'दैनिक यील्ड',
    referralIncome: 'रेफरल आय',
    teamIncome: 'टीम आय',
    incentiveIncome: 'प्रोत्साहन आय',
    today: 'आज',
    total: 'कुल',
    activeStreak: 'सक्रिय स्ट्रीक',
    metafirmWallet: 'मेटाफ़र्म वॉलेट',

    // Actions & Cards
    triggerClaim: 'रिवॉर्ड क्लेम करें',
    claimDailyReward: 'दैनिक पुरस्कार प्राप्त करें',
    claimed: 'प्राप्त किया',
    cooldown: 'कूलडाउन',
    monthlyEarnings: 'मासिक आय चार्ट',
    recentTransactions: 'हाल की गतिविधियां',
    viewAll: 'सभी देखें',
    days: 'दिन',
    hours: 'घंटे',
    minutes: 'मिनट',
    seconds: 'सेकंड',

    // Settings
    accountSettings: 'खाता और ऐप सेटिंग्स',
    settingsSubtitle: 'अपनी क्षेत्रीय भाषा, मुद्रा, सूचनाएं, बैलेंस गोपनीयता और इंटरफ़ेस प्राथमिकताएं सेट करें।',
    saveChanges: 'परिवर्तन सहेजें',
    saved: 'सहेजा गया!',
    regionalLocalization: 'क्षेत्रीय और स्थानीयकरण',
    platformLanguage: 'प्लेटफ़ॉर्म डिस्प्ले भाषा',
    referenceCurrency: 'संदर्भ मुद्रा (USDT आधार)',
    timestampDisplay: 'समय और दिनांक प्रदर्शन',
    displayPrivacy: 'डिस्प्ले और गोपनीयता प्राथमिकताएं',
    themeAppearance: 'थीम दिखावट',
    maskBalances: 'बैलेंस छुपाएं (••••••)',
    audioEffects: 'ऑडियो ध्वनि प्रभाव',
    notificationPreferences: 'अधिसूचना और चेतावनी प्राथमिकताएं',
    depositAlerts: 'जमा और निकासी अलर्ट',
    yieldAlerts: 'दैनिक स्टेकिंग यील्ड सारांश',
    securityAlerts: 'सुरक्षा और लॉगिन अलर्ट',
    taskAlerts: 'टास्क और प्रचार घोषणाएं',
    alwaysOn: 'हमेशा चालू',
    resetDiagnostics: 'रीसेट और डायग्नोस्टिक्स',
    clearCache: 'लोकल कैश साफ़ करें',
    securityShortcuts: 'सुरक्षा शॉर्टकट',
    accountOverview: 'खाता प्रोफ़ाइल अवलोकन',
  },
  es: {
    dashboard: 'Panel Principal',
    vip: 'Club VIP',
    profile: 'Perfil',
    team: 'Mi Equipo',
    transactions: 'Transacciones',
    security: 'Seguridad',
    twoFactor: 'Autenticación 2FA',
    withdrawalAddresses: 'Direcciones de Retiro',
    settings: 'Configuración',
    support: 'Soporte',
    deposit: 'Depositar',
    withdraw: 'Retirar',
    staking: 'Staking',
    task: 'Tareas',
    logout: 'Cerrar Sesión',
    home: 'Inicio',
    history: 'Historial',
    totalBalance: 'Balance Total',
    totalEarned: 'Total Ganado',
    totalWithdrawn: 'Total Retirado',
    dailyYield: 'Rendimiento Diario',
    referralIncome: 'Ingresos Referidos',
    teamIncome: 'Ingresos de Equipo',
    incentiveIncome: 'Ingresos Incentivo',
    today: 'Hoy',
    total: 'Total',
    activeStreak: 'Racha Activa',
    metafirmWallet: 'Billetera MetaFirm',
    triggerClaim: 'Reclamar Rendimiento',
    claimDailyReward: 'Reclamar Recompensa Diaria',
    claimed: 'Reclamado',
    cooldown: 'Espera',
    monthlyEarnings: 'Ganancias Mensuales',
    recentTransactions: 'Actividad Reciente',
    viewAll: 'Ver Todo',
    days: 'Días',
    hours: 'Horas',
    minutes: 'Minutos',
    seconds: 'Segundos',
    accountSettings: 'Ajustes de Cuenta y Aplicación',
    settingsSubtitle: 'Personalice su idioma, moneda, alertas de notificación y privacidad.',
    saveChanges: 'Guardar Cambios',
    saved: '¡Guardado!',
    regionalLocalization: 'Regional y Localización',
    platformLanguage: 'Idioma de la Plataforma',
    referenceCurrency: 'Moneda de Referencia (Base USDT)',
    timestampDisplay: 'Formato de Fecha y Hora',
    displayPrivacy: 'Pantalla y Privacidad',
    themeAppearance: 'Apariencia del Tema',
    maskBalances: 'Ocultar Saldos (••••••)',
    audioEffects: 'Efectos de Sonido',
    notificationPreferences: 'Preferencias de Notificaciones',
    depositAlerts: 'Alertas de Depósitos y Retiros',
    yieldAlerts: 'Resumen de Rendimiento Diario',
    securityAlerts: 'Alertas de Seguridad y Acceso',
    taskAlerts: 'Anuncios de Tareas y Promociones',
    alwaysOn: 'Siempre Activo',
    resetDiagnostics: 'Restablecer y Diagnóstico',
    clearCache: 'Limpiar Caché Local',
    securityShortcuts: 'Accesos Directos de Seguridad',
    accountOverview: 'Resumen de la Cuenta',
  },
  ar: {
    dashboard: 'لوحة التحكم',
    vip: 'نادي VIP',
    profile: 'الملف الشخصي',
    team: 'فريقي',
    transactions: 'المعاملات',
    security: 'الأمان',
    twoFactor: 'المصادقة الثنائية',
    withdrawalAddresses: 'عناوين السحب',
    settings: 'الإعدادات',
    support: 'الدعم الفني',
    deposit: 'إيداع',
    withdraw: 'سحب',
    staking: 'الستاكينغ',
    task: 'المهام',
    logout: 'تسجيل الخروج',
    home: 'الرئيسية',
    history: 'السجل',
    totalBalance: 'إجمالي الرصيد',
    totalEarned: 'إجمالي الأرباح',
    totalWithdrawn: 'إجمالي المسحوبات',
    dailyYield: 'العائد اليومي',
    referralIncome: 'أرباح الإحالة',
    teamIncome: 'أرباح الفريق',
    incentiveIncome: 'أرباح الحوافز',
    today: 'اليوم',
    total: 'الإجمالي',
    activeStreak: 'التتابع النشط',
    metafirmWallet: 'محفظة MetaFirm',
    triggerClaim: 'المطالبة بالعائد',
    claimDailyReward: 'المطالبة بالمكافأة اليومية',
    claimed: 'تمت المطالبة',
    cooldown: 'فترة الانتظار',
    monthlyEarnings: 'الأرباح الشهرية',
    recentTransactions: 'النشاط الأخير',
    viewAll: 'عرض الكل',
    days: 'أيام',
    hours: 'ساعات',
    minutes: 'دقائق',
    seconds: 'ثواني',
    accountSettings: 'إعدادات الحساب والتطبيق',
    settingsSubtitle: 'تخصيص العرض الإقليمي، الإشعارات، وخصوصية الرصيد.',
    saveChanges: 'حفظ التغييرات',
    saved: 'تم الحفظ!',
    regionalLocalization: 'الموقع والإعدادات الإقليمية',
    platformLanguage: 'لغة المنصة',
    referenceCurrency: 'العملة المرجعية',
    timestampDisplay: 'تنسيق الوقت والتاريخ',
    displayPrivacy: 'العرض والخصوصية',
    themeAppearance: 'مظهر السمة',
    maskBalances: 'إخفاء الأرصدة (••••••)',
    audioEffects: 'المؤثرات الصوتية',
    notificationPreferences: 'تفضيلات الإشعارات',
    depositAlerts: 'تنبيهات الإيداع والسحب',
    yieldAlerts: 'ملخص العائد اليومي',
    securityAlerts: 'تنبيهات الأمان وتوثيق الدخول',
    taskAlerts: 'إعلانات المهام والعروض',
    alwaysOn: 'مفعل دائمًا',
    resetDiagnostics: 'إعادة التعيين والتشخيص',
    clearCache: 'مسح الذاكرة المؤقتة',
    securityShortcuts: 'اختصارات الأمان',
    accountOverview: 'نظرة عامة على الحساب',
  },
  vi: {
    dashboard: 'Bảng Điều Khiển',
    vip: 'Câu Lạc Bộ VIP',
    profile: 'Hồ Sơ',
    team: 'Đội Nhóm',
    transactions: 'Giao Dịch',
    security: 'Bảo Mật',
    twoFactor: 'Xác Thực 2FA',
    withdrawalAddresses: 'Địa Chỉ Rút Tiền',
    settings: 'Cài Đặt',
    support: 'Hỗ Trợ',
    deposit: 'Nạp Tiền',
    withdraw: 'Rút Tiền',
    staking: 'Staking',
    task: 'Nhiệm Vụ',
    logout: 'Đăng Xuất',
    home: 'Trang Chủ',
    history: 'Lịch Sử',
    totalBalance: 'Tổng Số Dư',
    totalEarned: 'Tổng Thu Nhập',
    totalWithdrawn: 'Tổng Đã Rút',
    dailyYield: 'Lợi Nhuận Hàng Ngày',
    referralIncome: 'Thu Nhập Giới Thiệu',
    teamIncome: 'Thu Nhập Đội Nhóm',
    incentiveIncome: 'Thu Nhập Khuyến Khích',
    today: 'Hôm Nay',
    total: 'Tổng Cộng',
    activeStreak: 'Chuỗi Hoạt Động',
    metafirmWallet: 'Ví MetaFirm',
    triggerClaim: 'Nhận Lợi Nhuận',
    claimDailyReward: 'Nhận Thưởng Hàng Ngày',
    claimed: 'Đã Nhận',
    cooldown: 'Chờ Làm Mới',
    monthlyEarnings: 'Thu Nhập Hàng Tháng',
    recentTransactions: 'Hoạt Động Gần Đây',
    viewAll: 'Xem Tất Cả',
    days: 'Ngày',
    hours: 'Giờ',
    minutes: 'Phút',
    seconds: 'Giây',
    accountSettings: 'Cài Đặt Tài Khoản & Ứng Dụng',
    settingsSubtitle: 'Tùy chỉnh ngôn ngữ, đơn vị tiền tệ, thông báo và quyền riêng tư.',
    saveChanges: 'Lưu Thay Đổi',
    saved: 'Đã Lưu!',
    regionalLocalization: 'Khu Vực & Bản Địa Hóa',
    platformLanguage: 'Ngôn Ngữ Hiển Thị',
    referenceCurrency: 'Tiền Tệ Tham Chiếu (Gốc USDT)',
    timestampDisplay: 'Định Dạng Thời Gian & Ngày',
    displayPrivacy: 'Hiển Thị & Quyền Riêng Tư',
    themeAppearance: 'Giao Diện Chủ Đề',
    maskBalances: 'Ẩn Số Dư (••••••)',
    audioEffects: 'Hiệu Ứng Âm Thanh',
    notificationPreferences: 'Tùy Chọn Thông Báo',
    depositAlerts: 'Cảnh Báo Nạp & Rút Tiền',
    yieldAlerts: 'Tóm Tắt Lợi Nhuận Hàng Ngày',
    securityAlerts: 'Cảnh Báo Bảo Mật & Đăng Nhập',
    taskAlerts: 'Thông Báo Nhiệm Vụ & Sự Kiện',
    alwaysOn: 'Luôn Bật',
    resetDiagnostics: 'Đặt Lại & Chẩn Đoán',
    clearCache: 'Xóa Bộ Nhớ Đệm',
    securityShortcuts: 'Lối Tắt Bảo Mật',
    accountOverview: 'Tổng Quan Tài Khoản',
  },
  de: {
    dashboard: 'Dashboard',
    vip: 'VIP Club',
    profile: 'Profil',
    team: 'Mein Team',
    transactions: 'Transaktionen',
    security: 'Sicherheit',
    twoFactor: 'Zwei-Faktor-Authentifizierung',
    withdrawalAddresses: 'Auszahlungsadressen',
    settings: 'Einstellungen',
    support: 'Kundenservice',
    deposit: 'Einzahlung',
    withdraw: 'Auszahlung',
    staking: 'Staking',
    task: 'Aufgaben',
    logout: 'Abmelden',
    home: 'Startseite',
    history: 'Verlauf',
    totalBalance: 'Gesamtsaldo',
    totalEarned: 'Gesamtverdienst',
    totalWithdrawn: 'Gesamtauszahlung',
    dailyYield: 'Tagesrendite',
    referralIncome: 'Empfehlungseinkommen',
    teamIncome: 'Teameinkommen',
    incentiveIncome: 'Prämieneinkommen',
    today: 'Heute',
    total: 'Gesamt',
    activeStreak: 'Aktive Serie',
    metafirmWallet: 'MetaFirm Wallet',
    triggerClaim: 'Ertrag Einfordern',
    claimDailyReward: 'Tagesbelohnung Beanspruchen',
    claimed: 'Beansprucht',
    cooldown: 'Wartezeit',
    monthlyEarnings: 'Monatlicher Ertrag',
    recentTransactions: 'Letzte Aktivitäten',
    viewAll: 'Alle Anzeigen',
    days: 'Tage',
    hours: 'Stunden',
    minutes: 'Minuten',
    seconds: 'Sekunden',
    accountSettings: 'Konto- und App-Einstellungen',
    settingsSubtitle: 'Passen Sie Sprache, Währung, Benachrichtigungen und Privatsphäre an.',
    saveChanges: 'Änderungen Speichern',
    saved: 'Gespeichert!',
    regionalLocalization: 'Region & Lokalisierung',
    platformLanguage: 'Anzeigesprache',
    referenceCurrency: 'Referenzwährung (Basis USDT)',
    timestampDisplay: 'Zeit- & Datumsformat',
    displayPrivacy: 'Anzeige & Privatsphäre',
    themeAppearance: 'Erscheinungsbild',
    maskBalances: 'Guthaben Maskieren (••••••)',
    audioEffects: 'Soundeffekte',
    notificationPreferences: 'Benachrichtigungseinstellungen',
    depositAlerts: 'Ein- & Auszahlungsbenachrichtigungen',
    yieldAlerts: 'Tägliche Renditeübersicht',
    securityAlerts: 'Sicherheits- & Anmeldehinweise',
    taskAlerts: 'Aufgaben- & Aktionsankündigungen',
    alwaysOn: 'Immer Aktiv',
    resetDiagnostics: 'Zurücksetzen & Diagnose',
    clearCache: 'Lokalen Cache Löschen',
    securityShortcuts: 'Sicherheits-Shortcuts',
    accountOverview: 'Kontoübersicht',
  },
  ja: {
    dashboard: 'ダッシュボード',
    vip: 'VIPクラブ',
    profile: 'プロフィール',
    team: 'マイチーム',
    transactions: '取引履歴',
    security: 'セキュリティ',
    twoFactor: '2段階認証 (2FA)',
    withdrawalAddresses: '出金先アドレス',
    settings: '設定',
    support: 'サポート',
    deposit: '入金',
    withdraw: '出金',
    staking: 'ステーキング',
    task: 'タスク',
    logout: 'ログアウト',
    home: 'ホーム',
    history: '履歴',
    totalBalance: '総残高',
    totalEarned: '総獲得額',
    totalWithdrawn: '総出金額',
    dailyYield: '日次利回り',
    referralIncome: '紹介報酬',
    teamIncome: 'チーム報酬',
    incentiveIncome: 'インセンティブ報酬',
    today: '本日',
    total: '合計',
    activeStreak: '連続ログイン',
    metafirmWallet: 'MetaFirmウォレット',
    triggerClaim: '利回りを請求',
    claimDailyReward: 'デイリー報酬を獲得',
    claimed: '受取済み',
    cooldown: 'クールダウン',
    monthlyEarnings: '月間収益チャート',
    recentTransactions: '最近の取引履歴',
    viewAll: 'すべて表示',
    days: '日',
    hours: '時間',
    minutes: '分',
    seconds: '秒',
    accountSettings: 'アカウント＆アプリ設定',
    settingsSubtitle: '言語、通貨、通知、残高のプライバシー表示を設定します。',
    saveChanges: '変更を保存',
    saved: '保存完了！',
    regionalLocalization: '地域と言語設定',
    platformLanguage: '表示言語',
    referenceCurrency: '表示通貨 (USDT基準)',
    timestampDisplay: '時刻・日付の表示形式',
    displayPrivacy: '表示とプライバシー',
    themeAppearance: 'テーマ設定',
    maskBalances: '残高を非表示 (••••••)',
    audioEffects: 'サウンド効果音',
    notificationPreferences: '通知設定',
    depositAlerts: '入出金アラート',
    yieldAlerts: '日次利回りサマリー',
    securityAlerts: 'セキュリティ＆ログインアラート',
    taskAlerts: 'タスク＆プロモーション通知',
    alwaysOn: '常時オン',
    resetDiagnostics: 'リセットと診断',
    clearCache: 'キャッシュをクリア',
    securityShortcuts: 'セキュリティショートカット',
    accountOverview: 'アカウント概要',
  },
  zh: {
    // Nav & Tabs
    dashboard: '仪表板',
    vip: 'VIP俱乐部',
    profile: '个人资料',
    team: '我的团队',
    transactions: '交易明细',
    security: '安全中心',
    twoFactor: '双重身份验证 (2FA)',
    withdrawalAddresses: '提现地址',
    settings: '设置',
    support: '在线客服',
    deposit: '充值',
    withdraw: '提现',
    staking: '质押生息',
    task: '任务中心',
    logout: '退出登录',
    home: '首页',
    history: '历史记录',

    // Hero & Stats
    totalBalance: '总资产折合',
    totalEarned: '累计总收益',
    totalWithdrawn: '累计提现',
    dailyYield: '每日静态收益',
    referralIncome: '直推邀请奖励',
    teamIncome: '团队分红收益',
    incentiveIncome: '激励奖励',
    today: '今日',
    total: '累计',
    activeStreak: '连续签到',
    metafirmWallet: 'MetaFirm 钱包',

    // Actions & Cards
    triggerClaim: '领取收益',
    claimDailyReward: '领取每日奖励',
    claimed: '已领取',
    cooldown: '冷却中',
    monthlyEarnings: '月度收益走势',
    recentTransactions: '最近交易动态',
    viewAll: '查看全部',
    days: '天',
    hours: '小时',
    minutes: '分',
    seconds: '秒',

    // Settings
    accountSettings: '账户与应用设置',
    settingsSubtitle: '自定义您的语言、显示货币、通知提醒和隐私偏好。',
    saveChanges: '保存更改',
    saved: '保存成功！',
    regionalLocalization: '地区与语言本地化',
    platformLanguage: '平台显示语言',
    referenceCurrency: '参考计价货币 (USDT基准)',
    timestampDisplay: '时间与日期格式',
    displayPrivacy: '显示与隐私设置',
    themeAppearance: '界面主题外观',
    maskBalances: '默认隐藏资产余额 (••••••)',
    audioEffects: '操作提示音效',
    notificationPreferences: '通知与提醒偏好',
    depositAlerts: '充值与提现到账提醒',
    yieldAlerts: '每日质押收益汇总',
    securityAlerts: '安全与异地登录提醒',
    taskAlerts: '任务与官方活动公告',
    alwaysOn: '始终开启',
    resetDiagnostics: '重置与诊断',
    clearCache: '清除本地缓存',
    securityShortcuts: '安全中心快捷方式',
    accountOverview: '账户基本信息',
  },
  id: {
    // Nav & Tabs
    dashboard: 'Dasbor',
    vip: 'Klub VIP',
    profile: 'Profil',
    team: 'Tim Saya',
    transactions: 'Transaksi',
    security: 'Keamanan',
    twoFactor: 'Autentikasi Dua Faktor (2FA)',
    withdrawalAddresses: 'Alamat Penarikan',
    settings: 'Pengaturan',
    support: 'Bantuan & Dukungan',
    deposit: 'Deposit',
    withdraw: 'Tarik Dana',
    staking: 'Staking',
    task: 'Tugas',
    logout: 'Keluar',
    home: 'Beranda',
    history: 'Riwayat',

    // Hero & Stats
    totalBalance: 'Total Saldo',
    totalEarned: 'Total Pendapatan',
    totalWithdrawn: 'Total Penarikan',
    dailyYield: 'Hasil Harian',
    referralIncome: 'Pendapatan Referral',
    teamIncome: 'Pendapatan Tim',
    incentiveIncome: 'Bonus & Insentif',
    today: 'Hari Ini',
    total: 'Total',
    activeStreak: 'Streak Aktif',
    metafirmWallet: 'Dompet MetaFirm',

    // Actions & Cards
    triggerClaim: 'Klaim Hasil',
    claimDailyReward: 'Klaim Hadiah Harian',
    claimed: 'Sudah Diklaim',
    cooldown: 'Cooldown',
    monthlyEarnings: 'Grafik Pendapatan Bulanan',
    recentTransactions: 'Aktivitas Terkini',
    viewAll: 'Lihat Semua',
    days: 'Hari',
    hours: 'Jam',
    minutes: 'Menit',
    seconds: 'Detik',

    // Settings
    accountSettings: 'Pengaturan Akun & Aplikasi',
    settingsSubtitle: 'Sesuaikan bahasa, mata uang referensi, notifikasi, dan privasi saldo.',
    saveChanges: 'Simpan Perubahan',
    saved: 'Tersimpan!',
    regionalLocalization: 'Regional & Lokalisasi',
    platformLanguage: 'Bahasa Tampilan Platform',
    referenceCurrency: 'Mata Uang Referensi (Basis USDT)',
    timestampDisplay: 'Format Waktu & Tanggal',
    displayPrivacy: 'Tampilan & Privasi',
    themeAppearance: 'Tampilan Tema',
    maskBalances: 'Sembunyikan Saldo (••••••)',
    audioEffects: 'Efek Suara Audio',
    notificationPreferences: 'Preferensi Notifikasi & Peringatan',
    depositAlerts: 'Pemberitahuan Deposit & Penarikan',
    yieldAlerts: 'Ringkasan Hasil Staking Harian',
    securityAlerts: 'Peringatan Keamanan & Login',
    taskAlerts: 'Pengumuman Tugas & Promosi',
    alwaysOn: 'Selalu Aktif',
    resetDiagnostics: 'Reset & Diagnostik',
    clearCache: 'Hapus Cache Lokal',
    securityShortcuts: 'Pintasan Pusat Keamanan',
    accountOverview: 'Ikhtisar Profil Akun',
  },
};

export interface LocalizationContextType {
  language: SupportedLanguage;
  currency: SupportedCurrency;
  timeFormat: SupportedTimeFormat;
  setLanguage: (lang: SupportedLanguage) => void;
  setCurrency: (curr: SupportedCurrency) => void;
  setTimeFormat: (fmt: SupportedTimeFormat) => void;
  t: (key: string, defaultText?: string) => string;
  formatCurrency: (amountInUSDT: number | string, options?: { showCode?: boolean; decimals?: number }) => string;
  formatDate: (date: string | number | Date) => string;
  activeCurrencyMeta: CurrencyMeta;
  currencies: Record<SupportedCurrency, CurrencyMeta>;
  lastRatesUpdate: string | null;
  isFetchingRates: boolean;
  refreshRates: () => Promise<void>;
}

const LocalizationContext = createContext<LocalizationContextType | undefined>(undefined);

export const LocalizationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currencies, setCurrencies] = useState<Record<SupportedCurrency, CurrencyMeta>>(() => {
    try {
      const cached = localStorage.getItem('metafirm_rates_cache');
      if (cached) {
        const parsed = JSON.parse(cached);
        const merged: Record<SupportedCurrency, CurrencyMeta> = { ...BASE_CURRENCIES };
        for (const [code, rate] of Object.entries(parsed)) {
          if (merged[code as SupportedCurrency] && typeof rate === 'number' && rate > 0) {
            merged[code as SupportedCurrency] = {
              ...merged[code as SupportedCurrency],
              rate,
            };
          }
        }
        return merged;
      }
    } catch {}
    return BASE_CURRENCIES;
  });

  const [lastRatesUpdate, setLastRatesUpdate] = useState<string | null>(() => {
    try {
      return localStorage.getItem('metafirm_rates_updated_at') || null;
    } catch {
      return null;
    }
  });

  const [isFetchingRates, setIsFetchingRates] = useState<boolean>(false);

  const [language, setLanguageState] = useState<SupportedLanguage>(() => {
    try {
      const stored = localStorage.getItem('metafirm_language') as SupportedLanguage;
      if (stored && DICTIONARY[stored]) return stored;
    } catch {}
    return 'en';
  });

  const [currency, setCurrencyState] = useState<SupportedCurrency>(() => {
    try {
      const stored = localStorage.getItem('metafirm_currency') as SupportedCurrency;
      if (stored && BASE_CURRENCIES[stored]) return stored;
    } catch {}
    return 'USD';
  });

  const [timeFormat, setTimeFormatState] = useState<SupportedTimeFormat>(() => {
    try {
      const stored = localStorage.getItem('metafirm_date_format') as SupportedTimeFormat;
      if (stored === '12h' || stored === '24h') return stored;
    } catch {}
    return '12h';
  });

  const refreshRates = useCallback(async () => {
    setIsFetchingRates(true);
    try {
      let fetchedRates: Record<string, number> | null = null;
      // 1. Try internal backend API first
      try {
        const res = await fetch('/api/v1/system/exchange-rates');
        if (res.ok) {
          const json = await res.json();
          if (json.data?.rates) {
            fetchedRates = json.data.rates;
          }
        }
      } catch (err) {
        console.warn('Backend exchange-rates fetch failed, trying public fallback...', err);
      }

      // 2. Try open forex API fallback if backend rates unavailable
      if (!fetchedRates) {
        try {
          const res = await fetch('https://open.er-api.com/v6/latest/USD');
          if (res.ok) {
            const json = await res.json();
            if (json.rates) {
              fetchedRates = json.rates;
            }
          }
        } catch (err) {
          console.warn('Public exchange rates fallback failed:', err);
        }
      }

      if (fetchedRates) {
        const now = new Date().toISOString();
        const updated: Record<SupportedCurrency, CurrencyMeta> = { ...BASE_CURRENCIES };
        const ratesCache: Record<string, number> = {};

        for (const code of Object.keys(BASE_CURRENCIES) as SupportedCurrency[]) {
          if (fetchedRates[code] && typeof fetchedRates[code] === 'number') {
            const rawRate = fetchedRates[code];
            updated[code] = {
              ...updated[code],
              rate: rawRate,
            };
            ratesCache[code] = rawRate;
          }
        }

        setCurrencies(updated);
        setLastRatesUpdate(now);
        try {
          localStorage.setItem('metafirm_rates_cache', JSON.stringify(ratesCache));
          localStorage.setItem('metafirm_rates_updated_at', now);
        } catch {}
      }
    } catch (err) {
      console.error('Error refreshing exchange rates:', err);
    } finally {
      setIsFetchingRates(false);
    }
  }, []);

  // Check and auto-refresh rates if stale (> 30 mins old or never updated)
  useEffect(() => {
    const checkRatesFreshness = () => {
      try {
        const lastUpdated = localStorage.getItem('metafirm_rates_updated_at');
        if (!lastUpdated) {
          refreshRates();
          return;
        }
        const diffMs = Date.now() - new Date(lastUpdated).getTime();
        if (isNaN(diffMs) || diffMs > 30 * 60 * 1000) {
          refreshRates();
        }
      } catch {
        refreshRates();
      }
    };
    checkRatesFreshness();
  }, [refreshRates]);

  const setLanguage = useCallback((lang: SupportedLanguage) => {
    setLanguageState(lang);
    try {
      localStorage.setItem('metafirm_language', lang);
    } catch {}
  }, []);

  const setCurrency = useCallback((curr: SupportedCurrency) => {
    setCurrencyState(curr);
    try {
      localStorage.setItem('metafirm_currency', curr);
    } catch {}
  }, []);

  const setTimeFormat = useCallback((fmt: SupportedTimeFormat) => {
    setTimeFormatState(fmt);
    try {
      localStorage.setItem('metafirm_date_format', fmt);
    } catch {}
  }, []);

  // Sync with window storage events
  useEffect(() => {
    const handleStorage = (e: StorageEvent) => {
      if (e.key === 'metafirm_language' && e.newValue && DICTIONARY[e.newValue as SupportedLanguage]) {
        setLanguageState(e.newValue as SupportedLanguage);
      }
      if (e.key === 'metafirm_currency' && e.newValue && BASE_CURRENCIES[e.newValue as SupportedCurrency]) {
        setCurrencyState(e.newValue as SupportedCurrency);
      }
      if (e.key === 'metafirm_date_format' && (e.newValue === '12h' || e.newValue === '24h')) {
        setTimeFormatState(e.newValue as SupportedTimeFormat);
      }
    };
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);

  const t = useCallback(
    (key: string, defaultText?: string): string => {
      const dict = DICTIONARY[language] || DICTIONARY.en;
      if (dict && dict[key]) {
        return dict[key];
      }
      if (DICTIONARY.en[key]) {
        return DICTIONARY.en[key];
      }
      return defaultText || key;
    },
    [language]
  );

  const activeCurrencyMeta = currencies[currency] || BASE_CURRENCIES.USD;

  const formatCurrency = useCallback(
    (amountInUSDT: number | string, options?: { showCode?: boolean; decimals?: number }): string => {
      const num = typeof amountInUSDT === 'string' ? parseFloat(amountInUSDT || '0') : amountInUSDT;
      if (isNaN(num)) return `${activeCurrencyMeta.symbol}0.00`;

      const converted = num * activeCurrencyMeta.rate;
      const decimals = options?.decimals !== undefined 
        ? options.decimals 
        : (activeCurrencyMeta.rate > 500 ? 0 : 2);

      const formattedNumber = converted.toLocaleString(language === 'hi' ? 'en-IN' : 'en-US', {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals,
      });

      if (options?.showCode && currency !== 'USD') {
        return `${activeCurrencyMeta.symbol}${formattedNumber} ${currency}`;
      }

      return `${activeCurrencyMeta.symbol}${formattedNumber}`;
    },
    [activeCurrencyMeta, currency, language]
  );

  const formatDate = useCallback(
    (dateInput: string | number | Date): string => {
      try {
        const d = new Date(dateInput);
        if (isNaN(d.getTime())) return 'N/A';

        const is24h = timeFormat === '24h';
        const locale = language === 'hi' ? 'en-IN' : 'en-US';

        return d.toLocaleString(locale, {
          month: 'numeric',
          day: 'numeric',
          year: 'numeric',
          hour: 'numeric',
          minute: '2-digit',
          hour12: !is24h,
        });
      } catch {
        return 'N/A';
      }
    },
    [timeFormat, language]
  );

  return (
    <LocalizationContext.Provider
      value={{
        language,
        currency,
        timeFormat,
        setLanguage,
        setCurrency,
        setTimeFormat,
        t,
        formatCurrency,
        formatDate,
        activeCurrencyMeta,
        currencies,
        lastRatesUpdate,
        isFetchingRates,
        refreshRates,
      }}
    >
      {children}
    </LocalizationContext.Provider>
  );
};

export const useLocalization = () => {
  const context = useContext(LocalizationContext);
  if (!context) {
    throw new Error('useLocalization must be used within a LocalizationProvider');
  }
  return context;
};
