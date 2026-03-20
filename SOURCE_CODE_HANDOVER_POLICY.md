# Source Code Handover Policy
## OMS National Control Platform

**Version:** 1.0 | **Date:** March 2026 | **Classification:** CONFIDENTIAL

---

## Our Commitment

The OMS SRS explicitly requires:
- Source code handover upon project completion
- Inline code comments for maintainability
- Developer instruction manual
- API documentation and exposure
- Future extensibility by government teams

This document formalizes our commitment to each of these requirements.

---

## 1. Full Ownership Transfer

Upon project completion and final payment:

- **100% of source code** is transferred to the Ministry of Food, Government of Bangladesh
- Government receives **full ownership** — no licensing fees, no ongoing royalties, no vendor lock-in
- All code is delivered via a **private GitHub/GitLab repository** transferred to the government's own account
- Government can **modify, extend, fork, or redistribute** the system without restriction

---

## 2. What Is Transferred

### 2.1 Backend Source Code
- All Spring Boot microservice source files
- Maven/Gradle build configuration
- Docker and Kubernetes deployment manifests
- CI/CD pipeline configuration (GitHub Actions)
- Environment configuration templates

### 2.2 Frontend Source Code
- React web dashboard — full TypeScript source
- All components, pages, hooks, and utilities
- CSS/Tailwind configuration
- Build and deployment scripts

### 2.3 Mobile App Source Code
- Native Android source (Kotlin/Java)
- SQLite schema and migration scripts
- Sync engine implementation
- Biometric abstraction layer code

### 2.4 Database
- Complete PostgreSQL schema (as per `schema/OMS_Database_Schema.sql`)
- Migration scripts (Flyway/Liquibase)
- Seed data scripts
- Backup and restore procedures

### 2.5 Documentation
- Developer Instruction Manual (English + Bengali)
- System Administrator Manual (English + Bengali)
- API Documentation (OpenAPI 3.0 specification)
- Database Entity Relationship Diagrams
- Deployment runbooks
- Troubleshooting guides

---

## 3. Code Quality Standards

All delivered code will meet these standards:

### 3.1 Comments
- Every **public API method** documented with Javadoc/JSDoc
- Every **complex business rule** explained in inline comments
- Every **SQL query** explained with purpose and expected output
- All comments written in **English** with critical sections also in **Bengali**

### 3.2 Example: Inline Documentation Standard

```java
/**
 * Checks beneficiary eligibility for food distribution.
 *
 * Enforces two rules from SRS Module 3:
 * 1. Same-day duplicate prevention (§2.4.4)
 * 2. Monthly quota enforcement (§2.4.5)
 *
 * @param beneficiaryId  UUID of the beneficiary
 * @param distributionDate  Date of the attempted distribution
 * @param requestedKg  Quantity being requested
 * @return EligibilityResult with status and remaining quota
 *
 * সুবিধাভোগীর যোগ্যতা যাচাই করে:
 * - একই দিনে দ্বিতীয়বার উত্তোলন রোধ করে
 * - মাসিক কোটা নিয়ন্ত্রণ করে
 */
public EligibilityResult checkEligibility(
    UUID beneficiaryId,
    LocalDate distributionDate,
    BigDecimal requestedKg
) { ... }
```

### 3.3 Code Structure
- Consistent naming conventions (documented in Developer Manual)
- No magic numbers — all constants named and explained
- Separation of concerns — business logic never mixed with infrastructure
- Test coverage minimum 80% on all business-critical paths

---

## 4. Training & Knowledge Transfer

### 4.1 On-Site Training Program

| Session | Audience | Duration | Content |
|---------|----------|----------|---------|
| System Overview | Management + IT leads | 2 hours | Architecture, capabilities, roadmap |
| Admin Training | System administrators | 1 day | User management, configuration, monitoring |
| Developer Training | Government IT developers | 2 days | Code structure, API, how to extend |
| Dealer Training | Field trainers | 1 day | Mobile app, Bengali interface, troubleshooting |
| Inspector Training | Field supervisors | 4 hours | Monitoring dashboard, exception handling |

### 4.2 Training Materials Delivered
- All training slides (PowerPoint + PDF)
- Training videos (recorded sessions)
- Quick reference cards (Bengali) for dealers
- Administrator checklists
- Troubleshooting decision trees

---

## 5. Post-Handover Support

### 5.1 Warranty Period
- **3 months** of bug-fix support after national go-live — at no additional cost
- Any defect in delivered features fixed within:
  - Critical (system down): 4 hours response, 24 hours resolution
  - High (major feature broken): 48 hours resolution
  - Medium/Low: Next sprint cycle

### 5.2 Support Beyond Warranty
- Optional annual maintenance contract — terms to be negotiated
- Government IT team is fully capable of independent maintenance after training
- We are available for future feature development on project basis

---

## 6. Intellectual Property

- All code written for this project: **owned by Government of Bangladesh**
- Third-party open-source libraries: retained under their respective licenses (MIT, Apache 2.0, etc.)
- A complete **third-party license inventory** will be delivered with the source code
- No proprietary frameworks or paid licenses will be embedded without prior written approval

---

## 7. Delivery Checklist

Upon project completion, the following will be delivered:

- [ ] Source code repository (transferred to government account)
- [ ] All build scripts and CI/CD pipelines
- [ ] Complete database schema with migration scripts
- [ ] OpenAPI 3.0 specification for all REST endpoints
- [ ] Developer Instruction Manual (English + Bengali)
- [ ] System Administrator Manual (English + Bengali)
- [ ] Dealer User Guide (Bengali)
- [ ] Inspector and Supervisor Manual
- [ ] Training workshop delivery (5 sessions)
- [ ] Training materials and recorded sessions
- [ ] Third-party license inventory
- [ ] Deployment runbooks for each environment
- [ ] 3-month warranty support activation

---

*This policy is a binding commitment and will be incorporated into the formal project contract.*

**Ministry of Food, Government of Bangladesh**
**OMS National Control Platform — v1.0 | March 2026**
