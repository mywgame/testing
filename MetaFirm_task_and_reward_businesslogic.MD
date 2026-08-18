# 18. Metafirm – Tasks & Rewards

## 18.1 Core Concept

The **Tasks & Rewards** system allows users to earn incentives by completing predefined activities and reaching measurable milestones.

- A **Task** is a user action, activity, or milestone that can become eligible for a reward.
- A **Reward** is the incentive configured against a task.
- All rewards are claimed exclusively through the Tasks & Rewards system.
- The **Rewards Pool** is the administrative configuration layer used to manage tasks, rewards, thresholds, and campaigns.
- No task parameters (reward amounts, thresholds, status, order, campaign dates, claim limits, etc.) may be hardcoded in the frontend.
- Administrators must be able to fully configure everything from the Admin Panel.

---

## 18.2 Activity Bonuses

### 1. Successful Registration (Trial Fund)

| Item                    | Value                                                          |
|-------------------------|----------------------------------------------------------------|
| Reward                  | $100 Trial Fund (amount + validity days configurable by Admin) |
| Claim Limit             | Once per user                                                  |
| Dependency              | Existing Trial Fund system                                     |

**Critical Rules**
- The existing Trial Fund issuance logic remains completely independent.
- The Tasks & Rewards system must **never** credit the Trial Fund itself.
- This task only checks whether the user has already received the Trial Fund.
- If already issued → task status = **Claimed**.
- Claiming this task must never increase the Trial Fund balance again.
- Claim state must be persisted in the database.

**UX Flow**
```
User registers
    ↓
User logs in
    ↓
Welcome / Claim Trial Fund popup
    ↓
User goes to Tasks → Claim
    ↓
Registration Task marked as Claimed
```

### 2. Complete Authenticator Setup (2FA)

| Item          | Value                                      |
|---------------|--------------------------------------------|
| Reward        | $0.25 USDT                                 |
| Eligibility   | After successful 2FA / Authenticator setup |
| Claim Limit   | Once per user                              |

Backend must prevent repeated claims.

### 3. Join Telegram Channel

| Item          | Value                                                      |
|---------------|------------------------------------------------------------|
| Reward        | $0.25 USDT                                                 |
| Eligibility   | After completing the configured Telegram participation requirement |
| Claim Limit   | default once                                               |

---

## 18.3 Referral Rewards

There are **two completely separate** referral reward mechanisms.  
They must never be mixed.

### A. Successful Referral Registration ($0.10 per referral)

| Item                    | Value                                            |
|-------------------------|--------------------------------------------------|
| Reward                  | $0.10 USDT per eligible referral                 |
| Eligibility             | Direct Level-1 referral successfully registers   |
| Deposit Required        | **No**                                           |
| Trial Fund Impact       | None                                             |
| Claim Style             | Aggregated                                       |

**How it works**
- Every time a direct referred user successfully registers, the referrer gets +$0.10 pending.
- Multiple unclaimed referral rewards are **aggregated** into a single claimable amount.
- Claimable Amount = Number of unclaimed eligible referrals × Configured reward per referral.

**Example**
```
4 eligible referrals registered since last claim
→ Claimable = 4 × $0.10 = $0.40 USDT
→ Status: Available to Claim
```

**Claim Behavior**
1. User claims → entire accumulated amount is credited in one transaction.
2. All referrals included in that claim are marked as claimed.
3. Claimable amount resets to $0.00.
4. Task becomes Claimed (until a new eligible referral appears).
5. When a new eligible referral registers → task becomes Available to Claim again with the new pending amount.

**Implementation Rule (Very Important)**
- Eligibility/claim records remain **individual** per referred user (for duplicate protection).
- Payout is **aggregated** (for good UX).

```
Referral B → $0.10 (unclaimed)
Referral C → $0.10 (unclaimed)
Referral D → $0.10 (unclaimed)
Referral E → $0.10 (unclaimed)
                ↓
           ONE CLAIM
                ↓
           $0.40 USDT
```

