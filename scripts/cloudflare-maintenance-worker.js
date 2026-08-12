/**
 * MetaFirm Cloudflare Worker - Production Maintenance Mode & Secret Bypass
 * 
 * Route: metafirm.app/*
 * 
 * Environment Variables (Set in Cloudflare Worker Settings):
 * - MAINTENANCE_MODE: "true" | "false"
 * - BYPASS_SECRET: "your_secure_random_secret_here"
 */

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const bypassSecret = env.BYPASS_SECRET ? String(env.BYPASS_SECRET).trim() : '';
    const isMaintenanceOn = (env.MAINTENANCE_MODE || 'false').toLowerCase() === 'true';

    // 1. CHECK FOR SECRET BYPASS QUERY PARAMETER (?bypass_key=SECRET)
    if (bypassSecret && url.searchParams.has('bypass_key')) {
      const providedKey = url.searchParams.get('bypass_key');

      if (providedKey && providedKey === bypassSecret) {
        // Strip the secret query param to clean up URL and avoid leaking key in browser address bar/history
        url.searchParams.delete('bypass_key');
        const cleanUrl = url.toString();

        // Set secure, HttpOnly, SameSite=Strict cookie valid for 24 hours (86400s)
        const responseHeaders = new Headers({
          'Location': cleanUrl,
          'Set-Cookie': `mf_maint_bypass=${bypassSecret}; Path=/; Secure; HttpOnly; SameSite=Strict; Max-Age=86400`,
        });

        // 302 Redirect to the clean URL without revealing the secret
        return new Response(null, {
          status: 302,
          headers: responseHeaders,
        });
      }
    }

    // 2. CHECK FOR VALID BYPASS COOKIE IN INCOMING REQUEST
    const cookieHeader = request.headers.get('Cookie') || '';
    const hasValidBypassCookie = Boolean(bypassSecret) && cookieHeader.includes(`mf_maint_bypass=${bypassSecret}`);

    // 3. IF MAINTENANCE IS OFF OR USER HAS VALID BYPASS COOKIE -> PASS THROUGH TO VERCEL
    if (!isMaintenanceOn || hasValidBypassCookie) {
      return fetch(request);
    }

    // 4. RETURN LIGHTWEIGHT 503 MAINTENANCE PAGE FOR PUBLIC VISITORS
    const maintenanceHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>MetaFirm - Scheduled System Upgrade</title>
  <link rel="icon" type="image/png" href="/favicon.png" />
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
      background-color: #0b0e17;
      color: #f3f4f6;
      display: flex;
      align-items: center;
      justify-content: center;
      min-height: 100vh;
      padding: 1.5rem;
      text-align: center;
    }
    .card {
      background: rgba(17, 24, 39, 0.8);
      border: 1px solid rgba(255, 255, 255, 0.1);
      border-radius: 1.5rem;
      padding: 2.5rem 2rem;
      max-width: 480px;
      width: 100%;
      box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
      backdrop-filter: blur(12px);
    }
    .logo-container {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 64px;
      height: 64px;
      border-radius: 16px;
      background: linear-gradient(135deg, rgba(16, 185, 129, 0.2), rgba(59, 130, 246, 0.2));
      border: 1px solid rgba(16, 185, 129, 0.3);
      margin-bottom: 1.5rem;
    }
    .logo-icon {
      width: 32px;
      height: 32px;
      fill: #10b981;
    }
    h1 {
      font-size: 1.5rem;
      font-weight: 800;
      letter-spacing: -0.025em;
      margin-bottom: 0.75rem;
      color: #ffffff;
    }
    p {
      color: #9ca3af;
      font-size: 0.875rem;
      line-height: 1.6;
      margin-bottom: 1.5rem;
    }
    .status-badge {
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.375rem 0.875rem;
      border-radius: 9999px;
      background: rgba(245, 158, 11, 0.1);
      border: 1px solid rgba(245, 158, 11, 0.25);
      color: #fbbf24;
      font-size: 0.75rem;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      margin-bottom: 1.5rem;
    }
    .status-dot {
      width: 8px;
      height: 8px;
      border-radius: 50%;
      background-color: #f59e0b;
      animation: pulse 2s infinite;
    }
    @keyframes pulse {
      0% { opacity: 1; transform: scale(1); }
      50% { opacity: 0.4; transform: scale(1.1); }
      100% { opacity: 1; transform: scale(1); }
    }
    .footer-note {
      font-size: 0.75rem;
      color: #6b7280;
      border-top: 1px solid rgba(255, 255, 255, 0.05);
      padding-top: 1rem;
      margin-top: 1rem;
    }
  </style>
</head>
<body>
  <div class="card">
    <div class="logo-container">
      <svg class="logo-icon" viewBox="0 0 24 24">
        <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"></path>
      </svg>
    </div>
    
    <div class="status-badge">
      <span class="status-dot"></span>
      <span>System Maintenance Active</span>
    </div>

    <h1>MetaFirm Upgrades in Progress</h1>
    <p>We are currently performing scheduled platform enhancements and infrastructure maintenance to ensure optimal performance and security.</p>
    <p>Normal services will resume shortly. Thank you for your patience.</p>

    <div class="footer-note">
      MetaFirm Enterprise Infrastructure &bull; Status: Operational Upgrades
    </div>
  </div>
</body>
</html>`;

    return new Response(maintenanceHtml, {
      status: 503,
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
        'Cache-Control': 'no-store, no-cache, must-revalidate, max-age=0',
        'Retry-After': '300', // Suggest client retry in 5 minutes
      },
    });
  },
};
