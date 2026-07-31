import StatusBadge from "./StatusBadge";
import RiskMeter from "./RiskMeter";

function InfoCard({ title, children }) {
  return (
    <div className="card shadow-sm mb-3">
      <div className="card-body">
        <h5 className="card-title">{title}</h5>
        {children}
      </div>
    </div>
  );
}

function ResultCard({ result }) {

  // Debug
  console.log("RESULT OBJECT");
  console.log(result);

  return (
    <div className="mt-4">

      {/* ========================= */}
      {/* Scan Summary */}
      {/* ========================= */}

      <div className="card shadow-lg mb-4">
        <div className="card-body">

          <h3 className="mb-3 text-center">
            Scan Report
          </h3>

          <RiskMeter score={result.risk_score} />

          <div className="mb-3">
            <strong>Status:</strong>{" "}
            <StatusBadge status={result.status} />
          </div>

          <p>
            <strong>QR Type:</strong>{" "}
            {result.qr_type}
          </p>

          <p>
            <strong>Decoded Content:</strong>
          </p>

          <div className="alert alert-light">
            {result.decoded_text}
          </div>

        </div>
      </div>

      {/* ========================= */}
      {/* AI Modules */}
      {/* ========================= */}

      <div className="row">

        {/* LEFT COLUMN */}

        <div className="col-md-6">

          {/* VirusTotal */}

          <InfoCard title="VirusTotal">

            <p>
              <strong>Status:</strong>{" "}
              {result.virustotal?.status || "N/A"}
            </p>

            <p>
              <strong>Harmless:</strong>{" "}
              {result.virustotal?.harmless ?? "-"}
            </p>

            <p>
              <strong>Malicious:</strong>{" "}
              {result.virustotal?.malicious ?? "-"}
            </p>

            <p>
              <strong>Suspicious:</strong>{" "}
              {result.virustotal?.suspicious ?? "-"}
            </p>

            <p className="text-muted">
              {result.virustotal?.reason}
            </p>

          </InfoCard>

          {/* OpenPhish */}

          <InfoCard title="OpenPhish">

            <p>
              <strong>Status:</strong>{" "}
              {result.openphish?.status || "N/A"}
            </p>

            <p className="text-muted">
              {result.openphish?.reason}
            </p>

          </InfoCard>

          {/* Brand */}

          <InfoCard title="Brand Verification">

            <p>
              <strong>Brand:</strong>{" "}
              {result.brand_verification?.matched_brand || "Unknown"}
            </p>

            <p className="text-muted">
              {result.brand_verification?.reason}
            </p>

          </InfoCard>

        </div>

        {/* RIGHT COLUMN */}

        <div className="col-md-6">

          {/* Domain */}

          <InfoCard title="Domain Reputation">

            <p>
              <strong>Risk Score:</strong>{" "}
              {result.domain_reputation?.score ?? "-"}
            </p>

            <p>
              <strong>Created:</strong>{" "}
              {result.domain_reputation?.creation_date || "-"}
            </p>

            <p>
              <strong>Expires:</strong>{" "}
              {result.domain_reputation?.expiration_date || "-"}
            </p>

            <strong>Details:</strong>

            <ul>

              {result.domain_reputation?.reasons?.map((r, i) => (
                <li key={i}>{r}</li>
              ))}

            </ul>

          </InfoCard>

          {/* OCR */}

          <InfoCard title="OCR Text">

            <div className="alert alert-secondary">

              {result.ocr_text && result.ocr_text.length > 0
                ? result.ocr_text
                : "No text detected"}

            </div>

          </InfoCard>

          {/* Reasons */}

          <InfoCard title="Reasons">

            <ul>

              {result.reason?.map((reason, index) => (
                <li key={index}>
                  {reason}
                </li>
              ))}

            </ul>

          </InfoCard>

        </div>

      </div>

    </div>
  );
}

export default ResultCard;