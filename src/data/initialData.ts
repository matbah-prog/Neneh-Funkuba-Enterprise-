import { Product, Customer, Supplier, Expense, LedgerEntry, UserAccount, Sale, PurchaseOrder, ActivityLog } from '../types';

export const INITIAL_USERS: UserAccount[] = [
  {
    id: 'usr_owner',
    name: 'Neneh Funkuba',
    username: 'neneh.owner',
    email: 'matbah19@gmail.com',
    role: 'owner',
    phone: '+232 76 112 345',
    salesCount: 142,
    totalSalesValue: 185000000,
    pin: '0000'
  },
  {
    id: 'usr_manager',
    name: 'Mr. Ibrahim',
    username: 'ibrahim.mgr',
    email: 'Ikoroma864@gmail.com',
    role: 'manager',
    phone: '+232 78 443 210',
    salesCount: 230,
    totalSalesValue: 245000000,
    pin: '1002'
  },
  {
    id: 'usr_procurement',
    name: 'Alhassana Bah',
    username: 'alhassana.proc',
    email: 'bahalha04@gmail.com',
    role: 'procurement_officer',
    phone: '+232 88 554 321',
    salesCount: 12,
    totalSalesValue: 15000000,
    pin: '1001'
  },
  {
    id: 'usr_sales1',
    name: 'Mary',
    username: 'mary.sales1',
    email: 'maryjay117741@gmail.com',
    role: 'salesperson',
    phone: '+232 30 998 765',
    salesCount: 310,
    totalSalesValue: 312000000,
    pin: '1003'
  },
  {
    id: 'usr_sales2',
    name: 'Haja Mansaray',
    username: 'haja.sales2',
    email: 'Mansarayhaja8890@gmail.com',
    role: 'salesperson',
    phone: '+232 31 223 344',
    salesCount: 280,
    totalSalesValue: 289000000,
    pin: '1004'
  }
];

export const INITIAL_PRODUCTS: Product[] = [
  {
    id: 'prod_1',
    name: 'Bella Parboiled Rice 50kg',
    category: 'Grains & Rice',
    buyingPrice: 340000,
    sellingPrice: 400000,
    currentStock: 145,
    minimumStockLevel: 30,
    reorderQuantity: 100,
    unit: 'Bag (50kg)',
    barcode: '600123456701'
  },
  {
    id: 'prod_2',
    name: 'Pioneer Portland Cement 50kg',
    category: 'Building Materials',
    buyingPrice: 140000,
    sellingPrice: 165000,
    currentStock: 220,
    minimumStockLevel: 50,
    reorderQuantity: 200,
    unit: 'Bag (50kg)',
    barcode: '600123456702'
  },
  {
    id: 'prod_3',
    name: 'Refined Vegetable Cooking Oil 5L',
    category: 'Cooking Oils',
    buyingPrice: 185000,
    sellingPrice: 220000,
    currentStock: 18, // Low stock!
    minimumStockLevel: 25,
    reorderQuantity: 60,
    unit: 'Gallon (5L)',
    barcode: '600123456703'
  },
  {
    id: 'prod_4',
    name: 'Granulated Sugar 50kg',
    category: 'Provisions',
    buyingPrice: 650000,
    sellingPrice: 750000,
    currentStock: 12, // Low stock
    minimumStockLevel: 15,
    reorderQuantity: 30,
    unit: 'Bag (50kg)',
    barcode: '600123456704'
  },
  {
    id: 'prod_5',
    name: 'Wheat Flour Super White 50kg',
    category: 'Provisions',
    buyingPrice: 520000,
    sellingPrice: 610000,
    currentStock: 42,
    minimumStockLevel: 20,
    reorderQuantity: 50,
    unit: 'Bag (50kg)',
    barcode: '600123456705'
  },
  {
    id: 'prod_6',
    name: 'Vimto Canned Drink (24 x 330ml)',
    category: 'Beverages',
    buyingPrice: 190000,
    sellingPrice: 230000,
    currentStock: 85,
    minimumStockLevel: 20,
    reorderQuantity: 50,
    unit: 'Carton (24s)',
    barcode: '600123456706'
  },
  {
    id: 'prod_7',
    name: 'Peak Powdered Milk Tin 900g',
    category: 'Provisions',
    buyingPrice: 110000,
    sellingPrice: 135000,
    currentStock: 60,
    minimumStockLevel: 15,
    reorderQuantity: 40,
    unit: 'Tin',
    barcode: '600123456707'
  },
  {
    id: 'prod_8',
    name: 'Deformed Steel Rebar 12mm x 12m',
    category: 'Building Materials',
    buyingPrice: 180000,
    sellingPrice: 215000,
    currentStock: 350,
    minimumStockLevel: 100,
    reorderQuantity: 300,
    unit: 'Piece',
    barcode: '600123456708'
  },
  {
    id: 'prod_9',
    name: 'Lipton Yellow Label Tea (100 bags x 12)',
    category: 'Beverages',
    buyingPrice: 280000,
    sellingPrice: 340000,
    currentStock: 8, // Very low stock
    minimumStockLevel: 12,
    reorderQuantity: 25,
    unit: 'Carton',
    barcode: '600123456709'
  }
];

