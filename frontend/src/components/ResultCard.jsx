import StatusBadge from "./StatusBadge";
import RiskMeter from "./RiskMeter";

function InfoCard({ title, children }) {
  return (
    <div
      style={{
        background: "#111827",
        border: "1px solid rgba(34,255,85,.25)",
        borderRadius: "18px",
        padding: "22px",
        color: "#fff",
        boxShadow: "0 8px 20px rgba(0,0,0,.35)",
        height: "100%",
      }}
    >
      <h5
        style={{
          color: "#22ff55",
          marginBottom: "18px",
          fontWeight: 700,
        }}
      >
        {title}
      </h5>

      {children}
    </div>
  );
}

function ResultCard({ result }) {
  return (
    <div style={{ marginTop: 40 }}>
      {/* Scan Summary */}

      <div
        style={{
          background: "#111827",
          border: "1px solid rgba(34,255,85,.25)",
          borderRadius: "22px",
          padding: "35px",
          color: "#fff",
          marginBottom: "30px",
        }}
      >
        <h2
          style={{
            textAlign: "center",
            marginBottom: "25px",
            color: "#22ff55",
          }}
        >
          Scan Report
        </h2>

        <RiskMeter score={result.risk_score} />

        <div style={{ marginTop: 20, marginBottom: 20 }}>
          <strong>Status :</strong>{" "}
          <StatusBadge status={result.status} />
        </div>

        <p>
          <strong>QR Type :</strong> {result.qr_type}
        </p>

        <p>
          <strong>Decoded Content</strong>
        </p>

        <div
          style={{
            background: "#0b1220",
            border: "1px solid #233044",
            borderRadius: "12px",
            padding: "16px",
            color: "#fff",
            wordBreak: "break-all",
          }}
        >
          {result.decoded_text}
        </div>
      </div>

      {/* Cards */}

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit,minmax(380px,1fr))",
          gap: "22px",
        }}
      >
        <InfoCard title="VirusTotal">
          <p><strong>Status:</strong> {result.virustotal?.status || "N/A"}</p>
          <p><strong>Harmless:</strong> {result.virustotal?.harmless ?? "-"}</p>
          <p><strong>Malicious:</strong> {result.virustotal?.malicious ?? "-"}</p>
          <p><strong>Suspicious:</strong> {result.virustotal?.suspicious ?? "-"}</p>
          <p style={{ color: "#9ca3af" }}>{result.virustotal?.reason}</p>
        </InfoCard>

        <InfoCard title="Domain Reputation">
          <p><strong>Risk Score:</strong> {result.domain_reputation?.score ?? "-"}</p>
          <p><strong>Created:</strong> {result.domain_reputation?.creation_date || "-"}</p>
          <p><strong>Expires:</strong> {result.domain_reputation?.expiration_date || "-"}</p>

          <strong>Details</strong>

          <ul>
            {result.domain_reputation?.reasons?.map((r, i) => (
              <li key={i}>{r}</li>
            ))}
          </ul>
        </InfoCard>

        <InfoCard title="OpenPhish">
          <p><strong>Status:</strong> {result.openphish?.status || "N/A"}</p>
          <p style={{ color: "#9ca3af" }}>{result.openphish?.reason}</p>
        </InfoCard>

        <InfoCard title="OCR Text">
          <div
            style={{
              background: "#0b1220",
              border: "1px solid #233044",
              borderRadius: "10px",
              padding: "15px",
            }}
          >
            {result.ocr_text
              ? result.ocr_text
              : "No text detected"}
          </div>
        </InfoCard>

        <InfoCard title="Brand Verification">
          <p>
            <strong>Brand:</strong>{" "}
            {result.brand_verification?.matched_brand || "Unknown"}
          </p>

          <p style={{ color: "#9ca3af" }}>
            {result.brand_verification?.reason}
          </p>
        </InfoCard>

        <InfoCard title="Reasons">
          <ul>
            {result.reason?.map((r, i) => (
              <li key={i}>{r}</li>
            ))}
          </ul>
        </InfoCard>
      </div>
    </div>
  );
}

export default ResultCard;