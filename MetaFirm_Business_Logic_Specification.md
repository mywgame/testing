# MetaFirm Business Logic Specification

> **Implementation Reference**
>
> This document defines the official business rules for the MetaFirm
> Platform. If implementation conflicts with this document, this
> specification takes priority until officially updated.

------------------------------------------------------------------------

# 1. Core Principles

-   Server is the Single Source of Truth.
-   Never trust client-side values.
-   Database stores data only.
-   Repository executes database queries only.
-   Service contains ALL business logic.
-   Controller handles HTTP request/response only.

------------------------------------------------------------------------

# 2. User Lifecycle

``` text
Signup
   ↓
Receive Trial Fund (Default VIP1)
   ↓
Real Deposit
   ↓
First Successful Deposit?
   └──► Referral Reward (One Time Only)
   ↓
VIP Qualification
   ↓
Daily DPY (Claim Required)
   ↓
Team Income
   ↓
Weekly Salary (If Qualified)
   ↓
Withdrawal
```

------------------------------------------------------------------------

# 3. Team Structure

``` text
                     USER
                      │
         ┌────────────┴────────────┐
         │                         │
      A1 (Direct)              A2 (Direct)
      /      \                /      \
     B1      B2              B3      B4
     │
     C1
     │
     D1
```

Rules: - Unlimited Direct Referrals. - Calculations use only Level A,
Level B, Level C and Level D.

------------------------------------------------------------------------

# 4. Trial Fund

-   Every new user receives a Trial Fund.
-   Amount and duration are configurable by the administrator.
-   Stored separately in the database as a Trial Wallet.
-   Displayed together with the Main Wallet in the UI.
-   Generates DPY using the VIP1 rate.
-   Never generates Referral Rewards.
-   Trial Fund expires after the configured duration.
-   Trial Principal expires.
-   Trial Earnings remain in the Main Wallet.
-   Trial Fund never becomes a real deposit.

------------------------------------------------------------------------

# 5. Valid User

A Valid User is a user whose current wallet balance is **50 USDT or
greater**.

------------------------------------------------------------------------

# 6. VIP Qualification

A user can have only ONE active VIP.

Required conditions:

1.  Wallet Requirement
2.  Level A Valid Users
3.  Level B+C+D Valid Users

Rules:

-   All conditions satisfied → Upgrade immediately.
-   Any condition fails → Downgrade immediately to the highest eligible
    VIP.

VIP recalculates after:

-   Successful Deposit
-   Approved Withdrawal
-   Wallet Balance Change
-   Team Qualification Change

------------------------------------------------------------------------

# 7. VIP Qualification Matrix

| VIP  | Wallet(USDT) | Level A | Level B+C+D | Team Total | DPY   |
|------|-------------:|--------:|------------:|-----------:|------:|
| VIP1 | 10 - ∞       | -       | -           | -          | 0.60% |
| VIP2 | 50 - 100     | 2       | -           | 2          | 0.80% |
| VIP3 | 100 - 500    | 3       | 6           | 9          | 1.00% |
| VIP4 | 500 - 1000   | 6       | 20          | 26         | 1.20% |
| VIP5 | 1000 - 3000  | 7       | 35          | 42         | 1.30% |
| VIP6 | 3000 - 5000  | 8       | 50          | 58         | 1.50% |
| VIP7 | 5000 - 10000 | 15      | 70          | 85         | 2.00% |
| VIP8 | 10000 - 20000| 30      | 200         | 230        | 2.50% |

> **Business Rule**
>
> Wallet balance alone NEVER upgrades a user's VIP level.
>
> A user must satisfy **both**:
>
> - Wallet Requirement
> - Team Qualification Requirement
>
> VIP qualification is recalculated immediately whenever wallet balance or team qualification changes.

------------------------------------------------------------------------

# 8. Deposit

-   Blockchain verified automatically.
-   No manual approval.
-   Update Main Wallet.
-   Create Transaction.
-   Process Referral Reward (if eligible).
-   Recalculate VIP.
-   Create Activity.
-   Create Audit Log.

------------------------------------------------------------------------

# 9. Referral Reward

Reward is generated **ONLY ONCE** for each referred user.

Eligible: - First Successful REAL Deposit only.

Not Eligible: - Trial Fund - Second Deposit - Third Deposit - Fourth
Deposit - Any future deposit

Admin Configuration:

### Percentage Mode

Reward = First Deposit × Configured Percentage

### Fixed Amount Mode

Reward = Configured Fixed Amount

