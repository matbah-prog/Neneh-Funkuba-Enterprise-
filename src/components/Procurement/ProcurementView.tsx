import React, { useState } from 'react';
import { useERP } from '../../context/ERPContext';
import { PurchaseOrder, PaymentMethod, PurchaseOrderItem } from '../../types';
import { formatLeone, formatDate } from '../../utils/formatters';
import { ShoppingBag, Plus, Truck, CheckCircle2, Clock, AlertCircle } from 'lucide-react';

export const ProcurementView: React.FC = () => {
  const { purchaseOrders, suppliers, products, addPurchaseOrder, receivePurchaseOrder } = useERP();

  const [showAddModal, setShowAddModal] = useState(false);

  // Form State
  const [selectedSupplierId, setSelectedSupplierId] = useState(suppliers[0]?.id || '');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('bank');
  const [amountPaid, setAmountPaid] = useState('');
  const [notes, setNotes] = useState('');

  // PO Line Items
  const [poItems, setPoItems] = useState<Array<{ productId: string; quantity: number; unitBuyingPrice: number }>>([]);

  const addPOItem = () => {
    if (products.length === 0) return;
    const defaultProd = products[0];
    setPoItems(prev => [...prev, {
      productId: defaultProd.id,
      quantity: 10,
      unitBuyingPrice: defaultProd.buyingPrice
    }]);
  };

  const removePOItem = (index: number) => {
    setPoItems(prev => prev.filter((_, i) => i !== index));
  };

  const updatePOItem = (index: number, field: string, val: any) => {
    setPoItems(prev => prev.map((item, i) => {
      if (i === index) {
        const updated = { ...item, [field]: val };
        if (field === 'productId') {
          const prod = products.find(p => p.id === val);
          if (prod) updated.unitBuyingPrice = prod.buyingPrice;
        }
        return updated;
      }
      return item;
    }));
  };

  const totalCost = poItems.reduce((acc, item) => acc + (item.quantity * item.unitBuyingPrice), 0);
  const parsedPaid = parseFloat(amountPaid) || 0;
  const outstandingAmount = Math.max(0, totalCost - parsedPaid);

  const handleSubmitPO = (e: React.FormEvent) => {
    e.preventDefault();
    if (poItems.length === 0) {
      alert('Please add at least one product item to the purchase order.');
      return;
    }

    const itemsFormatted: PurchaseOrderItem[] = poItems.map(it => {
      const prod = products.find(p => p.id === it.productId);
      return {
        productId: it.productId,
        productName: prod ? prod.name : 'Product',
        quantity: it.quantity,
        unitBuyingPrice: it.unitBuyingPrice,
        subtotal: it.quantity * it.unitBuyingPrice
      };
    });

    addPurchaseOrder({
      supplierId: selectedSupplierId,
      supplierName: suppliers.find(s => s.id === selectedSupplierId)?.name || 'Supplier',
      items: itemsFormatted,
      totalCost,
      paymentMethod,
      amountPaid: parsedPaid,
      outstandingAmount,
      notes
    });

    setPoItems([]);
    setAmountPaid('');
    setNotes('');
    setShowAddModal(false);
  };

  return (
    <div className="p-4 sm:p-6 space-y-6 max-w-7xl mx-auto">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-slate-900 p-5 rounded-2xl border border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <ShoppingBag className="w-5 h-5 text-amber-400" />
            <h2 className="text-lg font-bold text-slate-100">Procurement & Purchase Orders</h2>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Create purchase orders, manage supplier deliveries, and automatically update warehouse stock levels on goods receipt.
          </p>
        </div>

        <button
          onClick={() => {
            addPOItem();
            setShowAddModal(true);
          }}
          className="px-4 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-xl shadow flex items-center gap-2 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>New Purchase Order</span>
        </button>
      </div>

      {/* Orders Table */}
      <div className="bg-slate-900 rounded-2xl border border-slate-800 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950 text-slate-400 font-bold text-[10px] uppercase tracking-wider border-b border-slate-800">
              <tr>
                <th className="p-3.5">PO Number & Date</th>
                <th className="p-3.5">Supplier Name</th>
                <th className="p-3.5">Items Ordered</th>
                <th className="p-3.5 text-right">Total Cost</th>
                <th className="p-3.5 text-center">Status</th>
                <th className="p-3.5 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {purchaseOrders.map(po => {
                const isReceived = po.status === 'received';

                return (
                  <tr key={po.id} className="hover:bg-slate-800/40 transition">
                    <td className="p-3.5 font-bold text-amber-400">
                      <div>
                        <span>{po.poNumber}</span>
                        <span className="text-[10px] text-slate-500 block">{formatDate(po.orderDate)}</span>
                      </div>
                    </td>

                    <td className="p-3.5 font-bold text-slate-200">
                      {po.supplierName}
                    </td>

                    <td className="p-3.5 text-slate-300">
                      <div className="space-y-0.5 text-[11px]">
                        {po.items.map((it, idx) => (
                          <div key={idx}>
                            • {it.quantity}x {it.productName} ({formatLeone(it.subtotal)})
                          </div>
                        ))}
                      </div>
                    </td>

                    <td className="p-3.5 text-right font-extrabold text-slate-100">
                      {formatLeone(po.totalCost)}
                    </td>

                    <td className="p-3.5 text-center">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border uppercase ${
                        isReceived 
                          ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' 
                          : 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                      }`}>
                        {po.status}
                      </span>
                    </td>

                    <td className="p-3.5 text-center">
                      {!isReceived ? (
                        <button
                          onClick={() => receivePurchaseOrder(po.id)}
                          className="px-3 py-1 bg-emerald-500 text-slate-950 font-bold text-xs rounded-lg shadow hover:bg-emerald-400 transition"
                        >
                          Receive Goods & Restock
                        </button>
                      ) : (
                        <span className="text-[10px] text-slate-500 font-medium">Delivered to Warehouse</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL: Add PO */}
      {showAddModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-lg w-full p-6 space-y-4 max-h-[90vh] overflow-y-auto">
            <h3 className="font-bold text-slate-100 text-sm flex items-center gap-2">
              <ShoppingBag className="w-4 h-4 text-amber-400" />
              Create Purchase Order
            </h3>

            <form onSubmit={handleSubmitPO} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">Select Supplier Vendor</label>
                <select
                  value={selectedSupplierId}
                  onChange={e => setSelectedSupplierId(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-amber-500"
                >
                  {suppliers.map(s => (
                    <option key={s.id} value={s.id}>{s.name}</option>
                  ))}
                </select>
              </div>

              {/* Line Items */}
              <div className="space-y-2 border-t border-b border-slate-800 py-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-300">Order Line Items</span>
                  <button
                    type="button"
                    onClick={addPOItem}
                    className="text-xs text-amber-400 font-bold hover:underline"
                  >
                    + Add Item
                  </button>
                </div>

                {poItems.map((item, idx) => (
                  <div key={idx} className="bg-slate-950 p-2.5 rounded-xl border border-slate-800 grid grid-cols-12 gap-2 items-center">
                    <div className="col-span-6">
                      <select
                        value={item.productId}
                        onChange={e => updatePOItem(idx, 'productId', e.target.value)}
                        className="w-full bg-slate-900 border border-slate-800 rounded px-2 py-1 text-xs text-slate-100"
                      >
                        {products.map(p => (
                          <option key={p.id} value={p.id}>{p.name}</option>
                        ))}
                      </select>
                    </div>

                    <div className="col-span-3">
                      <input
                        type="number"
                        min="1"
                        value={item.quantity}
                        onChange={e => updatePOItem(idx, 'quantity', parseInt(e.target.value) || 1)}
                        className="w-full bg-slate-900 border border-slate-800 rounded px-2 py-1 text-xs text-slate-100 text-center"
                        placeholder="Qty"
                      />
                    </div>

                    <div className="col-span-3 text-right">
                      <button
                        type="button"
                        onClick={() => removePOItem(idx)}
                        className="text-rose-400 text-xs font-bold"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                ))}

                <div className="text-right font-extrabold text-xs text-amber-400 pt-1">
                  Total PO Cost: {formatLeone(totalCost)}
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">Amount Paid Upfront (Le)</label>
                <input
                  type="number"
                  value={amountPaid}
                  onChange={e => setAmountPaid(e.target.value)}
                  placeholder="0"
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
                  Save & Issue PO
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
