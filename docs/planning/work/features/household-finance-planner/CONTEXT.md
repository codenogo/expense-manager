# Feature Context: Household Finance Planner

**Slug**: `household-finance-planner`
**Branch**: `feature/household-finance-planner`
**Date**: 2026-02-28

## Summary

A full-stack household finance planner built as a Next.js monolith on Supabase.
Single household with a common income pool. KES currency. Clean minimal UI.

## Key Decisions

| Area | Decision |
|------|----------|
| **Auth** | Individual Supabase accounts with email invite links |
| **Pool model** | Full common pool — all income is household income |
| **Currency** | KES (Kenya Shilling) only |
| **UI style** | Clean minimal — Monarch Money style |
| **Debt tracking** | All debts: formal (loans, credit cards) + informal (person-to-person) |
| **Savings** | Goal-based with target amounts and deadlines |
| **Categories** | Fully custom — user defines all categories |
| **Database** | Supabase (Postgres + Auth + RLS) |
| **Data entry** | Manual entry + CSV import (no bank API) |
| **Architecture** | Next.js App Router monolith, Server Components + Server Actions |

## Data Model (Core Tables)

```
households
  ├── profiles (linked to supabase auth.users, role: admin/member)
  ├── accounts (type: checking/savings/credit/loan/cash/mpesa)
  │   └── transactions (amount, date, category_id, notes, created_by)
  ├── categories (parent_id for hierarchy, user-defined)
  ├── budgets (category_id, month, amount_limit)
  ├── recurring_items (name, amount, frequency, next_due, category_id)
  ├── debts (name, type: loan/credit_card/informal, balance, rate, min_payment, owed_to)
  └── savings_goals (name, target_amount, current_amount, deadline)
```

**Account types**: Checking, Savings, Credit Card, Loan, Cash, M-Pesa
**Debt types**: Bank loan, SACCO loan, Credit card, Informal (owed to/from person)

## Constraints

- Single household only — no multi-tenant
- KES only — no currency conversion
- Manual + CSV import — no Plaid for MVP
- Supabase free tier must suffice
- All data behind RLS policies
- No financial data in client bundles

## Open Questions

1. Which Kenyan bank CSV formats to support first?
2. Email vs in-app notifications for bill reminders?
3. Debt payoff viz — progress bar or amortization schedule?

## MVP Phases

1. **Foundation**: Auth, household, accounts, transactions, CSV import
2. **Budgeting + Bills**: Monthly budgets, recurring tracker, auto-categorization
3. **Debt + Savings**: Debt tracker with payoff strategies, savings goals
4. **Dashboard + Reporting**: Monthly overview, trends, category breakdown

## Next Step

```
/plan household-finance-planner
```
