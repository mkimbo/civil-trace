# 🤝 Contributing to CivilTrace

Thank you for your interest in contributing to **CivilTrace**! 

CivilTrace is an open-source, community-driven civic public safety initiative designed to amplify verified missing persons and lost property alerts across Kenya and the Global South. We welcome contributions from developers, UI/UX designers, accessibility advocates, legal researchers, and civic leaders.

---

## 🧭 Code of Conduct

As a civic public safety platform dealing with sensitive personal information, we hold all contributors to high ethical standards:
- **Respect & Empathy:** This platform serves real families facing distress. We maintain a respectful, constructive, and inclusive community environment.
- **Privacy First:** Never use or commit real victim data, real police OB numbers, or unredacted personal phone numbers in tests or pull requests. Use simulated mock fixtures.
- **Zero Exploitation:** CivilTrace is built for public safety and social impact, not commercial monetization or bounty hunting.

---

## 🛠️ Local Development Setup

### 1. Prerequisites
- **Node.js:** v18.18.0+ or v20.x
- **Package Manager:** `npm` or `pnpm`
- **Database:** Local MongoDB instance (or MongoDB Atlas free cluster)

### 2. Fork and Clone
```bash
git clone https://github.com/<your-username>/civil-trace.git
cd civil-trace
```

### 3. Install Dependencies
```bash
npm install
```

### 4. Configure Environment Variables
Copy the example environment configuration:
```bash
cp .env.example .env.local
```
Fill in the minimal required variables:
- `DATABASE_URI`: Point to your local MongoDB (e.g. `mongodb://localhost:27017/civil-trace`)
- `PAYLOAD_SECRET`: Any random 32+ character string for local development session hashing
- `NEXT_PUBLIC_SERVER_URL`: `http://localhost:3000`

### 5. Run the Local Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) to view the public application.
Access the admin control center at [http://localhost:3000/admin](http://localhost:3000/admin).

---

## 🔒 Security & Data Privacy Guidelines

Before submitting any code, verify:
1. **No Hardcoded Secrets:** Never commit real API keys, Firebase service account keys, database passwords, or SMS credentials. All credentials must load through `process.env`.
2. **ODPC Compliance:** Features handling Personally Identifiable Information (PII) must respect the Right to be Forgotten (dynamic unpublishing and media purging).
3. **Friction by Design:** Do not bypass verification gates (Police OB number validation, authenticated reporter sessions) in production flows.

---

## 🚀 Priority Contribution Areas ("Good First Issues")

We are actively seeking contributions in the following domains:

### 1. Regional Language & Localization
- Translating the offline emergency guide, safety checklists, and SMS templates into **Swahili**, **Sheng**, and regional Kenyan dialects.

### 2. PWA & Low-Bandwidth Optimizations
- Benchmarking and optimizing Service Worker caching rules for sub-$50 Android mobile devices on 2G/3G connections.
- Optimizing Leaflet/Mapbox vector tile caching for offline map viewing.

### 3. National Police Station Directory Accuracy
- Verifying and updating direct OCS phone numbers and GPS coordinates for police stations across all 47 Kenyan counties in `src/data/kenya-police-directory.ts`.

### 4. Accessibility & UI Polish
- Ensuring high contrast ratios, screen reader accessibility (ARIA labels), and responsive layouts on small mobile viewports.

---

## 📦 Pull Request Process

1. **Branch Naming:**
   - `feat/feature-name` for new features
   - `fix/bug-description` for bug fixes
   - `docs/documentation-update` for documentation changes
2. **Commit Messages:**
   Use Conventional Commits format:
   - `feat: Add county filter to offline police directory`
   - `fix: Correct OB number validation regex for regional police posts`
   - `docs: Update environment variable setup guide`
3. **Pre-PR Checks:**
   ```bash
   npm run build
   ```
   Ensure TypeScript compiles cleanly with zero errors.
4. **Submit Your PR:**
   - Link any related GitHub issues.
   - Provide a clear summary of what changes were made and why.
   - Include screenshots or recordings for any UI changes.

---

## 💬 Community & Questions

- **Issues:** Use GitHub Issues for bug reports, architectural discussions, and feature proposals.
- **Maintainer:** Jack Mkimbo ([@mkimbo](https://github.com/mkimbo))

Thank you for helping build resilient, dignity-first civic technology for the community! 🇰🇪
