import React, { createContext, useContext, useState, useCallback, useRef } from 'react';
import { Product } from '../types';

export interface ToastMessage {
  id: string;
  type: 'low_stock' | 'info' | 'success' | 'warning' | 'error';
  title: string;
  message: string;
  product?: Product;
  timestamp: string;
  autoClose?: boolean;
  duration?: number; // ms
  actionLabel?: string;
  onAction?: () => void;
}

interface ToastContextType {
  toasts: ToastMessage[];
  addToast: (toast: Omit<ToastMessage, 'id' | 'timestamp'>) => string;
  removeToast: (id: string) => void;
  clearAllToasts: () => void;
  checkAndNotifyLowStock: (products: Product[], isManagerOrAbove: boolean, onNavigateToInventory?: () => void) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  // Keep track of notified product stock snapshots to prevent spamming identical toasts
  const notifiedProductStockRef = useRef<Record<string, number>>({});

  const removeToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  const addToast = useCallback((toastData: Omit<ToastMessage, 'id' | 'timestamp'>) => {
    const id = `toast_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const newToast: ToastMessage = {
      ...toastData,
      id,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      autoClose: toastData.autoClose ?? true,
      duration: toastData.duration ?? (toastData.type === 'low_stock' ? 8000 : 5000),
    };

    setToasts(prev => [newToast, ...prev].slice(0, 5)); // Keep max 5 visible toasts

    // Auto dismiss
    if (newToast.autoClose) {
      setTimeout(() => {
        removeToast(id);
      }, newToast.duration);
    }

    return id;
  }, [removeToast]);

  const clearAllToasts = useCallback(() => {
    setToasts([]);
  }, []);

  // Web Audio alert beep for Manager low stock warnings
  const playAlertSound = useCallback(() => {
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(620, audioCtx.currentTime); // Low alert tone
      gain.gain.setValueAtTime(0.12, audioCtx.currentTime);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.25);
    } catch {
      // Audio fallback silent
    }
  }, []);

  const checkAndNotifyLowStock = useCallback((
    products: Product[], 
    isManagerOrAbove: boolean,
    onNavigateToInventory?: () => void
  ) => {
    if (!isManagerOrAbove) return;

    const lowStockItems = products.filter(p => p.currentStock <= p.minimumStockLevel);

    let triggeredSound = false;

    lowStockItems.forEach(prod => {
      const lastNotifiedStock = notifiedProductStockRef.current[prod.id];

      // Only notify if stock dropped or changed to low stock and hasn't been notified for current level
      if (lastNotifiedStock === undefined || lastNotifiedStock !== prod.currentStock) {
        notifiedProductStockRef.current[prod.id] = prod.currentStock;

        if (!triggeredSound) {
          playAlertSound();
          triggeredSound = true;
        }

        const isOutOfStock = prod.currentStock === 0;

        addToast({
          type: 'low_stock',
          title: isOutOfStock ? `OUT OF STOCK: ${prod.name}` : `LOW STOCK ALERT: ${prod.name}`,
          message: isOutOfStock 
            ? `Item "${prod.name}" is completely out of stock (0 ${prod.unit})! Immediate reorder required.`
            : `Stock level for "${prod.name}" reached minimum threshold (${prod.currentStock} / ${prod.minimumStockLevel} ${prod.unit} remaining).`,
          product: prod,
          actionLabel: 'Go to Inventory & Restock',
          onAction: onNavigateToInventory,
          autoClose: true,
          duration: 9000,
        });
      }
    });
  }, [addToast, playAlertSound]);

  return (
    <ToastContext.Provider value={{
      toasts,
      addToast,
      removeToast,
      clearAllToasts,
      checkAndNotifyLowStock
    }}>
      {children}
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};
