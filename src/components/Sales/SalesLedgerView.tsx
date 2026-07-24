import React, { useState } from 'react';
import { useERP } from '../../context/ERPContext';
import { Sale, PaymentMethod, SaleItem, Product } from '../../types';
import { formatLeone, formatDate } from '../../utils/formatters';
import { 
  FileSpreadsheet, Plus, Search, Calendar, Filter, DollarSign, 
  CreditCard, Wallet, ShoppingBag, Eye, X, CheckCircle2, User, 
  FileText, ArrowDownLeft, Trash2, Printer, Tag, Building, Smartphone, Sparkles, AlertCircle
} from 'lucide-react';
import { ReceiptModal } from '../ReceiptModal';

export const SalesLedgerView: React.FC = () => {
  const { sales, products, customers, addManualSale, currentUser } = useERP();

  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMethodFilter, setSelectedMethodFilter] = useState('All');
  const [selectedOriginFilter, setSelectedOriginFilter] = useState('All'); // 'All', 'POS', 'Manual'
  const [dateFilter, setDateFilter] = useState<'all' | 'today' | '7days' | 'month'>('all');

  // Modals
  const [showManualModal, setShowManualModal] = useState(false);
  const [selectedReceiptSale, setSelectedReceiptSale] = useState<Sale | null>(null);

  // Manual Sale Form State
  const [paperInvoiceNum, setPaperInvoiceNum] = useState('');
  const [selectedCustId, setSelectedCustId] = useState(customers[0]?.id || 'cust_walkin');
  const [customCustName, setCustomCustName] = useState('');
  const [saleDate, setSaleDate] = useState(new Date().toISOString().substring(0, 16)); // YYYY-MM-DDThh:mm
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('cash');
  const [discountAmount, setDiscountAmount] = useState<string>('0');
  const [amountPaidInput, setAmountPaidInput] = useState<string>('');
  const [updateInventoryToggle, setUpdateInventoryToggle] = useState<boolean>(true);
  const [saleNotes, setSaleNotes] = useState<string>('');

  // Manual Line Items
  const [manualItems, setManualItems] = useState<SaleItem[]>([]);
  // Item Form Input
  const [itemType, setItemType] = useState<'catalog' | 'custom'>('catalog');
  const [selectedProdId, setSelectedProdId] = useState<string>(products[0]?.id || '');
  const [customItemName, setCustomItemName] = useState('');
  const [itemQty, setItemQty] = useState<number>(1);
  const [itemUnitPrice, setItemUnitPrice] = useState<string>('');

  // Calculate Subtotals & Totals for Manual Form
  const subtotal = manualItems.reduce((acc, item) => acc + item.subtotal, 0);
  const discountVal = parseFloat(discountAmount) || 0;
  const totalAmount = Math.max(0, subtotal - discountVal);
  const amountPaidVal = amountPaidInput === '' ? totalAmount : (parseFloat(amountPaidInput) || 0);
  const balanceDueVal = Math.max(0, totalAmount - amountPaidVal);

  // Handle Adding Item to Manual Form
  const handleAddItem = () => {
    if (itemType === 'catalog') {
      const prod = products.find(p => p.id === selectedProdId);
      if (!prod) return;
      const qty = itemQty > 0 ? itemQty : 1;
      const price = itemUnitPrice !== '' ? (parseFloat(itemUnitPrice) || prod.sellingPrice) : prod.sellingPrice;

      const newItem: SaleItem = {
        productId: prod.id,
        productName: prod.name,
        quantity: qty,
        unitPrice: price,
        buyingPrice: prod.buyingPrice,
        subtotal: qty * price
      };

      setManualItems(prev => [...prev, newItem]);
      setItemQty(1);
      setItemUnitPrice('');
    } else {
      if (!customItemName.trim()) return;
      const price = parseFloat(itemUnitPrice) || 0;
      const qty = itemQty > 0 ? itemQty : 1;

      const newItem: SaleItem = {
        productId: `custom_${Date.now()}`,
        productName: customItemName.trim(),
        quantity: qty,
        unitPrice: price,
        buyingPrice: Math.round(price * 0.7), // Estimated cost
        subtotal: qty * price
      };

      setManualItems(prev => [...prev, newItem]);
      setCustomItemName('');
      setItemQty(1);
      setItemUnitPrice('');
    }
  };

  const handleRemoveItem = (index: number) => {
    setManualItems(prev => prev.filter((_, i) => i !== index));
  };

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (manualItems.length === 0) {
      alert('Please add at least one line item to the manual sales ledger entry.');
      return;
    }

    const selectedCustomerObj = customers.find(c => c.id === selectedCustId);
    const finalCustName = selectedCustomerObj ? selectedCustomerObj.name : (customCustName.trim() || 'Walk-in Customer');

    addManualSale({
      invoiceNumber: paperInvoiceNum.trim() || undefined,
      customerId: selectedCustId,
      customerName: finalCustName,
      items: manualItems,
      subtotal,
      discount: discountVal,
      totalAmount,
      amountPaid: amountPaidVal,
      paymentMethod,
      date: new Date(saleDate).toISOString(),
      notes: saleNotes || 'Manual Sales Ledger Entry',
      updateInventory: updateInventoryToggle,
      salespersonName: currentUser.name
    });

    // Reset Form
    setManualItems([]);
    setPaperInvoiceNum('');
    setDiscountAmount('0');
    setAmountPaidInput('');
    setSaleNotes('');
    setShowManualModal(false);
  };

  // Filter Sales Ledger Data
  const filteredSales = sales.filter(s => {
    // Search Filter
    const query = searchQuery.toLowerCase();
    const matchesQuery = 
      s.invoiceNumber.toLowerCase().includes(query) ||
      s.customerName.toLowerCase().includes(query) ||
      s.salespersonName.toLowerCase().includes(query) ||
      s.items.some(i => i.productName.toLowerCase().includes(query)) ||
      (s.notes && s.notes.toLowerCase().includes(query));

    // Method Filter
    const matchesMethod = selectedMethodFilter === 'All' || s.paymentMethod === selectedMethodFilter;

    // Origin Filter
    const matchesOrigin = 
      selectedOriginFilter === 'All' ? true :
      selectedOriginFilter === 'Manual' ? s.isManualEntry :
      !s.isManualEntry;

    // Date Filter
    let matchesDate = true;
    if (dateFilter !== 'all') {
      const saleD = new Date(s.date);
      const now = new Date();
      if (dateFilter === 'today') {
        matchesDate = saleD.toDateString() === now.toDateString();
      } else if (dateFilter === '7days') {
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(now.getDate() - 7);
        matchesDate = saleD >= sevenDaysAgo;
      } else if (dateFilter === 'month') {
        matchesDate = saleD.getMonth() === now.getMonth() && saleD.getFullYear() === now.getFullYear();
      }
    }

    return matchesQuery && matchesMethod && matchesOrigin && matchesDate;
  });

  // Calculate Metrics
  const totalSalesRevenue = filteredSales.reduce((acc, s) => acc + s.totalAmount, 0);
  const totalPaidRevenue = filteredSales.reduce((acc, s) => acc + s.amountPaid, 0);
  const totalCreditOutstanding = filteredSales.reduce((acc, s) => acc + s.balanceDue, 0);
  const manualCount = filteredSales.filter(s => s.isManualEntry).length;

  return (
    <div className="p-4 sm:p-6 space-y-6 max-w-7xl mx-auto">
      
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-slate-900 p-5 rounded-2xl border border-slate-800">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-amber-500/10 text-amber-400 rounded-xl border border-amber-500/20">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-extrabold text-slate-100">Sales Ledger & Revenue Register</h2>
              <p className="text-xs text-slate-400">Complete audit ledger of POS transactions and manual paper sales entries</p>
            </div>
          </div>
        </div>

        <button
          onClick={() => setShowManualModal(true)}
          className="px-4 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs rounded-xl shadow-lg flex items-center gap-2 cursor-pointer transition"
        >
          <Plus className="w-4 h-4" />
          <span>Record Manual Sale Ledger Entry</span>
        </button>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        <div className="bg-slate-900 p-4 rounded-xl border border-slate-800 space-y-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Total Sales Ledger Revenue</span>
          <p className="text-xl font-extrabold text-emerald-400">{formatLeone(totalSalesRevenue)}</p>
          <span className="text-[10px] text-slate-500 block">{filteredSales.length} total entries recorded</span>
        </div>

        <div className="bg-slate-900 p-4 rounded-xl border border-slate-800 space-y-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Cash / Channel Collected</span>
          <p className="text-xl font-extrabold text-amber-300">{formatLeone(totalPaidRevenue)}</p>
          <span className="text-[10px] text-slate-500 block">Actual liquid payments received</span>
        </div>

        <div className="bg-slate-900 p-4 rounded-xl border border-slate-800 space-y-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Outstanding Sales Credit</span>
          <p className="text-xl font-extrabold text-rose-400">{formatLeone(totalCreditOutstanding)}</p>
          <span className="text-[10px] text-slate-500 block">Accounts receivable balance</span>
        </div>

        <div className="bg-slate-900 p-4 rounded-xl border border-slate-800 space-y-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Manual Paper Entries</span>
          <p className="text-xl font-extrabold text-sky-400">{manualCount} Sales</p>
          <span className="text-[10px] text-slate-500 block">Backdated / paper receipt entries</span>
        </div>

      </div>

      {/* Filter & Search Bar */}
      <div className="bg-slate-900 p-4 rounded-xl border border-slate-800 flex flex-col md:flex-row items-center justify-between gap-3">
        
        {/* Search Input */}
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search invoice, customer, items..."
            className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-amber-500"
          />
        </div>

        {/* Filter Controls */}
        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          
          {/* Channel Selector */}
          <select
            value={selectedMethodFilter}
            onChange={e => setSelectedMethodFilter(e.target.value)}
            className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-300 focus:outline-none focus:border-amber-500"
          >
            <option value="All">All Payment Channels</option>
            <option value="cash">Cash Register</option>
            <option value="orange_money">Orange Money</option>
            <option value="afrimoney">Afrimoney</option>
            <option value="qmoney">QMoney</option>
            <option value="bank">Bank Transfer</option>
            <option value="credit">Credit Account</option>
          </select>

          {/* Origin Filter */}
          <select
            value={selectedOriginFilter}
            onChange={e => setSelectedOriginFilter(e.target.value)}
            className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-300 focus:outline-none focus:border-amber-500"
          >
            <option value="All">All Entry Types</option>
            <option value="POS">Live POS Register</option>
            <option value="Manual">Manual Paper Ledger</option>
          </select>

          {/* Date Filter */}
          <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800">
            <button
              onClick={() => setDateFilter('all')}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition ${dateFilter === 'all' ? 'bg-amber-500 text-slate-950' : 'text-slate-400 hover:text-slate-200'}`}
            >
              All
            </button>
            <button
              onClick={() => setDateFilter('today')}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition ${dateFilter === 'today' ? 'bg-amber-500 text-slate-950' : 'text-slate-400 hover:text-slate-200'}`}
            >
              Today
            </button>
            <button
              onClick={() => setDateFilter('7days')}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition ${dateFilter === '7days' ? 'bg-amber-500 text-slate-950' : 'text-slate-400 hover:text-slate-200'}`}
            >
              7 Days
            </button>
            <button
              onClick={() => setDateFilter('month')}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition ${dateFilter === 'month' ? 'bg-amber-500 text-slate-950' : 'text-slate-400 hover:text-slate-200'}`}
            >
              This Month
            </button>
          </div>

        </div>

      </div>

      {/* Sales Ledger Data Table */}
      <div className="bg-slate-900 rounded-2xl border border-slate-800 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950 text-slate-400 font-bold text-[10px] uppercase tracking-wider border-b border-slate-800">
              <tr>
                <th className="p-3.5">Invoice #</th>
                <th className="p-3.5">Date & Time</th>
                <th className="p-3.5">Customer</th>
                <th className="p-3.5">Items Purchased</th>
                <th className="p-3.5">Channel</th>
                <th className="p-3.5">Entry Origin</th>
                <th className="p-3.5">Salesperson</th>
                <th className="p-3.5 text-right">Amount Paid</th>
                <th className="p-3.5 text-right">Total Amount</th>
                <th className="p-3.5 text-center">Receipt</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filteredSales.length === 0 ? (
                <tr>
                  <td colSpan={10} className="p-8 text-center text-slate-500 italic text-xs">
                    No sales ledger records found matching the search or filter criteria.
                  </td>
                </tr>
              ) : (
                filteredSales.map(sale => {
                  const isCredit = sale.paymentMethod === 'credit' || sale.balanceDue > 0;

                  return (
                    <tr key={sale.id} className="hover:bg-slate-800/40 transition">
                      <td className="p-3.5 font-black text-amber-400">
                        {sale.invoiceNumber}
                      </td>

                      <td className="p-3.5 text-slate-400 font-medium">
                        {formatDate(sale.date)}
                      </td>

                      <td className="p-3.5 font-bold text-slate-100">
                        {sale.customerName}
                      </td>

                      <td className="p-3.5 text-slate-300 max-w-xs truncate">
                        <span className="font-semibold text-slate-200">
                          {sale.items.map(i => `${i.quantity}x ${i.productName}`).join(', ')}
                        </span>
                        <span className="text-[10px] text-slate-500 block">({sale.items.length} unique lines)</span>
                      </td>

                      <td className="p-3.5">
                        <span className="px-2 py-0.5 rounded bg-slate-950 border border-slate-800 text-slate-300 uppercase text-[10px] font-bold">
                          {sale.paymentMethod.replace('_', ' ')}
                        </span>
                      </td>

                      <td className="p-3.5">
                        {sale.isManualEntry ? (
                          <span className="px-2 py-0.5 rounded bg-sky-500/20 text-sky-300 border border-sky-500/30 text-[10px] font-extrabold">
                            MANUAL PAPER
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] font-extrabold">
                            POS REGISTER
                          </span>
                        )}
                      </td>

                      <td className="p-3.5 text-slate-400 text-[11px]">
                        {sale.salespersonName}
                      </td>

                      <td className="p-3.5 text-right font-bold text-emerald-400">
                        {formatLeone(sale.amountPaid)}
                      </td>

                      <td className="p-3.5 text-right font-black text-slate-100">
                        {formatLeone(sale.totalAmount)}
                        {sale.balanceDue > 0 && (
                          <span className="text-[10px] text-rose-400 block font-bold">
                            Due: {formatLeone(sale.balanceDue)}
                          </span>
                        )}
                      </td>

                      <td className="p-3.5 text-center">
                        <button
                          onClick={() => setSelectedReceiptSale(sale)}
                          className="p-1.5 bg-slate-800 hover:bg-slate-700 text-amber-400 rounded-lg transition cursor-pointer"
                          title="View & Print Official Receipt"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL: Manual Sales Ledger Entry */}
      {showManualModal && (
        <div className="fixed inset-0 bg-slate-950/85 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-2xl w-full p-6 space-y-5 shadow-2xl max-h-[92vh] overflow-y-auto">
            
            {/* Header */}
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-amber-500/10 text-amber-400 rounded-xl border border-amber-500/20">
                  <FileSpreadsheet className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-slate-100 text-sm">Record Manual Sale Ledger Entry</h3>
                  <p className="text-[10px] text-slate-400">Record backdated paper sales receipts or manual sales into the revenue ledger</p>
                </div>
              </div>

              <button
                onClick={() => setShowManualModal(false)}
                className="p-1.5 text-slate-400 hover:text-white bg-slate-800 rounded-lg transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleManualSubmit} className="space-y-4">
              
              {/* Form Grid 1: Basic Info */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">Paper Receipt / Invoice # (Optional)</label>
                  <input
                    type="text"
                    value={paperInvoiceNum}
                    onChange={e => setPaperInvoiceNum(e.target.value)}
                    placeholder="e.g. REC-2026-0041 (Auto-generated if blank)"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">Transaction Date & Time *</label>
                  <input
                    type="datetime-local"
                    required
                    value={saleDate}
                    onChange={e => setSaleDate(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">Customer Selection *</label>
                  <select
                    value={selectedCustId}
                    onChange={e => setSelectedCustId(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-amber-500"
                  >
                    {customers.map(c => (
                      <option key={c.id} value={c.id}>
                        {c.name} {c.phone ? `(${c.phone})` : ''}
                      </option>
                    ))}
                    <option value="custom_name">+ Custom Customer Name</option>
                  </select>
                </div>

                {selectedCustId === 'custom_name' && (
                  <div>
                    <label className="text-xs font-semibold text-slate-300 block mb-1">Custom Customer Name</label>
                    <input
                      type="text"
                      required
                      value={customCustName}
                      onChange={e => setCustomCustName(e.target.value)}
                      placeholder="e.g. Paramount Chief Mansaray"
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-amber-500"
                    />
                  </div>
                )}

                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">Payment Channel / Ledger *</label>
                  <select
                    value={paymentMethod}
                    onChange={e => setPaymentMethod(e.target.value as PaymentMethod)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-amber-500"
                  >
                    <option value="cash">Shop Cash Register</option>
                    <option value="orange_money">Orange Money</option>
                    <option value="afrimoney">Afrimoney</option>
                    <option value="qmoney">QMoney</option>
                    <option value="bank">Bank Transfer</option>
                    <option value="credit">Customer Credit Account</option>
                  </select>
                </div>

              </div>

              {/* Line Items Builder Section */}
              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-3">
                <div className="flex items-center justify-between border-b border-slate-800/80 pb-2">
                  <span className="text-xs font-bold text-amber-400">Add Sale Items</span>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setItemType('catalog')}
                      className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition ${itemType === 'catalog' ? 'bg-amber-500 text-slate-950' : 'bg-slate-900 text-slate-400'}`}
                    >
                      Catalog Product
                    </button>
                    <button
                      type="button"
                      onClick={() => setItemType('custom')}
                      className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition ${itemType === 'custom' ? 'bg-amber-500 text-slate-950' : 'bg-slate-900 text-slate-400'}`}
                    >
                      Custom Item
                    </button>
                  </div>
                </div>

                {/* Add Item Row Inputs */}
                <div className="grid grid-cols-1 sm:grid-cols-12 gap-2 items-end">
                  
                  {itemType === 'catalog' ? (
                    <div className="sm:col-span-5">
                      <label className="text-[10px] font-semibold text-slate-400 block mb-1">Select Catalog Product</label>
                      <select
                        value={selectedProdId}
                        onChange={e => setSelectedProdId(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-100 focus:outline-none focus:border-amber-500"
                      >
                        {products.map(p => (
                          <option key={p.id} value={p.id}>
                            {p.name} - Le {p.sellingPrice.toLocaleString()} (Stock: {p.currentStock})
                          </option>
                        ))}
                      </select>
                    </div>
                  ) : (
                    <div className="sm:col-span-5">
                      <label className="text-[10px] font-semibold text-slate-400 block mb-1">Custom Product / Service Name</label>
                      <input
                        type="text"
                        value={customItemName}
                        onChange={e => setCustomItemName(e.target.value)}
                        placeholder="e.g. Delivery fee or custom bulk bag"
                        className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-100 focus:outline-none focus:border-amber-500"
                      />
                    </div>
                  )}

                  <div className="sm:col-span-2">
                    <label className="text-[10px] font-semibold text-slate-400 block mb-1">Qty</label>
                    <input
                      type="number"
                      min="1"
                      value={itemQty}
                      onChange={e => setItemQty(parseInt(e.target.value) || 1)}
                      className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-100 focus:outline-none focus:border-amber-500"
                    />
                  </div>

                  <div className="sm:col-span-3">
                    <label className="text-[10px] font-semibold text-slate-400 block mb-1">Unit Price (Le)</label>
                    <input
                      type="number"
                      value={itemUnitPrice}
                      onChange={e => setItemUnitPrice(e.target.value)}
                      placeholder={itemType === 'catalog' ? 'Default Price' : 'Price'}
                      className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-100 focus:outline-none focus:border-amber-500"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <button
                      type="button"
                      onClick={handleAddItem}
                      className="w-full py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-lg transition flex items-center justify-center gap-1 cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Add</span>
                    </button>
                  </div>

                </div>

                {/* Items Table List */}
                <div className="border border-slate-800 rounded-lg overflow-hidden">
                  <table className="w-full text-left text-[11px] text-slate-300">
                    <thead className="bg-slate-900 text-slate-400 font-bold uppercase text-[9px]">
                      <tr>
                        <th className="p-2">Item Description</th>
                        <th className="p-2 text-center">Qty</th>
                        <th className="p-2 text-right">Unit Price</th>
                        <th className="p-2 text-right">Subtotal</th>
                        <th className="p-2 text-center">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60">
                      {manualItems.length === 0 ? (
                        <tr>
                          <td colSpan={5} className="p-4 text-center text-slate-500 italic">
                            No items added yet. Add catalog or custom items above.
                          </td>
                        </tr>
                      ) : (
                        manualItems.map((item, idx) => (
                          <tr key={idx} className="hover:bg-slate-900/50">
                            <td className="p-2 font-semibold text-slate-100">{item.productName}</td>
                            <td className="p-2 text-center font-bold text-amber-400">{item.quantity}</td>
                            <td className="p-2 text-right">{formatLeone(item.unitPrice)}</td>
                            <td className="p-2 text-right font-bold text-emerald-400">{formatLeone(item.subtotal)}</td>
                            <td className="p-2 text-center">
                              <button
                                type="button"
                                onClick={() => handleRemoveItem(idx)}
                                className="p-1 text-rose-400 hover:text-rose-300 hover:bg-slate-800 rounded"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>

              </div>

              {/* Form Grid 2: Totals & Payments */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-slate-950 p-4 rounded-xl border border-slate-800">
                
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">Discount (Le)</label>
                  <input
                    type="number"
                    min="0"
                    value={discountAmount}
                    onChange={e => setDiscountAmount(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">Amount Paid (Le)</label>
                  <input
                    type="number"
                    min="0"
                    value={amountPaidInput}
                    onChange={e => setAmountPaidInput(e.target.value)}
                    placeholder={`Total: ${totalAmount}`}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div className="bg-slate-900 p-3 rounded-xl border border-slate-800 flex flex-col justify-center space-y-0.5">
                  <div className="flex justify-between text-xs font-bold text-slate-300">
                    <span>Total Bill:</span>
                    <span className="text-amber-400">{formatLeone(totalAmount)}</span>
                  </div>
                  <div className="flex justify-between text-xs font-bold text-slate-300">
                    <span>Balance Due:</span>
                    <span className={balanceDueVal > 0 ? 'text-rose-400' : 'text-emerald-400'}>
                      {formatLeone(balanceDueVal)}
                    </span>
                  </div>
                </div>

              </div>

              {/* Toggles & Notes */}
              <div className="space-y-3">
                
                <label className="flex items-center gap-2.5 p-3 bg-slate-950 rounded-xl border border-slate-800 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={updateInventoryToggle}
                    onChange={e => setUpdateInventoryToggle(e.target.checked)}
                    className="w-4 h-4 rounded accent-amber-500 cursor-pointer"
                  />
                  <div className="text-xs">
                    <span className="font-bold text-slate-200 block">Deduct items from stock inventory</span>
                    <span className="text-[10px] text-slate-400">Automatically reduce product quantities in stock database</span>
                  </div>
                </label>

                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">Entry Notes / Audit Remarks</label>
                  <input
                    type="text"
                    value={saleNotes}
                    onChange={e => setSaleNotes(e.target.value)}
                    placeholder="e.g. Backdated manual paper receipt entered from notebook"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-amber-500"
                  />
                </div>

              </div>

              {/* Buttons */}
              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowManualModal(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs rounded-xl shadow cursor-pointer transition flex items-center gap-1.5"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Post Manual Sales Ledger Entry</span>
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

      {/* MODAL: Official Receipt Preview */}
      {selectedReceiptSale && (
        <ReceiptModal
          sale={selectedReceiptSale}
          onClose={() => setSelectedReceiptSale(null)}
        />
      )}

    </div>
  );
};
