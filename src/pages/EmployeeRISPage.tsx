import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';
import toast from 'react-hot-toast';
import { exportRIStoPDF } from '../utils/pdf';
import { Download, Send, Printer, Eye, Edit, X } from 'lucide-react';
import { ConfirmModal } from '../components/ConfirmModal';

export default function EmployeeRISPage() {
  const navigate = useNavigate();
  const [records, setRecords] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [viewingRis, setViewingRis] = useState<any>(null);
  const [confirmSendRis, setConfirmSendRis] = useState<any>(null);

  useEffect(() => {
    fetchRecords();
  }, []);

  const fetchRecords = async () => {
    try {
      const res = await api.get('/ris/my');
      setRecords(res.data);
    } catch (err) {
      toast.error('Failed to fetch records');
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadAndSend = async (ris: any) => {
    setConfirmSendRis(ris);
  };

  const proceedWithSend = async () => {
    if (!confirmSendRis) return;
    const ris = confirmSendRis;
    try {
      await api.put(`/ris/${ris.id}/send`);
      toast.success('RIS sent to Admin successfully');
      
      handleViewRis(ris.id, true);
      fetchRecords();
    } catch (err) {
      toast.error('Failed to process request');
    } finally {
      setConfirmSendRis(null);
    }
  };

  const handleViewRis = async (id: number, print = false) => {
    try {
      const res = await api.get(`/ris/${id}`);
      setViewingRis(res.data);
      if (print) {
        setTimeout(() => {
          window.print();
        }, 100);
      }
    } catch (err) {
      toast.error('Failed to fetch RIS details');
    }
  };

  const handlePrint = () => {
    window.print();
  };

  if (loading) return <div className="p-4 sm:p-8 text-gray-500">Loading your records...</div>;

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6 sm:mb-8 print:hidden">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-[#1A2340]">My RIS Records</h1>
          <p className="text-xs sm:text-sm text-gray-500 mt-1">Manage and track your Requisition and Issue Slips</p>
        </div>
        <button 
          onClick={() => navigate('/new-ris')}
          className="bg-blue-600 text-white px-4 py-2.5 rounded-lg font-semibold hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 text-sm shadow-xs w-full sm:w-auto"
        >
          <Edit size={16} />
          Create New RIS
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden print:hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[620px]">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="p-3.5 sm:p-4 text-xs font-bold text-gray-500 uppercase tracking-wider">RIS No.</th>
                <th className="p-3.5 sm:p-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Date</th>
                <th className="p-3.5 sm:p-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Purpose</th>
                <th className="p-3.5 sm:p-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Status</th>
                <th className="p-3.5 sm:p-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {records.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-gray-500 text-sm">
                    No RIS records created yet. Click "Create New RIS" to draft your first slip.
                  </td>
                </tr>
              ) : records.map(ris => (
                <tr key={ris.id} className="hover:bg-gray-50 transition-colors">
                  <td className="p-3.5 sm:p-4 font-mono font-medium text-gray-900 text-xs sm:text-sm">
                    {ris.ris_no || <span className="text-gray-400 italic">Pending</span>}
                  </td>
                  <td className="p-3.5 sm:p-4 text-xs sm:text-sm text-gray-600">
                    {new Date(ris.createdAt).toLocaleDateString()}
                  </td>
                  <td className="p-3.5 sm:p-4 text-xs sm:text-sm text-gray-600 max-w-xs truncate">
                    {ris.purpose || '-'}
                  </td>
                  <td className="p-3.5 sm:p-4">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize whitespace-nowrap
                      ${ris.status === 'draft' ? 'bg-gray-100 text-gray-800' : 
                        ris.status === 'sent' ? 'bg-blue-100 text-blue-800' : 
                        ris.status === 'received' ? 'bg-yellow-100 text-yellow-800' : 
                        ris.status === 'rejected' ? 'bg-red-100 text-red-800' : 
                        'bg-green-100 text-green-800'}`}>
                      {ris.status.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="p-3.5 sm:p-4 text-right whitespace-nowrap">
                    <div className="flex items-center justify-end gap-1.5">
                      <button 
                        onClick={() => handleViewRis(ris.id)} 
                        className="p-1.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" 
                        title="View Requisition Details"
                      >
                        <Eye size={18} />
                      </button>
                      {ris.status === 'draft' && (
                        <button 
                          onClick={() => handleDownloadAndSend(ris)}
                          className="flex items-center gap-1 px-3 py-1.5 bg-blue-50 text-blue-700 hover:bg-blue-100 rounded-lg text-xs font-semibold transition-colors"
                        >
                          <Send size={14} />
                          <span>Send to Admin</span>
                        </button>
                      )}
                      {ris.status !== 'draft' && (
                        <button 
                          onClick={async () => {
                            try {
                              const res = await api.get(`/ris/${ris.id}`);
                              exportRIStoPDF(res.data);
                            } catch (err) {
                              toast.error('Failed to export PDF');
                            }
                          }} 
                          className="p-1.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" 
                          title="Export to PDF (Appendix 63)"
                        >
                          <Download size={18} />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Viewing RIS Modal */}
      {viewingRis && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center z-50 p-3 sm:p-6 print:bg-white print:static print:inset-auto print:flex-col print:z-auto print:p-0">
          <div className="bg-white rounded-xl sm:rounded-2xl shadow-2xl w-full max-w-4xl max-h-[92vh] flex flex-col print:shadow-none print:max-h-none print:w-full overflow-hidden">
            
            {/* Modal Header */}
            <div className="px-4 sm:px-6 py-3.5 sm:py-4 border-b border-gray-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 bg-gray-50/50 print:hidden">
              <div>
                <h2 className="text-base sm:text-lg font-bold text-gray-800">Appendix 63 - Requisition Slip</h2>
                <p className="text-xs text-gray-500">RIS ID: {viewingRis.ris_no || `RIS-${viewingRis.id}`}</p>
              </div>

              <div className="flex items-center gap-2 self-end sm:self-auto">
                <button 
                  onClick={() => exportRIStoPDF(viewingRis)} 
                  className="flex items-center gap-1.5 px-3 sm:px-4 py-1.5 sm:py-2 bg-green-600 text-white rounded-lg text-xs sm:text-sm font-semibold hover:bg-green-700 transition-colors shadow-xs"
                >
                  <Download size={15} /> <span>PDF</span>
                </button>
                <button 
                  onClick={handlePrint} 
                  className="flex items-center gap-1.5 px-3 sm:px-4 py-1.5 sm:py-2 bg-blue-600 text-white rounded-lg text-xs sm:text-sm font-semibold hover:bg-blue-700 transition-colors shadow-xs"
                >
                  <Printer size={15} /> <span>Print</span>
                </button>
                <button 
                  onClick={() => setViewingRis(null)} 
                  className="text-gray-400 hover:text-gray-600 p-1.5 rounded-lg hover:bg-gray-100 transition-colors ml-1"
                >
                  <X size={20} />
                </button>
              </div>
            </div>
            
            {/* Modal Body */}
            <div className="p-4 sm:p-6 lg:p-8 overflow-y-auto print:overflow-visible print:p-0" style={{ fontFamily: '"Times New Roman", Times, serif' }}>
              <div className="text-center mb-6">
                <h1 className="text-lg sm:text-xl font-bold uppercase tracking-wide">Requisition and Issue Slip</h1>
                <div className="mt-2 text-xs sm:text-sm space-y-1">
                  <p>Entity Name: <span className="font-semibold border-b border-black px-2">{viewingRis.entity_name || '_________________'}</span></p>
                  <p>Fund Cluster: <span className="font-semibold border-b border-black px-2">{viewingRis.fund_cluster || '_________________'}</span></p>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row justify-between text-xs sm:text-sm gap-2 mb-4">
                <div>
                  <p>Division: <span className="font-semibold border-b border-black px-2">{viewingRis.division || '_________________'}</span></p>
                  <p className="mt-1">Office: <span className="font-semibold border-b border-black px-2">{viewingRis.office || '_________________'}</span></p>
                </div>
                <div className="sm:text-right">
                  <p>Responsibility Center: <span className="font-semibold border-b border-black px-2">{viewingRis.responsibility_center_code || '_________________'}</span></p>
                  <p className="mt-1">RIS No.: <span className="font-semibold border-b border-black px-2">{viewingRis.ris_no || 'Pending'}</span></p>
                </div>
              </div>

              <div className="overflow-x-auto pb-2 mb-4 border border-black/20 rounded-xs">
                <table className="w-full min-w-[650px] text-left border-collapse border border-black text-xs sm:text-sm">
                  <thead>
                    <tr>
                      <th colSpan={4} className="border border-black p-2 text-center font-bold bg-gray-50">Requisition</th>
                      <th colSpan={2} className="border border-black p-2 text-center font-bold bg-gray-50">Stock Available?</th>
                      <th colSpan={2} className="border border-black p-2 text-center font-bold bg-gray-50">Issue</th>
                    </tr>
                    <tr className="bg-gray-100/70">
                      <th className="border border-black p-1.5 text-center w-20">Stock No.</th>
                      <th className="border border-black p-1.5 text-center w-16">Unit</th>
                      <th className="border border-black p-1.5 text-center">Description</th>
                      <th className="border border-black p-1.5 text-center w-16">Quantity</th>
                      <th className="border border-black p-1.5 text-center w-12">Yes</th>
                      <th className="border border-black p-1.5 text-center w-12">No</th>
                      <th className="border border-black p-1.5 text-center w-16">Quantity</th>
                      <th className="border border-black p-1.5 text-center w-24">Remarks</th>
                    </tr>
                  </thead>
                  <tbody>
                    {viewingRis.items && viewingRis.items.length > 0 ? viewingRis.items.map((item: any, idx: number) => (
                      <tr key={idx}>
                        <td className="border border-black p-1.5 text-center font-mono">{item.stock_no}</td>
                        <td className="border border-black p-1.5 text-center">{item.unit}</td>
                        <td className="border border-black p-1.5">{item.description}</td>
                        <td className="border border-black p-1.5 text-center font-bold">{item.quantity_requisition}</td>
                        <td className="border border-black p-1.5 text-center">{item.stock_available_yes ? '✓' : ''}</td>
                        <td className="border border-black p-1.5 text-center">{item.stock_available_no ? '✓' : ''}</td>
                        <td className="border border-black p-1.5 text-center font-bold">{item.quantity_issue}</td>
                        <td className="border border-black p-1.5 text-xs">{item.remarks}</td>
                      </tr>
                    )) : (
                      <tr>
                        <td colSpan={8} className="border border-black p-4 text-center italic text-gray-500">No items requested</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              <div className="mb-6">
                <p className="text-xs sm:text-sm font-bold">Purpose:</p>
                <p className="text-xs sm:text-sm border-b border-black min-h-[1.5rem] py-1">{viewingRis.purpose || '-'}</p>
              </div>

              <div className="overflow-x-auto pb-2 border border-black/20 rounded-xs">
                <table className="w-full min-w-[550px] text-left border-collapse border border-black text-xs sm:text-sm">
                  <tbody>
                    <tr className="bg-gray-50">
                      <td className="border border-black p-1.5 w-24"></td>
                      <td className="border border-black p-1.5 font-bold text-center">Requested by:</td>
                      <td className="border border-black p-1.5 font-bold text-center">Approved by:</td>
                      <td className="border border-black p-1.5 font-bold text-center">Issued by:</td>
                      <td className="border border-black p-1.5 font-bold text-center">Received by:</td>
                    </tr>
                    <tr>
                      <td className="border border-black p-1.5 font-bold">Signature:</td>
                      <td className="border border-black p-1.5 h-10"></td>
                      <td className="border border-black p-1.5 h-10"></td>
                      <td className="border border-black p-1.5 h-10"></td>
                      <td className="border border-black p-1.5 h-10"></td>
                    </tr>
                    <tr>
                      <td className="border border-black p-1.5 font-bold">Printed Name:</td>
                      <td className="border border-black p-1.5 text-center">{viewingRis.requested_by_name || viewingRis.employee?.full_name}</td>
                      <td className="border border-black p-1.5 text-center">{viewingRis.approved_by_name || '-'}</td>
                      <td className="border border-black p-1.5 text-center">{viewingRis.issued_by_name || '-'}</td>
                      <td className="border border-black p-1.5 text-center">{viewingRis.received_by_name || '-'}</td>
                    </tr>
                    <tr>
                      <td className="border border-black p-1.5 font-bold">Designation:</td>
                      <td className="border border-black p-1.5 text-center">{viewingRis.requested_by_designation || viewingRis.employee?.designation}</td>
                      <td className="border border-black p-1.5 text-center">{viewingRis.approved_by_designation || '-'}</td>
                      <td className="border border-black p-1.5 text-center">{viewingRis.issued_by_designation || '-'}</td>
                      <td className="border border-black p-1.5 text-center">{viewingRis.received_by_designation || '-'}</td>
                    </tr>
                    <tr>
                      <td className="border border-black p-1.5 font-bold">Date:</td>
                      <td className="border border-black p-1.5 text-center">{viewingRis.requested_by_date || '-'}</td>
                      <td className="border border-black p-1.5 text-center">{viewingRis.approved_by_date || '-'}</td>
                      <td className="border border-black p-1.5 text-center">{viewingRis.issued_by_date || '-'}</td>
                      <td className="border border-black p-1.5 text-center">{viewingRis.received_by_date || '-'}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}

      <ConfirmModal
        isOpen={!!confirmSendRis}
        title="Send RIS to Custodian"
        message="This will submit your RIS to the Admin Custodian and open the print dialog. Proceed?"
        onConfirm={proceedWithSend}
        onCancel={() => setConfirmSendRis(null)}
      />
    </div>
  );
}
