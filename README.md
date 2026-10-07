# 🛡️ CivilTrace Kenya — Community Safety & Incident Recovery Mesh

> **An open-source, community-driven enforcement proxy bridging the gap between official police reports and grassroots community action for missing persons and stolen vehicles & motorbikes across Kenya.**

---

## 📋 Table of Contents
- [Executive Summary](#-executive-summary)
- [Core Philosophy & "The Why"](#-core-philosophy--the-why)
  - [1. Strictly an "Enforcement Proxy"](#1-strictly-an-enforcement-proxy)
  - [2. Why No Cash Bounties? The Civic Points Ledger](#2-why-no-cash-bounties-the-civic-points-ledger)
  - [3. The "Friction Wall" Architecture](#3-the-friction-wall-architecture)
  - [4. Dignity, Privacy & ODPC Compliance (Right to be Forgotten)](#4-dignity-privacy--odpc-compliance-right-to-be-forgotten)
  - [5. Grassroots Hybrid: Digital + Physical Search](#5-grassroots-hybrid-digital--physical-search)
- [Platform Scope & Asset Definition](#-platform-scope--asset-definition)
- [System Architecture](#-system-architecture)
  - [Monorepo Topology ("Two Doors, One Building")](#monorepo-topology-two-doors-one-building)
  - [Technology Stack](#technology-stack)
- [Core Workflows & Pipelines](#-core-workflows--pipelines)
  - [The 4-Step Verification & Broadcast Pipeline](#the-4-step-verification--broadcast-pipeline)
  - [Forensic Multimodal AI Parity Check](#forensic-multimodal-ai-parity-check)
  - [Paid Priority Broadcasts via Paystack (M-PESA)](#paid-priority-broadcasts-via-paystack-m-pesa)
  - [Automated Background Workers (server.ts)](#automated-background-workers-serverts)
- [National Emergency Directory](#-national-emergency-directory)
- [Role-Based Access Control (RBAC)](#-role-based-access-control-rbac)
- [Getting Started & Local Development](#-getting-started--local-development)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
  - [Environment Configuration](#environment-configuration)
  - [Running the Application](#running-the-application)
- [Production Deployment & VPS Guide](#-production-deployment--vps-guide)
- [Manual Integrations & Go-Live Checklist](#-manual-integrations--go-live-checklist)
- [Contributing to CivilTrace](#-contributing-to-civiltrace)
- [Legal Compliance & Privacy Statement](#-legal-compliance--privacy-statement)

---

## 📌 Executive Summary

When a loved one goes missing or valuable property is stolen in Kenya, the community's immediate instinct is to mobilize. However, traditional public safety reporting is fundamentally fragmented:
1. **Official Channels:** Filing a Police Occurrence Book (OB) report is legally binding but often lacks real-time digital dissemination to surrounding residents.
2. **Social Media Blasts:** Viral posts on Facebook, X (Twitter), and WhatsApp spread rapidly but are geographically scattered, unverified, prone to misinformation, and can live online indefinitely even after a person is safely recovered.

**CivilTrace** bridges this divide. Grounded in the East African civic tradition of ***Nyumba Kumi*** (neighborhood vigilance), CivilTrace acts as a localized digital search party. It amplifies official police reports by broadcasting verified alerts to citizens, business owners, and drivers located within a 10km–50km geographic radius of the incident.

---

## 💡 Core Philosophy & "The Why"

### 1. Strictly an "Enforcement Proxy"
CivilTrace **never** allows unverified alerts to originate directly on the platform. Every incident submission requires:
- An official **National Police Service Occurrence Book (OB) Number** and Station Name.
- A direct link to an active **Public Social Media Post** (Facebook, X, or Instagram).

**Why?** Legal liability and community trust. By acting as an *enforcement proxy* and *echo chamber*, CivilTrace shifts the legal burden of truth to the official police record and the original publisher. This prevents the platform from being weaponized for stalking, harassment, debt collection disputes, or character defamation.

### 2. Why No Cash Bounties? The Civic Points Ledger
CivilTrace strictly prohibits monetary cash bounties.

**Why?** Cash bounties create perverse, dangerous incentives—leading to extortion, fraudulent sighting submissions, bounty hunting, and even kidnapping-for-profit rings. 

Instead, CivilTrace operates a **Civic Points Ledger**. Citizens earn non-monetary Civic Points for:
- Completing citizen onboarding and phone verification (+50 to +100 pts)
- Submitting physical sightings verified by moderators (+150 pts)
- Printing and hanging emergency posters at local matatu stages, bus parks, and kiosks (+200 pts)
- Verifying offline OCS police and ambulance dispatch phone numbers (+50 pts)

Civic Points unlock platform utility (such as free priority broadcast credits) and elevate user standing to **Verified Warden**.

### 3. The "Friction Wall" Architecture
- **Reading Data (Zero Friction):** Browsing active alerts, viewing the live incident map, and searching the national OCS/Ambulance directory is completely free, anonymous, and cached offline.
- **Writing Data (High Friction):** Submitting an incident alert or reporting a physical sighting requires Social SSO (Facebook, X, or Google) combined with Kenyan mobile phone SMS OTP verification.

**Why?** In an emergency, consuming safety information should have zero barriers, but *injecting* reports must be authenticated to eliminate bot networks and frivolous spam.

### 4. Dignity, Privacy & ODPC Compliance (Right to be Forgotten)
CivilTrace operates strictly under the **Kenya Data Protection Act 2019** governed by the Office of the Data Protection Commissioner (ODPC). 
- **Automated Dynamic Deletion:** When a missing person is safely found, families typically delete or privatize their source Facebook/X post. CivilTrace's hourly background worker scans all active alerts via HTTP `HEAD` requests; if the source post returns 404 or 410, the alert is **automatically unpublished** from public maps and search indices.
- **Human-in-the-Loop:** While AI assists with forensic cross-referencing, no missing person alert is published without explicit verification by a human moderator.

### 5. Grassroots Hybrid: Digital + Physical Search
A digital alert alone cannot reach every corner of Kenya. CivilTrace features an automated **One-Click Printable PDF Poster Generator**. Grassroots ambassadors can download high-contrast A4 posters, print them, post them at local matatu terminals, boda boda stages, and town centers, and upload proof to earn civic recognition.

---

## 🎯 Platform Scope & Asset Definition

CivilTrace covers two emergency categories:
1. **Missing Persons:** Missing children, runaway teens, vulnerable elderly persons (Alzheimer's/dementia), and abducted individuals with active police records.
2. **Lost Property:** **Strictly defined as stolen vehicles & motorbikes** (cars, vans, lorries, motorcycles/motorbikes).
   > *Note:* Not all motorbikes in Kenya are commercial boda bodas. CivilTrace enforces the rigorous classification of all motor vehicles and personal/commercial motorbikes with official engine/chassis numbers and police records.

---

## 🏗️ System Architecture

### Monorepo Topology ("Two Doors, One Building")

CivilTrace runs Next.js 15 (App Router) and Payload CMS v3 within a **single unified Node.js runtime**, sharing database connections, types, and server contexts:

```text
civil-trace/
├── src/
│   ├── app/
│   │   ├── (client)/             # User-facing Next.js App Router
│   │   │   ├── (auth)/           # Social SSO, Phone OTP Verification
│   │   │   ├── (dashboard)/      # Protected citizen portal & moderator triage
│   │   │   │   ├── alerts/       # Citizen emergency alert tracking
│   │   │   │   ├── create-alert/ # 4-step verified incident submission wizard
│   │   │   │   ├── directory/    # Searchable OCS & ambulance directory
│   │   │   │   ├── map/          # Full-screen interactive Leaflet alert map
│   │   │   │   ├── points/       # Civic Points ledger & leaderboard
│   │   │   │   ├── sightings/    # Physical sighting management
│   │   │   │   └── triage/       # Forensic moderator review console
│   │   │   └── page.tsx          # High-converting public landing page
│   │   ├── (payload)/            # Native Payload CMS Admin Portal (/admin)
│   │   └── api/                  # REST endpoints, webhooks & cron triggers
│   ├── collections/              # MongoDB Schemas (Payload Collections)
│   │   ├── Alerts/               # Incidents, OB records, status, geo-coordinates
│   │   ├── AuditLogs/            # Immutable compliance trail (ODPC deletes)
│   │   ├── CivicPointLedger/     # Append-only points credit/debit history
│   │   ├── Media.ts              # File uploads, thumbnails & police sheets
│   │   ├── OCSDirectory/         # National police station & ambulance records
│   │   ├── Sightings/            # Community tips, photo proof & coordinates
│   │   ├── Transactions/         # Paystack M-PESA payment reconciliations
│   │   └── Users/                # Citizens, Wardens, Moderators, Super Admins
│   ├── components/               # Radix UI, Tailwind CSS & custom widgets
│   ├── cron/                     # Background jobs (ODPC check, triage, billing)
│   ├── data/                     # Kenya Police (218+) & Ambulance (40+) directory
│   ├── lib/                      # Firebase Admin, Paystack, Africa's Talking, AI
│   └── payload.config.ts         # Core CMS engine & database adapter configuration
├── server.ts                     # Production entrypoint (Next + Payload + Node-Cron)
└── MANUAL_INTEGRATIONS.md        # Comprehensive production integration guide
```

- **Door 1: Payload Native Admin (`/admin`)** — Strictly restricted to `super-admin` engineers for database management and system audits.
- **Door 2: Custom Client Portal (`/dashboard`)** — Purpose-built responsive interface for citizens, moderators, and wardens.

---

### Technology Stack

| Layer | Technology | Rationale |
| :--- | :--- | :--- |
| **Framework** | Next.js 15 (React 19, App Router) | Server Components, fast edge streaming, built-in SEO |
| **CMS Engine** | Payload CMS v3 | Headless TypeScript-native CMS sharing Next.js runtime |
| **Database** | MongoDB Atlas (Mongoose Adapter) | Geospatial 2dsphere indexing, high-write flexibility |
| **Styling** | Tailwind CSS & Radix UI primitives | Accessible, dark/light theme support, responsive |
| **Mapping** | Leaflet & React-Leaflet | Open-source OpenStreetMap integration with custom markers |
| **Authentication** | Firebase Client SDK + Payload JWT | Social SSO (Facebook, X, Google) bridged to HTTP-only JWTs |
| **SMS Gateway** | Africa's Talking (Kenya) | Kenyan mobile network OTP dispatch (+254...) |
| **Payments** | Paystack Kenya | Native M-PESA, Airtel Money, and Visa/Mastercard processing |
| **Forensic AI** | Google Gemini (2.5 Flash via `@google/genai`) | High-speed multimodal parity checking (OB vs Social Post) |
| **Push Alerts** | Firebase Cloud Messaging (FCM) | Topic-based and geo-radius background emergency alerts |
| **Monitoring** | Sentry.io (`@sentry/nextjs`) | Real-time crash diagnostics and telemetry |
| **Scheduler** | `node-cron` in `server.ts` | In-process VPS cron execution without external dependencies |

---

## 🔄 Core Workflows & Pipelines

### The 4-Step Verification & Broadcast Pipeline

```mermaid
flowchart TD
    A[Citizen Signs In via Social SSO + Phone OTP] --> B[Step 1: Enter Police Station & Official OB Number]
    B --> C[Step 2: Paste Public Facebook/X Post Link]
    C --> D[Step 3: Upload Clear Photo & Description]
    D --> E[Gemini 2.5 Flash Multimodal Parity Evaluation]
    E -->|Confidence Score & Context| F[Saved as Draft in Moderator Triage Queue]
    F --> G[Volunteer Moderator Cross-Checks Station OB]
    G -->|Approved| H[Alert Status set to 'published']
    H --> I[FCM Dispatches Geo-Radius Push Alert 10km-50km]
    H --> J[Alert Appears on Live Incident Map & Public Feed]
    H --> K[Automated Hourly ODPC Cron Monitors Source Social Post]
    K -->|Source Post Deleted 404/410| L[Alert Automatically Unpublished & Archived]
```

### Forensic Multimodal AI Parity Check
When an alert is submitted, CivilTrace passes the uploaded photo, alert context, and source social media link to Google Gemini 2.5 Flash (`src/lib/ai-parity/check.ts`). The AI analyzes visual and textual congruence, assigning a **Parity Confidence Score (0–100%)** and reasoning notes for human moderators reviewing the triage queue.

### Paid Priority Broadcasts via Paystack (M-PESA)
Citizens can boost an alert to a wider regional radius (KES 500 – 2,500). Paystack initiates an STK push to the user's M-PESA line. Upon successful payment:
1. Paystack dispatches a signed webhook to `/api/webhooks/paystack`.
2. The transaction is marked `completed`.
3. The alert is flagged as `isPaidBroadcast: true` and pushed to all registered devices within the expanded radius.
4. If a callback lags, the built-in 30-minute background reconciler automatically queries Paystack's API and applies confirmation.

### Automated Background Workers (`server.ts`)
When running in production on a VPS, `server.ts` boots three scheduled `node-cron` tasks:
- **Hourly (`0 * * * *`):** `verifySocialLinks` — Scans all published alerts, checks source social links via `HEAD` requests, and immediately unpublishes posts that have been deleted or made private (ODPC Right to be Forgotten).
- **Every 6 Hours (`0 */6 * * *`):** `processStaleTriage` — Alerts moderator channels if reports have been idling in the triage queue for more than 48 hours.
- **Every 30 Minutes (`*/30 * * * *`):** `reconcilePaystackTransactions` — Audits pending M-PESA payments against Paystack.

---

## 🏛️ National Emergency Directory

CivilTrace bundles a standardized, curated national emergency directory across all 47 counties:
- **218+ National Police Stations & Divisional Headquarters:** Complete with station names, sub-counties, counties, and verified OCS telephone lines (including Nairobi Central, Kasarani, Kilimani, Lang'ata, Mombasa Central, Nakuru, Eldoret, Kisumu, etc.).
- **40 Regional & National Ambulance Units:** Including Kenya Red Cross (1199), St. John Ambulance (0721 225285), E-Plus, and county health emergency dispatch hubs.
- **Smart Autocomplete:** Integrated directly into the alert creation flow via `PoliceStationSelect.tsx` with instant keyboard and touch search.
- **Offline PWA Readiness:** The directory leverages a cache-first network strategy, allowing citizens to lookup emergency contacts with zero internet connectivity.

---

## 👥 Role-Based Access Control (RBAC)

User permissions are handled via the `roles` field array in the `Users` collection:

| Role | Target User | Capabilities |
| :--- | :--- | :--- |
| **`user`** | Registered Citizens | Submit incidents, submit sighting tips, earn Civic Points, view dashboards. |
| **`warden`** | Top Community Contributors | Priority submission review queue, community notice authoring. |
| **`moderator`** | Vetted Civic Volunteers | Access `/dashboard/triage`, review OB records, approve/reject alerts. |
| **`editor`** | Safety Content Team | Maintain OCS directory contacts, safety training guides. |
| **`super-admin`** | Engineering & Core Ops | Full CRUD access across Payload CMS Admin (`/admin`), DB seeds. |

---

## 💻 Getting Started & Local Development

### Prerequisites
- **Node.js:** v18.20.0+ or v20.x+ (Recommended: Node 20 LTS or Node 24)
- **MongoDB:** A local MongoDB instance (`mongodb://localhost:27017/civil-trace`) or a free [MongoDB Atlas](https://cloud.mongodb.com/) cluster URI.
- **Package Manager:** `npm` or `pnpm`.

### Installation
```bash
# 1. Clone the repository
git clone https://github.com/your-org/civil-trace.git
cd civil-trace

# 2. Install dependencies
npm install
```

### Environment Configuration
Copy the example environment file and update your variables:
```bash
cp .env.example .env
```

At minimum for local development:
```env
NODE_ENV=development
PORT=3000
DATABASE_URI=mongodb://localhost:27017/civil-trace
PAYLOAD_SECRET=your-secure-local-dev-secret-minimum-32-chars-long
NEXT_PUBLIC_SERVER_URL=http://localhost:3000

# Firebase Client (Local dev includes graceful fallback sessions)
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSyFakeKeyForPrerenderSafeBuild12345
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=civiltrace-ke.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=civiltrace-ke

# SMS & Africa's Talking (Defaults to console mock logging if empty)
AT_USERNAME=sandbox
AT_API_KEY=
```

### Running the Application
```bash
# Start the local development server (with hot reload)
npm run dev
```

Open your browser:
- **Public Portal:** [http://localhost:3000](http://localhost:3000)
- **Citizen Dashboard:** [http://localhost:3000/dashboard](http://localhost:3000/dashboard)
- **Live Alert Map:** [http://localhost:3000/map](http://localhost:3000/map)
- **OCS Directory:** [http://localhost:3000/directory](http://localhost:3000/directory)
- **Payload Admin:** [http://localhost:3000/admin](http://localhost:3000/admin) (Create your initial Super Admin on first launch)

---

## 🚀 Production Deployment & VPS Guide

CivilTrace is built to deploy on Ubuntu/Debian Linux VPS instances (e.g., Hetzner, DigitalOcean, Linode) with minimal operational overhead.

### Step-by-Step VPS Setup
1. **Provision Ubuntu 22.04/24.04 LTS VPS** and install Node.js 20+, Nginx, and Git.
2. **Clone & Build:**
   ```bash
   git clone https://github.com/your-org/civil-trace.git /var/www/civil-trace
   cd /var/www/civil-trace
   npm install
   npm run build
   ```
3. **Configure Nginx Reverse Proxy:**
   Set up `/etc/nginx/sites-available/civiltrace` with `proxy_pass http://127.0.0.1:3000;` and `client_max_body_size 30M;`.
4. **Enable HTTPS (Let's Encrypt):**
   ```bash
   sudo certbot --nginx -d civiltrace.org -d www.civiltrace.org
   ```
5. **Start Process Daemon via PM2:**
   ```bash
   npm install -g pm2
   pm2 start server.ts --name "civil-trace" --interpreter ./node_modules/.bin/tsx
   pm2 save
   pm2 startup
   ```

---

## 📖 Manual Integrations & Go-Live Checklist

For a step-by-step setup guide covering third-party service provider accounts, live API keys, Meta developer permissions, and webhook routing, consult the dedicated guide:

👉 **[MANUAL_INTEGRATIONS.md](./MANUAL_INTEGRATIONS.md)**

It covers:
1. Meta for Developers (Facebook SSO Live Mode & Data Deletion URLs)
2. Twitter / X Developer Portal Setup
3. Google Cloud OAuth & Firebase Configuration
4. Africa's Talking Live Kenyan Alphanumeric Sender ID (`CIVILTRACE`)
5. Paystack Live Merchant Verification & Webhook Testing
6. Google Gemini Multimodal AI API Key Setup
7. Firebase Admin Service Account Key Formatting
8. Production MongoDB Atlas Replica Set Security

---

## 🤝 Contributing to CivilTrace

CivilTrace is an open-source civic technology platform. We welcome contributions from developers, designers, legal advocates, and public safety specialists across Kenya and globally.

1. **Fork the Repository**
2. **Create a Feature Branch:** `git checkout -b feature/amazing-feature`
3. **Commit Your Changes:** `git commit -m 'feat: Add offline county emergency filters'`
4. **Push to the Branch:** `git push origin feature/amazing-feature`
5. **Open a Pull Request** with a detailed explanation of your changes.

---

## ⚖️ Legal Compliance & Privacy Statement

CivilTrace operates in strict adherence to the **Kenya Data Protection Act 2019** under the regulatory oversight of the **Office of the Data Protection Commissioner (ODPC)**.
- CivilTrace is a civic technology enforcement proxy, not a law enforcement agency.
- The platform does not claim ownership of user-submitted emergency reports.
- All personal identifiable information (PII) is handled with end-to-end encryption.
- Immediate manual data takedown requests are processed within 4 business hours via `privacy@civiltrace.org`.

---

**Built with pride for the people of Kenya 🇰🇪 | Open Source Civic Safety**
