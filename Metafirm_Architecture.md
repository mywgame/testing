 # metafir_Architecture

││   .env.example
│   .gitignore
│   admin_readable_views.sql
│   bun.lock
│   capacitor.config.ts
│   CHANGELOG.md
│   index.html
│   MAINTENANCE_MODE_GUIDE.md
│   metadata.json
│   Metafirm_Architecture.md
│   Metafirm_Blockchain_Architecture.md
│   MetaFirm_Business_Logic_Specification.md
│   MetaFirm_Development_Roadmap.md
│   MetaFirm_Master_Blueprint.md
│   package-lock.json
│   package.json
│   production_cleanup.sql
│   READ.MD
│   README.md
│   server.ts
│   tsconfig.json
│   vercel.json
│   vite.config.ts
│   wrangler.jsonc
│
├───assets
│   ├───.aistudio
│   │       .gitignore
│   │
│   ├───icons
│   │       favicon.png
│   │       favicon.svg
│   │       usdt-svg.svg
│   │
│   ├───images
│   │   ├───backgrounds
│   │   │   ├───admin
│   │   │   │       .gitkeep
│   │   │   │
│   │   │   ├───auth
│   │   │   │       .gitkeep
│   │   │   │
│   │   │   ├───dashboard
│   │   │   │       .gitkeep
│   │   │   │
│   │   │   └───landing
│   │   │           .gitkeep
│   │   │
│   │   ├───branding
│   │   │       logo-mark.png
│   │   │       logo.png
│   │   │
│   │   ├───illustrations
│   │   │       crypto-prop-firm-illustration.svg
│   │   │       gpu-farm-illustration.svg
│   │   │       solar-farm-illustration.svg
│   │   │
│   │   └───placeholders
│   │           .gitkeep
│   │
│   └───video
│       ├───admin
│       │       .gitkeep
│       │
│       ├───dashboard
│       │       .gitkeep
│       │
│       └───landing
│               .gitkeep
│               hero-background.mp4
│
├───client
│   │   App.tsx
│   │   index.css
│   │   main.tsx
│   │
│   ├───assets
│   │   └───avatars
│   │           avatar-01-hexagon.svg
│   │           avatar-02-diamond.svg
│   │           avatar-03-bolt.svg
│   │           avatar-04-shield.svg
│   │           avatar-05-cube.svg
│   │           avatar-06-star.svg
│   │           avatar-07-orbit.svg
│   │           avatar-08-circuit.svg
│   │           avatar-09-wave.svg
│   │           avatar-10-prism.svg
│   │           avatar-11-node.svg
│   │           avatar-12-crystal.svg
│   │           avatar-13-compass.svg
│   │           avatar-14-hexgrid.svg
│   │           avatar-15-pulse.svg
│   │           avatar-16-rings.svg
│   │           avatar-17-spark.svg
│   │           avatar-18-infinity.svg
│   │
│   ├───components
│   │   │   About.tsx
│   │   │   AuthModal.tsx
│   │   │   Contact.tsx
│   │   │   Faq.tsx
│   │   │   Footer.tsx
│   │   │   Hero.tsx
│   │   │   HowItWorks.tsx
│   │   │   LoadingScreen.tsx
│   │   │   Navbar.tsx
│   │   │   RibbonBackground.tsx
│   │   │   Security.tsx
│   │   │   Skeleton.tsx
│   │   │   Stats.tsx
│   │   │   WhyChooseUs.tsx
│   │   │
│   │   ├───Admin
│   │   │   │   AdminProfileView.tsx
│   │   │   │   AdminSidebar.tsx
│   │   │   │   AdminTopbar.tsx
│   │   │   │   AnnouncementsView.tsx
│   │   │   │   AuditLogsView.tsx
│   │   │   │   DashboardHome.tsx
│   │   │   │   DepositsView.tsx
│   │   │   │   IncomeView.tsx
│   │   │   │   index.tsx
│   │   │   │   ReferralSystemView.tsx
│   │   │   │   ResetView.tsx
│   │   │   │   RewardsView.tsx
│   │   │   │   SalaryView.tsx
│   │   │   │   SecurityView.tsx
│   │   │   │   SettingsView.tsx
│   │   │   │   SupportView.tsx
│   │   │   │   TreasuryView.tsx
│   │   │   │   TrialFundView.tsx
│   │   │   │   types.ts
│   │   │   │   UsersView.tsx
│   │   │   │   VipView.tsx
│   │   │   │   WithdrawalsView.tsx
│   │   │   │
│   │   │   └───Treasury
│   │   │           PermanentAddressesTable.tsx
│   │   │           QueueItemDetailsModal.tsx
│   │   │           SweepAuditLogsTable.tsx
│   │   │           SweepQueueTable.tsx
│   │   │           TreasuryOverviewCard.tsx
│   │   │           TreasuryTypes.ts
│   │   │
│   │   ├───Auth
│   │   │   ├───ForgotPassword
│   │   │   │       ForgotPassword.tsx
│   │   │   │
│   │   │   ├───Login
│   │   │   │       Login.tsx
│   │   │   │
│   │   │   ├───Mfa
│   │   │   │       AdminMfaLogin.tsx
│   │   │   │       Mfa.tsx
│   │   │   │
│   │   │   ├───Register
│   │   │   │       Register.tsx
│   │   │   │
│   │   │   ├───ResetPassword
│   │   │   │       ResetPassword.tsx
│   │   │   │
│   │   │   ├───SecurityVerification
│   │   │   │       SecurityVerification.tsx
│   │   │   │
│   │   │   ├───Shared
│   │   │   │       countries.ts
│   │   │   │
│   │   │   └───VerifyEmail
│   │   │           VerifyEmail.tsx
│   │   │
│   │   ├───Dashboard
│   │   │   │   Announcements.tsx
│   │   │   │   BottomNav.tsx
│   │   │   │   DailyClaimCard.tsx
│   │   │   │   DashboardHome.tsx
│   │   │   │   DownloadAppsSection.tsx
│   │   │   │   GradientOrbs.tsx
│   │   │   │   HeroBalanceCard.tsx
│   │   │   │   IncomeStatCard.tsx
│   │   │   │   index.tsx
│   │   │   │   MetaFirmAssetIcon.tsx
│   │   │   │   MonthlyEarningsChart.tsx
│   │   │   │   MyTeamView.tsx
│   │   │   │   NetworkLevels.tsx
│   │   │   │   NotificationBell.tsx
│   │   │   │   ProfileView.tsx
│   │   │   │   RecentActivity.tsx
│   │   │   │   SecurityView.tsx
│   │   │   │   SettingsView.tsx
│   │   │   │   Sidebar.tsx
│   │   │   │   SupportView.tsx
│   │   │   │   TeamOverview.tsx
│   │   │   │   TopNav.tsx
│   │   │   │   TransactionsView.tsx
│   │   │   │   TwoFactorView.tsx
│   │   │   │   WithdrawalAddressesView.tsx
│   │   │   │
│   │   │   ├───Deposit
│   │   │   │       DepositSuccessModal.tsx
│   │   │   │       DepositView.tsx
│   │   │   │
│   │   │   ├───Layout
│   │   │   │       DashboardLayout.tsx
│   │   │   │
│   │   │   ├───Rewards
│   │   │   │       RewardsView.tsx
│   │   │   │
│   │   │   ├───Skeletons
│   │   │   │       DashboardSkeleton.tsx
│   │   │   │       DepositSkeleton.tsx
│   │   │   │       index.ts
│   │   │   │       ProfileSkeleton.tsx
│   │   │   │       SupportSkeleton.tsx
│   │   │   │       TeamSkeleton.tsx
│   │   │   │       TransactionSkeleton.tsx
│   │   │   │       VIPSkeleton.tsx
│   │   │   │       WithdrawalSkeleton.tsx
│   │   │   │
│   │   │   ├───Staking
│   │   │   │       StakingView.tsx
│   │   │   │
│   │   │   ├───Support
│   │   │   │       index.tsx
│   │   │   │       SupportInfo.tsx
│   │   │   │       SupportTicketForm.tsx
│   │   │   │       TicketList.tsx
│   │   │   │       types.ts
│   │   │   │
│   │   │   ├───Task
│   │   │   │       TaskView.tsx
│   │   │   │
│   │   │   ├───Team
│   │   │   │       TeamStats.tsx
│   │   │   │       TeamTable.tsx
│   │   │   │       TeamView.tsx
│   │   │   │       types.ts
│   │   │   │
│   │   │   ├───Transactions
│   │   │   │       ReceiptModal.tsx
│   │   │   │       TransactionsView.tsx
│   │   │   │       TransactionTable.tsx
│   │   │   │       types.ts
│   │   │   │
│   │   │   ├───VIP
│   │   │   │       types.ts
│   │   │   │       VIPCardGrid.tsx
│   │   │   │       VIPProgress.tsx
│   │   │   │       VIPView.tsx
│   │   │   │
│   │   │   └───Withdrawal
│   │   │           WithdrawalSuccessModal.tsx
│   │   │           WithdrawalView.tsx
│   │   │
│   │   └───ui
│   │       │   AvatarPicker.tsx
│   │       │   index.ts
│   │       │   RingProgress.tsx
│   │       │   SuccessModal.tsx
│   │       │   theme.ts
│   │       │   ThemeSwitch.tsx
│   │       │   themeTokens.ts
│   │       │
│   │       ├───Buttons
│   │       │       index.tsx
│   │       │
│   │       ├───Cards
│   │       │       index.tsx
│   │       │
│   │       ├───Feedback
│   │       │       index.tsx
│   │       │
│   │       ├───Inputs
│   │       │       index.tsx
│   │       │
│   │       ├───Layout
│   │       │       index.tsx
│   │       │
│   │       ├───Loaders
│   │       │       index.tsx
│   │       │
│   │       ├───Navigation
│   │       │       index.tsx
│   │       │
│   │       └───Overlays
│   │               index.tsx
│   │
│   ├───contexts
│   │       AuthContext.tsx
│   │       ThemeContext.tsx
│   │
│   ├───hooks
│   │       useAuth.ts
│   │       useAvatar.ts
│   │       useTasks.ts
│   │       useTheme.ts
│   │
│   ├───layouts
│   │       BaseLayout.tsx
│   │
│   ├───lib
│   │       avatars.ts
│   │
│   ├───services
│   │       api.ts
│   │       apiConfig.ts
│   │       taskService.ts
│   │
│   ├───types
│   │       index.ts
│   │       vite-env.d.ts
│   │
│   └───utils
│           index.ts
│           landingData.ts
│           referral.ts
│           sound.ts
│
├───drizzle
│   │   0000_eager_legion.sql
│   │   0001_mysterious_lockjaw.sql
│   │   0002_large_blue_shield.sql
│   │   0003_furry_banshee.sql
│   │   0004_colossal_mathemanic.sql
│   │   0004_productive_professor_monster.sql
│   │   0005_colorful_rafael_vega.sql
│   │   0006_curly_the_stranger.sql
│   │   0007_abnormal_miracleman.sql
│   │   0008_complete_princess_powerful.sql
│   │   0009_equal_gauntlet.sql
│   │   0009_hard_justin_hammer.sql
│   │   0009_sweep_queue_and_treasury_controls.sql
│   │   0010_deposit_address_rotation_history.sql
│   │
│   └───meta
│           0000_snapshot.json
│           0001_snapshot.json
│           0002_snapshot.json
│           0003_snapshot.json
│           0004_snapshot.json
│           0005_snapshot.json
│           0006_snapshot.json
│           0007_snapshot.json
│           0008_snapshot.json
│           0009_snapshot.json
│           0010_snapshot.json
│           _journal.json
│
├───public
│       google9d4c6c3a8e5aa86a.html
│       robots.txt
│       sitemap.xml
│
├───scripts
│       cloudflare-maintenance-worker.js
│       create-superadmin.ts
│       production_cleanup.sql
│
├───server
│   ├───blockchain
│   │   │   index.ts
│   │   │
│   │   ├───config
│   │   │       blockchainConfig.ts
│   │   │
│   │   ├───errors
│   │   │       BlockchainError.ts
│   │   │
│   │   ├───hd
│   │   │       HdWalletEngine.ts
│   │   │
│   │   ├───interfaces
│   │   │       BlockchainProvider.ts
│   │   │
│   │   ├───keys
│   │   │       KeyManager.ts
│   │   │
│   │   ├───providers
│   │   │       EvmRpcProvider.ts
│   │   │       index.ts
│   │   │       RpcProvider.ts
│   │   │       TatumProvider.ts
│   │   │       TronRpcProvider.ts
│   │   │
│   │   ├───rpc
│   │   │       RpcManager.ts
│   │   │
│   │   ├───services
│   │   │   │   AddressService.ts
│   │   │   │   DepositService.ts
│   │   │   │   GasCalculator.ts
│   │   │   │   RpcDepositScanner.ts
│   │   │   │   SweepQueueProcessor.ts
│   │   │   │   TransactionMonitor.ts
│   │   │   │   TreasuryService.ts
│   │   │   │   WalletService.ts
│   │   │   │   WithdrawalService.ts
│   │   │   │
│   │   │   └───treasury
│   │   │           SweepExecutionService.ts
│   │   │           TreasuryValidator.ts
│   │   │           WalletSyncService.ts
│   │   │
│   │   ├───utils
│   │   │       amountUtils.ts
│   │   │       blockchainUtils.ts
│   │   │
│   │   └───webhooks
│   │           TatumWebhookHandler.ts
│   │
│   ├───cache
│   │   │   redisClient.ts
│   │   │   redisKeys.ts
│   │   │
│   │   └───services
│   │           otpService.ts
│   │
│   ├───config
│   │       index.ts
│   │
│   ├───controllers
│   │       adminController.ts
│   │       authController.ts
│   │       taskController.ts
│   │       userController.ts
│   │
│   ├───middlewares
│   │       auth.ts
│   │       errorHandler.ts
│   │       security.ts
│   │       validate.ts
│   │
│   ├───providers
│   │       emailProvider.ts
│   │       resendProvider.ts
│   │
│   ├───repositories
│   │       achievementRepository.ts
│   │       activityRepository.ts
│   │       adminSecurityRepository.ts
│   │       auditRepository.ts
│   │       authRepository.ts
│   │       claimRepository.ts
│   │       depositAddressRepository.ts
│   │       depositRepository.ts
│   │       incomeRepository.ts
│   │       notificationRepository.ts
│   │       referralRepository.ts
│   │       salaryRepository.ts
│   │       sessionRepository.ts
│   │       settingsRepository.ts
│   │       supportRepository.ts
│   │       taskRepository.ts
│   │       teamCommissionHistoryRepository.ts
│   │       transactionRepository.ts
│   │       userRepository.ts
│   │       vipRepository.ts
│   │       walletRepository.ts
│   │       withdrawalRepository.ts
│   │
│   ├───routes
│   │   │   index.ts
│   │   │
│   │   └───v1
│   │           adminRoutes.ts
│   │           authRoutes.ts
│   │           index.ts
│   │           taskRoutes.ts
│   │           userRoutes.ts
│   │           webhookRoutes.ts
│   │
│   ├───services
│   │       adminService.ts
│   │       authService.ts
│   │       blockchainProvider.ts
│   │       claimService.ts
│   │       dashboardService.ts
│   │       depositService.ts
│   │       emailService.ts
│   │       incomeService.ts
│   │       notificationService.ts
│   │       productionCleanupService.ts
│   │       referralService.ts
│   │       salaryService.ts
│   │       settingsService.ts
│   │       supportService.ts
│   │       taskService.ts
│   │       transactionMonitor.ts
│   │       trialFundService.ts
│   │       userService.ts
│   │       vipService.ts
│   │       walletService.ts
│   │       withdrawalService.ts
│   │
│   ├───templates
│   │       otpEmail.ts
│   │       resetPasswordEmail.ts
│   │       welcomeEmail.ts
│   │
│   └───utils
│           encryption.ts
│           jwt.ts
│           logger.ts
│           otp.ts
│           password.ts
│           response.ts
│           securityLogger.ts
│           totp.ts
│           ua.ts
│
├───shared
│   ├───constants
│   │       index.ts
│   │
│   ├───types
│   │       index.ts
│   │
│   └───validators
│           index.ts
│
├───src
│   │   App.tsx
│   │   index.css
│   │   main.tsx
│   │
│   └───db
│           achievements.ts
│           activities.ts
│           admin_security.ts
│           audit.ts
│           claims.ts
│           deposits.ts
│           deposit_addresses.ts
│           drizzle.config.ts
│           income.ts
│           index.ts
│           migrate.ts
│           notifications.ts
│           referrals.ts
│           salary.ts
│           schema.ts
│           sessions.ts
│           settings.ts
│           support.ts
│           tasks.ts
│           team_commission_history.ts
│           transactions.ts
│           treasury.ts
│           users.ts
│           vip.ts
│           wallets.ts
│           withdrawals.ts
│
├───tests
│       task_and_rewards_full_suite.test.ts
│       task_eligibility_real_scenarios.test.ts
│       task_referrals.test.ts
│
└───tools
    └───wallet-generator
            generator.ts
            README.md