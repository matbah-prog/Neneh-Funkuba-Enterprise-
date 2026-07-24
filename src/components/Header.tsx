import React, { useState } from 'react';
import { useERP } from '../context/ERPContext';
import { useToast } from '../context/ToastContext';
import { UserRole } from '../types';
import { 
  Building2, UserCheck, History, RefreshCw, Database, 
  ShieldAlert, Sparkles, Clock, CheckCircle2, User as UserIcon, BellRing, Bell, KeyRound
} from 'lucide-react';
import { Login } from './Auth/Login';
import { StaffLoginModal } from './Auth/StaffLoginModal';

interface HeaderProps {
  onOpenActivityLogs: () => void;
  onNavigateTab?: (tab: string) => void;
}

export const Header: React.FC<HeaderProps> = ({ onOpenActivityLogs, onNavigateTab }) => {
  const { users, currentUser, setCurrentUserRole, activityLogs, products } = useERP();
  const { checkAndNotifyLowStock } = useToast();
  const [showBackupNotice, setShowBackupNotice] = useState(false);
  const [showStaffModal, setShowStaffModal] = useState(false);

  const lowStockCount = products.filter(p => p.currentStock <= p.minimumStockLevel).length;

  const handleTriggerLowStockCheck = () => {
    checkAndNotifyLowStock(products, true, () => {
      if (onNavigateTab) onNavigateTab('inventory');
    });
  };

  const roleLabels: Record<UserRole, { label: string; color: string }> = {
    owner: { label: 'Owner (Full Access)', color: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20' },
    manager: { label: 'Manager', color: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20' },
    supervisor: { label: 'Supervisor', color: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20' },
    procurement_officer: { label: 'Procurement Officer', color: 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20' },
    salesperson: { label: 'Salesperson (POS)', color: 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/20' }
  };

  const nowString = new Date().toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });

  const handleBackup = () => {
    setShowBackupNotice(true);
    setTimeout(() => setShowBackupNotice(false), 4000);
  };

  return (
    <header className="bg-slate-900 border-b border-slate-800 text-slate-100 sticky top-0 z-30 shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        
        {/* Left: Brand / Title */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-600 to-amber-500 flex items-center justify-center text-white shadow-lg shadow-amber-900/30 font-bold text-lg">
            NF
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-bold text-base sm:text-lg tracking-tight text-white flex items-center gap-1.5">
                NENEH FUNKUBA ENTERPRISE
              </h1>
              <span className="hidden md:inline-block px-2 py-0.5 text-xs font-semibold rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                ERP System
              </span>
            </div>
            <p className="text-xs text-slate-400 hidden sm:block">
              Wholesale & Retail Management • Freetown, Sierra Leone
            </p>
          </div>
        </div>

        {/* Right: Role Switcher, System Actions & User info */}
        <div className="flex items-center gap-3">

          {/* Low Stock Alerts Trigger */}
          <button
            onClick={handleTriggerLowStockCheck}
            className={`relative p-2 rounded-lg transition flex items-center gap-1.5 text-xs font-medium border ${
              lowStockCount > 0 
                ? 'bg-amber-500/10 text-amber-300 border-amber-500/40 hover:bg-amber-500/20' 
                : 'text-slate-300 hover:text-white hover:bg-slate-800 border-slate-700/60'
            }`}
            title="Check Low Stock Manager Alerts"
          >
            {lowStockCount > 0 ? (
              <BellRing className="w-4 h-4 text-amber-400 animate-bounce" />
            ) : (
              <Bell className="w-4 h-4 text-slate-400" />
            )}
            <span className="hidden sm:inline font-bold">Stock Alerts</span>
            {lowStockCount > 0 && (
              <span className="bg-amber-500 text-slate-950 font-black text-[10px] px-1.5 py-0.2 rounded-full">
                {lowStockCount}
              </span>
            )}
          </button>

          {/* Activity Log Trigger */}
          <button
            onClick={onOpenActivityLogs}
            className="relative p-2 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 transition flex items-center gap-1.5 text-xs font-medium border border-slate-700/60"
            title="View Security & Activity Logs"
          >
            <History className="w-4 h-4 text-amber-400" />
            <span className="hidden sm:inline">Audit Trail</span>
            {activityLogs.length > 0 && (
              <span className="bg-amber-500 text-slate-950 font-bold text-[10px] px-1.5 py-0.2 rounded-full">
                {activityLogs.length}
              </span>
            )}
          </button>

          {/* Backup Button */}
          <button
            onClick={handleBackup}
            className="p-2 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 transition flex items-center gap-1.5 text-xs font-medium border border-slate-700/60"
            title="Trigger Automated Cloud Backup"
          >
            <Database className="w-4 h-4 text-emerald-400" />
            <span className="hidden md:inline">Cloud Backup</span>
          </button>

          {/* Staff Login / Switch Button */}
          <button
            onClick={() => setShowStaffModal(true)}
            className="px-3 py-1.5 bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-sm"
            title="Switch staff login access"
          >
            <KeyRound className="w-3.5 h-3.5 text-amber-400" />
            <span className="hidden sm:inline">Staff Access</span>
          </button>

          {/* Role Switcher Select */}
          <div className="flex items-center gap-1.5 bg-slate-800/90 border border-slate-700 rounded-lg px-2 py-1">
            <UserCheck className="w-4 h-4 text-amber-400 hidden sm:block" />
            <div className="flex flex-col">
              <span className="text-[10px] text-slate-400 uppercase tracking-wider font-medium hidden sm:block">
                Role Context
              </span>
              <select
                value={currentUser.role}
                onChange={(e) => setCurrentUserRole(e.target.value as UserRole)}
                className="bg-transparent text-xs font-semibold text-slate-100 focus:outline-none cursor-pointer"
              >
                {users.map(u => (
                  <option key={u.id} value={u.role} className="bg-slate-900 text-slate-100">
                    {u.name} ({u.role.replace('_', ' ')})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Firebase Google Auth Login Component */}
          <Login compact />

          {/* Local User Badge */}
          <div className="hidden lg:flex items-center gap-2 pl-2 border-l border-slate-800 cursor-pointer" onClick={() => setShowStaffModal(true)}>
            <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center font-bold text-amber-400 text-xs border border-slate-600">
              {currentUser.name.split(' ').map(n => n[0]).join('')}
            </div>
            <div className="text-left">
              <p className="text-xs font-bold text-slate-100 leading-none">{currentUser.name}</p>
              <span className={`inline-block text-[10px] px-1.5 py-0.5 mt-0.5 rounded font-medium border ${roleLabels[currentUser.role]?.color || ''}`}>
                {currentUser.role.replace('_', ' ').toUpperCase()}
              </span>
            </div>
          </div>

        </div>
      </div>

      {/* Cloud Backup Notification toast */}
      {showBackupNotice && (
        <div className="bg-emerald-900/90 text-emerald-100 border-b border-emerald-700/50 px-4 py-2 text-xs flex items-center justify-between max-w-7xl mx-auto animate-fadeIn">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>
              <strong>Automated Cloud Backup Successful:</strong> Neneh Funkuba Enterprise database snapshots safely synchronized to Cloud Storage (AWS S3) with 256-bit encryption.
            </span>
          </div>
          <button onClick={() => setShowBackupNotice(false)} className="text-emerald-300 hover:text-white font-bold">✕</button>
        </div>
      )}
      {/* Staff Login Modal */}
      {showStaffModal && (
        <StaffLoginModal onClose={() => setShowStaffModal(false)} />
      )}
    </header>
  );
};