export const INITIAL_CUSTOMERS: Customer[] = [
  {
    id: 'cust_walkin',
    name: 'Walk-in Retail Customer',
    phone: 'N/A',
    address: 'Freetown Store Counter',
    totalPurchases: 45000000,
    creditBalance: 0,
    createdDate: '2026-01-01'
  },
  {
    id: 'cust_1',
    name: 'Alhassan Wholesale Traders',
    phone: '+232 76 881 223',
    address: 'Kissy Road Market, Freetown',
    totalPurchases: 185000000,
    creditBalance: 2450000, // Outstanding credit
    createdDate: '2026-02-10'
  },
  {
    id: 'cust_2',
    name: 'Kono Construction & Hardware Supply',
    phone: '+232 88 440 912',
    address: 'Koidu Town, Kono District',
    totalPurchases: 320000000,
    creditBalance: 5800000, // Credit balance
    createdDate: '2026-01-15'
  },
  {
    id: 'cust_3',
    name: 'Madam Mariama Fullah Grocery',
    phone: '+232 77 334 511',
    address: 'Lumley Beach Road, Freetown',
    totalPurchases: 94000000,
    creditBalance: 1100000,
    createdDate: '2026-03-01'
  },
  {
    id: 'cust_4',
    name: 'Bo Central Bakery & Catering',
    phone: '+232 78 901 234',
    address: 'Bo City Center',
    totalPurchases: 140000000,
    creditBalance: 0,
    createdDate: '2026-02-28'
  }
];

export const INITIAL_SUPPLIERS: Supplier[] = [
  {
    id: 'supp_1',
    name: 'Sierra Rice & Commodity Importers Ltd',
    contactPerson: 'Mr. David Cole',
    phone: '+232 76 500 111',
    email: 'orders@sierrarice.sl',
    address: 'Queen Elizabeth II Quay, Cline Town, Freetown',
    productsSupplied: ['Bella Parboiled Rice 50kg', 'Granulated Sugar 50kg', 'Wheat Flour Super White 50kg'],
    outstandingBalance: 12500000 // Money owed to supplier
  },
  {
    id: 'supp_2',
    name: 'Sierra Leone Cement Corporation (LEOCEM)',
    contactPerson: 'Fatmata Turay',
    phone: '+232 78 222 900',
    email: 'sales@leocem.sl',
    address: 'Cline Town Industrial Zone, Freetown',
    productsSupplied: ['Pioneer Portland Cement 50kg'],
    outstandingBalance: 8200000
  },
  {
    id: 'supp_3',
    name: 'Pee Cee Enterprise Wholesale',
    contactPerson: 'Vikram Patel',
    phone: '+232 77 400 333',
    email: 'wholesale@peecee.sl',
    address: 'Wilberforce Street, Freetown',
    productsSupplied: ['Refined Vegetable Cooking Oil 5L', 'Peak Powdered Milk Tin 900g', 'Vimto Canned Drink'],
    outstandingBalance: 0
  }
];

export const INITIAL_EXPENSES: Expense[] = [
  {
    id: 'exp_1',
    category: 'Transport',
    amount: 850000,
    paidFrom: 'cash',
    description: 'Offloading charge for 200 bags of Pioneer Cement at warehouse',
    recordedBy: 'Sorie Ibrahim Koroma',
    date: '2026-07-24T08:30:00'
  },
  {
    id: 'exp_2',
    category: 'Fuel',
    amount: 450000,
    paidFrom: 'orange_money',
    description: 'Diesel purchase for 50kVA standby generator (25 Liters)',
    recordedBy: 'Mohamed Bangura',
    date: '2026-07-24T09:15:00'
  },
  {
    id: 'exp_3',
    category: 'Shop Rent',
    amount: 15000000,
    paidFrom: 'bank',
    description: 'Monthly store facility lease payment (July 2026)',
    recordedBy: 'Neneh Funkuba',
    date: '2026-07-01T10:00:00'
  },
  {
    id: 'exp_4',
    category: 'Staff Salaries',
    amount: 12000000,
    paidFrom: 'bank',
    description: 'Mid-month staff advance payments',
    recordedBy: 'Neneh Funkuba',
    date: '2026-07-15T14:20:00'
  },
  {
    id: 'exp_5',
    category: 'Electricity',
    amount: 650000,
    paidFrom: 'orange_money',
    description: 'EDSA Prepaid meter top-up for shop cooling & lights',
    recordedBy: 'Aminata Mansaray',
    date: '2026-07-20T11:00:00'
  }
];

