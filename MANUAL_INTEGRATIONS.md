# CivilTrace Kenya — Production Manual Integrations & Go-Live Checklist

This document provides an exhaustive, step-by-step technical guide for configuring all external third-party services, APIs, credentials, webhooks, and infrastructure required to make **CivilTrace (v1.0)** fully production-ready on your production domain and VPS.

---

## Executive Summary: Integration Matrix

| Integration Domain | Third-Party Provider | Primary Purpose | Key Env Variables / Assets | Complexity |
| :--- | :--- | :--- | :--- | :--- |
| **Social SSO Auth** | Meta, Twitter (X), Google via Firebase | Frictionless Citizen onboarding | `NEXT_PUBLIC_FIREBASE_*` | Moderate |
| **Phone SMS & OTP** | Africa's Talking (Kenya) | Citizen phone verification & anti-spam | `AT_API_KEY`, `AT_USERNAME`, `AT_SENDER_ID` | Moderate |
| **Payments & M-PESA** | Paystack Kenya | Paid priority emergency broadcasts | `PAYSTACK_SECRET_KEY`, Webhook URL | Low |
| **Forensic AI Triage** | Google Gemini (2.5 Flash) | Multimodal parity check (OB vs Social Post) | `GEMINI_API_KEY` | Low |
| **Push Notifications** | Firebase Cloud Messaging (FCM) | Geo-radius alerts & triage queue notifications | `FIREBASE_*`, `serviceAccountKey.json` | Moderate |
| **Database & CMS** | MongoDB Atlas & Payload CMS v3 | Persistent data layer, RBAC, Admin Panel | `DATABASE_URI`, `PAYLOAD_SECRET` | Low |
| **Error Monitoring** | Sentry.io | Production exception tracking & telemetry | `SENTRY_DSN`, `NEXT_PUBLIC_SENTRY_DSN` | Low |
| **VPS & Web Server** | Ubuntu VPS, Nginx, Let's Encrypt | Reverse proxy, SSL, Node daemon via PM2 | `server.ts`, `nginx.conf`, Certbot | Moderate |
| **Scheduled Jobs** | Node-Cron & Webhook Fallback | ODPC auto-unpublish, Paystack reconciliation | `CRON_SECRET`, `server.ts` | Low |
| **Data Compliance** | ODPC Kenya & Meta/Google Policies | Legal mandate compliance (Data Protection Act) | Privacy Policy, Terms, Data Deletion URLs | High (Legal) |

---

## 1. Social SSO Integration (Facebook, Twitter/X, Google)

CivilTrace uses Firebase Auth on the client side with a unified backend session bridge into Payload CMS v3 (`/api/auth/sso`).

