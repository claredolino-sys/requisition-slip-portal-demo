import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';
import toast from 'react-hot-toast';
import { Search, ChevronRight, FileText, Package, ArrowRight, LogIn } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { getItemIcon } from '../utils/itemIcons';

export default function GuestDashboard() {
  const navigate = useNavigate();
  const { user, updateUser } = useAuth();
  const [inventory, setInventory] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');
  
  // Mobile / Tablet Tab View: 'form' or 'inventory'
  const [activeTab, setActiveTab] = useState<'form' | 'inventory'>('form');

  const [formData, setFormData] = useState({
    entity_name: '',
    fund_cluster: '',
    division: '',
    office: '',
    responsibility_center_code: '',
    purpose: '',
    requested_by_name: '',
    requested_by_designation: '',
    approved_by_name: '',
    approved_by_designation: '',
    issued_by_name: '',
    issued_by_designation: '',
    received_by_name: '',
    received_by_designation: '',
    requested_by_date: '',
    approved_by_date: '',
    issued_by_date: '',
    received_by_date: '',
  });

  const [items, setItems] = useState<any[]>([
    { stock_no: '', unit: '', description: '', quantity_requisition: '', stock_available_yes: false, stock_available_no: false, quantity_issue: '', remarks: '' }
  ]);
  const [isInventoryCollapsed, setIsInventoryCollapsed] = useState(false);

  useEffect(() => {
    api.get('/inventory').then(res => setInventory(res.data));
    
    let initialFormData = { ...formData };

    const saved = localStorage.getItem('draft_ris');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.formData) initialFormData = { ...initialFormData, ...parsed.formData };
        if (parsed.items) setItems(parsed.items);
      } catch (e) {}
    }

    // Pre-fill from user profile if logged in (overrides draft if user is logged in)
    if (user) {
      initialFormData = {
        ...initialFormData,
        entity_name: user.entity_name || initialFormData.entity_name,
        fund_cluster: user.fund_cluster || initialFormData.fund_cluster,
        division: user.division || initialFormData.division,
        office: user.office || initialFormData.office,
        responsibility_center_code: user.responsibility_center_code || initialFormData.responsibility_center_code,
        requested_by_name: user.full_name || initialFormData.requested_by_name,
        requested_by_designation: user.designation || initialFormData.requested_by_designation,
      };
    }

    setFormData(initialFormData);
  }, [user]);

  useEffect(() => {
    const timer = setTimeout(() => {
      localStorage.setItem('draft_ris', JSON.stringify({ formData, items }));
    }, 1000);
    return () => clearTimeout(timer);
  }, [formData, items]);

  const handleItemSelect = (index: number, invItem: any) => {
    const newItems = [...items];
    newItems[index] = {
      ...newItems[index],
      inventory_id: invItem.id,
      stock_no: invItem.stock_no,
      unit: invItem.unit,
      description: invItem.description,
    };
    if (index === items.length - 1) {
      newItems.push({ stock_no: '', unit: '', description: '', quantity_requisition: '', stock_available_yes: false, stock_available_no: false, quantity_issue: '', remarks: '' });
    }
    setItems(newItems);
  };

  const handleSave = async () => {
    try {
      if (user) {
        // If logged in, update user profile with these details
        const profileData = {
          entity_name: formData.entity_name,
          fund_cluster: formData.fund_cluster,
          division: formData.division,
          office: formData.office,
          responsibility_center_code: formData.responsibility_center_code,
          full_name: formData.requested_by_name,
          designation: formData.requested_by_designation,
        };
        await api.post('/auth/profile', profileData);
        updateUser(profileData);

        // Create a real RIS directly
        await api.post('/ris', { ...formData, items });
        toast.success('RIS created successfully!');
        localStorage.removeItem('draft_ris');
        navigate('/dashboard');
      } else {
        // Guest mode
        const res = await api.post('/ris/guest', { formData, items });
        localStorage.setItem('pending_ris_id', res.data.id);
        toast.success('RIS saved! Please sign in to claim and submit.');
        navigate('/login');
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to save RIS');
    }
  };

  const filteredInventory = inventory.filter(item => {
    if (filter === 'available' && !item.is_available) return false;
    if (filter === 'out' && item.is_available) return false;
    if (search && !item.description.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  return (
    <div className={`flex flex-col h-full overflow-hidden relative ${user ? 'bg-white' : 'bg-gray-100 w-screen h-screen'}`}>
      
      {/* Top Navbar for Public / Guest Visitors (Mobile devices) */}
      {!user && (
        <header className="flex md:hidden bg-[#1A2340] text-white px-4 py-3 items-center justify-between z-30 flex-shrink-0 shadow-sm border-b border-white/10">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center font-bold text-sm shadow-xs flex-shrink-0">
              RIS
            </div>
            <div>
              <span className="font-bold text-sm block tracking-wide">RIS Portal</span>
              <span className="text-[10px] text-white/50 block">Appendix 63 Requisition System</span>
            </div>
          </div>
        </header>
      )}

      {/* Mobile / Tablet Segmented Control (Tabs) */}
      <div className="lg:hidden flex border-b border-gray-200 bg-white sticky top-0 z-20 px-3 py-2 gap-2 shadow-xs flex-shrink-0">
        <button
          type="button"
          onClick={() => setActiveTab('form')}
          className={`flex-1 py-2 px-3 text-xs sm:text-sm font-semibold rounded-lg flex items-center justify-center gap-1.5 transition-all ${
            activeTab === 'form' 
              ? 'bg-blue-600 text-white shadow-xs' 
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          <FileText size={16} />
          <span>Appendix 63 Slip</span>
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('inventory')}
          className={`flex-1 py-2 px-3 text-xs sm:text-sm font-semibold rounded-lg flex items-center justify-center gap-1.5 transition-all ${
            activeTab === 'inventory' 
              ? 'bg-blue-600 text-white shadow-xs' 
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          <Package size={16} />
          <span>Browse Inventory</span>
          <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold ml-1 ${
            activeTab === 'inventory' ? 'bg-white/20 text-white' : 'bg-blue-100 text-blue-700'
          }`}>
            {inventory.length}
          </span>
        </button>
      </div>

      {/* Main Content Area (Split on Desktop, Tabbed on Mobile/Tablet) */}
      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden relative">

        {/* Left Panel - RIS Form */}
        <div 
          className={`
            h-full overflow-y-auto p-4 sm:p-6 lg:p-8 border-r border-gray-200 bg-white transition-all duration-300 w-full
            ${activeTab === 'form' ? 'block' : 'hidden lg:block'}
            ${isInventoryCollapsed ? 'lg:w-full' : 'lg:w-1/2'}
          `}
        >
          <div className="max-w-4xl mx-auto" style={{ fontFamily: '"Times New Roman", Times, serif' }}>
            
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 mb-4 font-sans">
              <span className="text-xl sm:text-2xl font-bold italic font-serif">Appendix 63</span>
              
              {/* Quick switch to inventory button for mobile/tablet users */}
              <button
                type="button"
                onClick={() => setActiveTab('inventory')}
                className="lg:hidden inline-flex items-center gap-1.5 text-xs bg-blue-50 text-blue-700 hover:bg-blue-100 px-3 py-1.5 rounded-lg font-semibold border border-blue-200 transition-colors"
              >
                <Package size={14} />
                <span>Select Items from Catalog</span>
                <ArrowRight size={14} />
              </button>
            </div>

            <h1 className="text-center text-lg sm:text-xl font-bold mb-6 uppercase tracking-wide">
              REQUISITION AND ISSUE SLIP
            </h1>
            
            {/* Header Metadata Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4 mb-6 text-sm">
              <div className="space-y-2">
                <div className="flex items-baseline border-b border-black pb-0.5">
                  <span className="w-28 sm:w-36 font-semibold flex-shrink-0">Entity Name:</span>
                  <input 
                    className="flex-1 outline-none text-sm min-w-0" 
                    value={formData.entity_name} 
                    onChange={e => setFormData({...formData, entity_name: e.target.value})} 
                    placeholder="Enter entity name"
                  />
                </div>
                <div className="flex items-baseline border-b border-black pb-0.5">
                  <span className="w-28 sm:w-36 font-semibold flex-shrink-0">Division:</span>
                  <input 
                    className="flex-1 outline-none text-sm min-w-0" 
                    value={formData.division} 
                    onChange={e => setFormData({...formData, division: e.target.value})} 
                    placeholder="Enter division"
                  />
                </div>
                <div className="flex items-baseline border-b border-black pb-0.5">
                  <span className="w-28 sm:w-36 font-semibold flex-shrink-0">Office:</span>
                  <input 
                    className="flex-1 outline-none text-sm min-w-0" 
                    value={formData.office} 
                    onChange={e => setFormData({...formData, office: e.target.value})} 
                    placeholder="Enter office"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-baseline border-b border-black pb-0.5">
                  <span className="w-36 sm:w-48 font-semibold flex-shrink-0">Fund Cluster:</span>
                  <input 
                    className="flex-1 outline-none text-sm min-w-0" 
                    value={formData.fund_cluster} 
                    onChange={e => setFormData({...formData, fund_cluster: e.target.value})} 
                    placeholder="Enter fund cluster"
                  />
                </div>
                <div className="flex items-baseline border-b border-black pb-0.5">
                  <span className="w-36 sm:w-48 font-semibold flex-shrink-0">Responsibility Center:</span>
                  <input 
                    className="flex-1 outline-none text-sm min-w-0" 
                    value={formData.responsibility_center_code} 
                    onChange={e => setFormData({...formData, responsibility_center_code: e.target.value})} 
                    placeholder="Code"
                  />
                </div>
                <div className="flex items-baseline border-b border-black pb-0.5">
                  <span className="w-36 sm:w-48 font-semibold flex-shrink-0">RIS No.:</span>
                  <span className="flex-1 text-gray-400 italic text-sm">Pending Admin Assignment</span>
                </div>
              </div>
            </div>

            {/* Scrollable Items Table Container */}
            <div className="mb-2 flex items-center justify-between text-xs text-gray-500 font-sans lg:hidden">
              <span>Swipe table horizontally to see all columns</span>
              <span className="text-[11px] font-medium text-blue-600">8 columns</span>
            </div>

            <div className="overflow-x-auto -mx-1 sm:mx-0 pb-2 mb-6 border border-black/20 rounded-xs">
              <table className="w-full min-w-[700px] border-collapse border border-black text-xs sm:text-sm">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="border border-black p-2 font-bold" colSpan={4}>Requisition</th>
                    <th className="border border-black p-2 font-bold" colSpan={2}>Stock Available?</th>
                    <th className="border border-black p-2 font-bold" colSpan={2}>Issue</th>
                  </tr>
                  <tr className="bg-gray-100/70">
                    <th className="border border-black p-1 w-20">Stock No.</th>
                    <th className="border border-black p-1 w-16">Unit</th>
                    <th className="border border-black p-1">Description</th>
                    <th className="border border-black p-1 w-16">Quantity</th>
                    <th className="border border-black p-1 w-12">Yes</th>
                    <th className="border border-black p-1 w-12">No</th>
                    <th className="border border-black p-1 w-16">Quantity</th>
                    <th className="border border-black p-1 w-24">Remarks</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((item, idx) => (
                    <tr key={idx} className="hover:bg-blue-50/20">
                      <td className="border border-black p-1">
                        <input className="w-full outline-none bg-transparent text-center font-mono text-xs" readOnly value={item.stock_no} placeholder="Auto" />
                      </td>
                      <td className="border border-black p-1">
                        <input className="w-full outline-none bg-transparent text-center text-xs" readOnly value={item.unit} placeholder="Unit" />
                      </td>
                      <td className="border border-black p-1">
                        <select 
                          className="w-full outline-none bg-transparent text-xs sm:text-sm py-0.5 cursor-pointer"
                          value={item.description}
                          onChange={(e) => {
                            const invItem = inventory.find(i => i.description === e.target.value);
                            if (invItem) {
                              handleItemSelect(idx, invItem);
                            } else {
                              const newItems = [...items];
                              newItems[idx] = { stock_no: '', unit: '', description: '', quantity_requisition: '', stock_available_yes: false, stock_available_no: false, quantity_issue: '', remarks: '' };
                              setItems(newItems);
                            }
                          }}
                        >
                          <option value="">Select Item from Catalog...</option>
                          {inventory.map(inv => (
                            <option key={inv.id} value={inv.description}>
                              {inv.description} ({inv.quantity} {inv.unit} in stock)
                            </option>
                          ))}
                        </select>
                      </td>
                      <td className="border border-black p-1">
                        <input 
                          type="number" 
                          min="1"
                          placeholder="0"
                          className="w-full outline-none bg-transparent text-center font-semibold text-xs sm:text-sm" 
                          value={item.quantity_requisition} 
                          onChange={e => { 
                            const newItems = [...items]; 
                            const reqQty = Number(e.target.value);
                            newItems[idx].quantity_requisition = e.target.value; 
                            
                            // Automatically track stock availability
                            if (item.inventory_id) {
                              const invItem = inventory.find(i => i.id === item.inventory_id);
                              if (invItem) {
                                if (reqQty > 0 && reqQty <= invItem.quantity) {
                                  newItems[idx].stock_available_yes = true;
                                  newItems[idx].stock_available_no = false;
                                  newItems[idx].quantity_issue = e.target.value;
                                } else if (reqQty > invItem.quantity) {
                                  newItems[idx].stock_available_yes = false;
                                  newItems[idx].stock_available_no = true;
                                  newItems[idx].quantity_issue = invItem.quantity > 0 ? String(invItem.quantity) : '';
                                } else {
                                  newItems[idx].stock_available_yes = false;
                                  newItems[idx].stock_available_no = false;
                                  newItems[idx].quantity_issue = '';
                                }
                              }
                            }
                            
                            setItems(newItems); 
                          }} 
                        />
                      </td>
                      <td className="border border-black p-1 text-center">
                        <input type="checkbox" checked={item.stock_available_yes} disabled className="cursor-not-allowed opacity-60" />
                      </td>
                      <td className="border border-black p-1 text-center">
                        <input type="checkbox" checked={item.stock_available_no} disabled className="cursor-not-allowed opacity-60" />
                      </td>
                      <td className="border border-black p-1">
                        <input type="number" className="w-full outline-none bg-transparent text-center cursor-not-allowed opacity-60 text-xs sm:text-sm" value={item.quantity_issue} disabled />
                      </td>
                      <td className="border border-black p-1">
                        <input className="w-full outline-none bg-transparent cursor-not-allowed opacity-60 text-xs" value={item.remarks} disabled placeholder="Pending" />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Purpose Box */}
            <div className="border border-black p-3 mb-6 min-h-[70px]">
              <span className="font-bold text-sm block mb-1">Purpose:</span>
              <textarea 
                className="w-full outline-none resize-none text-sm placeholder:italic" 
                rows={2} 
                placeholder="State the explicit purpose for requesting the listed supplies/equipment..."
                value={formData.purpose} 
                onChange={e => setFormData({...formData, purpose: e.target.value})} 
              />
            </div>

            {/* Scrollable Signatures Container */}
            <div className="mb-2 flex items-center justify-between text-xs text-gray-500 font-sans lg:hidden">
              <span>Swipe signature table horizontally</span>
              <span className="text-[11px] font-medium text-blue-600">4 signatories</span>
            </div>

            <div className="overflow-x-auto -mx-1 sm:mx-0 pb-2 mb-8 border border-black/20 rounded-xs">
              <table className="w-full min-w-[580px] border-collapse border border-black text-xs sm:text-sm text-center">
                <tbody>
                  <tr className="bg-gray-50">
                    <td className="border border-black p-2 w-28 text-left font-semibold">Signature:</td>
                    <td className="border border-black p-2 font-semibold">Requested by:</td>
                    <td className="border border-black p-2 font-semibold">Approved by:</td>
                    <td className="border border-black p-2 font-semibold">Issued by:</td>
                    <td className="border border-black p-2 font-semibold">Received by:</td>
                  </tr>
                  <tr>
                    <td className="border border-black p-2 text-left font-semibold">Printed Name:</td>
                    <td className="border border-black p-1.5">
                      <input className="w-full outline-none text-center" value={formData.requested_by_name} onChange={e => setFormData({...formData, requested_by_name: e.target.value})} placeholder="Full Name" />
                    </td>
                    <td className="border border-black p-1.5">
                      <input className="w-full outline-none text-center" value={formData.approved_by_name} onChange={e => setFormData({...formData, approved_by_name: e.target.value})} placeholder="Admin / Head" />
                    </td>
                    <td className="border border-black p-1.5">
                      <input className="w-full outline-none text-center" value={formData.issued_by_name} onChange={e => setFormData({...formData, issued_by_name: e.target.value})} placeholder="Custodian" />
                    </td>
                    <td className="border border-black p-1.5">
                      <input className="w-full outline-none text-center" value={formData.received_by_name} onChange={e => setFormData({...formData, received_by_name: e.target.value})} placeholder="Receiver" />
                    </td>
                  </tr>
                  <tr>
                    <td className="border border-black p-2 text-left font-semibold">Designation:</td>
                    <td className="border border-black p-1.5">
                      <input className="w-full outline-none text-center" value={formData.requested_by_designation} onChange={e => setFormData({...formData, requested_by_designation: e.target.value})} placeholder="Position" />
                    </td>
                    <td className="border border-black p-1.5">
                      <input className="w-full outline-none text-center" value={formData.approved_by_designation} onChange={e => setFormData({...formData, approved_by_designation: e.target.value})} placeholder="Officer" />
                    </td>
                    <td className="border border-black p-1.5">
                      <input className="w-full outline-none text-center" value={formData.issued_by_designation} onChange={e => setFormData({...formData, issued_by_designation: e.target.value})} placeholder="Supply Officer" />
                    </td>
                    <td className="border border-black p-1.5">
                      <input className="w-full outline-none text-center" value={formData.received_by_designation} onChange={e => setFormData({...formData, received_by_designation: e.target.value})} placeholder="Position" />
                    </td>
                  </tr>
                  <tr>
                    <td className="border border-black p-2 text-left font-semibold">Date:</td>
                    <td className="border border-black p-1.5">
                      <input type="date" className="w-full outline-none text-center text-xs" value={formData.requested_by_date} onChange={e => setFormData({...formData, requested_by_date: e.target.value})} />
                    </td>
                    <td className="border border-black p-1.5">
                      <input type="date" className="w-full outline-none text-center text-xs" value={formData.approved_by_date} onChange={e => setFormData({...formData, approved_by_date: e.target.value})} />
                    </td>
                    <td className="border border-black p-1.5">
                      <input type="date" className="w-full outline-none text-center text-xs" value={formData.issued_by_date} onChange={e => setFormData({...formData, issued_by_date: e.target.value})} />
                    </td>
                    <td className="border border-black p-1.5">
                      <input type="date" className="w-full outline-none text-center text-xs" value={formData.received_by_date} onChange={e => setFormData({...formData, received_by_date: e.target.value})} />
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Bottom Submission Action */}
            <div className="flex flex-col sm:flex-row justify-between items-center gap-3 font-sans pt-2 pb-6">
              <span className="text-xs text-gray-500 italic text-center sm:text-left">
                Draft auto-saves continuously to local session
              </span>
              <button 
                type="button"
                onClick={handleSave} 
                className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white px-8 py-2.5 rounded-lg font-semibold shadow-sm transition-colors text-sm"
              >
                {user ? 'Submit RIS to Admin' : 'Save RIS & Sign In to Claim'}
              </button>
            </div>
          </div>
        </div>

        {/* Desktop Split View Collapse Toggle Button */}
        <button 
          onClick={() => setIsInventoryCollapsed(!isInventoryCollapsed)}
          className={`hidden lg:flex absolute top-1/2 -translate-y-1/2 bg-white border border-gray-200 rounded-full p-2 shadow-lg z-20 hover:bg-gray-50 transition-all ${
            isInventoryCollapsed ? 'right-4 rotate-180' : 'right-1/2 translate-x-1/2'
          }`}
          title={isInventoryCollapsed ? "Expand Inventory Browser" : "Collapse Inventory Browser"}
        >
          <ChevronRight size={18} className="text-gray-700" />
        </button>

        {/* Right Panel - Inventory Browser */}
        <div 
          className={`
            h-full flex flex-col bg-gray-50 transition-all duration-300 relative w-full
            ${activeTab === 'inventory' ? 'flex' : 'hidden lg:flex'}
            ${isInventoryCollapsed ? 'lg:w-0 lg:overflow-hidden' : 'lg:w-1/2'}
          `}
        >
          {/* Inventory Search & Filters */}
          <div className="p-4 sm:p-6 border-b border-gray-200 bg-white">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h2 className="text-lg sm:text-xl font-bold text-gray-800">Inventory Catalog</h2>
                <p className="text-xs text-gray-500">Tap an item to automatically add it to your slip</p>
              </div>
            </div>

            <div className="relative mb-3">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input 
                type="text" 
                placeholder="Search items by name or stock number..." 
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </div>

            <div className="flex gap-2 overflow-x-auto pb-1">
              {['all', 'available', 'out'].map(f => (
                <button 
                  key={f}
                  onClick={() => setFilter(f)}
                  className={`px-3 py-1 sm:px-4 sm:py-1.5 rounded-full text-xs font-semibold capitalize whitespace-nowrap transition-colors ${
                    filter === f 
                      ? 'bg-blue-100 text-blue-700 ring-1 ring-blue-300' 
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {f === 'all' ? 'All Items' : f === 'available' ? 'Available' : 'Out of Stock'}
                </button>
              ))}
            </div>
          </div>

          {/* Item Cards List */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              {filteredInventory.map(item => (
                <div 
                  key={item.id} 
                  className="bg-white border border-gray-200 rounded-xl p-3.5 sm:p-4 cursor-pointer hover:border-blue-400 hover:shadow-md transition-all active:scale-[0.98] group"
                  onClick={() => {
                    const emptyIdx = items.findIndex(i => !i.description);
                    handleItemSelect(emptyIdx >= 0 ? emptyIdx : items.length - 1, item);
                    toast.success(`Selected: ${item.description}`);
                    if (window.innerWidth < 1024) {
                      setActiveTab('form');
                    }
                  }}
                >
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-[11px] font-mono font-medium text-gray-500">{item.stock_no}</span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                      item.is_available ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                    }`}>
                      {item.is_available ? 'In Stock' : 'Out of Stock'}
                    </span>
                  </div>

                  <div className="flex items-center gap-3 mb-2.5">
                    <div className="p-2 bg-gray-50 rounded-lg group-hover:bg-blue-50 transition-colors flex-shrink-0">
                      {getItemIcon(item.description, 24)}
                    </div>
                    <h3 className="font-semibold text-gray-800 text-sm leading-snug line-clamp-2">
                      {item.description}
                    </h3>
                  </div>

                  <div className="flex justify-between items-center text-xs text-gray-500 pt-1 border-t border-gray-100">
                    <span className="truncate max-w-[110px]">{item.category}</span>
                    <span className="font-semibold text-gray-700">
                      Qty: {item.quantity} {item.unit}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {filteredInventory.length === 0 && (
              <div className="text-center py-12 text-gray-500">
                <Package size={36} className="mx-auto text-gray-300 mb-2" />
                <p className="text-sm font-medium">No items found matching "{search}"</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
