import fs from 'fs';
import path from 'path';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

// Diagram Mermaid source codes
const DIAGRAM_1_CODE = `stateDiagram-v2
    [*] --> Draft : Initiated by Employee / Guest
    Draft --> Pending : Submitted for Custodian Review
    Pending --> UnderReview : Admin Custodian Opens & Inspects
    
    state UnderReview {
        [*] --> CheckStock
        CheckStock --> StockAvailable : Quantity >= Request
        CheckStock --> StockDeficit : Insufficient Inventory
    }
    
    UnderReview --> Approved : Admin Approves & Assigns Official RIS No.
    UnderReview --> Rejected : Admin Rejects (with Remarks)
    
    Approved --> StockDeducted : Atomic Stock Decrement Triggered
    StockDeducted --> Issued : Supply Officer Releases Items
    Issued --> Received : Employee Confirms Receipt
    Received --> [*] : Archived & Logged in Reports
    Rejected --> [*] : Closed / Resubmit as New`;

const DIAGRAM_2_CODE = `graph TD
    User([Portal Users]) --> Guest[Public / Guest Visitor]
    User --> Employee[Employee / Requisitioner]
    User --> Admin[Admin Custodian / Supply Officer]
    User --> SuperAdmin[Super Admin / Agency Director]

    Guest -->|Browse catalog & create draft| G1[Live Stock Visibility & Account Onboarding]
    Employee -->|Submit requests & track status| E1[Self-Service RIS Portal & PDF Download]
    Admin -->|Review queue & deduct inventory| A1[Admin Inbox, Inventory Control & Stock Verification]
    SuperAdmin -->|Audit logs & high-level oversight| S1[System Analytics, User Directory & System Governance]`;

const DIAGRAM_3_CODE = `graph LR
    NFR[Non-Functional Requirements] --> Sec[Security & Privacy]
    NFR --> Perf[Performance & Latency]
    NFR --> Resp[Responsive UX]
    NFR --> Comp[Compliance & Fidelity]

    Sec --> S1[Sanitized Open-Source Data]
    Sec --> S2[Role-Based Route Guards]
    Perf --> P1[Instant Client Response < 50ms]
    Perf --> P2[Client-Side PDF Generation]
    Resp --> R1[Mobile / Tablet / Desktop Views]
    Resp --> R2[Conditional Layout Adaptations]
    Comp --> C1[Appendix 63 Government Standard]`;

async function fetchDiagramBuffer(code: string): Promise<Buffer> {
  const b64 = Buffer.from(code).toString('base64');
  const url = `https://mermaid.ink/img/${b64}`;
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`Failed to fetch diagram: ${res.statusText}`);
  }
  const arrayBuffer = await res.arrayBuffer();
  return Buffer.from(arrayBuffer);
}

