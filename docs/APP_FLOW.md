# Application Flow & User Journeys (APP FLOW)
## Requisition and Issue Slip (RIS) & Inventory Management Portal

**Document Version:** 1.2.0  
**Target Audience:** UX Designers, Product Managers, Frontend Engineers, QA Engineers  
**Classification:** System Navigation & Behavioral Flow Architecture  
**Last Updated:** October 2026  

---

## 1. Master System Flow Diagram

The diagram below maps all four user personas across the application's routes, decision gateways, action states, and document outputs:

```mermaid
flowchart TD
    Start([User Visits Web App]) --> CheckAuth{Is User Authenticated?}

    %% Unauthenticated / Guest Flow
    CheckAuth -- No --> GuestView[Guest Dashboard / Catalog Route: /]
    GuestView --> G_Action{User Action}
    G_Action -->|Search & Filter| G_Browse[Browse Live Inventory Catalog]
    G_Action -->|Compose Slip| G_Draft[Build Draft Requisition Slip]
    G_Action -->|Sign In / Demo Roles| LoginRoute[Login Page Route: /login]
    G_Draft --> G_RequireLogin[Prompt Login to Submit]
    G_RequireLogin --> LoginRoute

    %% Authentication Gate
    LoginRoute --> AuthInput[Enter Credentials or 1-Click Role Switcher]
    AuthInput --> RoleBranch{Identify User Role}

    %% Authenticated Roles
    RoleBranch -->|Role: employee| EmpDashboard[Employee Portal Route: /dashboard]
    RoleBranch -->|Role: admin / admin_administrative| AdminDashboard[Admin Workspace Route: /dashboard]
    RoleBranch -->|Role: superadmin| SuperDashboard[Super Admin Portal Route: /dashboard]

    %% Employee Sub-flow
    EmpDashboard --> E_Action{Employee Action}
    E_Action -->|New Requisition| NewRIS[Create Requisition Form: /new-ris]
    E_Action -->|Track Submissions| TrackCases[View Requisition History & Status]
    E_Action -->|Download Documents| DL_PDF[Generate Official Appendix 63 PDF]
    NewRIS --> SubmitPending[Submit Case -> Status: Pending]

    %% Admin Sub-flow
    AdminDashboard --> A_Action{Admin Action}
    A_Action -->|Review Pending Queue| AdminInbox[Admin Review Inbox: /admin-inbox]
    A_Action -->|Manage Inventory| InvLedger[Inventory Control: /inventory]
    A_Action -->|Generate Reports| RepPage[Periodic Analytics: /reports]
    A_Action -->|View Archive| ApprPage[Approved Slips Archive: /approved-ris]

    AdminInbox --> ReviewModal[Open Case Review Modal]
    ReviewModal --> StockDecision{Stock Available?}
    StockDecision -->|Yes| SetQty[Confirm Qty Issued & Assign RIS No.]
    StockDecision -->|No / Deficit| RejectOrAdjust[Reject Case or Mark Stock No]
    SetQty --> ApproveAction[Click Approve -> Atomic Inventory Decrement]
    RejectOrAdjust --> RejectAction[Click Reject -> Log Required Remarks]

    %% Super Admin Sub-flow
    SuperDashboard --> S_Action{Super Admin Action}
    S_Action -->|Global Overview| S_Metrics[Monitor Departmental Consumption]
    S_Action -->|User Governance| S_Users[Manage Users, Roles & Divisions]
    S_Action -->|Broadcast Notice| S_Notify[Dispatch System-Wide Announcement]
    S_Action -->|Demo Reset| S_Reset[1-Click Factory Reset Database]
```

---

## 2. Route Navigation & Access Guard Tree

The portal enforces a clean hierarchical routing model governed by the `ProtectedRoute` component:

