Project Name: Civil Trace
Version: 1.0
Status: Approved for Development

1. Executive Summary
   Civil Trace is a highly localized, community-driven public safety web application designed to amplify verified missing persons and lost property alerts in Kenya. Operating strictly as an enforcement proxy rather than a primary investigative source, the platform mirrors public social media posts and mandates official Police Occurrence Book (OB) numbers for critical alerts. The system utilizes a hybrid infrastructure combining a Next.js Progressive Web App (PWA) with Firebase edge services, governed by a containerized Payload CMS v3 backend connected to MongoDB Atlas.

2. Product Principles & Scope
   The Proxy Protocol: The platform acts strictly as an amplifier for pre-existing, legally binding Police OB entries and public social media posts. It does not host unverified allegations or operate as a primary publisher of personally identifiable information (PII).

Friction by Design: High-stakes actions (creating alerts, reporting sightings) are gatekept by strict verification workflows, while low-stakes actions (viewing alerts, accessing offline safety directories) are accessible anonymously.

Zero-Cash Gamification: Engagement is driven by a self-sustaining "Civic Points" system, rewarding platform utility and social capital rather than financial bounties, mitigating extortion risks.

Budget Ceiling: Total operational infrastructure must not exceed $50 USD per month.

3. Legal & Data Compliance (ODPC 2026 Framework)
   Civil Trace operates under the strict regulations of the Kenya Data Protection Act and recent 2025/2026 ODPC mandates.

Data Controller vs. Processor: By mandating SSO login and linking to external social media URLs, the platform minimizes its footprint as a data controller.

Dynamic Consent & Deletion: Automated webhooks will monitor the original social media source link. If the family deletes the original post (indicating recovery), the platform programmatically unpublishes the local instance to prevent stale PII retention.

Human-in-the-Loop Triage: AI scrapers are restricted to copilot validation (checking text/image parity). Missing Person alerts require explicit manual admin approval. Automated approval is restricted solely to low-risk lost financial property.

4. System Architecture & Infrastructure
   4.1. Frontend: Next.js Progressive Web App (PWA)
   Framework: Next.js 15 (React, TypeScript).

Edge Services: Firebase Client SDK.

Firebase Auth: Handles SSO (Facebook, X/Twitter).

Firestore/Storage: Real-time state sync and localized media asset delivery.

Firebase Cloud Messaging (FCM): Native push notifications segmented by geographic radius.

State Separation:

Offline Partition: Service workers cache structural UI, emergency OCS direct lines, and procedural safety toolkits for zero-data access.

Online Partition: The active alert tracking map and reporting forms remain strictly online to prevent the localized caching of sensitive, outdated alerts.

4.2. Backend: Payload CMS v3 (Monorepo)
Framework: Payload CMS v3 initialized natively within the Next.js directory structure (/app/(payload)).

Database Adapter: @payloadcms/db-mongodb connecting to a remote MongoDB Atlas cluster (M0 Free Tier).

Integration: Firebase Admin SDK injected into Payload server routes to bridge verified Payload records with Firebase Cloud Messaging targets.

Deployment Environment: Docker Compose container (Next.js Node runtime) hosted on a single VPS (Hetzner CPX22 or DigitalOcean Droplet).

5. Core Workflows & Functional Requirements
   5.1. Authentication & The Friction Wall
   Lazy Authentication: Unregistered users possess full read-access to the active alert map and offline directory.

Action Gate: Initiating a Create Alert or Report Sighting mutation forces the user through the Friction Wall.

Verification Steps:

Social SSO Login: Establishes base identity and blocks basic bot nets.

Social Media Link Validation: User provides a public URL (Facebook/X) of the original alert. The system extracts metadata via a lightweight API scraper to compare parity.

Mandatory OB Number: Required for all missing person endpoints.