### 1.1. Firebase Console Core Setup
1. Open the [Firebase Console](https://console.firebase.google.com/) and navigate to your project (e.g. `patofy-254` or your dedicated `civiltrace-ke` project).
2. Navigate to **Authentication → Settings → Authorized domains**.
3. Add your production domains:
   - `civiltrace.org` (and `www.civiltrace.org`)
   - Your VPS public IP address (for initial testing)
   - `localhost` (already enabled for dev)
4. Ensure your web app config is copied into your production `.env`:
   ```env
   NEXT_PUBLIC_FIREBASE_API_KEY="AIzaSy..."
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN="<project-id>.firebaseapp.com"
   NEXT_PUBLIC_FIREBASE_PROJECT_ID="<project-id>"
   NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET="<project-id>.appspot.com"
   NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID="..."
   NEXT_PUBLIC_FIREBASE_APP_ID="1:...:web:..."
   ```

---

### 1.2. Facebook / Meta SSO Setup
1. Go to [Meta for Developers](https://developers.facebook.com/) and sign in.
2. Click **My Apps → Create App**.
   - Select App Type: **Consumer** or **Business**.
   - App Name: `CivilTrace Kenya`.
   - Contact Email: `contact@civiltrace.org`.
3. Under **Add products to your app**, locate **Facebook Login** and click **Set Up**.
   - Select platform: **Web**.
4. Navigate to **Facebook Login → Settings** in the left sidebar:
   - Set **Client OAuth Login**: `Yes`
   - Set **Web OAuth Login**: `Yes`
   - Set **Valid OAuth Redirect URIs** to your Firebase Auth handler URL:
     ```text
     https://<YOUR_FIREBASE_PROJECT_ID>.firebaseapp.com/__/auth/handler
     ```
   - Save changes.
5. In the left sidebar, navigate to **App Settings → Basic**:
   - Copy the **App ID** and **App Secret** (click *Show*).
   - Enter your **Privacy Policy URL** (e.g., `https://civiltrace.org/privacy`).
   - Enter your **Terms of Service URL** (e.g., `https://civiltrace.org/terms`).
   - Fill in **User Data Deletion**: Choose *Data Deletion Instructions URL* and enter `https://civiltrace.org/data-deletion`.
   - Category: Select **Public Good** or **Government & Politics** or **Social Networking**.
6. **Enable Facebook in Firebase Console**:
   - Go to Firebase Console → **Authentication → Sign-in method → Add provider → Facebook**.
   - Toggle **Enable**.
   - Paste the **App ID** and **App Secret** from Meta.
   - Click **Save**.
7. **Switch Meta App to Live Mode**:
   - At the top of the Meta App Dashboard, toggle **App Mode** from **Development** to **Live**.
   *(Note: Until switched to Live, only users with Developer, Admin, or Tester roles in your Meta App can log in).*

---

### 1.3. X (Twitter) SSO Setup
1. Go to the [Twitter Developer Portal](https://developer.twitter.com/en/portal/dashboard).
2. Create a **Project** and an **App** (Free or Basic tier).
3. In your App settings, scroll to **User authentication settings** and click **Set up**:
   - App permissions: Select **Read** (Read user info & email).
   - Type of App: Select **Web App**.
   - App info:
     - **Callback URI / Redirect URL**:
       ```text
       https://<YOUR_FIREBASE_PROJECT_ID>.firebaseapp.com/__/auth/handler
       ```
     - **Website URL**: `https://civiltrace.org`
     - **Terms of service**: `https://civiltrace.org/terms`
     - **Privacy policy**: `https://civiltrace.org/privacy`
   - Click **Save**.
4. Copy the generated **Client ID** and **Client Secret** (or Consumer API Key & Secret under *Keys and Tokens*).
5. In Firebase Console:
   - Navigate to **Authentication → Sign-in method → Add provider → Twitter**.
   - Toggle **Enable**.
   - Enter your Twitter API Key and API Secret.
   - Click **Save**.

---

### 1.4. Google Sign-In Setup
1. In Firebase Console:
   - Navigate to **Authentication → Sign-in method → Add provider → Google**.
   - Toggle **Enable**.
   - Select your **Project public-facing name** (e.g. `CivilTrace`).
   - Select a **Project support email**.
   - Click **Save**.
2. In [Google Cloud Console Credentials](https://console.cloud.google.com/apis/credentials):
   - Locate the automatically created OAuth 2.0 Web Client for Firebase.
   - Under **Authorized JavaScript origins**, ensure both `https://civiltrace.org` and `https://<YOUR_FIREBASE_PROJECT_ID>.firebaseapp.com` are listed.

---

## 2. Phone Number Verification & SMS OTP (Africa's Talking)

CivilTrace uses [Africa's Talking](https://africastalking.com/) for dispatching 6-digit SMS verification OTP codes to Kenyan mobile numbers (+254...) to establish citizen accountability and prevent spam emergency submissions.

### 2.1. Account & API Credentials
1. Register an account at [Africa's Talking](https://account.africastalking.com/).
2. Create an Application for CivilTrace:
   - Switch from the **Sandbox** team to your live production team.
   - Note down your **Application Username** (`AT_USERNAME`).
3. Generate a Live API Key:
   - Go to **Settings → API Key**.
   - Enter your account password and generate a key (`AT_API_KEY`).

### 2.2. Alphanumeric Sender ID Registration (Kenya)
1. In Africa's Talking portal, navigate to **SMS → Alphanumeric Sender IDs**.
2. Request a custom Alphanumeric Sender ID: `CIVILTRACE` (maximum 11 characters).
3. Under Kenyan telecommunications regulations (CAK / Safaricom / Airtel):
   - You must submit a letter of authorization on company/organization letterhead or registration certificate.
   - Approval typically takes 24 to 72 business hours.
4. *Interim fallback:* Until your custom Sender ID is approved, leave `AT_SENDER_ID` empty or use the standard shared shortcode provided by Africa's Talking.

### 2.3. Wallet Top-Up (SMS Credits)
1. Go to **Billing → Top Up**.
2. Deposit funds via **M-PESA Paybill** directly into your Africa's Talking account.
3. Kenyan local SMS rates are typically ~0.8 KES per SMS segment.
4. Configure an automated **Low Balance Alert Email** (e.g. notify when balance falls below KES 500) to prevent OTP verification failures for users.

### 2.4. Production Environment Configuration
```env
AT_API_KEY="atsk_live_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
AT_USERNAME="civiltrace_ke"
AT_SENDER_ID="CIVILTRACE"
```

---

## 3. Paystack Payment Gateway (M-PESA, Cards, Webhooks)

CivilTrace integrates [Paystack Kenya](https://paystack.com/) to process paid community emergency broadcasts (KES 500 - 2,500) that trigger targeted geo-radius citizen pushes and social media amplification.

### 3.1. Paystack Merchant Account Setup
1. Register at [Paystack.com](https://dashboard.paystack.com/signup).
2. Set Business Country: **Kenya**.
3. Submit compliance documents:
   - Business Registration or National ID.
   - KRA PIN certificate.
   - Settlement bank account or M-PESA Business Till/Paybill for receiving payouts.
4. Once activated, switch your dashboard toggle from **Test Mode** to **Live Mode**.

### 3.2. Retrieve API Keys
1. Go to **Settings → API Keys & Webhooks**.
2. Copy your **Live Secret Key**: `sk_live_...` (`PAYSTACK_SECRET_KEY`).
3. Set your environment variable:
   ```env
   PAYSTACK_SECRET_KEY="sk_live_xxxxxxxxxxxxxxxxxxxxxxxxxxxx"
   ```

### 3.3. Webhook Endpoint Configuration
Paystack must notify CivilTrace when an M-PESA payment completes so the alert can be automatically published and geo-broadcast:
1. In Paystack Dashboard → **Settings → API Keys & Webhooks**.
2. In the **Live Webhook URL** field, enter:
   ```text
   https://civiltrace.org/api/webhooks/paystack
   ```
3. Click **Save Changes**.
4. Test the webhook using the **Test Webhook** button in Paystack to confirm the server returns HTTP 200 OK.

### 3.4. Payment Channels & Callback URL
1. In Paystack Dashboard → **Settings → Preferences**:
   - Ensure **Mobile Money (M-PESA, Airtel Money)** and **Cards** are enabled.
2. In your `.env`, ensure the server URL is correctly defined for return callbacks:
   ```env
   NEXT_PUBLIC_SERVER_URL="https://civiltrace.org"
   ```

---

## 4. Google Gemini Multimodal AI (Forensic Parity Engine)

CivilTrace uses Google Gemini (`gemini-2.5-flash` via `@google/genai`) to perform automated forensic cross-matching between submitted Police OB reports, photos, and live social media emergency posts.

### 4.1. API Key Generation
1. Go to [Google AI Studio](https://aistudio.google.com/).
2. Sign in with your production Google account.
3. Click **Get API Key → Create API Key**.
4. Copy the generated key.

### 4.2. Billing & Quota Setup
1. Free tier keys have strict request-per-minute (RPM) limits and are not suitable for sudden viral spikes.
2. Link your API key to a Google Cloud Billing Project in the Google Cloud Console to ensure uninterrupted production throughput.
3. Add the key to your production `.env`:
   ```env
   GEMINI_API_KEY="AIzaSy..."
   ```

---

## 5. Firebase Cloud Messaging (FCM) & Admin SDK

CivilTrace uses FCM to dispatch real-time emergency push notifications to citizens within a 10km-50km radius of an incident, as well as notify community moderators of pending triage items.

### 5.1. Generate Firebase Service Account Key
1. Go to [Firebase Console](https://console.firebase.google.com/) → **Project Settings → Service accounts**.
2. Select **Firebase Admin SDK** (Node.js).
3. Click **Generate new private key**.
4. Download the generated `serviceAccountKey.json` file.
5. Extract the fields into your production `.env`:
   ```env
   FIREBASE_PROJECT_ID="<project_id>"
   FIREBASE_CLIENT_EMAIL="firebase-adminsdk-xxxxx@<project_id>.iam.gserviceaccount.com"
   FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYOUR_PRIVATE_KEY_HERE\n-----END PRIVATE KEY-----\n"
   ```
   *(Important: Ensure newline characters `\n` in the private key are properly formatted).*

### 5.2. Enable Cloud Messaging API (V1)
1. Go to [Google Cloud Console](https://console.cloud.google.com/).
2. Select your Firebase project.
3. Search for **Firebase Cloud Messaging API (V1)** and ensure it is **Enabled**.
4. In Firebase Console → **Project Settings → Cloud Messaging**:
   - Under **Web configuration**, click **Generate key pair** to generate a Web Push VAPID certificate if browser web push is enabled.

---

## 6. MongoDB Atlas & Payload CMS v3 Configuration

CivilTrace runs on MongoDB via Payload CMS's official `@payloadcms/db-mongodb` adapter.

### 6.1. MongoDB Atlas Production Cluster
1. Log into [MongoDB Atlas](https://cloud.mongodb.com/).
2. Create or select a dedicated production cluster (M10+ recommended for automated daily backups and replica set transactions).
3. **Database User**:
   - Go to **Database Access → Add New Database User**.
   - Authentication Method: Password.
   - Built-in Role: `readWrite` on the `civil-trace` database.
4. **Network Access**:
   - Go to **Network Access → Add IP Address**.
   - Add your VPS Elastic / Static Public IP address.
   *(Do NOT leave it at 0.0.0.0/0 in production).*
5. **Connection String**:
   - Click **Connect → Drivers → Node.js**.
   - Set in production `.env`:
     ```env
     DATABASE_URI="mongodb+srv://<user>:<password>@cluster0.xxxxx.mongodb.net/civil-trace?retryWrites=true&w=majority"
     ```

### 6.2. Payload CMS Secret & Initial Super Admin
1. Generate a cryptographically strong 32+ character random secret:
   ```bash
   node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
   ```
2. Set in `.env`:
   ```env
   PAYLOAD_SECRET="<generated-64-character-hex-string>"
   ```
3. **First-Time Super Admin Creation**:
   - After deploying and starting the server, visit:
     `https://civiltrace.org/admin`
   - Payload will prompt you to create the initial root administrator account.
   - Save these credentials in a secure password manager (e.g. 1Password/Bitwarden).

---

## 7. Media Storage & Uploads Configuration

The `Media` collection currently stores uploaded incident photos, police OB sheets, and vehicle registration documents in `public/media`.

### 7.1. VPS Persistent Directory Setup
Next.js deployments on a VPS rebuild the project, which will overwrite files in `public/media` unless persisted outside the git deployment directory:
1. Create a persistent shared media directory on your VPS:
   ```bash
   sudo mkdir -p /var/www/civil-trace-shared/media
   sudo chown -R www-data:www-data /var/www/civil-trace-shared/media
   sudo chmod -R 775 /var/www/civil-trace-shared/media
   ```
2. In your deployment script (or after cloning), create a symlink:
   ```bash
   ln -sfn /var/www/civil-trace-shared/media /var/www/civil-trace/public/media
   ```

---

## 8. Sentry Error Tracking & Telemetry

1. Create a project at [Sentry.io](https://sentry.io/) (Platform: **Next.js**).
2. Retrieve your **DSN**.
3. Set the variables in `.env`:
   ```env
   SENTRY_DSN="https://xxxxxxx@oXXXXX.ingest.sentry.io/XXXXXXX"
   NEXT_PUBLIC_SENTRY_DSN="https://xxxxxxx@oXXXXX.ingest.sentry.io/XXXXXXX"
   ```
4. Configure Sentry Alert Rules to ping your technical team on Slack / WhatsApp / Email when unhandled exceptions occur in cron jobs or auth routes.

---

## 9. VPS Deployment, Nginx, SSL, & PM2 Setup

CivilTrace includes a custom production entry point (`server.ts`) that starts Next.js, mounts Payload CMS, seeds the 218+ national police stations and 40 ambulance units, and runs the background `node-cron` tasks.

### 9.1. Domain DNS Configuration
Configure your domain registrar (e.g., Safaricom Domains, Namecheap, Cloudflare) with DNS records:
- **Type A**: `@` → `<YOUR_VPS_PUBLIC_IP>`
- **Type A**: `www` → `<YOUR_VPS_PUBLIC_IP>`

### 9.2. Nginx Reverse Proxy Configuration
Create an Nginx server block at `/etc/nginx/sites-available/civiltrace`:
```nginx
server {
    server_name civiltrace.org www.civiltrace.org;

    # Allow large incident photo uploads
    client_max_body_size 30M;

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```
Enable and verify the configuration:
```bash
sudo ln -s /etc/nginx/sites-available/civiltrace /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

### 9.3. Free SSL via Let's Encrypt (Certbot)
```bash
sudo apt update
sudo apt install certbot python3-certbot-nginx -y
sudo certbot --nginx -d civiltrace.org -d www.civiltrace.org
```
Certbot will configure HTTPS automatic renewal timers in systemd.

### 9.4. PM2 Process Daemon
1. Install PM2 globally:
   ```bash
   npm install -g pm2
   ```
2. Build the Next.js production bundle:
   ```bash
   npm run build
   ```
3. Start the application via `server.ts`:
   ```bash
   pm2 start server.ts --name "civil-trace" --interpreter ./node_modules/.bin/tsx
   ```
4. Persist across VPS server reboots:
   ```bash
   pm2 save
   pm2 startup
   ```

---

## 10. Background Cron Jobs & ODPC Compliance Verification

CivilTrace embeds automated `node-cron` tasks directly inside `server.ts`:
1. **Hourly Social Link Verification (`verifySocialLinks`)**:
   - Scans active alerts with social links.
   - Pings social URLs via `HEAD` request.
   - If a post was deleted or made private (HTTP 404/410), the alert is **automatically unpublished** to uphold the *Right to be Forgotten* under the Kenya Data Protection Act 2019.
2. **6-Hourly Triage Backlog Alert (`processStaleTriage`)**:
   - Pings moderators if reports remain unreviewed for over 48 hours.
3. **30-Minute Paystack Reconciler (`reconcilePaystackTransactions`)**:
   - Catches any abandoned or lagging M-PESA callbacks and publishes confirmed broadcasts.

### External Webhook Backup (Optional Safeguard)
If the Node process restarts or is load-balanced across instances, configure an external cron service (e.g. [cron-job.org](https://cron-job.org/) or UptimeRobot) to trigger the HTTP endpoint hourly:
- **URL**: `https://civiltrace.org/api/webhooks/social-link-check`
- **HTTP Method**: `GET`
- **Header**: `Authorization: Bearer <CRON_SECRET>`

Set in production `.env`:
```env
CRON_SECRET="<generate-random-secret-token>"
```

---

## 11. Kenyan Regulatory & Legal Requirements (ODPC)

Before publicly marketing CivilTrace in Kenya:
1. **ODPC Data Controller Registration**:
   - CivilTrace collects sensitive citizen data (names, phone numbers, vehicle registrations, missing persons photos).
   - You must apply for Data Controller Registration with the **Office of the Data Protection Commissioner (ODPC) Kenya** at [odpc.go.ke](https://www.odpc.go.ke/).
2. **Published Privacy Policy & Terms**:
   - Must explicitly describe the *Enforcement Proxy* model (CivilTrace is a community verification relay, not a law enforcement agency).
   - Must outline the mandatory requirement for a valid National Police Service Occurrence Book (OB) number.
   - Must document the 48-hour social media link unpublishing mechanism.
3. **Data Deletion Contact**:
   - Provide a monitored inbox (`privacy@civiltrace.org` / `compliance@civiltrace.org`) to address immediate takedown requests from families or authorized police officers.

---

## Complete Production `.env` Reference Template

Save this template on your production VPS at `/var/www/civil-trace/.env`:

```env
# ==============================================================================
# CIVILTRACE PRODUCTION ENVIRONMENT CONFIGURATION
# ==============================================================================
NODE_ENV=production
PORT=3000
HOSTNAME=0.0.0.0
NEXT_PUBLIC_SERVER_URL=https://civiltrace.org

# Database (MongoDB Atlas Replica Set)
DATABASE_URI=mongodb+srv://<db_user>:<db_pass>@cluster0.xxxxx.mongodb.net/civil-trace?retryWrites=true&w=majority

# Payload CMS Secret (32+ random characters)
PAYLOAD_SECRET=your-random-64-character-secret-key-here

# Africa's Talking (SMS OTP & Phone Verification)
AT_API_KEY=atsk_live_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
AT_USERNAME=civiltrace_ke
AT_SENDER_ID=CIVILTRACE

# Paystack Payment Gateway (M-PESA & Card Processing)
PAYSTACK_SECRET_KEY=sk_live_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx

# Google Gemini AI (Forensic Parity Engine)
GEMINI_API_KEY=AIzaSyxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx

# Firebase Client SDK (Web SSO: Facebook, Twitter, Google)
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSyxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=civiltrace-ke.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=civiltrace-ke
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=civiltrace-ke.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789012
NEXT_PUBLIC_FIREBASE_APP_ID=1:123456789012:web:abcdef123456

# Firebase Admin SDK (FCM Geo-Radius Push & Token Verification)
FIREBASE_PROJECT_ID=civiltrace-ke
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@civiltrace-ke.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYOUR_PRIVATE_KEY_HERE\n-----END PRIVATE KEY-----\n"

# Cron Security Token (External health-check triggers)
CRON_SECRET=your-random-cron-secret-token-here

# Sentry Error Monitoring & Telemetry
SENTRY_DSN=https://xxxxxxxx@oXXXXX.ingest.sentry.io/XXXXXX
NEXT_PUBLIC_SENTRY_DSN=https://xxxxxxxx@oXXXXX.ingest.sentry.io/XXXXXX
```

---

## 12. Pre-Launch Verification Checklist

Before announcing the site or accepting real citizen reports, execute this 10-point test run:

- [ ] **1. Facebook SSO:** Test sign-in with a non-admin Facebook account in a private/incognito browser.
- [ ] **2. Google SSO:** Test sign-in with a standard Google account.
- [ ] **3. Phone Verification (SMS):** Enter a real Kenyan Safaricom/Airtel number and verify the 6-digit SMS arrives promptly and verifies.
- [ ] **4. Directory Autocomplete:** Go to `/dashboard/create-alert` and search for "Central", "Kilimani", "Kasarani" to confirm all 218+ police stations load instantly.
- [ ] **5. Test Alert Submission:** Submit a dummy test alert with an OB number and social link.
- [ ] **6. Paystack M-PESA Test:** Trigger a paid priority broadcast and complete the prompt on an M-PESA phone. Verify webhook marks transaction as `completed` and publishes the alert.
- [ ] **7. Moderator Triage:** Log into `/dashboard/triage` as a Moderator or Super Admin, review the alert, and verify the AI Parity score displays accurately.
- [ ] **8. Live Map Marker:** Confirm the approved alert appears on `/map` at the correct Kenyan coordinates.
- [ ] **9. Social Link Deletion Test:** Delete or make private the test social post. Trigger `/api/webhooks/social-link-check` and verify the alert is automatically unpublished and moved to draft.
- [ ] **10. SSL & Security Headers:** Run [SSL Labs](https://www.ssllabs.com/ssltest/) on `civiltrace.org` to confirm an **A / A+** security rating.
