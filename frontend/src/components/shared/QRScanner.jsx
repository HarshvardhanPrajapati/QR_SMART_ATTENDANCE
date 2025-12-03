import React, { useEffect, useRef, useState } from 'react';
import { Html5QrcodeScanner } from 'html5-qrcode';
import { XCircle } from 'lucide-react';

const QRScanner = ({ onScanSuccess, onScanError, onClose }) => {
    const scannerRef = useRef(null);
    const [scanError, setScanError] = useState(null);

    useEffect(() => {
        // Initialize Scanner
        const scanner = new Html5QrcodeScanner(
            "reader",
            { 
                fps: 10, 
                qrbox: { width: 250, height: 250 },
                aspectRatio: 1.0,
                showTorchButtonIfSupported: true
            },
            /* verbose= */ false
        );

        scanner.render(
            (decodedText) => {
                scanner.clear();
                onScanSuccess(decodedText);
            },
            (errorMessage) => {
                // Ignore frequent read errors as the camera scans frames
                // onScanError(errorMessage); 
            }
        );

        scannerRef.current = scanner;

        // Cleanup on unmount
        return () => {
            if (scannerRef.current) {
                scannerRef.current.clear().catch(error => {
                    console.error("Failed to clear html5-qrcode scanner. ", error);
                });
            }
        };
    }, []);

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <div className="glass-panel w-full max-w-md rounded-2xl overflow-hidden shadow-2xl border border-white/40 bg-white/70 backdrop-blur-md relative">
                
                <div className="p-4 flex justify-between items-center border-b border-slate-200/60 bg-gradient-to-r from-sky-500 to-emerald-500 text-white">
                    <h3 className="font-semibold text-lg">Scan Class QR Code</h3>
                    <button onClick={onClose} className="hover:text-white/80 transition-colors">
                        <XCircle />
                    </button>
                </div>

                <div className="p-6 bg-white/50">
                    <div id="reader" className="overflow-hidden rounded-xl border-2 border-sky-500 shadow-[0_0_20px_rgba(14,165,233,0.3)]"></div>
                    <p className="text-center text-slate-700 text-sm mt-4 font-medium">
                        Align the QR code within the frame to mark attendance.
                    </p>
                    <p className="text-center text-slate-600 text-xs mt-2">
                        Please allow camera access when prompted to scan QR codes.
                    </p>
                </div>

            </div>
        </div>
    );
};

export default QRScanner;