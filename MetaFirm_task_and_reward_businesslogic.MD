# 18. Metafirm Task and Rewards
18.1 Core Concept

The Task & Rewards system allows users to earn incentives by completing predefined activities and achieving measurable milestones.

Tasks represent user actions, activities, or milestones that can become eligible for a reward.
Rewards represent the configured incentive associated with a task.
Rewards are claimed only through the Task system.
The Rewards Pool is used for managing and configuring available task rewards and campaigns.
Task and reward parameters must not be hardcoded in the frontend or business logic.
Administrators must be able to configure reward amounts, task status, thresholds, eligibility requirements, display order, and campaign dates from the Admin Panel.

# 18.2 Activity Bonuses
Successful Registration

Reward: $100 Trial Fund

The existing Trial Fund system remains unchanged.

The Trial Fund is automatically credited during registration according to the existing Trial Fund business rules.
The Task & Rewards system must never credit the Trial Fund again.
The registration task only verifies whether the user has already received the Trial Fund.
If the Trial Fund has already been issued, the task is marked as Claimed.
The claim state must be recorded in the database.
Claiming this task must never increase the user's Trial Fund balance a second time.

User Experience Flow
User Registration
        ↓
User Logs In
        ↓
gets a popup Welcome / Claim Trial Fund Gift
        ↓
User lands on dashboard-->task-->claim page
        ↓
Registration Task = Claimed

The original Trial Fund business logic must remain completely independent of the Task & Rewards system.

Complete Authenticator Setup

Reward: $0.25

User becomes eligible after successfully completing authenticator/2FA setup.
Reward can be claimed once per user.
Repeated claims must be prevented by the backend.
Join Telegram

Reward: $0.25

User becomes eligible after completing the configured Telegram participation requirement.
Reward can be claimed according to the task's configured claim limit.

# 18.3 Referral Rewards

The system contains two separate referral reward mechanisms. They must never be treated as the same reward.

A. Successful Referral Registration

Reward: $0.10 per eligible referral

A referring user becomes eligible for a $0.10 reward for each direct referred user who successfully completes registration.

The reward is accumulated until the user claims the available referral-registration rewards.

Example
User A refers User B
User B successfully registers
→ Pending Referral Reward = $0.10

User A refers User C
User C successfully registers
→ Pending Referral Reward = $0.20

User A refers User D
User D successfully registers
→ Pending Referral Reward = $0.30

User A refers User E
User E successfully registers
→ Pending Referral Reward = $0.40

Therefore, if 4 eligible referrals have registered since the user's last claim, the Task should display:

Reward: $0.40 USDT
Status: Available to Claim
Action: Claim

The user should not need to claim each $0.10 referral separately.

Claim Behavior
All currently unclaimed eligible referral-registration rewards are aggregated into a single claimable amount.
Claimable Amount = Number of Unclaimed Eligible Referrals × Configured Reward Per Referral
With the default configuration:
4 unclaimed eligible referrals × $0.10 = $0.40
When the user claims the reward, the entire accumulated amount is credited in one claim transaction.
All referrals included in that claim are marked as claimed.
The claimable amount immediately becomes $0.00.
The task changes to Claimed when there is no remaining unclaimed referral reward.
If another eligible referral registers after the previous claim, a new $0.10 pending reward is created.
The task then becomes claimable again.
Example of Repeated Claims
4 referrals register
        ↓
Pending = $0.40
        ↓
User clicks Claim
        ↓
$0.40 credited
        ↓
Pending = $0.00
        ↓
Task = Claimed
        ↓
New referral registers
        ↓
Pending = $0.10
        ↓
Task = Available to Claim
Eligibility
Only successful direct Level-1 referrals are counted.
The referred user only needs to successfully complete registration.
No $50 deposit is required for the Successful Referral Registration reward.
Trial Fund status does not affect eligibility.
Each referred user can contribute to the registration reward only once.
A referred user must never generate duplicate registration rewards.
The backend must maintain an individual claim/eligibility record for each referred user even though multiple rewards are aggregated into a single payout.
Important Implementation Rule