```
/ (Root)
│
├── / (GuestDashboard)                    [Public Access]
│   ├── Catalog Browser Panel
│   └── Appendix 63 Draft Builder
│
├── /login (AuthPage)                     [Public / Redirects to /dashboard if logged in]
│   ├── Interactive Credentials Form
│   ├── 1-Click Persona Fast-Login Buttons
│   └── Factory Data Reset Trigger
│
└── [Protected Routes]                    [Requires Valid User Session]
    │
    ├── /dashboard                        [Universal Route -> Dynamic Page Rendering]
    │   ├── Role === 'employee'           ──> EmployeeRISPage
    │   ├── Role === 'admin'              ──> AdminDashboard
    │   └── Role === 'superadmin'         ──> SuperAdminPage
    │
    ├── /new-ris                          [All Authenticated Roles]
    │   └── GuestDashboard (Authenticated Mode with Pre-populated User Metadata)
    │
    ├── /admin-inbox                      [Guarded: 'admin', 'admin_administrative']
    │   └── AdminInboxPage (Case Review Queue, Stock Inspection Modal)
    │
    ├── /inventory                        [Guarded: 'admin', 'admin_administrative', 'superadmin']
    │   └── InventoryPage (Stock Management, Restock, Batch Import Simulation)
    │
    ├── /reports                          [Guarded: 'admin', 'admin_administrative', 'superadmin']
    │   └── ReportsPage (Monthly, Quarterly, Semestral, Annual Analytics)
    │
    ├── /approved-ris                     [Guarded: 'admin', 'admin_administrative', 'superadmin']
    │   └── ApprovedRISPage (Searchable Archive of Authorized Slips)
    │
    └── /superadmin                       [Guarded: 'superadmin']
        └── SuperAdminPage (User Directory, System Audits & Global Alerts)
```

---

## 3. Detailed User Journeys

### 3.1 User Journey 1: Guest / Unauthenticated Visitor
**Goal:** Explore organizational supply availability and draft a requisition before signing in.

```mermaid
sequenceDiagram
    actor Guest as Unauthenticated Visitor
    participant UI as Public Portal UI
    participant Catalog as Inventory Catalog
    participant Storage as Browser LocalStorage

    Guest->>UI: Lands on root URL (/)
    UI->>Catalog: Loads available items (Equipment, Supplies)
    Guest->>UI: Toggles between Mobile Tabs: "Appendix 63 Form" & "Inventory Catalog"
    Guest->>UI: Searches for "Laptop" or "Copy Paper"
    Guest->>UI: Clicks "+ Add to RIS" on catalog card
    UI->>Storage: Appends line item to active draft slip
    Guest->>UI: Enters Requisition Purpose: "Quarterly Research Operations"
    Guest->>UI: Clicks "Submit Official RIS"
    UI->>UI: Validates auth state (false)
    UI->>Guest: Displays prompt: "Please sign in to submit your official requisition"
    Guest->>UI: Clicks "Proceed to Sign In" -> Routes to /login
```

---

### 3.2 User Journey 2: Employee / Requester (`emp1`, `emp2`)
**Goal:** Submit a requisition slip with multi-line items, monitor approval progress, and download official PDF.

```mermaid
sequenceDiagram
    actor Emp as Employee (Citizen A)
    participant UI as Employee Portal (/dashboard & /new-ris)
    participant API as API Layer
    participant PDF as jsPDF Generator

    Emp->>UI: Logs in via 1-Click Employee button
    UI->>UI: Auto-loads profile: Division, Office, Fund Cluster, Responsibility Center
    Emp->>UI: Navigates to "New Requisition"
    Emp->>UI: Types item description; autocomplete suggests matching inventory
    Emp->>UI: Specifies quantity = 5 (Live check verifies stock: 14 available)
    Emp->>UI: Clicks "Submit Requisition"
    UI->>API: POST /ris-requests (Status: 'pending')
    API-->>UI: Returns 201 Created -> Dispatches green toast notification
    UI->>Emp: Redirects to Personal Tracker Dashboard
    
    Note over Emp,UI: Later, after Custodian Approval...
    Emp->>UI: Views status badge updated to "Approved" with assigned RIS No.
    Emp->>UI: Clicks "Download Appendix 63 PDF"
    UI->>PDF: generateRISPDF(caseData)
    PDF-->>Emp: Initiates browser download of signed vector PDF document
```

---

### 3.3 User Journey 3: Admin Custodian / Supply Officer (`admin`)
**Goal:** Inspect pending requests, verify physical warehouse availability, assign official numbering, approve/reject, and adjust inventory balances.

