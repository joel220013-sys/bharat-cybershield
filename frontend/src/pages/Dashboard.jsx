import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import api from "../services/api";

import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
} from "chart.js";

import { Doughnut, Bar } from "react-chartjs-2";

ChartJS.register(
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement
);

function StatCard({ title, value, color }) {
  return (
    <div className="col-xl-2 col-lg-3 col-md-4 col-sm-6 mb-3">
      <div className={`card shadow text-white ${color}`}>
        <div className="card-body text-center">
          <h6>{title}</h6>
          <h3>{value}</h3>
        </div>
      </div>
    </div>
  );
}

function Dashboard() {
  const { t } = useTranslation();

  const [stats, setStats] = useState(null);

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    try {
      const res = await api.get("/dashboard");
      setStats(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  if (!stats) {
    return (
      <div className="container mt-5 text-center">
        <h3>{t("dashboard.loading")}</h3>
      </div>
    );
  }

  const statusChart = {
    labels: ["Safe", "Suspicious", "Danger"],
    datasets: [
      {
        data: [
          stats.safe,
          stats.suspicious,
          stats.danger,
        ],
        backgroundColor: [
          "#198754",
          "#ffc107",
          "#dc3545",
        ],
      },
    ],
  };

  const scanChart = {
    labels: ["QR", "SMS", "Email"],
    datasets: [
      {
        label: "Number of Scans",
        data: [
          stats.qr_scans,
          stats.sms_scans,
          stats.email_scans,
        ],
        backgroundColor: [
          "#0d6efd", // Blue
          "#20c997", // Green
          "#212529", // Dark (Email)
        ],
        borderRadius: 8,
      },
    ],
  };

  return (
    <div className="container mt-4">

      <h2 className="text-center mb-4">
        {t("dashboard.title")}
      </h2>

      {/* Statistics */}

      <div className="row">

        <StatCard
          title={t("dashboard.total")}
          value={stats.total_scans}
          color="bg-primary"
        />

        <StatCard
          title={t("dashboard.qr")}
          value={stats.qr_scans}
          color="bg-info"
        />

        <StatCard
          title={t("dashboard.sms")}
          value={stats.sms_scans}
          color="bg-secondary"
        />

        <StatCard
          title={t("dashboard.email")}
          value={stats.email_scans}
          color="bg-dark"
        />

        <StatCard
          title={t("dashboard.safe")}
          value={stats.safe}
          color="bg-success"
        />

        <StatCard
          title={t("dashboard.suspicious")}
          value={stats.suspicious}
          color="bg-warning"
        />

        <StatCard
          title={t("dashboard.danger")}
          value={stats.danger}
          color="bg-danger"
        />

      </div>

      {/* Average Risk */}

      <div className="card neon-border shadow mt-4">

        <div className="card-body">

          <h4>{t("dashboard.average")}</h4>

          <div className="progress" style={{ height: "30px" }}>

            <div
              className="progress-bar bg-danger"
              style={{
                width: `${stats.average_risk}%`,
              }}
            >
              {stats.average_risk}%
            </div>

          </div>

        </div>

      </div>

      {/* Charts */}

      <div className="row mt-4">

        <div className="col-md-6 mb-3">

          <div className="card neon-border shadow">

            <div className="card-body">

              <h4 className="text-center">
                {t("dashboard.scan_status")}
              </h4>

              <Doughnut data={statusChart} />

            </div>

          </div>

        </div>

        <div className="col-md-6 mb-3">

          <div className="card neon-border shadow">

            <div className="card-body">

              <h4 className="text-center">
                {t("dashboard.scan_types")}
              </h4>

              <Bar data={scanChart} />

            </div>

          </div>

        </div>

      </div>

      {/* Recent Activity */}

      <div className="card neon-border shadow mt-4">

        <div className="card-body">

          <h4 className="mb-3">
            {t("dashboard.recent")}
          </h4>

          <table className="table table-striped">

            <thead>

              <tr>

                <th>{t("dashboard.type")}</th>

                <th>{t("dashboard.status")}</th>

                <th>{t("dashboard.risk")}</th>

                <th>{t("dashboard.preview")}</th>

              </tr>

            </thead>

            <tbody>

              {stats.recent_scans.map((scan) => (

                <tr key={`${scan.type}-${scan.id}`}>

                  <td>

                    {scan.type === "QR"
                      ? `📷 ${t("dashboard.qr")}`
                      : scan.type === "SMS"
                      ? `📱 ${t("dashboard.sms")}`
                      : `📧 ${t("dashboard.email")}`}

                  </td>

                  <td>

                    <span
                      className={`badge bg-${
                        scan.status === "Safe"
                          ? "success"
                          : scan.status === "Suspicious"
                          ? "warning"
                          : "danger"
                      }`}
                    >
                      {scan.status}
                    </span>

                  </td>

                  <td>

                    {scan.risk_score}%

                  </td>

                  <td
                    style={{
                      maxWidth: 400,
                      wordBreak: "break-word",
                    }}
                  >

                    {(scan.content || "").length > 80
                      ? (scan.content || "").substring(0, 80) + "..."
                      : (scan.content || t("dashboard.no_content"))}

                  </td>

                </tr>

              ))}

            </tbody>

          </table>

        </div>

      </div>

    </div>
  );
}

export default Dashboard;