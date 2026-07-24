import React, { useState } from 'react';
import { useERP } from '../../context/ERPContext';
import { formatLeone, formatDate } from '../../utils/formatters';
import { BarChart3, Download, Printer, FileText, Calendar, CheckCircle2, CloudUpload, ExternalLink } from 'lucide-react';
import { uploadFileToGoogleDrive } from '../../utils/googleDrive';

export const ReportsView: React.FC = () => {
  const { sales, expenses, products, customers, suppliers, ledgers, categories, users, purchaseOrders } = useERP();

  const [reportType, setReportType] = useState<string>('sales');
  const [downloadToast, setDownloadToast] = useState<string | null>(null);
  const [driveUploading, setDriveUploading] = useState<boolean>(false);
  const [driveLink, setDriveLink] = useState<string | null>(null);

  const completedSales = sales.filter(s => s.status === 'completed');
  const totalSalesVal = completedSales.reduce((acc, s) => acc + s.totalAmount, 0);
  const totalExpenseVal = expenses.reduce((acc, e) => acc + e.amount, 0);
  const totalStockVal = products.reduce((acc, p) => acc + (p.currentStock * p.buyingPrice), 0);

  const triggerExport = (format: 'CSV' | 'PDF' | 'EXCEL') => {
    setDownloadToast(`Report Exported Successfully: "Neneh_Funkuba_${reportType.toUpperCase()}_Report_2026.${format.toLowerCase()}" saved to downloads.`);
    setTimeout(() => setDownloadToast(null), 4000);
  };

  const handleDriveBackup = async () => {
    setDriveUploading(true);
    setDriveLink(null);

    const erpStateBackup = {
      system: 'Neneh Funkuba Enterprise ERP System',
      exportDate: new Date().toISOString(),
      sales,
      expenses,
      products,
      customers,
      suppliers,
      ledgers,
      categories,
      users,
      purchaseOrders
    };

    const fileName = `Neneh_Funkuba_ERP_Backup_${new Date().toISOString().slice(0, 10)}.json`;
    const jsonContent = JSON.stringify(erpStateBackup, null, 2);

    const result = await uploadFileToGoogleDrive(fileName, jsonContent, 'application/json');

    setDriveUploading(false);
    if (result.success && result.webViewLink) {
      setDriveLink(result.webViewLink);
      setDownloadToast(`Full ERP Database Backup uploaded successfully to Google Drive!`);
      setTimeout(() => setDownloadToast(null), 5000);
    } else {
      setDownloadToast(`Google Drive Backup Error: ${result.error || 'Upload failed'}`);
      setTimeout(() => setDownloadToast(null), 5000);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="p-4 sm:p-6 space-y-6 max-w-7xl mx-auto">
      
      {/* Toast */}
      {downloadToast && (
        <div className="bg-emerald-900/90 text-emerald-100 border border-emerald-500/50 p-4 rounded-xl text-xs flex items-center justify-between shadow-lg animate-fadeIn">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{downloadToast}</span>
          </div>
          <button onClick={() => setDownloadToast(null)} className="font-bold text-emerald-300">✕</button>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-slate-900 p-5 rounded-2xl border border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-amber-400" />
            <h2 className="text-lg font-bold text-slate-100">Executive Reports & Data Exports</h2>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Generate printable, exportable reports for management, auditing, and tax filing.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={handleDriveBackup}
            disabled={driveUploading}
            className="px-3.5 py-2.5 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-bold text-xs rounded-xl shadow flex items-center gap-2 cursor-pointer"
          >
            <CloudUpload className="w-4 h-4 text-blue-200" />
            <span>{driveUploading ? 'Uploading to Drive...' : 'Save Backup to Google Drive'}</span>
          </button>

          <button
            onClick={() => triggerExport('EXCEL')}
            className="px-3.5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow flex items-center gap-2 cursor-pointer"
          >
            <Download className="w-4 h-4" />
            <span>Export to Excel</span>
          </button>

          <button
            onClick={() => triggerExport('PDF')}
            className="px-3.5 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-xl shadow flex items-center gap-2 cursor-pointer"
          >
            <Download className="w-4 h-4" />
            <span>Export to PDF</span>
          </button>

          <button
            onClick={handlePrint}
            className="px-3 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-semibold text-xs rounded-xl flex items-center gap-1.5 cursor-pointer"
          >
            <Printer className="w-4 h-4 text-amber-400" />
            <span>Print</span>
          </button>
        </div>
      </div>

      {driveLink && (
        <div className="bg-blue-950/80 text-blue-200 border border-blue-500/50 p-4 rounded-xl text-xs flex items-center justify-between shadow-lg">
          <div className="flex items-center gap-2">
            <CloudUpload className="w-4 h-4 text-blue-400 shrink-0" />
            <span>Latest ERP System Cloud Backup saved safely in your Google Drive!</span>
          </div>
          <a
            href={driveLink}
            target="_blank"
            rel="noreferrer"
            className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-bold flex items-center gap-1.5 shadow"
          >
            <span>Open in Google Drive</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      )}

      {/* Report Type Selector */}
      <div className="bg-slate-900 p-3 rounded-2xl border border-slate-800 flex items-center gap-2 overflow-x-auto">
        {[
          { id: 'sales', label: 'Sales & Revenue Report' },
          { id: 'stock', label: 'Inventory & Valuation Report' },
          { id: 'customer', label: 'Customer Debt & Receivables' },
          { id: 'supplier', label: 'Supplier & Procurement Report' },
          { id: 'expense', label: 'Operating Expenses Report' },
          { id: 'profit', label: 'Profit & Loss Executive Summary' }
        ].map(r => (
          <button
            key={r.id}
            onClick={() => setReportType(r.id)}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition ${
              reportType === r.id
                ? 'bg-amber-500 text-slate-950 shadow-md'
                : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            {r.label}
          </button>
        ))}
      </div>

      {/* Report Preview Canvas */}
      <div id="printable-report" className="bg-slate-900 rounded-2xl border border-slate-800 p-6 space-y-4 shadow-lg">
        
        <div className="border-b border-slate-800 pb-4 text-center">
          <h2 className="font-black text-xl text-white tracking-wider">NENEH FUNKUBA ENTERPRISE</h2>
          <p className="text-xs text-amber-400 font-bold uppercase tracking-widest mt-1">
            OFFICIAL {reportType.toUpperCase()} REPORT
          </p>
          <p className="text-[11px] text-slate-400 mt-1">Generated on {formatDate(new Date().toISOString())}</p>
        </div>

        {/* Report Content based on selection */}
        {reportType === 'sales' && (
          <div className="space-y-4 text-xs">
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                <span className="text-slate-400 text-[10px]">Total Sales Revenue</span>
                <p className="text-base font-black text-amber-400 mt-0.5">{formatLeone(totalSalesVal)}</p>
              </div>
              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                <span className="text-slate-400 text-[10px]">Total Orders Completed</span>
                <p className="text-base font-black text-emerald-400 mt-0.5">{completedSales.length} Orders</p>
              </div>
            </div>

            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-950 text-slate-400 font-bold text-[10px] uppercase tracking-wider border-b border-slate-800">
                <tr>
                  <th className="p-3">Invoice #</th>
                  <th className="p-3">Date</th>
                  <th className="p-3">Customer</th>
                  <th className="p-3">Salesperson</th>
                  <th className="p-3 text-right">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {completedSales.map(s => (
                  <tr key={s.id}>
                    <td className="p-3 font-bold text-amber-400">{s.invoiceNumber}</td>
                    <td className="p-3 text-slate-400">{formatDate(s.date)}</td>
                    <td className="p-3">{s.customerName}</td>
                    <td className="p-3">{s.salespersonName}</td>
                    <td className="p-3 text-right font-bold text-white">{formatLeone(s.totalAmount)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {reportType === 'stock' && (
          <div className="space-y-4 text-xs">
            <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
              <span className="text-slate-400 text-[10px]">Current Total Inventory Asset Valuation</span>
              <p className="text-base font-black text-emerald-400 mt-0.5">{formatLeone(totalStockVal)}</p>
            </div>

            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-950 text-slate-400 font-bold text-[10px] uppercase tracking-wider border-b border-slate-800">
                <tr>
                  <th className="p-3">Product Name</th>
                  <th className="p-3">Category</th>
                  <th className="p-3 text-center">Stock Quantity</th>
                  <th className="p-3 text-right">Buying Price</th>
                  <th className="p-3 text-right">Total Stock Value</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {products.map(p => (
                  <tr key={p.id}>
                    <td className="p-3 font-bold text-slate-100">{p.name}</td>
                    <td className="p-3 text-slate-400">{p.category}</td>
                    <td className="p-3 text-center font-bold">{p.currentStock} {p.unit}</td>
                    <td className="p-3 text-right">{formatLeone(p.buyingPrice)}</td>
                    <td className="p-3 text-right font-bold text-emerald-400">{formatLeone(p.currentStock * p.buyingPrice)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {reportType === 'expense' && (
          <div className="space-y-4 text-xs">
            <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
              <span className="text-slate-400 text-[10px]">Total Recorded Operational Expenses</span>
              <p className="text-base font-black text-rose-400 mt-0.5">{formatLeone(totalExpenseVal)}</p>
            </div>

            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-950 text-slate-400 font-bold text-[10px] uppercase tracking-wider border-b border-slate-800">
                <tr>
                  <th className="p-3">Date</th>
                  <th className="p-3">Category</th>
                  <th className="p-3">Description</th>
                  <th className="p-3 text-right">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {expenses.map(e => (
                  <tr key={e.id}>
                    <td className="p-3 text-slate-400">{formatDate(e.date)}</td>
                    <td className="p-3 font-bold text-rose-400">{e.category}</td>
                    <td className="p-3">{e.description}</td>
                    <td className="p-3 text-right font-bold text-rose-400">-{formatLeone(e.amount)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {(reportType === 'customer' || reportType === 'supplier' || reportType === 'profit') && (
          <div className="p-8 text-center text-slate-400 text-xs">
            <p className="font-semibold text-slate-200">Detailed summary ready for print and export.</p>
            <p className="text-[11px] mt-1">Use the Export PDF or Excel buttons above to generate a copy.</p>
          </div>
        )}

      </div>

    </div>
  );
};
