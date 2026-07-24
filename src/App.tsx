import React, { useState, useEffect } from 'react';
import { ERPProvider, useERP } from './context/ERPContext';
import { ToastProvider, useToast } from './context/ToastContext';
import { ToastContainer } from './components/Toast/ToastContainer';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { startAutomated24HourSync } from './services/cloudSync';

// Views
import { ExecutiveDashboard } from './components/Dashboard/ExecutiveDashboard';
import { POSScreen } from './components/POS/POSScreen';
import { SalesLedgerView } from './components/Sales/SalesLedgerView';
import { InventoryView } from './components/Inventory/InventoryView';
import { ProcurementView } from './components/Procurement/ProcurementView';
import { CreditLedgerView } from './components/CreditLedger/CreditLedgerView';
import { CustomerView } from './components/Customers/CustomerView';
import { SupplierView } from './components/Suppliers/SupplierView';
import { ExpenseView } from './components/Expenses/ExpenseView';
import { LedgersView } from './components/Ledgers/LedgersView';
import { FinancialStatementsView } from './components/Financials/FinancialStatementsView';
import { ReportsView } from './components/Reports/ReportsView';
import { StaffView } from './components/Staff/StaffView';
import { SettingsView } from './components/Settings/SettingsView';

// Modals
import { X, Shield, Clock, FileText } from 'lucide-react';
import { formatDate } from './utils/formatters';

const AppContent: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [showActivityLogs, setShowActivityLogs] = useState<boolean>(false);
  const { 
    products, 
    customers, 
    suppliers, 
    expenses, 
    ledgers, 
    sales, 
    purchaseOrders, 
    activityLogs, 
    users, 
    heldCarts,
    currentUser,
    logActivity 
  } = useERP();

  const { checkAndNotifyLowStock } = useToast();

  // Monitor stock levels and issue manager toast alerts when products hit/fall below min threshold
  useEffect(() => {
    const isManagerOrAbove = ['owner', 'manager', 'supervisor'].includes(currentUser.role);
    checkAndNotifyLowStock(products, isManagerOrAbove, () => setActiveTab('inventory'));
  }, [products, currentUser.role, checkAndNotifyLowStock]);

  // Initialize automated 24-hour background cloud backup schedule
  useEffect(() => {
    const cleanup = startAutomated24HourSync(
      () => ({
        system: 'Neneh Funkuba Enterprise ERP System',
        version: '1.0.0',
        exportDate: new Date().toISOString(),
        products,
        customers,
        suppliers,
        expenses,
        ledgers,
        sales,
        purchaseOrders,
        activityLogs,
        users,
        heldCarts
      }),
      (result) => {
        if (result.success) {
          logActivity('Automated 24h Backup', `Saved Google Drive backup '${result.fileName}'`, 'System');
        }
      }
    );

    return cleanup;
  }, [products, customers, suppliers, expenses, ledgers, sales, purchaseOrders, activityLogs, users, heldCarts, logActivity]);

  const renderActiveView = () => {
    switch (activeTab) {
      case 'dashboard':
        return <ExecutiveDashboard onNavigate={setActiveTab} />;
      case 'pos':
        return <POSScreen />;
      case 'sales_ledger':
        return <SalesLedgerView />;
      case 'inventory':
        return <InventoryView />;
      case 'procurement':
        return <ProcurementView />;
      case 'credit_ledger':
        return <CreditLedgerView />;
      case 'customers':
        return <CustomerView />;
      case 'suppliers':
        return <SupplierView />;
      case 'expenses':
        return <ExpenseView />;
      case 'ledgers':
        return <LedgersView />;
      case 'financials':
        return <FinancialStatementsView />;
      case 'reports':
        return <ReportsView />;
      case 'staff':
        return <StaffView />;
      case 'settings':
        return <SettingsView />;
      default:
        return <ExecutiveDashboard onNavigate={setActiveTab} />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans antialiased selection:bg-amber-500 selection:text-slate-950">
      {/* Header Bar */}
      <Header 
        onOpenActivityLogs={() => setShowActivityLogs(true)} 
        onNavigateTab={setActiveTab}
      />

      {/* Main Container */}
      <div className="flex-1 flex overflow-hidden">
        {/* Navigation Sidebar */}
        <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />

        {/* Content Area */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 space-y-6">
          {renderActiveView()}
        </main>
      </div>

      {/* Manager Toast Notification Container */}
      <ToastContainer onNavigateTab={setActiveTab} />

      {/* Audit Trail & Activity Logs Modal */}
      {showActivityLogs && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-3xl w-full max-h-[85vh] flex flex-col shadow-2xl overflow-hidden">
            <div className="p-4 sm:p-6 border-b border-slate-800 flex items-center justify-between bg-slate-900/90">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
                  <Shield className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-lg text-white">System Activity & Audit Trail</h3>
                  <p className="text-xs text-slate-400">Security event logging and operational history</p>
                </div>
              </div>
              <button
                onClick={() => setShowActivityLogs(false)}
                className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-3 flex-1">
              {activityLogs.length === 0 ? (
                <div className="text-center py-12 text-slate-500">
                  <Clock className="w-10 h-10 mx-auto mb-2 opacity-50" />
                  <p>No activity recorded yet in current session.</p>
                </div>
              ) : (
                activityLogs.map((log) => (
                  <div
                    key={log.id}
                    className="bg-slate-950 p-4 rounded-xl border border-slate-800 flex items-start justify-between gap-4"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20 uppercase tracking-wider">
                          {log.category}
                        </span>
                        <span className="text-xs font-semibold text-white">{log.action}</span>
                      </div>
                      <p className="text-xs text-slate-300">{log.details}</p>
                      <div className="flex items-center gap-3 text-[10px] text-slate-500 pt-1">
                        <span>Performed by: <strong className="text-slate-400">{log.userName}</strong> ({log.userRole})</span>
                      </div>
                    </div>
                    <span className="text-[10px] text-slate-500 whitespace-nowrap">
                      {formatDate(log.timestamp)}
                    </span>
                  </div>
                ))
              )}
            </div>

            <div className="p-4 border-t border-slate-800 bg-slate-900/90 text-right">
              <button
                onClick={() => setShowActivityLogs(false)}
                className="px-5 py-2 bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs rounded-xl transition"
              >
                Close Audit Trail
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default function App() {
  return (
    <ERPProvider>
      <ToastProvider>
        <AppContent />
      </ToastProvider>
    </ERPProvider>
  );
}
