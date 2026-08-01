import { Link, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";

function Navbar() {
  const location = useLocation();
  const { t, i18n } = useTranslation();

  const active = (path) =>
    location.pathname === path ? "active" : "";

  const changeLanguage = (e) => {
    i18n.changeLanguage(e.target.value);
  };

  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-dark shadow">
      <div className="container">

        <Link
          className="navbar-brand fw-bold fs-3"
          to="/"
        >
          🛡 {t("app_name")}
        </Link>

        <button
          className="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbar"
          aria-controls="navbar"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon"></span>
        </button>

        <div
          className="collapse navbar-collapse"
          id="navbar"
        >
          <ul className="navbar-nav ms-auto">

            <li className="nav-item">
              <Link
                className={`nav-link ${active("/")}`}
                to="/"
              >
                📷 {t("navbar.qr")}
              </Link>
            </li>

            <li className="nav-item">
              <Link
                className={`nav-link ${active("/sms")}`}
                to="/sms"
              >
                📱 {t("navbar.sms")}
              </Link>
            </li>

            <li className="nav-item">
              <Link
                className={`nav-link ${active("/email")}`}
                to="/email"
              >
                📧 {t("navbar.email")}
              </Link>
            </li>

            <li className="nav-item">
              <Link
                className={`nav-link ${active("/email-history")}`}
                to="/email-history"
              >
                📬 {t("navbar.email_history")}
              </Link>
            </li>

            <li className="nav-item">
              <Link
                className={`nav-link ${active("/dashboard")}`}
                to="/dashboard"
              >
                📊 {t("navbar.dashboard")}
              </Link>
            </li>

            <li className="nav-item">
              <Link
                className={`nav-link ${active("/history")}`}
                to="/history"
              >
                📜 {t("navbar.history")}
              </Link>
            </li>

            <li className="nav-item ms-3">
              <select
                className="form-select form-select-sm"
                value={i18n.resolvedLanguage || "en"}
                onChange={changeLanguage}
              >
                <option value="en">🇬🇧 English</option>
                <option value="hi">🇮🇳 हिन्दी</option>
                <option value="kn">🇮🇳 ಕನ್ನಡ</option>
                <option value="ta">🇮🇳 தமிழ்</option>
                <option value="te">🇮🇳 తెలుగు</option>
                <option value="ml">🇮🇳 മലയാളം</option>
              </select>
            </li>

          </ul>
        </div>

      </div>
    </nav>
  );
}

export default Navbar;