import { Link, useLocation } from "react-router-dom";
import {
  FaHome,
  FaQrcode,
  FaSms,
  FaEnvelope,
  FaHistory,
  FaChartBar,
  FaShieldAlt,
  FaCog,
} from "react-icons/fa";

import "./Sidebar.css";

function Sidebar() {
  const location = useLocation();

  const menu = [
    {
      name: "Dashboard",
      icon: <FaHome />,
      path: "/dashboard",
    },
    {
      name: "QR Scanner",
      icon: <FaQrcode />,
      path: "/",
    },
    {
      name: "SMS Detection",
      icon: <FaSms />,
      path: "/sms",
    },
    {
      name: "Email Detection",
      icon: <FaEnvelope />,
      path: "/email",
    },
    {
      name: "History",
      icon: <FaHistory />,
      path: "/history",
    },
    {
      name: "Analytics",
      icon: <FaChartBar />,
      path: "/dashboard",
    },
    {
      name: "Settings",
      icon: <FaCog />,
      path: "/settings",
    },
  ];

  return (
    <div className="sidebar">

      <div className="logo">

        <FaShieldAlt className="logo-icon" />

        <div>

          <h2>Bharat</h2>

          <span>CyberShield</span>

        </div>

      </div>

      <div className="menu">

        {menu.map((item) => (
          <Link
            key={item.name}
            to={item.path}
            className={
              location.pathname === item.path
                ? "menu-item active"
                : "menu-item"
            }
          >
            {item.icon}
            <span>{item.name}</span>
          </Link>
        ))}

      </div>

      <div className="bottom-card">

        <h4>AI Security</h4>

        <p>System Online</p>

        <div className="status"></div>

      </div>

    </div>
  );
}

export default Sidebar;