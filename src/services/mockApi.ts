interface ApiResponse<T = any> {
  data: T;
}

interface ApiClient {
  get: <T = any>(url: string, config?: any) => Promise<ApiResponse<T>>;
  post: <T = any>(url: string, data?: any, config?: any) => Promise<ApiResponse<T>>;
  put: <T = any>(url: string, data?: any, config?: any) => Promise<ApiResponse<T>>;
  delete: <T = any>(url: string, config?: any) => Promise<ApiResponse<T>>;
}

const STORAGE_KEY = 'ris_portfolio_demo_db_v2';

const getUniqueId = () => Math.floor(Math.random() * 1000000) + 100;

// Default Sanitized Seed Data for Portfolio Replica
const defaultSeedData = {
  users: [
    {
      id: 1,
      employee_id: 'emp1',
      password_hash: 'emp1',
      full_name: 'Citizen A (Project Officer)',
      email: 'citizen.a@example.com',
      role: 'employee',
      department: 'Digital Systems Division',
      designation: 'Senior Project Specialist',
      entity_name: 'Apex Innovations Corp (Demo Org)',
      fund_cluster: 'FC-01-OPERATIONS',
      division: 'Technology & Innovation',
      office: 'Digital Transformation Hub',
      responsibility_center_code: 'RC-101-TECH',
      is_active: true
    },
    {
      id: 2,
      employee_id: 'emp2',
      password_hash: 'emp2',
      full_name: 'Citizen B (Business Analyst)',
      email: 'citizen.b@example.com',
      role: 'employee',
      department: 'Corporate Strategy & Planning',
      designation: 'Lead Research Analyst',
      entity_name: 'Apex Innovations Corp (Demo Org)',
      fund_cluster: 'FC-01-OPERATIONS',
      division: 'Strategy & Analysis',
      office: 'Research Operations',
      responsibility_center_code: 'RC-102-PLAN',
      is_active: true
    },
    {
      id: 3,
      employee_id: 'admin',
      password_hash: 'admin',
      full_name: 'Admin Custodian (Ops Lead)',
      email: 'admin.custodian@example.com',
      role: 'admin_administrative',
      department: 'Administrative & Logistics Services',
      designation: 'Supply & Property Custodian',
      entity_name: 'Apex Innovations Corp (Demo Org)',
      fund_cluster: 'FC-01-OPERATIONS',
      division: 'Logistics Division',
      office: 'Central Property Office',
      responsibility_center_code: 'RC-201-ADMIN',
      is_active: true
    },
    {
      id: 4,
      employee_id: 'admin2',
      password_hash: 'admin2',
      full_name: 'Admin Reviewer (Supply Specialist)',
      email: 'admin.reviewer@example.com',
      role: 'admin',
      department: 'Procurement Services',
      designation: 'Inventory Officer',
      entity_name: 'Apex Innovations Corp (Demo Org)',
      fund_cluster: 'FC-01-OPERATIONS',
      division: 'Procurement & Assets',
      office: 'Inventory Management Section',
      responsibility_center_code: 'RC-202-PROC',
      is_active: true
    },
    {
      id: 5,
      employee_id: 'superadmin',
      password_hash: 'superadmin',
      full_name: 'Super Admin (System Director)',
      email: 'superadmin@example.com',
      role: 'superadmin',
      department: 'Executive Governance',
      designation: 'Chief Information Officer',
      entity_name: 'Apex Innovations Corp (Demo Org)',
      fund_cluster: 'FC-01-OPERATIONS',
      division: 'Executive Office',
      office: 'Global Systems Oversight',
      responsibility_center_code: 'RC-999-EXEC',
      is_active: true
    }
  ],

  inventory: [
    {
      id: 1,
      stock_no: 'STK-1001',
      item_name: 'Ergonomic Workstation Laptop',
      description: 'Ergonomic Workstation Laptop 16GB / 512GB SSD',
      category: 'Equipment',
      unit: 'unit',
      quantity: 14,
      is_available: true
    },
    {
      id: 2,
      stock_no: 'STK-1002',
      item_name: 'Wireless Precision Optical Mouse',
      description: 'Wireless Precision Optical Mouse (Rechargeable)',
      category: 'Equipment',
      unit: 'pcs',
      quantity: 48,
      is_available: true
    },
    {
      id: 3,
      stock_no: 'STK-1003',
      item_name: 'Compact Mechanical Keyboard',
      description: 'Compact Mechanical Keyboard (USB-C & Bluetooth)',
      category: 'Equipment',
      unit: 'pcs',
      quantity: 26,
      is_available: true
    },
    {
      id: 4,
      stock_no: 'STK-1004',
      item_name: 'Multipurpose Copy Paper A4 80gsm',
      description: 'Multipurpose Copy Paper A4 80gsm (500 sheets/ream)',
      category: 'Supplies',
      unit: 'ream',
      quantity: 110,
      is_available: true
    },
    {
      id: 5,
      stock_no: 'STK-1005',
      item_name: 'Gel Ink Pen Set (Black 0.5mm)',
      description: 'Gel Ink Pen Set (Black 0.5mm, 12 pcs/box)',
      category: 'Supplies',
      unit: 'box',
      quantity: 32,
      is_available: true
    },
    {
      id: 6,
      stock_no: 'STK-1006',
      item_name: '27-inch IPS Ultra-HD Monitor',
      description: '27-inch IPS Ultra-HD Monitor with Adjustable Stand',
      category: 'Equipment',
      unit: 'unit',
      quantity: 9,
      is_available: true
    },
    {
      id: 7,
      stock_no: 'STK-1007',
      item_name: 'Permanent Chisel-Tip Markers',
      description: 'Permanent Chisel-Tip Markers (Assorted Colors, 8 pcs/set)',
      category: 'Supplies',
      unit: 'set',
      quantity: 42,
      is_available: true
    },
    {
      id: 8,
      stock_no: 'STK-1008',
      item_name: 'Heavy-Duty Desktop Stapler',
      description: 'Heavy-Duty Desktop Stapler with 5000 Staples Pack',
      category: 'Supplies',
      unit: 'pcs',
      quantity: 19,
      is_available: true
    }
  ],

  risRequests: [
    {
      id: 101,
      ris_no: 'Case #12345 (RIS-2026-001)',
      status: 'approved',
      user_id: 1,
      employee_id: 'emp1',
      requested_by_name: 'Citizen A (Project Officer)',
      requested_by_designation: 'Senior Project Specialist',
      approved_by_name: 'Admin Custodian (Ops Lead)',
      approved_by_designation: 'Supply & Property Custodian',
      issued_by_name: 'Admin Custodian (Ops Lead)',
      issued_by_designation: 'Supply & Property Custodian',
      received_by_name: 'Citizen A (Project Officer)',
      received_by_designation: 'Senior Project Specialist',
      entity_name: 'Apex Innovations Corp (Demo Org)',
      fund_cluster: 'FC-01-OPERATIONS',
      division: 'Technology & Innovation',
      office: 'Digital Transformation Hub',
      responsibility_center_code: 'RC-101-TECH',
      purpose: 'Deployment of digital sprint hardware and workstation consumables for new analytics rollout.',
      createdAt: new Date(Date.now() - 3 * 3600 * 1000).toISOString()
    },
    {
      id: 102,
      ris_no: 'Case #12346 (RIS-2026-002)',
      status: 'sent',
      user_id: 1,
      employee_id: 'emp1',
      requested_by_name: 'Citizen A (Project Officer)',
      requested_by_designation: 'Senior Project Specialist',
      entity_name: 'Apex Innovations Corp (Demo Org)',
      fund_cluster: 'FC-01-OPERATIONS',
      division: 'Technology & Innovation',
      office: 'Digital Transformation Hub',
      responsibility_center_code: 'RC-101-TECH',
      purpose: 'Office stationery replenishment and peripheral replacements for regional workshop.',
      createdAt: new Date(Date.now() - 8 * 3600 * 1000).toISOString()
    },
    {
      id: 103,
      ris_no: 'Case #12347 (RIS-2026-003)',
      status: 'received',
      user_id: 2,
      employee_id: 'emp2',
      requested_by_name: 'Citizen B (Business Analyst)',
      requested_by_designation: 'Lead Research Analyst',
      approved_by_name: 'Admin Custodian (Ops Lead)',
      approved_by_designation: 'Supply & Property Custodian',
      issued_by_name: 'Admin Custodian (Ops Lead)',
      issued_by_designation: 'Supply & Property Custodian',
      received_by_name: 'Citizen B (Business Analyst)',
      received_by_designation: 'Lead Research Analyst',
      entity_name: 'Apex Innovations Corp (Demo Org)',
      fund_cluster: 'FC-01-OPERATIONS',
      division: 'Strategy & Analysis',
      office: 'Research Operations',
      responsibility_center_code: 'RC-102-PLAN',
      purpose: 'Strategy summit briefing binders, marker kits, and secondary presentation display setup.',
      createdAt: new Date(Date.now() - 24 * 3600 * 1000).toISOString()
    },
    {
      id: 104,
      ris_no: 'Case #12348 (RIS-2026-004)',
      status: 'sent',
      user_id: 2,
      employee_id: 'emp2',
      requested_by_name: 'Citizen B (Business Analyst)',
      requested_by_designation: 'Lead Research Analyst',
      entity_name: 'Apex Innovations Corp (Demo Org)',
      fund_cluster: 'FC-01-OPERATIONS',
      division: 'Strategy & Analysis',
      office: 'Research Operations',
      responsibility_center_code: 'RC-102-PLAN',
      purpose: 'High-density report printing reams and document organizing supplies for annual audit review.',
      createdAt: new Date(Date.now() - 36 * 3600 * 1000).toISOString()
    },
    {
      id: 105,
      ris_no: 'Case #12349 (RIS-2026-005)',
      status: 'draft',
      user_id: 1,
      employee_id: 'emp1',
      requested_by_name: 'Citizen A (Project Officer)',
      requested_by_designation: 'Senior Project Specialist',
      entity_name: 'Apex Innovations Corp (Demo Org)',
      fund_cluster: 'FC-01-OPERATIONS',
      division: 'Technology & Innovation',
      office: 'Digital Transformation Hub',
      responsibility_center_code: 'RC-101-TECH',
      purpose: 'Sandbox draft requisition for testing batch inventory allocation.',
      createdAt: new Date(Date.now() - 2 * 3600 * 1000).toISOString()
    }
  ],

  risItems: [
    // For Case #12345 (RIS 101)
    {
      id: 1,
      ris_id: 101,
      inventory_id: 1,
      stock_no: 'STK-1001',
      description: 'Ergonomic Workstation Laptop 16GB / 512GB SSD',
      unit: 'unit',
      quantity_requisition: 1,
      quantity_issue: 1,
      stock_available_yes: true,
      stock_available_no: false,
      remarks: 'Issued and tagged with Asset Barcode #AST-9021.'
    },
    {
      id: 2,
      ris_id: 101,
      inventory_id: 4,
      stock_no: 'STK-1004',
      description: 'Multipurpose Copy Paper A4 80gsm (500 sheets/ream)',
      unit: 'ream',
      quantity_requisition: 4,
      quantity_issue: 4,
      stock_available_yes: true,
      stock_available_no: false,
      remarks: 'Allocated from Bay B stock.'
    },
    {
      id: 3,
      ris_id: 101,
      inventory_id: 5,
      stock_no: 'STK-1005',
      description: 'Gel Ink Pen Set (Black 0.5mm, 12 pcs/box)',
      unit: 'box',
      quantity_requisition: 2,
      quantity_issue: 2,
      stock_available_yes: true,
      stock_available_no: false,
      remarks: 'Supplies verified.'
    },

    // For Case #12346 (RIS 102)
    {
      id: 4,
      ris_id: 102,
      inventory_id: 2,
      stock_no: 'STK-1002',
      description: 'Wireless Precision Optical Mouse (Rechargeable)',
      unit: 'pcs',
      quantity_requisition: 3,
      quantity_issue: 0,
      stock_available_yes: true,
      stock_available_no: false,
      remarks: 'Pending warehouse inspection.'
    },
    {
      id: 5,
      ris_id: 102,
      inventory_id: 3,
      stock_no: 'STK-1003',
      description: 'Compact Mechanical Keyboard (USB-C & Bluetooth)',
      unit: 'pcs',
      quantity_requisition: 2,
      quantity_issue: 0,
      stock_available_yes: true,
      stock_available_no: false,
      remarks: 'Awaiting custodian sign-off.'
    },

    // For Case #12347 (RIS 103)
    {
      id: 6,
      ris_id: 103,
      inventory_id: 6,
      stock_no: 'STK-1006',
      description: '27-inch IPS Ultra-HD Monitor with Adjustable Stand',
      unit: 'unit',
      quantity_requisition: 2,
      quantity_issue: 2,
      stock_available_yes: true,
      stock_available_no: false,
      remarks: 'Dispatched to Strategy Conference Room.'
    },
    {
      id: 7,
      ris_id: 103,
      inventory_id: 7,
      stock_no: 'STK-1007',
      description: 'Permanent Chisel-Tip Markers (Assorted Colors, 8 pcs/set)',
      unit: 'set',
      quantity_requisition: 3,
      quantity_issue: 3,
      stock_available_yes: true,
      stock_available_no: false,
      remarks: 'Delivered in full.'
    },

    // For Case #12348 (RIS 104)
    {
      id: 8,
      ris_id: 104,
      inventory_id: 4,
      stock_no: 'STK-1004',
      description: 'Multipurpose Copy Paper A4 80gsm (500 sheets/ream)',
      unit: 'ream',
      quantity_requisition: 8,
      quantity_issue: 0,
      stock_available_yes: true,
      stock_available_no: false,
      remarks: 'In review queue.'
    },
    {
      id: 9,
      ris_id: 104,
      inventory_id: 8,
      stock_no: 'STK-1008',
      description: 'Heavy-Duty Desktop Stapler with 5000 Staples Pack',
      unit: 'pcs',
      quantity_requisition: 2,
      quantity_issue: 0,
      stock_available_yes: true,
      stock_available_no: false,
      remarks: 'Standard issue request.'
    },

    // For Case #12349 (RIS 105)
    {
      id: 10,
      ris_id: 105,
      inventory_id: 2,
      stock_no: 'STK-1002',
      description: 'Wireless Precision Optical Mouse (Rechargeable)',
      unit: 'pcs',
      quantity_requisition: 1,
      quantity_issue: 0,
      stock_available_yes: true,
      stock_available_no: false,
      remarks: 'Draft item.'
    }
  ],

  reports: [
    {
      id: 1,
      report_type: 'monthly',
      period_label: 'Current Month Operational Report',
      department: 'All Departments',
      generated_by: 'Admin Custodian',
      createdAt: new Date(Date.now() - 48 * 3600 * 1000).toISOString(),
      data: {
        type: 'monthly',
        period_label: 'Current Month Operational Report',
        department: 'All Departments',
        mostRequested: [
          { stock_no: 'STK-1004', name: 'Multipurpose Copy Paper A4', category: 'Supplies', unit: 'ream', issued: 12, remaining: 110 },
          { stock_no: 'STK-1005', name: 'Gel Ink Pen Set (Black 0.5mm)', category: 'Supplies', unit: 'box', issued: 8, remaining: 32 },
          { stock_no: 'STK-1002', name: 'Wireless Precision Optical Mouse', category: 'Equipment', unit: 'pcs', issued: 5, remaining: 48 },
          { stock_no: 'STK-1006', name: '27-inch IPS Ultra-HD Monitor', category: 'Equipment', unit: 'unit', issued: 2, remaining: 9 }
        ],
        leastRequested: [
          { stock_no: 'STK-1008', name: 'Heavy-Duty Desktop Stapler', category: 'Supplies', unit: 'pcs', issued: 1, remaining: 19 },
          { stock_no: 'STK-1001', name: 'Ergonomic Workstation Laptop', category: 'Equipment', unit: 'unit', issued: 1, remaining: 14 },
          { stock_no: 'STK-1007', name: 'Permanent Chisel-Tip Markers', category: 'Supplies', unit: 'set', issued: 3, remaining: 42 },
          { stock_no: 'STK-1003', name: 'Compact Mechanical Keyboard', category: 'Equipment', unit: 'pcs', issued: 2, remaining: 26 }
        ],
        summary: 'Operational inventory consumption remains within normal project threshold parameters. Requisition fulfillment rate is at 94.2% across digital transformation and strategy departments.'
      }
    },
    {
      id: 2,
      report_type: 'quarterly',
      period_label: 'Q3 Comprehensive Inventory Audit',
      department: 'Technology & Innovation',
      generated_by: 'Super Admin',
      createdAt: new Date(Date.now() - 5 * 86400 * 1000).toISOString(),
      data: {
        type: 'quarterly',
        period_label: 'Q3 Comprehensive Inventory Audit',
        department: 'Technology & Innovation',
        mostRequested: [
          { stock_no: 'STK-1001', name: 'Ergonomic Workstation Laptop', category: 'Equipment', unit: 'unit', issued: 6, remaining: 14 },
          { stock_no: 'STK-1004', name: 'Multipurpose Copy Paper A4', category: 'Supplies', unit: 'ream', issued: 35, remaining: 110 },
          { stock_no: 'STK-1003', name: 'Compact Mechanical Keyboard', category: 'Equipment', unit: 'pcs', issued: 10, remaining: 26 }
        ],
        leastRequested: [
          { stock_no: 'STK-1008', name: 'Heavy-Duty Desktop Stapler', category: 'Supplies', unit: 'pcs', issued: 2, remaining: 19 },
          { stock_no: 'STK-1007', name: 'Permanent Chisel-Tip Markers', category: 'Supplies', unit: 'set', issued: 8, remaining: 42 }
        ],
        summary: 'Quarterly hardware allocations matched the scheduled technical personnel onboarding milestone. No unauthorized stock discrepancies identified.'
      }
    }
  ],

  notifications: []
};

