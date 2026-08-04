import React from "react";
import ReactDOM from "react-dom/client";

import "./i18n";

import App from "./App";

import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min.js";

import "./index.css";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <div className="fadeUp">
      <App />
    </div>
  </React.StrictMode>
);