SMS OTP Verification: Triggered explicitly at the execution step via local gateway (e.g., Africa's Talking or Celcom) to confirm mobile identity.

5.2. Alert Triage Pipeline
Missing Persons: Follows the [Submit] -> [AI Parity Check] -> [Admin Review Queue] -> [FCM Geo-Push] pipeline. An admin must manually verify the OB number validity before the payload resolves to published.

Lost Property: Follows the [Submit] -> [AI Parity Check] -> [Auto-Publish] -> [FCM Geo-Push] pipeline, provided the AI confidence score exceeds 90%. Requires M-PESA payment or Civic Points redemption to broadcast.

5.3. Geolocation & Sighting Reports
Location Access: Required during the creation of an alert or a sighting report via the HTML5 Geolocation API.

Relationship Affirmation: The submitter must digitally affirm they are the holder of the official Police OB corresponding to the alert.

6. Gamification: Civic Points System
   6.1. Earning Mechanics
   Sighting Verification (High Yield): Filing a physical sighting that leads to an admin/police-verified recovery.

Grassroots Ambassador (High Yield): Downloading the auto-generated PDF poster, printing it, hanging it at local community hubs (matatu stages, kiosks), and uploading photographic proof.

Mwananchi Scout (Medium Yield): Verifying or updating the offline emergency OCS directory by confirming active phone lines.

Amplification (Medium Yield): Sharing an active alert to WhatsApp Status or social feeds via tracked referral links.

Jirani Mkaazi / Resident Standby (Low Yield): Opting into "Active Standby" when an alert is triggered within a 5km radius and checking the app consistently over 48 hours.

6.2. Redemption Mechanics
Utility Barter: 500 Civic Points bypasses the M-PESA paywall for a premium "Lost Item" broadcast or a radius extension.

Tier Unlocks (Verified Warden): Accumulating threshold points upgrades user status. Wardens gain the authority to post non-emergency community notices (floods, infrastructural failures) and their sighting reports bypass standard triage to high-priority admin queues.

Neighborhood Leaderboards: Points are aggregated by ward (e.g., Roysambu, Kilimani). High-scoring zones unlock localized utility features, such as custom community message boards and explicit "Safe Zone" map designations.

7. Budget & Cost Allocation ($50.00 USD/Month Cap)
   Infrastructure Component Technology Choice Monthly Allocation
   VPS Hosting Hetzner Cloud (CPX22) / DigitalOcean $15.00
   Database MongoDB Atlas (M0 Free Tier) $0.00
   Auth, Storage & Edge Push Firebase SDK & FCM (Free Tier limits) $0.00
   SMS OTP Gateway Africa's Talking / Celcom (~0.40 KES/SMS) $25.00
   AI Validation Copilot Gemini API (Scraping/Parity extraction) $10.00
   Total Monthly Burn $50.00 Max

# CivilTrace: Product Vision & Core Philosophy

**Version:** 2.0 (Vision & Strategy)
**Status:** Approved for Development

## 1. Executive Summary: The Mission

When a person goes missing or critical property is lost in Kenya, the community’s first instinct is to help. However, the current system is fragmented: official police channels are often slow, and social media blasts are chaotic, unverified, and geographically scattered.

**CivilTrace** is a community-driven public safety platform that bridges this gap. Rooted in the East African philosophy of _Nyumba Kumi_ (community watch), CivilTrace acts as a highly localized, digital megaphone for verified emergencies. We do not replace the authorities; we amplify their work by instantly alerting citizens within a specific geographic radius of an incident, creating a localized, digital search party.

## 2. Core Product Philosophy (The "Why")

### Why is CivilTrace strictly an "Enforcement Proxy"?

We **never** allow a user to originate an alert directly on our platform without an existing public record. Every critical alert (like a missing person) requires two things: an official Police Occurrence Book (OB) number and a link to a public social media post.

- **The Reason:** Legal liability and platform integrity. If we allowed direct posting, CivilTrace could be weaponized for defamation, false accusations, or stalking. By acting as a "proxy" or an "echo," we shift the burden of truth to the police and the original poster. We simply amplify what is already public and legally documented.

### Why are we making it Open Source?

CivilTrace deals with the most sensitive data imaginable: public safety and missing persons.

- **The Reason:** Trust and transparency. By open-sourcing the code, we prove to the public and to regulators that there are no hidden data-harvesting algorithms. Furthermore, open-source allows other developers to adopt, improve, and deploy this safety infrastructure in other countries or regions, scaling the impact far beyond our initial reach.

### Why use "Civic Points" instead of Cash Bounties?

It is tempting to offer cash rewards for finding lost items or missing people, but CivilTrace strictly prohibits financial bounties.

- **The Reason:** Cash bounties create perverse incentives. In many regions, financial rewards lead to an increase in extortion, fake sightings, or even kidnapping-for-profit schemes. Instead, we use a "Civic Points" ledger. Users earn points for verifying sightings or putting up physical posters. These points unlock platform utility (like free lost-property broadcasts) and elevate their community status to "Verified Warden," fostering a genuine trust economy.

### Why the "Friction Wall"?

Viewing the active alert map or finding the emergency phone number for a local OCS (Officer Commanding Station) is completely free and anonymous. However, creating an alert or reporting a sighting is deliberately difficult, requiring Social Login and SMS verification.

- **The Reason:** In emergencies, reading information should be frictionless, but _injecting_ information must be secure. This "friction wall" prevents panic-inducing spam, stops bot networks, and ensures accountability if someone submits a false sighting.

## 3. Privacy, Dignity, & Legal Compliance (ODPC)

CivilTrace operates under the strict regulations of the Kenya Data Protection Act. We believe that the digital footprint of a missing person should not outlive their safe return.

- **Dynamic Deletion (The Right to be Forgotten):** When a family finds a missing loved one, they typically delete their original Facebook or X post. CivilTrace's system detects when that original link is taken down and automatically unpublishes our localized alert. This ensures we do not permanently host sensitive images or data once the crisis is resolved.
- **Human-in-the-Loop:** While we use AI to verify that the uploaded photo matches the linked social media post, AI does _not_ have the power to publish a missing person alert. A human moderator must always review the OB number, ensuring empathy and accountability in critical situations.

## 4. The Grassroots Gamification Strategy

We rely on the power of the community to track and trace. Our point system reflects real-world civic duty:

- **The Grassroots Ambassador:** Users can download an auto-generated PDF of a missing person alert, print it, hang it at local matatu stages or kiosks, and upload a photo for points. This bridges the digital divide, bringing the search to the physical streets.
- **Neighborhood Leaderboards:** Points are grouped by wards (e.g., Roysambu, Kilimani). Highly active neighborhoods unlock "Safe Zone" designations and localized community message boards, encouraging collective vigilance.

## 5. Future Horizons (What's Next?)

While Version 1.0 focuses on a lean, web-based PWA, the architecture is designed to support massive future scalability:

- **WhatsApp AI Agent Integration:** In the future, citizens won't even need to download an app. They will be able to message a CivilTrace WhatsApp bot to report a sighting or query active alerts in their immediate area.
- **Direct Police API Integrations:** As regional civic infrastructure modernizes, CivilTrace aims to plug directly into official police databases to instantly verify OB numbers without human moderator intervention.
- **Regional Expansion:** Once the model is proven and the open-source community adopts the repository, the platform can be easily cloned and localized for neighboring East African nations facing similar public safety challenges.
