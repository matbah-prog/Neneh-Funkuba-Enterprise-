import React, { useState } from 'react';
import { useERP } from '../../context/ERPContext';
import { ExpenseCategory, PaymentMethod, Expense } from '../../types';
import { formatLeone, formatDate } from '../../utils/formatters';
import { 
  Receipt, Plus, Search, DollarSign, Calendar, Filter, PieChart, 
  Camera, Image as ImageIcon, Eye, X, CheckCircle2, Download, Trash2, ZoomIn 
} from 'lucide-react';
import { ReceiptCameraModal } from './ReceiptCameraModal';

export const ExpenseView: React.FC = () => {
  const { expenses, addExpense, attachReceiptToExpense } = useERP();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState('All');
  const [showAddModal, setShowAddModal] = useState(false);

  // Camera capture modal state
  const [showCameraModal, setShowCameraModal] = useState(false);
  const [targetExpenseForCamera, setTargetExpenseForCamera] = useState<string | null>(null);
  const [newExpenseReceipt, setNewExpenseReceipt] = useState<string | null>(null);

  // View receipt modal state
  const [selectedReceipt, setSelectedReceipt] = useState<Expense | null>(null);

  // Form state
  const [category, setCategory] = useState<ExpenseCategory>('Transport');
  const [amount, setAmount] = useState('');
  const [paidFrom, setPaidFrom] = useState<PaymentMethod>('cash');
  const [description, setDescription] = useState('');

  const categoriesList: ExpenseCategory[] = [
    'Transport', 'Fuel', 'Electricity', 'Staff Salaries', 
    'Shop Rent', 'Repairs', 'Packaging', 'Taxes & Licenses', 'Other Expenses'
  ];

  const filteredExpenses = expenses.filter(e => {
    const matchesSearch = e.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCat = selectedCategoryFilter === 'All' || e.category === selectedCategoryFilter;
    return matchesSearch && matchesCat;
  });

  const totalExpensesAmount = expenses.reduce((acc, e) => acc + e.amount, 0);

  // Group by category
  const categoryTotals: Record<string, number> = {};
  expenses.forEach(e => {
    categoryTotals[e.category] = (categoryTotals[e.category] || 0) + e.amount;
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount) return;

    addExpense({
      category,
      amount: parseFloat(amount) || 0,
      paidFrom,
      description: description || `${category} payment`,
      receiptImage: newExpenseReceipt || undefined,
    });

    setAmount('');
    setDescription('');
    setNewExpenseReceipt(null);
    setShowAddModal(false);
  };

  const handleCaptureReceipt = (base64Image: string) => {
    if (targetExpenseForCamera) {
      attachReceiptToExpense(targetExpenseForCamera, base64Image);
      setTargetExpenseForCamera(null);
    } else {
      setNewExpenseReceipt(base64Image);
    }
  };

  return (
    <div className="p-4 sm:p-6 space-y-6 max-w-7xl mx-auto">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-slate-900 p-5 rounded-2xl border border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <Receipt className="w-5 h-5 text-amber-400" />
            <h2 className="text-lg font-bold text-slate-100">Shop Expense Tracking & Outflows</h2>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Log shop operational costs (Rent, Salaries, Fuel, Transport) which automatically deduct from Profit & Loss calculations.
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="px-4 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-xl shadow flex items-center gap-2 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Record New Expense</span>
        </button>
      </div>

      {/* Summary Box */}
      <div className="bg-slate-900 p-4 rounded-xl border border-slate-800 flex items-center justify-between">
        <div>
          <span className="text-xs text-slate-400 font-medium">Total Recorded Operating Expenses</span>
          <h3 className="text-2xl font-black text-rose-400 mt-0.5">{formatLeone(totalExpensesAmount)}</h3>
        </div>
        <div className="text-right">
          <span className="text-xs text-slate-400 font-medium">Logged Receipts</span>
          <h3 className="text-xl font-bold text-slate-200 mt-0.5">{expenses.length} Vouchers</h3>
        </div>
      </div>

      {/* Category Breakdown Bar */}
      <div className="bg-slate-900 p-4 rounded-xl border border-slate-800 space-y-3">
        <h4 className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
          <PieChart className="w-4 h-4 text-amber-400" />
          Expense Distribution by Category
        </h4>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2">
          {Object.entries(categoryTotals).map(([cat, amt]) => (
            <div key={cat} className="bg-slate-950 p-2.5 rounded-lg border border-slate-800">
              <span className="text-[10px] font-medium text-slate-400 block truncate">{cat}</span>
              <span className="text-xs font-bold text-rose-400 mt-0.5 block">{formatLeone(amt)}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Filter & Search */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-slate-900 p-3 rounded-xl border border-slate-800">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search voucher description..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-9 pr-4 py-2 text-xs text-slate-100 focus:outline-none focus:border-amber-500"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
          <button
            onClick={() => setSelectedCategoryFilter('All')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap ${
              selectedCategoryFilter === 'All' ? 'bg-amber-500 text-slate-950 font-bold' : 'bg-slate-950 text-slate-400 border border-slate-800'
            }`}
          >
            All Categories
          </button>
          {categoriesList.map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategoryFilter(cat)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap ${
                selectedCategoryFilter === cat ? 'bg-amber-500 text-slate-950 font-bold' : 'bg-slate-950 text-slate-400 border border-slate-800'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Expense Log Table */}
      <div className="bg-slate-900 rounded-2xl border border-slate-800 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950 text-slate-400 font-bold text-[10px] uppercase tracking-wider border-b border-slate-800">
              <tr>
                <th className="p-3.5">Date & Time</th>
                <th className="p-3.5">Expense Category</th>
                <th className="p-3.5">Description / Notes</th>
                <th className="p-3.5">Paid From</th>
                <th className="p-3.5">Logged By</th>
                <th className="p-3.5">Receipt Photo</th>
                <th className="p-3.5 text-right">Amount Paid</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filteredExpenses.map(exp => (
                <tr key={exp.id} className="hover:bg-slate-800/40 transition">
                  <td className="p-3.5 text-slate-400 font-medium">
                    {formatDate(exp.date)}
                  </td>

                  <td className="p-3.5">
                    <span className="px-2 py-0.5 rounded bg-rose-500/10 text-rose-300 border border-rose-500/20 text-[10px] font-bold">
                      {exp.category}
                    </span>
                  </td>

                  <td className="p-3.5 font-medium text-slate-200">
                    {exp.description}
                  </td>

                  <td className="p-3.5">
                    <span className="px-2 py-0.5 rounded bg-slate-800 border border-slate-700 text-[10px] uppercase font-bold text-slate-300">
                      {exp.paidFrom.replace('_', ' ')}
                    </span>
                  </td>

                  <td className="p-3.5 text-slate-400 text-[11px]">
                    {exp.recordedBy}
                  </td>

                  <td className="p-3.5">
                    {exp.receiptImage ? (
                      <button
                        onClick={() => setSelectedReceipt(exp)}
                        className="px-2.5 py-1 bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 rounded-lg text-[11px] font-bold transition flex items-center gap-1.5 cursor-pointer"
                      >
                        <Eye className="w-3.5 h-3.5 text-amber-400" />
                        <span>View Photo</span>
                      </button>
                    ) : (
                      <button
                        onClick={() => {
                          setTargetExpenseForCamera(exp.id);
                          setShowCameraModal(true);
                        }}
                        className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-slate-200 border border-slate-700/80 rounded-lg text-[10px] font-medium transition flex items-center gap-1 cursor-pointer"
                        title="Snap receipt photo with camera"
                      >
                        <Camera className="w-3 h-3 text-amber-400" />
                        <span>+ Attach</span>
                      </button>
                    )}
                  </td>

                  <td className="p-3.5 text-right font-black text-rose-400">
                    -{formatLeone(exp.amount)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL: Record New Expense */}
      {showAddModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 space-y-4">
            <h3 className="font-bold text-slate-100 text-sm flex items-center gap-2">
              <Receipt className="w-4 h-4 text-amber-400" />
              Log Operational Shop Expense
            </h3>

            <form onSubmit={handleSubmit} className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">Expense Category *</label>
                <select
                  value={category}
                  onChange={e => setCategory(e.target.value as ExpenseCategory)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-amber-500"
                >
                  {categoriesList.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">Amount Paid (Le) *</label>
                <input
                  type="number"
                  required
                  min="1"
                  value={amount}
                  onChange={e => setAmount(e.target.value)}
                  placeholder="e.g. 450000"
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">Disbursement Source</label>
                <select
                  value={paidFrom}
                  onChange={e => setPaidFrom(e.target.value as PaymentMethod)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-amber-500"
                >
                  <option value="cash">Shop Cash Register</option>
                  <option value="orange_money">Orange Money Account</option>
                  <option value="afrimoney">Afrimoney Merchant Account</option>
                  <option value="qmoney">QMoney Merchant</option>
                  <option value="bank">Rokel Commercial Bank Account</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">Description / Receipt Note</label>
                <input
                  type="text"
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  placeholder="e.g. Diesel fuel for standby generator"
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-amber-500"
                />
              </div>

              {/* Camera Receipt Attachment Section */}
              <div className="pt-2 border-t border-slate-800">
                <label className="text-xs font-semibold text-slate-300 block mb-1.5">Physical Receipt Attachment</label>
                {newExpenseReceipt ? (
                  <div className="relative bg-slate-950 border border-slate-800 rounded-xl p-2 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <img
                        src={newExpenseReceipt}
                        alt="Receipt Thumbnail"
                        className="w-12 h-12 object-cover rounded-lg border border-slate-700"
                      />
                      <div>
                        <span className="text-xs font-bold text-emerald-400 flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          Receipt Photo Attached
                        </span>
                        <span className="text-[10px] text-slate-400 block">Ready to submit for audit compliance</span>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => setNewExpenseReceipt(null)}
                      className="p-1.5 text-rose-400 hover:text-rose-300 hover:bg-slate-900 rounded-lg transition"
                      title="Remove Receipt Photo"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => {
                      setTargetExpenseForCamera(null);
                      setShowCameraModal(true);
                    }}
                    className="w-full py-2.5 bg-slate-950 hover:bg-slate-800 border border-dashed border-slate-700 hover:border-amber-500 rounded-xl text-xs text-amber-400 font-bold transition flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <Camera className="w-4 h-4" />
                    <span>Snap Receipt Photo with Camera</span>
                  </button>
                )}
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 bg-slate-800 text-slate-300 text-xs font-semibold rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-amber-500 text-slate-950 font-bold text-xs rounded-lg"
                >
                  Record Expense
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: Camera Photo Capture */}
      {showCameraModal && (
        <ReceiptCameraModal
          onCapture={handleCaptureReceipt}
          onClose={() => setShowCameraModal(false)}
        />
      )}

      {/* MODAL: View Attached Receipt Image */}
      {selectedReceipt && selectedReceipt.receiptImage && (
        <div className="fixed inset-0 bg-slate-950/90 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <h3 className="font-extrabold text-slate-100 text-sm">Physical Purchase Receipt</h3>
                <p className="text-[10px] text-slate-400">
                  {selectedReceipt.category} • {formatLeone(selectedReceipt.amount)} • {formatDate(selectedReceipt.date)}
                </p>
              </div>

              <button
                onClick={() => setSelectedReceipt(null)}
                className="p-1.5 text-slate-400 hover:text-white bg-slate-800 rounded-lg transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="bg-slate-950 rounded-xl border border-slate-800 p-2 flex items-center justify-center max-h-[60vh] overflow-auto">
              <img
                src={selectedReceipt.receiptImage}
                alt="Physical Receipt Attachment"
                className="max-w-full max-h-[50vh] object-contain rounded-lg shadow"
              />
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-slate-800 text-xs">
              <span className="text-[10px] text-slate-400">Recorded by: {selectedReceipt.recordedBy}</span>
              
              <div className="flex items-center gap-2">
                <a
                  href={selectedReceipt.receiptImage}
                  download={`receipt_${selectedReceipt.id}.jpg`}
                  className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-amber-400 rounded-lg font-bold transition flex items-center gap-1.5"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Save Image</span>
                </a>

                <button
                  onClick={() => setSelectedReceipt(null)}
                  className="px-4 py-1.5 bg-amber-500 text-slate-950 font-bold rounded-lg"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
