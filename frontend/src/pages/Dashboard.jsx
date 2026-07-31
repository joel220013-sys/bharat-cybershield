import { useEffect, useState } from "react";
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
    <div className="col-md-3 mb-3">
      <div className={`card text-white ${color} shadow`}>
        <div className="card-body text-center">
          <h5>{title}</h5>
          <h2>{value}</h2>
        </div>
      </div>
    </div>
  );
}

function Dashboard() {
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
        <h3>Loading Dashboard...</h3>
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

  const qrChart = {
    labels: ["URL QR", "UPI QR"],
    datasets: [
      {
        label: "QR Types",
        data: [
          stats.url_qr,
          stats.upi_qr,
        ],
        backgroundColor: [
          "#0d6efd",
          "#20c997",
        ],
      },
    ],
  };

  return (
    <div className="container mt-4">

      <h2 className="text-center mb-4">
        Dashboard
      </h2>

      <div className="row">

        <StatCard
          title="Total Scans"
          value={stats.total_scans}
          color="bg-primary"
        />

        <StatCard
          title="Safe"
          value={stats.safe}
          color="bg-success"
        />

        <StatCard
          title="Danger"
          value={stats.danger}
          color="bg-danger"
        />

        <StatCard
          title="Average Risk"
          value={`${stats.average_risk}%`}
          color="bg-warning"
        />

      </div>

      <div className="row mt-4">

        <div className="col-md-6">

          <div className="card shadow">

            <div className="card-body">

              <h4 className="text-center">
                Scan Status
              </h4>

              <Doughnut data={statusChart} />

            </div>

          </div>

        </div>

        <div className="col-md-6">

          <div className="card shadow">

            <div className="card-body">

              <h4 className="text-center">
                QR Types
              </h4>

              <Bar data={qrChart} />

            </div>

          </div>

        </div>

      </div>

      <div className="card shadow mt-4">

        <div className="card-body">

          <h4>Summary</h4>

          <table className="table table-bordered">

            <tbody>

              <tr>
                <th>Total Scans</th>
                <td>{stats.total_scans}</td>
              </tr>

              <tr>
                <th>Safe</th>
                <td>{stats.safe}</td>
              </tr>

              <tr>
                <th>Suspicious</th>
                <td>{stats.suspicious}</td>
              </tr>

              <tr>
                <th>Danger</th>
                <td>{stats.danger}</td>
              </tr>

              <tr>
                <th>URL QR</th>
                <td>{stats.url_qr}</td>
              </tr>

              <tr>
                <th>UPI QR</th>
                <td>{stats.upi_qr}</td>
              </tr>

              <tr>
                <th>Average Risk</th>
                <td>{stats.average_risk}%</td>
              </tr>

            </tbody>

          </table>

        </div>

      </div>

    </div>
  );
}

export default Dashboard;