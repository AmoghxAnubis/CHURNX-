# ChurnX implementation plan

This plan turns the PRD into a frontend-first MVP that can run today and connect to the FastAPI service when it is available.

## Ralph loop

Each pass follows the same loop: inspect the requirement, implement the smallest complete slice, run build/lint, manually review the user flow, then tighten the next pass.

## Pass 1 — product alignment

- Replace invented prototype fields (`usageFrequency`, `supportTickets`, `latePayments`) with the IBM Telco model schema.
- Remove unsupported revenue claims and make metrics source-aware.
- Add the complete PRD navigation: Overview, Customers, Predictions, Insights, and Model.

## Pass 2 — prediction workflow

- Build a canonical customer form covering demographic, account, services, and billing inputs.
- Add validation, loading state, friendly failure state, and a result view with probability, risk, classification, and reasons.
- Use `VITE_API_URL` when configured; keep a clearly-labelled local demo fallback so the UI remains testable without a backend.

## Pass 3 — intelligence views

- Add searchable, filterable, sortable scored-customer table.
- Add insight charts for contract, internet service, payment method, and feature importance.
- Add model metadata and evaluation cards without presenting disconnected values as live production results.

## Pass 4 — polish and verification

- Improve hierarchy, states, responsive behavior, keyboard labels, and visual consistency.
- Run ESLint and a production build.
- Manually review the main navigation and prediction flow in the browser.

## Acceptance checklist

- [x] Form uses real IBM Telco fields.
- [x] No invented financial metric is shown.
- [x] Prediction result includes probability, risk, classification, and reasons.
- [x] Customers supports search, risk filter, and sort.
- [x] Insights and Model pages are functional, not placeholders.
- [x] API integration is environment-driven and demo fallback is explicit.
- [ ] FastAPI endpoints and model artifact are connected when the backend is added.
