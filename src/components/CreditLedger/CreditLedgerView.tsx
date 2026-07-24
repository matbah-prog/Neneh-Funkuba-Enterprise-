import React, { useState } from 'react';
import { useERP } from '../../context/ERPContext';
import { formatLeone, formatDate } from '../../utils/formatters';
import { CreditCard, Send, CheckCircle, Clock, AlertTriangle, Search, Phone } from 'lucide-react';

export const CreditLedgerView: React.FC = () => {
  const { customers, sales, addCustomerPayment } = useERP();

  const [searchQuery, setSearchQuery] = useState('');
  const [reminderToast, setReminderToast] = useState<string | null>(null);

  // Filter customers with active credit debts
  const debtCustomers = customers.filter(c => c.creditBalance > 0 && 
    (c.name.toLowerCase().includes(searchQuery.toLowerCase()) || c.phone.includes(searchQuery))
  );

  const totalCreditOwed = customers.reduce((acc, c) => acc + c.creditBalance, 0);

  const handleSendReminder = (customerName: string, phone: string, balance: number) => {
    setReminderToast(`SMS Payment Reminder sent to ${customerName} (${phone}): "Dear customer, your outstanding credit balance at Neneh Funkuba Enterprise is ${formatLeone(balance)}. Kindly settle at your earliest convenience."`);
    setTimeout(() => setReminderToast(null), 5000);
  };

  return (
    <div className="p-4 sm:p-6 space-y-6 max-w-7xl mx-auto">
      
      {/* Toast */}
      {reminderToast && (
        <div className="bg-amber-900/90 text-amber-100 border border-amber-500/50 p-4 rounded-xl text-xs flex items-center justify-between shadow-lg animate-fadeIn">
          <div className="flex items-center gap-2">
            <Send className="w-4 h-4 text-amber-400 shrink-0" />
            <span>{reminderToast}</span>
          </div>
          <button onClick={() => setReminderToast(null)} className="font-bold text-amber-300">✕</button>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-slate-900 p-5 rounded-2xl border border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <CreditCard className="w-5 h-5 text-amber-400" />
            <h2 className="text-lg font-bold text-slate-100">Customer Credit Ledger & Repayment Tracking</h2>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Monitor credit sales, repayment history, due dates, and send automated repayment reminders.
          </p>
        </div>

        <div className="bg-slate-950 px-4 py-2 rounded-xl border border-slate-800 text-right">
          <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Total Credit Outstanding</span>
          <span className="text-lg font-extrabold text-amber-400">{formatLeone(totalCreditOwed)}</span>
        </div>
      </div>

      {/* Search */}
      <div className="bg-slate-900 p-3 rounded-xl border border-slate-800">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search indebted customer or phone..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-9 pr-4 py-2 text-xs text-slate-100 focus:outline-none focus:border-amber-500"
          />
        </div>
      </div>

      {/* Debtors List */}
      <div className="bg-slate-900 rounded-2xl border border-slate-800 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950 text-slate-400 font-bold text-[10px] uppercase tracking-wider border-b border-slate-800">
              <tr>
                <th className="p-3.5">Customer Name</th>
                <th className="p-3.5">Contact Phone</th>
                <th className="p-3.5 text-right">Total Lifetime Sales</th>
                <th className="p-3.5 text-right">Current Credit Balance</th>
                <th className="p-3.5 text-center">Debt Status</th>
                <th className="p-3.5 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {debtCustomers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-8 text-slate-500">
                    No active credit debts found. All customer accounts are fully settled!
                  </td>
                </tr>
              ) : (
                debtCustomers.map(c => (
                  <tr key={c.id} className="hover:bg-slate-800/40 transition">
                    <td className="p-3.5 font-bold text-slate-100">
                      {c.name}
                    </td>

                    <td className="p-3.5 text-slate-400 font-mono">
                      {c.phone}
                    </td>

                    <td className="p-3.5 text-right text-slate-300 font-semibold">
                      {formatLeone(c.totalPurchases)}
                    </td>

                    <td className="p-3.5 text-right font-extrabold text-amber-400">
                      {formatLeone(c.creditBalance)}
                    </td>

                    <td className="p-3.5 text-center">
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                        Active Debt Owed
                      </span>
                    </td>

                    <td className="p-3.5 text-center">
                      <button
                        onClick={() => handleSendReminder(c.name, c.phone, c.creditBalance)}
                        className="px-3 py-1 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 rounded-lg text-xs font-bold transition inline-flex items-center gap-1.5"
                      >
                        <Send className="w-3 h-3" />
                        <span>Send SMS Reminder</span>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};
