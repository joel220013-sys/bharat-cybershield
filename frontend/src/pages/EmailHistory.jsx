import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  getEmailHistory,
  getEmailSummary,
  deleteEmail,
  deleteAllEmails,
} from "../services/emailService";

import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

function EmailHistory() {
  const { t } = useTranslation();

  const [emails, setEmails] = useState([]);
  const [filteredEmails, setFilteredEmails] = useState([]);
  const [summary, setSummary] = useState({});

  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");

  const [statusFilter, setStatusFilter] = useState("All");

  const [selectedEmail, setSelectedEmail] = useState(null);

  useEffect(() => {
    loadHistory();
  }, []);

  useEffect(() => {
    filterEmails();
  }, [emails, search, statusFilter]);

  //--------------------------------------------------
  // Load Email History
  //--------------------------------------------------

  const loadHistory = async () => {
    try {
      setLoading(true);

      const history = await getEmailHistory();
      const stats = await getEmailSummary();

      console.log("History API:", history);

      // Backend returns:
      // { total: 13, history: [...] }

      if (Array.isArray(history)) {
        setEmails(history);
      } else if (Array.isArray(history.history)) {
        setEmails(history.history);
      } else if (Array.isArray(history.data)) {
        setEmails(history.data);
      } else if (Array.isArray(history.emails)) {
        setEmails(history.emails);
      } else {
        setEmails([]);
      }

      setSummary(stats);

    } catch (err) {
      console.error(err);
      alert(t("email_history.load_error"));
    } finally {
      setLoading(false);
    }
  };

  //--------------------------------------------------
  // Search + Filter
  //--------------------------------------------------

  const filterEmails = () => {

    let data = Array.isArray(emails) ? [...emails] : [];

    if (search.trim() !== "") {

      const keyword = search.toLowerCase();

      data = data.filter((email) =>

        (email.sender || "")
          .toLowerCase()
          .includes(keyword)

        ||

        (email.subject || "")
          .toLowerCase()
          .includes(keyword)

        ||

        (email.sender_domain || "")
          .toLowerCase()
          .includes(keyword)

      );

    }

    if (statusFilter !== "All") {

      data = data.filter(
        (email) => email.status === statusFilter
      );

    }

    setFilteredEmails(data);

  };

  //--------------------------------------------------
  // Delete One
  //--------------------------------------------------

  const handleDelete = async (id) => {

    if (!window.confirm("Delete this email scan?"))
      return;

    try {

      await deleteEmail(id);

      loadHistory();

    } catch (err) {

      console.error(err);

      alert(t("email_history.delete_error"));

    }

  };

  //--------------------------------------------------
  // Delete All
  //--------------------------------------------------

  const handleDeleteAll = async () => {

    if (!window.confirm("Delete ALL email history?"))
      return;

    try {

      await deleteAllEmails();

      loadHistory();

    } catch (err) {

      console.error(err);

      alert(t("email_history.delete_all_error"));

    }

  };

  //--------------------------------------------------
  // Badge Color
  //--------------------------------------------------

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

  //--------------------------------------------------
  // Loading
  //--------------------------------------------------

  if (loading) {

    return (

      <div className="container mt-5">

        <h3>{t("email_history.loading")}</h3>

      </div>

    );

  }

  //--------------------------------------------------
  // JSX START
  //--------------------------------------------------

  return (

    <div className="container mt-4">

      <div className="d-flex justify-content-between align-items-center mb-4">

        <div>

          <h2>{t("email_history.title")}</h2>

          <small className="text-muted">
            {t("email_history.total")}: {filteredEmails.length}
          </small>

        </div>

        <button
          className="btn btn-danger"
          onClick={handleDeleteAll}
        >
          {t("email_history.delete_all")}
        </button>

      </div>

      {/* Summary Cards */}

      <div className="row mb-4">

        <div className="col-md-3">

          <div className="card shadow-sm">

            <div className="card-body text-center">

              <h6>{t("email_history.total_card")}</h6>

              <h3>{summary.total || filteredEmails.length || 0}</h3>

            </div>

          </div>

        </div>

        <div className="col-md-3">

          <div className="card bg-success text-white shadow-sm">

            <div className="card-body text-center">

              <h6>{t("email_history.safe")}</h6>

              <h3>{summary.safe || 0}</h3>

            </div>

          </div>

        </div>

        <div className="col-md-3">

          <div className="card bg-warning shadow-sm">

            <div className="card-body text-center">

              <h6>{t("email_history.suspicious")}</h6>

              <h3>{summary.suspicious || 0}</h3>

            </div>

          </div>

        </div>

        <div className="col-md-3">

          <div className="card bg-danger text-white shadow-sm">

            <div className="card-body text-center">

              <h6>{t("email_history.danger")}</h6>

              <h3>{summary.danger || 0}</h3>

            </div>

          </div>

        </div>

      </div>

      {/* Search */}

      <div className="row mb-4">

        <div className="col-md-8">

          <input
            type="text"
            className="form-control"
            placeholder={t("email_history.search")}
            value={search}
            onChange={(e) =>
              setSearch(e.target.value)
            }
          />

        </div>

        <div className="col-md-4">

          <select
            className="form-select"
            value={statusFilter}
            onChange={(e) =>
              setStatusFilter(e.target.value)
            }
          >

            <option>{t("email_history.all")}</option>

            <option>{t("email_history.safe")}</option>

            <option>{t("email_history.suspicious")}</option>

            <option>{t("email_history.danger")}</option>

          </select>

        </div>

      </div>

      {/* Email Table */}

      <div className="table-responsive">

        <table className="table table-hover table-striped align-middle">

          <thead className="table-dark">

            <tr>

              <th>{t("email_history.id")}</th>

              <th>{t("email_history.sender")}</th>

              <th>{t("email_history.subject")}</th>

              <th>{t("email_history.status")}</th>

              <th>{t("email_history.risk")}</th>

              <th>{t("email_history.date")}</th>

              <th>{t("email_history.actions")}</th>

            </tr>

          </thead>

          <tbody>

            {filteredEmails.length === 0 ? (

              <tr>

                <td
                  colSpan="7"
                  className="text-center py-4"
                >

                  {t("email_history.no_history")}

                </td>

              </tr>

            ) : (

              filteredEmails.map((email) => (

                <tr key={email.id}>

                  <td>{email.id}</td>

                  <td>{email.sender}</td>

                  <td
                    style={{
                      maxWidth: "250px",
                      overflow: "hidden",
                      whiteSpace: "nowrap",
                      textOverflow: "ellipsis",
                    }}
                  >
                    {email.subject}
                  </td>

                  <td>

                    <span
                      className={`badge ${badgeColor(email.status)}`}
                    >
                      {email.status}
                    </span>

                  </td>

                  <td>

                    {email.risk_score}%

                  </td>

                  <td>

                    {new Date(
                      email.created_at
                    ).toLocaleString()}

                  </td>

                  <td>

                    <button
                      className="btn btn-primary btn-sm me-2"
                      onClick={() =>
                        setSelectedEmail(email)
                      }
                    >
                      {t("email_history.view")}
                    </button>

                    <button
                      className="btn btn-danger btn-sm"
                      onClick={() =>
                        handleDelete(email.id)
                      }
                    >
                      {t("email_history.delete")}
                    </button>

                  </td>

                </tr>

              ))

            )}

          </tbody>

        </table>

      </div>

      {/* View Email Modal */}

      {selectedEmail && (

        <div
          className="modal fade show d-block"
          style={{
            background: "rgba(0,0,0,.5)"
          }}
        >

          <div className="modal-dialog modal-xl">

            <div className="modal-content">

              <div className="modal-header">

                <h4>{t("email_history.details")}</h4>

                <button
                  className="btn-close"
                  onClick={() =>
                    setSelectedEmail(null)
                  }
                />

              </div>

              <div className="modal-body">

                <table className="table table-bordered">

                  <tbody>

                    <tr>
                      <th>ID</th>
                      <td>{selectedEmail.id}</td>
                    </tr>

                    <tr>
                      <th>{t("email_history.sender")}</th>
                      <td>{selectedEmail.sender}</td>
                    </tr>

                    <tr>
                      <th>{t("email_history.sender_domain")}</th>
                      <td>{selectedEmail.sender_domain}</td>
                    </tr>

                    <tr>
                      <th>{t("email_history.subject")}</th>
                      <td>{selectedEmail.subject}</td>
                    </tr>

                    <tr>
                      <th>{t("email_history.status")}</th>
                      <td>

                        <span
                          className={`badge ${badgeColor(
                            selectedEmail.status
                          )}`}
                        >
                          {selectedEmail.status}
                        </span>

                      </td>
                    </tr>

                    <tr>
                      <th>{t("email_history.risk_score")}</th>
                      <td>
                        {selectedEmail.risk_score}%
                      </td>
                    </tr>

                    <tr>
                      <th>{t("email_history.created_at")}</th>
                      <td>
                        {new Date(
                          selectedEmail.created_at
                        ).toLocaleString()}
                      </td>
                    </tr>

                    <tr>

                      <th>{t("email_history.body")}</th>

                      <td
                        style={{
                          whiteSpace: "pre-wrap",
                          maxHeight: "300px",
                          overflowY: "auto",
                        }}
                      >
                        {selectedEmail.body}
                      </td>

                    </tr>

                    <tr>

                      <th>{t("email_history.reasons")}</th>

                      <td>

                        {selectedEmail.reasons}

                      </td>

                    </tr>

                    <tr>

                      <th>{t("email_history.urls")}</th>

                      <td>

                        {selectedEmail.urls || t("email_history.none")}

                      </td>

                    </tr>

                  </tbody>

                </table>

                <div className="mt-4">

                  <button
                    className="btn btn-success me-2"
                    onClick={() => {

                      const doc = new jsPDF();

                      doc.setFontSize(18);
                      doc.text("Bharat CyberShield", 14, 18);

                      doc.setFontSize(12);
                      doc.text("Email Scan Report", 14, 28);

                      autoTable(doc, {

                        startY: 38,

                        head: [["Field", "Value"]],

                        body: [

                          ["ID", selectedEmail.id],

                          ["Sender", selectedEmail.sender],

                          ["Sender Domain", selectedEmail.sender_domain],

                          ["Subject", selectedEmail.subject],

                          ["Status", selectedEmail.status],

                          ["Risk Score", `${selectedEmail.risk_score}%`],

                          ["URLs", selectedEmail.urls || t("email_history.none")],

                          ["Reasons", selectedEmail.reasons || t("email_history.none")],

                          [
                            "Created",
                            new Date(
                              selectedEmail.created_at
                            ).toLocaleString(),
                          ],

                        ],

                      });

                      doc.addPage();

                      doc.setFontSize(16);

                      doc.text("Email Body", 14, 20);

                      const bodyLines = doc.splitTextToSize(
                        selectedEmail.body || "",
                        180
                      );

                      doc.text(bodyLines, 14, 30);

                      doc.save(
                        `Email_Scan_${selectedEmail.id}.pdf`
                      );

                    }}
                  >
                    📄 {t("email_history.download_pdf")}
                  </button>

                </div>

              </div>

              <div className="modal-footer">

                <button
                  className="btn btn-secondary"
                  onClick={() => setSelectedEmail(null)}
                >
                  {t("email_history.close")}
                </button>

              </div>

            </div>

          </div>

        </div>

      )}

    </div>

  );

}

export default EmailHistory;