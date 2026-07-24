import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  UserAccount, Product, Customer, Supplier, Expense, LedgerEntry, 
  Sale, PurchaseOrder, ActivityLog, HeldCart, UserRole, PaymentMethod,
  SaleItem, ExpenseCategory, LedgerType 
} from '../types';
import { 
  INITIAL_USERS, INITIAL_PRODUCTS, INITIAL_CUSTOMERS, INITIAL_SUPPLIERS, 
  INITIAL_EXPENSES, INITIAL_LEDGERS, INITIAL_SALES, INITIAL_PURCHASE_ORDERS, 
  INITIAL_ACTIVITY_LOGS 
} from '../data/initialData';

interface ERPContextType {
  currentUser: UserAccount;
  setCurrentUserRole: (role: UserRole) => void;
  users: UserAccount[];
  products: Product[];
  customers: Customer[];
  suppliers: Supplier[];
  expenses: Expense[];
  ledgers: LedgerEntry[];
  sales: Sale[];
  purchaseOrders: PurchaseOrder[];
  activityLogs: ActivityLog[];
  heldCarts: HeldCart[];

  // Actions
  completeSale: (saleData: {
    customerId: string;
    items: SaleItem[];
    subtotal: number;
    discount: number;
    totalAmount: number;
    amountPaid: number;
    paymentMethod: PaymentMethod;
    notes?: string;
  }) => Sale;

  addManualSale: (manualSaleData: {
    invoiceNumber?: string;
    customerId?: string;
    customerName?: string;
    items: SaleItem[];
    subtotal: number;
    discount: number;
    totalAmount: number;
    amountPaid: number;
    paymentMethod: PaymentMethod;
    date?: string;
    notes?: string;
    updateInventory?: boolean;
    salespersonName?: string;
  }) => Sale;
  
  holdCart: (customerName: string, customerId: string, items: SaleItem[], notes?: string) => void;
  resumeCart: (cartId: string) => HeldCart | undefined;
  deleteHeldCart: (cartId: string) => void;

  addProduct: (product: Omit<Product, 'id'>) => void;
  updateProduct: (id: string, product: Partial<Product>) => void;
  restockProduct: (id: string, additionalStock: number, buyingPrice?: number) => void;

  addCustomer: (customer: Omit<Customer, 'id' | 'totalPurchases' | 'creditBalance' | 'createdDate'>) => Customer;
  addCustomerPayment: (customerId: string, amount: number, paymentMethod: PaymentMethod, notes?: string) => void;

  addSupplier: (supplier: Omit<Supplier, 'id' | 'outstandingBalance'>) => void;
  addSupplierPayment: (supplierId: string, amount: number, paymentMethod: PaymentMethod, notes?: string) => void;

  addExpense: (expense: Omit<Expense, 'id' | 'date' | 'recordedBy'>) => void;
  attachReceiptToExpense: (expenseId: string, receiptImage: string) => void;
  
  transferLedgerFunds: (fromType: LedgerType, toType: LedgerType, amount: number, description: string) => void;
  addManualLedgerEntry: (entry: Omit<LedgerEntry, 'id' | 'date' | 'performedBy'>) => void;

  addPurchaseOrder: (po: Omit<PurchaseOrder, 'id' | 'poNumber' | 'status' | 'orderDate'>) => void;
  receivePurchaseOrder: (poId: string) => void;

  logActivity: (action: string, details: string, category: ActivityLog['category']) => void;
  resetAllData: () => void;
}

const ERPContext = createContext<ERPContextType | undefined>(undefined);

const LOCAL_STORAGE_KEY = 'neneh_funkuba_erp_v1';