Changing the reward configuration affects only future rewards.

------------------------------------------------------------------------

# 10. Wallet

The system maintains multiple internal wallet balances for calculation and auditing purposes.

Backend Tracks:

- Principal Balance
- Trial Balance
- Referral Income
- Daily Yield
- Team Income
- Incentive Income

> **Note:**
>
> Incentive Income is a combined category that includes all income types
> other than Referral Income, Daily Yield and Team Income.
>
> Examples include:
>
> - Weekly Salary
> - Airdrops
> - Rewards
> - Promotional Bonuses
> - Task Rewards
> - Future Incentive Programs
> - Any other platform incentives

---

## User Dashboard Cards

Users will see only the following income categories:

- Total Assets
- Referral Income
- Daily Yield
- Team Income
- Incentive Income

### Business Rule

Total Assets represent the user's combined Main Wallet balance.

Weekly Salary is **NOT** displayed as a separate dashboard card.

Instead, it is automatically included under **Incentive Income**.

Similarly, any future income type (such as Airdrops, Rewards,
Promotional Bonuses or Task Rewards) will also be displayed under
**Incentive Income** without requiring additional dashboard cards.

------------------------------------------------------------------------

# 11. Daily DPY

- Calculated once daily at **00:00 UTC**.
- DPY is generated once per eligible user per day.
- DPY is **not credited automatically**.
- Users must manually claim DPY using the **Claim** button.
- Only **one claim** is allowed per daily cycle.
- Any unclaimed DPY expires automatically at the next **00:00 UTC** reset.
- After the reset, a new DPY is generated based on the user's current eligibility.

## DPY Formula

**Daily DPY = Eligible Active Balance × Current VIP DPY Rate**

### Eligible Active Balance

Eligible Active Balance represents the user's current **active Main Wallet balance** that is eligible to generate Daily DPY.

It includes only balances that are currently available for earning.

It excludes any balance that is not actively participating in the investment system.

### Excluded From DPY Calculation

The following balances never generate Daily DPY:

- Locked Balance (pending withdrawals)
- Any balance reserved for future platform features
  (such as Staking, Token Purchases, ICO participation, or similar locked funds)
- Any inactive, frozen or otherwise non-earning balance

### VIP Rate

The applicable DPY percentage is determined by the user's **currently qualified VIP level**.

Whenever the user's wallet eligibility or team qualification changes, the VIP level is recalculated before the next DPY cycle.

### Business Rules

- Locked funds never generate Daily DPY.
- Pending withdrawals immediately stop earning Daily DPY.
- Daily DPY is always calculated using the user's current Eligible Active Balance.
- All Daily DPY calculations are performed exclusively on the server.

------------------------------------------------------------------------

# 12. Weekly Leadership Incentive

Weekly Leadership Incentive is awarded based on the number of qualified
VIP2 members in the user's referral team.

## Qualification Levels

| Title         | Qualified VIP2 Members | Weekly Reward |
|---------------|-----------------------:|--------------:|
| Bronze Star   |            5           | $10           |
| Silver Star   |           10           | $20           |
| Gold Star     |           25           | $50           |
| Platinum Star |           50           | $100          |
| Diamond Star  |           100          | $250          |

## Business Rules

- Qualified VIP2 members from Level A, Level B, Level C and Level D are counted.
- The qualification is recalculated once every week.
- The user's current team qualification at the time of calculation determines the reward.
- If the user's qualification increases, the higher reward is granted.
- If the user's qualification decreases, the reward is reduced to the highest currently qualified level.
- If the user does not meet the minimum qualification, no Weekly Leadership Incentive is awarded.
- The reward is credited to the Main Wallet under **Incentive Income**.

------------------------------------------------------------------------

# 13. Withdrawal

Business Rules:

- Minimum Withdrawal Amount is configurable by the Administrator.
- Transaction Fee: 10%
- Every withdrawal requires Admin Approval.
- Withdrawal reduces the user's Main Wallet balance.
- Future DPY calculations are based on the updated Main Wallet balance after the withdrawal.

### Default Configuration

- Minimum Withdrawal: 10 USDT
- Transaction Fee: 10%

------------------------------------------------------------------------

# 14. Audit

The system must create an immutable Audit Log for every financial or administrative action.

Audit Logs are used for:

- Security
- Financial Traceability
- Compliance
- Debugging
- Administrative Investigation

The following actions MUST always generate an Audit Log:

- Deposit
- Withdrawal
- Referral Reward
- Team Commission
- VIP Change
- Daily DPY Claim
- Weekly Leadership Incentive
- Wallet Adjustment
- Admin Actions

