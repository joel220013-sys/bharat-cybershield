import { useState } from "react";
import { useTranslation } from "react-i18next";
import api from "../services/api";

function SMS() {
  const { t } = useTranslation();

  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  const analyzeSMS = async () => {
    if (!message.trim()) {
      alert(t("messages.enter_sms"));
      return;
    }

    try {
      setLoading(true);

      const response = await api.post("/sms/analyze", {
        message,
      });

      setResult(response.data);
    } catch (err) {
      console.error(err);

      alert(
        err.response?.data?.detail ||
        t("messages.sms_error")
      );
    } finally {
      setLoading(false);
    }
  };

  const badgeColor = () => {
    if (!result) return "secondary";

    switch (result.status) {
      case "Safe":
        return "success";

      case "Suspicious":
        return "warning";

      case "Danger":
        return "danger";

      default:
        return "secondary";
    }
  };

  return (
    <div className="container mt-5">

      {/* Header */}

      <div className="text-center mb-4">

        <h1 className="fw-bold text-primary">
          📱 {t("sms.title")}
        </h1>

        <p className="text-muted">
          {t("sms.subtitle")}
        </p>

      </div>

      {/* SMS Input */}

      <div className="card shadow">

        <div className="card-body">

          <h4 className="mb-3">
            {t("sms.paste")}
          </h4>

          <textarea
            rows={8}
            className="form-control"
            placeholder={t("sms.placeholder")}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
          />

          <button
            className="btn btn-primary w-100 mt-3"
            onClick={analyzeSMS}
            disabled={loading}
          >
            {loading
              ? t("sms.analyzing")
              : t("sms.upload")}
          </button>

        </div>

      </div>

      {/* Report */}

      {result && (

        <div className="card shadow mt-4">

          <div className="card-body">

            <h2 className="mb-4">
              🔍 {t("sms.report")}
            </h2>

            {/* Risk */}

            <h5>{t("sms.risk_score")}</h5>

            <div className="progress mb-4" style={{ height: "30px" }}>

              <div
                className={`progress-bar bg-${badgeColor()}`}
                style={{
                  width: `${result.risk_score}%`,
                }}
              >
                {result.risk_score}%
              </div>

            </div>

            <h5>
              {t("sms.status")}

              <span
                className={`badge bg-${badgeColor()} ms-2`}
              >
                {result.status}
              </span>

            </h5>

            <hr />

            {/* URLs */}

            <h4>🌐 {t("sms.detected_urls")}</h4>

            {result.urls.length === 0 ? (
              <p>{t("sms.no_urls")}</p>
            ) : (
              <ul>
                {result.urls.map((url, index) => (
                  <li key={index}>
                    {url}
                  </li>
                ))}
              </ul>
            )}

            <hr />

            {/* Reasons */}

            <h4>⚠️ {t("sms.reasons")}</h4>

            <ul>

              {result.reasons.map((reason, index) => (
                <li key={index}>
                  {reason}
                </li>
              ))}

            </ul>

            {/* URL Validation */}

            {result.validation && (

              <>

                <hr />

                <h4>🔒 {t("sms.validation")}</h4>

                <table className="table table-bordered">

                  <tbody>

                    <tr>
                      <th>{t("sms.https")}</th>
                      <td>
                        {result.validation.https
                          ? `✅ ${t("sms.secure")}`
                          : `❌ ${t("sms.not_secure")}`}
                      </td>
                    </tr>

                    <tr>
                      <th>{t("sms.shortener")}</th>
                      <td>
                        {result.validation.shortener
                          ? `⚠️ ${t("sms.yes")}`
                          : `✅ ${t("sms.no")}`}
                      </td>
                    </tr>

                    <tr>
                      <th>{t("sms.ip")}</th>
                      <td>
                        {result.validation.ip_address
                          ? `⚠️ ${t("sms.yes")}`
                          : `✅ ${t("sms.no")}`}
                      </td>
                    </tr>

                    <tr>
                      <th>{t("sms.subdomains")}</th>
                      <td>
                        {result.validation.subdomain_count}
                      </td>
                    </tr>

                  </tbody>

                </table>

              </>

            )}

            {/* VirusTotal */}

            {result.virustotal && (

              <>

                <hr />

                <h4>🛡 {t("sms.virustotal")}</h4>

                <table className="table table-bordered">

                  <tbody>

                    <tr>
                      <th>{t("sms.status")}</th>
                      <td>{result.virustotal.status}</td>
                    </tr>

                    <tr>
                      <th>{t("sms.malicious")}</th>
                      <td>{result.virustotal.malicious}</td>
                    </tr>

                    <tr>
                      <th>{t("sms.suspicious")}</th>
                      <td>{result.virustotal.suspicious}</td>
                    </tr>

                    <tr>
                      <th>{t("sms.harmless")}</th>
                      <td>{result.virustotal.harmless}</td>
                    </tr>

                  </tbody>

                </table>

              </>

            )}

            {/* OpenPhish */}

            {result.openphish && (

              <>

                <hr />

                <h4>🎣 {t("sms.openphish")}</h4>

                <table className="table table-bordered">

                  <tbody>

                    <tr>
                      <th>{t("sms.status")}</th>
                      <td>{result.openphish.status}</td>
                    </tr>

                    <tr>
                      <th>{t("sms.reason")}</th>
                      <td>{result.openphish.reason}</td>
                    </tr>

                  </tbody>

                </table>

              </>

            )}

          </div>

        </div>

      )}

    </div>
  );
}

export default SMS;