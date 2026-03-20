# OMS National Control Platform
## সম্পূর্ণ সাবমিশন গাইড — Client Delivery & GitHub Upload

---

## ডেলিভারি প্যাকেজে কী কী আছে

| ফাইল | বিবরণ |
|------|-------|
| `index.html` | মেইন ড্যাশবোর্ড (লাইভ ট্রান্সেকশন ফিড, KPI, মডিউল নেভিগেশন) |
| `offices.html` | অফিস হায়ারার্কি ও প্রোগ্রাম ম্যানেজমেন্ট |
| `dealers.html` | ডিলার রেজিস্ট্রেশন, অ্যাপ্রুভাল, কমপ্লায়েন্স |
| `beneficiaries.html` | সুবিধাভোগী নামতালিকা, কোটা ট্র্যাকিং |
| `distribution.html` | ফেস ভেরিফিকেশন, ডুপ্লিকেট ব্লক, লাইভ ফিড |
| `inspection.html` | ফিল্ড ইন্সপেকশন রিপোর্ট, কমপ্লায়েন্স স্কোর |
| `analytics.html` | L1/L2/L3 অ্যানালিটিক্স, লিকেজ ট্রেন্ড, ফোরকাস্ট |
| `notifications.html` | SMS গেটওয়ে, অটো-অ্যালার্ট রুলস |
| `audit.html` | ট্যাম্পার-এভিডেন্ট অডিট লগ, CSV এক্সপোর্ট |
| `oms-shared.js` | শেয়ারড স্টেট, নেভিগেশন, CSS, স্যাম্পল ডেটা |
| `OMS_Client_Presentation.pptx` | ১২-স্লাইড ক্লায়েন্ট প্রেজেন্টেশন |

---

## STEP 1 — GitHub রিপো তৈরি করুন

### ১.১ GitHub অ্যাকাউন্টে লগইন করুন
```
https://github.com
```

### ১.২ নতুন রিপো তৈরি করুন
- উপরে ডানে **"+"** বাটনে ক্লিক → **"New repository"**
- **Repository name:** `oms-national-control-platform`
- **Description:** `OMS National Control Platform — Ministry of Food, Bangladesh`
- **Visibility:** Private (ক্লায়েন্টকে দেওয়ার আগে Private রাখুন)
- **Initialize:** ✅ Add a README file চেক করুন
- **"Create repository"** বাটনে ক্লিক

---

## STEP 2 — ফাইলগুলো আপলোড করুন

### ২.১ সব HTML ফাইল একসাথে আপলোড
রিপোতে গিয়ে:
1. **"Add file"** → **"Upload files"** ক্লিক করুন
2. সব ফাইল একসাথে ড্র্যাগ করুন:
   - `index.html`
   - `offices.html`
   - `dealers.html`
   - `beneficiaries.html`
   - `distribution.html`
   - `inspection.html`
   - `analytics.html`
   - `notifications.html`
   - `audit.html`
   - `oms-shared.js`
3. **Commit message:** `feat: add all 9 OMS platform modules`
4. **"Commit changes"** ক্লিক

### ২.২ প্রেজেন্টেশন আপলোড
- আবার **"Add file"** → **"Upload files"**
- `OMS_Client_Presentation.pptx` আপলোড করুন
- Commit message: `docs: add client presentation (12 slides)`

---

## STEP 3 — README আপডেট করুন

রিপোতে `README.md` ফাইলে ক্লিক করুন → **Edit (pencil icon)** → নিচের টেক্সট পেস্ট করুন:

```markdown
# OMS National Control Platform
**Ministry of Food, Directorate General of Food, Bangladesh**

A national-scale food distribution governance platform with biometric 
verification, offline-first operations, and policy intelligence analytics.

## Live Demo
Open `index.html` in any browser to run the full prototype locally.
All 9 modules are interconnected. No server required.

## Modules
| # | Module | File |
|---|--------|------|
| 1 | National Dashboard | index.html |
| 2 | Offices & Programs | offices.html |
| 3 | Dealer Management | dealers.html |
| 4 | Beneficiaries | beneficiaries.html |
| 5 | Food Distribution | distribution.html |
| 6 | Field Inspection | inspection.html |
| 7 | Analytics & Intelligence | analytics.html |
| 8 | Notifications & SMS | notifications.html |
| 9 | Audit Trail | audit.html |

## Key Features
- Face biometric verification per transaction
- Real-time duplicate prevention engine
- Offline-first Android app (SQLite + auto-sync)
- 3-level analytics: Descriptive → Diagnostic → Predictive
- Tamper-evident append-only audit log
- SMS gateway integration
- Full SRS compliance (OMS_SRS_1.0.0)

## Technology Stack (Production)
- Backend: Node.js / Spring Boot
- Database: PostgreSQL + Redis
- Mobile: Android (Java) + SQLite
- API: REST over HTTPS/TLS + AMQP

## Prototype Stack
- Pure HTML5 + CSS3 + Vanilla JS
- No framework dependencies
- Runs in any modern browser
```

---

## STEP 4 — GitHub Pages চালু করুন (লাইভ লিংক)

এই স্টেপটি করলে ক্লায়েন্ট সরাসরি ব্রাউজারে প্রোটোটাইপ দেখতে পাবেন।

1. রিপোর **Settings** ট্যাবে যান
2. বাম মেনুতে **Pages** ক্লিক করুন
3. **Branch:** `main` → **Folder:** `/ (root)` সিলেক্ট করুন
4. **Save** ক্লিক করুন
5. কয়েক মিনিট পর লাইভ URL পাবেন:
   ```
   https://[আপনার-username].github.io/oms-national-control-platform/
   ```

