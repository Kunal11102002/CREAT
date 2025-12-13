"use client";

import { useEffect, useRef, useState } from "react";
import { QrCode, Loader2, Upload, X } from "lucide-react";
import { toast } from "sonner";

import { useConvexMutation } from "@/hooks/use-convex-query";
import { api } from "@/convex/_generated/api";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import { Button } from "@/components/ui/button";

export default function QRScannerModal({ isOpen, onClose }) {
  const scannerRef = useRef(null);
  const fileInputRef = useRef(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const { mutate: checkInAttendee } = useConvexMutation(
    api.registrations.checkInAttendee
  );

  // ===============================
  // Handle QR result
  // ===============================
  const handleResult = async (qrCode) => {
    try {
      await checkInAttendee({ qrCode });
      toast.success("✅ Check-in successful");
      safeClose();
    } catch {
      toast.error("Invalid or already used QR code");
    }
  };

  // ===============================
  // SAFELY close scanner
  // ===============================
  const safeClose = () => {
    if (scannerRef.current) {
      scannerRef.current.stop().catch(() => {});
      scannerRef.current.clear().catch(() => {});
      scannerRef.current = null;
    }
    onClose();
  };

  // ===============================
  // Start CAMERA scanner
  // ===============================
  useEffect(() => {
    if (!isOpen) return;
    if (scannerRef.current) return; //  prevent double start

    let cancelled = false;

    const startCamera = async () => {
      try {
        setLoading(true);
        setError(null);

        //  wait for Dialog DOM
        await new Promise((r) => setTimeout(r, 500));
        if (cancelled) return;

        const { Html5Qrcode } = await import("html5-qrcode");

        const scanner = new Html5Qrcode("qr-reader");
        scannerRef.current = scanner;

        await scanner.start(
          { facingMode: "environment" },
          {
            fps: 10,
            qrbox: 250,
            disableFlip: false,
            showTorchButtonIfSupported: false,
            showZoomSliderIfSupported: false,
          },
          async (decodedText) => {
            await scanner.stop();
            scannerRef.current = null;
            handleResult(decodedText);
          }
        );

        setLoading(false);
      } catch (err) {
        console.error(err);
        setError("Camera stopped. Please close and reopen scanner.");
        setLoading(false);
      }
    };

    startCamera();

    return () => {
      cancelled = true;
      if (scannerRef.current) {
        scannerRef.current.stop().catch(() => {});
        scannerRef.current.clear().catch(() => {});
        scannerRef.current = null;
      }
    };
  }, [isOpen]);

  // ===============================
  // Scan from IMAGE
  // ===============================
  const handleImageScan = async (file) => {
    if (!file) return;

    try {
      setLoading(true);

      const { Html5Qrcode } = await import("html5-qrcode");
      const scanner = new Html5Qrcode("qr-reader");

      const decodedText = await scanner.scanFile(file, true);
      handleResult(decodedText);
    } catch {
      toast.error("No QR code found in image");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={safeClose}>
      <DialogContent forceMount className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <QrCode className="w-5 h-5 text-purple-500" />
            Scan QR Code
          </DialogTitle>
          <DialogDescription>
            Use camera or upload a QR image
          </DialogDescription>
        </DialogHeader>

        {error && (
          <p className="text-sm text-red-500 mb-2">{error}</p>
        )}

        {/* CAMERA VIEW */}
        <div
          id="qr-reader"
          className="w-full rounded-md bg-black"
          style={{ minHeight: "300px" }}
        />

        {loading && (
          <div className="flex items-center justify-center gap-2 py-3">
            <Loader2 className="w-5 h-5 animate-spin text-purple-500" />
            <span className="text-sm">Processing…</span>
          </div>
        )}

        {/* ACTION BUTTONS */}
        <div className="flex gap-2 mt-4">
          <Button
            variant="outline"
            className="flex-1 gap-2"
            onClick={() => fileInputRef.current.click()}
          >
            <Upload className="w-4 h-4" />
            Scan Image
          </Button>

          <Button
            variant="destructive"
            className="flex-1 gap-2"
            onClick={safeClose}
          >
            <X className="w-4 h-4" />
            Close
          </Button>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            hidden
            onChange={(e) => handleImageScan(e.target.files[0])}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}
