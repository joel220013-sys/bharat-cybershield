import { useEffect, useRef } from "react";
import { BrowserMultiFormatReader } from "@zxing/browser";

function LiveScanner({ onScan }) {
  const videoRef = useRef(null);
  const readerRef = useRef(null);
  const controlsRef = useRef(null);
  const scannedRef = useRef(false);

  useEffect(() => {
    const codeReader = new BrowserMultiFormatReader();
    readerRef.current = codeReader;

    const startScanner = async () => {
      try {
        const devices =
          await BrowserMultiFormatReader.listVideoInputDevices();

        if (!devices.length) {
          alert("No camera found.");
          return;
        }

        scannedRef.current = false;

        controlsRef.current =
          await codeReader.decodeFromVideoDevice(
            devices[0].deviceId,
            videoRef.current,
            (result, error) => {
              // Ignore normal scan failures
              if (error) return;

              // Prevent multiple scans
              if (!result || scannedRef.current) return;

              scannedRef.current = true;

              // Stop camera
              if (controlsRef.current) {
                controlsRef.current.stop();
              }

              // Send QR text to parent
              onScan(result.getText());
            }
          );
      } catch (err) {
        console.error("Camera Error:", err);
      }
    };

    startScanner();

    return () => {
      scannedRef.current = true;

      try {
        if (controlsRef.current) {
          controlsRef.current.stop();
        }
      } catch (err) {
        // Ignore cleanup errors
      }

      readerRef.current = null;
      controlsRef.current = null;
    };
  }, [onScan]);

  return (
    <div className="text-center">
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        style={{
          width: "100%",
          maxWidth: "500px",
          borderRadius: "12px",
          border: "2px solid #0d6efd",
          boxShadow: "0 0 15px rgba(0,0,0,0.2)",
        }}
      />
    </div>
  );
}

export default LiveScanner;