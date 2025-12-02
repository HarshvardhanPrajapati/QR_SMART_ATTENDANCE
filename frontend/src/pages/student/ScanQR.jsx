import React, { useState, useEffect, useRef } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import Navbar from '../../components/common/Navbar';
import Sidebar from '../../components/common/Sidebar';
import Footer from '../../components/common/Footer';
import { markAttendance } from '../../services/studentService';
import { ScanLine, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';

const ScanQR = () => {
  const [scanning, setScanning] = useState(false);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const html5QrCodeRef = useRef(null);
  const [cameraError, setCameraError] = useState(null);

  useEffect(() => {
    return () => {
      // Cleanup scanner on unmount
      if (html5QrCodeRef.current) {
        html5QrCodeRef.current
          .stop()
          .then(() => html5QrCodeRef.current.clear())
          .catch(() => {});
      }
    };
  }, []);

  const startScanning = () => {
    if (scanning) return;
    setScanning(true);
    setResult(null);
    setCameraError(null);

    const html5QrCode = new Html5Qrcode('qr-reader', /* verbose= */ false);
    html5QrCodeRef.current = html5QrCode;

    const config = {
      fps: 10,
      qrbox: { width: 250, height: 250 },
      aspectRatio: 1.0,
    };

    html5QrCode
      .start(
        { facingMode: 'environment' }, // prefer back camera on supported devices
        config,
        onScanSuccess,
        onScanError
      )
      .catch((err) => {
        console.error('Camera error:', err);
        setCameraError(
          err?.message ||
            'Unable to access camera. Please allow camera permission and try again.'
        );
        setScanning(false);
        if (html5QrCodeRef.current) {
          html5QrCodeRef.current.clear().catch(() => {});
          html5QrCodeRef.current = null;
        }
      });
  };

  const stopScanning = () => {
    if (html5QrCodeRef.current) {
      html5QrCodeRef.current
        .stop()
        .then(() => html5QrCodeRef.current.clear())
        .catch(() => {})
        .finally(() => {
          html5QrCodeRef.current = null;
        });
    }
    setScanning(false);
  };

  const onScanSuccess = async (decodedText, decodedResult) => {
    console.log('QR Code scanned:', decodedText);
    stopScanning();
    setLoading(true);

    try {
      // Get location if available
      let location = null;
      if (navigator.geolocation) {
        try {
          const position = await new Promise((resolve, reject) => {
            navigator.geolocation.getCurrentPosition(resolve, reject);
          });
          location = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          };
        } catch (error) {
          console.log('Location not available');
        }
      }

      // Mark attendance
      const response = await markAttendance(decodedText, location);

      setResult({
        success: true,
        message: response.message,
        data: response.data,
      });

      toast.success('Attendance marked successfully!');
    } catch (error) {
      setResult({
        success: false,
        message: error.message || 'Failed to mark attendance',
      });
      toast.error(error.message || 'Failed to mark attendance');
    } finally {
      setLoading(false);
    }
  };

  const onScanError = (errorMessage) => {
    // Ignore errors during scanning
    console.log('Scan error:', errorMessage);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar />
      <div className="flex flex-1">
        <Sidebar />
        <main className="flex-1 p-6">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Scan QR Code</h1>
            <p className="text-gray-600 mt-1">
              Scan the QR code displayed by your teacher to mark attendance
            </p>
          </div>

          <div className="max-w-2xl mx-auto">
            {/* Instructions */}
            <div className="card mb-6 bg-blue-50 border-l-4 border-blue-500">
              <div className="flex items-start space-x-3">
                <AlertCircle className="text-blue-600 mt-1" size={24} />
                <div>
                  <h3 className="font-semibold text-blue-900 mb-2">
                    Instructions
                  </h3>
                  <ul className="text-sm text-blue-800 space-y-1 list-disc list-inside">
                    <li>Make sure you are in the classroom</li>
                    <li>Ask your teacher to display the QR code</li>
                    <li>Click "Start Scanning" and point camera at QR code</li>
                    <li>Wait for automatic detection</li>
                    <li>QR codes are valid for 10 minutes only</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Scanner */}
            <div className="card">
              {!scanning && !result && (
                <div className="text-center py-12">
                  <ScanLine size={64} className="mx-auto text-gray-400 mb-4" />
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    Ready to Scan
                  </h3>
                  <p className="text-gray-600 mb-6">
                    Click the button below to start scanning
                  </p>
                  <p className="text-xs text-gray-500 mb-2">
                    Your browser may ask for camera permission. Use the back camera for best results.
                  </p>
                  <button onClick={startScanning} className="btn-primary">
                    Start Scanning
                  </button>
                </div>
              )}

              {scanning && (
                <div className="flex flex-col items-center py-4">
                  <div
                    id="qr-reader"
                    className="w-full max-w-sm aspect-square rounded-xl overflow-hidden border-2 border-primary-500 shadow-lg bg-black"
                  ></div>
                  <p className="text-xs text-gray-500 mt-3">
                    Point the QR squarely in the frame. Hold steady for a moment.
                  </p>
                  <div className="text-center mt-4">
                    <button onClick={stopScanning} className="btn-secondary">
                      Stop Scanning
                    </button>
                  </div>
                </div>
              )}

              {cameraError && !loading && (
                <div className="mt-4 rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
                  {cameraError}
                </div>
              )}

              {loading && (
                <div className="text-center py-12">
                  <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-primary-600 mx-auto mb-4"></div>
                  <p className="text-gray-600">Marking attendance...</p>
                </div>
              )}

              {result && !loading && (
                <div className="text-center py-12">
                  {result.success ? (
                    <>
                      <CheckCircle
                        size={64}
                        className="mx-auto text-green-500 mb-4"
                      />
                      <h3 className="text-2xl font-bold text-green-600 mb-2">
                        Success!
                      </h3>
                      <p className="text-gray-700 mb-2">{result.message}</p>
                      {result.data && (
                        <div className="bg-gray-50 rounded-lg p-4 mt-4 inline-block">
                          <p className="text-sm text-gray-600">
                            Course:{' '}
                            <span className="font-semibold">
                              {result.data.attendance?.course?.courseName}
                            </span>
                          </p>
                          <p className="text-sm text-gray-600 mt-1">
                            Attendance:{' '}
                            <span className="font-semibold text-green-600">
                              {result.data.attendancePercentage?.toFixed(1)}%
                            </span>
                          </p>
                        </div>
                      )}
                    </>
                  ) : (
                    <>
                      <XCircle
                        size={64}
                        className="mx-auto text-red-500 mb-4"
                      />
                      <h3 className="text-2xl font-bold text-red-600 mb-2">
                        Failed
                      </h3>
                      <p className="text-gray-700 mb-2">{result.message}</p>
                    </>
                  )}

                  <button
                    onClick={() => {
                      setResult(null);
                      startScanning();
                    }}
                    className="btn-primary mt-6"
                  >
                    Scan Again
                  </button>
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
      <Footer />
    </div>
  );
};

export default ScanQR;