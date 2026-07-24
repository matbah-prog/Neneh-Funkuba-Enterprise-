import React from 'react';
import { useERP } from '../context/ERPContext';
import { 
  LayoutDashboard, ShoppingCart, Package, Users, Truck, 
  Receipt, Wallet, CreditCard, PieChart, Landmark, Users2, 
  ShoppingBag, BarChart3, Settings, AlertTriangle, ChevronRight, FileSpreadsheet
} from 'lucide-react';

export type TabType = 
  | 'dashboard'
  | 'pos'
  | 'sales_ledger'
  | 'inventory'
  | 'customers'
  | 'suppliers'
  | 'expenses'
  | 'ledgers'
  | 'credit'
  | 'financials'
  | 'procurement'
  | 'staff'
  | 'reports'
  | 'settings';

interface SidebarProps {
  activeTab: TabType;
  setActiveTab: (tab: TabType) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab }) => {
  const { currentUser, products, sales, heldCarts } = useERP();

  // Calculate badge notifications
  const lowStockCount = products.filter(p => p.currentStock <= p.minimumStockLevel).length;

  interface NavItem {
    id: TabType;
    label: string;
    icon: React.ReactNode;
    allowedRoles: Array<'owner' | 'manager' | 'supervisor' | 'procurement_officer' | 'salesperson'>;
    badge?: number | string;
    badgeColor?: string;
  }

  const navItems: NavItem[] = [
    {
      id: 'dashboard',
      label: 'Executive Dashboard',
      icon: <LayoutDashboard className="w-4 h-4" />,
      allowedRoles: ['owner', 'manager', 'supervisor', 'procurement_officer']
    },
    {
      id: 'pos',
      label: 'Sales POS Screen',
      icon: <ShoppingCart className="w-4 h-4" />,
      allowedRoles: ['owner', 'manager', 'supervisor', 'salesperson'],
      badge: heldCarts.length > 0 ? `${heldCarts.length} Held` : undefined,
      badgeColor: 'bg-amber-500/20 text-amber-300 border-amber-500/30'
    },
    {
      id: 'sales_ledger',
      label: 'Sales Ledger',
      icon: <FileSpreadsheet className="w-4 h-4" />,
      allowedRoles: ['owner', 'manager', 'supervisor', 'salesperson']
    },
    {
      id: 'inventory',
      label: 'Inventory & Stock',
      icon: <Package className="w-4 h-4" />,
      allowedRoles: ['owner', 'manager', 'supervisor', 'procurement_officer', 'salesperson'],
      badge: lowStockCount > 0 ? `${lowStockCount} Low` : undefined,
      badgeColor: 'bg-rose-500/20 text-rose-300 border-rose-500/30'
    },
    {
      id: 'customers',
      label: 'Customer Records',
      icon: <Users className="w-4 h-4" />,
      allowedRoles: ['owner', 'manager', 'supervisor', 'salesperson']
    },
    {
      id: 'suppliers',
      label: 'Supplier Management',
      icon: <Truck className="w-4 h-4" />,
      allowedRoles: ['owner', 'manager', 'supervisor', 'procurement_officer']
    },
    {
      id: 'expenses',
      label: 'Expense Tracking',
      icon: <Receipt className="w-4 h-4" />,
      allowedRoles: ['owner', 'manager', 'supervisor']
    },
    {
      id: 'ledgers',
      label: 'Cash & Mobile Ledgers',
      icon: <Wallet className="w-4 h-4" />,
      allowedRoles: ['owner', 'manager', 'supervisor']
    },
    {
      id: 'credit',
      label: 'Customer Credit Ledger',
      icon: <CreditCard className="w-4 h-4" />,
      allowedRoles: ['owner', 'manager', 'supervisor']
    },
    {
      id: 'financials',
      label: 'P&L & Balance Sheet',
      icon: <Landmark className="w-4 h-4" />,
      allowedRoles: ['owner', 'manager']
    },
    {
      id: 'procurement',
      label: 'Procurement & Orders',
      icon: <ShoppingBag className="w-4 h-4" />,
      allowedRoles: ['owner', 'manager', 'procurement_officer']
    },
    {
      id: 'staff',
      label: 'Staff Performance',
      icon: <Users2 className="w-4 h-4" />,
      allowedRoles: ['owner', 'manager']
    },
    {
      id: 'reports',
      label: 'Reports & Exports',
      icon: <BarChart3 className="w-4 h-4" />,
      allowedRoles: ['owner', 'manager', 'supervisor', 'procurement_officer']
    },
    {
      id: 'settings',
      label: 'System Settings',
      icon: <Settings className="w-4 h-4" />,
      allowedRoles: ['owner']
    }
  ];

  const filteredNavItems = navItems.filter(item => item.allowedRoles.includes(currentUser.role));

  return (
    <aside className="w-64 bg-slate-900 border-r border-slate-800 flex flex-col shrink-0 min-h-[calc(100vh-4rem)]">
      
      <div className="p-3 border-b border-slate-800/80">
        <div className="bg-slate-800/60 rounded-lg p-2.5 flex items-center gap-2.5 border border-slate-700/50">
          <div className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse" />
          <div className="text-xs">
            <p className="text-slate-300 font-semibold leading-none">System Status: Live</p>
            <p className="text-[10px] text-slate-400 mt-1">Real-time ledger sync active</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 p-2 space-y-1 overflow-y-auto">
        <div className="px-2 py-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
          ERP Navigation
        </div>

        {filteredNavItems.map(item => {
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-medium transition-all ${
                isActive
                  ? 'bg-amber-500 text-slate-950 font-bold shadow-md shadow-amber-900/20'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/80'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <span className={isActive ? 'text-slate-950' : 'text-slate-400'}>
                  {item.icon}
                </span>
                <span>{item.label}</span>
              </div>

              {item.badge && (
                <span className={`px-1.5 py-0.5 text-[10px] rounded-full border font-bold ${item.badgeColor || 'bg-slate-800 text-slate-300'}`}>
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Role restriction callout */}
      <div className="p-3 border-t border-slate-800 text-[11px] text-slate-400 bg-slate-950/40">
        <div className="flex items-center gap-2 text-slate-300 font-semibold mb-1">
          <ChevronRight className="w-3.5 h-3.5 text-amber-400" />
          <span>Role View Mode</span>
        </div>
        <p className="leading-tight text-slate-400 text-[10px]">
          Showing tabs authorized for <span className="text-amber-400 font-semibold">{currentUser.role.toUpperCase()}</span>.
        </p>
      </div>
    </aside>
  );
};