### B. Verified Referral Milestones

These are completely independent from the $0.10 registration reward.

A referral becomes a **Verified Referral** only when the referred user has made a minimum **$50 REAL USDT deposit**.  
Trial Fund credits do **not** count.

| Verified Referrals | Reward   |
|--------------------|----------|
| 3                  | $2 USDT  |
| 5                  | $5 USDT  |
| 10                 | $10 USDT |
| 20                 | $35 USDT |
| 35                 | $50 USDT |
| 50                 | $75 USDT |

**Key Distinction**
- A referral can earn the referrer the $0.10 registration reward immediately after registration.
- The same referral only starts counting toward Verified Milestones after the $50 real deposit is completed.

---

## 18.4 Self Deposit Milestones

Users earn rewards for reaching their own real deposit milestones.

| Milestone              | Reward   |
|------------------------|----------|
| First $100 Deposit     | $1 USDT  |
| First $500 Deposit     | $5 USDT  |
| First $1,000 Deposit   | $10 USDT |

**Rules**
- Only real / approved deposits count.
- Trial Fund credits are never treated as real deposits.
- Eligibility is evaluated exclusively on the backend using authoritative deposit records.
- Each milestone can be claimed according to its configured claim limit (normally once).

---

## 18.5 Summary Table (Current Default Values)

### Activity Bonuses
| Task                          | Reward                  |
|-------------------------------|-------------------------|
| Successful Registration       | $100 Trial Fund         |
| Complete Authenticator Setup  | $0.25 USDT              |
| Join Telegram Channel         | $0.25 USDT              |

### Referral Rewards
| Task                              | Reward                                      |
|-----------------------------------|---------------------------------------------|
| Successful Referral Registration  | $0.10 per eligible referral (aggregated)    |
| 3 Verified Referrals              | $2 USDT                                     |
| 5 Verified Referrals              | $5 USDT                                     |
| 10 Verified Referrals             | $10 USDT                                    |
| 20 Verified Referrals             | $35 USDT                                    |
| 35 Verified Referrals             | $50 USDT                                    |
| 50 Verified Referrals             | $75 USDT                                    |

### Self Deposit Milestones
| Task                    | Reward   |
|-------------------------|----------|
| First $100 Deposit      | $1 USDT  |
| First $500 Deposit      | $5 USDT  |
| First $1,000 Deposit    | $10 USDT |

---

## 18.6 Admin – Rewards Pool

Administrators must be able to:

- Create / edit / activate / pause tasks
- Configure reward amount & type
- Configure progress thresholds & minimum deposit requirements
- Configure task categories & display order
- Configure campaign start & end dates
- Configure claim limits
- Configure task-specific rules & metadata
- View user claim history and distribution records

Configuration changes apply only to future eligibility and claims.  
They must not retroactively change already claimed rewards (unless an explicit admin override mechanism is added later).

---

## 18.7 Architecture & Ownership

- All business logic lives **server-side** (Services layer).
- Frontend only displays current state and submits claim requests.
- Controllers handle HTTP.
- Repositories handle database operations.
- Client-side values must never decide eligibility or reward amounts.
- Every claim must be validated server-side before any wallet credit.
- Duplicate claims must be prevented via backend idempotency + database constraints.
- The system integrates with existing Wallet, Transaction, Referral, Deposit, and Audit systems without changing their current business rules.

---


## 18.8 Mandatory Distinction (Never Mix These)

| Reward Type                        | Amount              | Trigger                              | $50 Real Deposit Required? |
|------------------------------------|---------------------|--------------------------------------|----------------------------|
| Successful Referral Registration   | $0.10 per referral  | Registration only                    | **No**                     |
| Verified Referral Milestone        | $2 / $5 / $10 / ... | Referral makes ≥ $50 real deposit    | **Yes**                    |

These two systems must remain independently configurable and independently evaluated by the backend.

