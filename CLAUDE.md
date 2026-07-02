@AGENTS.md

# Project: Taximate (CabBooks)

A Next.js app for taxi drivers to manage their HMRC Making Tax Digital (MTD) obligations.

## Stack
- Next.js (Pages Router)
- Supabase (auth + database)
- HMRC sandbox API (test-api.service.hmrc.gov.uk)

## Key user
- Single test driver with a NINO stored in the `drivers` table
- HMRC OAuth tokens stored in `hmrc_tokens` (one row per driver, upserted on conflict)

## HMRC MTD workflow (steps in order)
1. Connect to HMRC — `/connect-hmrc` → OAuth via `/api/hmrc/oauth` → callback at `/api/hmrc/callback`
2. Business details — `/hmrc-businesses` → `/api/hmrc/listBusinesses`
3. Obligations — `/hmrc-obligations` → `/api/hmrc/obligations`
4. Submit quarterly update — `/hmrc-submit` → `/api/hmrc/submitIncome` (cumulative YTD figures)
5. Annual submission — `/hmrc-annual` → `/api/hmrc/annualSubmission` (trading income allowance)
6. Accounting adjustments (BSAS) — `/hmrc-adjustments` → `/api/hmrc/adjustments`
7. Income summary (BISS) — `/hmrc-income-summary` → `/api/hmrc/incomeSummary`
8. Tax calculations — `/hmrc-calculations` → `/api/hmrc/calculations`
9. Assist report — `/hmrc-assist` → `/api/hmrc/assistReport` (SA Assist — produce + acknowledge)
10. Final declaration — `/hmrc-final` → `/api/hmrc/finalDeclaration`

## Where we left off (session: 2026-06-10)

### Test user (current)
- **Name**: Sidney Quirke
- **NINO**: YJ631833A (saved to Supabase `drivers` table)
- **MTD Income Tax ID**: XPIT00878209303
- **businessId**: XBIS12345678901 (DEFAULT canned value — returned by business list with DEFAULT scenario)
- **Login**: User ID `316489526302` / Password `myal12nY3pR3`
- **Obligations**: HMRC sandbox returns 2018-19 dates for all test users via `Gov-Test-Scenario: DEFAULT` — hardcoded test data, not tied to the specific user

### Cumulative submission — now working with DEFAULT
- The root bug was the HTTP method: cumulative endpoint is **PUT** not POST. Confirmed from HMRC Developer Hub.
- DEFAULT scenario for the cumulative PUT endpoint returns a simulated success response (204).
- STATEFUL was attempted but Create Test User API does NOT create a self-employment business in the STATEFUL environment. Business list with STATEFUL returns empty for all dynamically created test users.
- Self Assessment Test Support API → "Create a Test Business" is the correct way to register a business in STATEFUL — implemented and confirmed working (session: 2026-06-22).
- However, the Obligations endpoint does not support STATEFUL (`RULE_INCORRECT_GOV_TEST_SCENARIO` 400) — STATEFUL cannot be used end-to-end.
- **RESOLVED (2026-06-23):** the Obligations Q1-fulfilled blocker is fixed by `Gov-Test-Scenario: OPEN` + business `XBIS12345678903`. STATEFUL was never the answer. See the 2026-06-23 session section below.

### Gov-Test-Scenario per endpoint (current state)
| Endpoint | Scenario |
|---|---|
| Business details list | DEFAULT |
| Obligations | **OPEN** (business `XBIS12345678903`) — see 2026-06-23 session |
| Cumulative GET | DEFAULT |
| Cumulative PUT | DEFAULT |
| BSAS trigger | DEFAULT |
| BSAS retrieve | SELF_EMPLOYMENT_PROFIT |
| BSAS submit | DEFAULT |
| All other endpoints | DEFAULT |

### BSAS (adjustable summary) — confirmed working
- Trigger: `POST .../trigger` — send `typeOfBusiness`, `businessId`, `taxYear`, `accountingPeriod` (inline: startDate `{year}-04-06`, endDate `{year+1}-04-05`). DEFAULT returns canned `calculationId: 717f3a7a-db8e-11e9-8a34-2a2ae2dbcce4`.
- Retrieve: `GET .../self-employment/{calculationId}/{taxYear}` — must use `SELF_EMPLOYMENT_PROFIT` scenario (DEFAULT returns "no data found").
- Submit: `POST .../self-employment/{calculationId}/adjust/{taxYear}` — `income.turnover` must always be present even if 0 (omitting it causes `RULE_INCORRECT_OR_EMPTY_BODY_SUBMITTED`). Fixed in `pages/api/hmrc/adjustments.js`.

### Supabase period date fix (important)
`hmrc_submissions` stores **original obligation dates** (2018-19) in `period_start`/`period_end`, NOT the shifted 2025-26 dates sent to HMRC. The shifted dates are stored inside `hmrc_response.hmrcPeriodStartDate/EndDate` for reference.

This is required because `isPeriodSubmitted()` compares `submission.period_start === period.start` where `period.start` comes from the obligations API (2018-19 dates). If we stored shifted dates, the match would never succeed and every period would always look open.

### Current Supabase state (session: 2026-06-10)
`hmrc_submissions` has 2 rows (correct period dates):
- id 21: Q2 (2018-07-06 → 2018-10-05), cumulative turnover 5000, expenses 1000
- id 22: Q3 (2018-10-06 → 2019-01-05), cumulative turnover 11000, expenses 2200
- Q4 also submitted this session (cumulative total: £43,000 turnover, £8,400 expenses)

### Known cosmetic bug (low priority)
"Submitted income so far" in the `/hmrc-submit` review section shows £0.00 for Q3+ because the HMRC cumulative GET (DEFAULT scenario) returns canned data with 0 turnover, and `hmrcBaseTurnover = 0` overrides the Supabase value via `??`. The **actual submission is correct** — the API reads from Supabase directly and calculates the right cumulative. Fix: prefer `previousSubmission` (Supabase) over `currentHmrcSummary` in the `previousTurnover` derivation on `hmrc-submit.js` lines 274-281.

### Completed (session: 2026-06-10, continued)
All 9 steps of the HMRC MTD workflow are now fully tested end-to-end:
- Q1–Q4 quarterly submissions ✓
- Annual submission ✓
- BSAS trigger, retrieve, submit ✓ (submit tested; turnover field is adjusted total, not delta)
- Income summary (BISS) ✓ — display fixed: response uses `total.income`, `profit.net` etc. not `totalIncome.turnover`
- Tax calculations ✓ — DEFAULT always returns validation error messages (canned); status saves as `error` not `complete`
- Final declaration ✓ — submitted to HMRC, correlation ID `ce0df992-52f6-4ac3-afee-c6f937cda2f3`

### Fixes applied this session
- `pages/hmrc-income-summary.js`: updated field mapping to match actual BISS v3 response shape
- `pages/api/hmrc/finalDeclaration.js`: preflight obligations check now reads Supabase `hmrc_submissions` count (>= 3) instead of HMRC API (DEFAULT returns canned unfulfilled data); preflight calculation check now accepts `status = 'error'` as well as `complete`; Supabase save uses `upsert` instead of `insert` to handle DEFAULT returning duplicate `calculationId`

