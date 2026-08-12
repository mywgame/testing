# MetaFirm Cloudflare Worker Maintenance Mode Guide

This guide details how to deploy and manage a **zero-downtime, edge-level Maintenance Mode** for `metafirm.app` using **Cloudflare Workers**.

---

## 🌟 Key Features
- **Zero Application Code Changes**: Completely decoupled from Vercel, Render, Railway, Neon, and frontend React code.
- **Instant Toggle**: Turn Maintenance Mode ON or OFF in seconds via Cloudflare Dashboard Environment Variables.
- **Secret Cookie Browser Bypass**: Access the production Vercel app in your browser while public visitors see the 503 Maintenance Page.
- **Clean URL Redirect**: Visiting `https://metafirm.app/?bypass_key=SECRET` sets a `Secure`, `HttpOnly`, `SameSite=Strict` cookie and immediately redirects to `https://metafirm.app/`, removing the secret from your address bar.
- **503 Status Code**: Returns proper HTTP 503 headers with `Retry-After: 300` so search engine crawlers do not index the maintenance page as main site content.

---

## 🚀 Step 1: Deploy the Cloudflare Worker

1. Log into your **Cloudflare Dashboard** (https://dash.cloudflare.com).
2. Go to **Workers & Pages** -> Click **Create Application** -> **Create Worker**.
3. Name your worker: `metafirm-maintenance-worker` and click **Deploy**.
4. Click **Edit Code** (or Quick Edit) in the browser editor.
5. Copy the contents of [`scripts/cloudflare-maintenance-worker.js`](./scripts/cloudflare-maintenance-worker.js) and paste it into `worker.js`.
6. Click **Save and Deploy**.

---

## ⚙️ Step 2: Configure Environment Variables

1. In your Worker dashboard, go to **Settings** -> **Variables and Secrets**.
2. Add the following **Environment Variables / Secrets**:

| Variable Name | Type | Value | Description |
| :--- | :--- | :--- | :--- |
| `MAINTENANCE_MODE` | Plain Text | `"false"` (or `"true"`) | Turn ON/OFF (`"true"` = Maintenance Active, `"false"` = Live traffic) |
| `BYPASS_SECRET` | Secret / Text | `metafirm_maint_secret_2026` | Custom secret token used for browser bypass |

*(Replace `metafirm_maint_secret_2026` with any strong random string of your choice).*

---

## 🔗 Step 3: Bind Worker to Custom Domain Route

1. In Cloudflare, select your domain **`metafirm.app`**.
2. Go to **Workers Routes** -> Click **Add Route**.
3. Configure the route:
   - **Route**: `metafirm.app/*`
   - **Worker**: `metafirm-maintenance-worker`
4. Click **Save**.

---

## 🛠️ Step 4: How to Use Maintenance Mode & Browser Bypass

### **A. Turning Maintenance Mode ON**
1. Go to Worker **Settings** -> **Variables**.
2. Edit `MAINTENANCE_MODE` -> Set value to `"true"`.
3. Click **Save and Deploy**.
4. All public visitors accessing `https://metafirm.app` will now see the lightweight MetaFirm 503 Maintenance Page.

### **B. Bypassing Maintenance Mode in Your Browser**
1. Open your browser and navigate to:
   ```
   https://metafirm.app/?bypass_key=metafirm_maint_secret_2026
   ```
2. The Worker will:
   - Validate your secret key.
   - Set an `HttpOnly`, `Secure`, `SameSite=Strict` cookie (`mf_maint_bypass`).
   - Immediately redirect you back to `https://metafirm.app/` without the query parameter in the URL.
3. You can now browse the production app, log into test accounts, and test Vercel/Render frontend & API seamlessly!

### **C. Turning Maintenance Mode OFF**
1. Go to Worker **Settings** -> **Variables**.
2. Edit `MAINTENANCE_MODE` -> Set value to `"false"`.
3. Click **Save and Deploy**.
4. Traffic passes through normally to Vercel for all visitors.

---

## 🔒 Security Summary
- The secret parameter `?bypass_key=...` is never displayed in the URL after redirect.
- Cookie is scoped to `Path=/`, `Secure`, `HttpOnly`, `SameSite=Strict`, preventing XSS and CSRF exposure.
- Render API, DB, and backend processes remain untouched and operational.
