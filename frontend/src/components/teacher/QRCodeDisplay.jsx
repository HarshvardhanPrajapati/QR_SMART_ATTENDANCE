import React, { useState, useEffect } from 'react';
import QRCode from "react-qr-code";
import { Clock, AlertTriangle, Maximize } from 'lucide-react';

const QRCodeDisplay = ({ qrData, expiresAt, courseName, onFullScreen }) => {
    const [timeLeft, setTimeLeft] = useState('');
    const [isExpired, setIsExpired] = useState(false);

    useEffect(() => {
        const interval = setInterval(() => {
            const now = new Date().getTime();
            const expiry = new Date(expiresAt).getTime();
            const distance = expiry - now;

            // Allow a small drift window before treating as expired
            // so that very short sessions (1–2 minutes) don't instantly
            // flip to EXPIRED due to minor clock differences.
            if (distance < -2000) {
                clearInterval(interval);
                setTimeLeft("EXPIRED");
                setIsExpired(true);
            } else {
                const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
                const seconds = Math.floor((distance % (1000 * 60)) / 1000);
                setTimeLeft(`${minutes}:${seconds < 10 ? '0' : ''}${seconds}`);
            }
        }, 1000);

        return () => clearInterval(interval);
    }, [expiresAt]);

    return (
        <div className="flex flex-col items-center justify-center p-6 bg-white rounded-2xl shadow-xl max-w-sm mx-auto border-4 border-slate-900 relative">
            <div className="w-full flex justify-between items-center mb-4 border-b border-gray-100 pb-2">
                <h3 className="font-bold text-lg text-slate-800">{courseName}</h3>
                <button onClick={onFullScreen} className="text-gray-400 hover:text-blue-600">
                    <Maximize size={20} />
                </button>
            </div>

            <div className="p-4 bg-white rounded-xl shadow-inner border border-gray-200">
                {/* The QR Data is encrypted string from backend */}
                <QRCode 
                    value={isExpired ? "EXPIRED_SESSION" : JSON.stringify(qrData)} 
                    size={200}
                    fgColor={isExpired ? "#94a3b8" : "#000000"}
                />
            </div>

            {/* Countdown Timer */}
            <div className={`mt-6 flex items-center gap-2 px-6 py-2 rounded-full font-mono font-bold text-xl transition-colors ${
                isExpired ? 'bg-red-100 text-red-600' : 'bg-blue-100 text-blue-700'
            }`}>
                {isExpired ? <AlertTriangle size={24} /> : <Clock size={24} />}
                {timeLeft}
            </div>
            
            <p className="mt-4 text-center text-sm text-gray-500">
                {isExpired 
                    ? "This session has ended. Please generate a new code." 
                    : "Scan with student app to mark attendance"}
            </p>
        </div>
    );
};

export default QRCodeDisplay;