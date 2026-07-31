import { BrowserRouter, Routes, Route, Link } from "react-router-dom";

import Home from "./pages/Home";
import Dashboard from "./pages/Dashboard";
import History from "./pages/History";

function App() {
  return (
    <BrowserRouter>

      <nav className="navbar navbar-expand-lg navbar-dark bg-dark">
        <div className="container">

          <Link className="navbar-brand" to="/">
            Bharat CyberShield
          </Link>

          <div className="navbar-nav">

            <Link className="nav-link" to="/">
              Scanner
            </Link>

            <Link className="nav-link" to="/dashboard">
              Dashboard
            </Link>

            <Link className="nav-link" to="/history">
              History
            </Link>

          </div>

        </div>
      </nav>

      <Routes>

        <Route path="/" element={<Home />} />

        <Route
          path="/dashboard"
          element={<Dashboard />}
        />

        <Route
          path="/history"
          element={<History />}
        />

      </Routes>

    </BrowserRouter>
  );
}

export default App;