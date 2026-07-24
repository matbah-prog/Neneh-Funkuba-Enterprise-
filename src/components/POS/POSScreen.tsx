import React, { useState } from 'react';
import { useERP } from '../../context/ERPContext';
import { Product, SaleItem, PaymentMethod, Customer, Sale } from '../../types';
import { formatLeone } from '../../utils/formatters';
import { 
  Search, ShoppingCart, Plus, Minus, Trash2, PauseCircle, 
  CheckCircle2, UserPlus, CreditCard, Wallet, Building, 
  Smartphone, Sparkles, Tag, AlertCircle, Clock, FileText, ArrowRight, Camera
} from 'lucide-react';
import { ReceiptModal } from '../ReceiptModal';
import { BarcodeScannerModal } from './BarcodeScannerModal';

export const POSScreen: React.FC = () => {
  const { 
    products, customers, completeSale, holdCart, 
    heldCarts, resumeCart, deleteHeldCart, addCustomer, currentUser 
  } = useERP();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  
  // Cart state
  const [cartItems, setCartItems] = useState<SaleItem[]>([]);
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>(customers[0]?.id || 'cust_walkin');
  const [discountAmount, setDiscountAmount] = useState<number>(0);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('cash');
  const [amountPaid, setAmountPaid] = useState<string>('');
  const [notes, setNotes] = useState<string>('');

  // Modals
  const [completedSaleResult, setCompletedSaleResult] = useState<Sale | null>(null);
  const [showAddCustomerModal, setShowAddCustomerModal] = useState(false);
  const [showHeldCartsModal, setShowHeldCartsModal] = useState(false);
  const [showBarcodeScanner, setShowBarcodeScanner] = useState(false);

  // New Customer form state
  const [newCustName, setNewCustName] = useState('');
  const [newCustPhone, setNewCustPhone] = useState('');
  const [newCustAddress, setNewCustAddress] = useState('');

  // Categories list
  const categories = ['All', ...Array.from(new Set(products.map(p => p.category)))];

  // Filtered products
  const filteredProducts = products.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          (p.barcode && p.barcode.includes(searchQuery));
    const matchesCategory = selectedCategory === 'All' || p.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  // Add product to cart
  const addToCart = (product: Product) => {
    if (product.currentStock <= 0) return;

    setCartItems(prev => {
      const existing = prev.find(item => item.productId === product.id);
      if (existing) {
        if (existing.quantity >= product.currentStock) return prev; // Cannot exceed stock
        return prev.map(item => item.productId === product.id ? {
          ...item,
          quantity: item.quantity + 1,
          subtotal: (item.quantity + 1) * item.unitPrice
        } : item);
      } else {
        return [...prev, {
          productId: product.id,
          productName: product.name,
          quantity: 1,
          unitPrice: product.sellingPrice,
          buyingPrice: product.buyingPrice,
          subtotal: product.sellingPrice
        }];
      }
    });
  };

  // Update item quantity in cart
  const updateQuantity = (productId: string, newQty: number) => {
    const product = products.find(p => p.id === productId);
    if (!product) return;

    if (newQty <= 0) {
      removeFromCart(productId);
      return;
    }

    if (newQty > product.currentStock) {
      alert(`Cannot add more than available stock (${product.currentStock} ${product.unit}).`);
      return;
    }

    setCartItems(prev => prev.map(item => {
      if (item.productId === productId) {
        return {
          ...item,
          quantity: newQty,
          subtotal: newQty * item.unitPrice
        };
      }
      return item;
    }));
  };

  const removeFromCart = (productId: string) => {
    setCartItems(prev => prev.filter(item => item.productId !== productId));
  };

  const clearCart = () => {
    setCartItems([]);
    setDiscountAmount(0);
    setAmountPaid('');
    setNotes('');
  };

  // Financial calculations
  const subtotal = cartItems.reduce((acc, item) => acc + item.subtotal, 0);
  const totalDue = Math.max(0, subtotal - discountAmount);
  
  const parsedAmountPaid = amountPaid === '' ? (paymentMethod === 'credit' ? 0 : totalDue) : parseFloat(amountPaid) || 0;
  const changeDue = Math.max(0, parsedAmountPaid - totalDue);

  // Quick preset amount paid
  const handleQuickPayPreset = (amt: number) => {
    setAmountPaid(amt.toString());
  };

  // Complete Sale Action
  const handleCompleteSale = () => {
    if (cartItems.length === 0) return;

    if (paymentMethod !== 'credit' && parsedAmountPaid < totalDue) {
      const confirmPartial = window.confirm(`Amount paid (Le ${parsedAmountPaid.toLocaleString()}) is less than total due (Le ${totalDue.toLocaleString()}). The remaining Le ${(totalDue - parsedAmountPaid).toLocaleString()} will be recorded as Customer Credit Debt. Continue?`);
      if (!confirmPartial) return;
    }

    const sale = completeSale({
      customerId: selectedCustomerId,
      items: cartItems,
      subtotal,
      discount: discountAmount,
      totalAmount: totalDue,
      amountPaid: parsedAmountPaid,
      paymentMethod,
      notes
    });

    setCompletedSaleResult(sale);
    clearCart();
  };

  // Hold Cart Action
  const handleHoldCart = () => {
    if (cartItems.length === 0) return;
    const cust = customers.find(c => c.id === selectedCustomerId);
    holdCart(cust?.name || 'Walk-in Customer', selectedCustomerId, cartItems, notes);
    clearCart();
  };

  // Handle create customer
  const handleCreateCustomerSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCustName.trim()) return;
    const created = addCustomer({
      name: newCustName,
      phone: newCustPhone || 'N/A',
      address: newCustAddress || 'Freetown'
    });
    setSelectedCustomerId(created.id);
    setNewCustName('');
    setNewCustPhone('');
    setNewCustAddress('');
    setShowAddCustomerModal(false);
  };

  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto h-[calc(100vh-5rem)] flex flex-col">
      
      {/* POS Top Bar */}
      <div className="flex items-center justify-between mb-4 bg-slate-900 p-3 rounded-xl border border-slate-800">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-amber-500/20 text-amber-400 rounded-lg">
            <ShoppingCart className="w-5 h-5" />
          </div>
          <div>
            <h2 className="font-bold text-slate-100 text-sm">Neneh Funkuba POS Checkout</h2>
            <p className="text-[10px] text-slate-400">Cashier: {currentUser.name} ({currentUser.role.toUpperCase()})</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowBarcodeScanner(true)}
            className="px-3.5 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold text-xs rounded-lg shadow transition flex items-center gap-1.5 cursor-pointer"
            title="Scan product barcode with webcam or camera"
          >
            <Camera className="w-4 h-4" />
            <span>Scan Barcode</span>
          </button>

          {heldCarts.length > 0 && (
            <button
              onClick={() => setShowHeldCartsModal(true)}
              className="px-3 py-1.5 bg-amber-500/20 text-amber-300 border border-amber-500/40 rounded-lg text-xs font-bold flex items-center gap-1.5 animate-pulse"
            >
              <PauseCircle className="w-4 h-4" />
              <span>{heldCarts.length} Held Carts</span>
            </button>
          )}

          <button
            onClick={clearCart}
            disabled={cartItems.length === 0}
            className="px-3 py-1.5 text-xs text-rose-400 hover:bg-rose-500/10 rounded-lg border border-rose-500/30 disabled:opacity-40"
          >
            Clear Cart
          </button>
        </div>
      </div>

      {/* Main Split Screen */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 flex-1 min-h-0">
        
        {/* LEFT SIDE (60% - 7 cols): Product Catalogue */}
        <div className="lg:col-span-7 flex flex-col bg-slate-900 rounded-2xl border border-slate-800 p-4 min-h-0">
          
          {/* Search & Categories */}
          <div className="space-y-3 mb-4">
            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="text"
                  placeholder="Search product name or scan barcode..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-4 py-2.5 text-xs text-slate-100 focus:outline-none focus:border-amber-500"
                />
              </div>
              <button
                onClick={() => setShowBarcodeScanner(true)}
                className="px-3.5 py-2.5 bg-slate-800 hover:bg-slate-700 text-amber-400 border border-slate-700 rounded-xl text-xs font-bold transition flex items-center gap-1.5 shrink-0 cursor-pointer"
                title="Open Camera Barcode Scanner"
              >
                <Camera className="w-4 h-4" />
                <span className="hidden sm:inline">Camera Scan</span>
              </button>
            </div>

            {/* Category Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
              {categories.map(cat => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition ${
                    selectedCategory === cat
                      ? 'bg-amber-500 text-slate-950 font-bold'
                      : 'bg-slate-950 text-slate-300 border border-slate-800 hover:border-slate-700'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Product Grid */}
          <div className="flex-1 overflow-y-auto grid grid-cols-2 sm:grid-cols-3 gap-3 pr-1">
            {filteredProducts.map(product => {
              const isLow = product.currentStock <= product.minimumStockLevel;
              const isOut = product.currentStock <= 0;

              return (
                <button
                  key={product.id}
                  onClick={() => addToCart(product)}
                  disabled={isOut}
                  className={`p-3 rounded-xl border text-left transition relative flex flex-col justify-between ${
                    isOut
                      ? 'bg-slate-950/40 border-slate-800/50 opacity-50 cursor-not-allowed'
                      : 'bg-slate-950 hover:bg-slate-800/80 border-slate-800 hover:border-amber-500/50 cursor-pointer shadow-sm'
                  }`}
                >
                  <div>
                    <div className="flex items-start justify-between gap-1">
                      <h4 className="font-bold text-xs text-slate-200 line-clamp-2 leading-tight">
                        {product.name}
                      </h4>
                    </div>
                    <span className="text-[10px] text-slate-400 block mt-1">{product.unit}</span>
                  </div>

                  <div className="mt-3 pt-2 border-t border-slate-800/60 flex items-center justify-between">
                    <div>
                      <p className="text-xs font-extrabold text-amber-400">
                        {formatLeone(product.sellingPrice)}
                      </p>
                    </div>

                    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded border ${
                      isOut
                        ? 'bg-rose-500/20 text-rose-400 border-rose-500/30'
                        : isLow
                          ? 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                          : 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                    }`}>
                      {isOut ? 'Out of Stock' : `${product.currentStock} left`}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>

        </div>

        {/* RIGHT SIDE (40% - 5 cols): Cart & Payment Checkout */}
        <div className="lg:col-span-5 flex flex-col bg-slate-900 rounded-2xl border border-slate-800 p-4 min-h-0">
          
          {/* Customer Selection Header */}
          <div className="mb-3 flex items-center justify-between gap-2 bg-slate-950 p-2.5 rounded-xl border border-slate-800">
            <div className="flex-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Customer</label>
              <select
                value={selectedCustomerId}
                onChange={e => setSelectedCustomerId(e.target.value)}
                className="w-full bg-transparent text-xs font-bold text-slate-100 focus:outline-none cursor-pointer"
              >
                {customers.map(c => (
                  <option key={c.id} value={c.id} className="bg-slate-900">
                    {c.name} {c.creditBalance > 0 ? `(Owes Le ${c.creditBalance.toLocaleString()})` : ''}
                  </option>
                ))}
              </select>
            </div>

            <button
              onClick={() => setShowAddCustomerModal(true)}
              className="p-2 bg-slate-800 hover:bg-slate-700 text-amber-400 rounded-lg border border-slate-700 text-xs font-semibold flex items-center gap-1"
              title="Add New Customer"
            >
              <UserPlus className="w-4 h-4" />
            </button>
          </div>

          {/* Cart Items List */}
          <div className="flex-1 overflow-y-auto space-y-2 mb-3 pr-1">
            {cartItems.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-slate-500 py-12">
                <ShoppingCart className="w-10 h-10 stroke-1 mb-2 text-slate-600" />
                <p className="text-xs font-medium">Cart is currently empty</p>
                <p className="text-[10px] text-slate-600">Select items from the catalogue on left</p>
              </div>
            ) : (
              cartItems.map(item => (
                <div key={item.productId} className="bg-slate-950 p-2.5 rounded-xl border border-slate-800 flex items-center justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <h5 className="text-xs font-bold text-slate-200 truncate">{item.productName}</h5>
                    <p className="text-[10px] text-slate-400">{formatLeone(item.unitPrice)} each</p>
                  </div>

                  {/* Quantity Controls */}
                  <div className="flex items-center gap-1 bg-slate-900 border border-slate-800 rounded-lg p-0.5">
                    <button
                      onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                      className="w-5 h-5 flex items-center justify-center text-slate-300 hover:text-white hover:bg-slate-800 rounded"
                    >
                      <Minus className="w-3 h-3" />
                    </button>
                    <span className="w-6 text-center text-xs font-bold text-amber-400">{item.quantity}</span>
                    <button
                      onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                      className="w-5 h-5 flex items-center justify-center text-slate-300 hover:text-white hover:bg-slate-800 rounded"
                    >
                      <Plus className="w-3 h-3" />
                    </button>
                  </div>

                  <div className="text-right min-w-[70px]">
                    <span className="text-xs font-bold text-slate-100">{formatLeone(item.subtotal)}</span>
                  </div>

                  <button
                    onClick={() => removeFromCart(item.productId)}
                    className="text-slate-500 hover:text-rose-400 p-1"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))
            )}
          </div>

          {/* Payment Calculations Box */}
          <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 space-y-3 shrink-0">
            
            {/* Totals Breakdown */}
            <div className="space-y-1.5 text-xs">
              <div className="flex items-center justify-between text-slate-400">
                <span>Subtotal:</span>
                <span className="font-semibold text-slate-200">{formatLeone(subtotal)}</span>
              </div>

              <div className="flex items-center justify-between text-slate-400">
                <span className="flex items-center gap-1">
                  <Tag className="w-3 h-3 text-amber-400" />
                  Discount (Le):
                </span>
                <input
                  type="number"
                  min="0"
                  value={discountAmount || ''}
                  onChange={e => setDiscountAmount(Math.max(0, parseFloat(e.target.value) || 0))}
                  placeholder="0"
                  className="w-24 bg-slate-900 border border-slate-700 rounded px-2 py-0.5 text-right font-semibold text-slate-100 text-xs"
                />
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-slate-800 font-extrabold text-sm">
                <span className="text-white">TOTAL DUE:</span>
                <span className="text-amber-400 text-base">{formatLeone(totalDue)}</span>
              </div>
            </div>

            {/* Payment Method Selector */}
            <div>
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                Payment Channel
              </label>
              <div className="grid grid-cols-3 gap-1.5">
                {[
                  { id: 'cash', label: 'Cash', color: 'border-emerald-500/50 bg-emerald-950/20 text-emerald-400' },
                  { id: 'orange_money', label: 'Orange', color: 'border-amber-500/50 bg-amber-950/20 text-amber-400' },
                  { id: 'afrimoney', label: 'Afrimoney', color: 'border-red-500/50 bg-red-950/20 text-red-400' },
                  { id: 'qmoney', label: 'QMoney', color: 'border-blue-500/50 bg-blue-950/20 text-blue-400' },
                  { id: 'bank', label: 'Bank', color: 'border-purple-500/50 bg-purple-950/20 text-purple-400' },
                  { id: 'credit', label: 'Credit (Debt)', color: 'border-rose-500/50 bg-rose-950/20 text-rose-400' }
                ].map(pm => (
                  <button
                    key={pm.id}
                    onClick={() => setPaymentMethod(pm.id as PaymentMethod)}
                    className={`py-1.5 px-2 rounded-lg text-xs font-bold border transition text-center ${
                      paymentMethod === pm.id
                        ? `${pm.color} ring-2 ring-amber-400`
                        : 'bg-slate-900 text-slate-400 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    {pm.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Amount Paid & Change Calculator */}
            {paymentMethod !== 'credit' && (
              <div className="space-y-2 pt-1 border-t border-slate-800/60">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Amt Paid (Le)</label>
                    <input
                      type="number"
                      value={amountPaid}
                      onChange={e => setAmountPaid(e.target.value)}
                      placeholder={totalDue.toString()}
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs font-bold text-emerald-400 focus:outline-none focus:border-emerald-500"
                    />
                  </div>

                  <div className="text-right">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Change Due</span>
                    <span className="text-xs font-black text-amber-400">{formatLeone(changeDue)}</span>
                  </div>
                </div>

                {/* Quick Cash preset pills */}
                <div className="flex items-center gap-1 overflow-x-auto">
                  {[totalDue, 100000, 200000, 500000, 1000000].map((preset, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleQuickPayPreset(preset)}
                      className="px-2 py-0.5 bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded text-[10px] font-medium text-slate-300"
                    >
                      {preset >= 1000000 ? `${preset / 1000000}M` : `${preset / 1000}k`}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="grid grid-cols-2 gap-2 pt-2">
              <button
                onClick={handleHoldCart}
                disabled={cartItems.length === 0}
                className="py-2.5 px-3 bg-slate-800 hover:bg-slate-700 text-amber-400 border border-slate-700 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 disabled:opacity-40 transition"
              >
                <PauseCircle className="w-4 h-4" />
                <span>HOLD CART</span>
              </button>

              <button
                onClick={handleCompleteSale}
                disabled={cartItems.length === 0}
                className="py-2.5 px-3 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-xs rounded-xl shadow-lg shadow-amber-900/30 flex items-center justify-center gap-1.5 disabled:opacity-40 transition"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>COMPLETE SALE</span>
              </button>
            </div>

          </div>

        </div>

      </div>

      {/* MODAL: Receipt Modal after sale completion */}
      {completedSaleResult && (
        <ReceiptModal
          sale={completedSaleResult}
          onClose={() => setCompletedSaleResult(null)}
        />
      )}

      {/* MODAL: Quick Add Customer */}
      {showAddCustomerModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 space-y-4">
            <h3 className="font-bold text-slate-100 text-sm flex items-center gap-2">
              <UserPlus className="w-4 h-4 text-amber-400" />
              Quick Register New Customer
            </h3>

            <form onSubmit={handleCreateCustomerSubmit} className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">Customer Full Name *</label>
                <input
                  type="text"
                  required
                  value={newCustName}
                  onChange={e => setNewCustName(e.target.value)}
                  placeholder="e.g. Alhaji Mohamed Bangura"
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">Phone Number</label>
                <input
                  type="text"
                  value={newCustPhone}
                  onChange={e => setNewCustPhone(e.target.value)}
                  placeholder="+232 76 123 456"
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">Address / Market Location</label>
                <input
                  type="text"
                  value={newCustAddress}
                  onChange={e => setNewCustAddress(e.target.value)}
                  placeholder="e.g. Kissy Road Market"
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddCustomerModal(false)}
                  className="px-4 py-2 bg-slate-800 text-slate-300 text-xs font-semibold rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-amber-500 text-slate-950 font-bold text-xs rounded-lg shadow"
                >
                  Save & Select Customer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: Held Carts Drawer */}
      {showHeldCartsModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-lg w-full p-6 space-y-4 max-h-[80vh] flex flex-col">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="font-bold text-slate-100 text-sm flex items-center gap-2">
                <PauseCircle className="w-5 h-5 text-amber-400" />
                Held Sales Carts ({heldCarts.length})
              </h3>
              <button onClick={() => setShowHeldCartsModal(false)} className="text-slate-400 hover:text-white font-bold">✕</button>
            </div>

            <div className="flex-1 overflow-y-auto space-y-3">
              {heldCarts.length === 0 ? (
                <p className="text-xs text-slate-400 text-center py-8">No held carts currently saved.</p>
              ) : (
                heldCarts.map(cart => (
                  <div key={cart.id} className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 flex items-center justify-between gap-3">
                    <div>
                      <h4 className="text-xs font-bold text-slate-200">{cart.customerName}</h4>
                      <p className="text-[10px] text-slate-400 mt-0.5">
                        {cart.items.length} items • Saved {new Date(cart.date).toLocaleTimeString()}
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => {
                          const restored = resumeCart(cart.id);
                          if (restored) {
                            setCartItems(restored.items);
                            setSelectedCustomerId(restored.customerId);
                            setShowHeldCartsModal(false);
                          }
                        }}
                        className="px-3 py-1.5 bg-amber-500 text-slate-950 font-bold text-xs rounded-lg"
                      >
                        Resume Cart
                      </button>
                      <button
                        onClick={() => deleteHeldCart(cart.id)}
                        className="p-1.5 text-slate-500 hover:text-rose-400"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* MODAL: Camera Barcode Scanner */}
      {showBarcodeScanner && (
        <BarcodeScannerModal
          products={products}
          onScanProduct={(product) => {
            addToCart(product);
          }}
          onClose={() => setShowBarcodeScanner(false)}
        />
      )}

    </div>
  );
};
