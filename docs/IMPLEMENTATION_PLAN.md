# Implementation Plan & Delivery Roadmap (IMPLEMENTATION PLAN)
## Requisition and Issue Slip (RIS) & Inventory Management Portal

**Document Version:** 1.2.0  
**Project Status:** Production-Ready Demo / Tested & Deployed  
**Deployment Target:** Vercel / Netlify / Cloud Edge Run (Static SPA) + Supabase Connector  
**Last Updated:** October 2026  

---

## 1. Project Phasing & Timeline Gantt Chart

The project follows a structured six-phase engineering lifecycle covering requirements extraction, sanitization, core UI implementation, state persistence, responsive hardening, and production deployment readiness.

```mermaid
gantt
    title Requisition & Inventory Portal Engineering Roadmap
    dateFormat  YYYY-MM-DD
    section Phase 1: Inception
    Requirements Extraction & Standard GAM Analysis   :done, p1_1, 2026-09-01, 2026-09-05
    Data Sanitization & NDA scrubbing                 :done, p1_2, 2026-09-06, 2026-09-08
    section Phase 2: Core UX
    Appendix 63 Slip Form & Catalog Browser           :done, p2_1, 2026-09-09, 2026-09-18
    Client-side Vector jsPDF Engine                   :done, p2_2, 2026-09-19, 2026-09-24
    section Phase 3: State & RBAC
    Multi-Role Access Control (4 Personas)            :done, p3_1, 2026-09-25, 2026-09-30
    LocalStorage Mock DB & 1-Click Role Switcher      :done, p3_2, 2026-10-01, 2026-10-05
    section Phase 4: Business Logic
    Admin Review Queue & Atomic Stock Decrement       :done, p4_1, 2026-10-06, 2026-10-10
    Periodic Consumption Analytics & Excel Exports    :done, p4_2, 2026-10-10, 2026-10-12
    section Phase 5: Hardening
    Mobile & Tablet Responsive Ergonomics             :done, p5_1, 2026-10-13, 2026-10-14
    Cross-Device Focus & UI Refinements               :done, p5_2, 2026-10-14, 2026-10-15
    section Phase 6: Release
    Comprehensive Technical & Product MDs Generation   :active, p6_1, 2026-10-15, 2026-10-16
    Vercel / Netlify Zero-Backend Hosting Ready       :done, p6_2, 2026-10-15, 2026-10-17
```

---

## 2. Work Breakdown Structure (WBS)

### Phase 1: Requirements Analysis & Data Sanitization
- **WBS 1.1:** Analyze Government Accounting Manual (GAM) Volume II, Appendix 63 requirements.
- **WBS 1.2:** Audit and scrub all production agency data, replacing personnel identifiers with generic test personas (`Citizen A`, `Citizen B`, `Admin Custodian`, `Super Admin`).
- **WBS 1.3:** Formulate sanitized inventory seed catalog covering Equipment and Office Supplies.

### Phase 2: Core Form Builder & Statutory PDF Generation
- **WBS 2.1:** Construct the Appendix 63 Form Builder with dynamic line-item addition/removal.
- **WBS 2.2:** Build live catalog lookup with stock-level badge checks.
- **WBS 2.3:** Implement `pdf.ts` using `jsPDF` and `jsPDF-AutoTable` to render vector-sharp Appendix 63 slips with 4 official signature blocks.

### Phase 3: Authentication, Role-Based Access Control & Dual Storage
- **WBS 3.1:** Implement `AuthContext` with role-based route guards (`/admin-inbox`, `/inventory`, `/reports`, `/superadmin`).
- **WBS 3.2:** Develop `mockApi.ts` client-side storage engine with automatic bootstrapping and factory reset capability.
- **WBS 3.3:** Integrate 1-click credential switcher on the login page for effortless portfolio demonstration.

### Phase 4: Administrative Workflow & Analytics
- **WBS 4.1:** Build Admin Inbox with case review drawer, item verification toggles (`Yes`/`No`), and custom RIS numbering.
- **WBS 4.2:** Implement atomic warehouse stock decrements upon approval.
- **WBS 4.3:** Build `ReportsPage` aggregating Monthly, Quarterly, and Annual supply consumption with `.xlsx` export capabilities.

### Phase 5: Responsive Design & Viewport Refinements
- **WBS 5.1:** Implement mobile layout with sticky segmented tab navigation (`Appendix 63 Form` vs `Inventory Catalog`).
- **WBS 5.2:** Add responsive device conditional visibility: hide redundant top headers and catalog sign-in buttons on tablet/laptop viewports.
- **WBS 5.3:** Optimize touch targets and horizontal scrolling containers for tabular records.