### Current Supabase state (session: 2026-06-10, end)
`hmrc_submissions` has 3 rows (Q2, Q3, Q4 — Q1 submitted to HMRC but not saved to Supabase):
- id 21: Q2 (2018-07-06 → 2018-10-05), cumulative turnover 5000, expenses 1000
- id 22: Q3 (2018-10-06 → 2019-01-05), cumulative turnover 11000, expenses 2200
- Q4: (2019-01-06 → 2019-04-05), cumulative turnover 43000, expenses 8400
`hmrc_calculations` has final-declaration record with `calculation_id: c75dbb53-6237-49e2-b05a-60ef221f0260`

## HMRC API versions confirmed
- Business details list: `application/vnd.hmrc.2.0+json`
- BISS (income summary): `application/vnd.hmrc.3.0+json`
- BSAS (adjustable summary trigger/retrieve/submit): `application/vnd.hmrc.7.0+json`
- Annual submission (create/amend/retrieve): `application/vnd.hmrc.5.0+json`
- Cumulative period summary (retrieve/create/amend): `application/vnd.hmrc.5.0+json`
- Calculations: `application/vnd.hmrc.8.0+json`
- Business details — retrieve single / accounting-type / quarterly-period-type / periods-of-account: `application/vnd.hmrc.2.0+json` (built 2026-07-01)
- Property Business — cumulative + annual (UK & foreign): `application/vnd.hmrc.6.0+json` (built 2026-07-01)

## Cumulative submission model (confirmed from HMRC docs)
- Endpoint: **`PUT`** `.../self-employment/{nino}/{businessId}/cumulative/{taxYear}` — 2025-26 onwards only
- `periodStartDate` is always `{year}-04-06`, never changes
- `periodEndDate` is the obligation period end date — year-shifted to match the submitted `taxYear` via `shiftEndDateToTaxYear()`
- Figures are always cumulative YTD totals, not just the quarter's figures
- Each submission replaces the previous — no separate amend flow
- Payload uses nested format: `periodDates`, `periodIncome`, `periodExpenses`

## Key decisions
- Tax years are always entered by the user or derived from obligation dates — never hardcoded
- Submit page shows derived tax year but allows manual override (needed because sandbox obligations return 2018-19 dates)
- Only non-zero fields are sent in BSAS adjustment payloads
- OAuth scope requested at connect time is now `read:self-assessment write:self-assessment read:self-assessment-assist write:self-assessment-assist` — the last two were added for SA Assist (2026-06-30). **Any token issued before that change must be re-issued (disconnect + reconnect on `/connect-hmrc`) or Assist calls 401/403.**
- HMRC is the source of truth for submitted data — retrieve endpoints used instead of Supabase where possible
- `hmrc_submissions.period_start/end` = original obligation dates (for matching), shifted HMRC dates stored in `hmrc_response` only

## App redesign (session: 2026-06-11)

