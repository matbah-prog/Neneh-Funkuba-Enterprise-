import React, { useState } from 'react';
import { useERP } from '../../context/ERPContext';
import { backupDatabaseToDrive } from '../../services/cloudSync';
import { DriveUploadResult } from '../../utils/googleDrive';
import { Login } from '../Auth/Login';
import { 
  Cloud, 
  CloudUpload, 
  CheckCircle2, 
  ExternalLink, 
  AlertCircle, 
  Database, 
  Download, 
  RotateCcw, 
  ShieldCheck, 
  Building2, 
  FileJson,
  Loader2,
  HardDrive
} from 'lucide-react';
import { formatDate } from '../../utils/formatters';

export const SettingsView: React.FC = () => {
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
    logActivity,
    resetAllData
  } = useERP();

  const [isSyncing, setIsSyncing] = useState(false);
  const [syncResult, setSyncResult] = useState<DriveUploadResult | null>(null);
  const [lastSyncTime, setLastSyncTime] = useState<string | null>(null);
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  // Handle Sync to Google Drive
  const handleSyncToDrive = async () => {
    setIsSyncing(true);
    setSyncResult(null);

    const erpPayload = {
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
    };

    try {
      const result = await backupDatabaseToDrive(erpPayload);
      setSyncResult(result);

      if (result.success) {
        const nowStr = new Date().toLocaleString();
        setLastSyncTime(nowStr);
        logActivity('Cloud Backup', `Exported ERP snapshot '${result.fileName}' to Google Drive`, 'System');
      } else {
        logActivity('Cloud Backup Failed', result.error || 'Failed to sync with Google Drive', 'System');
      }
    } catch (err: any) {
      console.error('Drive Sync Error:', err);
      setSyncResult({
        success: false,
        error: err?.message || 'An unexpected error occurred during Google Drive sync.'
      });
    } finally {
      setIsSyncing(false);
    }
  };

  // Local JSON Download
  const handleDownloadLocalJSON = () => {
    const erpPayload = {
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
    };

    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(erpPayload, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
    downloadAnchor.setAttribute("download", `Neneh_Funkuba_ERP_LocalBackup_${timestamp}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();

    logActivity('Local Export', 'Downloaded full JSON database backup locally', 'System');
  };

  return (
    <div className="space-y-8 max-w-6xl mx-auto pb-12">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-900 to-amber-950/40 p-6 rounded-2xl border border-slate-800 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-amber-500/10 text-amber-400 border border-amber-500/20">
              System Administration
            </span>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-500/10 text-blue-400 border border-blue-500/20">
              Cloud Sync Active
            </span>
          </div>
          <h1 className="text-2xl font-black text-white tracking-tight">System Settings & Cloud Integration</h1>
          <p className="text-xs text-slate-400 max-w-2xl">
            Manage enterprise configuration, Google Drive database synchronization, local snapshots, and security access controls.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleSyncToDrive}
            disabled={isSyncing}
            className="px-5 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-xl shadow-lg transition flex items-center gap-2 cursor-pointer disabled:opacity-50"
          >
            {isSyncing ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Syncing to Drive...</span>
              </>
            ) : (
              <>
                <CloudUpload className="w-4 h-4" />
                <span>Sync to Drive</span>
              </>
            )}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Cloud Sync & Drive Integration */}
        <div className="lg:col-span-2 space-y-6">
          {/* Main Google Drive Integration Card */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-5">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20">
                  <Cloud className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-white">Google Drive Automatic Cloud Backup</h2>
                  <p className="text-xs text-slate-400">Export real-time ERP snapshots directly to your Google Drive</p>
                </div>
              </div>
              {lastSyncTime && (
                <div className="text-right text-[11px] text-slate-400">
                  <span className="block text-emerald-400 font-semibold flex items-center gap-1 justify-end">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Last Synced
                  </span>
                  <span>{lastSyncTime}</span>
                </div>
              )}
            </div>

            {/* Sync Action Area */}
            <div className="bg-slate-950 rounded-xl p-5 border border-slate-800/80 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-1">
                  <h3 className="text-sm font-bold text-slate-200">Database Snapshot Payload</h3>
                  <p className="text-xs text-slate-400">
                    Includes {products.length} Products, {sales.length} Sales, {customers.length} Customers, {expenses.length} Expenses, and Ledger entries.
                  </p>
                </div>

                <button
                  onClick={handleSyncToDrive}
                  disabled={isSyncing}
                  className="px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl shadow-lg transition flex items-center justify-center gap-2.5 cursor-pointer shrink-0 disabled:opacity-50"
                >
                  {isSyncing ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin text-white" />
                      <span>Syncing to Google Drive...</span>
                    </>
                  ) : (
                    <>
                      <CloudUpload className="w-4 h-4 text-white" />
                      <span>Sync to Drive Now</span>
                    </>
                  )}
                </button>
              </div>

              {/* Status Banner */}
              {syncResult && (
                <div className={`p-4 rounded-xl border text-xs flex items-start gap-3 ${
                  syncResult.success 
                    ? 'bg-emerald-950/60 border-emerald-500/30 text-emerald-300' 
                    : 'bg-rose-950/60 border-rose-500/30 text-rose-300'
                }`}>
                  {syncResult.success ? (
                    <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                  ) : (
                    <AlertCircle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
                  )}

                  <div className="space-y-1.5 flex-1">
                    <p className="font-bold text-sm">
                      {syncResult.success ? 'Backup Successfully Saved to Google Drive!' : 'Google Drive Backup Failed'}
                    </p>
                    {syncResult.success ? (
                      <p className="text-emerald-200/90 text-xs">
                        Snapshot <strong className="text-white">{syncResult.fileName}</strong> was uploaded with ID <code className="bg-slate-900 px-1.5 py-0.5 rounded text-[10px] text-amber-300">{syncResult.fileId}</code>.
                      </p>
                    ) : (
                      <p className="text-rose-200/90 text-xs">{syncResult.error}</p>
                    )}

                    {syncResult.webViewLink && (
                      <div className="pt-1">
                        <a
                          href={syncResult.webViewLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-200 text-xs font-semibold rounded-lg border border-emerald-500/40 transition"
                        >
                          <span>Open Snapshot in Google Drive</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Offline & Local JSON Backup Options */}
            <div className="border-t border-slate-800 pt-5 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-slate-200 flex items-center gap-2">
                    <HardDrive className="w-4 h-4 text-amber-400" />
                    <span>Local JSON Backup & Data Export</span>
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">Download an offline JSON database file for local archival.</p>
                </div>

                <button
                  onClick={handleDownloadLocalJSON}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs rounded-xl border border-slate-700 transition flex items-center gap-2 cursor-pointer"
                >
                  <Download className="w-4 h-4 text-amber-400" />
                  <span>Download JSON</span>
                </button>
              </div>
            </div>
          </div>

          {/* Business & System Profile Card */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
            <div className="flex items-center gap-3 border-b border-slate-800 pb-3">
              <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
                <Building2 className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-base font-bold text-white">Enterprise & Profile Information</h2>
                <p className="text-xs text-slate-400">Business identification and local currency configuration</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800/80 space-y-1">
                <span className="text-[10px] uppercase tracking-wider text-slate-500 font-bold">Business Name</span>
                <p className="text-sm font-bold text-slate-100">Neneh Funkuba Enterprise</p>
                <p className="text-[11px] text-amber-400">Retail, Wholesale & Multi-Branch Management</p>
              </div>

              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800/80 space-y-1">
                <span className="text-[10px] uppercase tracking-wider text-slate-500 font-bold">Base Currency</span>
                <p className="text-sm font-bold text-slate-100">Sierra Leonean Leone (NLe / SLL)</p>
                <p className="text-[11px] text-slate-400">Symbol: <strong>NLe</strong></p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Google Auth Portal & Reset Tools */}
        <div className="space-y-6">
          {/* Authentication Status */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
            <div className="flex items-center gap-2.5 border-b border-slate-800 pb-3">
              <ShieldCheck className="w-5 h-5 text-blue-400" />
              <h2 className="text-base font-bold text-white">Google Account Authentication</h2>
            </div>
            
            <Login />
          </div>

          {/* Emergency System Reset */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
            <div className="flex items-center gap-2.5 border-b border-slate-800 pb-3">
              <RotateCcw className="w-5 h-5 text-rose-400" />
              <h2 className="text-base font-bold text-white">Database Operations</h2>
            </div>

            <p className="text-xs text-slate-400">
              Reset system state to original factory demonstration seed data.
            </p>

            <button
              onClick={() => setShowResetConfirm(true)}
              className="w-full py-2.5 bg-rose-950/60 hover:bg-rose-900/80 text-rose-300 font-bold text-xs rounded-xl border border-rose-500/30 transition flex items-center justify-center gap-2 cursor-pointer"
            >
              <RotateCcw className="w-4 h-4 text-rose-400" />
              <span>Reset Database to Initial Seeds</span>
            </button>
          </div>
        </div>
      </div>

      {/* Confirmation Modal for Reset */}
      {showResetConfirm && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center gap-3 text-rose-400">
              <div className="p-3 bg-rose-500/10 rounded-xl border border-rose-500/20">
                <AlertCircle className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white">Confirm Reset</h3>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              Are you sure you want to reset all local ERP data to initial seed records? Any unsaved sales or modifications will be replaced.
            </p>
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setShowResetConfirm(false)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs rounded-xl transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  resetAllData();
                  setShowResetConfirm(false);
                }}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs rounded-xl transition cursor-pointer"
              >
                Yes, Reset All Data
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