// Helper to load or initialize storage
const loadDB = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(defaultSeedData));
      return JSON.parse(JSON.stringify(defaultSeedData));
    }
    return JSON.parse(raw);
  } catch (e) {
    console.error('Error loading mock database:', e);
    return JSON.parse(JSON.stringify(defaultSeedData));
  }
};

const saveDB = (db: any) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(db));
  } catch (e) {
    console.error('Error saving mock database:', e);
  }
};

export const resetDemoData = () => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(defaultSeedData));
  localStorage.removeItem('draft_ris');
  localStorage.removeItem('pending_ris_id');
};

const mockApi: ApiClient = {
  get: async (url, config) => {
    const db = loadDB();
    const token = localStorage.getItem('token');

    if (url === '/auth/me') {
      if (!token) throw { response: { status: 401, data: { message: 'Unauthorized' } } };
      const user = db.users.find((u: any) => u.employee_id === token);
      if (!user) throw { response: { status: 401, data: { message: 'User session not found' } } };
      return { data: user };
    }

    if (url === '/inventory') {
      const items = db.inventory.map((i: any) => ({
        ...i,
        is_available: Number(i.quantity) > 0
      }));
      return { data: items };
    }

    if (url === '/ris' || url === '/ris/inbox') {
      let results = [...db.risRequests].sort((a: any, b: any) => b.id - a.id).map((r: any) => ({
        ...r,
        items: db.risItems.filter((i: any) => i.ris_id === r.id),
        employee: db.users.find((u: any) => u.employee_id === r.employee_id)
      }));
      if (url === '/ris/inbox') results = results.filter((r: any) => r.status !== 'draft');
      return { data: results };
    }

    if (url === '/ris/my') {
      let results = [...db.risRequests]
        .filter((r: any) => r.employee_id === token)
        .sort((a: any, b: any) => b.id - a.id)
        .map((r: any) => ({
          ...r,
          items: db.risItems.filter((i: any) => i.ris_id === r.id),
          employee: db.users.find((u: any) => u.employee_id === r.employee_id)
        }));
      return { data: results };
    }

    if (url.startsWith('/ris/')) {
      const id = Number(url.split('/').pop());
      const request = db.risRequests.find((r: any) => r.id === id);
      if (request) {
        return {
          data: {
            ...request,
            items: db.risItems.filter((i: any) => i.ris_id === id),
            employee: db.users.find((u: any) => u.employee_id === request.employee_id)
          }
        };
      }
    }

    if (url === '/users') {
      return { data: db.users };
    }

    if (url === '/users/admins') {
      return { data: db.users.filter((u: any) => ['admin', 'admin_administrative', 'superadmin'].includes(u.role)) };
    }

    if (url === '/users/stats') {
      const activeRis = db.risRequests.filter((r: any) => r.status !== 'draft');
      return {
        data: {
          totalEmployees: db.users.filter((u: any) => u.role === 'employee').length,
          totalAdmins: db.users.filter((u: any) => ['admin', 'admin_administrative', 'superadmin'].includes(u.role)).length,
          totalRIS: activeRis.length,
          totalActive: db.users.filter((u: any) => u.is_active !== false).length
        }
      };
    }

    if (url === '/reports') {
      return { data: [...db.reports].sort((a: any, b: any) => b.id - a.id) };
    }

    if (url.startsWith('/reports/') && url.endsWith('/excel')) {
      return { data: new Blob(['Mock Excel Report'], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' }) as any };
    }

    if (url.startsWith('/reports/')) {
      const id = Number(url.split('/')[2]);
      const report = db.reports.find((r: any) => r.id === id);
      return { data: report || {} };
    }

    if (url === '/inventory/template') {
      return { data: new Blob(['Mock Excel Template'], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' }) as any };
    }

    if (url === '/notifications') {
      const user = db.users.find((u: any) => u.employee_id === token);
      if (user) {
        const notifications = (db.notifications || []).filter((n: any) => n.target_role === user.role).sort((a: any, b: any) => b.id - a.id);
        return { data: notifications };
      }
      return { data: [] };
    }

    return { data: null as any };
  },

  post: async (url, data, config) => {
    const db = loadDB();
    const token = localStorage.getItem('token');

    if (url === '/auth/login') {
      const user = db.users.find((u: any) => u.employee_id.toLowerCase() === data.employee_id.trim().toLowerCase() && u.password_hash === data.password);
      if (!user) {
        throw { response: { status: 401, data: { message: 'Invalid credentials. You can use demo accounts (emp1, emp2, admin, superadmin).' } } };
      }
      localStorage.setItem('token', user.employee_id);
      return { data: { token: user.employee_id, user } };
    }

    if (url === '/auth/register') {
      const existing = db.users.find((u: any) => u.employee_id.toLowerCase() === data.employee_id.trim().toLowerCase());
      if (existing) {
        throw { response: { status: 400, data: { message: 'Employee ID already registered' } } };
      }
      const newUser = {
        ...data,
        id: getUniqueId(),
        password_hash: data.password,
        role: 'employee',
        entity_name: data.entity_name || 'Apex Innovations Corp (Demo Org)',
        fund_cluster: data.fund_cluster || 'FC-01-OPERATIONS',
        is_active: true
      };
      db.users.push(newUser);
      saveDB(db);
      localStorage.setItem('token', newUser.employee_id);
      return { data: { token: newUser.employee_id, user: newUser } };
    }

    if (url === '/auth/profile') {
      let user = db.users.find((u: any) => u.employee_id === token);
      if (user) {
        Object.assign(user, data);
        saveDB(db);
        return { data: user };
      }
      throw { response: { status: 404, data: { message: 'User not found' } } };
    }

    if (url === '/inventory') {
      const stockNo = data.stock_no || `STK-${Math.floor(Math.random() * 8999 + 1000)}`;
      const newItem = {
        ...data,
        id: getUniqueId(),
        item_name: data.description || data.item_name || 'Generic Item',
        stock_no: stockNo,
        quantity: Number(data.quantity) || 0,
        is_available: Number(data.quantity) > 0
      };
      db.inventory.push(newItem);
      saveDB(db);
      return { data: newItem };
    }

    if (url === '/inventory/parse-excel') {
      return {
        data: {
          preview: [
            { description: 'High-Speed USB-C Hub 7-in-1', category: 'Equipment', unit: 'unit', quantity: 20 },
            { description: 'Document Archival Storage Boxes', category: 'Supplies', unit: 'box', quantity: 60 }
          ]
        }
      };
    }

    if (url === '/inventory/confirm-upload') {
      const newItems = data.items.map((item: any) => ({
        ...item,
        id: getUniqueId(),
        item_name: item.description || item.item_name || 'Sample Item',
        stock_no: item.stock_no || `STK-${Math.floor(Math.random() * 8999 + 1000)}`,
        quantity: Number(item.quantity) || 0,
        is_available: Number(item.quantity) > 0
      }));
      db.inventory.push(...newItems);
      saveDB(db);
      return { data: { created: newItems.length, skipped: 0 } };
    }

    if (url === '/ris' || url === '/ris/guest') {
      let user = null;
      if (token && url !== '/ris/guest') {
        user = db.users.find((u: any) => u.employee_id === token);
      }

      const risData = url === '/ris/guest' ? data.formData : data;
      const newId = getUniqueId();
      const newCaseNo = `Case #${Math.floor(Math.random() * 89999 + 10000)} (RIS-2026-${String(newId).slice(-3)})`;

      const newRIS = {
        ...risData,
        id: newId,
        ris_no: risData.ris_no || newCaseNo,
        status: url === '/ris/guest' ? 'draft' : (risData.status || 'sent'),
        user_id: user ? user.id : null,
        employee_id: user ? user.employee_id : null,
        requested_by_name: user ? user.full_name : (risData.requested_by_name || 'Guest User'),
        requested_by_designation: user ? user.designation : (risData.requested_by_designation || ''),
        createdAt: new Date().toISOString()
      };
      db.risRequests.push(newRIS);

      if (data.items && data.items.length > 0) {
        const itemsToInsert = data.items.map((item: any) => ({
          id: getUniqueId(),
          ris_id: newRIS.id,
          inventory_id: item.inventory_id || item.id || null,
          stock_no: item.stock_no || 'STK-GEN',
          description: item.description || item.item_name || 'Generic Item',
          unit: item.unit || 'pcs',
          quantity_requisition: Number(item.quantity_requisition || item.quantity_requested || item.quantity || 1),
          quantity_issue: 0,
          stock_available_yes: true,
          stock_available_no: false,
          remarks: item.remarks || ''
        }));
        db.risItems.push(...itemsToInsert);
        newRIS.items = itemsToInsert;
      }

      saveDB(db);
      return { data: newRIS };
    }

    if (url === '/ris/claim') {
      const user = db.users.find((u: any) => u.employee_id === token);
      if (user) {
        const ris = db.risRequests.find((r: any) => r.id === Number(data.ris_id));
        if (ris) {
          ris.user_id = user.id;
          ris.employee_id = user.employee_id;
          ris.requested_by_name = user.full_name;
          ris.requested_by_designation = user.designation;
          saveDB(db);
        }
      }
      return { data: { message: 'RIS claimed successfully' } };
    }

    if (url === '/users/admin') {
      const existing = db.users.find((u: any) => u.employee_id.toLowerCase() === data.employee_id.trim().toLowerCase());
      if (existing) throw { response: { status: 400, data: { message: 'Employee ID already exists' } } };
      const newUser = {
        ...data,
        id: getUniqueId(),
        password_hash: data.password || 'admin123',
        role: data.role || 'admin',
        is_active: true
      };
      db.users.push(newUser);
      saveDB(db);
      return { data: newUser };
    }

    if (url === '/reports/generate') {
      const { type, year, month, quarter, semester, department } = data;
      let periodLabel = '';
      if (type === 'monthly') {
        const monthName = new Intl.DateTimeFormat('en-US', { month: 'long' }).format(new Date(year, (month || 1) - 1));
        periodLabel = `${monthName} ${year}`;
      } else if (type === 'quarterly') {
        periodLabel = `Q${quarter || 1} ${year}`;
      } else if (type === 'semestral') {
        periodLabel = `${semester === 1 ? '1st' : '2nd'} Semester ${year}`;
      } else {
        periodLabel = `Annual Summary ${year}`;
      }

      // Compute dynamic analytics from current inventory
      const mostRequested = db.inventory.slice(0, 4).map((item: any, idx: number) => ({
        stock_no: item.stock_no,
        name: item.description,
        category: item.category,
        unit: item.unit,
        issued: 10 - idx * 2,
        remaining: item.quantity
      }));

      const leastRequested = db.inventory.slice(4, 8).map((item: any, idx: number) => ({
        stock_no: item.stock_no,
        name: item.description,
        category: item.category,
        unit: item.unit,
        issued: idx + 1,
        remaining: item.quantity
      }));

      const newReport = {
        id: getUniqueId(),
        report_type: type,
        period_label: periodLabel,
        department: department || null,
        generated_by: 'Admin Custodian',
        createdAt: new Date().toISOString(),
        data: {
          type,
          period_label: periodLabel,
          department: department || null,
          year,
          month,
          quarter,
          semester,
          mostRequested,
          leastRequested,
          summary: `Aggregated data report for ${periodLabel} across ${department || 'All Departments'}. Inventory availability index stands at 96.8% with consistent requisition cycle time.`
        }
      };
      db.reports.push(newReport);
      saveDB(db);

      return { data: newReport };
    }

    return { data: null as any };
  },

  put: async (url, data, config) => {
    const db = loadDB();

    if (url.startsWith('/inventory/')) {
      const id = Number(url.split('/').pop());
      const idx = db.inventory.findIndex((i: any) => i.id === id);
      if (idx !== -1) {
        db.inventory[idx] = {
          ...db.inventory[idx],
          ...data,
          quantity: Number(data.quantity),
          is_available: Number(data.quantity) > 0
        };
        saveDB(db);
        return { data: db.inventory[idx] };
      }
    }

    if (url.startsWith('/ris/') && url.endsWith('/send')) {
      const id = Number(url.split('/')[2]);
      const ris = db.risRequests.find((r: any) => r.id === id);
      if (ris) {
        ris.status = 'sent';
        saveDB(db);
        return { data: ris };
      }
    }

    if (url.startsWith('/ris/') && url.endsWith('/status')) {
      const id = Number(url.split('/')[2]);
      const ris = db.risRequests.find((r: any) => r.id === id);
      if (ris) {
        ris.status = data.status;

        if (data.status === 'approved') {
          // Deduct inventory quantities for approved quantities
          const items = db.risItems.filter((i: any) => i.ris_id === id);
          items.forEach((item: any) => {
            const qty = Number(item.quantity_issue || item.quantity_requisition) || 0;
            if (qty > 0 && item.inventory_id) {
              const inv = db.inventory.find((invItem: any) => invItem.id === item.inventory_id);
              if (inv) {
                inv.quantity = Math.max(0, inv.quantity - qty);
                inv.is_available = inv.quantity > 0;
              }
            }
          });
        }
        saveDB(db);
        return { data: ris };
      }
    }

    if (url.startsWith('/ris/') && url.endsWith('/mark-received')) {
      const id = Number(url.split('/')[2]);
      const ris = db.risRequests.find((r: any) => r.id === id);
      if (ris) {
        ris.status = 'received';
        saveDB(db);
        return { data: ris };
      }
    }

    if (url.startsWith('/ris/') && url.endsWith('/items')) {
      const id = Number(url.split('/')[2]);

      if (data.items && data.items.length > 0) {
        for (let item of data.items) {
          const payload = {
            ris_id: id,
            inventory_id: item.inventory_id || null,
            stock_no: item.stock_no || null,
            description: item.description || null,
            unit: item.unit || null,
            quantity_requisition: Number(item.quantity_requisition) || 0,
            quantity_issue: Number(item.quantity_issue) || 0,
            stock_available_yes: item.stock_available_yes || false,
            stock_available_no: item.stock_available_no || false,
            remarks: item.remarks || null
          };

          if (item.id) {
            const existing = db.risItems.find((i: any) => i.id === item.id);
            if (existing) Object.assign(existing, payload);
          } else {
            db.risItems.push({ ...payload, id: getUniqueId() });
          }
        }
        saveDB(db);
      }
      return { data: { message: 'Items updated successfully' } };
    }

    if (url.startsWith('/ris/') && url.endsWith('/assign-ris-no')) {
      const id = Number(url.split('/')[2]);
      const ris = db.risRequests.find((r: any) => r.id === id);
      if (ris) {
        ris.ris_no = data.ris_no;
        saveDB(db);
        return { data: ris };
      }
    }

    if (url.startsWith('/users/') && url.endsWith('/toggle')) {
      const id = Number(url.split('/')[2]);
      const user = db.users.find((u: any) => u.id === id);
      if (user) {
        user.is_active = !user.is_active;
        saveDB(db);
        return { data: user };
      }
    }

    if (url.startsWith('/users/') && !url.endsWith('/toggle')) {
      const id = Number(url.split('/')[2]);
      const user = db.users.find((u: any) => u.id === id);
      if (user) {
        Object.assign(user, data);
        saveDB(db);
        return { data: user };
      }
    }

    return { data: null as any };
  },

  delete: async (url, config) => {
    const db = loadDB();

    if (url.startsWith('/inventory/')) {
      const id = Number(url.split('/').pop());
      db.inventory = db.inventory.filter((i: any) => i.id !== id);
      saveDB(db);
      return { data: { message: 'Deleted' } as any };
    }

    if (url.startsWith('/users/')) {
      const id = Number(url.split('/').pop());
      db.users = db.users.filter((u: any) => u.id !== id);
      saveDB(db);
      return { data: { message: 'Deleted' } as any };
    }

    return { data: null as any };
  }
};

export default mockApi;
