# Technical Architecture & Module Design Document

**Project:** CivilTrace (formerly Missing Link Kenya)  
**Version:** 3.0
**Objective:** Establish the foundational boilerplate, architectural boundaries, and core module logic for an open-source Next.js 15 + Payload CMS v3 monorepo.

---

## 1. System Topology & The Monorepo Structure

Because we are using Payload v3, the CMS and the Next.js frontend share the exact same runtime environment. The application utilizes Next.js Route Groups to segregate public marketing, custom protected dashboards, and raw database administration.

### Directory Architecture (The GitHub Boilerplate)

When initialized, the repository will follow this structure:

```text
/civiltrace-monorepo
├── /src/app              # Next.js App Router
│   ├── /(client)         # All custom user-facing routes
│   │   ├── /(auth)       # Firebase SSO Login, OTP Verification UI
│   │   ├── /(dashboard)  # Custom Protected UI (Triage, Warden Hub, User Profile)
│   │   └── /(public)     # Public offline directory, Marketing, Map
│   ├── /(payload)        # Payload CMS Default Admin UI (/admin)
│   └── /api              # Next.js API routes & Webhooks
├── /src/collections      # Payload Database Schemas (MongoDB)
│   ├── Alerts.ts
│   ├── Users.ts
│   └── Sightings.ts
├── /src/components       # React UI Components (Shadcn UI / Tailwind CSS)
├── /src/lib              # Shared Utilities (Firebase Admin, Auth JWT, SMS Adapter)
└── payload.config.ts     # Core Payload configuration & MongoDB Atlas connection
```

---

## 2. Role-Based Access Control (RBAC) & Routing

Security and data privacy are enforced via the **"Two Doors, One Building"** model. Roles are defined in the `Users` collection using a `hasMany: true` select field (e.g., `['user', 'moderator']`), allowing users to hold multiple privileges.

### The CivilTrace Role Matrix

1. **`super-admin`**: Core engineering team. Full CRUD access.
2. **`moderator`**: Triage volunteers who verify OB numbers and approve Missing Person alerts.
3. **`editor`**: Content team managing the offline directory and Shujaa Academy.
4. **`warden`**: High-ranking community members (earned via Civic Points) with priority submission queues.
5. **`user`**: Standard authenticated citizens.

### The "Two Doors" Implementation

- **Door 1: Payload Native Admin (`/admin`)**
  - **Access:** Strictly locked to `super-admin`. Backdoor email/password login in case Firebase is down.
- **Door 2: Custom Client Application (`/dashboard`)**
  - **Access:** All other roles are funneled through the Custom UI via Firebase SSO.
  - **The Dispatcher (`/dashboard/page.tsx`):** A server-side dispatcher evaluates the authenticated user's highest role array and redirects them to their designated workspace.

---

## 3. PWA & Service Worker Strategy

The entire codebase compiles into a single Next.js application operating under one PWA manifest.

| Route Group          | App Folder             | PWA Experience                  | Network Strategy                                                                                             |
| :------------------- | :--------------------- | :------------------------------ | :----------------------------------------------------------------------------------------------------------- |
| **Public Core**      | `(client)/(public)`    | Fast edge loading, installable. | **Cache-First (Stale-While-Revalidate):** Caches emergency OCS directories for zero-data access.             |
| **Custom Dashboard** | `(client)/(dashboard)` | Responsive app view for triage. | **Network-Only (Bypass Cache):** Blocked from offline mutations. Ensures live data and prevents caching PII. |
| **Payload Backend**  | `/(payload)`           | Desktop-First Admin view.       | **Network-Only:** Core engine relies entirely on direct connection to MongoDB.                               |

---

## 4. Core Modules & Subsystems

### Module 1: Authentication & Identity (The Unified Auth Engine)

- **Frontend (Firebase):** Uses `firebase/auth` to handle Facebook and X/Twitter SSO natively.
- **Backend (Payload):** `getAuthenticatedUser()` uses the `firebase-admin` SDK to verify the client JWT and queries the mirrored Payload User via the Local API.
- **SMS Gateway (Adapter Pattern):** Defined in `/lib/sms.ts` using Dependency Injection. MVP utilizes Twilio credits. Can be hot-swapped to Africa's Talking via an environment variable without refactoring core logic.

### Module 2: Alert Management & AI Triage

- **The AI Scraper Service:** A utility function in `/lib/ai-scraper.ts` calls Apify/Gemini to return extracted social media metadata.
- **The Payload Hooks:** A `beforeChange` hook runs the AI scraper to generate a "Parity Confidence Score."
- **Operational Pings (Moderators):** An `afterChange` hook detects when a new `draft` is created and sends an FCM push specifically to the `triage-alerts` topic, instantly notifying moderators.

### Module 3: Geolocation & Push Notifications (Edge Node)

- **Frontend:** Uses HTML5 Geolocation API to stamp coordinates on `Sighting` submissions.
- **Backend (FCM):** When a moderator updates an alert status to `published`, an `afterChange` hook fires a public push notification to Firebase Cloud Messaging (FCM), targeting users in that geographic radius.

### Module 4: Gamification & Civic Points Ledger

- **The Ledger Collection:** A sub-collection in Payload. Actions (e.g., "Verified Sighting") create ledger entries (`+500 points`).
- **Aggregation:** The frontend queries the user's total points by summing ledger entries via the Local API, ensuring a tamper-proof trust economy.

---

## 5. Core Action Workflows (Data Flow Maps)

### Workflow A: Creating a Missing Person Alert

1. **Client (PWA):** User clicks "Create Alert". Trigger Firebase SSO Login if unauthenticated.
2. **Client Input:** User enters Police OB Number, pastes Facebook/X link, and uploads photo.
3. **Client Auth:** User triggers SMS OTP verification flow (routed through Twilio Adapter).
4. **Server Triage:** Next.js API executes AI Scraper against the social link, generating a Parity Score.
5. **Database (Payload):** Saves Alert as `draft`. Payload blasts a hidden FCM ping to the `triage-alerts` topic.
6. **Custom UI:** Moderator receives ping, logs into `/dashboard/triage`, verifies OB Number, and updates status to `published`.
7. **Webhook (FCM):** `published` status triggers targeted public FCM push notifications.

---

## 6. Implementation Roadmap

**Phase 1: The Monorepo Foundation (Core Team / Founder)**

- Initialize Next.js 15 and Payload CMS v3.
- Establish Route Groups `(auth)`, `(dashboard)`, `(public)`.
- Configure Dokploy on Hetzner VPS for continuous deployment.

**Phase 2: Database Schemas & Roles (Core Team / Founder)**

- Create `Users` (with multi-role arrays), `Alerts`, and `Sightings` collections.
- Implement the `/dashboard` Dispatcher logic.

**Phase 3: The Unified Auth Layer (Core Team / Founder)**

- Build the `(auth)` frontend components using Firebase SDK.
- Write the `getAuthenticatedUser()` server utility using `firebase-admin` JWT validation and HTTP-only cookie bridging.
- Build the SMS Adapter (`/lib/sms.ts`) integrating Twilio.
- _The GitHub repo can now be made public and opened for contributors._

**Phase 4: Community Collaboration (Open Source)**

- **Issue #1 (Frontend):** Build Shadcn UI components for the Alert Map and Offline Directory.
- **Issue #2 (Backend):** Write AI Scraper utility and integrate into Payload `beforeChange` hooks.
- **Issue #3 (Edge):** Implement FCM topic subscriptions (`triage-alerts`) and radius push notifications.
- **Issue #4 (PWA):** Configure Service Worker rules for Cache-First vs. Network-Only routing.