## Business Rules

- Audit Logs are generated automatically by the server.
- Audit Logs are immutable and must never be modified or deleted.
- Every Audit Log records the action, affected resource, timestamp and relevant metadata.
- Audit Logs are intended for internal administration, compliance and debugging only.
- Audit Logs are never displayed to end users.

------------------------------------------------------------------------

# 15. Deposit Addresses

Supported Networks:

-   USDT (BEP20)
-   USDT (Polygon)
-   USDT (TRC20)

Rules:

-   Every user receives one permanent address per network.
-   Generated during registration.
-   Blockchain verified automatically.
-   Deposit success triggers wallet update, transaction, referral, VIP
    recalculation, activity and audit.

------------------------------------------------------------------------

# 16.  Team Commission/Level

THIS INCOME COMES FROM TEAM USERS DPY %
when user claimS their DPY. 
COMMISSIONS DISTRIBUTES INSTANT TO UPLINES UPTO 4 LEVELS (A,B,C,D)

• VIP1:  ---,  ----,    ----,     ----
• VIP2: A 10%, B 5%,    C 3%,     D 2%
• VIP3: A 12%, B 6%,    C 4%,     D 3%
• VIP4: A 15%, B 8%,    C 5%,     D 4%
• VIP5: A 17%, B 9%,    C 6%,     D 5%
• VIP6: A 20%, B 10%,   C 7%,     D 6%
• VIP7: A 22%, B 11%,   C 8%,     D 7%
• VIP8: A 24%, B 12%,   C 9%,     D 8%

EXAMPLE 1 :
 USER (X) IS VIP 3
 IN THEIR TEAM D1 EARNS DPY = $11.50 (THROUGH DPY CLAIM)
USER X WILL EARN 3% OF USER D1'S DPY = 11.50×3%= $0.34
(UNDER LEVEL INCOME)
 
                     USER (x)
                      │
         ┌────────────┴────────────┐
         │                         │
      A1 (Direct)                 A2 (Direct)   <--- LEVEL A
      /      \                  /      \
     B1      B2                B3      B4    <--- LEVEL B
     │
     C1                                        <--- LEVEL C
     │
     D1                                         <--- LEVEL D
```



EXAMPLE 2 :

USER (X) IS VIP2
IN THEIR TEAM B5 EARNS DPY = $8.30 (THROUGH DPY CLAIM)
USER X WILL EARN 5% OF USER B5'S DPY = 8.30× 5% = $0.41 (UNDER LEVEL INCOME)





                USER (X)

                  │

        ┌─────────┴────────
        │                  │
     A1 (Direct)           A2 (Direct)    <--- LEVEL A

     /      \         /    /    \
    B1      B2        B3   B4   B5        <--- LEVEL B

    │

    C1                                    <--- LEVEL C

    │

    D1                                    <--- LEVEL C

```
EXAMPLE 3 :

USER (X) IS VIP 5
IN THEIR TEAM c5 (c level team users) EARNS DPY = $18.70 (THROUGH DPY CLAIM)
USER X WILL EARN 6% OF USER c5'S DPY = 18.70× 6% = $1.12 (UNDER LEVEL INCOME)

## Business Rule

Team Commission percentage is always determined by the CURRENT VIP level of the receiving upline user.

The downline user's VIP level never affects the commission percentage.


## Implementation Rule

Business Logic belongs ONLY inside the Service Layer.

Never place business logic inside: - Frontend - Controllers -
Repositories

## Business Rule Ownership

Every business rule has exactly one owning Service.

- The owning Service is the single source of truth.
- Other Services must call the owning Service instead of reimplementing the same logic.
- Business rules must never be duplicated across multiple Services.
------------------------------------------------------------------------

# 17. Service Ownership Matrix

| Business Domain             | Owning Service       |
|-----------------------------|----------------------|
| Authentication              | AuthService          |
| User Management             | UserService          |
| Wallet Management           | WalletService        |
| VIP Qualification           | VipService           |
| Deposits                    | DepositService       |
| Withdrawals                 | WithdrawalService    |
| Referral Reward             | ReferralService      |
| Team Commission             | ReferralService      |
| Daily DPY Claim             | ClaimService         |
| Weekly Leadership Incentive | SalaryService        |
| Notifications               | NotificationService  |
| Support                     | SupportService       |
| Dashboard Aggregation       | DashboardService     |
| Administration              | AdminService         |
| Settings                    | SettingsService      |