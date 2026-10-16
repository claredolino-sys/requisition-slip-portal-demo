import { useState, useEffect } from 'react';
import { AlertTriangle, Download } from 'lucide-react';
import api from '../../services/api';
import toast from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';

export function SuperAdminGlobalNotification() {
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
  };

  if (!notifications.length || dismissed || user?.role !== 'superadmin') {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 max-w-md bg-amber-50 border border-amber-200 rounded-xl p-4 shadow-xl z-50 animate-bounce-short">
      <div className="flex items-start gap-3">
        <div className="p-2 bg-amber-100 rounded-lg text-amber-600 flex-shrink-0">
          <AlertTriangle size={20} />
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="text-sm font-bold text-amber-900 mb-1">
            Pending Deletion Warnings ({notifications.length})
          </h4>
          <p className="text-xs text-amber-800 leading-relaxed mb-3">
            Some records have been marked for archival or removal according to retention policies. Download copies before cleanup executes.
          </p>
          <div className="flex items-center gap-2">
            <button
              onClick={handleDownloadAllPending}
              className="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 shadow-xs transition-colors"
            >
              <Download size={14} />
              <span>Download Backups</span>
            </button>
            <button
              onClick={() => setDismissed(true)}
              className="px-3 py-1.5 bg-white border border-amber-300 hover:bg-amber-100 text-amber-900 rounded-lg text-xs font-semibold transition-colors"
            >
              Dismiss
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SuperAdminGlobalNotification;
