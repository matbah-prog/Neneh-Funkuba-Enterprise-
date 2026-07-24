import React from 'react';
import { useERP } from '../../context/ERPContext';
import { formatLeone } from '../../utils/formatters';
import { Users2, Award, ShoppingBag, TrendingUp, Phone } from 'lucide-react';

export const StaffView: React.FC = () => {
  const { users, sales } = useERP();

  // Calculate detailed stats per staff from live sales
  const staffMetrics = users.map(user => {
    const userSales = sales.filter(s => s.salespersonId === user.id && s.status === 'completed');
    const totalVal = userSales.reduce((acc, s) => acc + s.totalAmount, 0);
    const count = userSales.length;
    const avgSale = count > 0 ? totalVal / count : 0;
    const uniqueCustomers = new Set(userSales.map(s => s.customerId)).size;

    return {
      ...user,
      computedCount: count + user.salesCount,
      computedTotalVal: totalVal + user.totalSalesValue,
      avgSale,
      customersServed: uniqueCustomers
    };
  }).sort((a, b) => b.computedTotalVal - a.computedTotalVal);

  return (
    <div className="p-4 sm:p-6 space-y-6 max-w-7xl mx-auto">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-slate-900 p-5 rounded-2xl border border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <Users2 className="w-5 h-5 text-amber-400" />
            <h2 className="text-lg font-bold text-slate-100">Staff & Salesperson Performance Metrics</h2>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Monitor sales velocity, volume generated, average basket value, and customer retention per staff member.
          </p>
        </div>
      </div>

      {/* Staff Cards Leaderboard */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {staffMetrics.map((staff, idx) => (
          <div key={staff.id} className="bg-slate-900 rounded-2xl border border-slate-800 p-5 space-y-4 relative overflow-hidden">
            
            {idx === 0 && (
              <div className="absolute top-0 right-0 bg-amber-500 text-slate-950 px-3 py-1 text-[10px] font-black uppercase tracking-wider rounded-bl-xl flex items-center gap-1 shadow">
                <Award className="w-3.5 h-3.5" />
                #1 Top Performer
              </div>
            )}

            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center font-black text-amber-400 text-base">
                {staff.name.split(' ').map(n => n[0]).join('')}
              </div>

              <div>
                <h3 className="font-bold text-slate-100 text-sm">{staff.name}</h3>
                <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">
                  {staff.role.replace('_', ' ')}
                </span>
                <span className="text-[10px] text-slate-500 flex items-center gap-1 mt-0.5">
                  <Phone className="w-3 h-3" /> {staff.phone}
                </span>
                {staff.email && (
                  <span className="text-[10px] text-slate-400 font-medium block truncate max-w-[180px] mt-0.5">
                    ✉️ {staff.email}
                  </span>
                )}
              </div>
            </div>

            <div className="flex items-center justify-between px-3 py-1.5 bg-slate-950 rounded-xl border border-slate-800 text-[11px]">
              <span className="text-slate-400 font-semibold">Login PIN Code:</span>
              <span className="font-mono font-extrabold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">{staff.pin || 'None'}</span>
            </div>

            <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-800">
              <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800">
                <span className="text-[10px] text-slate-400 font-medium block">Total Revenue Generated</span>
                <span className="text-sm font-extrabold text-amber-400 mt-0.5 block">{formatLeone(staff.computedTotalVal)}</span>
              </div>

              <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800">
                <span className="text-[10px] text-slate-400 font-medium block">Completed Sales</span>
                <span className="text-sm font-bold text-emerald-400 mt-0.5 block">{staff.computedCount} orders</span>
              </div>

              <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800">
                <span className="text-[10px] text-slate-400 font-medium block">Avg Order Value</span>
                <span className="text-xs font-semibold text-slate-200 mt-0.5 block">{formatLeone(staff.avgSale)}</span>
              </div>

              <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800">
                <span className="text-[10px] text-slate-400 font-medium block">Unique Customers</span>
                <span className="text-xs font-semibold text-slate-200 mt-0.5 block">{staff.customersServed} Served</span>
              </div>
            </div>

          </div>
        ))}
      </div>

    </div>
  );
};
