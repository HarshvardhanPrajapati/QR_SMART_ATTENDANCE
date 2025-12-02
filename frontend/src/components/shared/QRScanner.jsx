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
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
            <div className="bg-white dark:bg-slate-900 w-full max-w-md rounded-2xl overflow-hidden shadow-2xl border border-slate-700 relative">
                
                <div className="p-4 flex justify-between items-center border-b border-slate-700 bg-slate-800 text-white">
                    <h3 className="font-semibold text-lg">Scan Class QR Code</h3>
                    <button onClick={onClose} className="hover:text-red-400 transition-colors">
                        <XCircle/>
                    </button>
                </div>

                <div className="p-6 bg-slate-400">
                    <div id="reader" className="overflow-hidden rounded-xl border-2 border-blue-500 shadow-[0_0_20px_rgba(59,130,246,0.5)]"></div>
                    <p className="text-center text-slate-400 text-sm mt-4">
                        Align the QR code within the frame to mark attendance.
                    </p>
                </div>

            </div>
        </div>
    );
};

export default QRScanner;