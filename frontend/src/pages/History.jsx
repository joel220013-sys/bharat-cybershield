import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import api from "../services/api";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import PageHeader from "../components/PageHeader";

function History() {
  const { t } = useTranslation();

  const [history, setHistory] = useState([]);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("All");
  const [selectedScan, setSelectedScan] = useState(null);

  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = async () => {
    try {
      const res = await api.get("/history/all");
      setHistory(res.data);
    } catch (err) {
      console.error(err);
      alert(t("history.load_error"));
    }
  };

  const deleteScan = async (id) => {
    if (!window.confirm(`Delete scan #${id}?`)) return;

    try {
      await api.delete(`/history/${id}`);

      if (selectedScan?.id === id) {
        setSelectedScan(null);
      }

      await loadHistory();

      alert(t("history.delete_success"));
    } catch (err) {
      console.error(err);
      alert(
        err.response?.data?.detail ||
        t("history.delete_error")
      );
    }
  };

  const exportCSV = () => {
    window.open(
      "http://127.0.0.1:8000/history/export/csv",
      "_blank"
    );
  };

  const exportPDF = () => {
    const doc = new jsPDF();

    doc.setFontSize(18);
    doc.text("Bharat CyberShield - Scan History", 14, 20);

    const rows = filtered.map((scan) => [
      scan.id,
      scan.type,
      scan.status,
      `${scan.risk_score}%`,
      (scan.content || "").length > 40
        ? scan.content.substring(0, 40) + "..."
        : scan.content,
      new Date(scan.created_at).toLocaleString(),
    ]);

    autoTable(doc, {
      startY: 30,
      head: [["ID", "Type", "Status", "Risk", "Content", "Date"]],
      body: rows,
      styles: {
        fontSize: 8,
      },
    });

    doc.save("Scan_History.pdf");
  };



  const exportSinglePDF = (scan) => {
    const doc = new jsPDF();

    doc.setFontSize(20);
    doc.setTextColor(13, 110, 253);
    doc.text("Bharat CyberShield", 14, 18);

    doc.setFontSize(12);
    doc.setTextColor(90);
    doc.text("AI-Powered Scan Report", 14, 26);

    const content = scan.content || scan.decoded_text || "";

    const body = [
      ["Scan ID", scan.id],
      ["Scan Type", scan.type || "QR"],
      ["Status", scan.status],
      ["Risk Score", `${scan.risk_score}%`],
      ["Content", content],
      ["Created At", new Date(scan.created_at).toLocaleString()],
    ];

    // QR-only fields
    if ((scan.type === "QR" || !scan.type) && scan.upi_id) {
      body.push(["UPI ID", scan.upi_id]);
    }

    if ((scan.type === "QR" || !scan.type) && scan.merchant) {
      body.push(["Merchant", scan.merchant]);
    }

    if ((scan.type === "QR" || !scan.type) && scan.amount) {
      body.push(["Amount", scan.amount]);
    }

    autoTable(doc, {
      startY: 35,
      head: [["Field", "Value"]],
      body,
    });

    let y = doc.lastAutoTable.finalY + 15;

    doc.setFontSize(15);
    doc.text("AI Analysis", 14, y);

    y += 10;

    const reasons = scan.reason || scan.reasons || [];

    if (reasons.length === 0) {
      doc.text("No AI reasons available.", 18, y);
    } else {
      reasons.forEach((reason) => {
        doc.text(`• ${reason}`, 18, y);
        y += 8;
      });
    }

    doc.save(`${scan.type || "QR"}_Scan_${scan.id}.pdf`);
  };

  const badgeColor = (status) => {
    switch (status) {
      case "Danger":
        return "bg-danger";
      case "Suspicious":
        return "bg-warning text-dark";
      default:
        return "bg-success";
    }
  };

  const filtered = history.filter((scan) => {
    const keyword = search.toLowerCase();

    const text =
      (scan.content ||
        scan.decoded_text ||
        "").toLowerCase();

    const matchesSearch =
      text.includes(keyword);

    let matchesFilter = true;

    if (filter === "QR")
      matchesFilter = scan.type === "QR";

    else if (filter === "SMS")
      matchesFilter = scan.type === "SMS";

    else if (
      filter === "Safe" ||
      filter === "Suspicious" ||
      filter === "Danger"
    )
      matchesFilter = scan.status === filter;

    return matchesSearch && matchesFilter;
  });

  return (
    <div className="container mt-4">

      <PageHeader
        title="Scan History"
        subtitle="View and manage all previous security scans"
      />

      <div className="d-flex justify-content-end gap-2 mb-3">

          <button
            className="btn btn-outline-primary me-2"
            onClick={loadHistory}
          >
            🔄 {t("history.refresh")}
          </button>

          <button
            className="btn btn-success me-2"
            onClick={exportCSV}
          >
            📥 {t("history.export_csv")}
          </button>

          <button
            className="btn btn-danger"
            onClick={exportPDF}
          >
            📄 {t("history.export_pdf")}
          </button>

        </div>

      {/* Search */}

      <div className="row mb-3">

        <div className="col-md-8">

          <input
            className="form-control"
            placeholder={t("history.search")}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />

        </div>

        <div className="col-md-4">

          <select
            className="form-select"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
          >
            <option>{t("history.all")}</option>

            <option>{t("history.qr")}</option>

            <option>{t("history.sms")}</option>

            <option>{t("history.safe")}</option>

            <option>{t("history.suspicious")}</option>

            <option>{t("history.danger")}</option>
          </select>

        </div>

      </div>

      {/* Table */}

      <div className="table-responsive">

        <table className="table table-hover table-striped align-middle">

          <thead className="table-dark">

            <tr>
              <th>{t("history.id")}</th>
              <th>{t("history.type")}</th>
              <th>{t("history.status")}</th>
              <th>{t("history.risk")}</th>
              <th>{t("history.content")}</th>
              <th>{t("history.date")}</th>
              <th>{t("history.actions")}</th>
            </tr>

          </thead>

          <tbody>

            {filtered.length === 0 ? (

              <tr>
                <td
                  colSpan="7"
                  className="text-center py-4"
                >
                  {t("history.no_history")}
                </td>
              </tr>

            ) : (

              filtered.map((scan) => (

                <tr key={scan.id}>

                  <td>{scan.id}</td>

                  <td>
                    {scan.type === "QR" ? (
                      <span className="badge bg-primary">
                        📷 QR
                      </span>
                    ) : (
                      <span className="badge bg-info text-dark">
                        📱 SMS
                      </span>
                    )}
                  </td>

                  <td>
                    <span className={`badge ${badgeColor(scan.status)}`}>
                      {scan.status}
                    </span>
                  </td>

                  <td>{scan.risk_score}%</td>

                  <td
                    style={{
                      maxWidth: "320px",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {scan.content || scan.decoded_text}
                  </td>

                  <td>
                    {new Date(scan.created_at).toLocaleString()}
                  </td>

                  <td>

                    <button
                      className="btn btn-primary btn-sm me-2"
                      onClick={() => setSelectedScan(scan)}
                    >
                      {t("history.view")}
                    </button>

                    <button
                      className="btn btn-danger btn-sm"
                      onClick={() => deleteScan(scan.id)}
                    >
                      {t("history.delete")}
                    </button>

                  </td>

                </tr>

              ))

            )}

          </tbody>

        </table>

      </div>

      {/* Modal */}

      {selectedScan && (

        <div
          className="modal fade show d-block"
          style={{
            backgroundColor: "rgba(0,0,0,.5)"
          }}
        >

          <div className="modal-dialog modal-lg">

            <div className="modal-content">

              <div className="modal-header">

                <h4 className="modal-title">
                  {t("history.details")}
                </h4>

                <button
                  className="btn-close"
                  onClick={() => setSelectedScan(null)}
                />

              </div>

              <div className="modal-body">

                <table className="table table-bordered">

                  <tbody>

                    <tr>
                      <th>ID</th>
                      <td>{selectedScan.id}</td>
                    </tr>

                    <tr>
                      <th>{t("history.scan_type")}</th>
                      <td>

                        {selectedScan.type === "QR"
                          ? "📷 QR Scan"
                          : "📱 SMS Scan"}

                      </td>
                    </tr>

                    <tr>
                      <th>Status</th>
                      <td>
                        <span className={`badge ${badgeColor(selectedScan.status)}`}>
                          {selectedScan.status}
                        </span>
                      </td>
                    </tr>

                    <tr>
                      <th>{t("history.risk_score")}</th>
                      <td>{selectedScan.risk_score}%</td>
                    </tr>

                    <tr>
                      <th>{t("history.content")}</th>
                      <td style={{ wordBreak: "break-word" }}>
                        {selectedScan.content || selectedScan.decoded_text}
                      </td>
                    </tr>

                    {selectedScan.type === "QR" &&
selectedScan.upi_id && (

<tr>

<th>{t("history.upi")}</th>

<td>{selectedScan.upi_id}</td>

</tr>

)}

                    {selectedScan.type === "QR" &&
selectedScan.merchant && (

<tr>

<th>{t("history.merchant")}</th>

<td>{selectedScan.merchant}</td>

</tr>

)}

                    <tr>
                      <th>{t("history.created_at")}</th>
                      <td>
                        {new Date(
                          selectedScan.created_at
                        ).toLocaleString()}
                      </td>
                    </tr>

                  </tbody>

                </table>

                <h5 className="mt-4">

                  🧠 {t("history.analysis")}

                </h5>

                <ul>

                  {(selectedScan.reason ||
selectedScan.reasons ||
[]).map(
                    (reason, index) => (
                      <li key={index}>
                        {reason}
                      </li>
                    )
                  )}

                </ul>

              </div>

              <div className="modal-footer">

                <button
                  className="btn btn-success me-auto"
                  onClick={() => exportSinglePDF(selectedScan)}
                >
                  📄 {t("history.download_pdf")}
                </button>

                <button
                  className="btn btn-secondary"
                  onClick={() => setSelectedScan(null)}
                >
                  {t("history.close")}
                </button>

              </div>

            </div>

          </div>

        </div>

      )}

    </div>
  );
}

export default History;