**এই লিংকটি ক্লায়েন্টকে শেয়ার করুন — ইনস্টলেশন ছাড়াই দেখতে পাবেন।**

---

## STEP 5 — ক্লায়েন্টকে অ্যাক্সেস দিন

### অপশন A: GitHub Pages লিংক (সহজ)
```
https://[username].github.io/oms-national-control-platform/
```
শুধু এই লিংক ইমেইল করুন।

### অপশন B: রিপো কোলাবরেটর (সোর্স কোড দেখাতে)
1. রিপো **Settings** → **Collaborators**
2. **"Add people"** → ক্লায়েন্টের GitHub username/email দিন
3. Role: **Read** (শুধু দেখার জন্য)

### অপশন C: ZIP ডাউনলোড করে পাঠান
1. রিপোর মেইন পেজে **"Code"** বাটন → **"Download ZIP"**
2. ZIP ফাইল ইমেইলে পাঠান
3. ক্লায়েন্ট ZIP আনজিপ করে `index.html` ডাবল-ক্লিক করলেই চলবে

---

## STEP 6 — ক্লায়েন্ট মিটিং প্রস্তুতি

### মিটিংয়ে কী দেখাবেন (ক্রমানুসারে)

**১. প্রেজেন্টেশন (১৫ মিনিট)**
- `OMS_Client_Presentation.pptx` খুলুন
- স্লাইড ১: Cover — প্রথম ইম্প্রেশন
- স্লাইড ২: The Problem — ক্লায়েন্ট এখন কী সমস্যায় আছে
- স্লাইড ৩: Our Solution — তিনটি পিলার
- স্লাইড ১১: SRS Compliance — সব দাবিগুলো চেক করা আছে

**২. লাইভ প্রোটোটাইপ ডেমো (১৫ মিনিট)**

| ক্রম | কী দেখাবেন | URL |
|------|-----------|-----|
| 1 | Dashboard + লাইভ ফিড | `index.html` |
| 2 | ডিলার অ্যাপ্রুভাল ওয়ার্কফ্লো | `dealers.html` |
| 3 | ফেস ভেরিফিকেশন → BEN-10021 টাইপ করুন → "Verify Face & Distribute" | `distribution.html` |
| 4 | ডুপ্লিকেট ব্লক → BEN-10045 টাইপ করুন | `distribution.html` |
| 5 | অ্যানালিটিক্স → লিকেজ চার্ট + L3 ফোরকাস্ট | `analytics.html` |
| 6 | অডিট লগ → লাইভ এন্ট্রি দেখান | `audit.html` |

**৩. প্রশ্ন-উত্তর (১০ মিনিট)**
প্রস্তুত থাকুন এই প্রশ্নগুলোর জন্য:
- "Bangladesh Bank integration কীভাবে হবে?" → Phase C, API-ready
- "Bangla ভাষায় কী থাকবে?" → সব UI বাংলা সাপোর্ট করে, বাংলা টেক্সট প্রোটোটাইপে আছে
- "Offline কতক্ষণ কাজ করবে?" → ইন্টারনেট না থাকলেও SQLite-এ সব ডেটা থাকে
- "IP Camera কখন যুক্ত হবে?" → Phase B (Month 4-6)

---

## SRS vs প্রোটোটাইপ — গ্যাপ অ্যানালিসিস

### ✅ সম্পূর্ণ কভার করা হয়েছে
- Module 1: Dealer Registration (online form, approval, login, renewal)
- Module 2: Dealer Management (allotment, deposit, DO order, payment approval)
- Module 3: Distribution (face verify, duplicate block, quota control, beneficiary enroll)
- Module 4: Observation (inspection reports, compliance scores)
- Module 5: OMS Operation Setup (office hierarchy, programs, zones)
- Module 6: User Account Management (roles, permissions, groups)
- Analytics module (SRS explicitly requested — L1/L2/L3)
- Audit trail (append-only, tamper-evident)
- SMS notifications
- Offline-first operation
- Low bandwidth support

### 🔵 পরবর্তী ফেজে
- Bangladesh Bank payment API (Phase C)
- IP Camera live feed integration (Phase B)
- Public comments page (next update — explicitly stated in SRS)
- Dealer rating from beneficiaries (next update — SRS notes)

### 💡 বিশেষ সুবিধা আপনার প্রপোজালে
SRS-এ biometric inconsistency আছে (title: fingerprint, scope: face)।
আপনার পজিশন: **"biometric abstraction layer"** — face primary, fingerprint-ready।
এটি আপনাকে technically mature দেখাবে।

---

## প্রোটোটাইপে ডেমো ডেটা

```
Dealers:      DLR-0041 (Rahman), DLR-0039 (Karim), DLR-0052 (Ali), DLR-0058 (Khan — flagged), DLR-0061 (Hossain — pending)
Beneficiaries:BEN-10021 (Amina — eligible), BEN-10045 (Mohammad — quota exhausted/blocked), BEN-10087 (Rina), BEN-10102 (Jabbar — exception), BEN-10156 (Salma)
Distribution: BEN-10021 টাইপ করুন → VERIFIED, BEN-10045 টাইপ করুন → BLOCKED
```

---

## টেকনিক্যাল নোট

এই প্রোটোটাইপ **Production-ready নয়** — এটি ক্লায়েন্ট ডেমোর জন্য।
Production-এ যা লাগবে:
- Node.js / Spring Boot backend
- PostgreSQL database
- Android app (Java/Kotlin)
- Face verification API (AWS Rekognition / Azure Face / on-premise)
- Redis cache
- AMQP message queue
- SSL certificate + government hosting

---

*Generated: March 20, 2026 | OMS Development Team | Confidential*
