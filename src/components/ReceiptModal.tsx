import React, { useState } from 'react';
import { Sale } from '../types';
import { formatLeone, formatDate } from '../utils/formatters';
import { Printer, CheckCircle2, X, CloudUpload, ExternalLink } from 'lucide-react';
import { uploadFileToGoogleDrive } from '../utils/googleDrive';

interface ReceiptModalProps {
  sale: Sale;
  onClose: () => void;
}

export const ReceiptModal: React.FC<ReceiptModalProps> = ({ sale, onClose }) => {
  const [driveUploading, setDriveUploading] = useState(false);
  const [driveLink, setDriveLink] = useState<string | null>(null);
  const [driveError, setDriveError] = useState<string | null>(null);

  const handlePrint = () => {
    try {
      window.print();
    } catch (err) {
      console.warn('Native window.print error, attempting print iframe fallback:', err);
      const printFrame = document.createElement('iframe');
      printFrame.style.position = 'absolute';
      printFrame.style.top = '-9999px';
      printFrame.style.left = '-9999px';
      document.body.appendChild(printFrame);

      const frameDoc = printFrame.contentWindow?.document;
      if (frameDoc) {
        frameDoc.open();
        frameDoc.write(`
          <!DOCTYPE html>
          <html>
            <head>
              <title>Receipt - ${sale.invoiceNumber}</title>
              <style>
                body {
                  font-family: 'Courier New', Courier, monospace;
                  width: 80mm;
                  margin: 0 auto;
                  padding: 10px;
                  color: #000;
                  font-size: 12px;
                }
                .text-center { text-align: center; }
                .text-right { text-align: right; }
                .bold { font-weight: bold; }
                .divider { border-bottom: 1px dashed #000; margin: 8px 0; }
                .row { display: flex; justify-content: space-between; margin-bottom: 3px; }
                table { width: 100%; border-collapse: collapse; margin: 6px 0; }
                th, td { text-align: left; padding: 2px 0; font-size: 11px; }
                th { border-bottom: 1px solid #000; }
              </style>
            </head>
            <body>
              <div class="text-center">
                <h2 style="margin: 0; font-size: 16px;">NENEH FUNKUBA ENTERPRISE</h2>
                <div style="font-size: 10px;">Wholesale & Retail General Merchants</div>
                <div style="font-size: 10px;">Freetown, Sierra Leone • Tel: +232 76 112 345</div>
              </div>
              <div class="divider"></div>
              <div class="row"><span>Invoice #:</span><span class="bold">${sale.invoiceNumber}</span></div>
              <div class="row"><span>Date:</span><span>${formatDate(sale.date)}</span></div>
              <div class="row"><span>Cashier:</span><span>${sale.salespersonName}</span></div>
              <div class="row"><span>Customer:</span><span class="bold">${sale.customerName}</span></div>
              <div class="divider"></div>
              <table>
                <thead>
                  <tr>
                    <th>Item</th>
                    <th class="text-center">Qty</th>
                    <th class="text-right">Total</th>
                  </tr>
                </thead>
                <tbody>
                  ${sale.items.map(it => `
                    <tr>
                      <td>${it.productName}</td>
                      <td class="text-center">${it.quantity}</td>
                      <td class="text-right">${formatLeone(it.subtotal)}</td>
                    </tr>
                  `).join('')}
                </tbody>
              </table>
              <div class="divider"></div>
              <div class="row"><span>Subtotal:</span><span>${formatLeone(sale.subtotal)}</span></div>
              ${sale.discount > 0 ? `<div class="row"><span>Discount:</span><span>-${formatLeone(sale.discount)}</span></div>` : ''}
              <div class="row bold" style="font-size: 13px; margin-top: 4px;"><span>TOTAL PAID:</span><span>${formatLeone(sale.totalAmount)}</span></div>
              <div class="row" style="font-size: 10px; margin-top: 4px;"><span>Payment Channel:</span><span class="bold">${sale.paymentMethod.replace('_', ' ').toUpperCase()}</span></div>
              ${sale.paymentMethod !== 'credit' ? `
                <div class="row" style="font-size: 10px;"><span>Amount Handed:</span><span>${formatLeone(sale.amountPaid)}</span></div>
                <div class="row" style="font-size: 10px;"><span>Change Given:</span><span>${formatLeone(Math.max(0, sale.amountPaid - sale.totalAmount))}</span></div>
              ` : ''}
              ${sale.balanceDue > 0 ? `<div class="row bold" style="color: red;"><span>Outstanding Debt:</span><span>${formatLeone(sale.balanceDue)}</span></div>` : ''}
              <div class="divider"></div>
              <div class="text-center" style="font-size: 9px; margin-top: 8px;">
                <div>Goods sold in good condition are non-refundable.</div>
                <div class="bold" style="margin-top: 2px;">Thank you for trading with Neneh Funkuba Enterprise!</div>
              </div>
            </body>
          </html>
        `);
        frameDoc.close();
        printFrame.contentWindow?.focus();
        printFrame.contentWindow?.print();
        setTimeout(() => {
          if (document.body.contains(printFrame)) {
            document.body.removeChild(printFrame);
          }
        }, 1000);
      }
    }
  };

  const handleSaveToDrive = async () => {
    setDriveUploading(true);
    setDriveError(null);

    const receiptText = `
========================================
       NENEH FUNKUBA ENTERPRISE
  Wholesale & Retail General Merchants
  Freetown, Sierra Leone • Tel: +232 76 112 345
========================================
Invoice #: ${sale.invoiceNumber}
Date: ${formatDate(sale.date)}
Cashier: ${sale.salespersonName}
Customer: ${sale.customerName}
----------------------------------------
ITEMS:
${sale.items.map(it => `${it.productName} x${it.quantity} = ${formatLeone(it.subtotal)}`).join('\n')}
----------------------------------------
Subtotal: ${formatLeone(sale.subtotal)}
Discount: -${formatLeone(sale.discount)}
TOTAL PAID: ${formatLeone(sale.totalAmount)}
Payment Method: ${sale.paymentMethod.toUpperCase()}
Amount Handed: ${formatLeone(sale.amountPaid)}
Change: ${formatLeone(Math.max(0, sale.amountPaid - sale.totalAmount))}
${sale.balanceDue > 0 ? `Outstanding Debt: ${formatLeone(sale.balanceDue)}` : ''}
========================================
Thank you for trading with Neneh Funkuba Enterprise!
`.trim();

    const result = await uploadFileToGoogleDrive(
      `Receipt_${sale.invoiceNumber}.txt`,
      receiptText,
      'text/plain'
    );

    setDriveUploading(false);
    if (result.success && result.webViewLink) {
      setDriveLink(result.webViewLink);
    } else {
      setDriveError(result.error || 'Failed to save to Google Drive');
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl relative">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="text-center space-y-1">
          <div className="w-10 h-10 bg-amber-500/20 text-amber-400 rounded-xl flex items-center justify-center mx-auto mb-2">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <h3 className="font-extrabold text-white text-base">Transaction Completed</h3>
          <p className="text-xs text-slate-400">Official Sales Invoice & Receipt</p>
        </div>

        {/* Printable Thermal Receipt Card */}
        <div id="printable-receipt" className="bg-white text-slate-950 p-5 rounded-xl font-mono text-xs space-y-3 shadow-inner">
          
          <div className="text-center border-b border-dashed border-slate-300 pb-3">
            <h2 className="font-black text-sm uppercase tracking-wider">Neneh Funkuba Enterprise</h2>
            <p className="text-[10px] text-slate-600">Wholesale & Retail General Merchants</p>
            <p className="text-[10px] text-slate-600">Freetown, Sierra Leone • Tel: +232 76 112 345</p>
          </div>

          <div className="text-[10px] space-y-0.5 border-b border-dashed border-slate-300 pb-2">
            <div className="flex justify-between">
              <span>Invoice #:</span>
              <span className="font-bold">{sale.invoiceNumber}</span>
            </div>
            <div className="flex justify-between">
              <span>Date:</span>
              <span>{formatDate(sale.date)}</span>
            </div>
            <div className="flex justify-between">
              <span>Cashier:</span>
              <span>{sale.salespersonName}</span>
            </div>
            <div className="flex justify-between">
              <span>Customer:</span>
              <span className="font-bold">{sale.customerName}</span>
            </div>
          </div>

          {/* Items Table */}
          <div className="space-y-1.5 border-b border-dashed border-slate-300 pb-2">
            <div className="grid grid-cols-12 font-bold text-[10px] text-slate-700">
              <span className="col-span-6">Item</span>
              <span className="col-span-2 text-center">Qty</span>
              <span className="col-span-4 text-right">Total</span>
            </div>

            {sale.items.map((item, idx) => (
              <div key={idx} className="grid grid-cols-12 text-[10px]">
                <span className="col-span-6 truncate font-medium">{item.productName}</span>
                <span className="col-span-2 text-center">{item.quantity}</span>
                <span className="col-span-4 text-right">{formatLeone(item.subtotal)}</span>
              </div>
            ))}
          </div>

          {/* Totals */}
          <div className="space-y-1 text-[11px] pt-1">
            <div className="flex justify-between">
              <span>Subtotal:</span>
              <span>{formatLeone(sale.subtotal)}</span>
            </div>
            {sale.discount > 0 && (
              <div className="flex justify-between text-slate-600">
                <span>Discount:</span>
                <span>-{formatLeone(sale.discount)}</span>
              </div>
            )}
            <div className="flex justify-between font-black text-xs border-t border-slate-300 pt-1">
              <span>TOTAL PAID:</span>
              <span>{formatLeone(sale.totalAmount)}</span>
            </div>
            <div className="flex justify-between text-[10px] text-slate-600 pt-0.5">
              <span>Payment Channel:</span>
              <span className="uppercase font-bold">{sale.paymentMethod.replace('_', ' ')}</span>
            </div>
            {sale.paymentMethod !== 'credit' && (
              <>
                <div className="flex justify-between text-[10px] text-slate-600">
                  <span>Amount Handed:</span>
                  <span>{formatLeone(sale.amountPaid)}</span>
                </div>
                <div className="flex justify-between text-[10px] text-slate-600">
                  <span>Change Given:</span>
                  <span>{formatLeone(Math.max(0, sale.amountPaid - sale.totalAmount))}</span>
                </div>
              </>
            )}
            {sale.balanceDue > 0 && (
              <div className="flex justify-between text-[10px] text-red-600 font-bold pt-1 border-t border-slate-200">
                <span>Outstanding Credit Debt:</span>
                <span>{formatLeone(sale.balanceDue)}</span>
              </div>
            )}
          </div>

          <div className="text-center pt-2 border-t border-dashed border-slate-300 text-[9px] text-slate-500">
            <p>Goods sold in good condition are non-refundable.</p>
            <p className="font-bold mt-0.5">Thank you for trading with Neneh Funkuba Enterprise!</p>
          </div>

        </div>

        {/* Drive Status Alert */}
        {driveLink && (
          <div className="bg-emerald-950/80 text-emerald-300 border border-emerald-500/50 p-3 rounded-xl text-xs flex items-center justify-between">
            <span>Saved to Google Drive!</span>
            <a
              href={driveLink}
              target="_blank"
              rel="noreferrer"
              className="underline font-bold flex items-center gap-1 text-emerald-200 hover:text-white"
            >
              <span>View in Drive</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        )}

        {driveError && (
          <div className="bg-rose-950/80 text-rose-300 border border-rose-500/50 p-2.5 rounded-xl text-xs">
            {driveError}
          </div>
        )}

        {/* Modal Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-2 pt-2">
          <button
            onClick={handlePrint}
            className="w-full sm:flex-1 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs rounded-xl flex items-center justify-center gap-2 cursor-pointer"
          >
            <Printer className="w-4 h-4 text-amber-400" />
            <span>Print Receipt</span>
          </button>

          <button
            onClick={handleSaveToDrive}
            disabled={driveUploading}
            className="w-full sm:flex-1 py-2.5 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-2 cursor-pointer"
          >
            <CloudUpload className="w-4 h-4 text-blue-200" />
            <span>{driveUploading ? 'Uploading...' : 'Save to Google Drive'}</span>
          </button>

          <button
            onClick={onClose}
            className="w-full sm:flex-1 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-xl cursor-pointer"
          >
            Done
          </button>
        </div>

      </div>
    </div>
  );
};