The eligibility records remain individual, but the payout is aggregated.

Referral B → $0.10 → unclaimed
Referral C → $0.10 → unclaimed
Referral D → $0.10 → unclaimed
Referral E → $0.10 → unclaimed

                    ↓

             ONE CLAIM

                    ↓

              $0.40 USDT

This is important because it gives us both duplicate-reward protection and the desired simple UX.

B. Verified Referral Milestones

Verified Referral Milestones remain completely separate from the Successful Referral Registration reward.

A direct Level-1 referral qualifies as a Verified Referral only when the referred user has made a minimum $50 REAL USDT deposit.

Trial Fund credits do not qualify.

Verified Referrals	Milestone Reward
3	$2
5	$5
10	$10
20	$35
35	$50
50	$75

Important: The $0.10 registration reward and the Verified Referral Milestone reward are independent rewards. A referral can qualify for the $0.10 registration reward immediately after registration, while contributing to Verified Referral milestones only after the required $50 REAL USDT deposit.

# 18.4 Self Deposit Rewards

Users can earn rewards for reaching their own real deposit milestones.

Deposit Milestone	Reward
First $100 Deposit	$1
First $500 Deposit	$5
First $1,000 Deposit	$10

Business rules:

Only qualifying real/approved deposits count.
Trial Fund credits are never treated as real deposits.
Deposit milestones are evaluated by the backend.
Each configured milestone can be claimed according to its configured claim limit.
Deposit eligibility must be based on authoritative server-side deposit records.

# 18.5 Activity Bonuses
Task	Reward
Successful Registration	$100 Trial Fund — Claimed
Complete Authenticator Setup	$0.25
Join Telegram	$0.25
Referral Rewards
Task	Reward
Successful Referral Registration	$0.10 per eligible referral
3 Verified Referrals	$2
5 Verified Referrals	$5
10 Verified Referrals	$10
20 Verified Referrals	$35
35 Verified Referrals	$50
50 Verified Referrals	$75
Self Deposit Rewards
Task	Reward
First $100 Deposit	$1
First $500 Deposit	$5
First $1,000 Deposit	$10


# 18.6 Admin Rewards Pool

The Admin Panel must provide a dedicated Rewards Pool management interface.

Administrators can:

Create tasks.
Edit task definitions.
Activate or pause tasks.
Configure reward amounts.
Configure reward type.
Configure progress thresholds.
Configure minimum deposit requirements.
Configure task categories.
Configure display order.
Configure campaign start and end dates.
Configure task-specific rules and metadata.
Configure claim limits.
View user reward claim history.
Review reward distribution and claim records.

Changes to reward configuration should affect future eligibility and claims according to the configured task rules and must not retroactively alter previously completed or claimed rewards unless an explicit administrative mechanism is introduced.

# 18.7 Business Logic Ownership

All Task & Rewards business logic must be handled server-side.

Frontend displays task state and submits claim requests.
Controllers handle HTTP requests and responses.
Repositories perform database operations.
Services contain the complete Task & Rewards business logic.
Client-side values must never determine reward eligibility or reward amounts.
Reward claims must be validated server-side before any wallet credit is issued.
Duplicate claims must be prevented through backend idempotency and database constraints.

The Task & Rewards system must integrate with the existing Wallet, Transaction, Referral, Deposit, and Audit systems without modifying their existing business rules.

# 18.8 Important Business Rule Distinction

The following distinction is mandatory:

Successful Referral Registration
→ $0.10
→ Registration is sufficient
→ $50 deposit NOT required

Verified Referral Milestone
→ $2 / $5 / $10 / $35 / $50 / $75
→ Direct referral must make minimum $50 REAL USDT deposit
→ Trial Fund does NOT qualify

These two reward systems must remain independently configurable and independently evaluated by the backend.
