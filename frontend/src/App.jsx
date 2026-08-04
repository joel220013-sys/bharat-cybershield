import { BrowserRouter, Routes, Route } from "react-router-dom";

import Sidebar from "./components/Sidebar";

import Home from "./pages/Home";
import SMS from "./pages/SMS";
import Email from "./pages/Email";
import EmailHistory from "./pages/EmailHistory";
import Dashboard from "./pages/Dashboard";
import History from "./pages/History";

import "./App.css";
import "./styles/cyber.css";

function App() {
  return (
    <BrowserRouter>
      <div className="app-layout">
        <Sidebar />

        <main className="main-content">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/sms" element={<SMS />} />
            <Route path="/email" element={<Email />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/history" element={<History />} />
            <Route
              path="/email-history"
              element={<EmailHistory />}
            />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}

export default App;