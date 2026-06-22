# SAHEB ERP Changes Since Commit d7ba709

## Baseline

The work continued from the latest completed baseline described by commit `d7ba709`: audit logging, permission validation, activity-log integration, Supabase REST filtering fixes, and the `CHANGES_SINCE_88c5233.md` report.

## New production workflow APIs

- Customer collections: `/api/customers/collections` records approved customer receipts and writes audit logs.
- Supplier payments: `/api/suppliers/payments` records approved supplier payments and writes audit logs.
- Approval engine: `/api/approvals/engine` creates approval requests with ordered steps and records approval/rejection decisions.
- Warehouse transfers: `/api/warehouses/transfers` creates approved warehouse transfers and paired stock movements.
- Mobile sales representatives: `/api/mobile-sales/representatives` creates representative profiles with territory and target amount.
- Treasury master data: `/api/treasury/cashboxes`, `/api/treasury/banks`, and `/api/treasury/main-vault` create cashboxes, bank accounts, and main vault records.
- Multi-VAT documents: `/api/vat/documents` creates VAT-aware sales/purchase tax documents with seller and buyer VAT references.
- Dashboard KPIs: `/api/dashboard/kpis` aggregates sales, purchases, collections, payments, and AI discrepancy counts.
- WhatsApp order intake preparation: `/api/whatsapp/orders` stores raw WhatsApp order messages and parsed item payloads for later conversion into sales orders.

## UI additions

- Added an Arabic RTL attachment management screen at `/dashboard/attachments` that requests signed upload links and links files to business records.
- Existing generic module screens continue to serve cashboxes, banks, main vault, mobile sales, VAT, approvals, projects, investments, contracts, and warehouse modules from the module catalogue.

## Database additions

- Approval steps and decisions.
- Warehouse transfers.
- VAT documents for multi-VAT sales/purchase workflows.
- WhatsApp orders for order-intake preparation.

## Runtime fixes

- Attachment upload route now accepts both JSON API requests and standard form submissions from the new attachment management screen.
