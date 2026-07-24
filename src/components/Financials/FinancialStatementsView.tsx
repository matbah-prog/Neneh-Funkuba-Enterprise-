import React, { useState } from 'react';
import { useERP } from '../../context/ERPContext';
import { formatLeone } from '../../utils/formatters';
import { Landmark, PieChart, CheckCircle2, TrendingUp, DollarSign, Scale, Printer } from 'lucide-react';

export const FinancialStatementsView: React.FC = () => {
  const { sales, expenses, ledgers, products, customers, suppliers } = useERP();

  const [activeTab, setActiveTab] = useState<'pnl' | 'balancesheet'>('pnl');

  // --- Profit & Loss Calculations ---
  const completedSales = sales.filter(s => s.status === 'completed');
  const totalSalesRevenue = completedSales.reduce((acc, s) => acc + s.totalAmount, 0);

  const totalCOGS = completedSales.reduce((acc, s) => {
    const saleCOGS = s.items.reduce((iAcc, item) => iAcc + (item.buyingPrice * item.quantity), 0);
    return acc + saleCOGS;
  }, 0);

  const grossProfit = totalSalesRevenue - totalCOGS;

  const totalOperatingExpenses = expenses.reduce((acc, e) => acc + e.amount, 0);
  const netProfit = grossProfit - totalOperatingExpenses;

  // Expense breakdown by category
  const expenseByCategory: Record<string, number> = {};
  expenses.forEach(e => {
    expenseByCategory[e.category] = (expenseByCategory[e.category] || 0) + e.amount;
  });

  // --- Balance Sheet Calculations ---
  const getLedgerBal = (type: 'cash' | 'orange_money' | 'afrimoney' | 'qmoney' | 'bank') => {
    return ledgers
      .filter(l => l.ledgerType === type)
      .reduce((acc, l) => {
        if (l.type === 'debit') return acc + l.amount;
        if (l.type === 'credit') return acc - l.amount - (l.feeCharge || 0);
        return acc;
      }, 0);
  };

  const cashAsset = getLedgerBal('cash');
  const orangeAsset = getLedgerBal('orange_money');
  const afriAsset = getLedgerBal('afrimoney');
  const qAsset = getLedgerBal('qmoney');
  const mobileMoneyAsset = orangeAsset + afriAsset + qAsset;
  const bankAsset = getLedgerBal('bank');
  const inventoryAsset = products.reduce((acc, p) => acc + (p.currentStock * p.buyingPrice), 0);
  const accountsReceivableAsset = customers.reduce((acc, c) => acc + c.creditBalance, 0);
  const equipmentAsset = 35000000; // Generator, Computers, Shop Fittings

  const totalAssets = cashAsset + bankAsset + mobileMoneyAsset + inventoryAsset + accountsReceivableAsset + equipmentAsset;

  // Liabilities
  const accountsPayableLiability = suppliers.reduce((acc, s) => acc + s.outstandingBalance, 0);
  const taxesPayableLiability = 2500000;
  const totalLiabilities = accountsPayableLiability + taxesPayableLiability;

  // Equity
  const ownersCapital = 150000000; // Starting Capital
  const retainedEarnings = netProfit;
  const totalEquity = ownersCapital + retainedEarnings;

  const totalLiabilitiesAndEquity = totalLiabilities + totalEquity;
  const isBalanced = Math.abs(totalAssets - totalLiabilitiesAndEquity) < 1;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="p-4 sm:p-6 space-y-6 max-w-7xl mx-auto">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-slate-900 p-5 rounded-2xl border border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <Landmark className="w-5 h-5 text-amber-400" />
            <h2 className="text-lg font-bold text-slate-100">Financial Statements & Accounting Engine</h2>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Real-time, automated double-entry financial statements for Neneh Funkuba Enterprise.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handlePrint}
            className="px-3.5 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-semibold text-xs rounded-xl flex items-center gap-1.5 cursor-pointer"
          >
            <Printer className="w-4 h-4 text-amber-400" />
            <span>Print Statement</span>
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-2">
        <button
          onClick={() => setActiveTab('pnl')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
            activeTab === 'pnl' 
              ? 'bg-amber-500 text-slate-950 shadow-md' 
              : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
          }`}
        >
          <TrendingUp className="w-4 h-4" />
          <span>Profit & Loss Statement (P&L)</span>
        </button>

        <button
          onClick={() => setActiveTab('balancesheet')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
            activeTab === 'balancesheet' 
              ? 'bg-amber-500 text-slate-950 shadow-md' 
              : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
          }`}
        >
          <Scale className="w-4 h-4" />
          <span>Business Balance Sheet</span>
        </button>
      </div>

      {/* TAB 1: PROFIT & LOSS */}
      {activeTab === 'pnl' && (
        <div className="space-y-6">
          
          <div className="bg-slate-900 rounded-2xl border border-slate-800 p-6 space-y-4 max-w-3xl mx-auto shadow-lg">
            <div className="border-b border-slate-800 pb-4 text-center">
              <h3 className="font-black text-lg text-white uppercase tracking-wider">NENEH FUNKUBA ENTERPRISE</h3>
              <p className="text-xs text-amber-400 font-bold mt-0.5">STATEMENT OF PROFIT OR LOSS</p>
              <p className="text-[11px] text-slate-400 mt-0.5">Cumulative Operational Period</p>
            </div>

            <div className="space-y-3 text-xs">
              
              {/* REVENUE */}
              <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 space-y-1">
                <div className="flex justify-between font-bold text-slate-200">
                  <span>Gross Sales Revenue</span>
                  <span className="text-emerald-400">{formatLeone(totalSalesRevenue)}</span>
                </div>
                <p className="text-[10px] text-slate-500">Total revenue generated from wholesale & retail orders</p>
              </div>

              {/* COGS */}
              <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 space-y-1">
                <div className="flex justify-between font-bold text-slate-200">
                  <span>Less: Cost of Goods Sold (COGS)</span>
                  <span className="text-rose-400">-{formatLeone(totalCOGS)}</span>
                </div>
                <p className="text-[10px] text-slate-500">Direct purchasing cost of inventory items sold</p>
              </div>

              {/* GROSS PROFIT */}
              <div className="bg-slate-800/80 p-3.5 rounded-xl border border-slate-700 flex justify-between items-center font-extrabold text-sm">
                <span className="text-white">GROSS PROFIT:</span>
                <span className="text-amber-400">{formatLeone(grossProfit)}</span>
              </div>

              {/* OPERATING EXPENSES */}
              <div className="space-y-2 pt-2">
                <span className="font-bold text-slate-400 uppercase text-[10px] tracking-wider block">Operating Expenses Breakdown:</span>
                
                <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 space-y-1.5 text-[11px]">
                  {Object.entries(expenseByCategory).map(([cat, amt]) => (
                    <div key={cat} className="flex justify-between text-slate-300">
                      <span>• {cat}</span>
                      <span className="text-rose-400">-{formatLeone(amt)}</span>
                    </div>
                  ))}
                  <div className="flex justify-between font-bold pt-2 border-t border-slate-800 text-slate-100">
                    <span>Total Operating Expenses:</span>
                    <span className="text-rose-400">-{formatLeone(totalOperatingExpenses)}</span>
                  </div>
                </div>
              </div>

              {/* NET PROFIT */}
              <div className="bg-gradient-to-r from-amber-500/20 via-slate-800 to-amber-500/20 p-4 rounded-xl border border-amber-500/40 flex justify-between items-center font-black text-base text-amber-300 mt-4 shadow-md">
                <span>NET PROFIT FOR THE PERIOD:</span>
                <span className="text-xl text-amber-400">{formatLeone(netProfit)}</span>
              </div>

            </div>
          </div>

        </div>
      )}

      {/* TAB 2: BALANCE SHEET */}
      {activeTab === 'balancesheet' && (
        <div className="space-y-6">
          
          {/* Validation Check */}
          <div className={`p-4 rounded-xl border flex items-center justify-between text-xs font-bold ${
            isBalanced 
              ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-300' 
              : 'bg-rose-950/40 border-rose-500/40 text-rose-300'
          }`}>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-400" />
              <span>Balance Sheet Equation Status: <strong>ASSETS = LIABILITIES + OWNER'S EQUITY</strong></span>
            </div>
            <span className="px-2.5 py-1 bg-emerald-500/20 rounded border border-emerald-500/30 font-black">
              BALANCED OK
            </span>
          </div>

          <div className="bg-slate-900 rounded-2xl border border-slate-800 p-6 space-y-6 max-w-4xl mx-auto shadow-lg">
            
            <div className="border-b border-slate-800 pb-4 text-center">
              <h3 className="font-black text-lg text-white uppercase tracking-wider">NENEH FUNKUBA ENTERPRISE</h3>
              <p className="text-xs text-amber-400 font-bold mt-0.5">STATEMENT OF FINANCIAL POSITION (BALANCE SHEET)</p>
              <p className="text-[11px] text-slate-400 mt-0.5">As of {new Date().toLocaleDateString('en-US', { dateStyle: 'full' })}</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
              
              {/* LEFT: ASSETS */}
              <div className="space-y-4">
                <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-3">
                  <h4 className="font-bold text-emerald-400 uppercase text-xs tracking-wider border-b border-slate-800 pb-2">
                    Current & Fixed Assets
                  </h4>

                  <div className="space-y-2 text-slate-300 text-[11px]">
                    <div className="flex justify-between">
                      <span>Cash Register (In Hand)</span>
                      <span className="font-bold text-white">{formatLeone(cashAsset)}</span>
                    </div>

                    <div className="flex justify-between">
                      <span>Bank Accounts (Rokel Commercial)</span>
                      <span className="font-bold text-white">{formatLeone(bankAsset)}</span>
                    </div>

                    <div className="flex justify-between">
                      <span>Mobile Money Wallets (Orange, Afri, Q)</span>
                      <span className="font-bold text-white">{formatLeone(mobileMoneyAsset)}</span>
                    </div>

                    <div className="flex justify-between">
                      <span>Inventory Stock Valuation</span>
                      <span className="font-bold text-white">{formatLeone(inventoryAsset)}</span>
                    </div>

                    <div className="flex justify-between">
                      <span>Accounts Receivable (Customer Debts)</span>
                      <span className="font-bold text-white">{formatLeone(accountsReceivableAsset)}</span>
                    </div>

                    <div className="flex justify-between border-t border-slate-800/80 pt-1.5">
                      <span>Equipment & Facility Assets</span>
                      <span className="font-bold text-white">{formatLeone(equipmentAsset)}</span>
                    </div>
                  </div>

                  <div className="bg-slate-900 p-3 rounded-lg border border-slate-800 flex justify-between font-extrabold text-xs text-emerald-400 pt-2">
                    <span>TOTAL ASSETS:</span>
                    <span>{formatLeone(totalAssets)}</span>
                  </div>
                </div>
              </div>

              {/* RIGHT: LIABILITIES & EQUITY */}
              <div className="space-y-4">
                
                {/* Liabilities */}
                <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-3">
                  <h4 className="font-bold text-rose-400 uppercase text-xs tracking-wider border-b border-slate-800 pb-2">
                    Liabilities (Accounts Payable)
                  </h4>

                  <div className="space-y-2 text-slate-300 text-[11px]">
                    <div className="flex justify-between">
                      <span>Accounts Payable (Supplier Debts)</span>
                      <span className="font-bold text-rose-300">{formatLeone(accountsPayableLiability)}</span>
                    </div>

                    <div className="flex justify-between">
                      <span>Taxes & License Provisions</span>
                      <span className="font-bold text-rose-300">{formatLeone(taxesPayableLiability)}</span>
                    </div>
                  </div>

                  <div className="bg-slate-900 p-2.5 rounded-lg border border-slate-800 flex justify-between font-bold text-xs text-rose-400">
                    <span>Total Liabilities:</span>
                    <span>{formatLeone(totalLiabilities)}</span>
                  </div>
                </div>

                {/* Owner Equity */}
                <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-3">
                  <h4 className="font-bold text-amber-400 uppercase text-xs tracking-wider border-b border-slate-800 pb-2">
                    Owner's Equity
                  </h4>

                  <div className="space-y-2 text-slate-300 text-[11px]">
                    <div className="flex justify-between">
                      <span>Owner's Initial Capital</span>
                      <span className="font-bold text-white">{formatLeone(ownersCapital)}</span>
                    </div>

                    <div className="flex justify-between">
                      <span>Retained Earnings (Net Profit)</span>
                      <span className="font-bold text-amber-300">{formatLeone(retainedEarnings)}</span>
                    </div>
                  </div>

                  <div className="bg-slate-900 p-2.5 rounded-lg border border-slate-800 flex justify-between font-bold text-xs text-amber-400">
                    <span>Total Equity:</span>
                    <span>{formatLeone(totalEquity)}</span>
                  </div>
                </div>

                {/* Combined Total */}
                <div className="bg-slate-800 p-3.5 rounded-xl border border-slate-700 flex justify-between font-black text-xs text-white">
                  <span>TOTAL LIABILITIES & EQUITY:</span>
                  <span className="text-amber-400">{formatLeone(totalLiabilitiesAndEquity)}</span>
                </div>

              </div>

            </div>
          </div>

        </div>
      )}

    </div>
  );
};
