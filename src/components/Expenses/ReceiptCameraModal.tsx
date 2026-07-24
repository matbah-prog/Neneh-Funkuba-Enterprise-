import React, { useEffect, useRef, useState } from 'react';
import { Camera, X, RefreshCw, CheckCircle2, Upload, AlertCircle, Image as ImageIcon } from 'lucide-react';

interface ReceiptCameraModalProps {
  onCapture: (base64Image: string) => void;
  onClose: () => void;
}

export const ReceiptCameraModal: React.FC<ReceiptCameraModalProps> = ({ onCapture, onClose }) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [capturedPhoto, setCapturedPhoto] = useState<string | null>(null);
  const [isStreaming, setIsStreaming] = useState(false);

  // Start Camera Stream
  const startCamera = async () => {
    try {
      setCameraError(null);
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: { ideal: 'environment' }, // Prefer back camera on mobile
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
      });

      streamRef.current = mediaStream;
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        await videoRef.current.play();
        setIsStreaming(true);
      }
    } catch (err: any) {
      console.warn('Camera access error:', err);
      setCameraError(
        'Camera access denied or unavailable. You can upload an image file of the receipt below.'
      );
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    setIsStreaming(false);
  };

  useEffect(() => {
    startCamera();
    return () => {
      stopCamera();
    };
  }, []);

  const handleSnap = () => {
    if (!videoRef.current) return;

    const video = videoRef.current;
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;

    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
      setCapturedPhoto(dataUrl);
      stopCamera();
    }
  };

  const handleRetake = () => {
    setCapturedPhoto(null);
    startCamera();
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setCapturedPhoto(event.target.result as string);
          stopCamera();
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleConfirm = () => {
    if (capturedPhoto) {
      onCapture(capturedPhoto);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-950/85 backdrop-blur-md z-50 flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-lg w-full p-6 shadow-2xl flex flex-col space-y-4 max-h-[90vh] overflow-y-auto">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-amber-500/10 text-amber-400 rounded-xl border border-amber-500/20">
              <Camera className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-slate-100 text-sm">Receipt Photo Capture</h3>
              <p className="text-[10px] text-slate-400">Snap a clear photo of the physical purchase receipt for audit compliance</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-lg transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Camera Feed or Captured Image Preview */}
        <div className="relative bg-slate-950 rounded-2xl border border-slate-800 overflow-hidden min-h-[260px] flex items-center justify-center">
          {capturedPhoto ? (
            <div className="relative w-full h-full flex flex-col items-center">
              <img
                src={capturedPhoto}
                alt="Captured Receipt"
                className="w-full max-h-[320px] object-contain rounded-xl"
              />
              <div className="absolute top-2 right-2 bg-emerald-500/90 text-slate-950 px-2.5 py-1 rounded-full text-[10px] font-black flex items-center gap-1 shadow">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Photo Snapped</span>
              </div>
            </div>
          ) : (
            <div className="w-full relative">
              <video
                ref={videoRef}
                playsInline
                muted
                className="w-full h-[280px] object-cover rounded-xl"
              />
              
              {!isStreaming && !cameraError && (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-950/90 text-slate-400 text-xs gap-2">
                  <RefreshCw className="w-6 h-6 animate-spin text-amber-400" />
                  <span>Initializing Camera...</span>
                </div>
              )}

              {/* Grid overlay for framing receipt */}
              {isStreaming && (
                <div className="absolute inset-4 border-2 border-dashed border-amber-400/40 rounded-xl pointer-events-none flex items-center justify-center">
                  <span className="text-[10px] text-amber-300/80 bg-slate-950/70 px-2 py-0.5 rounded font-bold">
                    Align Receipt Inside Frame
                  </span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Error message */}
        {cameraError && (
          <div className="p-3 bg-amber-950/80 border border-amber-500/40 rounded-xl text-xs text-amber-300 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-amber-400 shrink-0" />
            <span>{cameraError}</span>
          </div>
        )}

        {/* Camera Controls */}
        <div className="space-y-3 pt-1">
          {capturedPhoto ? (
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleRetake}
                className="flex-1 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-bold text-xs rounded-xl transition flex items-center justify-center gap-2 cursor-pointer"
              >
                <RefreshCw className="w-4 h-4 text-amber-400" />
                <span>Retake Photo</span>
              </button>

              <button
                type="button"
                onClick={handleConfirm}
                className="flex-1 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs rounded-xl transition shadow flex items-center justify-center gap-2 cursor-pointer"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Attach Receipt</span>
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleSnap}
                disabled={!isStreaming}
                className="flex-1 py-2.5 bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-slate-950 font-extrabold text-xs rounded-xl shadow transition flex items-center justify-center gap-2 cursor-pointer"
              >
                <Camera className="w-4 h-4" />
                <span>Snap Receipt Photo</span>
              </button>

              <label className="py-2.5 px-3 bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 font-bold text-xs rounded-xl transition cursor-pointer flex items-center gap-1.5 shrink-0">
                <Upload className="w-4 h-4 text-amber-400" />
                <span>Upload File</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};
