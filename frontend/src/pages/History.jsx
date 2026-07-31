import { useEffect, useState } from "react";
import api from "../services/api";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

function History() {
  const [history, setHistory] = useState([]);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("All");
  const [selectedScan, setSelectedScan] = useState(null);

  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = async () => {
    try {
      const res = await api.get("/history");
      setHistory(res.data);
    } catch (err) {
      console.error(err);
      alert("Unable to load history.");
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

      alert("Scan deleted successfully.");
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.detail || "Unable to delete scan.");
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
      scan.qr_type,
      scan.status,
      `${scan.risk_score}%`,
      scan.decoded_text.length > 40
        ? scan.decoded_text.substring(0, 40) + "..."
        : scan.decoded_text,
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

    // Title
    doc.setFontSize(20);
    doc.setTextColor(13, 110, 253);
    doc.text("Bharat CyberShield", 14, 18);

    doc.setFontSize(12);
    doc.setTextColor(100);
    doc.text("AI-Powered QR Scam Detection Report", 14, 26);

    autoTable(doc, {
      startY: 35,
      head: [["Field", "Value"]],
      body: [
        ["Scan ID", scan.id],
        ["QR Type", scan.qr_type],
        ["Status", scan.status],
        ["Risk Score", `${scan.risk_score}%`],
        ["Decoded Content", scan.decoded_text],
        ["UPI ID", scan.upi_id || "-"],
        ["Merchant", scan.merchant || "-"],
        ["Amount", scan.amount || "-"],
        [
          "Created At",
          new Date(scan.created_at).toLocaleString(),
        ],
      ],
    });

    let y = doc.lastAutoTable.finalY + 15;

    doc.setFontSize(15);
    doc.setTextColor(0);
    doc.text("AI Analysis", 14, y);

    y += 10;

    (scan.reason || []).forEach((item) => {
      doc.text(`• ${item}`, 18, y);
      y += 8;
    });

    doc.save(`Scan_Report_${scan.id}.pdf`);
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

    const matchesSearch =
      (scan.decoded_text || "").toLowerCase().includes(keyword) ||
      (scan.merchant || "").toLowerCase().includes(keyword) ||
      (scan.upi_id || "").toLowerCase().includes(keyword);

    const matchesFilter =
      filter === "All" || scan.status === filter;

    return matchesSearch && matchesFilter;
  });

  return (
    <div className="container mt-4">

      {/* Header */}

      <div className="d-flex justify-content-between align-items-center mb-4">

        <div>
          <h2 className="mb-1">
            Scan History
          </h2>

          <small className="text-muted">
            Total Scans: {filtered.length}
          </small>
        </div>

        <div>

          <button
            className="btn btn-outline-primary me-2"
            onClick={loadHistory}
          >
            🔄 Refresh
          </button>

          <button
            className="btn btn-success me-2"
            onClick={exportCSV}
          >
            📥 Export CSV
          </button>

          <button
            className="btn btn-danger"
            onClick={exportPDF}
          >
            📄 Export PDF
          </button>

        </div>

      </div>

      {/* Search */}

      <div className="row mb-3">

        <div className="col-md-8">

          <input
            className="form-control"
            placeholder="Search URL / Merchant / UPI"
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
            <option>All</option>
            <option>Safe</option>
            <option>Suspicious</option>
            <option>Danger</option>
          </select>

        </div>

      </div>

      {/* Table */}

      <div className="table-responsive">

        <table className="table table-hover table-striped align-middle">

          <thead className="table-dark">

            <tr>
              <th>ID</th>
              <th>Type</th>
              <th>Status</th>
              <th>Risk</th>
              <th>Content</th>
              <th>Date</th>
              <th>Actions</th>
            </tr>

          </thead>

          <tbody>

            {filtered.length === 0 ? (

              <tr>
                <td
                  colSpan="7"
                  className="text-center py-4"
                >
                  No scan history found.
                </td>
              </tr>

            ) : (

              filtered.map((scan) => (

                <tr key={scan.id}>

                  <td>{scan.id}</td>

                  <td>{scan.qr_type}</td>

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
                    {scan.decoded_text}
                  </td>

                  <td>
                    {new Date(scan.created_at).toLocaleString()}
                  </td>

                  <td>

                    <button
                      className="btn btn-primary btn-sm me-2"
                      onClick={() => setSelectedScan(scan)}
                    >
                      View
                    </button>

                    <button
                      className="btn btn-danger btn-sm"
                      onClick={() => deleteScan(scan.id)}
                    >
                      Delete
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
                  Scan Details
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
                      <th>QR Type</th>
                      <td>{selectedScan.qr_type}</td>
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
                      <th>Risk Score</th>
                      <td>{selectedScan.risk_score}%</td>
                    </tr>

                    <tr>
                      <th>Decoded Content</th>
                      <td style={{ wordBreak: "break-word" }}>
                        {selectedScan.decoded_text}
                      </td>
                    </tr>

                    {selectedScan.upi_id && (
                      <tr>
                        <th>UPI ID</th>
                        <td>{selectedScan.upi_id}</td>
                      </tr>
                    )}

                    {selectedScan.merchant && (
                      <tr>
                        <th>Merchant</th>
                        <td>{selectedScan.merchant}</td>
                      </tr>
                    )}

                    <tr>
                      <th>Created At</th>
                      <td>
                        {new Date(
                          selectedScan.created_at
                        ).toLocaleString()}
                      </td>
                    </tr>

                  </tbody>

                </table>

                <h5 className="mt-4">
                  AI Analysis
                </h5>

                <ul>

                  {(selectedScan.reason || []).map(
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
                  📄 Download PDF
                </button>

                <button
                  className="btn btn-secondary"
                  onClick={() => setSelectedScan(null)}
                >
                  Close
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