export async function generatePrdPdf() {
  console.log('Fetching diagram images from mermaid renderer...');
  const [d1Buf, d2Buf, d3Buf] = await Promise.all([
    fetchDiagramBuffer(DIAGRAM_1_CODE),
    fetchDiagramBuffer(DIAGRAM_2_CODE),
    fetchDiagramBuffer(DIAGRAM_3_CODE)
  ]);
  console.log('Diagrams fetched successfully. Initializing jsPDF...');

  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  const PAGE_WIDTH = 210;
  const PAGE_HEIGHT = 297;
  const MARGIN_LEFT = 14;
  const MARGIN_RIGHT = 14;
  const CONTENT_WIDTH = PAGE_WIDTH - MARGIN_LEFT - MARGIN_RIGHT; // 182mm

  // Color Palette
  const NAVY = [26, 35, 64] as [number, number, number]; // #1A2340
  const BLUE = [37, 99, 235] as [number, number, number]; // #2563EB
  const TEXT_DARK = [30, 41, 59] as [number, number, number]; // #1E293B
  const TEXT_MUTED = [100, 116, 139] as [number, number, number]; // #64748B
  const BG_LIGHT = [248, 250, 252] as [number, number, number]; // #F8FAFC
  const BORDER_LIGHT = [226, 232, 240] as [number, number, number]; // #E2E8F0
  const BORDER_ACCENT = [191, 219, 254] as [number, number, number]; // #BFDBFE

  // Helper for Section Titles
  const renderSectionHeader = (y: number, num: string, title: string) => {
    doc.setFillColor(...BLUE);
    doc.rect(MARGIN_LEFT, y, 4, 7, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(14);
    doc.setTextColor(...NAVY);
    doc.text(`${num} ${title}`, MARGIN_LEFT + 7, y + 5.5);
    return y + 10;
  };

  // ==========================================
  // PAGE 1: TITLE, DISCLAIMER & EXECUTIVE SUMMARY
  // ==========================================
  
  // Header Banner
  doc.setFillColor(...NAVY);
  doc.rect(MARGIN_LEFT, 14, CONTENT_WIDTH, 26, 'F');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(13);
  doc.setTextColor(255, 255, 255);
  doc.text('PRODUCT REQUIREMENTS DOCUMENT (PRD)', MARGIN_LEFT + 8, 22);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(191, 219, 254);
  doc.text('REQUISITION AND ISSUE SLIP (RIS) & INVENTORY MANAGEMENT PORTAL', MARGIN_LEFT + 8, 28);

  doc.setFillColor(37, 99, 235);
  doc.roundedRect(MARGIN_LEFT + CONTENT_WIDTH - 58, 20, 52, 6, 1.5, 1.5, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(255, 255, 255);
  doc.text('APPENDIX 63 COMPLIANT', MARGIN_LEFT + CONTENT_WIDTH - 55, 24.3);

  // Metadata Table
  let curY = 44;
  autoTable(doc, {
    startY: curY,
    margin: { left: MARGIN_LEFT, right: MARGIN_RIGHT },
    theme: 'plain',
    styles: { fontSize: 8, cellPadding: 2, textColor: TEXT_DARK },
    columnStyles: {
      0: { fontStyle: 'bold', textColor: NAVY, cellWidth: 32 },
      1: { cellWidth: 59 },
      2: { fontStyle: 'bold', textColor: NAVY, cellWidth: 32 },
      3: { cellWidth: 59 },
    },
    body: [
      ['Document Version:', '1.2.0 (Approved / Demo Release)', 'Engineering Lead:', 'System Architecture & Dev Team'],
      ['Classification:', 'Sanitized Demo Portfolio', 'Standard Benchmark:', 'Government Accounting Manual App. 63'],
      ['Last Updated:', 'October 2026', 'Target Stack:', 'React 19 + TypeScript + Supabase/Mock'],
    ],
  });

  // @ts-ignore
  curY = doc.lastAutoTable.finalY + 6;

  // Privacy & Data Disclaimer Callout
  doc.setFillColor(239, 246, 255); // soft blue bg
  doc.setDrawColor(59, 130, 246);
  doc.setLineWidth(0.6);
  doc.roundedRect(MARGIN_LEFT, curY, CONTENT_WIDTH, 26, 2, 2, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9.5);
  doc.setTextColor(30, 64, 175);
  doc.text('PRIVACY & DATA DISCLAIMER (SANITIZED PORTFOLIO DEMO)', MARGIN_LEFT + 6, curY + 6);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(30, 41, 59);
  const disclaimerText = 'This repository contains a sanitized, open-source demo version of an application originally developed for a regional government agency. To comply with privacy requirements and non-disclosure standards, all sensitive production data, employee credentials, agency seals, and proprietary branding have been completely removed and replaced with sanitized mock records.';
  const wrappedDisclaimer = doc.splitTextToSize(disclaimerText, CONTENT_WIDTH - 12);
  doc.text(wrappedDisclaimer, MARGIN_LEFT + 6, curY + 11.5);

  curY += 32;

  // Section 1: Executive Summary
  curY = renderSectionHeader(curY, '1.', 'Executive Summary');

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(...TEXT_DARK);
  const execSummary = 'The Requisition and Issue Slip (RIS) & Inventory Management Portal is a modern web application engineered to digitize, standardize, and accelerate the complete requisition, stock verification, multi-tier approval, and issuance lifecycle for public and enterprise institutions.\n\nOriginally built to replace slow, paper-driven routing adhering to statutory government standards (Government Accounting Manual - Appendix 63), this system eliminates physical document routing delays, prevents inventory discrepancy through atomic deduction algorithms, and provides audit-ready vector PDF generation and real-time consumption analytics.';
  const wrappedSummary = doc.splitTextToSize(execSummary, CONTENT_WIDTH);
  doc.text(wrappedSummary, MARGIN_LEFT, curY);

  curY += 28;

  // Core Value Pillars (4 Cards)
  const cardWidth = (CONTENT_WIDTH - 6) / 2;
  const cardHeight = 22;

  const pillars = [
    { title: 'Zero-Friction Requisitions', desc: 'Composing multi-line requests with instant stock auto-completion in under 90 seconds.' },
    { title: 'Strict Separation of Duties', desc: 'Enforced role guards between Requisitioners, Property Custodians, and Agency Directors.' },
    { title: 'Atomic Inventory Decrement', desc: 'Real-time deduction upon approval prevents negative balances and stock discrepancies.' },
    { title: 'Appendix 63 PDF Generation', desc: 'Statutory compliance with 4 official signature blocks rendered crisply on client-side.' },
  ];

  pillars.forEach((p, idx) => {
    const col = idx % 2;
    const row = Math.floor(idx / 2);
    const x = MARGIN_LEFT + col * (cardWidth + 6);
    const y = curY + row * (cardHeight + 4);

    doc.setFillColor(...BG_LIGHT);
    doc.setDrawColor(...BORDER_LIGHT);
    doc.setLineWidth(0.3);
    doc.roundedRect(x, y, cardWidth, cardHeight, 1.5, 1.5, 'FD');

    doc.setFillColor(...BLUE);
    doc.circle(x + 4.5, y + 5.5, 1.5, 'F');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8.5);
    doc.setTextColor(...NAVY);
    doc.text(p.title, x + 8, y + 6.5);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(...TEXT_MUTED);
    const lines = doc.splitTextToSize(p.desc, cardWidth - 10);
    doc.text(lines, x + 8, y + 11.5);
  });

  // ==========================================
  // PAGE 2: LIFECYCLE DIAGRAM & OBJECTIVES
  // ==========================================
  doc.addPage();
  curY = 18;

  curY = renderSectionHeader(curY, '1.1', 'Visual Requisition Lifecycle Overview');

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(...TEXT_DARK);
  doc.text('The state diagram below illustrates the complete lifecycle of a requisition, from initial composition to final archiving:', MARGIN_LEFT, curY);
  curY += 5;

  // Add Diagram 1 (Lifecycle State Machine)
  const p1 = doc.getImageProperties(d1Buf);
  // Fit diagram 1 nicely on page 2
  const d1TargetHeight = 110;
  const d1TargetWidth = (p1.width / p1.height) * d1TargetHeight;
  const d1X = MARGIN_LEFT + (CONTENT_WIDTH - d1TargetWidth) / 2;

  doc.setFillColor(...BG_LIGHT);
  doc.setDrawColor(...BORDER_LIGHT);
  doc.setLineWidth(0.4);
  doc.roundedRect(MARGIN_LEFT, curY, CONTENT_WIDTH, d1TargetHeight + 10, 2, 2, 'FD');

  doc.addImage(d1Buf, 'JPEG', d1X, curY + 3, d1TargetWidth, d1TargetHeight);

  doc.setFont('helvetica', 'italic');
  doc.setFontSize(7.5);
  doc.setTextColor(...TEXT_MUTED);
  doc.text('Figure 1.0: End-to-End Requisition Lifecycle & Stock Decrement State Machine', MARGIN_LEFT + 6, curY + d1TargetHeight + 7);

  curY += d1TargetHeight + 16;

  // Section 2: Problem Statement & Objectives
  curY = renderSectionHeader(curY, '2.', 'Problem Statement & Objectives');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(...NAVY);
  doc.text('2.1 The Traditional Paper-Driven Problem', MARGIN_LEFT, curY);
  curY += 4.5;

  const painPoints = [
    '• Paper-Driven Routing Bottlenecks: Physical routing of slips across offices takes days, leading to misplaced files.',
    '• Stock Blindness: Requisitioners request items with no live inventory visibility, causing high rejection rates.',
    '• Inventory Inaccuracies: Manual ledger updates cause stock discrepancies, duplicate issuances, and shrinkage.',
    '• Audit Tabulation Overhead: Compiling statutory quarterly reports requires manual, error-prone paper audits.',
  ];

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(...TEXT_DARK);
  painPoints.forEach(pt => {
    const lines = doc.splitTextToSize(pt, CONTENT_WIDTH);
    doc.text(lines, MARGIN_LEFT, curY);
    curY += lines.length * 3.5 + 1;
  });

  curY += 3;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(...NAVY);
  doc.text('2.2 Core Product Objectives', MARGIN_LEFT, curY);
  curY += 4.5;

  const objectives = [
    '• Requisition Composition < 2 min: Dynamic table builder with instant catalog autocomplete and unit autofill.',
    '• Role-Based Guardrails: Distinct portals for Requisitioners, Property Custodians, and Super Admin Directors.',
    '• Real-Time Atomic Stock Updates: Immediate decrement of inventory upon formal approval without race conditions.',
    '• Statutory Document Fidelity: 100% compliant Government Appendix 63 printable/downloadable vector PDFs.',
    '• Autonomous Analytics: Automated periodic consumption analytics (monthly, quarterly, semestral, annual).',
  ];

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(...TEXT_DARK);
  objectives.forEach(obj => {
    const lines = doc.splitTextToSize(obj, CONTENT_WIDTH);
    doc.text(lines, MARGIN_LEFT, curY);
    curY += lines.length * 3.5 + 1;
  });

  // ==========================================
  // PAGE 3: STAKEHOLDER PERSONAS & MATRIX
  // ==========================================
  doc.addPage();
  curY = 18;

  curY = renderSectionHeader(curY, '3.', 'Stakeholder & User Personas');

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(...TEXT_DARK);
  doc.text('The portal orchestrates four distinct roles with strict separation of duties and purpose-built dashboards:', MARGIN_LEFT, curY);
  curY += 5;

  // Add Diagram 2 (Stakeholder Pathways)
  const p2 = doc.getImageProperties(d2Buf);
  const d2TargetWidth = CONTENT_WIDTH - 10;
  const d2TargetHeight = (p2.height / p2.width) * d2TargetWidth;
  const d2X = MARGIN_LEFT + 5;

  doc.setFillColor(...BG_LIGHT);
  doc.setDrawColor(...BORDER_LIGHT);
  doc.setLineWidth(0.4);
  doc.roundedRect(MARGIN_LEFT, curY, CONTENT_WIDTH, d2TargetHeight + 10, 2, 2, 'FD');

  doc.addImage(d2Buf, 'JPEG', d2X, curY + 3, d2TargetWidth, d2TargetHeight);

  doc.setFont('helvetica', 'italic');
  doc.setFontSize(7.5);
  doc.setTextColor(...TEXT_MUTED);
  doc.text('Figure 2.0: Stakeholder Roles, Portals & Architectural Interaction Pathways', MARGIN_LEFT + 6, curY + d2TargetHeight + 7);

  curY += d2TargetHeight + 16;

  // Detailed Persona Matrix Table
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(...NAVY);
  doc.text('3.1 Persona Specification Matrix', MARGIN_LEFT, curY);
  curY += 3;

  autoTable(doc, {
    startY: curY,
    margin: { left: MARGIN_LEFT, right: MARGIN_RIGHT },
    headStyles: {
      fillColor: NAVY,
      textColor: [255, 255, 255],
      fontSize: 8,
      fontStyle: 'bold',
      cellPadding: 3,
    },
    bodyStyles: {
      fontSize: 7.5,
      cellPadding: 2.5,
      textColor: TEXT_DARK,
    },
    alternateRowStyles: {
      fillColor: [248, 250, 252],
    },
    columnStyles: {
      0: { cellWidth: 26, fontStyle: 'bold' },
      1: { cellWidth: 32 },
      2: { cellWidth: 62 },
      3: { cellWidth: 62 },
    },
    head: [['Role', 'Target Persona', 'Primary Responsibilities', 'Core Pain Points Addressed']],
    body: [
      [
        'Public / Guest',
        'Unauthenticated Staff, New Hires, Evaluators',
        'Browse catalog availability, compose draft requisition, register account.',
        'Zero setup friction; transparent stock visibility before sign-in.',
      ],
      [
        'Employee\n(emp1, emp2)',
        'Project Specialist, Research Analyst, Staff',
        'Submit RIS, specify responsibility center & purpose, track approval, download signed PDFs.',
        'Eliminates physical routing; transparent tracking of request approvals.',
      ],
      [
        'Admin Custodian\n(admin, admin2)',
        'Property Custodian, Supply Officer',
        'Review incoming requests, verify warehouse stock, assign official RIS No, approve/reject, adjust items.',
        'Instant stock deduction; zero manual physical tallying; automated PDF generation.',
      ],
      [
        'Super Admin\n(superadmin)',
        'Executive Director, Chief Information Officer',
        'High-level audit across departments, system user governance, periodic consumption analytics.',
        'One-click statutory reports; enterprise transparency; end-to-end auditability.',
      ],
    ],
  });

  // ==========================================
  // PAGE 4: FUNCTIONAL REQUIREMENTS (FR-1 TO FR-4)
  // ==========================================
  doc.addPage();
  curY = 18;

  curY = renderSectionHeader(curY, '4.', 'Functional Requirements & Feature Specifications');

  const modulesPart1 = [
    {
      code: 'Module FR-1',
      title: 'Requisition Formulation & Appendix 63 Engine',
      items: [
        'FR-1.1 Interactive Header: Captures Entity Name, Fund Cluster, Division, Office, Responsibility Center Code, and Purpose.',
        'FR-1.2 Dynamic Line Items: Supports real-time addition, deletion, and rearrangement of multiple supply line items.',
        'FR-1.3 Catalog Autocomplete: Typing item descriptions queries master inventory with auto-population of Stock No and Unit of Measure.',
        'FR-1.4 Live Stock Check: Alerts user immediately if requisitioned quantity exceeds current available warehouse balance.',
        'FR-1.5 Draft Persistence: Saves incomplete slips locally in browser storage with instant resume capability.',
      ]
    },
    {
      code: 'Module FR-2',
      title: 'Approval Workflow & Central Review Inbox',
      items: [
        'FR-2.1 Administrative Review Queue: Filterable inbox categorizing slips by Draft, Pending, Approved, and Rejected states.',
        'FR-2.2 Stock Availability Verification: Custodian toggles stock availability (Yes/No) per item and adjusts approved quantity.',
        'FR-2.3 Custom RIS Assignment: Custodian assigns custom or auto-generated official RIS numbering (e.g., RIS-2026-001).',
        'FR-2.4 Rejection Reason Logging: Requires mandatory justification remarks when rejecting a requisition.',
        'FR-2.5 Atomic Stock Deduction: Automatic atomic stock decrement upon approval to prevent race conditions.',
      ]
    },
    {
      code: 'Module FR-3',
      title: 'Inventory & Master Item Management',
      items: [
        'FR-3.1 Item Master Data: Records Stock No, Item Name, Detailed Specifications, Category (Equipment, Supplies), and Unit.',
        'FR-3.2 Real-Time Restock: Custodian can adjust stock quantities, modify specifications, or archive inactive items.',
        'FR-3.3 Search & Low Stock Alerts: Real-time filtering with visual badges highlighting items below threshold (< 5 units).',
        'FR-3.4 Batch Import Simulation: Built-in spreadsheet-like import preview for bulk inventory seeding.',
      ]
    },
    {
      code: 'Module FR-4',
      title: 'Periodic Analytics & Reporting Engine',
      items: [
        'FR-4.1 Periodic Aggregation: Automated compilation by Month, Quarter, Semester, and Calendar Year.',
        'FR-4.2 Demand Ranking: Visualizes Top 5 Most Requested vs. Least Requested inventory supplies.',
        'FR-4.3 Departmental Distribution: Analyzes requisition consumption across administrative divisions.',
        'FR-4.4 Export Formats: Instant client-side export to Microsoft Excel (.xlsx) and printable PDF reports.',
      ]
    }
  ];

  modulesPart1.forEach(mod => {
    doc.setFillColor(...BG_LIGHT);
    doc.setDrawColor(...BORDER_LIGHT);
    doc.setLineWidth(0.3);
    doc.roundedRect(MARGIN_LEFT, curY, CONTENT_WIDTH, 48, 1.5, 1.5, 'FD');

    doc.setFillColor(...NAVY);
    doc.roundedRect(MARGIN_LEFT + 4, curY + 3.5, 22, 5, 1, 1, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7);
    doc.setTextColor(255, 255, 255);
    doc.text(mod.code, MARGIN_LEFT + 6, curY + 7);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8.5);
    doc.setTextColor(...NAVY);
    doc.text(mod.title, MARGIN_LEFT + 29, curY + 7.5);

    let itemY = curY + 12;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(...TEXT_DARK);
    mod.items.forEach(it => {
      const wrapped = doc.splitTextToSize(`• ${it}`, CONTENT_WIDTH - 12);
      doc.text(wrapped, MARGIN_LEFT + 6, itemY);
      itemY += wrapped.length * 3.3 + 1;
    });

    curY += 51;
  });

  // ==========================================
  // PAGE 5: FR-5, FR-6 & NON-FUNCTIONAL REQUIREMENTS
  // ==========================================
  doc.addPage();
  curY = 18;

  const modulesPart2 = [
    {
      code: 'Module FR-5',
      title: 'Official Appendix 63 PDF Generation Engine',
      items: [
        'FR-5.1 Statutory Appendix 63 Fidelity: Generates pixel-perfect PDFs matching statutory Government Accounting Manual standards.',
        'FR-5.2 Four Signature Blocks: Requested By (Employee), Approved By (Division Head), Issued By (Custodian), Received By (Officer).',
        'FR-5.3 Vector Table Pagination: Automatically paginates multi-line item slips with borders, remarks, and headers.',
      ]
    },
    {
      code: 'Module FR-6',
      title: 'Multi-Role Access Control & Zero-Setup Demo Engine',
      items: [
        'FR-6.1 Zero-Setup Portability: Pre-seeded client-side store simulating full enterprise workflow without requiring cloud backends.',
        'FR-6.2 1-Click Role Switcher: Instant switcher between Employee, Admin Custodian, and Super Admin roles.',
        'FR-6.3 Data Reset Facility: One-click reset to restore clean sanitized state for continuous evaluations.',
      ]
    }
  ];

  modulesPart2.forEach(mod => {
    doc.setFillColor(...BG_LIGHT);
    doc.setDrawColor(...BORDER_LIGHT);
    doc.setLineWidth(0.3);
    doc.roundedRect(MARGIN_LEFT, curY, CONTENT_WIDTH, 34, 1.5, 1.5, 'FD');

    doc.setFillColor(...NAVY);
    doc.roundedRect(MARGIN_LEFT + 4, curY + 3.5, 22, 5, 1, 1, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7);
    doc.setTextColor(255, 255, 255);
    doc.text(mod.code, MARGIN_LEFT + 6, curY + 7);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8.5);
    doc.setTextColor(...NAVY);
    doc.text(mod.title, MARGIN_LEFT + 29, curY + 7.5);

    let itemY = curY + 12;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(...TEXT_DARK);
    mod.items.forEach(it => {
      const wrapped = doc.splitTextToSize(`• ${it}`, CONTENT_WIDTH - 12);
      doc.text(wrapped, MARGIN_LEFT + 6, itemY);
      itemY += wrapped.length * 3.3 + 1;
    });

    curY += 37;
  });

  curY += 3;

  // Section 5: Non-Functional Requirements
  curY = renderSectionHeader(curY, '5.', 'Non-Functional Requirements (NFR)');

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(...TEXT_DARK);
  doc.text('Key architectural pillars ensuring enterprise security, performance, responsive design, and compliance:', MARGIN_LEFT, curY);
  curY += 5;

  // Add Diagram 3 (NFR Architecture)
  const p3 = doc.getImageProperties(d3Buf);
  const d3TargetHeight = 56;
  const d3TargetWidth = (p3.width / p3.height) * d3TargetHeight;
  const d3X = MARGIN_LEFT + (CONTENT_WIDTH - d3TargetWidth) / 2;

  doc.setFillColor(...BG_LIGHT);
  doc.setDrawColor(...BORDER_LIGHT);
  doc.setLineWidth(0.4);
  doc.roundedRect(MARGIN_LEFT, curY, CONTENT_WIDTH, d3TargetHeight + 9, 2, 2, 'FD');

  doc.addImage(d3Buf, 'JPEG', d3X, curY + 2.5, d3TargetWidth, d3TargetHeight);

  doc.setFont('helvetica', 'italic');
  doc.setFontSize(7.5);
  doc.setTextColor(...TEXT_MUTED);
  doc.text('Figure 3.0: Non-Functional Architectural Pillars & Quality Attributes', MARGIN_LEFT + 6, curY + d3TargetHeight + 6.5);

  curY += d3TargetHeight + 13;

  // NFR Breakdown Grid (4 Points)
  const nfrItems = [
    { label: 'Security & Privacy', desc: '100% sanitized data; strict role-based route guards; zero leakage of real agency identifiers.' },
    { label: 'Performance & Latency', desc: 'Client response < 50ms; instant client-side PDF compilation; sub-second initial load.' },
    { label: 'Responsive UX', desc: 'Optimized layouts for mobile phones, tablets/iPads, and enterprise desktop monitors.' },
    { label: 'Reliability & Integrity', desc: 'Atomic stock updates prevent negative stock counts; data validation prevents zero-item slips.' },
  ];

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  nfrItems.forEach(n => {
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...NAVY);
    doc.text(`• ${n.label}: `, MARGIN_LEFT, curY);
    const labelW = doc.getTextWidth(`• ${n.label}: `);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(...TEXT_DARK);
    const remainingW = CONTENT_WIDTH - labelW;
    const lines = doc.splitTextToSize(n.desc, remainingW);
    doc.text(lines[0], MARGIN_LEFT + labelW, curY);
    if (lines.length > 1) {
      curY += 3.5;
      doc.text(lines.slice(1).join(' '), MARGIN_LEFT + 6, curY);
    }
    curY += 4.5;
  });

  // ==========================================
  // PAGE 6: KPIS, ASSUMPTIONS & SIGN-OFF
  // ==========================================
  doc.addPage();
  curY = 18;

  curY = renderSectionHeader(curY, '6.', 'Success Metrics & Key Performance Indicators (KPIs)');

  autoTable(doc, {
    startY: curY,
    margin: { left: MARGIN_LEFT, right: MARGIN_RIGHT },
    headStyles: {
      fillColor: NAVY,
      textColor: [255, 255, 255],
      fontSize: 8,
      fontStyle: 'bold',
      cellPadding: 3,
    },
    bodyStyles: {
      fontSize: 8,
      cellPadding: 3,
      textColor: TEXT_DARK,
    },
    alternateRowStyles: {
      fillColor: [248, 250, 252],
    },
    columnStyles: {
      0: { cellWidth: 55, fontStyle: 'bold' },
      1: { cellWidth: 50 },
      2: { cellWidth: 77, fontStyle: 'bold', textColor: [22, 101, 52] }, // green highlight
    },
    head: [['Metric / Performance Indicator', 'Baseline Target', 'Demonstrated Demo Performance']],
    body: [
      ['Requisition Formulation Time', '< 3 minutes per slip', '~90 seconds with live autocomplete'],
      ['Administrative Approval Velocity', '80% faster than paper routing', 'Instant digital review & 1-click approval'],
      ['Inventory Discrepancy Rate', '0% variance', '0% discrepancy (automated atomic deduction)'],
      ['Appendix 63 PDF Generation', '< 1.5 seconds latency', '~400ms (client-side jsPDF engine)'],
      ['Evaluator Onboarding Friction', 'Zero manual installation', '100% instant in-browser evaluation'],
    ],
  });

  // @ts-ignore
  curY = doc.lastAutoTable.finalY + 8;

  // Section 7: Assumptions & Boundaries
  curY = renderSectionHeader(curY, '7.', 'Assumptions & Operational Scope');

  const assumptions = [
    '• Demo Mode Execution: The application operates out-of-the-box utilizing an in-memory & LocalStorage mock engine, allowing immediate deployment to static CDNs (Vercel, Netlify, Cloud Run).',
    '• Enterprise Backend Compatibility: Database schemas and data transfer objects are fully designed for zero-refactor binding to PostgreSQL 15+ and Supabase.',
    '• Compliance Adherence: Slips and records are aligned with the statutory formats of the Philippine Government Accounting Manual (GAM) for National Government Agencies.',
  ];

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(...TEXT_DARK);
  assumptions.forEach(a => {
    const lines = doc.splitTextToSize(a, CONTENT_WIDTH);
    doc.text(lines, MARGIN_LEFT, curY);
    curY += lines.length * 3.8 + 2;
  });

  curY += 6;

  // Institutional Sign-Off / Approval Matrix Block
  doc.setFillColor(...BG_LIGHT);
  doc.setDrawColor(...BORDER_LIGHT);
  doc.setLineWidth(0.4);
  doc.roundedRect(MARGIN_LEFT, curY, CONTENT_WIDTH, 48, 2, 2, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(...NAVY);
  doc.text('DOCUMENT APPROVAL & VERIFICATION BLOCK', MARGIN_LEFT + 6, curY + 6.5);

  const sigColWidth = (CONTENT_WIDTH - 18) / 3;
  const sigY = curY + 12;

  const signatures = [
    { title: 'PREPARED BY', name: 'Lead Solutions Architect', role: 'Full-Stack Software Engineering' },
    { title: 'REVIEWED BY', name: 'Senior Systems Auditor', role: 'Compliance & Enterprise Quality' },
    { title: 'APPROVED FOR RELEASE', name: 'Chief Technology Director', role: 'Public Sector Technology Practice' },
  ];

  signatures.forEach((sig, i) => {
    const x = MARGIN_LEFT + 6 + i * (sigColWidth + 3);
    
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7);
    doc.setTextColor(...TEXT_MUTED);
    doc.text(sig.title, x, sigY);

    // Signature line
    doc.setDrawColor(148, 163, 184);
    doc.setLineWidth(0.3);
    doc.line(x, sigY + 18, x + sigColWidth - 4, sigY + 18);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.5);
    doc.setTextColor(...NAVY);
    doc.text(sig.name, x, sigY + 22);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(6.5);
    doc.setTextColor(...TEXT_MUTED);
    doc.text(sig.role, x, sigY + 26);
  });

  // ==========================================
  // RUNNING HEADERS & FOOTERS (ALL PAGES)
  // ==========================================
  const totalPages = doc.getNumberOfPages();

  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);

    // Header (pages 2 to totalPages)
    if (i > 1) {
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(7);
      doc.setTextColor(...TEXT_MUTED);
      doc.text('RIS & Inventory Management Portal — Product Requirements Document (PRD)', MARGIN_LEFT, 10);
      doc.text('GAM Appendix 63 Standard', MARGIN_LEFT + CONTENT_WIDTH - doc.getTextWidth('GAM Appendix 63 Standard'), 10);

      doc.setDrawColor(...BORDER_LIGHT);
      doc.setLineWidth(0.2);
      doc.line(MARGIN_LEFT, 12, MARGIN_LEFT + CONTENT_WIDTH, 12);
    }

    // Footer (all pages)
    doc.setDrawColor(...BORDER_LIGHT);
    doc.setLineWidth(0.2);
    doc.line(MARGIN_LEFT, PAGE_HEIGHT - 12, MARGIN_LEFT + CONTENT_WIDTH, PAGE_HEIGHT - 12);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7);
    doc.setTextColor(...TEXT_MUTED);
    doc.text('CONFIDENTIAL / SANITIZED OPEN-SOURCE DEMO', MARGIN_LEFT, PAGE_HEIGHT - 8);

    doc.setFont('helvetica', 'normal');
    doc.text('Government Standard Inventory Lifecycle', MARGIN_LEFT + 75, PAGE_HEIGHT - 8);

    const pageStr = `Page ${i} of ${totalPages}`;
    doc.text(pageStr, MARGIN_LEFT + CONTENT_WIDTH - doc.getTextWidth(pageStr), PAGE_HEIGHT - 8);
  }

  // Save to /docs/PRD.pdf and /public/PRD.pdf
  const pdfBytes = Buffer.from(doc.output('arraybuffer'));

  const docsPath = path.resolve('/docs/PRD.pdf');
  const publicPath = path.resolve('/public/PRD.pdf');

  fs.mkdirSync(path.dirname(docsPath), { recursive: true });
  fs.mkdirSync(path.dirname(publicPath), { recursive: true });

  fs.writeFileSync(docsPath, pdfBytes);
  fs.writeFileSync(publicPath, pdfBytes);

  console.log(`Successfully generated PRD PDF!`);
  console.log(`Saved to: ${docsPath} (${pdfBytes.length} bytes)`);
  console.log(`Saved to: ${publicPath} (${pdfBytes.length} bytes)`);
  console.log(`Total Pages: ${totalPages}`);
}

generatePrdPdf().catch(err => {
  console.error('Error generating PRD PDF:', err);
  process.exit(1);
});