### Phase 6: Documentation & Production Deployment
- **WBS 6.1:** Author comprehensive technical specifications (PRD, TRD, APP FLOW, DESIGN BRIEF, BACKGROUND SCHEMA, IMPLEMENTATION PLAN).
- **WBS 6.2:** Verify clean build compilation (`npm run build`) and zero-error TypeScript linting.
- **WBS 6.3:** Provide turnkey deployment configuration for Vercel and Netlify (`vercel.json`).

---

## 3. Deployment Architecture & CI/CD Pipeline

```mermaid
graph TD
    subgraph Development ["Local / Developer Environment"]
        DevCode[Source Code: React 19 + TypeScript + Tailwind v4]
        GitCommit[Git Push to GitHub Repository]
    end

    subgraph CI_Pipeline ["Build & Verification (Vite 6 Engine)"]
        TSC[TypeScript Compilation Check: tsc -b]
        ViteBuild[Vite Bundle Optimization & Asset Inlining]
        StaticDist[Static Production Output: /dist]
    end

    subgraph Hosting ["Serverless Edge CDN (Vercel / Netlify)"]
        EdgeCDN[Global Edge Nodes / Cloudflare]
        BrowserClient[Client Browser Execution]
    end

    subgraph OptionalBackend ["Production Backend (Optional)"]
        SupabaseDB[(Supabase PostgreSQL Database)]
    end

    DevCode --> GitCommit
    GitCommit --> TSC
    TSC --> ViteBuild
    ViteBuild --> StaticDist
    StaticDist --> EdgeCDN
    EdgeCDN --> BrowserClient
    BrowserClient -.->|If VITE_SUPABASE_URL set| SupabaseDB
    BrowserClient -->|Default Demo Mode| LocalStorageDB[Browser LocalStorage Engine]
```

---

## 4. Quality Assurance & Testing Matrix

| Test Suite / Scope | Test Strategy / Methodology | Expected Outcome | Verification Status |
| :--- | :--- | :--- | :--- |
| **Type Integrity** | Run `tsc --noEmit` across all modules. | Zero compile errors, strict type safety. | **Passed** |
| **Linting & Code Cleanliness** | ESLint validation of hooks, imports, and syntax. | Zero breaking lint errors. | **Passed** |
| **Stock Deduction Engine** | Requisition 2 units of STK-1001 (14 in stock) -> Admin approves -> Check inventory. | Stock decrements to exactly 12; line item reflects approved quantity. | **Verified** |
| **Out-of-Stock Handling** | Requisition item exceeding available balance -> Verify UI warning. | Warning alert renders; custodian modal prompts stock deficit. | **Verified** |
| **Responsive Viewports** | Emulate iPhone 14 (390px), iPad Air (820px), MacBook Pro (1440px). | Clean layout, sticky tabs active on mobile, header hidden on tablet/laptop. | **Verified** |
| **PDF Fidelity Test** | Generate PDF and check 4 signature quadrants, alignment, and page breaks. | Sharp vector rendering strictly adhering to Appendix 63 layout. | **Verified** |
| **1-Click Reset Test** | Modify data -> Click "Reset Data" on login screen. | State restores instantly to default sanitized fixtures. | **Verified** |

---

## 5. Risk Assessment & Mitigation Plan

```mermaid
quadrantChart
    title Risk Impact vs Probability Matrix
    x-axis Low Probability --> High Probability
    y-axis Low Impact --> High Impact
    quadrant-1 High Priority / Immediate Action
    quadrant-2 Monitor Closely
    quadrant-3 Low Concern
    quadrant-4 Mitigate via Design

    "Cloud DB Hosting Costs on Demo": [0.85, 0.25]
    "Data Overwrite Across Users": [0.65, 0.40]
    "Browser Storage Exhaustion": [0.15, 0.35]
    "Confidential Data Leakage": [0.05, 0.95]
```

| Risk Event | Severity | Likelihood | Mitigation Strategy Implemented |
| :--- | :--- | :--- | :--- |
| **Confidential Data Exposure** | Critical | Very Low | Full audit and sanitization: all government names, real assets, and agency references removed. |
| **Demo Failure Due to Database Downtime** | High | Medium | Implemented client-side LocalStorage fallback engine (`mockApi.ts`) enabling 100% serverless evaluation without hosted database fees. |
| **Data Pollution Across Evaluators** | Medium | Medium | Integrated 1-click **Reset Demo Data** button directly on the login screen to restore factory settings at any time. |
| **Mobile Layout Clipping** | Medium | Low | Applied responsive Tailwind v4 classes with device-specific header visibility and segmented touch controls. |
