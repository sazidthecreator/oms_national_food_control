# Setup & Evaluation Guide
## OMS National Control Platform — Proposal Package

**For:** Government evaluators, technical reviewers, and project stakeholders
**Time Required:** 30 minutes (overview) | 2 hours (complete review)

---

## What You Have Received

This repository contains a **complete proposal package** — not a code project. You do not need to install any software to evaluate it. Everything is designed to open directly.

```
PACKAGE CONTENTS
├── README.md                      ← Start here (overview)
├── SETUP_GUIDE.md                 ← This file
├── SOURCE_CODE_HANDOVER_POLICY.md ← Our ownership commitment
│
├── docs/
│   ├── OMS_Strategic_Proposal.docx     ← Strategy & business case
│   └── OMS_Technical_Architecture.docx ← System design
│
├── schema/
│   └── OMS_Database_Schema.sql         ← Complete database design
│
└── prototype/
    └── OMS_FINAL.html                  ← Live interactive demo
```

---

## STEP 1 — See the System in Action (5 minutes)

**This is the most important step. Do this first.**

1. Navigate to the `prototype/` folder
2. Double-click `OMS_FINAL.html`
3. It opens in your web browser — **no installation required**

**What to explore in the demo:**

| Tab | What It Shows | Why It Matters |
|-----|---------------|----------------|
| Dashboard | Live transaction feed, regional data | Real-time national oversight |
| Food Distribution | Transaction form, duplicate blocking, offline status | Core anti-leakage mechanism |
| Beneficiaries | Quota tracking, daily lifting status | Beneficiary rights protection |
| Dealers | Approval workflow, compliance scoring | Dealer accountability |
| Verification | Animated biometric flow, confidence scores | Identity assurance |
| Analytics | Leakage trend chart, anomaly alerts, demand forecast | Policy intelligence |
| Monitoring | System health, active alerts | Operational reliability |
| Audit Log | Transaction codes, action trail | Government accountability |
| Mobile App | Bengali interface mockups (3 screens) | Field dealer experience |

---

## STEP 2 — Read for Your Role

### If you are a Government Official or Decision-Maker

**Recommended reading order (90 minutes total):**

1. **`README.md`** (15 min) — Complete overview, financials, architecture summary
2. **`docs/OMS_Strategic_Proposal.docx`** (45 min) — Open in Microsoft Word or Google Docs
   - Section 1: Executive Summary + Key Metrics
   - Section 2: Problem Analysis (the governance gap)
   - Section 5: Implementation Roadmap (10-week MVP timeline)
   - Section 7: Financial Case (ROI > 300%)
3. **`SOURCE_CODE_HANDOVER_POLICY.md`** (10 min) — Our ownership commitment
4. **Re-explore the demo** (20 min) — Now with context

### If you are a Technical Architect or Developer

**Recommended reading order (3 hours total):**

1. **`docs/OMS_Technical_Architecture.docx`** (60 min)
   - Section 2: High-level architecture layers
   - Section 3: Six microservices specifications
   - Section 4: Android offline-first design + sync engine
   - Section 5: Security architecture (JWT, encryption, audit)
   - Section 9: SRS compliance mapping (every requirement addressed)
2. **`schema/OMS_Database_Schema.sql`** (60 min) — Open in any text editor
   - Read the header comments — every table has full COMMENT documentation
   - Review the `transactions` table — partitioned by month, idempotency key
   - Review `audit_logs` — append-only, no UPDATE/DELETE permissions
   - Review `daily_beneficiary_index` — the same-day duplicate prevention core
3. **`prototype/OMS_FINAL.html`** (30 min) — Explore Verification and Analytics tabs
4. **`docs/OMS_Strategic_Proposal.docx`** Section 9 (30 min) — SRS compliance

### If you are a Project Manager or Stakeholder

**Recommended reading order (60 minutes total):**

1. **`README.md`** (15 min)
2. **`docs/OMS_Strategic_Proposal.docx`** Sections 5 & 7 (30 min) — Roadmap and ROI
3. **`SOURCE_CODE_HANDOVER_POLICY.md`** (10 min)
4. **Demo** (5 min) — Dashboard tab only

---

## STEP 3 — Open the Documents

### Microsoft Word / Google Docs

**OMS_Strategic_Proposal.docx** and **OMS_Technical_Architecture.docx** are standard `.docx` files.

- **Microsoft Word:** Double-click to open
- **Google Docs:** Go to docs.google.com → File → Upload → Select the file
- **LibreOffice:** Double-click to open

### The SQL Schema

**OMS_Database_Schema.sql** is a plain text file.

- Open with any text editor (Notepad, VS Code, Sublime Text)
- Or view directly on GitHub (syntax highlighting included)
- To run against a PostgreSQL database: `psql -U postgres -d oms < OMS_Database_Schema.sql`

---

## STEP 4 — Upload to GitHub (Optional, Recommended)

If your organization uses GitHub, uploading this repository gives your team a professional shared workspace to review the materials.

### Option A — GitHub Web Interface (No Git Required)

1. Go to [github.com](https://github.com) and sign in
2. Click **"New repository"**
3. Name it: `oms-national-control-platform`
4. Set to **Private**
5. Click **"Create repository"**
6. Click **"uploading an existing file"**
7. Drag all files and folders from this package into the upload area
8. Click **"Commit changes"**
9. Share the repository link with your review team

### Option B — Git Command Line

```bash
# Navigate to this folder
cd oms-national-control-platform

# Initialize git
git init
git add .
git commit -m "feat: initial OMS National Control Platform proposal package"

# Create GitHub repo first, then:
git remote add origin https://github.com/YOUR_USERNAME/oms-national-control-platform.git
git branch -M main
git push -u origin main
```

### Option C — GitHub Desktop (Easiest for Non-Developers)

1. Download [GitHub Desktop](https://desktop.github.com/)
2. Click **File → Add Local Repository**
3. Select this folder
4. Click **"Publish repository"**
5. Keep it **Private**, click **Publish**

---

## STEP 5 — Share with Your Team

Once on GitHub, share the repository with:

```
Settings → Collaborators → Add people → Enter email addresses
```

All reviewers can:
- Read all documents directly in GitHub (Markdown renders beautifully)
- Download individual files
- Leave comments on specific lines
- Create issues for questions

---

## Frequently Asked Questions

**Q: Do I need to install any software?**
A: No. The demo (`OMS_FINAL.html`) opens in any web browser. The documents open in Word or Google Docs. The SQL file opens in any text editor.

**Q: Is the demo connected to a real server?**
A: No. The demo is a fully self-contained HTML file with simulated data. It demonstrates the interface and workflows without requiring a backend server. This is intentional — you can evaluate it anywhere, anytime, offline.

**Q: What is the SQL file for?**
A: It is the complete database design — the blueprint for how the system stores all data. A technical reviewer can read it to understand data structure, relationships, and governance controls (like the append-only audit log). It can also be loaded into a PostgreSQL database to validate the schema.

**Q: Can we modify the documents?**
A: Yes. All documents are editable. We encourage you to annotate, comment, and share with your review team.

**Q: How do we proceed if we want to move forward?**
A: Contact us to schedule a Requirements Validation Workshop (Step 1 of the implementation roadmap). We will align on the 10 critical assumptions in the SRS before committing to the MVP development timeline.

---

## Contact

For questions about this proposal package:

| Role | Contact |
|------|---------|
| Proposal Lead | [Your Name / Email] |
| Technical Lead | [Technical Contact] |
| Project Manager | [PM Contact] |

---

*OMS National Control Platform — Setup & Evaluation Guide v1.0 | March 2026 | CONFIDENTIAL*
