# ChurnX

ChurnX is a React/Vite customer retention intelligence dashboard based on the IBM Telco Customer Churn schema.

## Current MVP surface

- Overview with source-aware dataset and workspace metrics
- Canonical individual prediction form for customer, account, service, and billing fields
- Probability, risk category, classification, and contributing-factor explanation
- Searchable, filterable, sortable scored-customer table
- Churn-pattern and feature-importance insights
- Model metadata and evaluation view
- Responsive dark dashboard UI

## Run locally

```bash
npm install
npm run dev
```

The UI runs in an explicitly labelled local demo mode when `VITE_API_URL` is not set. To connect the FastAPI service:

```bash
VITE_API_URL=http://localhost:8000 npm run dev
```

The frontend posts the canonical customer schema to `${VITE_API_URL}/predict` and accepts PRD response fields such as `churn_probability`, `risk_level`, `prediction`, `explanations`, and `model_version`.

## Verify

```bash
npm run lint
npm run build
```

See [PRD.md](./PRD.md) for the complete product and ML specification and [WORKPLAN.md](./WORKPLAN.md) for the implementation loop and acceptance checklist.
