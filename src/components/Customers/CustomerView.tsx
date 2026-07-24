import React, { useState } from 'react';
import { useERP } from '../../context/ERPContext';
import { Customer, PaymentMethod } from '../../types';
import { formatLeone, formatDate } from '../../utils/formatters';
import { Users, Search, UserPlus, CreditCard, History, Check, X, Phone, MapPin } from 'lucide-react';

export const CustomerView: React.FC = () => {
  const { customers, sales, addCustomer, addCustomerPayment } = useERP();

  const [searchQuery, setSearchQuery] = useState('');
  
  // Modals & Drawers
  const [showAddModal, setShowAddModal] = useState(false);
  const [repaymentCustomer, setRepaymentCustomer] = useState<Customer | null>(null);
  const [historyCustomer, setHistoryCustomer] = useState<Customer | null>(null);

  // New Customer Form
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');

  // Repayment Form
  const [paymentAmount, setPaymentAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('cash');
  const [paymentNotes, setPaymentNotes] = useState('');

  const filteredCustomers = customers.filter(c => {
    return c.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
           c.phone.includes(searchQuery);
  });

  const totalCreditBalance = customers.reduce((acc, c) => acc + c.creditBalance, 0);

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    addCustomer({ name, phone: phone || 'N/A', address: address || 'Freetown' });
    setName('');
    setPhone('');
    setAddress('');
    setShowAddModal(false);
  };

  const handleRepaymentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!repaymentCustomer || !paymentAmount) return;

    const amt = parseFloat(paymentAmount) || 0;
    addCustomerPayment(repaymentCustomer.id, amt, paymentMethod, paymentNotes);

    setRepaymentCustomer(null);
    setPaymentAmount('');
    setPaymentNotes('');
  };

  return (
    <div className="p-4 sm:p-6 space-y-6 max-w-7xl mx-auto">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-slate-900 p-5 rounded-2xl border border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-amber-400" />
            <h2 className="text-lg font-bold text-slate-100">Customer Directory & Accounts</h2>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Track customer purchase records, contact info, and outstanding credit balances.
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="px-4 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-xl shadow flex items-center gap-2 cursor-pointer"
        >
          <UserPlus className="w-4 h-4" />
          <span>Register New Customer</span>
        </button>
      </div>

      {/* Credit Summary Card */}
      <div className="bg-slate-900 p-4 rounded-xl border border-slate-800 flex items-center justify-between">
        <div>
          <span className="text-xs text-slate-400 font-medium">Total Customer Credit Outstanding</span>
          <h3 className="text-2xl font-black text-amber-400 mt-0.5">{formatLeone(totalCreditBalance)}</h3>
        </div>
        <div className="text-right">
          <span className="text-xs text-slate-400 font-medium">Registered Customers</span>
          <h3 className="text-xl font-bold text-slate-200 mt-0.5">{customers.length} Accounts</h3>
        </div>
      </div>

      {/* Search */}
      <div className="bg-slate-900 p-3 rounded-xl border border-slate-800">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search by customer name or phone..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-9 pr-4 py-2 text-xs text-slate-100 focus:outline-none focus:border-amber-500"
          />
        </div>
      </div>

      {/* Customer Directory Table */}
      <div className="bg-slate-900 rounded-2xl border border-slate-800 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950 text-slate-400 font-bold text-[10px] uppercase tracking-wider border-b border-slate-800">
              <tr>
                <th className="p-3.5">Customer Profile</th>
                <th className="p-3.5">Contact & Location</th>
                <th className="p-3.5 text-right">Lifetime Purchases</th>
                <th className="p-3.5 text-right">Credit Owed</th>
                <th className="p-3.5 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filteredCustomers.map(c => {
                const hasDebt = c.creditBalance > 0;

                return (
                  <tr key={c.id} className="hover:bg-slate-800/40 transition">
                    <td className="p-3.5 font-bold text-slate-100">
                      <div>
                        <span>{c.name}</span>
                        <span className="text-[10px] text-slate-500 block">Registered: {c.createdDate}</span>
                      </div>
                    </td>

                    <td className="p-3.5 text-slate-400">
                      <div className="space-y-0.5">
                        <p className="flex items-center gap-1 text-[11px] text-slate-300">
                          <Phone className="w-3 h-3 text-slate-500" />
                          <span>{c.phone}</span>
                        </p>
                        <p className="flex items-center gap-1 text-[10px] text-slate-500">
                          <MapPin className="w-3 h-3 text-slate-600" />
                          <span>{c.address}</span>
                        </p>
                      </div>
                    </td>

                    <td className="p-3.5 text-right font-bold text-slate-200">
                      {formatLeone(c.totalPurchases)}
                    </td>

                    <td className="p-3.5 text-right font-bold">
                      <span className={`px-2 py-1 rounded text-xs inline-block border ${
                        hasDebt 
                          ? 'bg-amber-500/20 text-amber-300 border-amber-500/30' 
                          : 'bg-slate-800 text-slate-400 border-slate-700'
                      }`}>
                        {formatLeone(c.creditBalance)}
                      </span>
                    </td>

                    <td className="p-3.5 text-center">
                      <div className="flex items-center justify-center gap-2">
                        {hasDebt && (
                          <button
                            onClick={() => {
                              setRepaymentCustomer(c);
                              setPaymentAmount(c.creditBalance.toString());
                            }}
                            className="px-3 py-1 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 rounded-lg text-xs font-bold transition"
                          >
                            Record Repayment
                          </button>
                        )}

                        <button
                          onClick={() => setHistoryCustomer(c)}
                          className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-medium flex items-center gap-1 border border-slate-700"
                        >
                          <History className="w-3.5 h-3.5" />
                          <span>History</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL: Add Customer */}
      {showAddModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 space-y-4">
            <h3 className="font-bold text-slate-100 text-sm flex items-center gap-2">
              <UserPlus className="w-4 h-4 text-amber-400" />
              Register Customer Profile
            </h3>

            <form onSubmit={handleAddSubmit} className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">Customer Full Name *</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="e.g. Madam Mariama Fullah"
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">Phone Number</label>
                <input
                  type="text"
                  value={phone}
                  onChange={e => setPhone(e.target.value)}
                  placeholder="+232 76 000 111"
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">Address / Business Location</label>
                <input
                  type="text"
                  value={address}
                  onChange={e => setAddress(e.target.value)}
                  placeholder="e.g. Lumley Market, Freetown"
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-amber-500"
                />
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
                  Save Customer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: Record Debt Payment */}
      {repaymentCustomer && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 space-y-4">
            <h3 className="font-bold text-slate-100 text-sm flex items-center gap-2">
              <CreditCard className="w-4 h-4 text-emerald-400" />
              Record Credit Repayment: {repaymentCustomer.name}
            </h3>

            <p className="text-xs text-slate-400">
              Current Credit Owed: <strong className="text-amber-400 font-bold">{formatLeone(repaymentCustomer.creditBalance)}</strong>
            </p>

            <form onSubmit={handleRepaymentSubmit} className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">Amount Paid (Le) *</label>
                <input
                  type="number"
                  required
                  min="1"
                  max={repaymentCustomer.creditBalance}
                  value={paymentAmount}
                  onChange={e => setPaymentAmount(e.target.value)}
                  placeholder={repaymentCustomer.creditBalance.toString()}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">Payment Method</label>
                <select
                  value={paymentMethod}
                  onChange={e => setPaymentMethod(e.target.value as PaymentMethod)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-amber-500"
                >
                  <option value="cash">Cash Register</option>
                  <option value="orange_money">Orange Money</option>
                  <option value="afrimoney">Afrimoney</option>
                  <option value="qmoney">QMoney</option>
                  <option value="bank">Bank Transfer</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">Notes / Reference</label>
                <input
                  type="text"
                  value={paymentNotes}
                  onChange={e => setPaymentNotes(e.target.value)}
                  placeholder="e.g. Orange Money Txn #OM99201"
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setRepaymentCustomer(null)}
                  className="px-4 py-2 bg-slate-800 text-slate-300 text-xs font-semibold rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-500 text-slate-950 font-bold text-xs rounded-lg"
                >
                  Confirm & Update Ledger
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DRAWER: Customer Purchase History */}
      {historyCustomer && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-end p-0">
          <div className="bg-slate-900 border-l border-slate-800 h-full w-full max-w-md p-6 space-y-4 overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <h3 className="font-bold text-slate-100 text-sm">{historyCustomer.name}</h3>
                <p className="text-[10px] text-slate-400">Purchase & Invoicing History</p>
              </div>
              <button onClick={() => setHistoryCustomer(null)} className="text-slate-400 hover:text-white font-bold">✕</button>
            </div>

            <div className="space-y-3">
              {sales.filter(s => s.customerId === historyCustomer.id).length === 0 ? (
                <p className="text-xs text-slate-500 py-6 text-center">No sales recorded for this customer yet.</p>
              ) : (
                sales.filter(s => s.customerId === historyCustomer.id).map(s => (
                  <div key={s.id} className="bg-slate-950 p-3 rounded-xl border border-slate-800 space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-xs text-amber-400">{s.invoiceNumber}</span>
                      <span className="text-[10px] text-slate-500">{formatDate(s.date)}</span>
                    </div>

                    <div className="text-[11px] text-slate-300 space-y-0.5">
                      {s.items.map((it, idx) => (
                        <div key={idx} className="flex justify-between">
                          <span>{it.quantity}x {it.productName}</span>
                          <span>{formatLeone(it.subtotal)}</span>
                        </div>
                      ))}
                    </div>

                    <div className="pt-2 border-t border-slate-800/80 flex justify-between items-center text-xs">
                      <span className="text-slate-400">Total: <strong className="text-white">{formatLeone(s.totalAmount)}</strong></span>
                      <span className="px-2 py-0.5 bg-slate-800 rounded text-[10px] uppercase font-bold text-slate-300">{s.paymentMethod}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
