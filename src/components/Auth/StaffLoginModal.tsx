import React, { useState } from 'react';
import { useERP } from '../../context/ERPContext';
import { UserAccount } from '../../types';
import { ShieldCheck, Lock, UserCheck, KeyRound, CheckCircle2, X, Sparkles, User, HelpCircle } from 'lucide-react';

interface StaffLoginModalProps {
  onClose: () => void;
}

export const StaffLoginModal: React.FC<StaffLoginModalProps> = ({ onClose }) => {
  const { users, currentUser, setCurrentUserRole, logActivity } = useERP();
  
  const [selectedUserId, setSelectedUserId] = useState<string>(currentUser.id);
  const [enteredPin, setEnteredPin] = useState<string>('');
  const [pinError, setPinError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const selectedUser = users.find(u => u.id === selectedUserId) || users[0];

  const handleLogin = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setPinError(null);

    // Verify PIN if set
    if (selectedUser.pin && enteredPin !== selectedUser.pin) {
      setPinError('Incorrect PIN code. Please check the staff reference below.');
      return;
    }

    // Perform staff switch
    setCurrentUserRole(selectedUser.role);
    setSuccessMsg(`Welcome back, ${selectedUser.name}! Login successful.`);
    logActivity('Staff Login', `Staff logged in as ${selectedUser.name} (${selectedUser.role})`, 'auth');

    setTimeout(() => {
      onClose();
    }, 800);
  };

  const handleQuickSelect = (user: UserAccount) => {
    setSelectedUserId(user.id);
    setEnteredPin(user.pin || '');
    setPinError(null);
  };

  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-lg w-full p-6 space-y-5 shadow-2xl relative">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-lg transition"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="text-center space-y-1.5 pt-2">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-400 flex items-center justify-center mx-auto">
            <KeyRound className="w-6 h-6" />
          </div>
          <h2 className="text-lg font-extrabold text-slate-100">Staff Account Access & Login</h2>
          <p className="text-xs text-slate-400">
            Select your staff account and enter your security PIN to switch active session
          </p>
        </div>

        {/* Staff Quick Selector Grid */}
        <div className="space-y-2">
          <label className="text-xs font-bold text-slate-300 flex items-center justify-between">
            <span>Select Active Staff Member:</span>
            <span className="text-[10px] text-amber-400">5 Staff Registered</span>
          </label>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {users.map((u) => {
              const isSelected = u.id === selectedUserId;
              const isCurrent = u.id === currentUser.id;

              return (
                <button
                  key={u.id}
                  type="button"
                  onClick={() => handleQuickSelect(u)}
                  className={`p-3 rounded-xl border text-left transition flex items-center justify-between cursor-pointer ${
                    isSelected 
                      ? 'bg-amber-500/10 border-amber-500/60 text-slate-100 shadow'
                      : 'bg-slate-950/80 border-slate-800 hover:border-slate-700 text-slate-300'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs ${
                      isSelected ? 'bg-amber-500 text-slate-950' : 'bg-slate-800 text-amber-400'
                    }`}>
                      {u.name.split(' ').map(n => n[0]).join('')}
                    </div>
                    <div>
                      <span className="font-bold text-xs block text-slate-100">{u.name}</span>
                      <span className="text-[10px] text-slate-400 uppercase font-semibold block">
                        {u.role.replace('_', ' ')}
                      </span>
                    </div>
                  </div>

                  {isCurrent && (
                    <span className="px-1.5 py-0.5 rounded text-[9px] font-black bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                      ACTIVE
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Selected Staff Login Form */}
        <form onSubmit={handleLogin} className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-3">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
            <div className="flex items-center gap-2">
              <User className="w-4 h-4 text-amber-400" />
              <span className="text-xs font-bold text-slate-200">{selectedUser.name}</span>
            </div>
            <span className="text-[10px] uppercase font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
              {selectedUser.role.replace('_', ' ')}
            </span>
          </div>

          <div>
            <label className="text-xs font-medium text-slate-400 block mb-1">Enter Staff Security PIN</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
              <input
                type="password"
                maxLength={4}
                value={enteredPin}
                onChange={e => setEnteredPin(e.target.value)}
                placeholder="4-digit PIN code"
                className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-amber-500 font-mono tracking-widest"
              />
            </div>
          </div>

          {pinError && (
            <p className="text-xs text-rose-400 font-medium bg-rose-950/50 p-2 rounded-lg border border-rose-500/30">
              {pinError}
            </p>
          )}

          {successMsg && (
            <div className="text-xs text-emerald-300 font-bold bg-emerald-950/50 p-2 rounded-lg border border-emerald-500/30 flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>{successMsg}</span>
            </div>
          )}

          <button
            type="submit"
            className="w-full py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs rounded-xl shadow transition flex items-center justify-center gap-2 cursor-pointer"
          >
            <UserCheck className="w-4 h-4" />
            <span>Authenticate & Switch Session</span>
          </button>
        </form>

        {/* Staff Credentials Reference List */}
        <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800/80 space-y-1.5 text-xs">
          <div className="flex items-center gap-1.5 text-slate-400 font-bold text-[11px]">
            <HelpCircle className="w-3.5 h-3.5 text-amber-400" />
            <span>Staff Registered Access Credentials & Emails Reference:</span>
          </div>
          <div className="grid grid-cols-1 gap-y-1 text-[11px] text-slate-300 pt-1">
            <div>• <strong className="text-slate-100">Neneh Funkuba</strong> (Owner): <span className="text-slate-400">matbah19@gmail.com</span> | PIN <code className="text-amber-400 font-bold">0000</code></div>
            <div>• <strong className="text-slate-100">Mr. Ibrahim</strong> (Manager): <span className="text-slate-400">Ikoroma864@gmail.com</span> | PIN <code className="text-amber-400 font-bold">1002</code></div>
            <div>• <strong className="text-slate-100">Alhassana Bah</strong> (Procurement): <span className="text-slate-400">bahalha04@gmail.com</span> | PIN <code className="text-amber-400 font-bold">1001</code></div>
            <div>• <strong className="text-slate-100">Mary</strong> (Sales 1): <span className="text-slate-400">maryjay117741@gmail.com</span> | PIN <code className="text-amber-400 font-bold">1003</code></div>
            <div>• <strong className="text-slate-100">Haja Mansaray</strong> (Sales 2): <span className="text-slate-400">Mansarayhaja8890@gmail.com</span> | PIN <code className="text-amber-400 font-bold">1004</code></div>
          </div>
        </div>

      </div>
    </div>
  );
};
