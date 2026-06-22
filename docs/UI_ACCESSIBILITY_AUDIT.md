# SAHEB ERP UI Accessibility and Route Coverage Audit

This audit documents the production UI handoff completed after the previous dashboard exposure work. It verifies that implemented backend workflows are reachable from Arabic RTL screens and that each required feature has a dashboard navigation entry.

## Required feature screens

| Feature | Dashboard route | Backend integration | Data operations exposed |
| --- | --- | --- | --- |
| Backup & Restore | `/dashboard/backup-restore` | `/api/system/backup-restore`, `/api/system/backup-export`, `/api/erp/backup_jobs` | restore/export actions, list, search, update, delete backup job records |
| ERP Import (Excel/CSV) | `/dashboard/import-data` | `/api/system/import-data`, `/api/erp/import_jobs` | multipart CSV/Excel import, result preview, list, search, update, delete import jobs |
| Sales Quotations | `/dashboard/sales-quotations` | `/api/sales/quotations`, `/api/erp/sales_quotations` | create quotation workflow, list, search, update, delete quotation headers |
| Sales Returns | `/dashboard/sales-returns` | `/api/sales/returns`, `/api/erp/sales_returns` | create return workflow with inventory impact, list, search, update, delete return headers |
| Purchase Returns | `/dashboard/purchase-returns` | `/api/purchases/returns`, `/api/erp/purchase_returns` | create supplier return workflow with inventory impact, list, search, update, delete return headers |
| Universal Attachments | `/dashboard/attachments` | `/api/attachments/upload`, `/api/attachments/link`, `/api/erp/attachments` | signed Supabase Storage upload, link attachment to any module, list/search/update/delete attachment records |
| Sales Representatives with image uploads | `/dashboard/mobile-sales-reps` | `/api/mobile-sales/representatives`, `/api/mobile-sales/handover`, `/api/erp/mobile_sales` | create representatives, list/search/update/delete representatives, upload/link images and documents |
| AI Reconciliation | `/dashboard/ai-discrepancies` | `/api/ai/discrepancies`, `/api/erp/ai_discrepancy_analysis` | create discrepancy analysis, list/search/update/delete findings |
| Audit Logs | `/dashboard/audit-logs` | `/api/erp/activity_logs` | list/search audit entries and controlled update/delete through permission-checked generic API |
| Permissions & Roles | `/dashboard/users-roles` | `/api/permissions/check`, `/api/erp/role_permissions` | validate permissions and maintain role permission records |

## Shared UI behavior

- `ResourceScreen` now exposes the full operational surface for mapped modules: workflow create/execute, list, search, edit, delete, export links, API result preview, and Arabic success/error states.
- Specialized workflow APIs remain the creation/execution path, while CRUD screens use the permission-checked generic `/api/erp/[module]` API against the matching Supabase table.
- Attachment and import workflows use client-side forms so operators can see JSON responses and errors without leaving the dashboard.

## Navigation coverage

The dashboard sidebar includes direct links for all production workflow screens above and also retains the generated module catalogue links for every module in `lib/modules.ts`.

## Remaining deployment dependency

End-to-end browser validation requires a deployed Supabase project with real tenant records, storage bucket policies, authentication cookies, and role permissions. The code paths are wired to real APIs and tables; no mock-only dashboard screen is used for the required feature list.
