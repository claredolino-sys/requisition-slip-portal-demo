import React, { useState, useEffect } from 'react';
import { AlertTriangle, Download } from 'lucide-react';
import api from '../utils/api';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';

export default function SuperAdminGlobalNotification() {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<any[]>([]);
  const [allRis, setAllRis] = useState<any[]>([]);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    if (user?.role === 'superadmin' && !dismissed) {
      fetchData();
      const interval = setInterval(fetchData, 60000);
      return () => clearInterval(interval);
    }
  }, [user, dismissed]);

  const fetchData = async () => {
    try {
      await api.get('/users/stats'); 
      const [notifRes, risRes] = await Promise.all([
        api.get('/notifications'),
        api.get('/ris')
      ]);
      setNotifications(notifRes.data);
      setAllRis(risRes.data);
    } catch (err) {
      console.error('Failed to fetch notifications', err);
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

  const handleDownloadAllPending = () => {
    const pendingIds = notifications.map(n => n.id.replace('deletion_warning_', ''));
    const pendingRis = allRis.filter(r => pendingIds.includes(String(r.id)));
    
    if (pendingRis.length === 0) {
      toast.error('No matching RIS found for these notifications');
      return;
    }

    toast.success(`Downloading ${pendingRis.length} RIS entries...`);
    pendingRis.forEach((ris, index) => {
      setTimeout(() => handleDownloadRIS(ris), index * 500);
    });
    
    setTimeout(() => setDismissed(true), 1000);
  };

  if (user?.role !== 'superadmin' || notifications.length === 0 || dismissed) return null;

  return (
    <div className="fixed inset-0 bg-[#1A2340] z-[9999] flex flex-col items-center justify-center p-4 sm:p-6 text-center animate-in fade-in duration-500 overflow-y-auto">
      <div className="max-w-3xl w-full my-auto">
        <div className="w-16 h-16 sm:w-20 sm:h-20 bg-orange-500 rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6 shadow-[0_0_30px_rgba(249,115,22,0.6)]">
          <AlertTriangle size={36} className="text-white" />
        </div>
        <h1 className="text-2xl sm:text-3xl md:text-5xl font-black text-white mb-3 sm:mb-4 tracking-tight leading-tight">
          URGENT: 2-DAY RIS RETENTION NOTICE
        </h1>
        <p className="text-sm sm:text-lg text-orange-200 mb-6 sm:mb-8 leading-relaxed max-w-2xl mx-auto">
          The following Requisition and Issue Slips (RIS) are approaching the <strong>48-hour retention deadline</strong>. 
          Please download and archive them to preserve system audit logs.
        </p>
        
        <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 sm:p-6 mb-6 sm:mb-8 max-h-[35vh] overflow-y-auto border border-white/20 shadow-2xl">
          <div className="space-y-3">
            {notifications.map(n => (
              <div key={n.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-3.5 bg-white/5 rounded-xl border border-white/10 text-left gap-2 sm:gap-4 hover:bg-white/10 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-2.5 h-2.5 rounded-full bg-orange-500 shadow-[0_0_10px_rgba(249,115,22,0.8)] animate-pulse flex-shrink-0" />
                  <span className="text-white font-medium text-sm sm:text-base">{n.message}</span>
                </div>
                <span className="text-orange-300 text-xs font-mono bg-orange-500/20 px-2.5 py-0.5 rounded-md self-start sm:self-auto whitespace-nowrap">
                  {new Date(n.createdAt).toLocaleTimeString()}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center items-center">
          <button 
            onClick={handleDownloadAllPending}
            className="w-full sm:w-auto px-6 sm:px-8 py-3.5 sm:py-4 bg-gradient-to-r from-orange-500 to-red-600 text-white rounded-xl font-bold text-sm sm:text-base hover:from-orange-600 hover:to-red-700 transition-all shadow-[0_10px_30px_rgba(249,115,22,0.4)] flex items-center justify-center gap-2"
          >
            <Download size={20} /> <span>DOWNLOAD ALL PENDING RIS</span>
          </button>
          <button 
            onClick={() => setDismissed(true)} 
            className="w-full sm:w-auto px-6 sm:px-8 py-3.5 sm:py-4 bg-white/10 text-white hover:bg-white/20 rounded-xl font-semibold text-sm sm:text-base transition-all border border-white/20"
          >
            I UNDERSTAND, CONTINUE
          </button>
        </div>
      </div>
    </div>
  );
}
