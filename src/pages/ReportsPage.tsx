import { useState, useEffect } from 'react';
import api from '../utils/api';
import toast from 'react-hot-toast';
import { FileText, Printer, X, Package, FileDown, ChevronDown, ChevronUp, Search, Calendar, Filter } from 'lucide-react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export default function ReportsPage() {
  const [reports, setReports] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [departments, setDepartments] = useState<string[]>([]);
  
  const [reportType, setReportType] = useState('monthly');
  const [selectedDepartment, setSelectedDepartment] = useState('all');
  const [generating, setGenerating] = useState(false);

  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedQuarter, setSelectedQuarter] = useState(Math.ceil((new Date().getMonth() + 1) / 3));
  const [selectedSemester, setSelectedSemester] = useState(new Date().getMonth() < 6 ? 1 : 2);

  const [viewingReport, setViewingReport] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterReportType, setFilterReportType] = useState('all');
  const [expandedTypes, setExpandedTypes] = useState<Record<string, boolean>>({
    monthly: true,
    quarterly: true,
    semestral: true,
    yearly: true
  });

  const toggleType = (type: string) => {
    setExpandedTypes(prev => ({ ...prev, [type]: !prev[type] }));
  };

  useEffect(() => {
    fetchReports();
    fetchDepartments();
  }, []);

  const fetchReports = async () => {
    try {
      const res = await api.get('/reports');
      setReports(res.data);
    } catch (err) {
      toast.error('Failed to fetch reports');
    } finally {
      setLoading(false);
    }
  };

  const fetchDepartments = async () => {
    try {
      const res = await api.get('/users');
      const deps = Array.from(new Set(res.data.map((u: any) => u.department))).filter(Boolean) as string[];
      setDepartments(deps);
    } catch (err) {
      console.error('Failed to fetch departments');
    }
  };

  const handleGenerate = async () => {
    setGenerating(true);
    try {
      await api.post('/reports/generate', { 
        type: reportType,
        department: selectedDepartment === 'all' ? null : selectedDepartment,
        year: selectedYear,
        month: selectedMonth,
        quarter: selectedQuarter,
        semester: selectedSemester
      });
      toast.success('Report generated successfully');
      fetchReports();
    } catch (err) {
      toast.error('Failed to generate report');
    } finally {
      setGenerating(false);
    }
  };

  const handleDownloadPDF = async (reportData: any) => {
    let dataToUse = reportData;
    if (!reportData.data) {
      try {
        const res = await api.get(`/reports/${reportData.id}`);
        dataToUse = res.data;
      } catch (err) {
        toast.error('Failed to fetch report data for PDF');
        return;
      }
    }

    const doc = new jsPDF('p', 'mm', 'a4');
    const pageWidth = doc.internal.pageSize.getWidth();
    
    // Header
    doc.setFontSize(18);
    doc.setTextColor(26, 35, 64);
    doc.text('INVENTORY QUANTITY REPORT', pageWidth / 2, 20, { align: 'center' });
    
    doc.setFontSize(12);
    doc.setTextColor(100, 116, 139);
    doc.text(`Period: ${dataToUse.period_label}`, pageWidth / 2, 28, { align: 'center' });
    doc.text(`Department: ${dataToUse.department || 'All Departments'}`, pageWidth / 2, 34, { align: 'center' });
    doc.setFontSize(10);
    doc.text(`Generated: ${new Date(dataToUse.createdAt).toLocaleString()}`, pageWidth / 2, 40, { align: 'center' });

    // Most Requested Section
    doc.setFontSize(14);
    doc.setTextColor(26, 35, 64);
    doc.text('MOST REQUESTED ITEMS', 14, 50);
    
    const mostHeaders = [['Stock No.', 'Description', 'Category', 'Unit', 'Issued Qty', 'Remaining Qty']];
    const mostRows = dataToUse.data.mostRequested.map((item: any) => [
      item.stock_no,
      item.name,
      item.category,
      item.unit,
      item.issued.toString(),
      item.remaining.toString()
    ]);

    autoTable(doc, {
      startY: 55,
      head: mostHeaders,
      body: mostRows,
      theme: 'grid',
      headStyles: { fillColor: [249, 115, 22], textColor: [255, 255, 255] },
      styles: { fontSize: 9, cellPadding: 3 },
    });

    // Least Requested Section
    const finalY = (doc as any).lastAutoTable?.finalY || 55;
    doc.setFontSize(14);
    doc.setTextColor(26, 35, 64);
    doc.text('LEAST REQUESTED ITEMS', 14, finalY + 15);

    const leastHeaders = [['Stock No.', 'Description', 'Category', 'Unit', 'Issued Qty', 'Remaining Qty']];
    const leastRows = dataToUse.data.leastRequested.map((item: any) => [
      item.stock_no,
      item.name,
      item.category,
      item.unit,
      item.issued.toString(),
      item.remaining.toString()
    ]);

    autoTable(doc, {
      startY: finalY + 20,
      head: leastHeaders,
      body: leastRows,
      theme: 'grid',
      headStyles: { fillColor: [37, 99, 235], textColor: [255, 255, 255] },
      styles: { fontSize: 9, cellPadding: 3 },
    });

    // Summary Narrative Section
    const summaryY = (doc as any).lastAutoTable?.finalY || finalY + 20;
    doc.setFontSize(12);
    doc.setTextColor(26, 35, 64);
    doc.text('Summary Report:', 14, summaryY + 15);
    
    doc.setFontSize(10);
    doc.setTextColor(71, 85, 105);
    const splitSummary = doc.splitTextToSize(dataToUse.data.summary, pageWidth - 28);
    doc.text(splitSummary, 14, summaryY + 22);

    doc.save(`Report_${dataToUse.period_label.replace(/\s+/g, '_')}.pdf`);
    toast.success('PDF downloaded successfully');
  };

  const handleViewReport = async (id: number) => {
    try {
      const res = await api.get(`/reports/${id}`);
      setViewingReport(res.data);
    } catch (err) {
      toast.error('Failed to fetch report details');
    }
  };

  const handlePrint = () => {
    window.print();
  };

  if (loading) return <div className="p-4 sm:p-8 text-gray-500">Loading reports...</div>;

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full">
      <div className="mb-6 sm:mb-8 print:hidden">
        <h1 className="text-xl sm:text-2xl font-bold text-[#1A2340]">Inventory Reports</h1>
        <p className="text-xs sm:text-sm text-gray-500 mt-1">Generate and analyze inventory consumption by period and department</p>
      </div>

      {/* Generator Form Card */}
      <div className="bg-white rounded-xl shadow-xs border border-gray-200 p-4 sm:p-6 mb-6 sm:mb-8 print:hidden">
        <h2 className="text-sm font-bold text-gray-800 uppercase tracking-wider mb-4 flex items-center gap-2">
          <Filter size={16} className="text-blue-600" />
          <span>Generate New Report</span>
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-4">
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">Report Cadence</label>
            <select 
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={reportType}
              onChange={e => setReportType(e.target.value)}
            >
              <option value="monthly">Monthly</option>
              <option value="quarterly">Quarterly</option>
              <option value="semestral">Semestral</option>
              <option value="yearly">Yearly</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">Fiscal Year</label>
            <select 
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={selectedYear}
              onChange={e => setSelectedYear(Number(e.target.value))}
            >
              {Array.from({ length: 10 }, (_, i) => new Date().getFullYear() - i).map(year => (
                <option key={year} value={year}>{year}</option>
              ))}
            </select>
          </div>

          {reportType === 'monthly' && (
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Month</label>
              <select 
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={selectedMonth}
                onChange={e => setSelectedMonth(Number(e.target.value))}
              >
                {Array.from({ length: 12 }, (_, i) => i + 1).map(month => (
                  <option key={month} value={month}>
                    {new Date(2000, month - 1).toLocaleString('default', { month: 'long' })}
                  </option>
                ))}
              </select>
            </div>
          )}

          {reportType === 'quarterly' && (
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Quarter</label>
              <select 
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={selectedQuarter}
                onChange={e => setSelectedQuarter(Number(e.target.value))}
              >
                <option value={1}>Q1 (Jan-Mar)</option>
                <option value={2}>Q2 (Apr-Jun)</option>
                <option value={3}>Q3 (Jul-Sep)</option>
                <option value={4}>Q4 (Oct-Dec)</option>
              </select>
            </div>
          )}

          {reportType === 'semestral' && (
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Semester</label>
              <select 
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={selectedSemester}
                onChange={e => setSelectedSemester(Number(e.target.value))}
              >
                <option value={1}>1st Semester (Jan-Jun)</option>
                <option value={2}>2nd Semester (Jul-Dec)</option>
              </select>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">Department</label>
            <select 
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={selectedDepartment}
              onChange={e => setSelectedDepartment(e.target.value)}
            >
              <option value="all">All Departments</option>
              {departments.map(dep => (
                <option key={dep} value={dep}>{dep}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex justify-end pt-2 border-t border-gray-100">
          <button 
            onClick={handleGenerate}
            disabled={generating}
            className="w-full sm:w-auto bg-blue-600 text-white px-6 py-2.5 rounded-lg text-xs sm:text-sm font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50 shadow-xs"
          >
            {generating ? 'Compiling Analytics...' : 'Generate Report'}
          </button>
        </div>
      </div>

      {/* Reports Archive */}
      <div className="bg-white rounded-xl shadow-xs border border-gray-200 overflow-hidden print:hidden">
        <div className="p-3.5 sm:p-4 border-b border-gray-200 bg-gray-50 flex flex-col md:flex-row md:items-center justify-between gap-3">
          <h3 className="font-bold text-gray-800 text-sm sm:text-base">Generated Reports Archive</h3>
          
          <div className="flex flex-col sm:flex-row gap-2.5 w-full md:w-auto">
            <select
              className="border border-gray-300 rounded-lg px-3 py-1.5 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
              value={filterReportType}
              onChange={(e) => setFilterReportType(e.target.value)}
            >
              <option value="all">All Cadences</option>
              <option value="monthly">Monthly</option>
              <option value="quarterly">Quarterly</option>
              <option value="semestral">Semestral</option>
              <option value="yearly">Yearly</option>
            </select>

            <div className="relative w-full sm:w-64">
              <input
                type="text"
                placeholder="Search reports..."
                className="w-full pl-9 pr-3 py-1.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-xs sm:text-sm bg-white"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={15} />
            </div>
          </div>
        </div>
        
        <div className="p-3 sm:p-6">
          {(() => {
            const filtered = reports.filter(r => {
              const matchesSearch = r.period_label.toLowerCase().includes(searchTerm.toLowerCase()) ||
                (r.department || 'All Departments').toLowerCase().includes(searchTerm.toLowerCase()) ||
                r.report_type.toLowerCase().includes(searchTerm.toLowerCase()) ||
                `REP-${String(r.id).padStart(4, '0')}`.toLowerCase().includes(searchTerm.toLowerCase());
              
              const matchesType = filterReportType === 'all' || r.report_type === filterReportType;
              return matchesSearch && matchesType;
            });

            if (filtered.length === 0) {
              return (
                <div className="text-center py-12 text-gray-500 text-sm">
                  <FileText size={36} className="mx-auto text-gray-300 mb-2" />
                  <p>No reports found matching your filters.</p>
                </div>
              );
            }

            const grouped: Record<string, Record<string, any[]>> = {};
            filtered.forEach(r => {
              const type = r.report_type;
              const dept = r.department || 'All Departments';
              if (!grouped[type]) grouped[type] = {};
              if (!grouped[type][dept]) grouped[type][dept] = [];
              grouped[type][dept].push(r);
            });

            return Object.entries(grouped).map(([type, depts]) => (
              <div key={type} className="mb-4 sm:mb-6 last:mb-0 border border-gray-200 rounded-xl overflow-hidden">
                <button 
                  onClick={() => toggleType(type)}
                  className="w-full flex items-center justify-between p-3 sm:p-4 bg-gray-50 hover:bg-gray-100 transition-colors"
                >
                  <h4 className="text-xs sm:text-sm font-bold text-blue-700 uppercase tracking-wider capitalize">
                    {type} Reports
                  </h4>
                  {expandedTypes[type] ? <ChevronUp size={18} className="text-gray-500" /> : <ChevronDown size={18} className="text-gray-500" />}
                </button>
                
                {expandedTypes[type] && (
                  <div className="p-3 sm:p-4 bg-white">
                    {Object.entries(depts).map(([dept, deptReports]) => (
                      <div key={dept} className="mb-5 last:mb-0">
                        <h5 className="text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
                          <span>{dept}</span>
                        </h5>
                        
                        <div className="overflow-x-auto border border-gray-100 rounded-lg">
                          <table className="w-full text-left border-collapse min-w-[500px]">
                            <thead>
                              <tr className="border-b border-gray-100 bg-gray-50/60">
                                <th className="py-2.5 px-3 text-[10px] font-bold text-gray-400 uppercase">ID</th>
                                <th className="py-2.5 px-3 text-[10px] font-bold text-gray-400 uppercase">Period</th>
                                <th className="py-2.5 px-3 text-[10px] font-bold text-gray-400 uppercase">Generated</th>
                                <th className="py-2.5 px-3 text-[10px] font-bold text-gray-400 uppercase text-right">Actions</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                              {deptReports.map(report => (
                                <tr key={report.id} className="hover:bg-blue-50/20 transition-colors">
                                  <td className="py-2.5 px-3 font-mono text-xs text-gray-500">REP-{String(report.id).padStart(4, '0')}</td>
                                  <td className="py-2.5 px-3 text-xs sm:text-sm font-semibold text-gray-800">{report.period_label}</td>
                                  <td className="py-2.5 px-3 text-xs text-gray-500">{new Date(report.createdAt).toLocaleDateString()}</td>
                                  <td className="py-2.5 px-3 text-right whitespace-nowrap">
                                    <div className="flex items-center justify-end gap-1">
                                      <button onClick={() => handleViewReport(report.id)} className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" title="View / Print Preview">
                                        <FileText size={16} />
                                      </button>
                                      <button onClick={() => handleDownloadPDF(report)} className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors" title="Download PDF">
                                        <FileDown size={16} />
                                      </button>
                                    </div>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ));
          })()}
        </div>
      </div>

      {/* Report Preview Modal */}
      {viewingReport && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center z-50 p-3 sm:p-6 print:bg-white print:static print:inset-auto print:flex-col print:z-auto print:p-0">
          <div className="bg-white rounded-xl sm:rounded-2xl shadow-2xl w-full max-w-5xl max-h-[92vh] flex flex-col print:shadow-none print:max-h-none print:w-full overflow-hidden">
            
            <div className="px-4 sm:px-6 py-3.5 sm:py-4 border-b border-gray-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 bg-gray-50/50 print:hidden">
              <div>
                <h2 className="text-base sm:text-lg font-bold text-gray-800 truncate max-w-md">Report: {viewingReport.period_label}</h2>
                <p className="text-xs text-gray-500">{viewingReport.department || 'All Departments'}</p>
              </div>

              <div className="flex items-center gap-2 self-end sm:self-auto">
                <button onClick={() => handleDownloadPDF(viewingReport)} className="flex items-center gap-1.5 px-3 sm:px-4 py-1.5 sm:py-2 bg-red-600 text-white rounded-lg text-xs sm:text-sm font-semibold hover:bg-red-700 transition-colors shadow-xs">
                  <FileDown size={15} /> <span>PDF</span>
                </button>
                <button onClick={handlePrint} className="flex items-center gap-1.5 px-3 sm:px-4 py-1.5 sm:py-2 bg-blue-600 text-white rounded-lg text-xs sm:text-sm font-semibold hover:bg-blue-700 transition-colors shadow-xs">
                  <Printer size={15} /> <span>Print</span>
                </button>
                <button onClick={() => setViewingReport(null)} className="text-gray-400 hover:text-gray-600 p-1.5 rounded-lg hover:bg-gray-100 ml-1">
                  <X size={20} />
                </button>
              </div>
            </div>
            
            <div className="p-4 sm:p-6 lg:p-8 overflow-y-auto print:overflow-visible print:p-0 bg-white">
              <div className="text-center mb-6 sm:mb-8">
                <h1 className="text-lg sm:text-2xl font-bold uppercase tracking-wide text-[#1A2340]">Inventory Quantity Report</h1>
                <h2 className="text-base sm:text-lg font-semibold text-gray-700 mt-1">{viewingReport.period_label}</h2>
                <p className="text-xs sm:text-sm text-gray-500 mt-1">Department: {viewingReport.department || 'All Departments'}</p>
                <p className="text-xs text-gray-400">Generated: {new Date(viewingReport.createdAt).toLocaleString()}</p>
              </div>

              <div className="space-y-6 sm:space-y-8">
                {/* Most Requested Table */}
                <div>
                  <h3 className="text-base sm:text-lg font-bold text-orange-600 mb-3 flex items-center gap-2">
                    <Package size={18} />
                    <span>Most Requested Items</span>
                  </h3>
                  <div className="overflow-x-auto border border-gray-200 rounded-lg">
                    <table className="w-full text-left border-collapse min-w-[580px] text-xs sm:text-sm">
                      <thead>
                        <tr className="bg-orange-50/80 border-b border-gray-200">
                          <th className="p-2.5 font-bold text-gray-800">Stock No.</th>
                          <th className="p-2.5 font-bold text-gray-800">Description</th>
                          <th className="p-2.5 font-bold text-gray-800">Category</th>
                          <th className="p-2.5 font-bold text-gray-800">Unit</th>
                          <th className="p-2.5 font-bold text-gray-800 text-right">Issued Qty</th>
                          <th className="p-2.5 font-bold text-gray-800 text-right">Remaining Qty</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {viewingReport.data.mostRequested.map((item: any, idx: number) => (
                          <tr key={idx} className="hover:bg-orange-50/20">
                            <td className="p-2.5 font-mono text-xs text-gray-600">{item.stock_no}</td>
                            <td className="p-2.5 font-medium text-gray-900">{item.name}</td>
                            <td className="p-2.5 text-gray-600">{item.category}</td>
                            <td className="p-2.5 text-gray-600">{item.unit}</td>
                            <td className="p-2.5 text-right font-bold text-orange-600">{item.issued}</td>
                            <td className="p-2.5 text-right text-gray-700">{item.remaining}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Least Requested Table */}
                <div>
                  <h3 className="text-base sm:text-lg font-bold text-blue-600 mb-3 flex items-center gap-2">
                    <Package size={18} />
                    <span>Least Requested Items</span>
                  </h3>
                  <div className="overflow-x-auto border border-gray-200 rounded-lg">
                    <table className="w-full text-left border-collapse min-w-[580px] text-xs sm:text-sm">
                      <thead>
                        <tr className="bg-blue-50/80 border-b border-gray-200">
                          <th className="p-2.5 font-bold text-gray-800">Stock No.</th>
                          <th className="p-2.5 font-bold text-gray-800">Description</th>
                          <th className="p-2.5 font-bold text-gray-800">Category</th>
                          <th className="p-2.5 font-bold text-gray-800">Unit</th>
                          <th className="p-2.5 font-bold text-gray-800 text-right">Issued Qty</th>
                          <th className="p-2.5 font-bold text-gray-800 text-right">Remaining Qty</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {viewingReport.data.leastRequested.map((item: any, idx: number) => (
                          <tr key={idx} className="hover:bg-blue-50/20">
                            <td className="p-2.5 font-mono text-xs text-gray-600">{item.stock_no}</td>
                            <td className="p-2.5 font-medium text-gray-900">{item.name}</td>
                            <td className="p-2.5 text-gray-600">{item.category}</td>
                            <td className="p-2.5 text-gray-600">{item.unit}</td>
                            <td className="p-2.5 text-right font-bold text-blue-600">{item.issued}</td>
                            <td className="p-2.5 text-right text-gray-700">{item.remaining}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Summary narrative */}
                <div className="bg-gray-50 p-4 sm:p-6 rounded-xl border border-gray-200">
                  <h3 className="text-sm sm:text-base font-bold text-gray-800 mb-1.5">Executive Summary Narrative</h3>
                  <p className="text-xs sm:text-sm text-gray-700 leading-relaxed italic">
                    "{viewingReport.data.summary}"
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
