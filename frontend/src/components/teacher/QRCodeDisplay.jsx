import React, { useState, useEffect, useRef } from 'react';
import QRCode from "react-qr-code";
import { Clock, X, Maximize2, Minimize2 } from 'lucide-react';

const QRCodeDisplay = ({ qrData, expiresAt, courseName }) => {
    const [timeLeft, setTimeLeft] = useState('');
    const [isExpired, setIsExpired] = useState(false);
    const [isFullscreen, setIsFullscreen] = useState(false);
    const qrContainerRef = useRef(null);

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

    const toggleFullscreen = () => {
        if (!document.fullscreenElement) {
            qrContainerRef.current?.requestFullscreen().catch(err => {
                console.error(`Error attempting to enable fullscreen: ${err.message}`);
            });
            setIsFullscreen(true);
        } else {
            document.exitFullscreen();
            setIsFullscreen(false);
        }
    };

    useEffect(() => {
        const handleFullscreenChange = () => {
            setIsFullscreen(!!document.fullscreenElement);
        };

        document.addEventListener('fullscreenchange', handleFullscreenChange);
        return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
    }, []);

    return (
        <div 
            ref={qrContainerRef}
            className={`relative flex items-center justify-center transition-all duration-300 ${
                isFullscreen
                    ? 'fixed inset-0 z-50 bg-white'
                    : 'p-6 glass-panel rounded-2xl shadow-xl mx-auto border border-white/40 bg-white/70 backdrop-blur-md flex flex-col items-center max-w-sm'
            }`}
        >
            {/* Non-fullscreen header (course name + expand icon) */}
            {!isFullscreen && (
                <div className="w-full flex justify-between items-center mb-4 border-b border-slate-200/60 pb-2">
                    <h3 className="font-bold text-lg text-slate-900">{courseName}</h3>
                    <button 
                        onClick={toggleFullscreen} 
                        className="text-slate-400 hover:text-sky-600 p-1 rounded-full hover:bg-slate-100 transition-colors"
                        aria-label="Maximize QR Code"
                    >
                        <Maximize2 size={20} />
                    </button>
                </div>
            )}

            {/* Fullscreen minimize button – single control */}
            {isFullscreen && (
                <button
                    onClick={toggleFullscreen}
                    className="absolute top-4 right-4 p-2 rounded-full bg-slate-900/60 hover:bg-slate-800 text-white transition-all shadow-lg"
                    aria-label="Minimize QR Code"
                >
                    <Minimize2 size={20} />
                </button>
            )}

            <div className={`${isFullscreen ? '' : 'p-4 bg-white/60 rounded-xl shadow-inner border border-slate-200/60 backdrop-blur-sm'}`}>
                {/* The QR Data is encrypted string from backend */}
                <QRCode 
                    value={isExpired ? "EXPIRED_SESSION" : JSON.stringify(qrData)} 
                    size={isFullscreen ? 420 : 200}
                    fgColor={isExpired ? "#94a3b8" : "#0f172a"}
                    bgColor="#ffffff"
                />
            </div>
            {/* Countdown + helper text only in normal (non-fullscreen) mode */}
            {!isFullscreen && (
                <>
                    {/* Countdown Timer */}
                    <div className="mt-4 flex items-center justify-center gap-2">
                        <Clock className={`w-4 h-4 ${isExpired ? 'text-red-500' : 'text-emerald-500'}`} />
                        <span className={`text-sm font-medium ${isExpired ? 'text-red-600' : 'text-emerald-600'}`}>
                            {isExpired ? 'Session Expired' : timeLeft}
                        </span>
                    </div>

                    <p className="mt-4 text-center text-sm text-slate-600">
                        {isExpired 
                            ? "This session has ended. Please generate a new code." 
                            : "Scan with student app to mark attendance"}
                    </p>
                </>
            )}
        </div>
    );
}
;

export default QRCodeDisplay;