import React from 'react';
import { useERP } from '../../context/ERPContext';
import { formatLeone } from '../../utils/formatters';
import { 
  TrendingUp, TrendingDown, DollarSign, Wallet, Building, 
  CreditCard, Package, AlertTriangle, ShoppingBag, ArrowUpRight, 
  ArrowDownRight, ShoppingCart, PlusCircle, ArrowRightLeft, Users, LineChart as ChartIcon
} from 'lucide-react';
import { TabType } from '../Sidebar';
import { 
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, 
  CartesianGrid, Tooltip, Legend, LineChart, Line 
} from 'recharts';

interface ExecutiveDashboardProps {
  onNavigate: (tab: TabType) => void;
}

export const ExecutiveDashboard: React.FC<ExecutiveDashboardProps> = ({ onNavigate }) => {
  const { sales, expenses, ledgers, products, customers, suppliers } = useERP();

  // 1. Calculate Today's Sales & COGS
  const todayStr = new Date().toISOString().split('T')[0];
  
  const todaySalesList = sales.filter(s => s.date.startsWith(todayStr) && s.status === 'completed');
  const totalTodaySales = todaySalesList.reduce((acc, s) => acc + s.totalAmount, 0);

  const todayCOGS = todaySalesList.reduce((acc, s) => {
    const saleCOGS = s.items.reduce((itemAcc, item) => itemAcc + (item.buyingPrice * item.quantity), 0);
    return acc + saleCOGS;
  }, 0);

  const grossProfit = totalTodaySales - todayCOGS;

  // 2. Today's Expenses
  const todayExpensesList = expenses.filter(e => e.date.startsWith(todayStr));
  const totalTodayExpenses = todayExpensesList.reduce((acc, e) => acc + e.amount, 0);

  const netProfit = grossProfit - totalTodayExpenses;

  // 3. Ledgers Balances (Cash, Orange Money, Afrimoney, QMoney, Bank)
  const calculateLedgerBalance = (type: 'cash' | 'orange_money' | 'afrimoney' | 'qmoney' | 'bank') => {
    return ledgers
      .filter(l => l.ledgerType === type)
      .reduce((acc, l) => {
        if (l.type === 'debit') return acc + l.amount;
        if (l.type === 'credit') return acc - l.amount - (l.feeCharge || 0);
        return acc;
      }, 0);
  };

  const cashInHand = calculateLedgerBalance('cash');
  const orangeMoneyBalance = calculateLedgerBalance('orange_money');
  const afrimoneyBalance = calculateLedgerBalance('afrimoney');
  const qmoneyBalance = calculateLedgerBalance('qmoney');
  const totalMobileMoney = orangeMoneyBalance + afrimoneyBalance + qmoneyBalance;
  const bankBalance = calculateLedgerBalance('bank');

  // 4. Debts
  const totalCustomerDebts = customers.reduce((acc, c) => acc + c.creditBalance, 0);
  const totalSupplierDebts = suppliers.reduce((acc, s) => acc + s.outstandingBalance, 0);

  // 5. Inventory Stock Value & Low Stock
  const currentStockValue = products.reduce((acc, p) => acc + (p.currentStock * p.buyingPrice), 0);
  const lowStockProducts = products.filter(p => p.currentStock <= p.minimumStockLevel);

  // 6. Best Selling Products
  const productSalesCount: Record<string, { name: string; qty: number; revenue: number }> = {};
  sales.forEach(s => {
    s.items.forEach(item => {
      if (!productSalesCount[item.productId]) {
        productSalesCount[item.productId] = { name: item.productName, qty: 0, revenue: 0 };
      }
      productSalesCount[item.productId].qty += item.quantity;
      productSalesCount[item.productId].revenue += item.subtotal;
    });
  });

  const bestSellers = Object.values(productSalesCount)
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 5);

  // 7. 7-Day Sales Trend Calculation
  const last7DaysData = Array.from({ length: 7 }).map((_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    const isoDate = d.toISOString().split('T')[0];
    const dayLabel = d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
    
    const daySalesList = sales.filter(s => s.date.startsWith(isoDate) && s.status === 'completed');
    const dayTotal = daySalesList.reduce((acc, s) => acc + s.totalAmount, 0);
    const dayOrders = daySalesList.length;

    return {
      date: isoDate,
      day: dayLabel,
      Sales: dayTotal,
      Orders: dayOrders,
    };
  });

  const total7DayRevenue = last7DaysData.reduce((acc, d) => acc + d.Sales, 0);

  const CustomChartTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-slate-950 border border-slate-700 p-3 rounded-xl shadow-2xl text-xs space-y-1">
          <p className="font-extrabold text-amber-400">{label}</p>
          <p className="text-emerald-400 font-bold">
            Revenue: {formatLeone(payload[0]?.value || 0)}
          </p>
          {payload[1] && (
            <p className="text-slate-300 font-medium">
              Orders: {payload[1].value} completed
            </p>
          )}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="p-4 sm:p-6 space-y-6 max-w-7xl mx-auto">
      
      {/* Top Banner / Welcome */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-amber-950 p-6 rounded-2xl border border-slate-700/80 shadow-lg text-white flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
              Live Business Overview
            </span>
            <span className="text-xs text-slate-400">Date: {new Date().toLocaleDateString('en-US', { dateStyle: 'full' })}</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black mt-1 text-white tracking-tight">
            Neneh Funkuba Enterprise Dashboard
          </h2>
          <p className="text-xs text-slate-300 mt-1 max-w-xl">
            Real-time synchronization across Wholesale & Retail Sales, Cash Book, Mobile Money Lines, Inventory, and Outstanding Ledger Debts.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => onNavigate('pos')}
            className="px-4 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-xl shadow-lg shadow-amber-900/30 transition flex items-center gap-2 cursor-pointer"
          >
            <ShoppingCart className="w-4 h-4" />
            <span>Launch POS Checkout</span>
          </button>
          <button
            onClick={() => onNavigate('expenses')}
            className="px-3.5 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-600 font-semibold text-xs rounded-xl transition flex items-center gap-1.5 cursor-pointer"
          >
            <PlusCircle className="w-4 h-4 text-amber-400" />
            <span>Record Expense</span>
          </button>
        </div>
      </div>

      {/* Row 1: Key Financial Highlights */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Today Sales */}
        <div className="bg-slate-900 p-4 rounded-xl border border-slate-800 shadow-sm relative overflow-hidden group">
          <div className="flex items-center justify-between text-slate-400 text-xs font-semibold">
            <span>Today's Sales</span>
            <div className="p-2 bg-emerald-500/10 rounded-lg text-emerald-400">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2">
            <h3 className="text-xl font-bold text-white">{formatLeone(totalTodaySales)}</h3>
            <p className="text-[11px] text-slate-400 mt-1 flex items-center gap-1">
              <span className="text-emerald-400 font-semibold">{todaySalesList.length} orders</span> completed today
            </p>
          </div>
        </div>

        {/* Today Expenses */}
        <div className="bg-slate-900 p-4 rounded-xl border border-slate-800 shadow-sm">
          <div className="flex items-center justify-between text-slate-400 text-xs font-semibold">
            <span>Today's Expenses</span>
            <div className="p-2 bg-rose-500/10 rounded-lg text-rose-400">
              <TrendingDown className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2">
            <h3 className="text-xl font-bold text-white">{formatLeone(totalTodayExpenses)}</h3>
            <p className="text-[11px] text-slate-400 mt-1">
              {todayExpensesList.length} operational receipts logged
            </p>
          </div>
        </div>

        {/* Gross Profit */}
        <div className="bg-slate-900 p-4 rounded-xl border border-slate-800 shadow-sm">
          <div className="flex items-center justify-between text-slate-400 text-xs font-semibold">
            <span>Gross Profit</span>
            <div className="p-2 bg-blue-500/10 rounded-lg text-blue-400">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2">
            <h3 className="text-xl font-bold text-white">{formatLeone(grossProfit)}</h3>
            <p className="text-[11px] text-slate-400 mt-1">
              Sales Revenue minus COGS
            </p>
          </div>
        </div>

        {/* Net Profit */}
        <div className={`p-4 rounded-xl border shadow-sm ${netProfit >= 0 ? 'bg-slate-900 border-amber-500/30' : 'bg-rose-950/20 border-rose-800/50'}`}>
          <div className="flex items-center justify-between text-slate-400 text-xs font-semibold">
            <span>Net Profit (Today)</span>
            <div className="p-2 bg-amber-500/10 rounded-lg text-amber-400">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2">
            <h3 className={`text-xl font-bold ${netProfit >= 0 ? 'text-amber-400' : 'text-rose-400'}`}>
              {formatLeone(netProfit)}
            </h3>
            <p className="text-[11px] text-slate-400 mt-1">
              Gross Profit minus Expenses
            </p>
          </div>
        </div>

      </div>

      {/* Recharts 7-Day Sales Trend Chart */}
      <div className="bg-slate-900 rounded-xl border border-slate-800 p-5 space-y-4 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-amber-500/10 text-amber-400 rounded-lg border border-amber-500/20">
              <ChartIcon className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-100 text-sm">7-Day Sales Revenue Trend</h3>
              <p className="text-[11px] text-slate-400">Daily transaction volume and revenue performance tracking</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="text-right">
              <span className="text-[10px] text-slate-400 uppercase tracking-wider block font-bold">7-Day Total Revenue</span>
              <span className="text-sm font-extrabold text-emerald-400">{formatLeone(total7DayRevenue)}</span>
            </div>
          </div>
        </div>

        {/* Recharts Chart */}
        <div className="h-64 sm:h-72 w-full pt-2">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={last7DaysData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="salesGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.5} />
              <XAxis 
                dataKey="day" 
                stroke="#94a3b8" 
                fontSize={11} 
                tickLine={false} 
                axisLine={{ stroke: '#334155' }} 
              />
              <YAxis 
                stroke="#94a3b8" 
                fontSize={10} 
                tickLine={false} 
                axisLine={{ stroke: '#334155' }} 
                tickFormatter={(val) => `Le ${val >= 1000 ? `${(val / 1000).toFixed(0)}k` : val}`}
              />
              <Tooltip content={<CustomChartTooltip />} />
              <Legend 
                wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} 
                formatter={(value) => <span className="text-slate-300 font-semibold">{value}</span>}
              />
              <Area 
                type="monotone" 
                dataKey="Sales" 
                name="Sales Revenue (Le)" 
                stroke="#10b981" 
                strokeWidth={3} 
                fillOpacity={1} 
                fill="url(#salesGradient)" 
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Row 2: Cash & Mobile Money Balances (Sierra Leone Multi-Channel Ledgers) */}
      <div className="bg-slate-900 rounded-xl border border-slate-800 p-5 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Wallet className="w-5 h-5 text-amber-400" />
            <h3 className="font-bold text-slate-100 text-sm">
              Live Money Ledgers & Account Balances
            </h3>
          </div>
          <button 
            onClick={() => onNavigate('ledgers')} 
            className="text-xs text-amber-400 hover:underline font-semibold flex items-center gap-1"
          >
            <span>View Full Ledger Book</span>
            <ArrowRightLeft className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          
          {/* Cash in Hand */}
          <div className="bg-slate-950 p-3.5 rounded-lg border border-slate-800">
            <div className="flex items-center justify-between text-slate-400 text-xs">
              <span className="font-medium">Cash in Hand</span>
              <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
            </div>
            <p className="text-base font-bold text-emerald-400 mt-1">{formatLeone(cashInHand)}</p>
            <span className="text-[10px] text-slate-400">Physical shop cash register</span>
          </div>

          {/* Orange Money */}
          <div className="bg-slate-950 p-3.5 rounded-lg border border-slate-800">
            <div className="flex items-center justify-between text-slate-400 text-xs">
              <span className="font-medium text-amber-400 font-bold">Orange Money</span>
              <span className="w-2 h-2 rounded-full bg-amber-500"></span>
            </div>
            <p className="text-base font-bold text-white mt-1">{formatLeone(orangeMoneyBalance)}</p>
            <span className="text-[10px] text-slate-400">Orange merchant till</span>
          </div>

          {/* Afrimoney */}
          <div className="bg-slate-950 p-3.5 rounded-lg border border-slate-800">
            <div className="flex items-center justify-between text-slate-400 text-xs">
              <span className="font-medium text-red-400 font-bold">Afrimoney</span>
              <span className="w-2 h-2 rounded-full bg-red-500"></span>
            </div>
            <p className="text-base font-bold text-white mt-1">{formatLeone(afrimoneyBalance)}</p>
            <span className="text-[10px] text-slate-400">Africell mobile account</span>
          </div>

          {/* QMoney */}
          <div className="bg-slate-950 p-3.5 rounded-lg border border-slate-800">
            <div className="flex items-center justify-between text-slate-400 text-xs">
              <span className="font-medium text-blue-400 font-bold">QMoney</span>
              <span className="w-2 h-2 rounded-full bg-blue-500"></span>
            </div>
            <p className="text-base font-bold text-white mt-1">{formatLeone(qmoneyBalance)}</p>
            <span className="text-[10px] text-slate-400">QCell merchant wallet</span>
          </div>

          {/* Bank Balance */}
          <div className="bg-slate-950 p-3.5 rounded-lg border border-slate-800">
            <div className="flex items-center justify-between text-slate-400 text-xs">
              <span className="font-medium text-purple-400 font-bold">Bank Balance</span>
              <Building className="w-3.5 h-3.5 text-purple-400" />
            </div>
            <p className="text-base font-bold text-white mt-1">{formatLeone(bankBalance)}</p>
            <span className="text-[10px] text-slate-400">Rokel Commercial Bank</span>
          </div>

        </div>
      </div>

      {/* Row 3: Outstanding Debts & Stock Value */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        
        {/* Customer Debts */}
        <div className="bg-slate-900 p-4 rounded-xl border border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span className="font-semibold flex items-center gap-1.5">
              <Users className="w-4 h-4 text-amber-400" />
              Customer Debts Owed to Us
            </span>
            <button onClick={() => onNavigate('credit')} className="text-amber-400 hover:underline font-medium">Manage</button>
          </div>
          <h4 className="text-xl font-bold text-amber-400">{formatLeone(totalCustomerDebts)}</h4>
          <p className="text-[11px] text-slate-400">
            Total credit outstanding across wholesale & retail customers.
          </p>
        </div>

        {/* Supplier Debts */}
        <div className="bg-slate-900 p-4 rounded-xl border border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span className="font-semibold flex items-center gap-1.5">
              <CreditCard className="w-4 h-4 text-rose-400" />
              Supplier Debts We Owe
            </span>
            <button onClick={() => onNavigate('suppliers')} className="text-rose-400 hover:underline font-medium">Manage</button>
          </div>
          <h4 className="text-xl font-bold text-rose-400">{formatLeone(totalSupplierDebts)}</h4>
          <p className="text-[11px] text-slate-400">
            Accounts payable to importers & distributors.
          </p>
        </div>

        {/* Total Inventory Stock Value */}
        <div className="bg-slate-900 p-4 rounded-xl border border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span className="font-semibold flex items-center gap-1.5">
              <Package className="w-4 h-4 text-emerald-400" />
              Current Stock Asset Value
            </span>
            <button onClick={() => onNavigate('inventory')} className="text-emerald-400 hover:underline font-medium">Inventory</button>
          </div>
          <h4 className="text-xl font-bold text-emerald-400">{formatLeone(currentStockValue)}</h4>
          <p className="text-[11px] text-slate-400">
            Total cost valuation of {products.length} products in shop.
          </p>
        </div>

      </div>

      {/* Row 4: Low Stock Alerts & Best Selling Items */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Low Stock Warning Box */}
        <div className="bg-slate-900 rounded-xl border border-slate-800 p-5 space-y-3">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-rose-400" />
              <h3 className="font-bold text-slate-100 text-sm">Low Stock Reorder Alerts</h3>
            </div>
            <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-rose-500/20 text-rose-300 border border-rose-500/30">
              {lowStockProducts.length} Items Low
            </span>
          </div>

          {lowStockProducts.length === 0 ? (
            <p className="text-xs text-slate-400 py-4 text-center">All inventory items are well stocked!</p>
          ) : (
            <div className="space-y-2.5">
              {lowStockProducts.map(p => (
                <div key={p.id} className="bg-slate-950 p-3 rounded-lg border border-slate-800 flex items-center justify-between gap-2">
                  <div>
                    <h4 className="text-xs font-bold text-slate-200">{p.name}</h4>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      Min threshold: <span className="text-amber-400 font-semibold">{p.minimumStockLevel} {p.unit}</span>
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="px-2 py-0.5 text-xs font-black rounded bg-rose-500/20 text-rose-400 border border-rose-500/30 inline-block mb-1">
                      Only {p.currentStock} {p.unit} left
                    </span>
                    <div>
                      <button
                        onClick={() => onNavigate('inventory')}
                        className="text-[11px] text-amber-400 hover:underline font-semibold"
                      >
                        Restock Now →
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Best Selling Products */}
        <div className="bg-slate-900 rounded-xl border border-slate-800 p-5 space-y-3">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <div className="flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-amber-400" />
              <h3 className="font-bold text-slate-100 text-sm">Top Revenue Generators</h3>
            </div>
            <span className="text-xs text-slate-400">By Sales Volume</span>
          </div>

          <div className="space-y-2.5">
            {bestSellers.map((item, idx) => (
              <div key={idx} className="bg-slate-950 p-3 rounded-lg border border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="w-6 h-6 rounded-full bg-amber-500/10 text-amber-400 font-bold text-xs flex items-center justify-center border border-amber-500/20">
                    #{idx + 1}
                  </span>
                  <div>
                    <h4 className="text-xs font-bold text-slate-200">{item.name}</h4>
                    <p className="text-[11px] text-slate-400">{item.qty} units sold</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xs font-bold text-emerald-400">{formatLeone(item.revenue)}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

    </div>
  );
};
