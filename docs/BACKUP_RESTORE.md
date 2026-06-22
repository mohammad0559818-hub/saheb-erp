# BACKUP AND RESTORE RUNBOOK

## Backup

- Enable Supabase Point-in-Time Recovery for production projects.
- Schedule daily logical exports for critical ERP tables.
- Export the `erp-attachments` Storage bucket daily.
- Store encrypted exports in a separate cloud account.
- Back up Vercel environment variables after every change.

## Restore

1. Freeze writes by disabling public traffic in Vercel.
2. Restore Supabase database to the required timestamp.
3. Restore Storage bucket objects.
4. Re-apply environment variables.
5. Run smoke tests: `/api/health`, `/api/erp`, `/dashboard`, `/dashboard/reports`.
6. Re-enable traffic.
