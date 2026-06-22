# SAHEB ERP Changes Since Commit e82d418

## Enterprise completion additions

- Added global search API and navigation search form.
- Added activity timeline API for customers, suppliers, projects, contracts, and any auditable subject.
- Added system settings API and system settings screen.
- Added company profile and multi-VAT configuration screen.
- Added export buttons for Excel, CSV, and PDF links to reusable resource screens.
- Added dashboard KPI bar visualizations.
- Added backup/restore runbook.
- Added final QA report, production checklist, and known limitations.

## Production blocker audit

Remaining blockers are documented in `docs/KNOWN_LIMITATIONS.md` and focus on external deployment requirements: real Supabase project credentials, registry access in the runner, user membership seeding, and final e-invoicing integrations.
