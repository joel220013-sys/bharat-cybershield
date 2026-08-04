import { useState } from "react";
import { useTranslation } from "react-i18next";

import api from "../services/api";

import UploadCard from "../components/UploadCard";
import ResultCard from "../components/ResultCard";
import LiveScanner from "../components/LiveScanner";

function Home() {
  const { t } = useTranslation();

  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [showCamera, setShowCamera] = useState(false);

  // ----------------------------------------
  // Upload QR Image
  // ----------------------------------------

  const scanQR = async () => {
    if (!file) {
      alert(t("messages.select_qr"));
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
          t("messages.scan_error")
        );
      } else {
        alert(t("messages.backend_error"));
      }
    } finally {
      setLoading(false);
    }
  };

  // ----------------------------------------
  // Live Camera Scan
  // ----------------------------------------

  const handleLiveScan = async (decodedText) => {
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
        t("messages.qr_analysis_error")
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="container-fluid py-4"
      style={{
        maxWidth: "1450px",
        margin: "0 auto",
        paddingLeft: "40px",
        paddingRight: "40px",
      }}
    >

      {/* Header */}

      <div className="text-center mb-4">

        <h1 className="fw-bold text-primary">
          {t("app_name")}
        </h1>

        <p className="text-muted">
          {t("home.subtitle")}
        </p>

      </div>

      {/* Upload Card */}

      <div className="row mb-4">

        <div className="col-md-3">
          <div className="card bg-dark text-light border-success shadow h-100">
            <div className="card-body">
              <small className="text-success">TODAY</small>
              <h2>126</h2>
              <p className="text-secondary mb-0">QR Scans</p>
            </div>
          </div>
        </div>

        <div className="col-md-3">
          <div className="card bg-dark text-light border-success shadow h-100">
            <div className="card-body">
              <small className="text-success">SAFE</small>
              <h2>119</h2>
              <p className="text-secondary mb-0">Verified</p>
            </div>
          </div>
        </div>

        <div className="col-md-3">
          <div className="card bg-dark text-light border-warning shadow h-100">
            <div className="card-body">
              <small className="text-warning">SUSPICIOUS</small>
              <h2>5</h2>
              <p className="text-secondary mb-0">Need Review</p>
            </div>
          </div>
        </div>

        <div className="col-md-3">
          <div className="card bg-dark text-light border-danger shadow h-100">
            <div className="card-body">
              <small className="text-danger">BLOCKED</small>
              <h2>2</h2>
              <p className="text-secondary mb-0">Threats</p>
            </div>
          </div>
        </div>

      </div>

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
            ? `🛑 ${t("buttons.stop_camera")}`
            : `📷 ${t("buttons.live_camera")}`}
        </button>

      </div>

      {/* Live Camera */}

      {showCamera && (
        <div className="card shadow mt-4">

          <div className="card-body">

            <h4 className="text-center mb-3">
              {t("home.live_scanner")}
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