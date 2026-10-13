import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';
import { Inbox, Package, CheckCircle, Clock, TrendingUp, TrendingDown, FileText } from 'lucide-react';

export default function AdminDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    pendingRis: 0,
    approvedRis: 0,
    totalInventory: 0,
    lowStock: 0
  });

  const [analytics, setAnalytics] = useState({
    mostRequested: [] as any[],
    leastRequested: [] as any[]
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [risRes, invRes, allRisRes] = await Promise.all([
          api.get('/ris/inbox'),
          api.get('/inventory'),
          api.get('/ris')
        ]);

        const ris = risRes.data;
        const inventory = invRes.data;
        const allRis = allRisRes.data;

        setStats({
          pendingRis: ris.filter((r: any) => r.status === 'pending' || r.status === 'sent').length,
          approvedRis: ris.filter((r: any) => r.status === 'approved').length,
          totalInventory: inventory.length,
          lowStock: inventory.filter((i: any) => i.quantity < 10).length
        });

        // Calculate Analytics (Filtered by Current Month)
        const currentMonth = new Date().getMonth();
        const currentYear = new Date().getFullYear();

        const itemRequestCounts: Record<number, { count: number, totalQty: number, name: string, stock_no: string, remaining: number }> = {};
        
        inventory.forEach((item: any) => {
          itemRequestCounts[item.id] = {
            count: 0,
            totalQty: 0,
            name: item.description,
            stock_no: item.stock_no,
            remaining: item.quantity
          };
        });

        allRis.forEach((r: any) => {
          const risDate = new Date(r.created_at || r.date || r.createdAt);
          const isCurrentMonth = risDate.getMonth() === currentMonth && risDate.getFullYear() === currentYear;

          if (r.status !== 'draft' && r.items && isCurrentMonth) {
            r.items.forEach((reqItem: any) => {
              if (reqItem.inventory_id && itemRequestCounts[reqItem.inventory_id]) {
                itemRequestCounts[reqItem.inventory_id].count += 1;
                itemRequestCounts[reqItem.inventory_id].totalQty += Number(reqItem.quantity_requisition) || 0;
              }
            });
          }
        });

        const analyticsArray = Object.values(itemRequestCounts);
        
        // Sort by total quantity requested (descending) for most requested
        const mostRequested = [...analyticsArray].sort((a, b) => b.totalQty - a.totalQty).slice(0, 10);
        
        // Sort by total quantity requested (ascending) for least requested / leftovers
        const leastRequested = [...analyticsArray].sort((a, b) => a.totalQty - b.totalQty).slice(0, 10);

        setAnalytics({
          mostRequested,
          leastRequested
        });

      } catch (error) {
        console.error('Failed to fetch stats', error);
      }
    };

    fetchStats();
  }, []);

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full">
      <div className="mb-6 sm:mb-8">
        <h1 className="text-xl sm:text-2xl font-bold text-[#1A2340]">Admin Dashboard</h1>
        <p className="text-xs sm:text-sm text-gray-500 mt-1">Welcome back, {user?.full_name}</p>
      </div>
      
      {/* 4 Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8">
        <div className="bg-white p-5 sm:p-6 rounded-xl shadow-xs border border-gray-200 flex items-center gap-4 hover:border-blue-300 transition-colors">
          <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center flex-shrink-0">
            <Clock size={24} />
          </div>
          <div>
            <p className="text-xs sm:text-sm text-gray-500 font-medium">Pending RIS</p>
            <p className="text-xl sm:text-2xl font-bold text-gray-900">{stats.pendingRis}</p>
          </div>
        </div>

        <div className="bg-white p-5 sm:p-6 rounded-xl shadow-xs border border-gray-200 flex items-center gap-4 hover:border-green-300 transition-colors">
          <div className="w-12 h-12 bg-green-50 text-green-600 rounded-xl flex items-center justify-center flex-shrink-0">
            <CheckCircle size={24} />
          </div>
          <div>
            <p className="text-xs sm:text-sm text-gray-500 font-medium">Approved RIS</p>
            <p className="text-xl sm:text-2xl font-bold text-gray-900">{stats.approvedRis}</p>
          </div>
        </div>

        <div className="bg-white p-5 sm:p-6 rounded-xl shadow-xs border border-gray-200 flex items-center gap-4 hover:border-purple-300 transition-colors">
          <div className="w-12 h-12 bg-purple-50 text-purple-600 rounded-xl flex items-center justify-center flex-shrink-0">
            <Package size={24} />
          </div>
          <div>
            <p className="text-xs sm:text-sm text-gray-500 font-medium">Total Items</p>
            <p className="text-xl sm:text-2xl font-bold text-gray-900">{stats.totalInventory}</p>
          </div>
        </div>

        <div className="bg-white p-5 sm:p-6 rounded-xl shadow-xs border border-gray-200 flex items-center gap-4 hover:border-red-300 transition-colors">
          <div className="w-12 h-12 bg-red-50 text-red-600 rounded-xl flex items-center justify-center flex-shrink-0">
            <Inbox size={24} />
          </div>
          <div>
            <p className="text-xs sm:text-sm text-gray-500 font-medium">Low Stock Items</p>
            <p className="text-xl sm:text-2xl font-bold text-gray-900">{stats.lowStock}</p>
          </div>
        </div>
      </div>

      {/* Analytics Section: Most vs Least Requested */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="bg-white rounded-xl shadow-xs border border-gray-200 p-5 sm:p-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
            <div className="flex items-center gap-2">
              <TrendingUp className="text-orange-500 flex-shrink-0" size={20} />
              <h2 className="text-base sm:text-lg font-bold text-gray-800">Most Requested Items</h2>
            </div>
            <button 
              onClick={() => navigate('/reports')}
              className="flex items-center gap-1 text-xs font-semibold text-blue-600 hover:text-blue-800 transition-colors self-start sm:self-auto"
            >
              <FileText size={14} />
              <span>Full Monthly Report</span>
            </button>
          </div>
          <p className="text-xs text-gray-500 mb-4">Top 10 items frequently requisitioned this current month.</p>
          
          <div className="space-y-3">
            {analytics.mostRequested.length > 0 ? analytics.mostRequested.map((item, idx) => (
              <div key={idx} className="flex items-center justify-between border-b border-gray-100 pb-2.5 last:border-0 last:pb-0 gap-3">
                <div className="min-w-0 flex-1">
                  <p className="font-semibold text-gray-800 text-xs sm:text-sm truncate">{item.name}</p>
                  <p className="text-[11px] text-gray-400 font-mono">{item.stock_no}</p>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="text-xs sm:text-sm font-bold text-orange-600">{item.totalQty} requested</p>
                  <p className="text-[11px] text-gray-500">{item.remaining} in stock</p>
                </div>
              </div>
            )) : (
              <p className="text-xs sm:text-sm text-gray-500 italic py-4">No requisition requests recorded for this month.</p>
            )}
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-xs border border-gray-200 p-5 sm:p-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
            <div className="flex items-center gap-2">
              <TrendingDown className="text-blue-500 flex-shrink-0" size={20} />
              <h2 className="text-base sm:text-lg font-bold text-gray-800">Least Requested Items</h2>
            </div>
            <button 
              onClick={() => navigate('/reports')}
              className="flex items-center gap-1 text-xs font-semibold text-blue-600 hover:text-blue-800 transition-colors self-start sm:self-auto"
            >
              <FileText size={14} />
              <span>Full Monthly Report</span>
            </button>
          </div>
          <p className="text-xs text-gray-500 mb-4">Top 10 items rarely requisitioned or remaining in excess.</p>
          
          <div className="space-y-3">
            {analytics.leastRequested.length > 0 ? analytics.leastRequested.map((item, idx) => (
              <div key={idx} className="flex items-center justify-between border-b border-gray-100 pb-2.5 last:border-0 last:pb-0 gap-3">
                <div className="min-w-0 flex-1">
                  <p className="font-semibold text-gray-800 text-xs sm:text-sm truncate">{item.name}</p>
                  <p className="text-[11px] text-gray-400 font-mono">{item.stock_no}</p>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="text-xs sm:text-sm font-bold text-blue-600">{item.totalQty} requested</p>
                  <p className="text-[11px] text-gray-500">{item.remaining} in stock</p>
                </div>
              </div>
            )) : (
              <p className="text-xs sm:text-sm text-gray-500 italic py-4">No data recorded for this month.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
