import React, { useState, useEffect } from 'react';
import QRCode from "react-qr-code";
import { Clock, AlertTriangle, Maximize } from 'lucide-react';

const QRCodeDisplay = ({ qrData, expiresAt, courseName, onFullScreen }) => {
  const [timeLeft, setTimeLeft] = useState('');
  const [isExpired, setIsExpired] = useState(false);

  useEffect(() => {
    // Ensure expiresAt is a millisecond timestamp
    const expiryMs = (typeof expiresAt === 'number')
      ? expiresAt
      : new Date(expiresAt).getTime();

    if (!expiryMs || Number.isNaN(expiryMs)) {
      setTimeLeft('INVALID');
      setIsExpired(true);
      return;
    }

    // update function - compute remaining in seconds (integer)
    const update = () => {
      const now = Date.now();
      let remainingSec = Math.floor((expiryMs - now) / 1000);

      if (remainingSec <= 0) {
        setTimeLeft('EXPIRED');
        setIsExpired(true);
        return false; // signal to stop interval
      }

      const minutes = Math.floor(remainingSec / 60);
      const seconds = remainingSec % 60;
      setTimeLeft(`${minutes}:${seconds < 10 ? '0' : ''}${seconds}`);
      setIsExpired(false);
      return true; // keep running
    };

    // Run immediately so first render is accurate
    if (!update()) return; // expired already

    // Then update every second
    const interval = setInterval(() => {
      const keep = update();
      if (!keep) clearInterval(interval);
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
        <QRCode 
          value={isExpired ? "EXPIRED_SESSION" : JSON.stringify(qrData)} 
          size={200}
          fgColor={isExpired ? "#94a3b8" : "#000000"}
        />
      </div>

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
