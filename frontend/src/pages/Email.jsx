import { useState } from "react";
import { useTranslation } from "react-i18next";
import api from "../services/api";
import PageHeader from "../components/PageHeader";

function Email() {

  const { t } = useTranslation();

  const [file, setFile] = useState(null);

  const [loading, setLoading] = useState(false);

  const [result, setResult] = useState(null);

  const analyzeEmail = async () => {

    if (!file) {

      alert(t("email.select_file"));

      return;
    }

    try {

      setLoading(true);

      const formData = new FormData();

      formData.append("file", file);

      const res = await api.post(

        "/email/analyze",

        formData,

        {

          headers: {

            "Content-Type": "multipart/form-data"

          }

        }

      );

      setResult(res.data);

    }

    catch (err) {

      console.log(err);

      alert(

        err.response?.data?.detail ||

        t("email.analyze_error")

      );

    }

    finally {

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


  const progressColor = () => {

    if (!result) return "bg-secondary";

    switch (result.status) {

      case "Safe":

        return "bg-success";

      case "Suspicious":

        return "bg-warning";

      case "Danger":

        return "bg-danger";

      default:

        return "bg-secondary";

    }

  };

return (

<div className="container py-5">

    <PageHeader
      title="Email Security Scanner"
      subtitle="AI-Powered Email Phishing Detection"
    />

    {/* Upload Card */}

    <div className="card shadow-lg border-0 mb-5">

        <div className="card-body p-4">

            <h4 className="mb-3">

                {t("email.upload")}

            </h4>

            <input

                type="file"

                className="form-control"

                accept=".pdf,.txt,.eml"

                onChange={(e)=>setFile(e.target.files[0])}

            />

            <small className="text-muted">

                {t("email.supported_files")}

            </small>

            <button

                className="btn btn-primary btn-lg w-100 mt-4"

                onClick={analyzeEmail}

                disabled={loading}

            >

                {loading

                    ? t("email.scanning")

                    : t("email.analyze")}

            </button>

        </div>

    </div>

    {

        result &&

        <>

            {/* Security Score */}

            <div className="card shadow border-0 mb-4">

                <div className="card-body">

                    <div className="d-flex justify-content-between align-items-center">

                        <div>

                            <h3>

                                {t("email.report")}

                            </h3>

                            <h2>

                                <span className={`badge bg-${badgeColor()}`}>

                                    {result.status}

                                </span>

                            </h2>

                        </div>

                        <div className="text-end">

                            <h5>

                                {t("email.confidence")}

                            </h5>

                            <h2>

                                {result.confidence}%

                            </h2>

                        </div>

                    </div>

                    <hr/>

                    <h5>

                        {t("email.risk_score")}

                    </h5>

                    <div className="progress" style={{height:"25px"}}>

                        <div

                            className={`progress-bar ${progressColor()}`}

                            style={{

                                width:`${result.risk_score}%`

                            }}

                        >

                            {result.risk_score}%

                        </div>

                    </div>

                </div>

            </div>

            {/* Organization */}

            <div className="row">

                <div className="col-md-6 mb-4">

                    <div className="card shadow h-100">

                        <div className="card-body">

                            <h4>

                                🏢 {t("email.organization")}

                            </h4>

                            <hr/>

                            <p>

                                <strong>Name :</strong>

                                {" "}

                                {result.organization}

                            </p>

                            <p>

                                <strong>{t("email.trust_level")} :</strong>

                                {" "}

                                <span className="badge bg-success">

                                    {result.trust_level}

                                </span>

                            </p>

                            <p>

                                <strong>{t("email.domain")} :</strong>

                                {" "}

                                {result.sender_domain}

                            </p>

                        </div>

                    </div>

                </div>

                <div className="col-md-6 mb-4">

                    <div className="card shadow h-100">

                        <div className="card-body">

                            <h4>

                                📧 {t("email.email_details")}

                            </h4>

                            <hr/>

                            <p>

                                <strong>{t("email.sender")}</strong>

                                <br/>

                                {result.sender || "-"}

                            </p>

                            <p>

                                <strong>{t("email.receiver")}</strong>

                                <br/>

                                {result.receiver || "-"}

                            </p>

                            <p>

                                <strong>{t("email.subject")}</strong>

                                <br/>

                                {result.subject || "-"}

                            </p>

                        </div>

                    </div>

                </div>

            </div>

            {/* AI Summary */}

            <div className="card shadow border-0 mb-4">

                <div className="card-body">

                    <h3>

                        🤖 {t("email.summary")}

                    </h3>

                    <hr/>

                    <p className="lead">

                        {result.summary}

                    </p>

                </div>

            </div>

            {/* Security Analysis */}

            <div className="row">

                {/* VirusTotal */}

                <div className="col-lg-6 mb-4">

                    <div className="card shadow border-0 h-100">

                        <div className="card-body">

                            <h4>🦠 {t("email.virustotal")}</h4>

                            <hr />

                            <p><strong>{t("email.status")}:</strong> {result.virustotal?.status || "N/A"}</p>

                            <p><strong>{t("sms.malicious")}:</strong> {result.virustotal?.malicious ?? 0}</p>

                            <p><strong>{t("sms.suspicious")}:</strong> {result.virustotal?.suspicious ?? 0}</p>

                            <p><strong>{t("sms.harmless")}:</strong> {result.virustotal?.harmless ?? 0}</p>

                            <p className="text-muted">

                                {result.virustotal?.reason || "No additional information."}

                            </p>

                        </div>

                    </div>

                </div>

                {/* Google Safe Browsing */}

                <div className="col-lg-6 mb-4">

                    <div className="card shadow border-0 h-100">

                        <div className="card-body">

                            <h4>🛡 {t("email.safe_browsing")}</h4>

                            <hr />

                            <p>

                                <strong>{t("email.status")}:</strong>{" "}

                                {result.safe_browsing?.unsafe

                                    ? t("email.unsafe")

                                    : t("email.safe")}

                            </p>

                            <p>

                                {result.safe_browsing?.message || t("email.no_threats")}

                            </p>

                        </div>

                    </div>

                </div>

                {/* OpenPhish */}

                <div className="col-lg-6 mb-4">

                    <div className="card shadow border-0 h-100">

                        <div className="card-body">

                            <h4>🎣 {t("email.openphish")}</h4>

                            <hr />

                            <p><strong>Status:</strong> {result.openphish?.status || "N/A"}</p>

                            <p>{result.openphish?.reason || "No phishing match found."}</p>

                        </div>

                    </div>

                </div>

                {/* Domain Reputation */}

                <div className="col-lg-6 mb-4">

                    <div className="card shadow border-0 h-100">

                        <div className="card-body">

                            <h4>🌍 {t("email.domain_reputation")}</h4>

                            <hr />

                            <p>

                                <strong>{t("email.score")}:</strong>{" "}

                                {result.domain_reputation?.score ?? 0}

                            </p>

                            <p>

                                <strong>{t("email.created")}:</strong>{" "}

                                {result.domain_reputation?.creation_date || "-"}

                            </p>

                            <p>

                                <strong>{t("email.expires")}:</strong>{" "}

                                {result.domain_reputation?.expiration_date || "-"}

                            </p>

                        </div>

                    </div>

                </div>

            </div>

            {/* Detected Information */}

            <div className="row">

                {/* URLs */}

                <div className="col-lg-6 mb-4">

                    <div className="card shadow border-0 h-100">

                        <div className="card-body">

                            <h4>🌐 {t("email.detected_urls")}</h4>

                            <hr />

                            {
                                result.urls && result.urls.length > 0 ?

                                <ul className="list-group">

                                    {
                                        result.urls.map((url, index) => (

                                            <li
                                                key={index}
                                                className="list-group-item"
                                            >

                                                <a
                                                    href={url}
                                                    target="_blank"
                                                    rel="noreferrer"
                                                >
                                                    {url}
                                                </a>

                                            </li>

                                        ))
                                    }

                                </ul>

                                :

                                <div className="alert alert-success">

                                    {t("email.no_urls")}

                                </div>

                            }

                        </div>

                    </div>

                </div>

                {/* Phone Numbers */}

                <div className="col-lg-6 mb-4">

                    <div className="card shadow border-0 h-100">

                        <div className="card-body">

                            <h4>📱 {t("email.phone_numbers")}</h4>

                            <hr />

                            {
                                result.phones && result.phones.length > 0 ?

                                <ul className="list-group">

                                    {
                                        result.phones.map((phone,index)=>(

                                            <li
                                                key={index}
                                                className="list-group-item"
                                            >
                                                {phone}
                                            </li>

                                        ))
                                    }

                                </ul>

                                :

                                <div className="alert alert-secondary">

                                    {t("email.no_phones")}

                                </div>

                            }

                        </div>

                    </div>

                </div>

                {/* UPI */}

                <div className="col-lg-6 mb-4">

                    <div className="card shadow border-0 h-100">

                        <div className="card-body">

                            <h4>💳 {t("email.upi_ids")}</h4>

                            <hr />

                            {
                                result.upi_ids && result.upi_ids.length>0 ?

                                <ul className="list-group">

                                    {
                                        result.upi_ids.map((upi,index)=>(

                                            <li
                                                key={index}
                                                className="list-group-item"
                                            >
                                                {upi}
                                            </li>

                                        ))
                                    }

                                </ul>

                                :

                                <div className="alert alert-secondary">

                                    {t("email.no_upi")}

                                </div>

                            }

                        </div>

                    </div>

                </div>

                {/* AI Reasons */}

                <div className="col-lg-6 mb-4">

                    <div className="card shadow border-0 h-100">

                        <div className="card-body">

                            <h4>📋 {t("email.security_indicators")}</h4>

                            <hr />

                            {
                                result.reasons && result.reasons.length>0 ?

                                <ul className="list-group">

                                    {
                                        result.reasons.map((reason,index)=>(

                                            <li
                                                key={index}
                                                className="list-group-item"
                                            >

                                                ✅ {reason}

                                            </li>

                                        ))
                                    }

                                </ul>

                                :

                                <div className="alert alert-success">

                                    {t("email.no_indicators")}

                                </div>

                            }

                        </div>

                    </div>

                </div>

            </div>

            {/* Footer */}

            <div className="card border-0 shadow">

                <div className="card-body text-center">

                    <h5 className="text-primary">

                        🛡 {t("email.footer_title")}

                    </h5>

                    <p className="text-muted mb-0">

                        {t("email.footer_text")}

                    </p>

                </div>

            </div>

        </>

    }

</div>

);

}

export default Email;