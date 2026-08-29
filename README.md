# Requisition and Issue Slip (RIS) & Inventory Management Portal (Demo Replica)

[![React](https://img.shields.io/badge/React-19.0-61DAFB?style=flat&logo=react&logoColor=black)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8-3178C6?style=flat&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4.0-06B6D4?style=flat&logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![Vite](https://img.shields.io/badge/Vite-6.2-646CFF?style=flat&logo=vite&logoColor=white)](https://vitejs.dev/)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

> **🔒 Privacy & Data Disclaimer**
> This repository contains a sanitized, open-source demo version of an application originally developed for a government agency. To comply with privacy requirements and non-disclosure standards, all sensitive production data, credentials, and proprietary branding have been completely removed and replaced with mock data.

---

## 📌 Live Demo & Overview

- **Live Demo Link:** *[Insert your Vercel/Netlify URL here]*
- **Portfolio Video Walkthrough:** *[Insert optional video/Loom link here]*

This system streamlines standard organizational requisition flows, replacing manual paper routing with role-based digital tracking, dynamic stock availability validation, automatic inventory deductions upon approval, automated PDF generation, and historical analytics reporting.

---

## ✨ Key Features

### 1. 📝 Standard Requisition (Appendix 63 RIS)
- Interactive requisition slip builder adhering to standard inventory management layouts.
- Auto-completing inventory catalog lookup with real-time stock availability verification.
- Purpose documentation, responsibility center tagging, and multi-line item batch entries.
- Guest draft creation with seamless account claiming and submission.

### 2. 🔐 Multi-Role Access Control (RBAC)
- **Employee (`emp1`, `emp2`):** Submit new requisitions, save drafts, track live status (*Draft → Sent → Approved → Received*), and download signed official PDF slips.
- **Admin / Custodian (`admin`):** Central inbox queue for reviewing submitted cases, assigning custom RIS numbers, validating available stock quantities, approving/rejecting requests, and managing inventory items.
- **Super Admin (`superadmin`):** Full system governance, cross-department analytics, archived approved RIS records, and user account management.

### 3. 📦 Real-Time Inventory Management
- Categorized stock tracking (*Equipment, Supplies*).
- Live stock deduction engine upon case approval.
- Search indexing, stock threshold indicators, and item catalog management.
- Batch import preview simulation.

### 4. 📊 Analytics & Reporting Engine
- Automated generation of Monthly, Quarterly, Semestral, and Annual inventory reports.
- Consumption ranking: identifies Most Requested vs. Least Requested stock items.
- Automated generation of exportable tabular reports and print-ready PDFs.

### 5. ⚡ 100% Serverless & Zero-Config Demo Engine
- Pre-populated with 5 generic users, seeded inventory items, active cases, and analytics reports.
- Includes a **1-Click Profile Switcher** and a **Reset Data** button on the login screen for instant portfolio testing.

---

## 👥 Demo Credentials (1-Click Switch Available)

You can log in directly using the pre-configured credentials or the 1-click buttons on the login page:

| Role | Employee ID / Username | Password | Access Highlights |
| :--- | :--- | :--- | :--- |
| **Employee (Lead)** | `emp1` | `emp1` | Citizen A — Requisitions, status tracking, PDF downloads |
| **Employee (Analyst)** | `emp2` | `emp2` | Citizen B — Strategy division cases & drafts |
| **Admin Custodian** | `admin` | `admin` | Admin Custodian — Inbox reviews, inventory control, approvals |
| **Super Admin** | `superadmin` | `superadmin` | System Director — Global audit logs, reports & user control |

---

## 🛠️ Technology Stack

- **Framework:** [React 19](https://react.dev/)
- **Language:** [TypeScript](https://www.typescriptlang.org/)
- **Build Tool:** [Vite 6](https://vitejs.dev/)
- **Styling:** [Tailwind CSS v4](https://tailwindcss.com/)
- **Icons:** [Lucide React](https://lucide.dev/)
- **Animations:** [Motion](https://motion.dev/)
- **PDF & Export Engine:** [jsPDF](https://github.com/parallax/jsPDF), [jsPDF-AutoTable](https://github.com/simonbengtsson/jsPDF-AutoTable), [XLSX](https://sheetjs.com/)
- **Notifications:** [React Hot Toast](https://react-hot-toast.com/)
- **Routing:** [React Router v7](https://reactrouter.com/)

---

## 🚀 Getting Started Locally

### Prerequisites
- [Node.js](https://nodejs.org/) (v18.0 or higher recommended)
- `npm` or `pnpm` or `yarn`

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/your-username/requisition-slip-portal-demo.git
   cd ris-inventory-management-demo
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Start the local development server:**
   ```bash
   npm run dev
   ```

4. **Open in browser:**
   Navigate to `http://localhost:3000` (or the URL shown in your terminal).

---

## 🌐 Deploying to Vercel / Netlify

This project is fully client-side ready and requires no backend database setup to deploy:

### Option A: Vercel
1. Push your repository to GitHub.
2. Import the project into [Vercel](https://vercel.com).
3. Set the following build settings:
   - **Framework Preset:** `Vite`
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`
4. Click **Deploy**. *(The included `vercel.json` automatically handles SPA routing).*

### Option B: Netlify
1. Connect your repository in [Netlify](https://netlify.com).
2. Set the build settings:
   - **Build command:** `npm run build`
   - **Publish directory:** `dist`
3. Click **Deploy Site**.

---

## 📂 Project Architecture

```text
├── src/
│   ├── components/       # Reusable UI widgets, Modals, and Sidebar
│   ├── context/          # Authentication & user state management
│   ├── pages/
│   │   ├── GuestDashboard.tsx     # Public / New RIS builder (Appendix 63)
│   │   ├── AuthPage.tsx           # Sign-in & 1-click demo switcher
│   │   ├── EmployeeRISPage.tsx    # Employee case dashboard
│   │   ├── AdminInboxPage.tsx     # Admin review, approval, & stock issue queue
│   │   ├── AdminDashboard.tsx     # Admin summary overview
│   │   ├── InventoryPage.tsx      # Stock item catalog & search
│   │   ├── ReportsPage.tsx        # Statistical analytics & reports generator
│   │   ├── SuperAdminPage.tsx     # Super Admin controls & system user audit
│   │   └── ApprovedRISPage.tsx    # Archived approved requisition slips
│   ├── utils/
│   │   ├── api.ts                 # Main API interface
│   │   ├── mockApi.ts             # Local mock engine & sanitized seed dataset
│   │   └── pdf.ts                 # Form-formatted PDF export utility
│   ├── App.tsx                    # Route definitions & guards
│   └── main.tsx                   # App entry point
├── vercel.json                    # Single-page app rewrite configuration
└── package.json                   # Dependencies and scripts
```

---

## 📄 License

This project is created for demonstration and portfolio purposes under the [MIT License](LICENSE).
