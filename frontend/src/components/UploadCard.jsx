import { useTranslation } from "react-i18next";

function UploadCard({ onFileChange, onScan, loading }) {
  const { t } = useTranslation();

  return (
    <div className="container-fluid px-0 mt-4">
      <div
        className="card shadow-lg neon-border"
        style={{
          background: "#111827",
          borderRadius: "24px",
          border: "1px solid #22ff55",
          overflow: "hidden",
        }}
      >
        <div className="card-body p-5">

          {/* Header */}

          <div className="d-flex flex-wrap justify-content-between align-items-center mb-5">

            <div>

              <small
                style={{
                  color: "#39ff14",
                  letterSpacing: "5px",
                  fontWeight: 600,
                }}
              >
                {t("home.threat_intelligence")}
              </small>

              <h1
                className="text-white fw-bold mt-2"
                style={{
                  fontSize: "40px",
                }}
              >
                {t("home.title")}
              </h1>

              <p
                style={{
                  color: "#9ca3af",
                  fontSize: "18px",
                }}
              >
                {t("home.description")}
              </p>

            </div>

            <button
              className="btn btn-outline-success rounded-pill px-5"
              style={{
                height: "58px",
                fontWeight: "600",
              }}
            >
              ● {t("home.live_monitoring")}
            </button>

          </div>

          {/* Scanner Section */}

          <div className="row g-3">

            {/* Upload Box */}

            <div className="col-lg-8">

              <div
                style={{
                  border: "3px dashed #22ff55",
                  borderRadius: "22px",
                  background: "#0b1220",
                  height: "320px",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "center",
                  alignItems: "center",
                  padding: "40px",
                }}
              >
                <div
                  style={{
                    fontSize: "55px",
                    color: "#39ff14",
                  }}
                >
                  ⬚⬚
                </div>

                <h2
                  className="text-white fw-bold mt-3"
                  style={{
                    fontSize: "34px",
                  }}
                >
                  {t("home.drop_qr")}
                </h2>

                <p
                  style={{
                    color: "#9ca3af",
                    fontSize: "18px",
                  }}
                >
                  {t("home.choose_image")}
                </p>

                <input
                  type="file"
                  accept="image/*"
                  className="form-control mt-3"
                  onChange={onFileChange}
                  style={{
                    maxWidth: "420px",
                  }}
                />

              </div>

            </div>

            {/* Status */}

            <div className="col-lg-4">

              <div
                style={{
                  background: "#0f172a",
                  borderRadius: "22px",
                  border: "1px solid #233",
                  height: "320px",
                  padding: "30px",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "center",
                }}
              >

                <h2
                  className="fw-bold mb-4"
                  style={{
                    color: "#39ff14",
                  }}
                >
                  {t("home.scanner_status")}
                </h2>

                <div className="d-flex justify-content-between text-white mb-3">
                  <span>🟢 {t("home.ai_engine")}</span>
                  <strong style={{ color: "#39ff14" }}>
                    {t("home.online")}
                  </strong>
                </div>

                <div className="d-flex justify-content-between text-white mb-3">
                  <span>🟢 {t("home.qr_detector")}</span>
                  <strong style={{ color: "#39ff14" }}>
                    {t("home.ready")}
                  </strong>
                </div>

                <div className="d-flex justify-content-between text-white mb-3">
                  <span>🟢 {t("home.ocr_engine")}</span>
                  <strong style={{ color: "#39ff14" }}>
                    {t("home.active")}
                  </strong>
                </div>

                <div className="d-flex justify-content-between text-white">
                  <span>🟢 {t("home.virustotal")}</span>
                  <strong style={{ color: "#39ff14" }}>
                    {t("home.connected")}
                  </strong>
                </div>

              </div>

            </div>

          </div>

          {/* Scan Button */}

          <div className="text-center mt-5">

            <button
              className="btn btn-success pulse"
              onClick={onScan}
              disabled={loading}
              style={{
                width: "320px",
                height: "60px",
                borderRadius: "14px",
                fontWeight: "700",
                fontSize: "20px",
              }}
            >
              {loading
                ? t("home.scanning")
                : t("home.analyze_qr")}
            </button>

          </div>

        </div>
      </div>
    </div>
  );
}

export default UploadCard;