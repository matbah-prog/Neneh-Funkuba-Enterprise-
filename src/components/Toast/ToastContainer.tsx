import React from 'react';
import { useToast, ToastMessage } from '../../context/ToastContext';
import { 
  AlertTriangle, 
  AlertCircle, 
  CheckCircle2, 
  Info, 
  X, 
  Package, 
  ArrowRight, 
  ShieldAlert,
  BellRing
} from 'lucide-react';
import { formatLeone } from '../../utils/formatters';

interface ToastContainerProps {
  onNavigateTab?: (tab: string) => void;
}

export const ToastContainer: React.FC<ToastContainerProps> = ({ onNavigateTab }) => {
  const { toasts, removeToast, clearAllToasts } = useToast();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-5 right-4 sm:right-6 z-50 flex flex-col gap-3 max-w-md w-full pointer-events-none">
      {/* Clear All Toasts Header if > 1 toasts */}
      {toasts.length > 1 && (
        <div className="self-end pointer-events-auto">
          <button
            onClick={clearAllToasts}
            className="px-2.5 py-1 bg-slate-900/90 hover:bg-slate-800 text-slate-400 hover:text-slate-200 text-[10px] font-bold rounded-lg border border-slate-700 shadow-md backdrop-blur transition flex items-center gap-1 cursor-pointer"
          >
            <X className="w-3 h-3" />
            <span>Dismiss All ({toasts.length})</span>
          </button>
        </div>
      )}

      {toasts.map((toast) => (
        <ToastCard 
          key={toast.id} 
          toast={toast} 
          onClose={() => removeToast(toast.id)} 
          onNavigateTab={onNavigateTab}
        />
      ))}
    </div>
  );
};

interface ToastCardProps {
  toast: ToastMessage;
  onClose: () => void;
  onNavigateTab?: (tab: string) => void;
}

const ToastCard: React.FC<ToastCardProps> = ({ toast, onClose, onNavigateTab }) => {
  const isLowStock = toast.type === 'low_stock';
  const isOutOfStock = toast.product && toast.product.currentStock === 0;

  const handleAction = () => {
    if (toast.onAction) {
      toast.onAction();
    } else if (onNavigateTab && isLowStock) {
      onNavigateTab('inventory');
    }
    onClose();
  };

  return (
    <div 
      className={`pointer-events-auto rounded-2xl p-4 shadow-2xl transition-all duration-300 transform translate-y-0 animate-fadeIn border backdrop-blur-md relative overflow-hidden ${
        isLowStock
          ? isOutOfStock
            ? 'bg-gradient-to-r from-slate-950 via-slate-900 to-rose-950/80 border-rose-500/80 text-slate-100 shadow-rose-950/50'
            : 'bg-gradient-to-r from-slate-950 via-slate-900 to-amber-950/80 border-amber-500/80 text-slate-100 shadow-amber-950/50'
          : toast.type === 'success'
          ? 'bg-slate-900/95 border-emerald-500/60 text-slate-100'
          : toast.type === 'error'
          ? 'bg-slate-900/95 border-rose-500/60 text-slate-100'
          : 'bg-slate-900/95 border-blue-500/60 text-slate-100'
      }`}
    >
      {/* Top Warning Glow Line for Low Stock */}
      {isLowStock && (
        <div className={`absolute top-0 left-0 right-0 h-1 ${isOutOfStock ? 'bg-rose-500 animate-pulse' : 'bg-amber-500'}`} />
      )}

      <div className="flex items-start gap-3">
        {/* Icon */}
        <div className={`p-2.5 rounded-xl shrink-0 mt-0.5 border ${
          isLowStock
            ? isOutOfStock
              ? 'bg-rose-500/20 text-rose-400 border-rose-500/30'
              : 'bg-amber-500/20 text-amber-400 border-amber-500/30'
            : toast.type === 'success'
            ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
            : toast.type === 'error'
            ? 'bg-rose-500/20 text-rose-400 border-rose-500/30'
            : 'bg-blue-500/20 text-blue-400 border-blue-500/30'
        }`}>
          {isLowStock ? (
            isOutOfStock ? <ShieldAlert className="w-5 h-5 animate-bounce" /> : <AlertTriangle className="w-5 h-5" />
          ) : toast.type === 'success' ? (
            <CheckCircle2 className="w-5 h-5" />
          ) : toast.type === 'error' ? (
            <AlertCircle className="w-5 h-5" />
          ) : (
            <Info className="w-5 h-5" />
          )}
        </div>

        {/* Content */}
        <div className="flex-1 space-y-1.5 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-1.5 flex-wrap">
              {isLowStock && (
                <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-full border tracking-wider ${
                  isOutOfStock
                    ? 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                    : 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                }`}>
                  Manager Alert
                </span>
              )}
              <h4 className="text-xs font-black text-white truncate">{toast.title}</h4>
            </div>

            <div className="flex items-center gap-1 shrink-0">
              <span className="text-[10px] text-slate-400">{toast.timestamp}</span>
              <button
                onClick={onClose}
                className="p-1 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          <p className="text-xs text-slate-300 leading-relaxed">{toast.message}</p>

          {/* Low Stock Product Metrics Pill */}
          {toast.product && (
            <div className="bg-slate-950/90 rounded-xl p-2.5 border border-slate-800 flex items-center justify-between text-xs mt-2">
              <div className="flex items-center gap-2">
                <Package className="w-4 h-4 text-amber-400 shrink-0" />
                <div>
                  <span className="font-bold text-slate-100 block truncate max-w-[180px]">{toast.product.name}</span>
                  <span className="text-[10px] text-slate-400">Unit Price: {formatLeone(toast.product.sellingPrice)}</span>
                </div>
              </div>

              <div className="text-right">
                <span className={`text-xs font-black block ${isOutOfStock ? 'text-rose-400' : 'text-amber-400'}`}>
                  {toast.product.currentStock} {toast.product.unit}
                </span>
                <span className="text-[9px] text-slate-400">Min: {toast.product.minimumStockLevel} {toast.product.unit}</span>
              </div>
            </div>
          )}

          {/* Action Button */}
          {(toast.actionLabel || isLowStock) && (
            <div className="pt-1.5 flex justify-end">
              <button
                onClick={handleAction}
                className={`px-3 py-1.5 text-xs font-bold rounded-xl transition flex items-center gap-1.5 cursor-pointer shadow-md ${
                  isOutOfStock
                    ? 'bg-rose-600 hover:bg-rose-500 text-white'
                    : 'bg-amber-500 hover:bg-amber-400 text-slate-950'
                }`}
              >
                <span>{toast.actionLabel || 'Restock in Inventory'}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
