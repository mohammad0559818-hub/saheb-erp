const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
const paths = ['/api/health', '/api/erp', '/dashboard', '/dashboard/reports', '/dashboard/attachments'];
for (const path of paths) {
  const response = await fetch(`${baseUrl}${path}`);
  if (!response.ok) throw new Error(`${path} failed with ${response.status}`);
  console.log(`ok ${path}`);
}
