# Bhumi Vikas Sahayak (भूमि विकास सहायक)
### Municipal Regulatory & Building Compliance System for Bhopal Impact Lab

**Bhumi Vikas Sahayak** is a full-stack municipal building regulation and compliance intelligence web application built for the **Bhopal Impact Lab**. It provides zero-hallucination, strictly grounded assistance under the official **Madhya Pradesh Bhumi Vikas Rules, 2012** (updated up to **06th March 2025**).

---

## 🏛️ The Seven Integrated Modules

1. **AI Chatbot (Bilingual: Hindi & English)**
   - Answers building-rule queries strictly using official regulatory PDF documents.
   - Outputs verified Rule numbers, Table numbers, and source page citations.
   - Shows an explicit **Insufficient Evidence Notice** when a question cannot be proven by the rules.
   - Powered by Cerebras Cloud SDK (`@cerebras/cerebras_cloud_sdk`) on the backend with deterministic local fallback when no API key is set.

2. **Smart Building Limit Calculator**
   - Verified deterministic calculations for FAR, built-up area, ground coverage footprint, setbacks (Front, Side, Rear MOS), height, and parking (ECS).
   - Calibrated against **Table 4 (Rule 42)**, **Table 5 (Rule 42)**, and **Table 8 (Rule 61)**.

3. **Building Plan Checker**
   - Scrutinizes proposed building parameters (FAR, height, coverage, setbacks, ECS).
   - Features quick sample loaders for compliant and non-compliant plans.
   - Displays a mandatory municipal statutory notice stating that automated pre-checks do not replace formal sanction from the Bhopal Municipal Corporation (BMC) / T&CP.

4. **Rule Amendment Tracker**
   - Tracks official Madhya Pradesh Gazette notifications up to **6th March 2025** (including **Notification No. 74 / UDH-3/0002/18-5/2024**).
   - Identifies specific changes in Table 4 Column 6, high-rise norms, instant deemed sanctions under Rule 14/23, and fire safety under Rule 87.

5. **Voice-Based Hindi Assistant**
   - Supports voice input in Hindi using the browser's Web Speech API.
   - Generates grounded Hindi responses with rule citations and reads them aloud using speech synthesis (TTS).

6. **Rule Comparison Dashboard**
   - Side-by-side comparative analysis of original baseline provisions (2012) versus current gazetted provisions (2025) for limits, fees, and safety mandates.

7. **AI Answer Verification & Audit Engine**
   - Cross-references user or model assertions against indexed rules.
   - Categorizes statements as:
     - `VERIFIED_FACTUAL` (Corroborated by Rule and Page)
     - `CONFLICT_DETECTED` (Contradictions or numerical discrepancies)
     - `INSUFFICIENT_EVIDENCE` (Flagged for human review)

---

## 📁 Repository Structure

```
Bhumi-Vikas-Sahayak/
├── data/
│   ├── rules/
│   │   ├── bhumi rules.pdf          # Official English text (Updated to 6 March 2025)
│   │   └── bhumi rules 2.pdf        # Official Hindi text (Updated to 6 March 2025)
│   └── indexed/
│       ├── rules_english.json       # 209 indexed rule sections, tables & page citations
│       └── amendments.json          # Verified gazetted amendments
├── server/                          # Node.js + TypeScript + Express backend
│   ├── src/
│   │   ├── index.ts                 # Express REST API endpoints
│   │   ├── cerebrasClient.ts        # Official Cerebras Cloud SDK integration
│   │   ├── retriever.ts             # Rule retrieval engine & keyword matching
│   │   ├── calculatorRules.ts       # Mathematical verification for Tables 4, 5, 8
│   │   ├── planChecker.ts           # Building plan compliance validator
│   │   ├── verification.ts          # Evidence audit & conflict detector
│   │   └── extractAndIndex.ts       # PDF stream extraction script
│   ├── .env.example
│   └── package.json
├── client/                          # React + TypeScript + Vite + Tailwind CSS frontend
│   ├── src/
│   │   ├── components/
│   │   │   ├── Header.tsx           # Bilingual header & system status
│   │   │   ├── Sidebar.tsx          # 7-module tabbed navigation
│   │   │   └── EvidenceBadge.tsx    # Statutory rule citation badges
│   │   ├── modules/
│   │   │   ├── 1_Chatbot.tsx
│   │   │   ├── 2_Calculator.tsx
│   │   │   ├── 3_PlanChecker.tsx
│   │   │   ├── 4_AmendmentTracker.tsx
│   │   │   ├── 5_VoiceAssistant.tsx
│   │   │   ├── 6_RuleComparison.tsx
│   │   │   └── 7_VerificationAudit.tsx
│   │   └── App.tsx
│   └── package.json
└── README.md
```

---

## 🚀 Quick Setup & Running Locally

### 1. Prerequisites
- **Node.js**: v18 or higher (v24 tested)
- **npm**: v9 or higher

### 2. Configure Backend & API Keys
1. Navigate to the `server/` directory:
   ```bash
   cd server
   ```
2. Copy `.env.example` to `.env` (if not already created):
   ```bash
   cp .env.example .env
   ```
3. Open `.env` and set your desired AI provider key and JWT secret:
   ```env
   # Authentication Session Key
   JWT_SECRET=your_custom_jwt_secret_key_here

   # Option A: Anthropic Claude (Platform Credits)
   ANTHROPIC_API_KEY=your_actual_anthropic_api_key_here
   ANTHROPIC_MODEL=claude-sonnet-5

   # Option B: Cerebras Cloud API
   CEREBRAS_API_KEY=your_actual_cerebras_api_key_here

   PORT=5000
   ```
   *Provider Priority*:
   1. If `ANTHROPIC_API_KEY` is set: Claude API generates the answers using grounded rule excerpts.
   2. Else if `CEREBRAS_API_KEY` is set: Cerebras generates the answers.
   3. If neither key is set: The server operates in local factual extraction mode using indexed rules from `rules_english.json`.

4. Run the backend server:
   ```bash
   npm run dev
   # Or: npx tsx src/index.ts
   ```
   The backend starts at `http://localhost:5000`.

### 3. Run Frontend Client
1. In a separate terminal, navigate to `client/`:
   ```bash
   cd client
   ```
2. Start the Vite development server:
   ```bash
   npm run dev
   ```
3. Open your browser at `http://localhost:3000`.

---

## 🔒 Security & Factual Integrity Rules

- **Authentication Gate**: All application modules and backend endpoints (`/api/chat`, `/api/calculator`, `/api/plan-check`, `/api/amendments`, `/api/comparisons`, `/api/verify`) require JWT authentication. Unauthenticated requests are rejected with HTTP 401.
- **Salted Password Hashing**: Passwords are never stored in plain text; they are hashed using `bcryptjs` with per-user salt rounds.
- **Zero API Keys in Frontend**: AI provider credentials (`ANTHROPIC_API_KEY`, `CEREBRAS_API_KEY`) and `JWT_SECRET` reside strictly on the server in `.env`.
- **Evidence Insufficiency Guarantee**: If a query is not supported by indexed rules in `bhumi rules.pdf`, the system states that evidence is insufficient rather than inventing numbers.
- **Statutory Pre-Check Disclaimer**: All building plan evaluations clearly state that automated pre-checks are advisory and do not represent formal legal municipal sanction.
