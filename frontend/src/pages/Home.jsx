import { useState } from "react";
import api from "../services/api";

import UploadCard from "../components/UploadCard";
import ResultCard from "../components/ResultCard";
import LiveScanner from "../components/LiveScanner";

function Home() {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [showCamera, setShowCamera] = useState(false);

  // ----------------------------------------
  // Upload QR Image
  // ----------------------------------------
  const scanQR = async () => {
    if (!file) {
      alert("Please select a QR image.");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);

    try {
      setLoading(true);

      const response = await api.post("/qr/scan", formData);

      setResult(response.data);
    } catch (err) {
      console.error(err);

      if (err.response) {
        alert(
          err.response.data.detail ||
            "Backend returned an error while scanning."
        );
      } else {
        alert("Unable to connect to the backend.");
      }
    } finally {
      setLoading(false);
    }
  };

  // ----------------------------------------
  // Live Camera Scan
  // ----------------------------------------
  const handleLiveScan = async (decodedText) => {
    // Close camera immediately
    setShowCamera(false);

    try {
      setLoading(true);

      const response = await api.post("/qr/scan-text", {
        text: decodedText,
      });

      setResult(response.data);
    } catch (err) {
      console.error(err);

      alert(
        err.response?.data?.detail ||
          "Unable to analyze QR code."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mt-5">
      {/* Header */}

      <div className="text-center mb-4">
        <h1 className="fw-bold text-primary">
          Bharat CyberShield
        </h1>

        <p className="text-muted">
          AI-Powered QR Scam Detection Platform
        </p>
      </div>

      {/* Upload Card */}

      <UploadCard
        loading={loading}
        onFileChange={(e) => setFile(e.target.files[0])}
        onScan={scanQR}
      />

      {/* Camera Button */}

      <div className="text-center mt-4">
        <button
          className={`btn ${
            showCamera
              ? "btn-danger"
              : "btn-outline-success"
          }`}
          onClick={() => {
            setResult(null);
            setShowCamera((prev) => !prev);
          }}
        >
          {showCamera
            ? "🛑 Stop Camera"
            : "📷 Live Camera Scanner"}
        </button>
      </div>

      {/* Live Camera */}

      {showCamera && (
        <div className="card shadow mt-4">
          <div className="card-body">
            <h4 className="text-center mb-3">
              Live QR Scanner
            </h4>

            <LiveScanner onScan={handleLiveScan} />
          </div>
        </div>
      )}

      {/* Result */}

      {result && <ResultCard result={result} />}
    </div>
  );
}

export default Home;