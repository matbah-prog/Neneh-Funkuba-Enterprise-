import React, { useState } from 'react';
import { useERP } from '../../context/ERPContext';
import { LedgerType } from '../../types';
import { formatLeone, formatDate } from '../../utils/formatters';
import { Wallet, ArrowRightLeft, PlusCircle, Building, Smartphone, DollarSign, ArrowDownLeft, ArrowUpRight } from 'lucide-react';

export const LedgersView: React.FC = () => {
  const { ledgers, transferLedgerFunds, addManualLedgerEntry } = useERP();

  const [activeLedgerType, setActiveLedgerType] = useState<LedgerType | 'all'>('all');

  // Modals
  const [showTransferModal, setShowTransferModal] = useState(false);
  const [showManualModal, setShowManualModal] = useState(false);

  // Transfer Form State
  const [fromType, setFromType] = useState<LedgerType>('cash');
  const [toType, setToType] = useState<LedgerType>('orange_money');
  const [transferAmount, setTransferAmount] = useState('');
  const [transferDesc, setTransferDesc] = useState('');

  // Manual Entry Form State
  const [entryLedgerType, setEntryLedgerType] = useState<LedgerType>('cash');
  const [entryDirection, setEntryDirection] = useState<'debit' | 'credit'>('debit');
  const [entryAmount, setEntryAmount] = useState('');
  const [entryDesc, setEntryDesc] = useState('');

  // Calculate channel balances
  const getBalance = (type: LedgerType) => {
    return ledgers
      .filter(l => l.ledgerType === type)
      .reduce((acc, l) => {
        if (l.type === 'debit') return acc + l.amount;
        if (l.type === 'credit') return acc - l.amount - (l.feeCharge || 0);
        return acc;
      }, 0);
  };

  const cashBal = getBalance('cash');
  const orangeBal = getBalance('orange_money');
  const afriBal = getBalance('afrimoney');
  const qBal = getBalance('qmoney');
  const bankBal = getBalance('bank');
  const grandTotalLiquid = cashBal + orangeBal + afriBal + qBal + bankBal;

  const filteredEntries = ledgers.filter(l => {
    if (activeLedgerType === 'all') return true;
    return l.ledgerType === activeLedgerType;
  });

  const handleTransferSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (fromType === toType || !transferAmount) {
      alert('Source and destination accounts must be different.');
      return;
    }
    const amt = parseFloat(transferAmount) || 0;
    transferLedgerFunds(fromType, toType, amt, transferDesc || `Fund Transfer ${fromType.toUpperCase()} -> ${toType.toUpperCase()}`);

    setTransferAmount('');
    setTransferDesc('');
    setShowTransferModal(false);
  };

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!entryAmount) return;

    addManualLedgerEntry({
      ledgerType: entryLedgerType,
      type: entryDirection,
      amount: parseFloat(entryAmount) || 0,
      referenceType: 'adjustment',
      description: entryDesc || `Manual ${entryDirection.toUpperCase()} adjustment`
    });

    setEntryAmount('');
    setEntryDesc('');
    setShowManualModal(false);
  };

  return (
    <div className="p-4 sm:p-6 space-y-6 max-w-7xl mx-auto">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-slate-900 p-5 rounded-2xl border border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <Wallet className="w-5 h-5 text-amber-400" />
            <h2 className="text-lg font-bold text-slate-100">Cash Book & Multi-Channel Ledgers</h2>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Separate, real-time ledgers for Physical Cash, Orange Money, Afrimoney, QMoney, and Bank Accounts.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowTransferModal(true)}
            className="px-3.5 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-xl shadow flex items-center gap-2 cursor-pointer"
          >
            <ArrowRightLeft className="w-4 h-4" />
            <span>Transfer Funds</span>
          </button>

          <button
            onClick={() => setShowManualModal(true)}
            className="px-3 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-semibold text-xs rounded-xl flex items-center gap-1.5 cursor-pointer"
          >
            <PlusCircle className="w-4 h-4 text-amber-400" />
            <span>Manual Entry</span>
          </button>
        </div>
      </div>

      {/* Account Balance Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-3">
        
        {/* Grand Total */}
        <div className="bg-gradient-to-br from-amber-950/40 to-slate-900 p-3.5 rounded-xl border border-amber-500/30">
          <span className="text-[10px] uppercase tracking-wider font-bold text-amber-400">Total Liquid Funds</span>
          <p className="text-base font-black text-amber-300 mt-1">{formatLeone(grandTotalLiquid)}</p>
          <span className="text-[10px] text-slate-400">All channels combined</span>
        </div>

        {/* Cash */}
        <div 
          onClick={() => setActiveLedgerType('cash')} 
          className={`p-3.5 rounded-xl border cursor-pointer transition ${activeLedgerType === 'cash' ? 'bg-slate-800 border-emerald-500' : 'bg-slate-900 border-slate-800 hover:border-slate-700'}`}
        >
          <span className="text-xs font-bold text-emerald-400">Cash Register</span>
          <p className="text-sm font-bold text-white mt-1">{formatLeone(cashBal)}</p>
          <span className="text-[10px] text-slate-500">Physical shop till</span>
        </div>

        {/* Orange Money */}
        <div 
          onClick={() => setActiveLedgerType('orange_money')} 
          className={`p-3.5 rounded-xl border cursor-pointer transition ${activeLedgerType === 'orange_money' ? 'bg-slate-800 border-amber-500' : 'bg-slate-900 border-slate-800 hover:border-slate-700'}`}
        >
          <span className="text-xs font-bold text-amber-400">Orange Money</span>
          <p className="text-sm font-bold text-white mt-1">{formatLeone(orangeBal)}</p>
          <span className="text-[10px] text-slate-500">Till #+232 76 990 111</span>
        </div>

        {/* Afrimoney */}
        <div 
          onClick={() => setActiveLedgerType('afrimoney')} 
          className={`p-3.5 rounded-xl border cursor-pointer transition ${activeLedgerType === 'afrimoney' ? 'bg-slate-800 border-red-500' : 'bg-slate-900 border-slate-800 hover:border-slate-700'}`}
        >
          <span className="text-xs font-bold text-red-400">Afrimoney</span>
          <p className="text-sm font-bold text-white mt-1">{formatLeone(afriBal)}</p>
          <span className="text-[10px] text-slate-500">Till #+232 77 123 999</span>
        </div>

        {/* QMoney */}
        <div 
          onClick={() => setActiveLedgerType('qmoney')} 
          className={`p-3.5 rounded-xl border cursor-pointer transition ${activeLedgerType === 'qmoney' ? 'bg-slate-800 border-blue-500' : 'bg-slate-900 border-slate-800 hover:border-slate-700'}`}
        >
          <span className="text-xs font-bold text-blue-400">QMoney</span>
          <p className="text-sm font-bold text-white mt-1">{formatLeone(qBal)}</p>
          <span className="text-[10px] text-slate-500">Wallet #+232 30 555 888</span>
        </div>

        {/* Bank */}
        <div 
          onClick={() => setActiveLedgerType('bank')} 
          className={`p-3.5 rounded-xl border cursor-pointer transition ${activeLedgerType === 'bank' ? 'bg-slate-800 border-purple-500' : 'bg-slate-900 border-slate-800 hover:border-slate-700'}`}
        >
          <span className="text-xs font-bold text-purple-400">Bank Account</span>
          <p className="text-sm font-bold text-white mt-1">{formatLeone(bankBal)}</p>
          <span className="text-[10px] text-slate-500">Rokel Commercial</span>
        </div>

      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-1.5 bg-slate-900 p-2 rounded-xl border border-slate-800 overflow-x-auto">
        <button
          onClick={() => setActiveLedgerType('all')}
          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${activeLedgerType === 'all' ? 'bg-amber-500 text-slate-950' : 'text-slate-400 hover:text-white'}`}
        >
          All Ledgers View
        </button>
        <button
          onClick={() => setActiveLedgerType('cash')}
          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${activeLedgerType === 'cash' ? 'bg-emerald-500 text-slate-950' : 'text-slate-400 hover:text-white'}`}
        >
          Cash Book
        </button>
        <button
          onClick={() => setActiveLedgerType('orange_money')}
          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${activeLedgerType === 'orange_money' ? 'bg-amber-500 text-slate-950' : 'text-slate-400 hover:text-white'}`}
        >
          Orange Money Ledger
        </button>
        <button
          onClick={() => setActiveLedgerType('afrimoney')}
          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${activeLedgerType === 'afrimoney' ? 'bg-red-500 text-slate-950' : 'text-slate-400 hover:text-white'}`}
        >
          Afrimoney Ledger
        </button>
        <button
          onClick={() => setActiveLedgerType('qmoney')}
          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${activeLedgerType === 'qmoney' ? 'bg-blue-500 text-slate-950' : 'text-slate-400 hover:text-white'}`}
        >
          QMoney Ledger
        </button>
        <button
          onClick={() => setActiveLedgerType('bank')}
          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${activeLedgerType === 'bank' ? 'bg-purple-500 text-slate-950' : 'text-slate-400 hover:text-white'}`}
        >
          Bank Ledger
        </button>
      </div>

      {/* Ledger Table */}
      <div className="bg-slate-900 rounded-2xl border border-slate-800 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950 text-slate-400 font-bold text-[10px] uppercase tracking-wider border-b border-slate-800">
              <tr>
                <th className="p-3.5">Date & Time</th>
                <th className="p-3.5">Channel Ledger</th>
                <th className="p-3.5">Entry Direction</th>
                <th className="p-3.5">Description & Reference</th>
                <th className="p-3.5">Operator</th>
                <th className="p-3.5 text-right">Inflow / Outflow</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filteredEntries.map(entry => {
                const isInflow = entry.type === 'debit';

                return (
                  <tr key={entry.id} className="hover:bg-slate-800/40 transition">
                    <td className="p-3.5 text-slate-400 font-medium">
                      {formatDate(entry.date)}
                    </td>

                    <td className="p-3.5 font-bold uppercase text-[10px]">
                      <span className="px-2 py-0.5 rounded bg-slate-950 border border-slate-800 text-slate-300">
                        {entry.ledgerType.replace('_', ' ')}
                      </span>
                    </td>

                    <td className="p-3.5">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold flex items-center gap-1 w-max ${
                        isInflow 
                          ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' 
                          : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                      }`}>
                        {isInflow ? <ArrowDownLeft className="w-3 h-3" /> : <ArrowUpRight className="w-3 h-3" />}
                        {isInflow ? 'CASH IN (DEBIT)' : 'CASH OUT (CREDIT)'}
                      </span>
                    </td>

                    <td className="p-3.5 font-medium text-slate-200">
                      {entry.description}
                      {entry.feeCharge && entry.feeCharge > 0 && (
                        <span className="text-[10px] text-amber-400 block">+ Fee Charge: {formatLeone(entry.feeCharge)}</span>
                      )}
                    </td>

                    <td className="p-3.5 text-slate-400 text-[11px]">
                      {entry.performedBy}
                    </td>

                    <td className={`p-3.5 text-right font-extrabold ${isInflow ? 'text-emerald-400' : 'text-rose-400'}`}>
                      {isInflow ? `+${formatLeone(entry.amount)}` : `-${formatLeone(entry.amount)}`}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL: Transfer Funds */}
      {showTransferModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 space-y-4">
            <h3 className="font-bold text-slate-100 text-sm flex items-center gap-2">
              <ArrowRightLeft className="w-4 h-4 text-amber-400" />
              Transfer Funds Between Ledgers
            </h3>

            <form onSubmit={handleTransferSubmit} className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">From Account (Source)</label>
                <select
                  value={fromType}
                  onChange={e => setFromType(e.target.value as LedgerType)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-amber-500"
                >
                  <option value="cash">Shop Cash Register (Bal: {formatLeone(cashBal)})</option>
                  <option value="orange_money">Orange Money (Bal: {formatLeone(orangeBal)})</option>
                  <option value="afrimoney">Afrimoney (Bal: {formatLeone(afriBal)})</option>
                  <option value="qmoney">QMoney (Bal: {formatLeone(qBal)})</option>
                  <option value="bank">Rokel Bank (Bal: {formatLeone(bankBal)})</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">To Account (Destination)</label>
                <select
                  value={toType}
                  onChange={e => setToType(e.target.value as LedgerType)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-amber-500"
                >
                  <option value="orange_money">Orange Money Merchant</option>
                  <option value="afrimoney">Afrimoney Merchant</option>
                  <option value="qmoney">QMoney Merchant</option>
                  <option value="bank">Rokel Bank Account</option>
                  <option value="cash">Shop Cash Register</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">Transfer Amount (Le) *</label>
                <input
                  type="number"
                  required
                  min="1"
                  value={transferAmount}
                  onChange={e => setTransferAmount(e.target.value)}
                  placeholder="e.g. 1000000"
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">Transfer Notes / Reason</label>
                <input
                  type="text"
                  value={transferDesc}
                  onChange={e => setTransferDesc(e.target.value)}
                  placeholder="e.g. Bank deposit from evening cash sales"
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowTransferModal(false)}
                  className="px-4 py-2 bg-slate-800 text-slate-300 text-xs font-semibold rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-amber-500 text-slate-950 font-bold text-xs rounded-lg"
                >
                  Execute Transfer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: Manual Entry */}
      {showManualModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 space-y-4">
            <h3 className="font-bold text-slate-100 text-sm flex items-center gap-2">
              <PlusCircle className="w-4 h-4 text-amber-400" />
              Record Manual Ledger Entry
            </h3>

            <form onSubmit={handleManualSubmit} className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">Target Ledger Channel</label>
                <select
                  value={entryLedgerType}
                  onChange={e => setEntryLedgerType(e.target.value as LedgerType)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-amber-500"
                >
                  <option value="cash">Shop Cash Register</option>
                  <option value="orange_money">Orange Money</option>
                  <option value="afrimoney">Afrimoney</option>
                  <option value="qmoney">QMoney</option>
                  <option value="bank">Bank Account</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">Direction</label>
                <select
                  value={entryDirection}
                  onChange={e => setEntryDirection(e.target.value as 'debit' | 'credit')}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-amber-500"
                >
                  <option value="debit">DEBIT (Inflow / Deposit)</option>
                  <option value="credit">CREDIT (Outflow / Withdrawal)</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">Amount (Le) *</label>
                <input
                  type="number"
                  required
                  min="1"
                  value={entryAmount}
                  onChange={e => setEntryAmount(e.target.value)}
                  placeholder="e.g. 500000"
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">Entry Description / Audit Memo</label>
                <input
                  type="text"
                  value={entryDesc}
                  onChange={e => setEntryDesc(e.target.value)}
                  placeholder="e.g. Capital injection from owner"
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowManualModal(false)}
                  className="px-4 py-2 bg-slate-800 text-slate-300 text-xs font-semibold rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-amber-500 text-slate-950 font-bold text-xs rounded-lg"
                >
                  Post Entry
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
