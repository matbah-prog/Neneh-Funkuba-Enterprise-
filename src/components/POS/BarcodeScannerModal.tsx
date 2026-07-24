import React, { useEffect, useState, useRef } from 'react';
import { Html5QrcodeScanner, Html5QrcodeSupportedFormats } from 'html5-qrcode';
import { Product } from '../../types';
import { Camera, X, CheckCircle2, AlertCircle, Barcode, Volume2, Plus, Search } from 'lucide-react';
import { formatLeone } from '../../utils/formatters';

interface BarcodeScannerModalProps {
  products: Product[];
  onScanProduct: (product: Product) => void;
  onClose: () => void;
}

export const BarcodeScannerModal: React.FC<BarcodeScannerModalProps> = ({
  products,
  onScanProduct,
  onClose,
}) => {
  const [scannedCode, setScannedCode] = useState<string | null>(null);
  const [foundProduct, setFoundProduct] = useState<Product | null>(null);
  const [scanMessage, setScanMessage] = useState<string | null>(null);
  const [manualCodeInput, setManualCodeInput] = useState<string>('');
  const [cameraError, setCameraError] = useState<string | null>(null);
  const scannerRef = useRef<Html5QrcodeScanner | null>(null);

  // Audio beep feedback using Web Audio API
  const playBeep = () => {
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(880, audioCtx.currentTime); // A5 tone
      gain.gain.setValueAtTime(0.1, audioCtx.currentTime);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.15);
    } catch (e) {
      console.warn('Audio feedback failed:', e);
    }
  };

  const handleBarcodeDetected = (code: string) => {
    setScannedCode(code);

    // Search for matching product by barcode, product ID, or exact name
    const match = products.find(
      (p) =>
        (p.barcode && p.barcode.toLowerCase() === code.toLowerCase()) ||
        p.id.toLowerCase() === code.toLowerCase() ||
        p.name.toLowerCase() === code.toLowerCase()
    );

    if (match) {
      playBeep();
      setFoundProduct(match);
      setScanMessage(`Found "${match.name}" (${formatLeone(match.sellingPrice)})`);
      onScanProduct(match);
    } else {
      setFoundProduct(null);
      setScanMessage(`No product found with barcode "${code}"`);
    }
  };

  useEffect(() => {
    const elementId = 'pos-barcode-scanner-viewport';

    const scanner = new Html5QrcodeScanner(
      elementId,
      {
        fps: 10,
        qrbox: { width: 280, height: 160 },
        formatsToSupport: [
          Html5QrcodeSupportedFormats.EAN_13,
          Html5QrcodeSupportedFormats.EAN_8,
          Html5QrcodeSupportedFormats.CODE_128,
          Html5QrcodeSupportedFormats.CODE_39,
          Html5QrcodeSupportedFormats.UPC_A,
          Html5QrcodeSupportedFormats.UPC_E,
          Html5QrcodeSupportedFormats.QR_CODE,
        ],
        rememberLastUsedCamera: true,
        showTorchButtonIfSupported: true,
      },
      /* verbose= */ false
    );

    scannerRef.current = scanner;

    scanner.render(
      (decodedText) => {
        handleBarcodeDetected(decodedText);
      },
      (errorMessage) => {
        // Ignore constant scanning frame errors
      }
    );

    return () => {
      if (scannerRef.current) {
        scannerRef.current.clear().catch((err) => {
          console.warn('Failed to clear scanner on unmount:', err);
        });
      }
    };
  }, [products]);

  const handleManualSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualCodeInput.trim()) return;
    handleBarcodeDetected(manualCodeInput.trim());
    setManualCodeInput('');
  };

  return (
    <div className="fixed inset-0 bg-slate-950/85 backdrop-blur-md z-50 flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-lg w-full p-6 shadow-2xl flex flex-col max-h-[90vh] overflow-y-auto space-y-4">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-amber-500/10 text-amber-400 rounded-xl border border-amber-500/20">
              <Camera className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-slate-100 text-sm">Camera Barcode Scanner</h3>
              <p className="text-[10px] text-slate-400">Point your webcam or phone camera at product barcodes</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-lg transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Camera Viewport */}
        <div className="relative bg-slate-950 rounded-2xl border border-slate-800 overflow-hidden p-2">
          <div id="pos-barcode-scanner-viewport" className="w-full text-slate-200"></div>
          {cameraError && (
            <div className="p-4 bg-rose-950/80 text-rose-300 border border-rose-500/40 rounded-xl text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
              <span>{cameraError}</span>
            </div>
          )}
        </div>

        {/* Detected Product Banner */}
        {scanMessage && (
          <div
            className={`p-3 rounded-xl border text-xs flex items-center justify-between gap-3 ${
              foundProduct
                ? 'bg-emerald-950/80 border-emerald-500/40 text-emerald-300'
                : 'bg-amber-950/80 border-amber-500/40 text-amber-300'
            }`}
          >
            <div className="flex items-center gap-2">
              {foundProduct ? (
                <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
              ) : (
                <AlertCircle className="w-5 h-5 text-amber-400 shrink-0" />
              )}
              <div>
                <p className="font-bold">{scanMessage}</p>
                {scannedCode && (
                  <p className="text-[10px] opacity-80">Scanned Code: <code className="bg-slate-900 px-1 py-0.5 rounded">{scannedCode}</code></p>
                )}
              </div>
            </div>

            {foundProduct && (
              <button
                onClick={() => {
                  onScanProduct(foundProduct);
                  playBeep();
                }}
                className="px-2.5 py-1 bg-emerald-500 text-slate-950 font-bold text-[11px] rounded-lg hover:bg-emerald-400 flex items-center gap-1 cursor-pointer shrink-0"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Again</span>
              </button>
            )}
          </div>
        )}

        {/* Manual Barcode Search Fallback */}
        <form onSubmit={handleManualSearch} className="pt-2 border-t border-slate-800/80 space-y-2">
          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
            Manual Barcode Entry / USB Handheld Scanner Input
          </label>
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <Barcode className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Type or paste barcode (e.g. 890123456789)..."
                value={manualCodeInput}
                onChange={(e) => setManualCodeInput(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-amber-500"
              />
            </div>
            <button
              type="submit"
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-amber-400 border border-slate-700 font-bold text-xs rounded-xl transition flex items-center gap-1.5 cursor-pointer"
            >
              <Search className="w-3.5 h-3.5" />
              <span>Lookup</span>
            </button>
          </div>
        </form>

        {/* Close Footer */}
        <div className="flex items-center justify-between pt-2">
          <span className="text-[10px] text-slate-500 flex items-center gap-1">
            <Volume2 className="w-3 h-3 text-slate-400" />
            Audio beep enabled on scan
          </span>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs rounded-xl transition cursor-pointer"
          >
            Done Scanning
          </button>
        </div>

      </div>
    </div>
  );
};
