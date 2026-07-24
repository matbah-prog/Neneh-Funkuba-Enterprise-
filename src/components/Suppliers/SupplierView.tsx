import React, { useState } from 'react';
import { useERP } from '../../context/ERPContext';
import { Supplier, PaymentMethod } from '../../types';
import { formatLeone } from '../../utils/formatters';
import { Truck, Search, Plus, Phone, Mail, MapPin, CreditCard, ShoppingBag } from 'lucide-react';

export const SupplierView: React.FC = () => {
  const { suppliers, addSupplier, addSupplierPayment, purchaseOrders } = useERP();

  const [searchQuery, setSearchQuery] = useState('');
  
  // Modals
  const [showAddModal, setShowAddModal] = useState(false);
  const [paySupplierTarget, setPaySupplierTarget] = useState<Supplier | null>(null);

  // New Supplier Form
  const [name, setName] = useState('');
  const [contactPerson, setContactPerson] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  const [productsSupplied, setProductsSupplied] = useState('');

  // Payment Form
  const [paymentAmount, setPaymentAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('bank');
  const [notes, setNotes] = useState('');

  const filteredSuppliers = suppliers.filter(s => {
    return s.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
           s.contactPerson.toLowerCase().includes(searchQuery.toLowerCase());
  });

  const totalSupplierDebts = suppliers.reduce((acc, s) => acc + s.outstandingBalance, 0);

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    addSupplier({
      name,
      contactPerson: contactPerson || 'N/A',
      phone: phone || 'N/A',
      email: email || 'N/A',
      address: address || 'Freetown',
      productsSupplied: productsSupplied ? productsSupplied.split(',').map(p => p.trim()) : ['General Goods']
    });

    setName('');
    setContactPerson('');
    setPhone('');
    setEmail('');
    setAddress('');
    setProductsSupplied('');
    setShowAddModal(false);
  };

  const handlePaymentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!paySupplierTarget || !paymentAmount) return;

    const amt = parseFloat(paymentAmount) || 0;
    addSupplierPayment(paySupplierTarget.id, amt, paymentMethod, notes);

    setPaySupplierTarget(null);
    setPaymentAmount('');
    setNotes('');
  };

  return (
    <div className="p-4 sm:p-6 space-y-6 max-w-7xl mx-auto">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-slate-900 p-5 rounded-2xl border border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <Truck className="w-5 h-5 text-amber-400" />
            <h2 className="text-lg font-bold text-slate-100">Supplier Directory & Accounts Payable</h2>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Manage wholesale importers, distributors, purchase orders, and supplier credit balances.
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="px-4 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-xl shadow flex items-center gap-2 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Supplier</span>
        </button>
      </div>

      {/* Debt Summary */}
      <div className="bg-slate-900 p-4 rounded-xl border border-slate-800 flex items-center justify-between">
        <div>
          <span className="text-xs text-slate-400 font-medium">Total Accounts Payable (Supplier Debts We Owe)</span>
          <h3 className="text-2xl font-black text-rose-400 mt-0.5">{formatLeone(totalSupplierDebts)}</h3>
        </div>
        <div className="text-right">
          <span className="text-xs text-slate-400 font-medium">Active Suppliers</span>
          <h3 className="text-xl font-bold text-slate-200 mt-0.5">{suppliers.length} Vendors</h3>
        </div>
      </div>

      {/* Search */}
      <div className="bg-slate-900 p-3 rounded-xl border border-slate-800">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search supplier or contact person..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-9 pr-4 py-2 text-xs text-slate-100 focus:outline-none focus:border-amber-500"
          />
        </div>
      </div>

      {/* Suppliers Table */}
      <div className="bg-slate-900 rounded-2xl border border-slate-800 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950 text-slate-400 font-bold text-[10px] uppercase tracking-wider border-b border-slate-800">
              <tr>
                <th className="p-3.5">Supplier Company</th>
                <th className="p-3.5">Contact Details</th>
                <th className="p-3.5">Products Supplied</th>
                <th className="p-3.5 text-right">Outstanding Debt</th>
                <th className="p-3.5 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filteredSuppliers.map(s => {
                const hasDebt = s.outstandingBalance > 0;

                return (
                  <tr key={s.id} className="hover:bg-slate-800/40 transition">
                    <td className="p-3.5 font-bold text-slate-100">
                      <div>
                        <span>{s.name}</span>
                        <span className="text-[10px] text-slate-500 block">Contact: {s.contactPerson}</span>
                      </div>
                    </td>

                    <td className="p-3.5 text-slate-400">
                      <div className="space-y-0.5 text-[11px]">
                        <p className="flex items-center gap-1">
                          <Phone className="w-3 h-3 text-slate-500" />
                          <span>{s.phone}</span>
                        </p>
                        <p className="flex items-center gap-1 text-[10px] text-slate-500">
                          <MapPin className="w-3 h-3 text-slate-600" />
                          <span>{s.address}</span>
                        </p>
                      </div>
                    </td>

                    <td className="p-3.5 text-slate-300">
                      <div className="flex flex-wrap gap-1 max-w-xs">
                        {s.productsSupplied.map((p, idx) => (
                          <span key={idx} className="px-1.5 py-0.5 rounded bg-slate-950 border border-slate-800 text-[10px] text-slate-400">
                            {p}
                          </span>
                        ))}
                      </div>
                    </td>

                    <td className="p-3.5 text-right font-bold">
                      <span className={`px-2.5 py-1 rounded text-xs inline-block border ${
                        hasDebt 
                          ? 'bg-rose-500/20 text-rose-300 border-rose-500/30' 
                          : 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                      }`}>
                        {formatLeone(s.outstandingBalance)}
                      </span>
                    </td>

                    <td className="p-3.5 text-center">
                      {hasDebt ? (
                        <button
                          onClick={() => {
                            setPaySupplierTarget(s);
                            setPaymentAmount(s.outstandingBalance.toString());
                          }}
                          className="px-3 py-1 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 rounded-lg text-xs font-bold transition"
                        >
                          Make Payment
                        </button>
                      ) : (
                        <span className="text-[10px] text-slate-500">Account Cleared</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL: Add Supplier */}
      {showAddModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 space-y-4">
            <h3 className="font-bold text-slate-100 text-sm flex items-center gap-2">
              <Truck className="w-4 h-4 text-amber-400" />
              Add Vendor / Supplier
            </h3>

            <form onSubmit={handleAddSubmit} className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">Supplier Company Name *</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="e.g. Sierra Rice Importers Ltd"
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">Contact Person Name</label>
                <input
                  type="text"
                  value={contactPerson}
                  onChange={e => setContactPerson(e.target.value)}
                  placeholder="e.g. David Cole"
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">Phone Number</label>
                <input
                  type="text"
                  value={phone}
                  onChange={e => setPhone(e.target.value)}
                  placeholder="+232 76 500 111"
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">Products Supplied (Comma separated)</label>
                <input
                  type="text"
                  value={productsSupplied}
                  onChange={e => setProductsSupplied(e.target.value)}
                  placeholder="Rice 50kg, Sugar, Flour"
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
                  Save Supplier
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: Pay Supplier */}
      {paySupplierTarget && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 space-y-4">
            <h3 className="font-bold text-slate-100 text-sm flex items-center gap-2">
              <CreditCard className="w-4 h-4 text-amber-400" />
              Make Payment to Supplier: {paySupplierTarget.name}
            </h3>

            <p className="text-xs text-slate-400">
              Outstanding Debt Owed: <strong className="text-rose-400 font-bold">{formatLeone(paySupplierTarget.outstandingBalance)}</strong>
            </p>

            <form onSubmit={handlePaymentSubmit} className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">Payment Amount (Le) *</label>
                <input
                  type="number"
                  required
                  min="1"
                  max={paySupplierTarget.outstandingBalance}
                  value={paymentAmount}
                  onChange={e => setPaymentAmount(e.target.value)}
                  placeholder={paySupplierTarget.outstandingBalance.toString()}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">Disbursement Account</label>
                <select
                  value={paymentMethod}
                  onChange={e => setPaymentMethod(e.target.value as PaymentMethod)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-amber-500"
                >
                  <option value="bank">Rokel Commercial Bank Account</option>
                  <option value="cash">Shop Cash Register</option>
                  <option value="orange_money">Orange Money Merchant</option>
                  <option value="afrimoney">Afrimoney Merchant</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">Cheque / Reference Notes</label>
                <input
                  type="text"
                  value={notes}
                  onChange={e => setNotes(e.target.value)}
                  placeholder="e.g. Bank Transfer Ref #TR-99812"
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setPaySupplierTarget(null)}
                  className="px-4 py-2 bg-slate-800 text-slate-300 text-xs font-semibold rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-amber-500 text-slate-950 font-bold text-xs rounded-lg"
                >
                  Confirm Supplier Payment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
