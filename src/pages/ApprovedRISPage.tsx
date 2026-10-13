import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import toast from 'react-hot-toast';
import { Download, Search, CheckCircle, Calendar } from 'lucide-react';

export default function ApprovedRISPage() {
  const [approvedRis, setApprovedRis] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [risSearch, setRisSearch] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const risRes = await api.get('/ris');
      
      // Filter for approved RIS within the last 48 hours (2 days)
      const now = Date.now();
      const twoDaysInMs = 48 * 60 * 60 * 1000;
      
      const filtered = risRes.data.filter((r: any) => {
        if (r.status !== 'approved') return false;
        const createdTime = new Date(r.createdAt).getTime();
        return (now - createdTime) <= twoDaysInMs;
      });

      // Sort by date descending
      filtered.sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      
      setApprovedRis(filtered);
    } catch (err) {
      toast.error('Failed to fetch Approved RIS data');
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadRIS = (ris: any) => {
    toast.success(`Downloading RIS No. ${ris.ris_no || ris.id}...`);
    const data = JSON.stringify(ris, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `RIS_${ris.ris_no || ris.id}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleDownloadAll = () => {
    if (approvedRis.length === 0) return toast.error('No RIS to download');
    toast.success(`Downloading all ${approvedRis.length} Approved RIS entries...`);
    approvedRis.forEach((ris, index) => {
      setTimeout(() => handleDownloadRIS(ris), index * 300);
    });
  };

  const filteredRis = approvedRis.filter(r => 
    r.ris_no?.toLowerCase().includes(risSearch.toLowerCase()) || 
    r.full_name?.toLowerCase().includes(risSearch.toLowerCase()) ||
    r.employee_id?.toLowerCase().includes(risSearch.toLowerCase())
  );

  // Group by date
  const groupedRis = filteredRis.reduce((acc: any, ris: any) => {
    const date = new Date(ris.createdAt).toLocaleDateString();
    if (!acc[date]) acc[date] = [];
    acc[date].push(ris);
    return acc;
  }, {});

  if (loading) return <div className="p-4 sm:p-8 text-gray-500">Loading approved archive...</div>;

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full">
      <div className="mb-6 sm:mb-8">
        <h1 className="text-xl sm:text-2xl font-bold text-[#1A2340]">Approved RIS Archive</h1>
        <p className="text-xs sm:text-sm text-gray-500 mt-1">Review official slips approved within the 48-hour compliance window.</p>
      </div>

      <div className="bg-white rounded-xl shadow-xs border border-gray-200 overflow-hidden">
        <div className="p-3.5 sm:p-4 border-b border-gray-200 bg-gray-50 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
          <div className="flex items-center gap-2 text-emerald-700 font-bold text-sm sm:text-base">
            <CheckCircle size={20} className="flex-shrink-0" />
            <h3>Approved RIS (Last 48 Hours)</h3>
          </div>
          
          <div className="flex flex-col sm:flex-row items-center gap-2.5 w-full sm:w-auto">
            <button 
              onClick={handleDownloadAll}
              className="flex items-center justify-center gap-1.5 px-3.5 py-1.5 bg-emerald-600 text-white rounded-lg text-xs font-semibold hover:bg-emerald-700 transition-colors w-full sm:w-auto shadow-xs"
            >
              <Download size={14} /> <span>Download All</span>
            </button>
            <div className="relative w-full sm:w-60">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={15} />
              <input 
                type="text" 
                placeholder="Search RIS, Name, ID..." 
                className="w-full pl-9 pr-3 py-1.5 border border-gray-300 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
                value={risSearch}
                onChange={(e) => setRisSearch(e.target.value)}
              />
            </div>
          </div>
        </div>

        <div className="p-3.5 sm:p-6">
          {Object.keys(groupedRis).length > 0 ? (
            Object.keys(groupedRis).map(date => (
              <div key={date} className="mb-6 last:mb-0">
                <div className="flex items-center gap-2 mb-3 text-gray-700 font-bold border-b border-gray-200 pb-2 text-xs sm:text-sm">
                  <Calendar size={16} className="text-emerald-600" />
                  <h4>{date}</h4>
                  <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                    {groupedRis[date].length} records
                  </span>
                </div>
                
                <div className="overflow-x-auto border border-gray-100 rounded-lg">
                  <table className="w-full text-left border-collapse min-w-[550px]">
                    <thead>
                      <tr className="border-b border-gray-100 bg-gray-50/60">
                        <th className="p-3 text-xs font-bold text-gray-500 uppercase tracking-wider whitespace-nowrap">RIS No.</th>
                        <th className="p-3 text-xs font-bold text-gray-500 uppercase tracking-wider whitespace-nowrap">Employee</th>
                        <th className="p-3 text-xs font-bold text-gray-500 uppercase tracking-wider whitespace-nowrap">Approval Time</th>
                        <th className="p-3 text-xs font-bold text-gray-500 uppercase tracking-wider text-right whitespace-nowrap">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {groupedRis[date].map((ris: any) => (
                        <tr key={ris.id} className="hover:bg-emerald-50/20 transition-colors">
                          <td className="p-3 font-mono font-medium text-gray-900 text-xs sm:text-sm whitespace-nowrap">{ris.ris_no || `RIS-${ris.id}`}</td>
                          <td className="p-3 whitespace-nowrap">
                            <div className="text-xs sm:text-sm font-semibold text-gray-900">{ris.full_name}</div>
                            <div className="text-[11px] text-gray-500 font-mono">{ris.employee_id}</div>
                          </td>
                          <td className="p-3 text-xs text-gray-600 whitespace-nowrap">
                            {new Date(ris.createdAt).toLocaleTimeString()}
                          </td>
                          <td className="p-3 text-right whitespace-nowrap">
                            <button 
                              onClick={() => handleDownloadRIS(ris)}
                              className="px-2.5 py-1 text-emerald-700 hover:bg-emerald-50 rounded-lg transition-colors inline-flex items-center gap-1 text-xs font-bold"
                              title="Download JSON record"
                            >
                              <Download size={14} />
                              <span>Download</span>
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-12 text-gray-500">
              <CheckCircle size={40} className="mx-auto text-gray-300 mb-2" />
              <p className="text-sm font-medium">No approved RIS records in the active 48-hour window.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