```mermaid
flowchart TD
    A_Start([Admin Logs In]) --> A_Nav[Navigates to Admin Inbox]
    A_Nav --> A_Queue[Views List of Pending Slips with Badge Counts]
    A_Queue --> A_Select[Clicks 'Review Case' on pending submission]
    
    A_Select --> A_Modal[Modal Displays Appendix 63 Slip Preview]
    A_Modal --> A_Loop{For Each Line Item}
    
    A_Loop --> A_CheckStock[Check Warehouse Balance]
    A_CheckStock --> A_Toggle[Toggle Stock Available: YES / NO]
    A_Toggle --> A_SetIssued[Input Quantity to Issue]
    
    A_SetIssued --> A_Decision{Approve or Reject?}
    
    A_Decision -->|Approve| A_InputRIS[Assign Custom or Auto RIS No.]
    A_InputRIS --> A_ClickApprove[Click 'Approve & Release']
    A_ClickApprove --> A_Atomic[Execute Atomic Stock Decrement & Change Status to Approved]
    A_Atomic --> A_Success[Display Success Toast & Move Case to Archive]
    
    A_Decision -->|Reject| A_InputReason[Enter Mandatory Rejection Justification]
    A_InputReason --> A_ClickReject[Click 'Reject Request']
    A_ClickReject --> A_RejectStatus[Change Status to Rejected & Notify Employee]
```

---

### 3.4 User Journey 4: Super Admin / System Director (`superadmin`)
**Goal:** High-level departmental consumption governance, user account management, and system resets.

```mermaid
sequenceDiagram
    actor Super as Super Admin
    participant UI as Super Admin Portal (/superadmin)
    participant API as API Layer

    Super->>UI: Logs in via 1-Click Super Admin Profile
    UI->>API: Fetches cross-departmental analytics & user list
    Super->>UI: Inspects Top Consumed Items chart and Division expenditure
    Super->>UI: Opens "User Directory" tab
    Super->>UI: Toggles user active status or changes role assignments
    Super->>UI: Enters announcement text in "Global System Broadcast"
    UI->>API: POST /notifications/broadcast
    API-->>UI: Banner immediately renders across all logged-in views
    Super->>UI: (Optional) Clicks "Reset Demo Data" to restore pristine seed state
    UI->>API: Clears LocalStorage & re-injects default seed fixtures
```

---

## 4. Edge Cases, Exception Handling & Validation Rules

| Scenario / Edge Case | System Behavior / Validation Gate | User Recovery Guidance |
| :--- | :--- | :--- |
| **Requested Quantity > Warehouse Stock** | Real-time warning badge displays in line item (`Only X units available`). | Requisitioner is advised to decrease quantity or custodian marks `Stock Available: NO`. |
| **Submission with Zero Line Items** | "Submit Requisition" button is disabled; clicking triggers error toast. | Toast notification: *"Please add at least one line item before submitting."* |
| **Submission with Missing Purpose** | Form validation marks the Purpose textarea in red outline. | Toast notification: *"Please specify the official purpose for this requisition."* |
| **Rejection Without Stated Reason** | "Reject" button inside custodian modal is disabled until remarks are entered. | Placeholder prompt: *"Provide a justification for the requester (e.g. out of stock, budget limit)."* |
| **Unauthenticated User Submitting Draft** | Draft is preserved in memory/localStorage while redirecting to `/login`. | Upon authentication, draft is automatically recovered and populated. |
| **Mobile / Small Screen Viewports** | Top header & sign-in button conditionally hidden on laptop/tablet per responsive design spec, while sticky segmented tab controls allow smooth toggling on phones. | User experiences zero horizontal content clipping; touch-friendly 44px+ hit targets. |

---

## 5. Requisition State Machine Specification

```mermaid
stateDiagram-v2
    direction LR
    [*] --> Draft : User saves locally
    Draft --> Pending : User clicks 'Submit'
    Pending --> Draft : User cancels submission (if unreviewed)
    Pending --> Approved : Custodian approves
    Pending --> Rejected : Custodian rejects
    Approved --> Issued : Custodian releases physical items
    Issued --> Received : Employee acknowledges receipt
    Received --> [*] : Case Completed & Logged
    Rejected --> [*] : Closed Case
```
