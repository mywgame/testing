# MetaFirm Master Blueprint

> Project Constitution

## 1. Project Vision

MetaFirm is an investment, referral, VIP and rewards platform.

Goals: - Secure - Scalable - Maintainable - Business-rule driven -
Server authoritative

## 2. Core Principles

-   Server is the Single Source of Truth.
-   Never trust client-side values.
-   Business Logic first, Code second.
-   Database stores data only.
-   Repository executes database queries only.
-   Service contains ALL business logic.
-   Controller handles HTTP Request/Response only.
-   Never hardcode configurable business values.
-   Prefer configuration over code changes.

## 3. Architecture

``` text
Frontend
   ↓
Controller
   ↓
Service (Business Logic)
   ↓
Repository
   ↓
Drizzle ORM
   ↓
PostgreSQL
```

Business Logic NEVER belongs inside: - Frontend - Controller -
Repository

## 4. Development Roadmap

1.  Business Logic
2.  Database Schema
3.  Repository Layer
4.  Service Layer
5.  Controller Layer
6.  API Integration
7.  Frontend Integration
8.  Testing
9.  Production

## 5. Business Modules

-   Authentication
-   Users
-   Wallet
-   Trial Fund
-   VIP Engine
-   Referral Engine
-   Team Income
-   Daily DPY
-   Weekly Salary
-   Deposit
-   Withdrawal
-   Notifications
-   Activities
-   Audit
-   Support
-   Settings

## 6. Business Logic

Maintain all business rules in
**MetaFirm_Business_Logic_Specification.md**.

Never implement or change code before updating the specification.

## 7. Database Principles

Schema folder:

``` text
src/db/
```

Workflow:

Business Logic → Schema Review → Migration → Repository → Services →
Controllers

## 8. Security Rules

-   Never trust browser values.
-   Validate everything on the server.
-   Verify deposits through blockchain.
-   Never calculate financial values on the frontend.
-   Audit every financial operation.

## 9. AI Rules

Any AI working on this project must:

-   Never redesign architecture.
-   Never change business logic.
-   Never guess missing rules.
-   Ask questions if unclear.
-   Keep business logic only inside Services.
-   Prefer updating existing code over rewriting.

## 10. Permanent Decisions

1.  Server is the Single Source of Truth.
2.  Business Logic belongs ONLY inside Services.
3.  VIP requires Wallet + Level A + Level B+C+D.
4.  DPY is manual claim. Unclaimed DPY expires at next 00:00 UTC reset.
5.  Every user has permanent deposit addresses:
    -   USDT BEP20
    -   USDT Polygon
    -   USDT TRC20
6.  Deposits are blockchain verified.
7.  Withdrawals require Admin Approval.
8.  Referral reward is ONE TIME only.
9.  Weekly Salary uses VIP2 members across Level A+B+C+D.
10. All financial calculations happen on the server.

## 11. Coding Standards

-   One responsibility per service.
-   Repositories only access database.
-   Controllers only handle HTTP.
-   Use database transactions for financial operations.
-   Audit all financial events.

## 12. Change Management

Client Change → Business Logic → Blueprint → Schema → Services → Testing
→ Deployment

Never update code before documentation.

## 13. Final Rule

This Blueprint is the constitution of the MetaFirm Platform.

Every future schema, API, service and feature must follow this document.