export const INITIAL_LEDGERS: LedgerEntry[] = [
  {
    id: 'led_1',
    date: '2026-07-24T08:00:00',
    ledgerType: 'cash',
    type: 'debit',
    amount: 18500000,
    referenceType: 'adjustment',
    description: 'Opening Cash Balance in Register',
    performedBy: 'Fatmata Sesay'
  },
  {
    id: 'led_2',
    date: '2026-07-24T08:00:00',
    ledgerType: 'orange_money',
    type: 'debit',
    amount: 34200000,
    referenceType: 'adjustment',
    description: 'Orange Money Till Starting Balance (+232 76 990 111)',
    performedBy: 'Sorie Ibrahim Koroma'
  },
  {
    id: 'led_3',
    date: '2026-07-24T08:00:00',
    ledgerType: 'afrimoney',
    type: 'debit',
    amount: 19800000,
    referenceType: 'adjustment',
    description: 'Afrimoney Merchant Account Balance (+232 77 123 999)',
    performedBy: 'Sorie Ibrahim Koroma'
  },
  {
    id: 'led_4',
    date: '2026-07-24T08:00:00',
    ledgerType: 'qmoney',
    type: 'debit',
    amount: 8500000,
    referenceType: 'adjustment',
    description: 'QMoney Merchant Line Balance (+232 30 555 888)',
    performedBy: 'Sorie Ibrahim Koroma'
  },
  {
    id: 'led_5',
    date: '2026-07-24T08:00:00',
    ledgerType: 'bank',
    type: 'debit',
    amount: 142000000,
    referenceType: 'adjustment',
    description: 'Rokel Commercial Bank Corporate Account Balance (#002001992)',
    performedBy: 'Neneh Funkuba'
  },
  {
    id: 'led_6',
    date: '2026-07-24T08:30:00',
    ledgerType: 'cash',
    type: 'credit',
    amount: 850000,
    referenceType: 'expense',
    referenceId: 'exp_1',
    description: 'Transport & Offloading expense paid in Cash',
    performedBy: 'Sorie Ibrahim Koroma'
  },
  {
    id: 'led_7',
    date: '2026-07-24T09:15:00',
    ledgerType: 'orange_money',
    type: 'credit',
    amount: 450000,
    feeCharge: 5000,
    referenceType: 'expense',
    referenceId: 'exp_2',
    description: 'Generator Fuel payment via Orange Money',
    performedBy: 'Mohamed Bangura'
  }
];

