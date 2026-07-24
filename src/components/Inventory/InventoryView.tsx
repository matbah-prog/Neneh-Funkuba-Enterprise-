import React, { useState } from 'react';
import { useERP } from '../../context/ERPContext';
import { Product } from '../../types';
import { formatLeone } from '../../utils/formatters';
import { 
  Package, Search, Plus, AlertTriangle, ArrowUpDown, 
  Edit3, RotateCcw, Check, Sparkles, Filter, ShieldAlert 
} from 'lucide-react';

export const InventoryView: React.FC = () => {
  const { products, addProduct, updateProduct, restockProduct } = useERP();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  
  // Modals
  const [showAddModal, setShowAddModal] = useState(false);
  const [restockProductTarget, setRestockProductTarget] = useState<Product | null>(null);

  // New product form
  const [name, setName] = useState('');
  const [category, setCategory] = useState('Provisions');
  const [buyingPrice, setBuyingPrice] = useState('');
  const [sellingPrice, setSellingPrice] = useState('');
  const [currentStock, setCurrentStock] = useState('');
  const [minimumStockLevel, setMinimumStockLevel] = useState('20');
  const [reorderQuantity, setReorderQuantity] = useState('50');
  const [unit, setUnit] = useState('Bag (50kg)');
  const [barcode, setBarcode] = useState('');

  // Restock form
  const [additionalStock, setAdditionalStock] = useState('');
  const [newBuyingPrice, setNewBuyingPrice] = useState('');

  const categories = ['All', ...Array.from(new Set(products.map(p => p.category)))];

  const filteredProducts = products.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          (p.barcode && p.barcode.includes(searchQuery));
    const matchesCat = selectedCategory === 'All' || p.category === selectedCategory;
    return matchesSearch && matchesCat;
  });

  const totalStockValue = products.reduce((acc, p) => acc + (p.currentStock * p.buyingPrice), 0);
  const totalStockUnits = products.reduce((acc, p) => acc + p.currentStock, 0);
  const lowStockCount = products.filter(p => p.currentStock <= p.minimumStockLevel).length;

  const handleAddProductSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    addProduct({
      name,
      category,
      buyingPrice: parseFloat(buyingPrice) || 0,
      sellingPrice: parseFloat(sellingPrice) || 0,
      currentStock: parseInt(currentStock) || 0,
      minimumStockLevel: parseInt(minimumStockLevel) || 10,
      reorderQuantity: parseInt(reorderQuantity) || 50,
      unit,
      barcode
    });

    setName('');
    setBuyingPrice('');
    setSellingPrice('');
    setCurrentStock('');
    setShowAddModal(false);
  };

  const handleRestockSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!restockProductTarget || !additionalStock) return;

    const qty = parseInt(additionalStock) || 0;
    const bp = newBuyingPrice ? parseFloat(newBuyingPrice) : undefined;

    restockProduct(restockProductTarget.id, qty, bp);

    setRestockProductTarget(null);
    setAdditionalStock('');
    setNewBuyingPrice('');
  };

  return (
    <div className="p-4 sm:p-6 space-y-6 max-w-7xl mx-auto">
      
      {/* Header & Stats */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-slate-900 p-5 rounded-2xl border border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <Package className="w-5 h-5 text-amber-400" />
            <h2 className="text-lg font-bold text-slate-100">Inventory & Stock Master Catalog</h2>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Track product stock levels, buying prices, selling margins, and reorder thresholds.
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="px-4 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-xl shadow flex items-center gap-2 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Product</span>
        </button>
      </div>

      {/* Stats Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-slate-900 p-4 rounded-xl border border-slate-800">
          <span className="text-xs text-slate-400 font-medium">Total Stock Valuation</span>
          <p className="text-xl font-extrabold text-emerald-400 mt-1">{formatLeone(totalStockValue)}</p>
          <span className="text-[10px] text-slate-500">Based on buying cost</span>
        </div>

        <div className="bg-slate-900 p-4 rounded-xl border border-slate-800">
          <span className="text-xs text-slate-400 font-medium">Total Units in Warehouse</span>
          <p className="text-xl font-extrabold text-white mt-1">{totalStockUnits.toLocaleString()} units</p>
          <span className="text-[10px] text-slate-500">{products.length} distinct product SKUs</span>
        </div>

        <div className="bg-slate-900 p-4 rounded-xl border border-slate-800">
          <span className="text-xs text-slate-400 font-medium">Low Stock Alerts</span>
          <p className="text-xl font-extrabold text-rose-400 mt-1">{lowStockCount} Products</p>
          <span className="text-[10px] text-slate-500">Below minimum threshold</span>
        </div>
      </div>

      {/* Filters & Search */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-slate-900 p-3 rounded-xl border border-slate-800">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search by product name or barcode..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-9 pr-4 py-2 text-xs text-slate-100 focus:outline-none focus:border-amber-500"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition ${
                selectedCategory === cat
                  ? 'bg-amber-500 text-slate-950 font-bold'
                  : 'bg-slate-950 text-slate-400 border border-slate-800 hover:border-slate-700'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Products Table */}
      <div className="bg-slate-900 rounded-2xl border border-slate-800 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950 text-slate-400 font-bold text-[10px] uppercase tracking-wider border-b border-slate-800">
              <tr>
                <th className="p-3.5">Product Name</th>
                <th className="p-3.5">Category</th>
                <th className="p-3.5 text-right">Buying Cost</th>
                <th className="p-3.5 text-right">Selling Price</th>
                <th className="p-3.5 text-right">Margin</th>
                <th className="p-3.5 text-center">Stock Level</th>
                <th className="p-3.5 text-right">Stock Value</th>
                <th className="p-3.5 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filteredProducts.map(p => {
                const isLow = p.currentStock <= p.minimumStockLevel;
                const margin = p.sellingPrice - p.buyingPrice;
                const stockVal = p.currentStock * p.buyingPrice;

                return (
                  <tr key={p.id} className="hover:bg-slate-800/40 transition">
                    <td className="p-3.5 font-bold text-slate-100">
                      <div>
                        <span>{p.name}</span>
                        {p.barcode && <span className="text-[10px] text-slate-500 block font-mono">BC: {p.barcode}</span>}
                      </div>
                    </td>

                    <td className="p-3.5 text-slate-400">
                      <span className="px-2 py-0.5 rounded bg-slate-800 border border-slate-700 text-[10px] font-medium">
                        {p.category}
                      </span>
                    </td>

                    <td className="p-3.5 text-right font-medium text-slate-300">
                      {formatLeone(p.buyingPrice)}
                    </td>

                    <td className="p-3.5 text-right font-bold text-amber-400">
                      {formatLeone(p.sellingPrice)}
                    </td>

                    <td className="p-3.5 text-right text-emerald-400 font-semibold">
                      +{formatLeone(margin)}
                    </td>

                    <td className="p-3.5 text-center">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-bold inline-flex items-center gap-1 border ${
                        isLow 
                          ? 'bg-rose-500/20 text-rose-300 border-rose-500/30' 
                          : 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                      }`}>
                        {isLow && <AlertTriangle className="w-3 h-3 text-rose-400" />}
                        {p.currentStock} {p.unit}
                      </span>
                    </td>

                    <td className="p-3.5 text-right font-bold text-slate-200">
                      {formatLeone(stockVal)}
                    </td>

                    <td className="p-3.5 text-center">
                      <button
                        onClick={() => {
                          setRestockProductTarget(p);
                          setNewBuyingPrice(p.buyingPrice.toString());
                        }}
                        className="px-3 py-1 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 rounded-lg text-xs font-bold transition"
                      >
                        + Restock
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL: Add New Product */}
      {showAddModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-lg w-full p-6 space-y-4">
            <h3 className="font-bold text-slate-100 text-sm flex items-center gap-2">
              <Package className="w-4 h-4 text-amber-400" />
              Add Product to Inventory Master
            </h3>

            <form onSubmit={handleAddProductSubmit} className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div className="col-span-2">
                  <label className="text-xs font-semibold text-slate-300 block mb-1">Product Name *</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={e => setName(e.target.value)}
                    placeholder="e.g. Parboiled Rice 50kg"
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">Category</label>
                  <select
                    value={category}
                    onChange={e => setCategory(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-amber-500"
                  >
                    <option value="Grains & Rice">Grains & Rice</option>
                    <option value="Building Materials">Building Materials</option>
                    <option value="Cooking Oils">Cooking Oils</option>
                    <option value="Provisions">Provisions</option>
                    <option value="Beverages">Beverages</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">Packaging Unit</label>
                  <input
                    type="text"
                    value={unit}
                    onChange={e => setUnit(e.target.value)}
                    placeholder="Bag (50kg), Carton, Tin"
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">Buying Cost (Le) *</label>
                  <input
                    type="number"
                    required
                    value={buyingPrice}
                    onChange={e => setBuyingPrice(e.target.value)}
                    placeholder="340000"
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">Selling Price (Le) *</label>
                  <input
                    type="number"
                    required
                    value={sellingPrice}
                    onChange={e => setSellingPrice(e.target.value)}
                    placeholder="400000"
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">Initial Stock Qty</label>
                  <input
                    type="number"
                    required
                    value={currentStock}
                    onChange={e => setCurrentStock(e.target.value)}
                    placeholder="50"
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">Min Low Stock Alert</label>
                  <input
                    type="number"
                    value={minimumStockLevel}
                    onChange={e => setMinimumStockLevel(e.target.value)}
                    placeholder="15"
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-amber-500"
                  />
                </div>
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
                  Save Product
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: Restock Product */}
      {restockProductTarget && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 space-y-4">
            <h3 className="font-bold text-slate-100 text-sm flex items-center gap-2">
              <RotateCcw className="w-4 h-4 text-amber-400" />
              Restock Item: {restockProductTarget.name}
            </h3>

            <p className="text-xs text-slate-400">
              Current stock: <strong className="text-white">{restockProductTarget.currentStock} {restockProductTarget.unit}</strong>
            </p>

            <form onSubmit={handleRestockSubmit} className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">Additional Quantity Received</label>
                <input
                  type="number"
                  required
                  min="1"
                  value={additionalStock}
                  onChange={e => setAdditionalStock(e.target.value)}
                  placeholder="e.g. 50"
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">Updated Buying Price (Le)</label>
                <input
                  type="number"
                  value={newBuyingPrice}
                  onChange={e => setNewBuyingPrice(e.target.value)}
                  placeholder={restockProductTarget.buyingPrice.toString()}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setRestockProductTarget(null)}
                  className="px-4 py-2 bg-slate-800 text-slate-300 text-xs font-semibold rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-amber-500 text-slate-950 font-bold text-xs rounded-lg"
                >
                  Update Stock Level
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