export const ERPProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [users, setUsers] = useState<UserAccount[]>(() => {
    const saved = localStorage.getItem(`${LOCAL_STORAGE_KEY}_users`);
    return saved ? JSON.parse(saved) : INITIAL_USERS;
  });

  const [currentUser, setCurrentUser] = useState<UserAccount>(() => {
    return users[0] || INITIAL_USERS[0];
  });

  const [products, setProducts] = useState<Product[]>(() => {
    const saved = localStorage.getItem(`${LOCAL_STORAGE_KEY}_products`);
    return saved ? JSON.parse(saved) : INITIAL_PRODUCTS;
  });

  const [customers, setCustomers] = useState<Customer[]>(() => {
    const saved = localStorage.getItem(`${LOCAL_STORAGE_KEY}_customers`);
    return saved ? JSON.parse(saved) : INITIAL_CUSTOMERS;
  });

  const [suppliers, setSuppliers] = useState<Supplier[]>(() => {
    const saved = localStorage.getItem(`${LOCAL_STORAGE_KEY}_suppliers`);
    return saved ? JSON.parse(saved) : INITIAL_SUPPLIERS;
  });

  const [expenses, setExpenses] = useState<Expense[]>(() => {
    const saved = localStorage.getItem(`${LOCAL_STORAGE_KEY}_expenses`);
    return saved ? JSON.parse(saved) : INITIAL_EXPENSES;
  });

  const [ledgers, setLedgers] = useState<LedgerEntry[]>(() => {
    const saved = localStorage.getItem(`${LOCAL_STORAGE_KEY}_ledgers`);
    return saved ? JSON.parse(saved) : INITIAL_LEDGERS;
  });

  const [sales, setSales] = useState<Sale[]>(() => {
    const saved = localStorage.getItem(`${LOCAL_STORAGE_KEY}_sales`);
    return saved ? JSON.parse(saved) : INITIAL_SALES;
  });

  const [purchaseOrders, setPurchaseOrders] = useState<PurchaseOrder[]>(() => {
    const saved = localStorage.getItem(`${LOCAL_STORAGE_KEY}_pos`);
    return saved ? JSON.parse(saved) : INITIAL_PURCHASE_ORDERS;
  });

  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>(() => {
    const saved = localStorage.getItem(`${LOCAL_STORAGE_KEY}_logs`);
    return saved ? JSON.parse(saved) : INITIAL_ACTIVITY_LOGS;
  });

  const [heldCarts, setHeldCarts] = useState<HeldCart[]>(() => {
    const saved = localStorage.getItem(`${LOCAL_STORAGE_KEY}_held_carts`);
    return saved ? JSON.parse(saved) : [];
  });

  // Save changes to LocalStorage
  useEffect(() => {
    localStorage.setItem(`${LOCAL_STORAGE_KEY}_users`, JSON.stringify(users));
  }, [users]);

  useEffect(() => {
    localStorage.setItem(`${LOCAL_STORAGE_KEY}_products`, JSON.stringify(products));
  }, [products]);

  useEffect(() => {
    localStorage.setItem(`${LOCAL_STORAGE_KEY}_customers`, JSON.stringify(customers));
  }, [customers]);

  useEffect(() => {
    localStorage.setItem(`${LOCAL_STORAGE_KEY}_suppliers`, JSON.stringify(suppliers));
  }, [suppliers]);

  useEffect(() => {
    localStorage.setItem(`${LOCAL_STORAGE_KEY}_expenses`, JSON.stringify(expenses));
  }, [expenses]);

  useEffect(() => {
    localStorage.setItem(`${LOCAL_STORAGE_KEY}_ledgers`, JSON.stringify(ledgers));
  }, [ledgers]);

  useEffect(() => {
    localStorage.setItem(`${LOCAL_STORAGE_KEY}_sales`, JSON.stringify(sales));
  }, [sales]);

  useEffect(() => {
    localStorage.setItem(`${LOCAL_STORAGE_KEY}_pos`, JSON.stringify(purchaseOrders));
  }, [purchaseOrders]);

  useEffect(() => {
    localStorage.setItem(`${LOCAL_STORAGE_KEY}_logs`, JSON.stringify(activityLogs));
  }, [activityLogs]);

  useEffect(() => {
    localStorage.setItem(`${LOCAL_STORAGE_KEY}_held_carts`, JSON.stringify(heldCarts));
  }, [heldCarts]);

  const setCurrentUserRole = (role: UserRole) => {
    const matched = users.find(u => u.role === role);
    if (matched) {
      setCurrentUser(matched);
      logActivity('Role Switched', `Switched active role to ${role.toUpperCase()} (${matched.name})`, 'auth');
    }
  };

  const logActivity = (action: string, details: string, category: ActivityLog['category']) => {
    const newLog: ActivityLog = {
      id: `act_${Date.now()}`,
      timestamp: new Date().toISOString(),
      userId: currentUser.id,
      userName: currentUser.name,
      userRole: currentUser.role,
      action,
      details,
      category
    };
    setActivityLogs(prev => [newLog, ...prev]);
  };

  const completeSale = (saleData: {
    customerId: string;
    items: SaleItem[];
    subtotal: number;
    discount: number;
    totalAmount: number;
    amountPaid: number;
    paymentMethod: PaymentMethod;
    notes?: string;
  }): Sale => {
    const customer = customers.find(c => c.id === saleData.customerId) || customers[0];
    const invoiceNum = `INV-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
    const balanceDue = Math.max(0, saleData.totalAmount - saleData.amountPaid);

    const newSale: Sale = {
      id: `sale_${Date.now()}`,
      invoiceNumber: invoiceNum,
      customerId: customer.id,
      customerName: customer.name,
      salespersonId: currentUser.id,
      salespersonName: currentUser.name,
      items: saleData.items,
      subtotal: saleData.subtotal,
      discount: saleData.discount,
      totalAmount: saleData.totalAmount,
      amountPaid: saleData.amountPaid,
      paymentMethod: saleData.paymentMethod,
      balanceDue,
      date: new Date().toISOString(),
      status: 'completed',
      notes: saleData.notes
    };

    // 1. Update Product Stocks
    setProducts(prev => prev.map(prod => {
      const item = saleData.items.find(i => i.productId === prod.id);
      if (item) {
        return {
          ...prod,
          currentStock: Math.max(0, prod.currentStock - item.quantity)
        };
      }
      return prod;
    }));

    // 2. Update Customer records & credit balance
    setCustomers(prev => prev.map(c => {
      if (c.id === customer.id) {
        return {
          ...c,
          totalPurchases: c.totalPurchases + saleData.totalAmount,
          creditBalance: c.creditBalance + balanceDue
        };
      }
      return c;
    }));

    // 3. Add Ledger Entry if money paid
    if (saleData.amountPaid > 0 && saleData.paymentMethod !== 'credit') {
      const ledgerTypeMap: Record<string, LedgerType> = {
        cash: 'cash',
        orange_money: 'orange_money',
        afrimoney: 'afrimoney',
        qmoney: 'qmoney',
        bank: 'bank'
      };
      const ledgerType = ledgerTypeMap[saleData.paymentMethod] || 'cash';

      const newLedgerEntry: LedgerEntry = {
        id: `led_${Date.now()}`,
        date: new Date().toISOString(),
        ledgerType,
        type: 'debit', // Cash coming in
        amount: saleData.amountPaid,
        referenceType: 'sale',
        referenceId: newSale.id,
        description: `Sale ${invoiceNum} payment (${customer.name})`,
        performedBy: currentUser.name
      };
      setLedgers(prev => [newLedgerEntry, ...prev]);
    }

    // 4. Update Salesperson metrics
    setUsers(prev => prev.map(u => {
      if (u.id === currentUser.id) {
        return {
          ...u,
          salesCount: u.salesCount + 1,
          totalSalesValue: u.totalSalesValue + saleData.totalAmount
        };
      }
      return u;
    }));

    // 5. Append Sale
    setSales(prev => [newSale, ...prev]);

    // 6. Log activity
    logActivity(
      'Sale Completed',
      `Processed ${invoiceNum} for ${customer.name} - Total: Le ${saleData.totalAmount.toLocaleString()} (${saleData.paymentMethod.toUpperCase()})`,
      'sale'
    );

    return newSale;
  };

  const addManualSale = (manualData: {
    invoiceNumber?: string;
    customerId?: string;
    customerName?: string;
    items: SaleItem[];
    subtotal: number;
    discount: number;
    totalAmount: number;
    amountPaid: number;
    paymentMethod: PaymentMethod;
    date?: string;
    notes?: string;
    updateInventory?: boolean;
    salespersonName?: string;
  }): Sale => {
    const customer = customers.find(c => c.id === manualData.customerId) || {
      id: manualData.customerId || 'cust_walkin',
      name: manualData.customerName || 'Walk-in Customer'
    };

    const invoiceNum = manualData.invoiceNumber?.trim() || `MAN-INV-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
    const balanceDue = Math.max(0, manualData.totalAmount - manualData.amountPaid);
    const saleDate = manualData.date || new Date().toISOString();
    const seller = manualData.salespersonName || currentUser.name;

    const newManualSale: Sale = {
      id: `sale_man_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      invoiceNumber: invoiceNum,
      customerId: customer.id,
      customerName: customer.name,
      salespersonId: currentUser.id,
      salespersonName: seller,
      items: manualData.items,
      subtotal: manualData.subtotal,
      discount: manualData.discount,
      totalAmount: manualData.totalAmount,
      amountPaid: manualData.amountPaid,
      paymentMethod: manualData.paymentMethod,
      balanceDue,
      date: saleDate,
      status: 'completed',
      notes: manualData.notes || 'Manual Sales Ledger Entry',
      isManualEntry: true,
    };

    // 1. Update Product Stocks if enabled
    if (manualData.updateInventory !== false) {
      setProducts(prev => prev.map(prod => {
        const item = manualData.items.find(i => i.productId === prod.id);
        if (item) {
          return {
            ...prod,
            currentStock: Math.max(0, prod.currentStock - item.quantity)
          };
        }
        return prod;
      }));
    }

    // 2. Update Customer records & credit balance
    setCustomers(prev => prev.map(c => {
      if (c.id === customer.id) {
        return {
          ...c,
          totalPurchases: c.totalPurchases + manualData.totalAmount,
          creditBalance: c.creditBalance + balanceDue
        };
      }
      return c;
    }));

    // 3. Add Ledger Entry if money paid
    if (manualData.amountPaid > 0 && manualData.paymentMethod !== 'credit') {
      const ledgerTypeMap: Record<string, LedgerType> = {
        cash: 'cash',
        orange_money: 'orange_money',
        afrimoney: 'afrimoney',
        qmoney: 'qmoney',
        bank: 'bank'
      };
      const ledgerType = ledgerTypeMap[manualData.paymentMethod] || 'cash';

      const newLedgerEntry: LedgerEntry = {
        id: `led_${Date.now()}`,
        date: saleDate,
        ledgerType,
        type: 'debit', // Money in
        amount: manualData.amountPaid,
        referenceType: 'sale',
        referenceId: newManualSale.id,
        description: `Manual Sale ${invoiceNum} (${customer.name})`,
        performedBy: seller
      };
      setLedgers(prev => [newLedgerEntry, ...prev]);
    }

    // 4. Append Sale
    setSales(prev => [newManualSale, ...prev]);

    // 5. Log activity
    logActivity(
      'Manual Sale Logged',
      `Recorded manual sale ${invoiceNum} for ${customer.name} - Total: Le ${manualData.totalAmount.toLocaleString()} (${manualData.paymentMethod.toUpperCase()})`,
      'sale'
    );

    return newManualSale;
  };

  const holdCart = (customerName: string, customerId: string, items: SaleItem[], notes?: string) => {
    const cart: HeldCart = {
      id: `cart_${Date.now()}`,
      customerName,
      customerId,
      items,
      date: new Date().toISOString(),
      notes
    };
    setHeldCarts(prev => [cart, ...prev]);
    logActivity('Cart On Hold', `Saved held cart for ${customerName} (${items.length} items)`, 'sale');
  };

  const resumeCart = (cartId: string) => {
    const cart = heldCarts.find(c => c.id === cartId);
    if (cart) {
      setHeldCarts(prev => prev.filter(c => c.id !== cartId));
    }
    return cart;
  };

  const deleteHeldCart = (cartId: string) => {
    setHeldCarts(prev => prev.filter(c => c.id !== cartId));
  };

  const addProduct = (product: Omit<Product, 'id'>) => {
    const newProd: Product = {
      ...product,
      id: `prod_${Date.now()}`
    };
    setProducts(prev => [newProd, ...prev]);
    logActivity('Product Added', `Added new product "${newProd.name}" to inventory`, 'inventory');
  };

  const updateProduct = (id: string, updatedFields: Partial<Product>) => {
    setProducts(prev => prev.map(p => p.id === id ? { ...p, ...updatedFields } : p));
    logActivity('Product Updated', `Updated details for product ID ${id}`, 'inventory');
  };

  const restockProduct = (id: string, additionalStock: number, buyingPrice?: number) => {
    setProducts(prev => prev.map(p => {
      if (p.id === id) {
        return {
          ...p,
          currentStock: p.currentStock + additionalStock,
          buyingPrice: buyingPrice !== undefined ? buyingPrice : p.buyingPrice
        };
      }
      return p;
    }));
    logActivity('Stock Restocked', `Restocked +${additionalStock} units for product ID ${id}`, 'inventory');
  };

  const addCustomer = (customerData: Omit<Customer, 'id' | 'totalPurchases' | 'creditBalance' | 'createdDate'>): Customer => {
    const newCust: Customer = {
      ...customerData,
      id: `cust_${Date.now()}`,
      totalPurchases: 0,
      creditBalance: 0,
      createdDate: new Date().toISOString().split('T')[0]
    };
    setCustomers(prev => [...prev, newCust]);
    logActivity('Customer Added', `Registered new customer "${newCust.name}"`, 'customer');
    return newCust;
  };

  const addCustomerPayment = (customerId: string, amount: number, paymentMethod: PaymentMethod, notes?: string) => {
    const cust = customers.find(c => c.id === customerId);
    if (!cust) return;

    // Reduce customer debt balance
    setCustomers(prev => prev.map(c => {
      if (c.id === customerId) {
        return {
          ...c,
          creditBalance: Math.max(0, c.creditBalance - amount)
        };
      }
      return c;
    }));

    // Add debit entry to ledger
    const ledgerTypeMap: Record<string, LedgerType> = {
      cash: 'cash',
      orange_money: 'orange_money',
      afrimoney: 'afrimoney',
      qmoney: 'qmoney',
      bank: 'bank'
    };
    const ledgerType = ledgerTypeMap[paymentMethod] || 'cash';

    const newLedger: LedgerEntry = {
      id: `led_${Date.now()}`,
      date: new Date().toISOString(),
      ledgerType,
      type: 'debit',
      amount,
      referenceType: 'customer_repayment',
      description: `Debt Repayment from ${cust.name} (${notes || 'No notes'})`,
      performedBy: currentUser.name
    };

    setLedgers(prev => [newLedger, ...prev]);
    logActivity('Customer Debt Paid', `Received Le ${amount.toLocaleString()} from ${cust.name} via ${paymentMethod.toUpperCase()}`, 'customer');
  };

  const addSupplier = (supplierData: Omit<Supplier, 'id' | 'outstandingBalance'>) => {
    const newSupp: Supplier = {
      ...supplierData,
      id: `supp_${Date.now()}`,
      outstandingBalance: 0
    };
    setSuppliers(prev => [...prev, newSupp]);
    logActivity('Supplier Added', `Added supplier "${newSupp.name}"`, 'supplier');
  };

  const addSupplierPayment = (supplierId: string, amount: number, paymentMethod: PaymentMethod, notes?: string) => {
    const supp = suppliers.find(s => s.id === supplierId);
    if (!supp) return;

    setSuppliers(prev => prev.map(s => {
      if (s.id === supplierId) {
        return {
          ...s,
          outstandingBalance: Math.max(0, s.outstandingBalance - amount)
        };
      }
      return s;
    }));

    const ledgerTypeMap: Record<string, LedgerType> = {
      cash: 'cash',
      orange_money: 'orange_money',
      afrimoney: 'afrimoney',
      qmoney: 'qmoney',
      bank: 'bank'
    };
    const ledgerType = ledgerTypeMap[paymentMethod] || 'cash';

    const newLedger: LedgerEntry = {
      id: `led_${Date.now()}`,
      date: new Date().toISOString(),
      ledgerType,
      type: 'credit', // outflow
      amount,
      referenceType: 'supplier_payment',
      description: `Payment to supplier ${supp.name} (${notes || ''})`,
      performedBy: currentUser.name
    };

    setLedgers(prev => [newLedger, ...prev]);
    logActivity('Supplier Payment', `Paid Le ${amount.toLocaleString()} to supplier ${supp.name}`, 'supplier');
  };

  const addExpense = (exp: Omit<Expense, 'id' | 'date' | 'recordedBy'>) => {
    const newExp: Expense = {
      ...exp,
      id: `exp_${Date.now()}`,
      date: new Date().toISOString(),
      recordedBy: currentUser.name
    };

    setExpenses(prev => [newExp, ...prev]);

    // Record credit outflow in ledger
    const ledgerTypeMap: Record<string, LedgerType> = {
      cash: 'cash',
      orange_money: 'orange_money',
      afrimoney: 'afrimoney',
      qmoney: 'qmoney',
      bank: 'bank'
    };
    const ledgerType = ledgerTypeMap[exp.paidFrom] || 'cash';

    const newLedger: LedgerEntry = {
      id: `led_${Date.now()}`,
      date: new Date().toISOString(),
      ledgerType,
      type: 'credit',
      amount: exp.amount,
      referenceType: 'expense',
      referenceId: newExp.id,
      description: `Expense (${exp.category}): ${exp.description}`,
      performedBy: currentUser.name
    };

    setLedgers(prev => [newLedger, ...prev]);
    logActivity('Expense Recorded', `Recorded expense Le ${exp.amount.toLocaleString()} for ${exp.category}`, 'expense');
  };

  const attachReceiptToExpense = (expenseId: string, receiptImage: string) => {
    setExpenses(prev => prev.map(e => e.id === expenseId ? { ...e, receiptImage } : e));
    logActivity('Receipt Attached', `Attached physical receipt photo to expense ID ${expenseId}`, 'expense');
  };

  const transferLedgerFunds = (fromType: LedgerType, toType: LedgerType, amount: number, description: string) => {
    const timestamp = new Date().toISOString();
    const outEntry: LedgerEntry = {
      id: `led_${Date.now()}_out`,
      date: timestamp,
      ledgerType: fromType,
      type: 'credit', // Outflow
      amount,
      referenceType: 'transfer',
      description: `Transfer OUT to ${toType.toUpperCase()}: ${description}`,
      performedBy: currentUser.name
    };

    const inEntry: LedgerEntry = {
      id: `led_${Date.now()}_in`,
      date: timestamp,
      ledgerType: toType,
      type: 'debit', // Inflow
      amount,
      referenceType: 'transfer',
      description: `Transfer IN from ${fromType.toUpperCase()}: ${description}`,
      performedBy: currentUser.name
    };

    setLedgers(prev => [outEntry, inEntry, ...prev]);
    logActivity('Fund Transfer', `Transferred Le ${amount.toLocaleString()} from ${fromType.toUpperCase()} to ${toType.toUpperCase()}`, 'ledger');
  };

  const addManualLedgerEntry = (entry: Omit<LedgerEntry, 'id' | 'date' | 'performedBy'>) => {
    const newEntry: LedgerEntry = {
      ...entry,
      id: `led_${Date.now()}`,
      date: new Date().toISOString(),
      performedBy: currentUser.name
    };
    setLedgers(prev => [newEntry, ...prev]);
    logActivity('Ledger Adjustment', `${entry.type.toUpperCase()} Le ${entry.amount.toLocaleString()} on ${entry.ledgerType.toUpperCase()}`, 'ledger');
  };

  const addPurchaseOrder = (poData: Omit<PurchaseOrder, 'id' | 'poNumber' | 'status' | 'orderDate'>) => {
    const supp = suppliers.find(s => s.id === poData.supplierId);
    const poNumber = `PO-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;

    const newPO: PurchaseOrder = {
      ...poData,
      id: `po_${Date.now()}`,
      poNumber,
      supplierName: supp ? supp.name : 'Unknown Supplier',
      status: 'ordered',
      orderDate: new Date().toISOString()
    };

    if (poData.outstandingAmount > 0 && supp) {
      setSuppliers(prev => prev.map(s => s.id === supp.id ? { ...s, outstandingBalance: s.outstandingBalance + poData.outstandingAmount } : s));
    }

    if (poData.amountPaid > 0) {
      const ledgerTypeMap: Record<string, LedgerType> = {
        cash: 'cash',
        orange_money: 'orange_money',
        afrimoney: 'afrimoney',
        qmoney: 'qmoney',
        bank: 'bank'
      };
      const ledgerType = ledgerTypeMap[poData.paymentMethod] || 'bank';

      const newLedger: LedgerEntry = {
        id: `led_${Date.now()}`,
        date: new Date().toISOString(),
        ledgerType,
        type: 'credit',
        amount: poData.amountPaid,
        referenceType: 'purchase_order',
        referenceId: newPO.id,
        description: `Purchase Order Payment ${poNumber} to ${supp?.name || ''}`,
        performedBy: currentUser.name
      };
      setLedgers(prev => [newLedger, ...prev]);
    }

    setPurchaseOrders(prev => [newPO, ...prev]);
    logActivity('Purchase Order Created', `Created ${poNumber} for ${supp?.name || ''} - Total: Le ${poData.totalCost.toLocaleString()}`, 'procurement');
  };

  const receivePurchaseOrder = (poId: string) => {
    const po = purchaseOrders.find(p => p.id === poId);
    if (!po || po.status === 'received') return;

    // Automatically increase stock for each item
    setProducts(prev => prev.map(prod => {
      const poItem = po.items.find(i => i.productId === prod.id);
      if (poItem) {
        return {
          ...prod,
          currentStock: prod.currentStock + poItem.quantity,
          buyingPrice: poItem.unitBuyingPrice
        };
      }
      return prod;
    }));

    // Update PO status
    setPurchaseOrders(prev => prev.map(p => p.id === poId ? { ...p, status: 'received', receivedDate: new Date().toISOString() } : p));
    logActivity('Goods Received', `Received goods for PO ${po.poNumber}. Stock levels updated.`, 'procurement');
  };

  const resetAllData = () => {
    setUsers(INITIAL_USERS);
    setCurrentUser(INITIAL_USERS[0]);
    setProducts(INITIAL_PRODUCTS);
    setCustomers(INITIAL_CUSTOMERS);
    setSuppliers(INITIAL_SUPPLIERS);
    setExpenses(INITIAL_EXPENSES);
    setLedgers(INITIAL_LEDGERS);
    setSales(INITIAL_SALES);
    setPurchaseOrders(INITIAL_PURCHASE_ORDERS);
    setActivityLogs(INITIAL_ACTIVITY_LOGS);
    setHeldCarts([]);
    localStorage.clear();
    logActivity('System Reset', 'Reset all ERP state to default seed data', 'auth');
  };

  return (
    <ERPContext.Provider value={{
      currentUser,
      setCurrentUserRole,
      users,
      products,
      customers,
      suppliers,
      expenses,
      ledgers,
      sales,
      purchaseOrders,
      activityLogs,
      heldCarts,
      completeSale,
      addManualSale,
      holdCart,
      resumeCart,
      deleteHeldCart,
      addProduct,
      updateProduct,
      restockProduct,
      addCustomer,
      addCustomerPayment,
      addSupplier,
      addSupplierPayment,
      addExpense,
      attachReceiptToExpense,
      transferLedgerFunds,
      addManualLedgerEntry,
      addPurchaseOrder,
      receivePurchaseOrder,
      logActivity,
      resetAllData
    }}>
      {children}
    </ERPContext.Provider>
  );
};

export const useERP = () => {
  const context = useContext(ERPContext);
  if (!context) {
    throw new Error('useERP must be used within an ERPProvider');
  }
  return context;
};
