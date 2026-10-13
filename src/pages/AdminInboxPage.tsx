import { useState, useEffect } from 'react';
import api from '../utils/api';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import { CheckCircle, Edit3, Eye, Download, X, Printer } from 'lucide-react';
import { ConfirmModal } from '../components/ConfirmModal';
import { exportRIStoPDF } from '../utils/pdf';

export default function AdminInboxPage() {
  const { user } = useAuth();
  const [records, setRecords] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [assigningId, setAssigningId] = useState<number | null>(null);
  const [risNoInput, setRisNoInput] = useState('');
  
  const [viewingRis, setViewingRis] = useState<any>(null);
  const [risToReject, setRisToReject] = useState<number | null>(null);
  const [editingPreviewRisNo, setEditingPreviewRisNo] = useState(false);
  const [previewRisNoInput, setPreviewRisNoInput] = useState('');
  const [editingItems, setEditingItems] = useState(false);

  useEffect(() => {
    fetchInbox();
  }, []);

  const fetchInbox = async () => {
    try {
      const res = await api.get('/ris/inbox');
      setRecords(res.data);
    } catch (err) {
      toast.error('Failed to fetch inbox');
    } finally {
      setLoading(false);
    }
  };

  const handleMarkReceived = async (id: number) => {
    try {
      await api.put(`/ris/${id}/mark-received`);
      toast.success('Marked as received');
      fetchInbox();
    } catch (err) {
      toast.error('Failed to mark received');
    }
  };

  const handleApprove = async (id: number) => {
    try {
      await api.put(`/ris/${id}/status`, { status: 'approved' });
      toast.success('RIS approved and inventory updated');
      fetchInbox();
    } catch (err) {
      toast.error('Failed to approve RIS');
    }
  };

  const handleReject = async (id: number) => {
    setRisToReject(id);
  };

  const confirmReject = async () => {
    if (!risToReject) return;
    try {
      await api.put(`/ris/${risToReject}/status`, { status: 'rejected' });
      toast.success('RIS rejected');
      fetchInbox();
    } catch (err) {
      toast.error('Failed to reject RIS');
    } finally {
      setRisToReject(null);
    }
  };

  const handleAssignRisNo = async (id: number) => {
    if (!risNoInput.trim()) return toast.error('RIS No. cannot be empty');
    try {
      await api.put(`/ris/${id}/assign-ris-no`, { ris_no: risNoInput });
      toast.success('RIS No. assigned successfully');
      setAssigningId(null);
      setRisNoInput('');
      fetchInbox();
    } catch (err) {
      toast.error('Failed to assign RIS No.');
    }
  };

  const handleViewRis = async (id: number, print = false) => {
    try {
      const res = await api.get(`/ris/${id}`);
      setViewingRis(res.data);
      setPreviewRisNoInput(res.data.ris_no || '');
      setEditingPreviewRisNo(false);
      setEditingItems(false);
      if (print) {
        setTimeout(() => {
          window.print();
        }, 100);
      }
    } catch (err) {
      toast.error('Failed to fetch RIS details');
    }
  };

  const handleSavePreviewRisNo = async () => {
    if (!previewRisNoInput.trim()) return toast.error('RIS No. cannot be empty');
    try {
      await api.put(`/ris/${viewingRis.id}/assign-ris-no`, { ris_no: previewRisNoInput });
      toast.success('RIS No. assigned successfully');
      setViewingRis({ ...viewingRis, ris_no: previewRisNoInput });
      setEditingPreviewRisNo(false);
      fetchInbox();
    } catch (err) {
      toast.error('Failed to assign RIS No.');
    }
  };

  const handleSaveItems = async () => {
    try {
      await api.put(`/ris/${viewingRis.id}/items`, { items: viewingRis.items });
      toast.success('Items updated successfully');
      setEditingItems(false);
      fetchInbox();
    } catch (err) {
      toast.error('Failed to update items');
    }
  };

  const handlePrint = () => {
    window.print();
  };

  if (loading) return <div className="p-4 sm:p-8 text-gray-500">Loading admin inbox...</div>;

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full">
      <div className="mb-6 sm:mb-8 print:hidden">
        <h1 className="text-xl sm:text-2xl font-bold text-[#1A2340]">Admin Inbox</h1>
        <p className="text-xs sm:text-sm text-gray-500 mt-1">Review, assign RIS numbers, and process employee requisitions</p>
      </div>

      <div className="bg-white rounded-xl shadow-xs border border-gray-200 overflow-hidden print:hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[680px]">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="p-3.5 sm:p-4 text-xs font-bold text-gray-500 uppercase tracking-wider">RIS No.</th>
                <th className="p-3.5 sm:p-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Submitted By</th>
                <th className="p-3.5 sm:p-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Date</th>
                <th className="p-3.5 sm:p-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Status</th>
                <th className="p-3.5 sm:p-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {records.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-gray-500 text-sm">
                    No submitted RIS requests in inbox.
                  </td>
                </tr>
              ) : records.map(ris => (
                <tr key={ris.id} className="hover:bg-gray-50 transition-colors">
                  <td className="p-3.5 sm:p-4 font-medium text-gray-900 text-xs sm:text-sm">
                    {assigningId === ris.id ? (
                      <div className="flex items-center gap-1.5">
                        <input 
                          type="text" 
                          className="border border-gray-300 rounded px-2 py-1 text-xs w-28 sm:w-32 focus:outline-none focus:ring-1 focus:ring-blue-500"
                          value={risNoInput}
                          onChange={e => setRisNoInput(e.target.value)}
                          placeholder="RIS-2026-001"
                          autoFocus
                        />
                        <button onClick={() => handleAssignRisNo(ris.id)} className="text-xs bg-blue-600 text-white px-2 py-1 rounded font-medium hover:bg-blue-700">Save</button>
                        <button onClick={() => setAssigningId(null)} className="text-xs text-gray-500 hover:text-gray-700">Cancel</button>
                      </div>
                    ) : (
                      ris.ris_no ? <span className="font-mono text-xs sm:text-sm">{ris.ris_no}</span> : <span className="text-gray-400 italic text-xs">Pending</span>
                    )}
                  </td>
                  <td className="p-3.5 sm:p-4">
                    <div className="text-xs sm:text-sm font-semibold text-gray-900">{ris.employee?.full_name || 'Generic Employee'}</div>
                    <div className="text-[11px] text-gray-500 font-mono">{ris.employee?.employee_id}</div>
                  </td>
                  <td className="p-3.5 sm:p-4 text-xs sm:text-sm text-gray-600">
                    {new Date(ris.createdAt).toLocaleDateString()}
                  </td>
                  <td className="p-3.5 sm:p-4">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold capitalize whitespace-nowrap
                      ${ris.status === 'sent' ? 'bg-blue-100 text-blue-800' : 
                        ris.status === 'received' ? 'bg-yellow-100 text-yellow-800' : 
                        ris.status === 'rejected' ? 'bg-red-100 text-red-800' : 
                        'bg-green-100 text-green-800'}`}>
                      {ris.status.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="p-3.5 sm:p-4 text-right whitespace-nowrap">
                    <div className="flex items-center justify-end gap-1.5">
                      <button onClick={() => handleViewRis(ris.id)} className="p-1.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" title="View">
                        <Eye size={18} />
                      </button>
                      <button onClick={async () => {
                        try {
                          const res = await api.get(`/ris/${ris.id}`);
                          exportRIStoPDF(res.data);
                        } catch (err) {
                          toast.error('Failed to export PDF');
                        }
                      }} className="p-1.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" title="Export to PDF (Appendix 63)">
                        <Download size={18} />
                      </button>
                      
                      {ris.status === 'sent' && (
                        <button 
                          onClick={() => handleMarkReceived(ris.id)}
                          className="flex items-center gap-1 px-2.5 py-1.5 bg-yellow-50 text-yellow-800 hover:bg-yellow-100 rounded-lg text-xs font-semibold transition-colors"
                        >
                          <CheckCircle size={14} />
                          <span>Mark Received</span>
                        </button>
                      )}

                      {ris.status === 'received' && (
                        <>
                          <button 
                            onClick={() => handleApprove(ris.id)}
                            className="flex items-center gap-1 px-2.5 py-1.5 bg-green-50 text-green-700 hover:bg-green-100 rounded-lg text-xs font-semibold transition-colors"
                          >
                            <CheckCircle size={14} />
                            <span>Approve</span>
                          </button>
                          <button 
                            onClick={() => handleReject(ris.id)}
                            className="flex items-center gap-1 px-2.5 py-1.5 bg-red-50 text-red-700 hover:bg-red-100 rounded-lg text-xs font-semibold transition-colors"
                          >
                            <X size={14} />
                            <span>Reject</span>
                          </button>
                        </>
                      )}

                      {(user?.role === 'admin_administrative' || user?.role === 'admin') && !ris.ris_no && (
                        <button 
                          onClick={() => { setAssigningId(ris.id); setRisNoInput(''); }}
                          className="flex items-center gap-1 px-2.5 py-1.5 bg-blue-50 text-blue-700 hover:bg-blue-100 rounded-lg text-xs font-semibold transition-colors"
                        >
                          <Edit3 size={14} />
                          <span>Assign No.</span>
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

      {/* Review Modal */}
      {viewingRis && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center z-50 p-3 sm:p-6 print:bg-white print:static print:inset-auto print:flex-col print:z-auto print:p-0">
          <div className="bg-white rounded-xl sm:rounded-2xl shadow-2xl w-full max-w-4xl max-h-[92vh] flex flex-col print:shadow-none print:max-h-none print:w-full overflow-hidden">
            
            <div className="px-4 sm:px-6 py-3.5 sm:py-4 border-b border-gray-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 bg-gray-50/50 print:hidden">
              <div>
                <h2 className="text-base sm:text-lg font-bold text-gray-800">Appendix 63 - Custodian Review</h2>
                <p className="text-xs text-gray-500">Applicant: {viewingRis.employee?.full_name}</p>
              </div>

              <div className="flex items-center gap-2 self-end sm:self-auto">
                <button onClick={() => exportRIStoPDF(viewingRis)} className="flex items-center gap-1.5 px-3 py-1.5 bg-green-600 text-white rounded-lg text-xs font-semibold hover:bg-green-700 transition-colors shadow-xs">
                  <Download size={14} /> <span>PDF</span>
                </button>
                <button onClick={handlePrint} className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 text-white rounded-lg text-xs font-semibold hover:bg-blue-700 transition-colors shadow-xs">
                  <Printer size={14} /> <span>Print</span>
                </button>
                <button onClick={() => { setViewingRis(null); setEditingItems(false); }} className="text-gray-400 hover:text-gray-600 p-1.5 rounded-lg hover:bg-gray-100 ml-1">
                  <X size={20} />
                </button>
              </div>
            </div>
            
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
                  <div className="mt-1 flex items-center sm:justify-end gap-2">
                    <span>RIS No.:</span>
                    {editingPreviewRisNo ? (
                      <div className="flex items-center gap-1 print:hidden font-sans">
                        <input 
                          type="text" 
                          className="border border-gray-300 rounded px-2 py-0.5 text-xs w-28 sm:w-32 focus:outline-none focus:ring-1 focus:ring-blue-500"
                          value={previewRisNoInput}
                          onChange={e => setPreviewRisNoInput(e.target.value)}
                          placeholder="RIS No."
                          autoFocus
                        />
                        <button onClick={handleSavePreviewRisNo} className="text-xs bg-blue-600 text-white px-2 py-0.5 rounded font-semibold hover:bg-blue-700">Save</button>
                        <button onClick={() => { setEditingPreviewRisNo(false); setPreviewRisNoInput(viewingRis.ris_no || ''); }} className="text-xs text-gray-500 hover:text-gray-700">Cancel</button>
                      </div>
                    ) : (
                      <span 
                        className="font-semibold border-b border-black px-2 flex items-center gap-1.5 cursor-pointer hover:bg-gray-100 transition-colors" 
                        onClick={() => setEditingPreviewRisNo(true)}
                        title="Click to edit RIS No."
                      >
                        {viewingRis.ris_no || 'Pending (Click to set)'}
                        <Edit3 size={13} className="text-gray-400 group-hover:text-blue-600 print:hidden" />
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex justify-end mb-2 print:hidden font-sans">
                {viewingRis.status === 'sent' && (
                  <button
                    onClick={() => editingItems ? handleSaveItems() : setEditingItems(true)}
                    className="flex items-center gap-1.5 text-xs bg-blue-600 text-white px-3 py-1.5 rounded-lg hover:bg-blue-700 transition-colors font-semibold shadow-xs"
                  >
                    {editingItems ? <CheckCircle size={15} /> : <Edit3 size={15} />}
                    <span>{editingItems ? 'Save Item Changes' : 'Edit Items & Quantities'}</span>
                  </button>
                )}
              </div>

              <div className="overflow-x-auto pb-2 mb-4 border border-black/20 rounded-xs">
                <table className="w-full min-w-[660px] text-left border-collapse border border-black text-xs sm:text-sm">
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
                        <td className="border border-black p-1.5 text-center">
                          {editingItems ? (
                            <input 
                              type="checkbox" 
                              checked={item.stock_available_yes} 
                              onChange={e => {
                                const newItems = [...viewingRis.items];
                                newItems[idx].stock_available_yes = e.target.checked;
                                if (e.target.checked) newItems[idx].stock_available_no = false;
                                setViewingRis({ ...viewingRis, items: newItems });
                              }}
                            />
                          ) : (
                            item.stock_available_yes ? '✓' : ''
                          )}
                        </td>
                        <td className="border border-black p-1.5 text-center">
                          {editingItems ? (
                            <input 
                              type="checkbox" 
                              checked={item.stock_available_no} 
                              onChange={e => {
                                const newItems = [...viewingRis.items];
                                newItems[idx].stock_available_no = e.target.checked;
                                if (e.target.checked) newItems[idx].stock_available_yes = false;
                                setViewingRis({ ...viewingRis, items: newItems });
                              }}
                            />
                          ) : (
                            item.stock_available_no ? '✓' : ''
                          )}
                        </td>
                        <td className="border border-black p-1.5 text-center font-bold">
                          {editingItems ? (
                            <input 
                              type="number" 
                              className="w-14 border border-gray-300 rounded text-center text-xs py-0.5" 
                              value={item.quantity_issue} 
                              onChange={e => {
                                const newItems = [...viewingRis.items];
                                newItems[idx].quantity_issue = e.target.value;
                                setViewingRis({ ...viewingRis, items: newItems });
                              }}
                            />
                          ) : (
                            item.quantity_issue
                          )}
                        </td>
                        <td className="border border-black p-1.5 text-xs">
                          {editingItems ? (
                            <input 
                              type="text" 
                              className="w-full border border-gray-300 rounded text-xs px-1 py-0.5" 
                              value={item.remarks} 
                              onChange={e => {
                                const newItems = [...viewingRis.items];
                                newItems[idx].remarks = e.target.value;
                                setViewingRis({ ...viewingRis, items: newItems });
                              }}
                            />
                          ) : (
                            item.remarks
                          )}
                        </td>
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
        isOpen={!!risToReject}
        title="Reject Requisition"
        message="Are you sure you want to reject this RIS request? The employee will be notified."
        confirmText="Reject"
        onConfirm={confirmReject}
        onCancel={() => setRisToReject(null)}
      />
    </div>
  );
}
