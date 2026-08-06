import { useState } from "react";
import { useTranslation } from "react-i18next";
import api from "../services/api";
import PageHeader from "../components/PageHeader";

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

      <PageHeader
        title={t("app_name")}
        subtitle={t("sms.subtitle")}
      />

      <div className="card shadow-lg neon-border mb-4 cyber-card"
    style={{
        background: "#111827",
        borderRadius: "22px",
        border: "1px solid #22ff55"
    }}
>

<div className="card-body p-5">

<div className="d-flex justify-content-between align-items-center mb-4">

<div>

<small
style={{
color:"#39ff14",
letterSpacing:"4px",
fontWeight:"600"
}}
>
{t("sms.message_security")}
</small>

<h1
className="text-white fw-bold mt-2"
>
{t("sms.title")}
</h1>

<p
style={{
color:"#9ca3af"
}}
>
{t("sms.description")}
</p>

</div>

<button
className="btn btn-outline-success rounded-pill px-4"
>
● {t("sms.live_monitoring")}
</button>

</div>

<div className="row g-4">

<div className="col-lg-7">

<div
style={{
background:"#0b1220",
borderRadius:"18px",
padding:"30px",
height:"100%"
}}
>

<h3
className="text-white mb-4"
>
{t("sms.analyze_message")}
</h3>

<textarea
  rows={10}
  value={message}
  onChange={(e) => setMessage(e.target.value)}
  placeholder={t("sms.placeholder")}
  style={{
    width: "100%",
    background: "#0a0f17",
    border: "1px solid #2b2b2b",
    color: "white",
    borderRadius: "14px",
    padding: "18px",
    resize: "none",
    outline: "none",
    fontSize: "16px",
  }}
/>

<button
className="btn pulse mt-4"
style={{
  width: "100%",
  height: "58px",
  background: "#39ff14",
  color: "#000",
  fontWeight: "700",
  fontSize: "18px",
  borderRadius: "14px",
  border: "none",
}}
onClick={analyzeSMS}
disabled={loading}
>

{loading
? t("sms.analyzing")
: t("sms.upload")}

</button>

</div>

</div>

<div className="col-lg-5">

<div
style={{
background:"#0b1220",
borderRadius:"18px",
padding:"30px",
height:"100%"
}}
>

<h3
style={{
color:"#39ff14"
}}
>
{t("sms.coverage")}
</h3>

<div
className="mt-4"
>

<h2
style={{
color:"#39ff14"
}}
>
98.7%
</h2>

<h5 className="text-white">
<span
  style={{
    width: "10px",
    height: "10px",
    background: "#39ff14",
    borderRadius: "50%",
    display: "inline-block",
    marginRight: "8px",
    boxShadow: "0 0 10px #39ff14",
  }}
></span>
{t("sms.ai_accuracy")}
</h5>

<p
style={{
color:"#9ca3af"
}}
>
Detecting phishing,
fraud,
and social engineering patterns.
</p>

<hr style={{borderColor:"#333"}}/>

<div className="d-flex justify-content-between mb-3">
<span className="text-secondary">
<span
  style={{
    width: "10px",
    height: "10px",
    background: "#39ff14",
    borderRadius: "50%",
    display: "inline-block",
    marginRight: "8px",
    boxShadow: "0 0 10px #39ff14",
  }}
></span>
{t("sms.messages_analyzed")}
</span>

<b style={{color:"#39ff14"}}>
12,840
</b>
</div>

<div className="d-flex justify-content-between mb-3">
<span className="text-secondary">
<span
  style={{
    width: "10px",
    height: "10px",
    background: "#39ff14",
    borderRadius: "50%",
    display: "inline-block",
    marginRight: "8px",
    boxShadow: "0 0 10px #39ff14",
  }}
></span>
{t("sms.threats_blocked")}
</span>

<b style={{color:"#39ff14"}}>
1,624
</b>
</div>

<div className="d-flex justify-content-between">
<span className="text-secondary">
{t("sms.average_response")}
</span>

<b style={{color:"#39ff14"}}>
0.8 sec
</b>
</div>

</div>

</div>

</div>

</div>

</div>

</div>

      {/* Report */}

      {result && (

        <div
          className="card shadow-lg neon-border mt-4 cyber-card"
          style={{
            background: "#111827",
            borderRadius: "22px",
            border: "1px solid #22ff55",
          }}
        >

          <div className="card-body p-5">

            <h2
              className="fw-bold mb-4"
              style={{
                color: "#39ff14",
              }}
            >
              🔍 {t("sms.report")}
            </h2>

            {/* Risk */}

            <div
              style={{
                background: "#0b1220",
                border: "1px solid #233",
                borderRadius: "18px",
                padding: "25px",
                marginBottom: "25px",
              }}
            >
              <h5 className="text-white">{t("sms.risk_score")}</h5>

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

              <h5 className="text-white">
                {t("sms.status")}

                <span
                  className={`badge bg-${badgeColor()} ms-2`}
                >
                  {result.status}
                </span>

              </h5>
            </div>

            <hr />

            {/* URLs */}

            <h4 className="text-white">🌐 {t("sms.detected_urls")}</h4>

            {result.urls.length === 0 ? (
              <p className="text-light">{t("sms.no_urls")}</p>
            ) : (
              <ul
                style={{
                  color: "#ffffff",
                  paddingLeft: "20px",
                }}
              >
                {result.urls.map((url, index) => (
                  <li
                    key={index}
                    style={{
                      color: "#39ff14",
                      marginBottom: "10px",
                      wordBreak: "break-all",
                    }}
                  >
                    {url}
                  </li>
                ))}
              </ul>
            )}

            <hr />

            {/* Reasons */}

            <h4 className="text-white">⚠️ {t("sms.reasons")}</h4>

            <ul
              style={{
                color: "#ffffff",
                paddingLeft: "20px",
              }}
            >

              {result.reasons.map((reason, index) => (
                <li
                  key={index}
                  style={{
                    color: "#d1d5db",
                    marginBottom: "8px",
                  }}
                >
                  {reason}
                </li>
              ))}

            </ul>

            {/* URL Validation */}

            {result.validation && (

              <>

                <hr />

                <h4 className="text-white">🔒 {t("sms.validation")}</h4>

                <table className="table table-dark table-bordered">

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

                <h4 className="text-white">🛡 {t("sms.virustotal")}</h4>

                <table className="table table-dark table-bordered">

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

                <h4 className="text-white">🎣 {t("sms.openphish")}</h4>

                <table className="table table-dark table-bordered">

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