export const INITIAL_SALES: Sale[] = [
  {
    id: 'sale_101',
    invoiceNumber: 'INV-2026-0889',
    customerId: 'cust_1',
    customerName: 'Alhassan Wholesale Traders',
    salespersonId: 'usr_sales1',
    salespersonName: 'Fatmata Sesay',
    items: [
      {
        productId: 'prod_1',
        productName: 'Bella Parboiled Rice 50kg',
        quantity: 10,
        unitPrice: 400000,
        buyingPrice: 340000,
        subtotal: 4000000
      },
      {
        productId: 'prod_3',
        productName: 'Refined Vegetable Cooking Oil 5L',
        quantity: 5,
        unitPrice: 220000,
        buyingPrice: 185000,
        subtotal: 1100000
      }
    ],
    subtotal: 5100000,
    discount: 100000,
    totalAmount: 5000000,
    amountPaid: 3000000,
    paymentMethod: 'orange_money',
    balanceDue: 2000000, // Credit remaining
    date: '2026-07-24T09:45:00',
    status: 'completed',
    notes: 'Partial payment received via Orange Money. Remaining Le 2,000,000 added to credit ledger.'
  },
  {
    id: 'sale_102',
    invoiceNumber: 'INV-2026-0890',
    customerId: 'cust_walkin',
    customerName: 'Walk-in Retail Customer',
    salespersonId: 'usr_sales2',
    salespersonName: 'Alhaji Kamara',
    items: [
      {
        productId: 'prod_2',
        productName: 'Pioneer Portland Cement 50kg',
        quantity: 20,
        unitPrice: 165000,
        buyingPrice: 140000,
        subtotal: 3300000
      }
    ],
    subtotal: 3300000,
    discount: 0,
    totalAmount: 3300000,
    amountPaid: 3300000,
    paymentMethod: 'cash',
    balanceDue: 0,
    date: '2026-07-24T10:15:00',
    status: 'completed'
  },
  {
    id: 'sale_103',
    invoiceNumber: 'INV-2026-0891',
    customerId: 'cust_3',
    customerName: 'Madam Mariama Fullah Grocery',
    salespersonId: 'usr_sales1',
    salespersonName: 'Fatmata Sesay',
    items: [
      {
        productId: 'prod_4',
        productName: 'Granulated Sugar 50kg',
        quantity: 2,
        unitPrice: 750000,
        buyingPrice: 650000,
        subtotal: 1500000
      },
      {
        productId: 'prod_6',
        productName: 'Vimto Canned Drink (24 x 330ml)',
        quantity: 4,
        unitPrice: 230000,
        buyingPrice: 190000,
        subtotal: 920000
      }
    ],
    subtotal: 2420000,
    discount: 20000,
    totalAmount: 2400000,
    amountPaid: 2400000,
    paymentMethod: 'afrimoney',
    balanceDue: 0,
    date: '2026-07-24T11:00:00',
    status: 'completed'
  }
];

export const INITIAL_PURCHASE_ORDERS: PurchaseOrder[] = [
  {
    id: 'po_1',
    poNumber: 'PO-2026-0041',
    supplierId: 'supp_1',
    supplierName: 'Sierra Rice & Commodity Importers Ltd',
    items: [
      {
        productId: 'prod_1',
        productName: 'Bella Parboiled Rice 50kg',
        quantity: 100,
        unitBuyingPrice: 340000,
        subtotal: 34000000
      }
    ],
    totalCost: 34000000,
    paymentMethod: 'bank',
    amountPaid: 20000000,
    outstandingAmount: 14000000,
    status: 'ordered',
    orderDate: '2026-07-22T14:00:00',
    expectedDeliveryDate: '2026-07-26',
    notes: 'Urgent restock of Bella Rice'
  },
  {
    id: 'po_2',
    poNumber: 'PO-2026-0042',
    supplierId: 'supp_3',
    supplierName: 'Pee Cee Enterprise Wholesale',
    items: [
      {
        productId: 'prod_3',
        productName: 'Refined Vegetable Cooking Oil 5L',
        quantity: 50,
        unitBuyingPrice: 185000,
        subtotal: 9250000
      }
    ],
    totalCost: 9250000,
    paymentMethod: 'orange_money',
    amountPaid: 9250000,
    outstandingAmount: 0,
    status: 'received',
    orderDate: '2026-07-23T09:30:00',
    receivedDate: '2026-07-24T08:00:00',
    notes: 'Fully delivered and verified by Mohamed Bangura'
  }
];

export const INITIAL_ACTIVITY_LOGS: ActivityLog[] = [
  {
    id: 'act_1',
    timestamp: '2026-07-24T08:00:00',
    userId: 'usr_sales1',
    userName: 'Fatmata Sesay',
    userRole: 'salesperson',
    action: 'Register Opened',
    details: 'Opened morning sales register with Le 18,500,000 opening cash',
    category: 'ledger'
  },
  {
    id: 'act_2',
    timestamp: '2026-07-24T08:30:00',
    userId: 'usr_manager',
    userName: 'Sorie Ibrahim Koroma',
    userRole: 'manager',
    action: 'Expense Recorded',
    details: 'Recorded Le 850,000 transport fee for cement offloading',
    category: 'expense'
  },
  {
    id: 'act_3',
    timestamp: '2026-07-24T09:45:00',
    userId: 'usr_sales1',
    userName: 'Fatmata Sesay',
    userRole: 'salesperson',
    action: 'Sale Completed',
    details: 'Generated INV-2026-0889 for Alhassan Wholesale Traders (Total Le 5,000,000)',
    category: 'sale'
  },
  {
    id: 'act_4',
    timestamp: '2026-07-24T10:15:00',
    userId: 'usr_sales2',
    userName: 'Alhaji Kamara',
    userRole: 'salesperson',
    action: 'Sale Completed',
    details: 'Generated INV-2026-0890 for Walk-in Retail Customer (20 bags cement)',
    category: 'sale'
  }
];
