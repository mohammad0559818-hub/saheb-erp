# KNOWN LIMITATIONS AND PRODUCTION BLOCKERS

1. This environment blocks npm registry access to scoped packages, so local install/build verification cannot run here.
2. This environment blocks GitHub HTTPS push, so code must be pushed from a network with GitHub access or uploaded via the generated ZIP.
3. Production requires real Supabase credentials and a provisioned Supabase project.
4. Company memberships and role permissions must be seeded for real users before enforcing strict access policies.
5. ZATCA and UAE e-invoicing integrations are prepared as data/API surfaces but require certified provider integration before official tax submission.
6. WhatsApp order intake stores raw/parsed orders; production messaging requires Meta WhatsApp Business API credentials and webhook verification.
7. PDF export currently returns printable HTML; production-grade PDF generation should be connected to a server-side renderer or external document service.
