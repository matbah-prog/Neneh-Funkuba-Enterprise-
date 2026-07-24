export type UserRole = 'owner' | 'manager' | 'supervisor' | 'procurement_officer' | 'salesperson';

export interface UserAccount {
  id: string;
  name: string;
  username: string;
  role: UserRole;
  avatarUrl?: string;
  phone: string;
  salesCount: number;
  totalSalesValue: number;
  pin?: string;
  email?: string;
}

export type PaymentMethod = 'cash' | 'orange_money' | 'afrimoney' | 'qmoney' | 'bank' | 'credit';

export interface Product {
  id: string;
  name: string;
  category: string;
  buyingPrice: number;
  sellingPrice: number;
  currentStock: number;
  minimumStockLevel: number;
  reorderQuantity: number;
  unit: string;
  barcode?: string;
  imageUrl?: string;
}

export interface SaleItem {
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  buyingPrice: number;
  subtotal: number;
}

export interface Sale {
  id: string;
  invoiceNumber: string;
  customerId: string;
  customerName: string;
  salespersonId: string;
  salespersonName: string;
  items: SaleItem[];
  subtotal: number;
  discount: number;
  totalAmount: number;
  amountPaid: number;
  paymentMethod: PaymentMethod;
  balanceDue: number;
  date: string; // ISO string
  status: 'completed' | 'held' | 'refunded';
  notes?: string;
  isManualEntry?: boolean;
}

export interface Customer {
  id: string;
  name: string;
  phone: string;
  address: string;
  totalPurchases: number;
  creditBalance: number; // Positive means owes money to enterprise
  createdDate: string;
}

export interface CustomerPayment {
  id: string;
  customerId: string;
  customerName: string;
  amount: number;
  paymentMethod: PaymentMethod;
  date: string;
  notes?: string;
  receivedBy: string;
}

export interface Supplier {
  id: string;
  name: string;
  contactPerson: string;
  phone: string;
  email: string;
  address: string;
  productsSupplied: string[];
  outstandingBalance: number; // Owed to supplier
}

export type ExpenseCategory = 
  | 'Transport' 
  | 'Fuel' 
  | 'Electricity' 
  | 'Staff Salaries' 
  | 'Shop Rent' 
  | 'Repairs' 
  | 'Packaging' 
  | 'Taxes & Licenses'
  | 'Other Expenses';

export interface Expense {
  id: string;
  category: ExpenseCategory;
  amount: number;
  paidFrom: PaymentMethod;
  description: string;
  recordedBy: string;
  date: string;
  receiptImage?: string; // Base64 data URL or photo URL of physical receipt
}

export type LedgerType = 'cash' | 'orange_money' | 'afrimoney' | 'qmoney' | 'bank';

export interface LedgerEntry {
  id: string;
  date: string;
  ledgerType: LedgerType;
  type: 'debit' | 'credit'; // debit = cash in, credit = cash out
  amount: number;
  feeCharge?: number;
  referenceType: 'sale' | 'expense' | 'supplier_payment' | 'customer_repayment' | 'transfer' | 'adjustment' | 'purchase_order';
  referenceId?: string;
  description: string;
  performedBy: string;
}

export interface CreditRecord {
  id: string;
  customerId: string;
  customerName: string;
  saleId: string;
  invoiceNumber: string;
  creditGiven: number;
  amountPaid: number;
  remainingBalance: number;
  dateGiven: string;
  dueDate: string;
  status: 'active' | 'overdue' | 'settled';
}

export interface PurchaseOrderItem {
  productId: string;
  productName: string;
  quantity: number;
  unitBuyingPrice: number;
  subtotal: number;
}

export interface PurchaseOrder {
  id: string;
  poNumber: string;
  supplierId: string;
  supplierName: string;
  items: PurchaseOrderItem[];
  totalCost: number;
  paymentMethod: PaymentMethod;
  amountPaid: number;
  outstandingAmount: number;
  status: 'draft' | 'ordered' | 'received' | 'cancelled';
  orderDate: string;
  expectedDeliveryDate?: string;
  receivedDate?: string;
  notes?: string;
}

export interface ActivityLog {
  id: string;
  timestamp: string;
  userId: string;
  userName: string;
  userRole: UserRole;
  action: string;
  details: string;
  category: 'sale' | 'inventory' | 'expense' | 'ledger' | 'procurement' | 'customer' | 'supplier' | 'auth';
}

export interface HeldCart {
  id: string;
  customerName: string;
  customerId: string;
  items: SaleItem[];
  date: string;
  notes?: string;
}