Full Sage Business Cloud-inspired UI has been built. Dark sidebar (#111827), white content area, green accents (#4ade80 / #16a34a). CSS Modules throughout (no Tailwind).

### App shell
- `components/AppLayout.js` — sidebar + top bar wrapping all authenticated pages
- `styles/layout.module.css` — layout styles including mobile bottom nav
- `pages/_app.js` — imports globals.css, wraps all non-auth pages in AppLayout; invoice view pages (`/invoices/[id]`) excluded from AppLayout for clean print layout
- `styles/globals.css` — base reset and font stack
- Driver loaded via `getDriverByAuthUserId` using `auth_user_id` (NOT `user_id` — that column doesn't exist)
- NO_LAYOUT pages: `['/','login','signup']` + any path starting with `/invoices/`

### Pages built
| Route | File | Status |
|---|---|---|
| /dashboard | pages/dashboard.js | Full — reads `entries` table |
| /transactions | pages/transactions.js | Full — full CRUD on `entries`, monthly pagination |
| /customers | pages/customers.js | Full — Active/Inactive tabs, add/edit/delete, type badges |
| /reports | pages/reports.js | Full — Year/Month/Week toggle, bar chart, category breakdowns |
| /invoices | pages/invoices.js | Full — All/Draft/Sent/Paid/Overdue tabs, create/edit modal with trips + line items + bank details, print icon per row |
| /invoices/[id] | pages/invoices/[id].js | Full — printable view, Email/WhatsApp/Download PDF/Print actions |
| /settings | pages/settings.js | Full — Sage-style card layout, editable Personal details card, read-only Account card |

### Database schema
Key schema gotchas:
- `drivers.id` is BIGINT (integer), not UUID — all foreign keys must use BIGINT
- `drivers.auth_user_id` is the UUID column linking to auth.users — NOT `user_id`

**SQL migrations run in Supabase:**
- `sql/007_create_entries.sql` — entries table (BIGINT driver_id, auth_user_id in RLS) ✓
- `sql/008_create_customers.sql` — customers table ✓
- `sql/009_create_invoices.sql` — invoices + invoice_items tables ✓
- `sql/010_add_invoice_trips_and_bank.sql` — trips (JSONB), bank_name, bank_account_name, bank_account_number, bank_sort_code columns on invoices ✓
- **PENDING**: `ALTER TABLE drivers ADD COLUMN IF NOT EXISTS phone TEXT; ALTER TABLE drivers ADD COLUMN IF NOT EXISTS address TEXT;` — must be run in Supabase before Settings edit or invoice print view shows driver address/phone

```
entries (id BIGSERIAL, driver_id BIGINT, type TEXT, amount DECIMAL(10,2), category TEXT, description TEXT, date DATE)
customers (id BIGSERIAL, driver_id BIGINT, name TEXT, phone TEXT, email TEXT, type TEXT, area TEXT, notes TEXT, status TEXT)
invoices (id BIGSERIAL, driver_id BIGINT, invoice_number TEXT, customer_name TEXT, customer_email TEXT, date DATE, due_date DATE, status TEXT, notes TEXT, total DECIMAL(10,2), trips JSONB, bank_name TEXT, bank_account_name TEXT, bank_account_number TEXT, bank_sort_code TEXT)
invoice_items (id BIGSERIAL, invoice_id BIGINT, description TEXT, amount DECIMAL(10,2))
```

### Transaction categories
- Income: Fares (cash), Fares (card), App fares (Uber/Bolt), Private hire, Airport run, School run, Account work, Other income
- Expenses (updated 2026-06-12): Badge renewal, Car Rent, Car Wash, Finance payments, Fines, Fuel, Insurance, Lease Payments, MOT, Phone Contracts, Repairs, Road tax, Service, Tolls, Vehicle Licence renewal, Parking, Food/Snacks, Other

### Transactions — monthly pagination
- All entries fetched once; filtered client-side by `{ year, month }` state
- `prevMonth()` / `nextMonth()` handlers; next disabled at current month
- Month navigator displayed in toolbar with chevron arrows

### Customers page
- Active/Inactive tabs; initials avatar; type badges (Private hire=blue, Account work=amber, School=green, Business=purple)
- Add/edit modal; toggle active/inactive; delete with confirmation

### Invoices page
- Status tabs: All / Draft / Sent / Paid / Overdue
- Create/edit modal: customer (free-text, not linked to customers table), date, due date, status, trips (optional card layout per trip), line items (charges), bank details, notes
- Trips fields per card: Date, Job No, Passenger Name, Pick Up, Drop Off, Description — all optional
- Print icon on each row opens `/invoices/[id]`

### Invoice print view (`/invoices/[id]`)
- Excluded from AppLayout — renders as standalone page
- Action bar (hidden on print): Back, Email (mailto), WhatsApp (wa.me), Download PDF (jspdf + html2canvas), Print
- Shows driver name + address + phone at top (reads from `drivers` table via driverAuth)
- **NINO must NEVER appear on invoices** — this is a hard rule
- PDF: dynamic import of jspdf + html2canvas to avoid loading on every page
- `id="invoice-document"` on document div for html2canvas capture

### Settings page
- Page header: green initials avatar, driver name, "Taxi driver" subtitle
- "Profile information" section heading with divider
- Two-card grid: Personal details (editable name/phone/address) | Account (read-only email/role)
- Display mode with "Edit details" button → inline form → save/cancel
- Saves to `drivers` table; "✓ Changes saved" flash for 3 seconds
- **NINO must NEVER appear in Settings** — this is a hard rule

### Dashboard features
- Period filter: week / month / quarter / year (using tax year bounds)
- Metric cards: total income, total expenses, net profit, entry count
- Recent transactions list (last 8 entries)
- Right panel: quick-add buttons, all-time stats, HMRC status card (reads `hmrc_tokens`)

### lib/driverAuth.js
- `getDriverByEmail` selects: `id, name, email, nino, phone, address`
- `getDriverByAuthUserId` selects: `id, name, email, nino, auth_user_id, phone, address`

## Session updates (2026-06-14 / 2026-06-15)

### Completed this session
- **Reports page** built — Year/Month/Week period toggle, monthly bar chart (pure CSS), income/expense category breakdowns with horizontal progress bars, instant CSS tooltips on bar hover (replaced slow native `title` attribute)
- **Pending SQL run** — `ALTER TABLE drivers ADD COLUMN IF NOT EXISTS phone TEXT; ALTER TABLE drivers ADD COLUMN IF NOT EXISTS address TEXT;` ✓ (unblocks Settings edit + invoice address/phone display)
- **Mobile fixes**:
  - Invoice action buttons enlarged to 40×40px on mobile; status-change shortcuts hidden (use edit modal instead); invoice number column hidden to free space for customer name
  - Customers page: type badge + phone + area shown as second line below name on mobile
  - Long addresses now wrap cleanly (`overflow-wrap: anywhere`) in both Settings and invoice print view
- **WhatsApp invoice formatting** — upgraded from plain text to WhatsApp markdown (`*bold*`), structured with driver name/phone, line items, total, bank details
- **GitHub** — pushed to both `origin` (cab-books) and `cabbooks` remotes; deployed on Vercel
- **Reports page** updated: `styles/placeholder.module.css` replaced; new `styles/reports.module.css`

### Pages built (updated)
| Route | File | Status |
|---|---|---|
| /dashboard | pages/dashboard.js | Full — reads `entries` table |
| /transactions | pages/transactions.js | Full — full CRUD on `entries`, monthly pagination |
| /customers | pages/customers.js | Full — Active/Inactive tabs, add/edit/delete, type badges, mobile detail line |
| /reports | pages/reports.js | Full — Year/Month/Week toggle, bar chart, category breakdowns |
| /invoices | pages/invoices.js | Full — status tabs, create/edit modal, mobile-friendly action buttons |
| /invoices/[id] | pages/invoices/[id].js | Full — printable view, WhatsApp formatted share |
| /settings | pages/settings.js | Full — editable personal details (name/phone/address) |

### Database schema (current — all migrations run)
```
drivers (id BIGINT, auth_user_id UUID, name TEXT, email TEXT, nino TEXT, phone TEXT, address TEXT)
entries (id BIGSERIAL, driver_id BIGINT, type TEXT, amount DECIMAL(10,2), category TEXT, description TEXT, date DATE)
customers (id BIGSERIAL, driver_id BIGINT, name TEXT, phone TEXT, email TEXT, type TEXT, area TEXT, notes TEXT, status TEXT)
invoices (id BIGSERIAL, driver_id BIGINT, invoice_number TEXT, customer_name TEXT, customer_email TEXT, date DATE, due_date DATE, status TEXT, notes TEXT, total DECIMAL(10,2), trips JSONB, bank_name TEXT, bank_account_name TEXT, bank_account_number TEXT, bank_sort_code TEXT)
invoice_items (id BIGSERIAL, invoice_id BIGINT, description TEXT, amount DECIMAL(10,2))
```

### GitHub remotes
- `origin` → https://github.com/suls67/cab-books.git
- `cabbooks` → https://github.com/suls67/cabbooks.git
- Vercel auto-deploys from `cabbooks` repo

## Session updates (2026-06-22)

### STATEFUL obligations investigation — concluded

Built and tested the Self Assessment Test Support API integration to attempt STATEFUL obligations testing.

**New API routes built:**
- `pages/api/hmrc/createTestBusiness.js` — POST to `self-assessment-test-support/business/{nino}`, creates a self-employment business in STATEFUL
- `pages/api/hmrc/deleteTestBusiness.js` — DELETE to `self-assessment-test-support/business/{nino}/{businessId}`, removes a STATEFUL test business

**Sandbox tools added to `/connect-hmrc`:**
- "Create test business" button — creates business, shows returned businessId in state
- "Delete" button for the just-created business
- Manual business ID input field for deleting businesses created in previous sessions

**STATEFUL test business created:**
- Business ID: XXIS47082970946 (will auto-purge 7 days after 2026-06-22)
- Accounting period: 2025-04-06 → 2026-04-05
- STATEFUL business list confirms this business ✓

**Findings:**
- STATEFUL works for Business Details List ✓
- STATEFUL on the Obligations endpoint returns `RULE_INCORRECT_GOV_TEST_SCENARIO` (400) — not supported
- DEFAULT obligations with STATEFUL business ID returns no obligations
- Conclusion (2026-06-22): **no sandbox workaround exists for the Q1 fulfilled obligation issue** — ⚠️ **this conclusion was WRONG; superseded by the 2026-06-23 session (OPEN scenario), see below**

**HMRC support ticket submitted (2026-06-22)** covering:
1. Q1 obligation always returns `status: F` with DEFAULT — asked for a scenario that returns all 4 as open
2. STATEFUL rejected by obligations endpoint (400) — confirmed with error code
3. Tax Calculations endpoint always returns canned validation errors — asked for a scenario returning real figures
- Awaiting response (2 UK business days)

**All endpoints remain on DEFAULT — app is back to normal.**

## Session updates (2026-06-23)

### Obligations Q1-fulfilled blocker — SOLVED

The multi-session blocker (HMRC always returning Q1 as `status: F` under DEFAULT, so all 4 quarters could never be open at once) is fixed. The answer was a **scenario value**, not STATEFUL.

**The fix:** call the income-and-expenditure obligations endpoint with `Gov-Test-Scenario: OPEN` against canned business ID **`XBIS12345678903`** (note `...903`, not the `...901` DEFAULT's business list returns). OPEN returns all four quarters with `status: open`. Dates are still 2018-19 — expected and fine; the app shifts them to the current tax year via `shiftEndDateToTaxYear()` and stores 2018-19 for period matching.

**Applied in** `pages/api/hmrc/obligations.js`:
- `SANDBOX_OBLIGATIONS_SCENARIO = 'OPEN'`
- `SANDBOX_OPEN_BUSINESS_ID = 'XBIS12345678903'`
- Business list still queried (DEFAULT, returns ...901) but obligations query overrides to the OPEN business ID.

**Why STATEFUL was a dead end (re-confirmed 2026-06-23):** Even with a real support-API test business (`X8IS61056641558`, plus the still-alive `XXIS47082970946`), the obligations endpoint rejects STATEFUL with `RULE_INCORRECT_GOV_TEST_SCENARIO` (400). The STATEFUL business list works (lists real businesses) but obligations never accepted STATEFUL. The HMRC support ticket is effectively moot for obligations — no reply needed to proceed.

**Full obligations scenario list (from obligations-api 3.0 OAS):** DEFAULT, OPEN, FULFILLED, INSOLVENT_TRADER, NOT_FOUND, NO_OBLIGATIONS_FOUND, DYNAMIC, CUMULATIVE. DYNAMIC adapts to fromDate/toDate/status but rejected `status=Open` (FORMAT_STATUS — casing; not pursued since OPEN works). CUMULATIVE returned 404 against the ...903 business.

**Diagnostic harness added (can be removed later):**
- `pages/api/hmrc/diagnoseObligations.js` — probes business list + obligations across all scenarios; `?only=stateful` lean mode; `?probe=scenarios` tests OPEN/DYNAMIC/CUMULATIVE
- Buttons on `/connect-hmrc`: "Diagnose obligations (all scenarios)", "STATEFUL obligations only", "STATEFUL + 2025-26 dates", "★ Test OPEN / DYNAMIC / CUMULATIVE"

### Submit path also fixed for OPEN
`pages/api/hmrc/submitIncome.js` had its own obligations fetch (DEFAULT + listed business ...901), which left no open period and 500'd the POST ("No open obligations found"). Fixed: its obligations fetch now uses the same `SANDBOX_OBLIGATIONS_SCENARIO = 'OPEN'` + `SANDBOX_OPEN_BUSINESS_ID = 'XBIS12345678903'` (defined at top of that file). The cumulative GET/PUT stay DEFAULT + the listed business ID (works regardless of ID). **Quarterly submission confirmed working end-to-end this session.**

### Tax Calculations canned-error blocker — SOLVED
DEFAULT retrieve returns a canned validation error ("Final confirmation… not provided", tax due sentinel -99999999999.99). Fix: retrieve with `Gov-Test-Scenario: UK_SE_SAVINGS_EXAMPLE` — returns a complete self-employment calc with real figures (£15,039.74 total, full Income Tax + NIC breakdown), zero errors. Applied in `pages/api/hmrc/calculations.js` via `SANDBOX_CALC_RETRIEVE_SCENARIO = 'UK_SE_SAVINGS_EXAMPLE'` on **both** retrieve calls (standalone GET + the trigger poll loop). Trigger stays DEFAULT (just returns a calculationId). **Confirmed working — /hmrc-calculations shows a full real tax breakdown.**

- Retrieve scenarios that return real figures (OAS): UK_SE_SAVINGS_EXAMPLE, UK_SE_GIFTAID_EXAMPLE (£71,589.74, Gift Aid shape), DYNAMIC (no errors but returns the -99999999999.99 sentinel — useless here). Chose UK_SE_SAVINGS as the best self-employment fit.
- Caveat: it's a **canned example** — always £15,039.74 regardless of submitted income. Sandbox limitation; proves the endpoint + parsing work.
- Diagnostic: `pages/api/hmrc/diagnoseCalculations.js` + button "★ Test calculation scenarios (real figures)" on `/connect-hmrc`.

### ALL 9 MTD STEPS NOW WORK END-TO-END (sandbox)
The whole pipeline runs: connect → businesses → obligations (OPEN) → quarterly submit (cumulative PUT) → annual → BSAS → income summary → calculations (UK_SE_SAVINGS_EXAMPLE) → final declaration. The fix was scenario values throughout, never STATEFUL.

### Important: Supabase is the source of truth in sandbox
Under DEFAULT, the cumulative PUT returns a **simulated** 204 — HMRC does NOT persist the figures. Reads (cumulative GET, obligations, calculations) all return canned data unrelated to what was submitted. So the driver's real turnover/expenses live ONLY in Supabase `hmrc_submissions`. In production (live API, no Gov-Test-Scenario), HMRC stores and returns real data and becomes the source of truth.

### Tax year: always 2025-26 on submit pages
Obligation dates are canned 2018-19, so pages derive 2018-19 by default — but the cumulative endpoint only supports **2025-26 onwards** (2018-19 → 400). User must override the tax year to `2025-26` on every step (submit, annual, calculations, final). The app shifts obligation end dates into 2025-26 via `shiftEndDateToTaxYear()`. Potential improvement: default the page to 2025-26 instead of the derived 2018-19.

### Cosmetic "Submitted income so far" bug — FIXED
`hmrc-submit.js` previousTurnover/previousExpenses derivation now **prefers Supabase** (`previousSubmission`) over the HMRC cumulative GET (`currentHmrcSummary`), since the HMRC read is simulated junk under DEFAULT. The Review section figures are now correct/stable. (The actual submission was always correct — the server computes cumulative from Supabase.)
- **Still showing sandbox noise:** the "Currently held by HMRC" card on `/hmrc-submit` still displays the canned GET figure (e.g. £67,999.90). Honestly reports HMRC's (simulated) response; useful in production. Open decision: hide/relabel it in sandbox with a "simulated data" note, or leave it.

### Other fixes this session
- `hmrc-submit.js`: skip the cumulative-summary preview fetch when tax year < 2025 (cumulative doesn't exist pre-2025-26 → was 400'ing).

### To reset for a clean Q1→Q4 test run
Delete the driver's submission rows in Supabase (HMRC never stored them anyway):
```sql
delete from hmrc_submissions where driver_id = (select id from drivers where nino = 'YJ631833A');
delete from hmrc_calculations where driver_id = (select id from drivers where nino = 'YJ631833A'); -- optional, for clean final declaration
```
Then /hmrc-obligations shows all 4 open again.

### Diagnostic scaffolding still present (remove when done)
- Routes: `pages/api/hmrc/diagnoseObligations.js`, `pages/api/hmrc/diagnoseCalculations.js`
- Buttons on `/connect-hmrc`: the obligations/STATEFUL/scenario probes + "★ Test calculation scenarios"
- Pre-existing sandbox tools (Create/Delete test business) on `/connect-hmrc` remain.

## Session updates (2026-06-24)

### Obligations page — layout overhaul
- **Submission totals bug fixed**: `/hmrc-obligations` was summing all rows to get totals, but figures are cumulative YTD so this double-counted. Fixed in `pages/hmrc-obligations.js` — now reads the last row (by `period_end`) as the total. Correct totals: £50,999.95 turnover, £11,000 expenses.
- **Submit button moved into open period card**: All four quarters now render as a single ordered list. Submitted quarters stay in place marked "Submitted" (dimmed). The next-due quarter card is highlighted green and contains the "Submit figures for Quarter X" button. Button advances to the next open quarter after each submission.

### Submit page — confirmation modal
- Clicking "Submit to HMRC" now opens a **confirmation modal** before sending anything to HMRC.
- Modal shows: update period, tax year, total income to submit, total expenses to submit.
- Buttons: "Confirm & submit" (sends to HMRC) / "Go back" (closes modal). Clicking backdrop also closes.
- Logic split: `handleSubmit` runs validation + opens modal; `confirmSubmit` does the actual API call.
- New state: `showConfirm`. New styles: `.backdrop`, `.confirmModal`, `.confirmRows`, `.confirmRow`, `.confirmActions` in `styles/hmrc-submit.module.css`.

### Tax year defaulted to 2025-26
- `pages/hmrc-submit.js`: if the derived tax year from obligation dates is pre-2025, app now defaults to `2025-26` automatically — no more manual override needed each session.

### Diagnostic scaffolding removed (2026-06-24)
All diagnostic/test infrastructure removed — app is now clean:
- Deleted routes: `diagnoseObligations.js`, `diagnoseCalculations.js`, `createTestBusiness.js`, `deleteTestBusiness.js`
- Removed all related state, handlers, and the sandbox tools card from `pages/connect-hmrc.js`

### Sandbox "simulated data" labels added
- `/hmrc-submit`: "Currently held by HMRC" heading now reads "(simulated — sandbox only)" in muted grey
- `/hmrc-calculations`: note under "Existing" heading explains rows are canned test data
- New `.sandboxNote` CSS class added to both stylesheets

### HMRC API notes (from docs review this session)
- **Annual submission** uses **Self Employment Business API v5.0** — `PUT /individuals/business/self-employment/{nino}/{businessId}/annual/{taxYear}`. Only `tradingIncomeAllowance` is sent by the app (inside `allowances` object). The retrieve response shows many more fields — all canned sandbox data unrelated to the submission.
- **Income summary (Step 7)** uses **Business Income Source Summary (BISS) API v3.0** — `GET /individuals/self-assessment/income-summary/{nino}/{typeOfBusiness}/{taxYear}/{businessId}`. Different from the period summary (raw figures you sent) — BISS shows what HMRC calculated from them.
- **Cumulative submit (Step 4)** uses `PUT /individuals/business/self-employment/{nino}/{businessId}/cumulative/{taxYear}` — 2025-26 onwards only. The old period-based endpoint (`/period/{taxYear}/{periodId}`) is **not used** in this app.

### Current Supabase state (session: 2026-06-24)
All 4 quarters submitted and saved:
- Q1 (2018-04-06 → 2018-07-05): cumulative turnover 10000, expenses 1000
- Q2 (2018-07-06 → 2018-10-05): cumulative turnover 21999.95, expenses 3000
- Q3 (2018-10-06 → 2019-01-05): cumulative turnover 35999.95, expenses 6000
- Q4 (2019-01-06 → 2019-04-05): cumulative turnover 50999.95, expenses 11000

## Session updates (2026-06-30) — Infrastructure / deployment cleanup

No app code changed this session. Cleaned up duplicated infra across Vercel, GitHub, Supabase and set up the production custom domain.

### Vercel — consolidated to one project
- Previously had two Vercel projects (one per GitHub repo) producing duplicate deploys. Deleted the duplicate (`cabbooks-1kio`).
- **Keeper project: `cabbooks`** → serves `cabbooks.vercel.app` (free default domain, kept as backup; can't be removed, harmless).

### GitHub — consolidated to one remote
- Repo previously had two remotes (`origin` → `suls67/cab-books`, `cabbooks` → `suls67/cabbooks`); pushing to both is what spawned the duplicate Vercel projects.
- Now a **single remote**: `origin` → `https://github.com/suls67/cabbooks.git`. (Old `cab-books` GitHub repo still exists, just no longer wired up.)

### Custom domain — cabbooks.online (live + SSL)
- Bought `cabbooks.online` from Hostinger. Kept **Hostinger nameservers** (`aurora/nebula.dns-parking.com`) and added records in Hostinger's DNS Zone editor.
- **Primary = `www.cabbooks.online`**; apex `cabbooks.online` 308-redirects to www.
- Final DNS records (Vercel's new IP-range-expansion targets, TTL 300):
  | Type | Name | Content |
  |---|---|---|
  | A | @ | `216.198.79.1` |
  | CNAME | www | `7218ad9d83779a45.vercel-dns-017.com` |
  - (Old values `76.76.21.21` / `cname.vercel-dns.com` also still work — Vercel just recommends the new ones.)
- Verified: `https://www.cabbooks.online` → 200; `https://cabbooks.online` → 308 → www. All three domains show **Valid Configuration** in Vercel. No CAA records blocking issuance.

### Supabase — canonical project confirmed
- Two Supabase orgs exist: **cabBooks** (old, stale leftover) and **taximate** (active).
- **Canonical project = `taxi app` in the `taximate` org**, URL `https://tvqddvihbghhuriapgby.supabase.co`. All app data lives here.
- Confirmed this URL + anon key match across local `.env.local`, Vercel env vars, and Supabase. Everything reads/writes the same project.
- **TODO (optional cleanup):** delete the stale **cabBooks** Supabase org/project once confirmed empty. Cosmetic: keeper org is named "taximate"/"taxi app" not "cabbooks" — rename later if desired.
- Decided **NOT** to enable the Supabase↔Vercel integration (auto env-var sync) — manual env vars already work; integration only worth it later if adding preview/staging environments.

### Auth — decision: stay on Supabase Auth
- Explored third-party auth (Clerk/Auth0). Decision: **keep Supabase Auth** (already integrated via `drivers.auth_user_id` + RLS). Switching providers = real migration, not worth it now.
- Only worthwhile near-term upgrade: enable **"Login with Google"** (native Supabase OAuth provider, ~20-min job) — not done yet, noted for later.

### SA Assist report flow built (2026-06-30)
New optional step between Tax Calculations (8) and Final Declaration (10) — **Step 9: Assist report**.

- **API route** `pages/api/hmrc/assistReport.js` — single POST endpoint, dispatched by `body.action`:
  - `action: 'produce'` → `POST .../individuals/self-assessment/assist/reports/{nino}/{taxYear}/{calculationId}`. Returns `status: 'has-messages'` (200 → reportId, correlationId, messages[]), `'no-messages'` (204), or `'calculation-pending'` (404 = tax calc not generated yet).
  - `action: 'acknowledge'` → `POST .../assist/reports/acknowledge/{nino}/{reportId}/{correlationId}` → 204.
  - Accept header `application/vnd.hmrc.1.0+json`. **Both verbs are POST** (confirmed by user; docs didn't state method).
  - `correlationId` for acknowledge comes from the **response body**, not the header.
  - Produce sends `Gov-Test-Scenario` (default `DEFAULT`, overridable via `body.scenario`) — sandbox scenario that returns a 200 report-with-messages not yet identified; DEFAULT may just 204.
- **Page** `pages/hmrc-assist.js` + `styles/hmrc-assist.module.css` — loads saved calc IDs from Supabase `hmrc_calculations` into a dropdown, requests the report, renders messages (title/body/action/links) in full, then an "Acknowledge report" button (only acknowledge after messages are actually shown — HMRC best practice).
- **Wired in:** hub card on `/hmrc` (Step 9, Final bumped to Step 10); `PAGE_TITLES` in `components/AppLayout.js`.
- **OAuth scopes extended** in `pages/api/hmrc/oauth.js` to add `read:self-assessment-assist` + `write:self-assessment-assist`. ⚠️ **Existing HMRC token must be reconnected** to pick up the new scopes before Assist works.
- Not yet tested end-to-end against the sandbox (needs reconnect first). Lint passes.

## Session updates (2026-07-01) — Business Details API group (complete + tested)

Built out the full **Business Details** MTD API group (the app previously only had "List All Businesses" via `listBusinesses.js`). All 6 endpoints work end-to-end against the live sandbox.

### Shared helper (new — reduces boilerplate for all future routes)
- `lib/hmrc/session.js` — `resolveDriverSession(req)` returns `{ currentDriver, nino, hmrcToken }` (driver + NINO lookup + auto-refresh via `refreshToken`), and `resolveBusinessId(nino, hmrcToken, scenario)` resolves the first business income source from the HMRC list. Also exports `HMRC_BASE`, `BUSINESS_ID_PATTERN` (`^X[A-Z0-9]IS[0-9]{11}$`), `TAX_YEAR_PATTERN` (`^2\d{3}-\d{2}$`). Older routes still have their own inline copies (left untouched — no breakage); new routes use this.

### New API routes (all `application/vnd.hmrc.2.0+json`, `Gov-Test-Scenario: DEFAULT` overridable via `scenario` param)
| Route | Method(s) | HMRC endpoint |
|---|---|---|
| `pages/api/hmrc/businessDetails.js` | GET | `/individuals/business/details/{nino}/{businessId}` |
| `pages/api/hmrc/accountingType.js` | GET + PUT | `.../{businessId}/{taxYear}/accounting-type` (`CASH`/`ACCRUAL`) |
| `pages/api/hmrc/quarterlyPeriodType.js` | PUT | `.../{businessId}/{taxYear}` (`standard`/`calendar`) |
| `pages/api/hmrc/periodsOfAccount.js` | GET + PUT | `.../{businessId}/{taxYear}/periods-of-account` |
- All accept an optional `businessId` param; if omitted they auto-resolve via `resolveBusinessId`. **Body/enum validation runs BEFORE the businessId lookup** so invalid input returns 400 without burning an HMRC call (the sandbox throttles fast — resolving businessId is an extra HMRC call per request).
- GET accounting-type / periods-of-account treat 404 as "not submitted yet" (`notFound`/`notSubmitted: true`), not an error.
- PUTs return `{ success, businessId, taxYear, ..., correlationId }` (correlationId from `x-correlationid` response header; 204 bodies handled).

### UI
- `pages/hmrc-business-details.js` + `styles/hmrc-business-details.module.css` — loads the record for a tax year (defaults `2025-26`), shows what HMRC holds, and lets the driver set accounting type, quarterly period type, and periods of account. **Resolves businessId once (from businessDetails) and passes it to the follow-up reads + all PUTs** to halve HMRC call volume. Periods of account defaults to "No" (the sole-trader norm); "Yes" reveals conditional date rows.
- Reached via hub → Business details → **"Accounting settings"** button on `/hmrc-businesses` (list page left as-is). `PAGE_TITLES` entry added in `components/AppLayout.js`. Hub Step 2 copy updated.

### Tested end-to-end (2026-07-01) against live sandbox
Minted a real Supabase session for a token-holding driver (admin `generateLink` magiclink → `verifyOtp`) and hit every route:
- GET businessDetails → 200 (full record); GET accountingType → 200 `CASH`; GET periodsOfAccount → 200 (periods + dates)
- PUT accountingType / quarterlyPeriodType / periodsOfAccount(false) → all 200 + correlationId
- Validation: bad enum / missing boolean / true-without-dates / bad taxYear → all 400, and now *before* any HMRC call
- Only failures during testing were HMRC sandbox **throttling** ("exceeded your quota") under rapid fire — not bugs. Confirmed by re-running after the reorder fix.
- Nothing committed. Lint clean.

### Notes for remaining API groups (from user's API.md + list)
Still to build: **Individual Losses**, **Property Business**, **Employment Income** (List Employments, Retrieve Employment, Retrieve Other Employment Income, Retrieve Financial Details + Create/Amend for off-payroll/IR35 — see `MTD_REQUIREMENTS.md`), **Tax Liability Adjustments**. Spec source: `API.md` (user pastes HMRC docs there; `**` isn't a valid MD divider — use `---` or `****`). SA Assist (`assistReport.js`) already built but still untested (see below).

### Transaction monitoring / audit logging — PAUSED (build after endpoints)
User asked for HMRC-required API audit logging (record request/response/timestamp/user action/unusual activity). **Not built yet** — deferred so it can be wired across the complete endpoint set in one pass. Plan when resumed: `sql/011_create_hmrc_api_logs.sql` (driver_id, action, method, endpoint[NINO-redacted], http_status, success, correlation_id, error_code, flagged, request/response_summary[redacted], duration_ms, created_at; RLS self-select) + `lib/hmrc/auditLog.js` (`hmrcFetch` wrapper using `response.clone()` + `getSupabaseAdmin()` to write; redacts tokens/secrets/NINO) + wire into all ~29 HMRC fetch call sites + a read API/monitoring page.

## Session updates (2026-07-01, continued) — Property Business API (cumulative + annual, tested)

Built the **Property Business API v6.0** for drivers who also let out property (user confirmed several drivers have rental income). Scope decision: **cumulative (2025-26+) + annual only** — skipped the legacy `/period/` endpoints (they only support ≤2024-25; the app runs 2025-26).

### New helpers in `lib/hmrc/session.js`
- `resolveBusinessIdByType(nino, hmrcToken, allowedTypes, scenario)` — property has its **own** businessId (typeOfBusiness `uk-property` / `foreign-property`), separate from self-employment. Resolves the first matching business; throws a clear error if none registered.
- `readHmrcBody(response)` — **important shared fix.** HMRC is inconsistent: some success responses are 204, others are 200 with an **empty body**, so `response.json()` throws "Unexpected end of JSON input" (hit this on the property annual PUT). Returns `{}` for empty, parsed JSON otherwise, `{ raw }` for non-JSON. **Retrofitted into ALL new routes** (businessDetails, accountingType, quarterlyPeriodType, periodsOfAccount, propertyCumulative, propertyAnnual) replacing the old `status === 204 ? {} : json()` check.

### New API routes (Accept `application/vnd.hmrc.6.0+json`, `type=uk|foreign`, scenario overridable)
| Route | Method(s) | HMRC endpoint |
|---|---|---|
| `pages/api/hmrc/propertyCumulative.js` | GET + PUT | `/individuals/business/property/{uk\|foreign}/{nino}/{businessId}/cumulative/{taxYear}` (2025-26+ only, enforced) |
| `pages/api/hmrc/propertyAnnual.js` | GET + PUT + DELETE | `.../property/{uk\|foreign}/.../annual/{taxYear}`; DELETE uses generic `.../property/{nino}/{businessId}/annual/{taxYear}` (no uk/foreign segment) |
- Payload keys: UK cumulative → `ukProperty:{income,expenses}`; foreign cumulative → `foreignProperty:[...]`. UK annual → `ukFhlProperty`/`ukProperty`; foreign annual → `foreignFhlEea`/`foreignProperty`. Body validation runs before the businessId lookup (same rate-limit-saving pattern as Business Details). GET 404 → `noData:true`. All PUT/DELETE return `{ success, correlationId, ... }`.

### UI — `pages/hmrc-property.js` + `styles/hmrc-property.module.css` (UK focus)
- Tax year (default 2025-26) + **manual/auto businessId** input (property business often isn't in the sandbox DEFAULT list, and real drivers without property won't have one — so ID is editable, auto-filled when detected).
- Cumulative section: fromDate/toDate + UK non-FHL income & expense fields (dotted-key state → nested HMRC shape via `buildGroup`/`flattenGroup`; only filled fields sent). Load (GET) + Submit (PUT).
- Annual section: property income allowance — Load/Save (PUT). (Delete endpoint exists in the route but no UI button yet.)
- **Foreign property**: routes fully support it, but the **UI is UK-only** for now (foreign is rare for taxi drivers). Add a foreign toggle later if needed.
- Wired into hub `/hmrc` as an **"Optional" card** (no step renumbering) + `PAGE_TITLES` `'/hmrc-property': 'Property Income'`.

### Tested end-to-end (2026-07-01) against live sandbox
- Sandbox DEFAULT business list returns **only self-employment** — so property auto-resolve correctly errors "No uk-property business registered". Passing an explicit property-format businessId (`XAIS12345678910`) returns real canned data.
- GET cumulative uk → 200 (full income/expenses); GET annual uk → 200 `noData`; PUT cumulative uk → 200; PUT cumulative foreign → 200; PUT annual uk → 200; DELETE annual uk → 200 (all with correlationIds).
- Validation: bad type / taxYear <2025-26 / missing ukProperty / missing foreignProperty array → all 400.
- The annual PUT initially 500'd ("Unexpected end of JSON input", 200-empty-body) — fixed by `readHmrcBody`, re-tested green.
- Nothing committed. Lint clean.

### Still open in the property spec (not built — legacy, ≤2024-25)
Legacy `/period/` create/retrieve/amend/list for UK + foreign (7 endpoints). Skipped by decision — the app is 2025-26+. Build only if historical-year amendments are needed.

## Session updates (2026-07-01, continued) — Individual Losses + Tax Liability Adjustments (both tested)

Built the final two MTD API groups from `MTD_REQUIREMENTS.md`. **All 8 API groups in that list are now built** (Business Details, BSAS, Individual Calculations, Individual Losses, Tax Liability Adjustments, Obligations, Property Business, Self-Employment).

### Individual Losses API v7.0 (`INDIVIDUAL_LOSSES.md`)
- Route `pages/api/hmrc/losses.js` — GET / PUT / DELETE on `/individuals/losses/{nino}/businesses/{businessId}/loss-claims/{taxYear}`, `application/vnd.hmrc.7.0+json`.
- **Min tax year 2026-27** (stricter than other groups) + a span/gap check (rejects `2026-28`) via a local `validateTaxYear` helper. Body validated before the businessId resolve (rate-limit-saving pattern). GET 404 → `noData`. PUT/DELETE return `correlationId`.
- **`suspend-temporal-validations: true`** header sent on PUT when `body.suspendTemporalValidations` is set — losses are an end-of-year submission, so an in-year PUT 400s with `RULE_TAX_YEAR_NOT_ENDED` without it. Ignored in production.
- Page `pages/hmrc-losses.js` + `styles/hmrc-losses.module.css` — deep get/set helpers for the nested `claims.*`/`losses.*` shape, `preferenceOrder.applyFirst` dropdown, sandbox validation-relax checkbox (ticked by default). Load / Submit / Delete.
- Payload shape: `{ claims: { carryBack, carrySideways, preferenceOrder, carryForward }, losses: { broughtForwardLosses } }`.

### Tax Liability Adjustments API v1.0 (`TAX_LIABILITY_ADJUSTMENTS.md`)
- Route `pages/api/hmrc/taxLiabilityAdjustments.js` — GET / PUT / DELETE on `/individuals/tax-liability/adjustments/{nino}/{taxYear}`, `application/vnd.hmrc.1.0+json`. **No businessId** — individual (NINO) level. Same 2026-27 min + span check + `suspend-temporal-validations` on PUT.
- Payload: `{ carryBackLossesDecrease: { incomeTax, class4, capitalGainsTax } }` (at least one required).
- Page `pages/hmrc-tax-adjustments.js` — three amount fields; **reuses `styles/hmrc-losses.module.css`** (no new CSS file). Load / Submit / Delete.
- **Spec dependency (not enforced yet):** a carry-back-losses adjustment here requires the matching loss submitted via the Individual Losses endpoint before final declaration. Page has a hint pointing to the losses screen; no cross-check built. Possible later: soft warning if adjustments exist without corresponding losses.

### Both wired in + tested end-to-end (2026-07-01) against live sandbox
- Hub `/hmrc` Optional cards + `PAGE_TITLES` entries (`/hmrc-losses`, `/hmrc-tax-adjustments`) added.
- Tested via the same minted-session harness (admin `generateLink` → `verifyOtp` → hit routes): Losses GET/PUT/DELETE all 200 + correlationIds; Tax Adjustments GET/PUT/DELETE all 200. All validation cases (span year, below-min, empty body) return 400 before any HMRC call. DEFAULT returns the canned doc example.
- Losses PUT hit a **429 throttle** on the first rapid run (GET + business-list resolve burned quota) — passing an explicit `businessId` (skips resolve) → clean 200. Not a bug.
- **`applyFirst: 'carry-forward'` still unverified** — only `carry-sideways` (the doc example) was tested. Trim the dropdown option if the sandbox 400s on it.
- Lint clean. **Nothing committed** (consistent with the other 2026-07-01 groups — the whole Business Details / Property / Losses / Tax-Adjustments batch is still uncommitted).

## Session updates (2026-07-02) — Business-type capabilities layer + full BSAS (both tested)

### Capabilities layer — show only relevant HMRC features (tested end-to-end)
Drivers now see only the HMRC features that match their business type(s). Source of truth = the HMRC List All Businesses `typeOfBusiness`. Plan doc: `~/.claude/plans/iridescent-twirling-crown.md`. **Decisions:** soft gating (non-applicable features hidden but reachable via a "Show all HMRC features" toggle); auto-detect + manual override (sandbox list only returns self-employment, so property must be enabled by hand).

- **Migration `sql/011_create_driver_businesses.sql`** — ✅ **RUN in Supabase (2026-07-02).** Table `driver_businesses` (driver_id, business_id nullable, type_of_business, trading_name, source['hmrc'|'manual'], timestamps). Unique index on `(driver_id, type_of_business, COALESCE(business_id,''))`. RLS = customers pattern. `source` matters: HMRC re-sync replaces `source='hmrc'` rows but **never touches `manual`** rows (so a manually-enabled property survives a sandbox re-sync that only returns self-employment).
- **`lib/driverCapabilities.js`** — pure `deriveCapabilities(rows)` → `{ hasSelfEmployment, hasUkProperty, hasForeignProperty, hasProperty, businesses }`. **Safe default: no rows → `hasSelfEmployment: true`** (taxi-first, core flow never hidden).
- **`lib/driverContext.js`** — `DriverContext` + `useDriver()` / `useDriverCapabilities()`. Populated once by `AppLayout` (which now also queries `driver_businesses`), exposes `refreshBusinesses()`.
- **Routes** (both use `getSupabaseAdmin()` — server authenticates the driver via `resolveDriverSession`, bypasses RLS): `pages/api/hmrc/syncBusinesses.js` (POST — replaces hmrc rows from the HMRC list, keeps manual) and `pages/api/hmrc/driverBusinesses.js` (GET + POST/DELETE for manual uk-property/foreign-property toggles; manual add is check-then-insert, not upsert, because the unique index is a COALESCE expression index).
- **UI:** `pages/hmrc.js` gates the Property cards on `hasProperty || showAll` + a "Show all HMRC features" toggle (only shown when something is hidden). `pages/hmrc-businesses.js` gained a "Your business types" section (Re-sync from HMRC + manual property checkboxes). `pages/connect-hmrc.js` auto-syncs once on `?status=success`. `pages/dashboard.js` shows active business-type chips on the HMRC card.
- **Tested (2026-07-02):** sync writes 1 self-employment row; enable uk-property adds a manual row; **re-sync keeps the manual row** (HMRC row refreshed, manual survived); delete removes only the manual row. All green.

### Full BSAS — property + List (endpoints #3–#7, all tested)
Previously only self-employment BSAS existed (`adjustments.js`, still the `/hmrc-adjustments` page — left untouched to avoid regression). Built the rest from `BSAS.md`.

- **`pages/api/hmrc/bsas.js`** — new **unified** route (v7.0), one POST dispatched by `action`: `list` (#7), `trigger` (#8, now type-aware), `retrieve` (#1/#3/#5), `submit` (#2/#4/#6). Uses `lib/hmrc/session.js` helpers. Per-type URL segment (`self-employment`/`uk-property`/`foreign-property`). **Submit takes the exact `payload`** (UK wraps `{ ukProperty: {...} }`; foreign wraps `{ foreignProperty: { countryLevelDetail: [{ countryCode, income, expenses }] } }`) — shaping lives in the UI because foreign is per-country. Saves to `hmrc_adjustments` (best-effort). 2025-26+ enforced.
- **Retrieve scenarios (sandbox):** DEFAULT returns "no data" for property (same as SE needing `SELF_EMPLOYMENT_PROFIT`). Discovered + wired: **`UK_PROPERTY_PROFIT`** and **`FOREIGN_PROPERTY_PROFIT`** (the page passes them automatically). `UK_PROPERTY_NON_FHL_PROFIT` → `RULE_INCORRECT_GOV_TEST_SCENARIO`.
- **Page `pages/hmrc-property-bsas.js`** + `styles/hmrc-property-bsas.module.css` — UK/foreign toggle; Step 1 trigger + List (pick a calcId); Step 2 retrieve/review (totalIncome/expenses/netProfit/taxableProfit); Step 3 submit with itemised / consolidated / zero-adjustment modes (+ per-country code for foreign). Enforces one-of expense modes client-side. Gated to property users on the hub; `PAGE_TITLES` `/hmrc-property-bsas`.
- **Tested (2026-07-02):** list (SE) → 200 (returns SE+UK+foreign); trigger (uk-property) → 200 + calcId; submit uk-property itemised → 200 + correlationId; submit foreign-property itemised → 200 + correlationId; retrieve uk + foreign → 200 with real figures via the PROFIT scenarios; all validations (bad action / pre-2025 / missing calcId / empty payload) → 400.
- **Caveat:** the doc's UK-property **submit** example was collapsed (empty `income`/`expenses`); fields were inferred from the #3 retrieve `adjustments` block. The itemised UK submit returned 200, so the shape is validated. FHL ignored throughout (abolished from 2025-26; app is 2025-26+).

### Whole HMRC batch still UNCOMMITTED
Business Details, Property Business, Losses, Tax Liability Adjustments, capabilities layer, and BSAS are all built + tested but **nothing is committed** — it's all sitting in the working tree. Consider committing (grouped) before the tree gets harder to reason about.

## Next steps (pick up here next session)
0. **Finish testing SA Assist (built 2026-06-30, not yet tested).** (a) On `/connect-hmrc`, disconnect + reconnect to HMRC to get a token with the new `*-assist` scopes. (b) Go to `/hmrc-assist`, pick a calculation, request the report. (c) Confirm both POST verbs are accepted (flip to GET/PUT if 405). (d) Find the `Gov-Test-Scenario` that returns a 200 report-with-messages — pass it via `body.scenario` (default DEFAULT likely just 204). See the "SA Assist report flow built" section above.
1. **Notifications** — HMRC MTD quarterly submission reminders; read up on HMRC notification requirements first before building (do all at once). Simplest path: in-app banner/card on dashboard when deadline is approaching (reuse `getDueDateUrgency` logic already in obligations page).
2. **Help & support section** — leaning toward free Crisp/Tawk.to chat widget for early-stage direct support; FAQ can come later once common questions emerge
3. **Subscription/payment** — user onboarding and payment gate
4. **AI receipt scanning** — camera/upload on transactions page; leave until app is otherwise complete
